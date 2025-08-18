// Simple registry to support multiple Mabot bots and easy routing.

export type MabotBotKey =
	| "assistant"
	| "planner"
	| "coach"
	| "rewards"
	| "journal";

export type MabotBotDefinition = {
	key: MabotBotKey;
	username: string; // bot_username in Mabot
	description?: string;
};

// Default registry. Replace usernames with your actual Mabot bot usernames.
const defaultBots: Record<MabotBotKey, MabotBotDefinition> = {
	assistant: { key: "assistant", username: "assistant" },
	planner: { key: "planner", username: "planner" },
	coach: { key: "coach", username: "coach" },
	rewards: { key: "rewards", username: "rewards" },
	journal: { key: "journal", username: "journal" },
};

let botsRegistry: Record<MabotBotKey, MabotBotDefinition> = { ...defaultBots };

export function getMabotBots(): Record<MabotBotKey, MabotBotDefinition> {
	return botsRegistry;
}

export function registerMabotBots(overrides: Partial<Record<MabotBotKey, Partial<MabotBotDefinition>>>): void {
	botsRegistry = { ...botsRegistry };
	(Object.keys(overrides) as MabotBotKey[]).forEach((k) => {
		const current = botsRegistry[k] || { key: k, username: k };
		botsRegistry[k] = { ...current, ...overrides[k] } as MabotBotDefinition;
	});
}

export function resolveBotName(bot?: string): string | null {
	if (!bot) return null;
	const key = bot.toLowerCase() as MabotBotKey;
	const byKey = botsRegistry[key];
	if (byKey) return byKey.username;
	return bot; // assume caller passed concrete username
}


