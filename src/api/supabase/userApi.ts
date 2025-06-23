import { supabase } from './supabaseClient';

// Sign in with email/password
export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ 
    email, 
    password 
  });
}

// Sign up with email/password  
export async function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({ 
    email, 
    password 
  });
}

// Get current user
export async function getCurrentUser() {
  return supabase.auth.getUser();
}

// Sign out
export async function signOut() {
  return supabase.auth.signOut();
}

// Get user profile data
export async function getUserProfile(userId: string) {
  return supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
}

// Update user profile
export async function updateUserProfile(userId: string, updates: any) {
  return supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
} 