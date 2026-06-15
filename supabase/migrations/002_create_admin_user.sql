-- This migration creates functions to manage user roles
-- Run this after the initial schema migration (001_initial_schema.sql)

-- Function to promote a user to admin role
CREATE OR REPLACE FUNCTION promote_to_admin(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET role = 'admin',
      updated_at = NOW()
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to promote a user to staff role
CREATE OR REPLACE FUNCTION promote_to_staff(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET role = 'staff',
      updated_at = NOW()
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION promote_to_admin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION promote_to_staff(TEXT) TO authenticated;

-- IMPORTANT: To create the admin user, you must use the Supabase Auth API
-- Direct insertion into auth.users does not work due to Supabase's password hashing
-- Use the create-admin-user.js script or create through Supabase Dashboard
