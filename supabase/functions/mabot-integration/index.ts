// Supabase Edge Function: Mabot Integration
// deno-lint-ignore-file no-explicit-any
declare const Deno: any;
// Endpoints:
// - POST /login
// - POST /generate-microtasks
// - POST /obstacle-coaching
// - POST /generate-reward-schedule
// - POST /send-message

// This function bridges Deprocast's frontend with Mabot while keeping secrets server-side.
// Implements basic rate limiting (IP-based), token reuse, and optional dev mocking.

// CORS helpers
const ALLOWED_ORIGINS = ["*"]; // tighten in production
const DEFAULT_ALLOWED_HEADERS = ["authorization", "x-client-info", "apikey", "content-type"];

function corsHeaders(origin: string | null, req?: Request): HeadersInit {
  const allowOrigin = origin && origin !== "null" ? origin : "*";
  // Echo back requested headers if present, fallback to defaults
  const requested = req?.headers.get("access-control-request-headers") || "";
  const allowHeaders = requested
    ? requested
    : DEFAULT_ALLOWED_HEADERS.join(", ");
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes("*") ? "*" : allowOrigin,
    "Access-Control-Allow-Headers": allowHeaders,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin, Access-Control-Request-Headers",
  };
}

// Rate limiting (simple in-memory token bucket)
type RateState = { count: number; resetAt: number };
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60_000;
const rateMap = new Map<string, RateState>();

function rateLimitKey(req: Request): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const userId = req.headers.get("x-user-id") || "anon";
  return `${ip}:${userId}`;
}

function checkRateLimit(req: Request): { allowed: true } | { allowed: false; resetMs: number } {
  const key = rateLimitKey(req);
  const now = Date.now();
  const state = rateMap.get(key);
  if (!state || state.resetAt <= now) {
    rateMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  if (state.count < RATE_LIMIT_MAX) {
    state.count += 1;
    return { allowed: true };
  }
  return { allowed: false, resetMs: state.resetAt - now };
}

// Env
const DEBUG = Deno.env.get("DEBUG") === "true";
const DENO_ENV = Deno.env.get("DENO_ENV") || "production";
const MABOT_USERNAME = Deno.env.get("MABOT_USERNAME") || "";
const MABOT_PASSWORD = Deno.env.get("MABOT_PASSWORD") || "";
const MABOT_API_URL = Deno.env.get("MABOT_API_URL") || "https://back.mabot.app";
const DEFAULT_BOT_USERNAME = Deno.env.get("MABOT_DEFAULT_BOT_USERNAME") || "mabot";

// Types
type JsonRecord = Record<string, unknown>;
type SuccessResponse<TData extends JsonRecord = JsonRecord> = {
  success: true;
  data: TData;
  chat_id?: string;
  platform_chat_id?: string;
};
type ErrorResponse = { success: false; error: { message: string; code?: string } };
type ApiResponse<TData extends JsonRecord = JsonRecord> = SuccessResponse<TData> | ErrorResponse;

// Utilities
function json<TData extends JsonRecord>(status: number, body: ApiResponse<TData>, req: Request): Response {
  const origin = req.headers.get("origin");
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin, req) },
  });
}

function logDebug(...args: unknown[]) {
  if (DEBUG) console.log("[mabot-integration]", ...args);
}

async function parseBody(req: Request): Promise<JsonRecord> {
  try {
    return (await req.json()) as JsonRecord;
  } catch {
    return {};
  }
}

// Mock helpers for development
function isDev(): boolean {
  return DENO_ENV === "development" || DEBUG;
}

async function mabotLogin(): Promise<{ access_token: string; refresh_token?: string } | null> {
  if (isDev()) {
    return { access_token: `dev_token_${Date.now()}` };
  }
  if (!MABOT_USERNAME || !MABOT_PASSWORD) return null;
  const url = `${MABOT_API_URL}/auth/login`;
  const body = new URLSearchParams();
  body.set("grant_type", "password");
  body.set("username", MABOT_USERNAME);
  body.set("password", MABOT_PASSWORD);
  body.set("scope", "");
  const resp = await fetch(url, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  if (!resp.ok) {
    logDebug("login failed", resp.status);
    return null;
  }
  const json = (await resp.json()) as { access_token?: string; refresh_token?: string };
  if (!json.access_token) return null;
  return { access_token: json.access_token, refresh_token: json.refresh_token };
}

async function validateToken(accessToken: string): Promise<boolean> {
  if (isDev()) return true;
  try {
    // Use an authenticated endpoint
    const resp = await fetch(`${MABOT_API_URL}/client/`, { method: "GET", headers: { Authorization: `Bearer ${accessToken}` } });
    return resp.ok;
  } catch {
    return false;
  }
}

type MabotInputMessage = { role: string; contents: Array<{ type: string; value: string }> };
async function callMabotInput(accessToken: string, payload: JsonRecord): Promise<{ ok: true; json: JsonRecord; status: number } | { ok: false; status: number; json?: JsonRecord }> {
  if (isDev()) {
    const fake: JsonRecord = { now: new Date().toISOString(), echo: payload };
    const body = payload as Record<string, unknown>;
    const msg = (body.messages as MabotInputMessage[] | undefined)?.[0]?.contents?.[0]?.value as string | undefined;
    if (msg) {
      fake.messages = [
        { role: "assistant", contents: [{ type: "text", value: `DEV RESPONSE: ${msg.slice(0, 64)}` }] },
      ];
    }
    fake.chat_id = body.chat_id ?? crypto.randomUUID();
    fake.platform_chat_id = body.platform_chat_id ?? null;
    return { ok: true, json: fake, status: 200 };
  }
  const url = `${MABOT_API_URL}/io/input`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    let j: JsonRecord | undefined;
    try {
      j = (await resp.json()) as JsonRecord;
    } catch {
      // ignore
    }
    return { ok: false, status: resp.status, json: j };
  }
  const j = (await resp.json()) as JsonRecord;
  return { ok: true, status: resp.status, json: j };
}

function ensureUuidChatId(existing: unknown): string {
  const s = typeof existing === "string" ? existing : "";
  if (s) return s;
  return crypto.randomUUID();
}

async function handleLogin(req: Request): Promise<Response> {
  const limited = checkRateLimit(req);
  if (!limited.allowed) {
    return json(429, { success: false, error: { message: "Rate limit exceeded", code: "rate_limit" } }, req);
  }
  const token = await mabotLogin();
  if (!token) {
    return json(500, { success: false, error: { message: "Unable to login to Mabot", code: "login_failed" } }, req);
  }
  const res: SuccessResponse<{ access_token: string }> = { success: true, data: { access_token: token.access_token } };
  return json(200, res, req);
}

async function ensureTokenOrFail(req: Request, provided?: unknown): Promise<{ ok: true; token: string } | { ok: false; resp: Response }> {
  const token = typeof provided === "string" && provided ? provided : null;
  if (token) {
    const valid = await validateToken(token);
    if (valid) return { ok: true, token };
  }
  const fresh = await mabotLogin();
  if (!fresh) {
    const resp = json(401, { success: false, error: { message: "Invalid or missing token", code: "unauthorized" } }, req);
    return { ok: false, resp };
  }
  return { ok: true, token: fresh.access_token };
}

async function handleGenerateMicrotasks(req: Request): Promise<Response> {
  const limited = checkRateLimit(req);
  if (!limited.allowed) return json(429, { success: false, error: { message: "Rate limit exceeded", code: "rate_limit" } }, req);
  const body = await parseBody(req);
  const {
    project_description,
    outcome_goal,
    available_time_blocks,
    target_completion_date,
    title,
    category,
    motivation,
    perceived_difficulty,
    known_obstacles,
    skills_resources_needed,
    access_token,
    chat_id,
    platform_chat_id,
    bot_name,
  } = body as Record<string, unknown>;
  const tokenRes = await ensureTokenOrFail(req, access_token);
  if (!tokenRes.ok) return tokenRes.resp;
  const ensuredChatId = ensureUuidChatId(chat_id);
  const projTitle = (title as string) || "";
  const projDesc = (project_description as string) || "";
  const projCategory = (category as string) || null;
  const projMotivation = (motivation as string) || "";
  const projDiff = typeof perceived_difficulty === "number" ? perceived_difficulty : null;
  const projObstacles = (known_obstacles as string) || "";
  const projSkills = Array.isArray(skills_resources_needed) ? skills_resources_needed : [];
  const blocks = Array.isArray(available_time_blocks) ? available_time_blocks : [];
  const targetIso = (target_completion_date as string) || "";

  const prompt = `You are a planning assistant. Break the project into twelve atomic, actionable microtasks that directly lead to the outcome goal. Prioritize clarity, concrete deliverables, and verifiable results. Avoid vague verbs.\n\nProject:\n- Title: "${projTitle}"\n- Description: "${projDesc}"\n- Category: "${projCategory}"\n- Motivation: "${projMotivation}"\n- Perceived difficulty (1-10): ${projDiff}\n- Known obstacles: "${projObstacles}"\n- Skills/resources needed: ${JSON.stringify(projSkills)}\n- Target completion date (ISO): "${targetIso}"\n- Outcome goal: "${(outcome_goal as string) || projDesc}"\n\nAvailable time blocks (if any): ${JSON.stringify(blocks)}\n- Expected format: [{ "start": "YYYY-MM-DDTHH:mm", "end": "YYYY-MM-DDTHH:mm" }, ...]\n- If none are provided, plan anyway and note assumptions in the summary.\n\nRules for microtasks:\n- Quantity: You MUST return exactly twelve (12) microtasks.\n- Granularity: Prefer 10–30 minutes per microtask (maximum 60 minutes if strictly necessary).\n- Each microtask must be concrete and verifiable with clear acceptance criteria.\n- Tie microtasks to skills/resources and known obstacles where relevant.\n- If time blocks are provided, suggest one suitable block per microtask when appropriate (do not invent dates outside the target window).\n- Avoid vague phrasing like “research” or “analyze” without a specific output artifact.\n\nRequired output format:\nRespond with ONE valid JSON object ONLY (no extra text, no code fences). Structure:\n{\n  "tasks": [\n    {\n      "id": "unique-kebab-case",\n      "micro_task": "Short, actionable description",\n      "why": "Why this microtask is necessary for the outcome",\n      "estimate_minutes": 25,\n      "required_context": ["skill-or-resource"],\n      "acceptance_criteria": ["criterion 1", "criterion 2"],\n      "suggested_time_block": {\n        "date": "YYYY-MM-DD",\n        "start": "HH:mm",\n        "end": "HH:mm"\n      },\n      "tags": ["${projCategory || ""}", "Planning"],\n      "risk": "low"\n    }\n  ],\n  "summary": {\n    "goal": "${projTitle} — ${projDesc}",\n    "total_estimated_minutes": 0,\n    "critical_path_ids": ["id-1","id-2","id-3"],\n    "first_three_tasks": ["id-1","id-2","id-3"],\n    "assumptions": ["list assumptions if info/time blocks were missing"]\n  }\n}\n\nValidation:\n- The "tasks" array MUST contain exactly twelve items.\n- "estimate_minutes" must sum to "total_estimated_minutes".\n- Do NOT include any text outside the JSON object. Output in English.`;
  const payload: JsonRecord = {
    platform: "web",
    chat_id: ensuredChatId,
    platform_chat_id,
    bot_username: (bot_name as string) || DEFAULT_BOT_USERNAME,
    messages: [{ role: "user", contents: [{ type: "text", value: prompt }] }],
    prefix_with_bot_name: false,
  };
  const call = await callMabotInput(tokenRes.token, payload);
  if (!call.ok) return json(call.status, { success: false, error: { message: "Mabot error", code: `mabot_${call.status}` } }, req);
  const raw = call.json as JsonRecord;
  // Extract assistant text and parse JSON
  let assistantText: string | null = null;
  try {
    const messages = (raw["messages"] as Array<Record<string, unknown>>) || [];
    const assistant = messages.find((m) => m["role"] === "assistant");
    const contents = (assistant?.["contents"] as Array<Record<string, unknown>>) || [];
    assistantText = (contents.find((c) => c["type"] === "text")?.["value"] as string) || null;
  } catch {
    // ignore
  }
  if (!assistantText && typeof raw["assistant"] === "string") {
    assistantText = raw["assistant"] as string;
  }

  let normalized: { tasks: unknown[]; summary?: Record<string, unknown> } | null = null;
  if (assistantText) {
    try {
      const parsed = JSON.parse(assistantText) as { tasks?: unknown[]; summary?: Record<string, unknown> };
      if (Array.isArray(parsed?.tasks)) {
        normalized = { tasks: parsed.tasks as unknown[], summary: parsed.summary };
      }
    } catch {
      // JSON parse failed; will fall back to raw
    }
  }

  const data: JsonRecord = normalized ?? raw;
  const resp: SuccessResponse = { success: true, data, chat_id: (raw["chat_id"] as string) || ensuredChatId, platform_chat_id: (raw["platform_chat_id"] as string | undefined) };
  return json(200, resp, req);
}

async function handleObstacleCoaching(req: Request): Promise<Response> {
  const limited = checkRateLimit(req);
  if (!limited.allowed) return json(429, { success: false, error: { message: "Rate limit exceeded", code: "rate_limit" } }, req);
  const body = await parseBody(req);
  const { micro_task, outcome_goal, blocker, current_state, emotional_state, time_left, access_token, chat_id, platform_chat_id, bot_name } = body as Record<string, unknown>;
  const tokenRes = await ensureTokenOrFail(req, access_token);
  if (!tokenRes.ok) return tokenRes.resp;
  const ensuredChatId = ensureUuidChatId(chat_id);
  const prompt = `You are a coaching assistant. The user is blocked. Provide practical advice to unblock.\n\nMicro-task: ${micro_task}\nOutcome goal: ${outcome_goal}\nBlocker: ${blocker}\nCurrent state: ${current_state}\nEmotional state: ${emotional_state}\nTime left: ${time_left}.`;
  const payload: JsonRecord = {
    platform: "web",
    chat_id: ensuredChatId,
    platform_chat_id,
    bot_username: (bot_name as string) || DEFAULT_BOT_USERNAME,
    messages: [{ role: "user", contents: [{ type: "text", value: prompt }] }],
    prefix_with_bot_name: false,
  };
  const call = await callMabotInput(tokenRes.token, payload);
  if (!call.ok) return json(call.status, { success: false, error: { message: "Mabot error", code: `mabot_${call.status}` } }, req);
  const data = call.json as JsonRecord;
  const resp: SuccessResponse = { success: true, data, chat_id: (data["chat_id"] as string) || ensuredChatId, platform_chat_id: (data["platform_chat_id"] as string | undefined) };
  return json(200, resp, req);
}

async function handleGenerateRewardSchedule(req: Request): Promise<Response> {
  const limited = checkRateLimit(req);
  if (!limited.allowed) return json(429, { success: false, error: { message: "Rate limit exceeded", code: "rate_limit" } }, req);
  const body = await parseBody(req);
  const { user_context, access_token, chat_id, platform_chat_id, bot_name } = body as Record<string, unknown>;
  const tokenRes = await ensureTokenOrFail(req, access_token);
  if (!tokenRes.ok) return tokenRes.resp;
  const ensuredChatId = ensureUuidChatId(chat_id);
  const prompt = `You are a motivation assistant. Propose a reward schedule consistent with the user's preferences and habits.\n\nUser context: ${JSON.stringify(user_context)}`;
  const payload: JsonRecord = {
    platform: "web",
    chat_id: ensuredChatId,
    platform_chat_id,
    bot_username: (bot_name as string) || DEFAULT_BOT_USERNAME,
    messages: [{ role: "user", contents: [{ type: "text", value: prompt }] }],
    prefix_with_bot_name: false,
  };
  const call = await callMabotInput(tokenRes.token, payload);
  if (!call.ok) return json(call.status, { success: false, error: { message: "Mabot error", code: `mabot_${call.status}` } }, req);
  const data = call.json as JsonRecord;
  const resp: SuccessResponse = { success: true, data, chat_id: (data["chat_id"] as string) || ensuredChatId, platform_chat_id: (data["platform_chat_id"] as string | undefined) };
  return json(200, resp, req);
}

async function handleSendMessage(req: Request): Promise<Response> {
  const limited = checkRateLimit(req);
  if (!limited.allowed) return json(429, { success: false, error: { message: "Rate limit exceeded", code: "rate_limit" } }, req);
  const body = await parseBody(req);
  const { message, bot_name, access_token, chat_id, platform_chat_id } = body as Record<string, unknown>;
  const tokenRes = await ensureTokenOrFail(req, access_token);
  if (!tokenRes.ok) return tokenRes.resp;
  const ensuredChatId = ensureUuidChatId(chat_id);
  const payload: JsonRecord = {
    platform: "web",
    chat_id: ensuredChatId,
    platform_chat_id,
    bot_username: (bot_name as string) || DEFAULT_BOT_USERNAME,
    messages: [{ role: "user", contents: [{ type: "text", value: String(message || "") }] }],
    prefix_with_bot_name: false,
  };
  const call = await callMabotInput(tokenRes.token, payload);
  if (!call.ok) return json(call.status, { success: false, error: { message: "Mabot error", code: `mabot_${call.status}` } }, req);
  const data = call.json as JsonRecord;
  // Extract a simple reply text if available
  let reply: string | undefined;
  try {
    const messages = (data["messages"] as Array<Record<string, unknown>>) || [];
    const assistant = messages.find((m) => m["role"] === "assistant");
    const contents = (assistant?.["contents"] as Array<Record<string, unknown>>) || [];
    const firstText = contents.find((c) => c["type"] === "text");
    reply = (firstText?.["value"] as string) || undefined;
  } catch {
    // ignore
  }
  const resp: SuccessResponse = { success: true, data: reply ? { reply } : data, chat_id: (data["chat_id"] as string) || ensuredChatId, platform_chat_id: (data["platform_chat_id"] as string | undefined) };
  return json(200, resp, req);
}

function notFound(req: Request): Response {
  return json(404, { success: false, error: { message: "Not Found", code: "not_found" } }, req);
}

function methodNotAllowed(req: Request): Response {
  return json(405, { success: false, error: { message: "Method Not Allowed", code: "method_not_allowed" } }, req);
}

// Request router
Deno.serve(async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") {
    // Preflight: reply with 204 and echo requested headers/methods
    return new Response(null, { status: 204, headers: { ...corsHeaders(origin, req) } });
  }
  if (req.method !== "POST") return methodNotAllowed(req);

  // Accept common deployment shapes and match endpoints by suffix for robustness
  const pathname = url.pathname;
  const endsWith = (suffix: string): boolean =>
    pathname.endsWith(`/mabot-integration${suffix}`) || pathname.endsWith(suffix);
  if (endsWith("/login")) return handleLogin(req);
  if (endsWith("/generate-microtasks")) return handleGenerateMicrotasks(req);
  if (endsWith("/obstacle-coaching")) return handleObstacleCoaching(req);
  if (endsWith("/generate-reward-schedule")) return handleGenerateRewardSchedule(req);
  if (endsWith("/send-message")) return handleSendMessage(req);
  return notFound(req);
});


