/**
 * Re-exports the singleton browser Supabase client.
 *
 * Kept for backward compatibility with existing imports:
 *   import { supabase } from "@/lib/supabase"
 *
 * New code should prefer importing the factory directly:
 *   import { createClient } from "@/lib/supabase/client"  (browser)
 *   import { createClient } from "@/lib/supabase/server"  (server / actions)
 */
import { createClient } from "@/lib/supabase/client";

export const supabase = createClient();
