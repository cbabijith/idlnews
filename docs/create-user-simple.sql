-- First, let's check the actual structure of auth.users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'auth'
ORDER BY ordinal_position;

-- If the above works, we'll create a user with the correct columns
-- For now, let's try using Supabase's built-in signup function through the REST API
-- This bypasses the dashboard issues

-- Alternative: Use the auth.signup() function if available
-- SELECT * FROM auth.signup('admin@sngnews.com', '123admin');
