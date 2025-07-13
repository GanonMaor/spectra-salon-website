import { supabase } from './supabaseClient';
import { createSmartPayment, SumitCustomer } from '../payments';

// User types
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: 'admin' | 'user' | 'partner';
  summit_id?: string;
  created_at: string;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

// Sign in with email/password
export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ 
    email, 
    password 
  });
}

// Enhanced sign up with full user data and Summit sync
export async function signUpWithEmail(signUpData: SignUpData) {
  const { email, password, fullName, phone } = signUpData;
  
  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({ 
    email, 
    password 
  });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');

    // 2. Create Summit customer
    let summitId: string | undefined;
    try {
      const summitCustomer: SumitCustomer = {
        name: fullName,
        email: email,
        phone: phone,
        country: 'IL' // Default to Israel, can be updated later
      };

      // Call Summit API to create customer
      const summitResponse = await fetch(`${import.meta.env.VITE_SUMIT_API_URL}/api/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUMIT_API_KEY}`,
          'X-Organization-Id': import.meta.env.VITE_SUMIT_ORGANIZATION_ID || ''
        },
        body: JSON.stringify(summitCustomer)
      });

      if (summitResponse.ok) {
        const summitData = await summitResponse.json();
        summitId = summitData.id || summitData.customer_id;
        console.log('✅ Summit customer created:', summitId);
      } else {
        console.warn('⚠️ Failed to create Summit customer, continuing without summit_id');
      }
    } catch (summitError) {
      console.warn('⚠️ Summit API error:', summitError);
      // Continue without Summit ID - we can sync later
    }

    // 3. Create user profile in our database
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: fullName,
        phone: phone,
        role: email === 'maor@spectra-ci.com' ? 'admin' : 'user',
        summit_id: summitId
      });

    if (profileError) {
      console.error('Failed to create user profile:', profileError);
      // Don't throw here - auth user was created successfully
    }

    return { data: authData, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return { data: null, error };
  }
}

// Get current user
export async function getCurrentUser() {
  return supabase.auth.getUser();
}

// Sign out
export async function signOut() {
  return supabase.auth.signOut();
}

// Request password reset
export async function requestPasswordReset(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
}

// Update password with reset token
export async function updatePassword(newPassword: string) {
  return supabase.auth.updateUser({
    password: newPassword
  });
}

// Verify reset token (check if user session is valid for password reset)
export async function verifyResetToken() {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
}

// Get user profile data from our users table
export async function getUserProfile(userId: string): Promise<{ data: UserProfile | null; error: any }> {
  return supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
}

// Update user profile
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  return supabase
    .from('users')
    .update(updates)
    .eq('id', userId);
}

// Get user with role information
export async function getCurrentUserWithProfile() {
  const { data: authData, error: authError } = await getCurrentUser();
  
  if (authError || !authData.user) {
    return { data: null, error: authError };
  }

  const { data: profileData, error: profileError } = await getUserProfile(authData.user.id);
  
  return {
    data: profileData ? {
      ...authData.user,
      profile: profileData
    } : authData.user,
    error: profileError
  };
}

// Check if user is admin
export async function isUserAdmin(userId: string): Promise<boolean> {
  const { data, error } = await getUserProfile(userId);
  if (error || !data) return false;
  return data.role === 'admin';
}

// Sync existing user with Summit (for users created before Summit integration)
export async function syncUserWithSummit(userId: string) {
  const { data: profile, error } = await getUserProfile(userId);
  if (error || !profile || profile.summit_id) {
    return { success: false, error: error || 'User already has Summit ID' };
  }

  try {
    const summitCustomer: SumitCustomer = {
      name: profile.full_name || profile.email,
      email: profile.email,
      phone: profile.phone,
      country: 'IL'
    };

    const summitResponse = await fetch(`${import.meta.env.VITE_SUMIT_API_URL}/api/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUMIT_API_KEY}`,
        'X-Organization-Id': import.meta.env.VITE_SUMIT_ORGANIZATION_ID || ''
      },
      body: JSON.stringify(summitCustomer)
    });

    if (summitResponse.ok) {
      const summitData = await summitResponse.json();
      const summitId = summitData.id || summitData.customer_id;

      await updateUserProfile(userId, { summit_id: summitId });
      return { success: true, summitId };
    } else {
      return { success: false, error: 'Failed to create Summit customer' };
    }
  } catch (error) {
    return { success: false, error };
  }
} 