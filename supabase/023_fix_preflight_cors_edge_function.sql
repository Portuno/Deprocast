-- CORS preflight fix and deployment notes for mabot-integration
-- Do NOT run on Supabase SQL; use as documentation for deployment steps.

-- Steps:
-- 1) Ensure function code is updated locally at: supabase/functions/mabot-integration/index.ts
--    - Preflight replies with exact CORS headers (no wildcard)
--    - All JSON responses include CORS headers via helper
-- 2) Deploy the function:
--    supabase functions deploy mabot-integration --no-verify-jwt
-- 3) In Supabase Dashboard → Edge Functions → mabot-integration → Settings:
--    - Verify environment variables:
--      DEBUG=false
--      DENO_ENV=production
--      MABOT_API_URL=https://back.mabot.app
--      MABOT_DEFAULT_BOT_USERNAME=depropd
--      MABOT_USERNAME=your-user (optional if using fallback/dev)
--      MABOT_PASSWORD=your-pass (optional if using fallback/dev)
-- 4) Test from https://deprocast.vercel.app creating a project and generating microtasks.
--    Confirm no CORS errors and that 504s are handled by the function fallback.

-- Troubleshooting:
-- - If you still see "No 'Access-Control-Allow-Origin' header":
--   a) Re-deploy the function to ensure latest code is live
--   b) Confirm Origin header in requests is exactly https://deprocast.vercel.app
--   c) Ensure your browser/devtools is not caching preflight (try hard reload)
-- - If requests 504 at gateway: the function now times out Mabot calls at ~25s and returns fallback JSON with 200.
-- - If using custom domains, add them to ALLOWED_ORIGINS in the function.


