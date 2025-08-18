// Lightweight Mabot client that calls Supabase Edge Function endpoints.
// Handles token reuse (memory + localStorage), chat continuity, and request helpers.

type JsonRecord = Record<string, unknown>;

export type MabotSuccessResponse<TData extends JsonRecord = JsonRecord> = {
	success: true;
	data: TData;
	chat_id?: string;
	platform_chat_id?: string;
};

export type MabotErrorResponse = {
	success: false;
	error: {
		message: string;
		code?: string;
	};
};

export type MabotResponse<TData extends JsonRecord = JsonRecord> =
	| MabotSuccessResponse<TData>
	| MabotErrorResponse;

type GenerateMicrotasksBody = {
	project_description: string;
	outcome_goal: string;
	available_time_blocks: Array<{ start: string; end: string }>;
	target_completion_date: string; // ISO date
	// Optional richer project context
	title?: string;
	category?: string | null;
	motivation?: string | null;
	perceived_difficulty?: number | null;
	known_obstacles?: string | null;
	skills_resources_needed?: string[] | null;
	access_token: string;
	chat_id?: string;
	platform_chat_id?: string;
	bot_name?: string;
};

type ObstacleCoachingBody = {
	micro_task: string;
	outcome_goal: string;
	blocker: string;
	current_state: string;
	emotional_state: string;
	time_left: string; // human readable or minutes
	access_token: string;
	chat_id?: string;
	platform_chat_id?: string;
	bot_name?: string;
};

type RewardScheduleBody = {
	user_context: JsonRecord;
	access_token: string;
	chat_id?: string;
	platform_chat_id?: string;
	bot_name?: string;
};

type SendMessageBody = {
	message: string;
	bot_name?: string;
	access_token: string;
	chat_id?: string;
	platform_chat_id?: string;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
	// eslint-disable-next-line no-console
	console.warn("VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. Mabot integration will not work.");
}

const BASE_PATH = "/functions/v1/mabot-integration";

async function makeRequest<TData extends JsonRecord = JsonRecord>(endpoint: string, body: JsonRecord): Promise<MabotResponse<TData>> {
	const url = `${supabaseUrl}${BASE_PATH}${endpoint}`;
	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"apikey": supabaseAnonKey,
			"Authorization": `Bearer ${supabaseAnonKey}`,
		},
		body: JSON.stringify(body ?? {}),
	});

	const json = (await response.json()) as MabotResponse<TData>;
	return json;
}

// In-memory token and chat session cache
let cachedAccessToken: string | null = null;
let inFlightLogin: Promise<string> | null = null;
let cachedChatId: string | null = null;
let cachedPlatformChatId: string | null = null;

function getLocalStorageSafe(key: string): string | null {
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}

function setLocalStorageSafe(key: string, value: string): void {
	try {
		localStorage.setItem(key, value);
	} catch {
		// ignore
	}
}

export async function login(): Promise<string> {
	if (cachedAccessToken) return cachedAccessToken;

	const fromStorage = getLocalStorageSafe("mabot:access_token");
	if (fromStorage) {
		cachedAccessToken = fromStorage;
		return fromStorage;
	}

	if (inFlightLogin) return inFlightLogin;

	inFlightLogin = (async () => {
		const res = await makeRequest<{ access_token: string }>("/login", {});
		if (!res.success) {
			throw new Error(res.error?.message || "Failed to login to Mabot");
		}
		cachedAccessToken = res.data.access_token;
		setLocalStorageSafe("mabot:access_token", cachedAccessToken);
		return cachedAccessToken;
	})();

	try {
		const token = await inFlightLogin;
		return token;
	} finally {
		inFlightLogin = null;
	}
}

export function clearCachedToken(): void {
	cachedAccessToken = null;
	try {
		localStorage.removeItem("mabot:access_token");
	} catch {
		// ignore
	}
}

export function getCurrentChatSession(): { chat_id: string | null; platform_chat_id: string | null } {
	return { chat_id: cachedChatId, platform_chat_id: cachedPlatformChatId };
}

export function clearChatSession(): void {
	cachedChatId = null;
	cachedPlatformChatId = null;
}

export function setChatId(id: string | null | undefined): void {
	cachedChatId = (id && String(id)) || null;
}

function updateChatSessionFromResponse<TData extends JsonRecord>(res: MabotResponse<TData>): void {
	if (res.success) {
		if (res.chat_id) cachedChatId = res.chat_id;
		if (res.platform_chat_id) cachedPlatformChatId = res.platform_chat_id;
	}
}

export async function generateMicrotasks(input: Omit<GenerateMicrotasksBody, "access_token" | "chat_id" | "platform_chat_id">): Promise<MabotResponse<{ tasks: JsonRecord[] }>> {
	const access_token = await login();
	const res = await makeRequest<{ tasks: JsonRecord[] }>(
		"/generate-microtasks",
		{ ...input, access_token, chat_id: cachedChatId ?? undefined, platform_chat_id: cachedPlatformChatId ?? undefined }
	);
	updateChatSessionFromResponse(res);
	return res;
}

export async function getObstacleCoaching(input: Omit<ObstacleCoachingBody, "access_token" | "chat_id" | "platform_chat_id">): Promise<MabotResponse<{ advice: string }>> {
	const access_token = await login();
	const res = await makeRequest<{ advice: string }>(
		"/obstacle-coaching",
		{ ...input, access_token, chat_id: cachedChatId ?? undefined, platform_chat_id: cachedPlatformChatId ?? undefined }
	);
	updateChatSessionFromResponse(res);
	return res;
}

export async function generateRewardSchedule(input: Omit<RewardScheduleBody, "access_token" | "chat_id" | "platform_chat_id">): Promise<MabotResponse<{ schedule: JsonRecord }>> {
	const access_token = await login();
	const res = await makeRequest<{ schedule: JsonRecord }>(
		"/generate-reward-schedule",
		{ ...input, access_token, chat_id: cachedChatId ?? undefined, platform_chat_id: cachedPlatformChatId ?? undefined }
	);
	updateChatSessionFromResponse(res);
	return res;
}

// Convenience typed wrapper for microtasks
export type GeneratedMicrotask = {
  id: string;
  title: string;
  description?: string;
  priority?: 'high' | 'medium' | 'low';
  estimatedTimeMinutes?: number;
  dopamineScore?: number;
  taskType?: string;
  resistanceLevel?: 'low' | 'medium' | 'high' | string;
  dependencyTaskExternalId?: string | null;
};

export async function generateMicrotasksForProject(input: Omit<GenerateMicrotasksBody, 'access_token' | 'chat_id' | 'platform_chat_id'>): Promise<MabotResponse<{ tasks: GeneratedMicrotask[] }>> {
  const access_token = await login();
  const res = await makeRequest<{ tasks: GeneratedMicrotask[] }>(
    "/generate-microtasks",
    { ...input, access_token, chat_id: cachedChatId ?? undefined, platform_chat_id: cachedPlatformChatId ?? undefined }
  );
  updateChatSessionFromResponse(res);
  return res;
}

export async function sendMessage(input: Omit<SendMessageBody, "access_token" | "chat_id" | "platform_chat_id">): Promise<MabotResponse<{ reply: string }>> {
	const access_token = await login();
	const res = await makeRequest<{ reply: string }>(
		"/send-message",
		{ ...input, access_token, chat_id: cachedChatId ?? undefined, platform_chat_id: cachedPlatformChatId ?? undefined }
	);
	updateChatSessionFromResponse(res);
	return res;
}

// Utility to generate a stable platform chat id when needed by caller
export function generatePlatformChatId(bot: string): string {
	const now = Date.now();
	const rand = Math.random().toString(36).slice(2, 8);
	return `deprocast_${bot}_${now}_${rand}`;
}

export function setPlatformChatId(id: string): void {
	cachedPlatformChatId = id || null;
}

export function ensurePlatformChatId(bot: string): string {
	if (!cachedPlatformChatId) {
		cachedPlatformChatId = generatePlatformChatId(bot);
	}
	return cachedPlatformChatId;
}

// Generate or reuse a UUID chat_id scoped to a key (e.g., project id)
export function getOrCreateUuidChatId(scopeKey: string): string {
	const key = `mabot:uuid_chat_id:${scopeKey}`;
	try {
		const existing = localStorage.getItem(key);
		if (existing) return existing;
		const uuid = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
			? (crypto as any).randomUUID()
			: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
		localStorage.setItem(key, uuid);
		return uuid;
	} catch {
		// Fallback non-persistent
		return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
	}
}


