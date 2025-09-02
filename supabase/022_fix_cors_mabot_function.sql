-- Fix CORS Issue for Mabot Integration Edge Function
-- This file contains the updated Edge Function code with improved CORS handling

-- IMPORTANT: This is a deployment instruction file, not executable SQL
-- The actual Edge Function code needs to be updated in: supabase/functions/mabot-integration/index.ts

-- Key CORS fixes implemented:
-- 1. Explicit origin validation for https://deprocast.vercel.app
-- 2. Proper preflight OPTIONS handling
-- 3. Consistent CORS headers across all responses
-- 4. Added Access-Control-Allow-Credentials for authenticated requests

-- To deploy this fix, you have two options:

-- OPTION 1: Using Supabase CLI (Recommended)
-- 1. Make sure you're in the project root directory
-- 2. Run: supabase functions deploy mabot-integration

-- OPTION 2: Using Supabase Dashboard
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to Edge Functions
-- 3. Find the mabot-integration function
-- 4. Click "Edit" or "Update"
-- 5. Replace the entire function code with the updated version below

-- UPDATED FUNCTION CODE (copy this to your Edge Function):
/*
// Supabase Edge Function: Mabot Integration - CORS Fixed Version
// deno-lint-ignore-file no-explicit-any
declare const Deno: any;

// CORS Configuration - Fixed for production
const ALLOWED_ORIGINS = [
  "https://deprocast.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173"
];

const DEFAULT_ALLOWED_HEADERS = [
  "authorization", 
  "x-client-info", 
  "apikey", 
  "content-type",
  "x-requested-with",
  "accept",
  "origin",
  "access-control-request-method",
  "access-control-request-headers"
];

function corsHeaders(origin: string | null, req?: Request): HeadersInit {
  // Validate origin against allowed list
  const isValidOrigin = origin && ALLOWED_ORIGINS.includes(origin);
  const allowOrigin = isValidOrigin ? origin : ALLOWED_ORIGINS[0]; // Default to production URL
  
  // Echo back requested headers if present, fallback to defaults
  const requested = req?.headers.get("access-control-request-headers") || "";
  const allowHeaders = requested
    ? requested
    : DEFAULT_ALLOWED_HEADERS.join(", ");
  
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": allowHeaders,
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin, Access-Control-Request-Headers",
    "Access-Control-Allow-Credentials": "true",
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

// Environment variables
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
    headers: { 
      "Content-Type": "application/json", 
      ...corsHeaders(origin, req) 
    },
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
  
  // Add timeout to prevent 504 Gateway Timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout
  
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
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
  } catch (error) {
    clearTimeout(timeoutId);
    logDebug("Mabot API call failed:", error);
    return { ok: false, status: 504, json: { error: "Request timeout or network error" } };
  }
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

  const prompt = `You are a planning assistant. Break the project into twelve atomic, actionable microtasks that directly lead to the outcome goal. Prioritize clarity, concrete deliverables, and verifiable results. Avoid vague verbs.

Project:
- Title: "${projTitle}"
- Description: "${projDesc}"
- Category: "${projCategory}"
- Motivation: "${projMotivation}"
- Perceived difficulty (1-10): ${projDiff}
- Known obstacles: "${projObstacles}"
- Skills/resources needed: ${JSON.stringify(projSkills)}
- Target completion date (ISO): "${targetIso}"
- Outcome goal: "${(outcome_goal as string) || projDesc}"

Available time blocks (if any): ${JSON.stringify(blocks)}
- Expected format: [{ "start": "YYYY-MM-DDTHH:mm", "end": "YYYY-MM-DDTHH:mm" }, ...]
- If none are provided, plan anyway and note assumptions in the summary.

Rules for microtasks:
- Quantity: You MUST return exactly twelve (12) microtasks.
- Granularity: Prefer 10–30 minutes per microtask (maximum 60 minutes if strictly necessary).
- Each microtask must be concrete and verifiable with clear acceptance criteria.
- Tie microtasks to skills/resources and known obstacles where relevant.
- If time blocks are provided, suggest one suitable block per microtask when appropriate (do not invent dates outside the target window).
- Avoid vague phrasing like "research" or "analyze" without a specific output artifact.

Required output format:
Respond with ONE valid JSON object ONLY (no extra text, no code fences). Structure:
{
  "tasks": [
    {
      "id": "unique-kebab-case",
      "micro_task": "Short, actionable description",
      "why": "Why this microtask is necessary for the outcome",
      "estimate_minutes": 25,
      "required_context": ["skill-or-resource"],
      "acceptance_criteria": ["criterion 1", "criterion 2"],
      "suggested_time_block": {
        "date": "YYYY-MM-DD",
        "start": "HH:mm",
        "end": "HH:mm"
      },
      "tags": ["${projCategory || ""}", "Planning"],
      "risk": "low"
    }
  ],
  "summary": {
    "goal": "${projTitle} — ${projDesc}",
    "total_estimated_minutes": 0,
    "critical_path_ids": ["id-1","id-2","id-3"],
    "first_three_tasks": ["id-1","id-2","id-3"],
    "assumptions": ["list assumptions if info/time blocks were missing"]
  }
}

Validation:
- The "tasks" array MUST contain exactly twelve items.
- "estimate_minutes" must sum to "total_estimated_minutes".
- Do NOT include any text outside the JSON object. Output in English.`;
  const payload: JsonRecord = {
    platform: "web",
    chat_id: ensuredChatId,
    platform_chat_id,
    bot_username: (bot_name as string) || DEFAULT_BOT_USERNAME,
    messages: [{ role: "user", contents: [{ type: "text", value: prompt }] }],
    prefix_with_bot_name: false,
  };
  const call = await callMabotInput(tokenRes.token, payload);
  if (!call.ok) {
    // If Mabot API is down, return a fallback response
    if (call.status === 504 || call.status >= 500) {
      logDebug("Mabot API unavailable, returning fallback response");
      const fallbackData = {
        tasks: [
          {
            id: "setup-project-structure",
            micro_task: "Set up basic project structure and folder organization",
            why: "Establishing a clear foundation makes all subsequent tasks easier to execute",
            estimate_minutes: 30,
            required_context: ["Basic organization skills"],
            acceptance_criteria: ["Project folders created", "File structure documented"],
            suggested_time_block: { date: new Date().toISOString().split('T')[0], start: "09:00", end: "09:30" },
            tags: [projCategory || "General", "Planning"],
            risk: "low"
          },
          {
            id: "define-requirements",
            micro_task: "Define and document project requirements",
            why: "Clear requirements prevent scope creep and provide direction",
            estimate_minutes: 25,
            required_context: ["Analysis skills"],
            acceptance_criteria: ["Requirements documented", "Success criteria defined"],
            suggested_time_block: { date: new Date().toISOString().split('T')[0], start: "10:00", end: "10:25" },
            tags: [projCategory || "General", "Planning"],
            risk: "low"
          }
        ],
        summary: {
          goal: `${projTitle} — ${projDesc}`,
          total_estimated_minutes: 55,
          critical_path_ids: ["setup-project-structure", "define-requirements"],
          first_three_tasks: ["setup-project-structure", "define-requirements"],
          assumptions: ["Mabot API temporarily unavailable - using fallback tasks"]
        }
      };
      const resp: SuccessResponse = { success: true, data: fallbackData, chat_id: ensuredChatId };
      return json(200, resp, req);
    }
    return json(call.status, { success: false, error: { message: "Mabot error", code: `mabot_${call.status}` } }, req);
  }
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
  const prompt = `You are a coaching assistant. The user is blocked. Provide practical advice to unblock.

Micro-task: ${micro_task}
Outcome goal: ${outcome_goal}
Blocker: ${blocker}
Current state: ${current_state}
Emotional state: ${emotional_state}
Time left: ${time_left}.`;
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
  const prompt = `You are a motivation assistant. Propose a reward schedule consistent with the user's preferences and habits.

User context: ${JSON.stringify(user_context)}`;
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

// Request router - Main entry point
Deno.serve(async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const origin = req.headers.get("origin");
  
  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204, 
      headers: { ...corsHeaders(origin, req) } 
    });
  }
  
  // Only allow POST requests for actual endpoints
  if (req.method !== "POST") return methodNotAllowed(req);

  // Route to appropriate handler
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
*/

-- After deploying this updated function:
-- 1. Test the CORS fix by creating a new project and clicking "Generate Microtasks"
-- 2. Check browser console to ensure no CORS errors
-- 3. Verify that tasks are generated successfully

-- If you still experience CORS issues after deployment:
-- 1. Clear your browser cache and cookies
-- 2. Try in an incognito/private window
-- 3. Check that your Supabase project URL matches the one in ALLOWED_ORIGINS
-- 4. Verify the function is deployed to the correct project

-- Environment variables needed in Supabase Dashboard:
-- MABOT_USERNAME: Your Mabot username
-- MABOT_PASSWORD: Your Mabot password
-- MABOT_API_URL: https://back.mabot.app (default)
-- MABOT_DEFAULT_BOT_USERNAME: mabot (default)
-- DEBUG: false (for production)
-- DENO_ENV: production
