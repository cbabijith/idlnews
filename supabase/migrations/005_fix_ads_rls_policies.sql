-- Fix RLS policies for ads table
-- This migration fixes two issues:
-- 1. Delete policy now allows both admin and staff (was admin only)
-- 2. Update policy now includes WITH CHECK clause (was missing)

-- Drop existing policies
DROP POLICY IF EXISTS "Admins and staff can update ads" ON ads;
DROP POLICY IF EXISTS "Admins can delete ads" ON ads;

-- Recreate update policy with WITH CHECK clause
CREATE POLICY "Admins and staff can update ads" ON ads
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Recreate delete policy to allow both admin and staff
CREATE POLICY "Admins and staff can delete ads" ON ads
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );
