// auth.js
import { supabase } from "./supabase-client.js";

export async function sendMagicLink(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) return { error: error.message };
  return { success: true, message: "Check your email for the link!" };
}

export async function setUsername(username) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in." };
  
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return { error: "Username must be 3-20 chars, letters/numbers/underscore only." };
  }
  
  const { data: existing } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username)
    .neq("id", user.id)
    .maybeSingle();
  if (existing) return { error: "That username is taken." };
  
  const { error } = await supabase
    .from("profiles")
    .update({ username, current_display_name: username })
    .eq("id", user.id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function signOut() {
  await supabase.auth.signOut();
}