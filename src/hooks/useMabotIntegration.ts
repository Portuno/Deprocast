import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	clearChatSession,
	generateMicrotasks,
	ensurePlatformChatId,
	generateRewardSchedule,
	getCurrentChatSession,
	getObstacleCoaching,
	login,
	sendMessage,
} from "../integrations/mabot/client";


const DEFAULT_DEBOUNCE_MS = 300;

export function useMabotIntegration(options?: { autoLogin?: boolean; debounceMs?: number; defaultBotName?: string }) {
	const { autoLogin = true, debounceMs = DEFAULT_DEBOUNCE_MS, defaultBotName = "mabot" } = options || {};

	const [accessToken, setAccessToken] = useState<string | null>(null);
	const [lastError, setLastError] = useState<string | null>(null);
	const [requesting, setRequesting] = useState<boolean>(false);
	const debouncedRef = useRef<number | null>(null);

	const chatSession = useMemo(() => getCurrentChatSession(), [requesting]);

	useEffect(() => {
		if (!autoLogin) return;
		if (debouncedRef.current) window.clearTimeout(debouncedRef.current);
		debouncedRef.current = window.setTimeout(async () => {
			try {
				const token = await login();
				setAccessToken(token);
				setLastError(null);
			} catch (err) {
				const message = err instanceof Error ? err.message : "Failed to login to Mabot";
				setLastError(message);
				// eslint-disable-next-line no-console
				console.error("Mabot auto-login error:", err);
			}
		}, debounceMs);
		return () => {
			if (debouncedRef.current) window.clearTimeout(debouncedRef.current);
		};
	}, [autoLogin, debounceMs]);

	const generateMicrotasksWithAI = useCallback(
		async (
			args: Parameters<typeof generateMicrotasks>[0] & { platformFallbackBot?: string; bot_name?: string }
		) => {
			setRequesting(true);
			try {
				ensurePlatformChatId(args.platformFallbackBot || defaultBotName);
				const res = await generateMicrotasks({ ...args,
					// no access token here; client adds it
				});
				setLastError(null);
				return res;
			} catch (err) {
				const message = err instanceof Error ? err.message : "Failed to generate microtasks";
				setLastError(message);
				// eslint-disable-next-line no-console
				console.error(message, err);
				throw err;
			} finally {
				setRequesting(false);
			}
		},
		[defaultBotName]
	);

	const getObstacleCoachingWithAI = useCallback(
		async (args: Parameters<typeof getObstacleCoaching>[0] & { bot_name?: string }) => {
			setRequesting(true);
			try {
				const res = await getObstacleCoaching(args);
				setLastError(null);
				return res;
			} catch (err) {
				const message = err instanceof Error ? err.message : "Failed to get obstacle coaching";
				setLastError(message);
				// eslint-disable-next-line no-console
				console.error(message, err);
				throw err;
			} finally {
				setRequesting(false);
			}
		},
		[]
	);

	const generateRewardScheduleWithAI = useCallback(
		async (args: Parameters<typeof generateRewardSchedule>[0] & { bot_name?: string }) => {
			setRequesting(true);
			try {
				const res = await generateRewardSchedule(args);
				setLastError(null);
				return res;
			} catch (err) {
				const message = err instanceof Error ? err.message : "Failed to generate reward schedule";
				setLastError(message);
				// eslint-disable-next-line no-console
				console.error(message, err);
				throw err;
			} finally {
				setRequesting(false);
			}
		},
		[]
	);

	const sendMessageWithAI = useCallback(
		async (args: Parameters<typeof sendMessage>[0] & { bot_name?: string }) => {
			setRequesting(true);
			try {
				const res = await sendMessage(args);
				setLastError(null);
				return res;
			} catch (err) {
				const message = err instanceof Error ? err.message : "Failed to send message";
				setLastError(message);
				// eslint-disable-next-line no-console
				console.error(message, err);
				throw err;
			} finally {
				setRequesting(false);
			}
		},
		[]
	);

	const resetChat = useCallback(() => {
		clearChatSession();
	}, []);

	return {
		accessToken,
		lastError,
		requesting,
		chatSession,
		generateMicrotasksWithAI,
		getObstacleCoachingWithAI,
		generateRewardScheduleWithAI,
		sendMessageWithAI,
		resetChat,
	};
}


