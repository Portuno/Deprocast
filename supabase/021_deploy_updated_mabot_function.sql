-- Deploy Updated Mabot Integration Edge Function
-- This file contains instructions for deploying the updated Edge Function

-- IMPORTANT: This is a deployment instruction file, not executable SQL
-- The actual Edge Function code is in: supabase/functions/mabot-integration/index.ts

-- Key improvements in the updated function:
-- 1. Enhanced CORS headers with specific origins for https://deprocast.vercel.app
-- 2. Added timeout handling (25 seconds) to prevent 504 Gateway Timeout
-- 3. Added fallback response when Mabot API is unavailable
-- 4. Better error handling and logging
-- 5. Support for Access-Control-Allow-Credentials

-- To deploy this function, you have two options:

-- OPTION 1: Using Supabase CLI (Recommended)
-- 1. Install Supabase CLI if not already installed:
--    npm install -g supabase
-- 2. Login to Supabase:
--    supabase login
-- 3. Link to your project:
--    supabase link --project-ref YOUR_PROJECT_REF
-- 4. Deploy the function:
--    supabase functions deploy mabot-integration

-- OPTION 2: Using Supabase Dashboard
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to Edge Functions
-- 3. Find the mabot-integration function
-- 4. Click "Edit" or "Update"
-- 5. Copy the contents from supabase/functions/mabot-integration/index.ts
-- 6. Paste and save the updated code

-- After deployment, the function will:
-- - Accept requests from https://deprocast.vercel.app without CORS errors
-- - Handle timeouts gracefully with 25-second limit
-- - Provide fallback tasks when Mabot API is unavailable
-- - Return proper error messages for debugging

-- Test the deployment by:
-- 1. Creating a new project in your app
-- 2. Clicking "Generate Microtasks"
-- 3. Verifying that tasks are generated (either from Mabot or fallback)
-- 4. Checking browser console for any remaining CORS errors

-- Note: The function includes both production and development configurations
-- Make sure your environment variables are properly set in Supabase Dashboard
