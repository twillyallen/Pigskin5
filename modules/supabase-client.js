// supabase-client.js
// Single Supabase client instance, imported wherever needed.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// PASTE YOUR VALUES HERE — both are safe to expose in frontend code.
// The anon key is designed to be public; RLS policies are what protect your data.
const SUPABASE_URL = "https://fhjywfejdrjaflvaphhp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoanl3ZmVqZHJqYWZsdmFwaGhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMDM3NzMsImV4cCI6MjA5MTU3OTc3M30.aPzqsBHmoi-fyYb4MdjTiJZ2LwboHxuO7MA-U7waDGo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,        // keeps user logged in across page reloads
    autoRefreshToken: true,      // refreshes expired tokens automatically
    detectSessionInUrl: true,    // handles magic link redirects
  },
});

// Helper: get the current user, or null if not logged in
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper: get the current user's profile (username, display name, streaks)
export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  
  if (error) {
    console.error("Failed to load profile:", error);
    return null;
  }
  return data;
}

// Subscribe to login/logout events
export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null, event);
  });
}