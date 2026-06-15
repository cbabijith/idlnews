import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { uploadImage, deleteImage } from './storage';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export const createSupabaseClient = (url: string, key: string): SupabaseClient => {
  return createClient(url, key);
};

export { uploadImage, deleteImage };
export default supabase;
