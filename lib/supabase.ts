
import { createClient } from '@supabase/supabase-js';

// ==========================================
// ⚠️ GOOGLE AUTH SETUP & TROUBLESHOOTING
// ==========================================
// 
// ERROR: "403 That’s an error. You do not have access to this page."
// -------------------------------------------------------------------
// CAUSE: Your OAuth Consent Screen is set to "Testing" and your email is not added as a test user.
// FIX:
// 1. Go to console.cloud.google.com > APIs & Services > OAuth consent screen.
// 2. Click "Publish App" to push to production (easiest fix).
// 3. OR add your email address to the "Test users" list on that same page.
//
// ERROR: "400 redirect_uri_mismatch" / "Validation failed"
// -------------------------------------------------------------------
// CAUSE: Missing Client ID/Secret or the Redirect URI is wrong.
// FIX:
// 1. Go to console.cloud.google.com > APIs & Services > Credentials.
// 2. Edit your OAuth 2.0 Client ID.
// 3. Ensure 'Authorized redirect URIs' includes exactly:
//    https://tdbbdwozygocwjtzbxpl.supabase.co/auth/v1/callback
// 4. Copy Client ID & Secret to Supabase > Authentication > Providers > Google.
// ==========================================

const SUPABASE_URL = 'https://tdbbdwozygocwjtzbxpl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYmJkd296eWdvY3dqdHpieHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNTA2MjgsImV4cCI6MjA3OTgyNjYyOH0.jIxroPrtO-cQrtbZY5lX2TL4LJnm-kK-FM-15Qa8ioU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * DATABASE SETUP INSTRUCTIONS (Run this in Supabase SQL Editor):
 * 
 * -- 1. Create Profiles Table
 * create table public.profiles (
 *   id uuid references auth.users not null primary key,
 *   email text,
 *   role text check (role in ('SAAS', 'AFFILIATE')),
 *   onboarding_complete boolean default false,
 *   metadata jsonb default '{}'::jsonb,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * alter table public.profiles enable row level security;
 * 
 * -- 2. Create SaaS Programs Table
 * create table public.saas_programs (
 *   id uuid default gen_random_uuid() primary key,
 *   user_id uuid references auth.users not null,
 *   name text not null,
 *   description text,
 *   commission_type text,
 *   commission_value numeric,
 *   cookie_days integer,
 *   is_recurring boolean default false,
 *   stripe_connected boolean default false,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * alter table public.saas_programs enable row level security;
 * 
 * -- 3. Create Affiliate Profiles Table
 * create table public.affiliate_profiles (
 *   id uuid default gen_random_uuid() primary key,
 *   user_id uuid references auth.users not null unique,
 *   full_name text,
 *   public_name text,
 *   bio text,
 *   niches text[],
 *   traffic_sources text[],
 *   social_links jsonb default '{}'::jsonb,
 *   audience_stats jsonb default '{}'::jsonb,
 *   preferred_saas text[],
 *   currency text,
 *   stripe_connected boolean default false,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * alter table public.affiliate_profiles enable row level security;
 * 
 * -- 4. Create Policies
 * create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
 * create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );
 * create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );
 * 
 * create policy "SaaS owners can insert their own programs." on saas_programs for insert with check ( auth.uid() = user_id );
 * create policy "SaaS owners can view their own programs." on saas_programs for select using ( auth.uid() = user_id );
 * create policy "SaaS owners can update their own programs." on saas_programs for update using ( auth.uid() = user_id );
 * 
 * create policy "Affiliates can insert their own profile." on affiliate_profiles for insert with check ( auth.uid() = user_id );
 * create policy "Affiliates can view their own profile." on affiliate_profiles for select using ( auth.uid() = user_id );
 * create policy "Affiliates can update their own profile." on affiliate_profiles for update using ( auth.uid() = user_id );
 * 
 * -- ⚠️ UPDATE IF PROFILES TABLE EXISTS BUT FAILS:
 * alter table public.profiles add column if not exists metadata jsonb default '{}'::jsonb;
 */

export async function getProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    return { data, error };
  } catch (err: any) {
    console.error("Unexpected error in getProfile:", err);
    return { data: null, error: err };
  }
}

export async function createProfile(userId: string, email: string, role: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        { id: userId, email, role, onboarding_complete: false, metadata: {} }
      ])
      .select()
      .single();
      
    return { data, error };
  } catch (err: any) {
    console.error("Unexpected error in createProfile:", err);
    return { data: null, error: err };
  }
}

export async function createSaaSProgram(userId: string, programData: any) {
  const { data, error } = await supabase
    .from('saas_programs')
    .insert([
      {
        user_id: userId,
        name: programData.name,
        description: programData.description,
        commission_type: programData.commissionType,
        commission_value: programData.commissionValue,
        cookie_days: programData.cookieDays,
        is_recurring: programData.isRecurring,
        stripe_connected: programData.stripeConnected
      }
    ]);
  
  return { data, error };
}

export async function createAffiliateProfile(userId: string, profileData: any) {
  const { data, error } = await supabase
    .from('affiliate_profiles')
    .insert([
      {
        user_id: userId,
        full_name: profileData.fullName,
        public_name: profileData.publicName,
        bio: profileData.bio,
        niches: profileData.niches,
        traffic_sources: profileData.trafficSources,
        social_links: profileData.socials,
        audience_stats: profileData.audience,
        preferred_saas: profileData.preferredSaaS,
        currency: profileData.currency,
        stripe_connected: profileData.stripeConnected
      }
    ]);
    
  return { data, error };
}

export async function updateOnboardingStatus(userId: string, status: boolean) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ onboarding_complete: status })
    .eq('id', userId);
    
  return { data, error };
}

export async function updateProfileMetadata(userId: string, metadata: any) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      metadata: metadata,
      onboarding_complete: true 
    })
    .eq('id', userId);
    
  return { data, error };
}
