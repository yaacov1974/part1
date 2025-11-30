
import React, { useState, useEffect } from 'react';
import { ViewState, UserRole } from './types';
import { Landing } from './pages/Landing';
import { SaaS } from './pages/SaaS';
import { Affiliate } from './pages/Affiliate';
import { Logo, Button, Input } from './components/UI';
import { supabase, getProfile, createProfile } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { HelpCircle, ChevronDown, ChevronUp, Mail, Lock, AlertTriangle, Database, Terminal } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LANDING');
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [appError, setAppError] = useState<{title: string, message: string, code?: string} | null>(null);

  // Handle Authentication State
  useEffect(() => {
    // 1. Get initial real session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        handleUserRouting(session);
      } else {
        setIsAuthLoading(false);
      }
    });

    // 2. Listen for auth changes (e.g. after OAuth redirect)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        handleUserRouting(session);
      } else {
        setIsAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserRouting = async (session: Session) => {
    setIsAuthLoading(true);
    setAppError(null);
    const userId = session.user.id;
    const email = session.user.email || '';

    try {
      // Try to fetch existing profile
      let { data: profile, error: fetchError } = await getProfile(userId);

      // If fetch error is not just "not found", throw it
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("Profile fetch error:", fetchError);
        throw new Error(`Database error: ${fetchError.message}`);
      }

      // If no profile exists, create one
      if (!profile) {
        // Determine role: Check metadata first (from email signup), then localStorage, then default
        const metaRole = session.user.user_metadata?.role;
        const storedRole = localStorage.getItem('partnerz_intended_role');
        const roleToUse = metaRole || storedRole || UserRole.SAAS;
        
        console.log(`Creating profile for ${email} with role: ${roleToUse}`);
        
        const { data: newProfile, error: createError } = await createProfile(userId, email, roleToUse);
        
        if (createError) {
          // Log the full object so we don't see [object Object]
          console.error("Profile creation error object:", createError);
          throw new Error(`Could not create profile: ${createError.message}`);
        }
        
        profile = newProfile;
        
        // Clear storage
        localStorage.removeItem('partnerz_intended_role');
      }

      // Route based on role and onboarding status
      if (profile) {
        if (profile.role === UserRole.SAAS) {
          if (profile.onboarding_complete) {
            setView('SAAS_DASHBOARD');
          } else {
            setView('SAAS_ONBOARDING');
          }
        } else if (profile.role === UserRole.AFFILIATE) {
          if (profile.onboarding_complete) {
            setView('AFFILIATE_DASHBOARD');
          } else {
            setView('AFFILIATE_ONBOARDING');
          }
        }
      } else {
        throw new Error("Profile created but not returned. Please retry.");
      }

    } catch (error: any) {
      console.error("Critical routing error:", error);
      
      const errorMessage = error.message || "";

      // Check for specific "relation does not exist" error which means table is missing
      if (errorMessage.includes("relation") && errorMessage.includes("does not exist")) {
        setAppError({
          title: "Database Setup Required",
          message: "The 'profiles' table is missing in Supabase. Please run the SQL setup script found in lib/supabase.ts.",
          code: `create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  role text check (role in ('SAAS', 'AFFILIATE')),
  onboarding_complete boolean default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.profiles enable row level security;`
        });
      } 
      // Check for missing metadata column
      else if (errorMessage.includes("metadata") && errorMessage.includes("column")) {
        setAppError({
          title: "Database Schema Update Required",
          message: "Your 'profiles' table is missing the 'metadata' column. This is required for the new affiliate features.",
          code: "alter table public.profiles add column if not exists metadata jsonb default '{}'::jsonb;"
        });
      }
      else {
        setAppError({
          title: "Login Error",
          message: errorMessage || "An unexpected error occurred while loading your profile."
        });
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('LANDING');
    setSession(null);
    setAppError(null);
  };

  const navigate = (newView: ViewState) => {
    window.scrollTo(0, 0);
    setView(newView);
    setAppError(null);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm animate-pulse">Authenticating...</p>
      </div>
    );
  }

  // Critical Error Screen (e.g. Missing Tables)
  if (appError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-red-900/50 rounded-2xl p-8 max-w-lg w-full">
          <div className="flex flex-col items-center text-center mb-6">
             <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                {appError.code ? <Database className="h-8 w-8 text-red-500"/> : <AlertTriangle className="h-8 w-8 text-red-500"/>}
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">{appError.title}</h2>
             <p className="text-slate-400">{appError.message}</p>
          </div>
          
          {appError.code && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2 px-1">
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Run this SQL in Supabase</span>
                 <button 
                   onClick={() => navigator.clipboard.writeText(appError.code || "")}
                   className="text-indigo-400 text-xs hover:text-white flex items-center gap-1"
                 >
                   <CopyIcon className="w-3 h-3" /> Copy
                 </button>
              </div>
              <div className="bg-black/50 rounded-lg border border-slate-700 p-4 font-mono text-xs text-emerald-400 overflow-x-auto relative">
                 <pre>{appError.code}</pre>
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Button variant="secondary" onClick={handleLogout}>Sign Out</Button>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  switch (view) {
    case 'LANDING':
      return <Landing onNavigate={navigate} />;
    
    // SaaS Auth Routes
    case 'SAAS_LOGIN':
      return <AuthScreen role={UserRole.SAAS} isSignup={false} onBack={() => navigate('LANDING')} onSwitch={() => navigate('SAAS_SIGNUP')} />;
    case 'SAAS_SIGNUP':
      return <AuthScreen role={UserRole.SAAS} isSignup={true} onBack={() => navigate('LANDING')} onSwitch={() => navigate('SAAS_LOGIN')} />;
    
    // Affiliate Auth Routes
    case 'AFFILIATE_LOGIN':
      return <AuthScreen role={UserRole.AFFILIATE} isSignup={false} onBack={() => navigate('LANDING')} onSwitch={() => navigate('AFFILIATE_SIGNUP')} />;
    case 'AFFILIATE_SIGNUP':
      return <AuthScreen role={UserRole.AFFILIATE} isSignup={true} onBack={() => navigate('LANDING')} onSwitch={() => navigate('AFFILIATE_LOGIN')} />;

    // Main App Views
    case 'SAAS_ONBOARDING':
      return <SaaS initialView="ONBOARDING" onLogout={handleLogout} userId={session?.user?.id} />;

    case 'SAAS_DASHBOARD':
      return <SaaS initialView="DASHBOARD" onLogout={handleLogout} userId={session?.user?.id} />;

    case 'AFFILIATE_ONBOARDING':
      return <Affiliate initialView="ONBOARDING" onLogout={handleLogout} userId={session?.user?.id} />;

    case 'AFFILIATE_DASHBOARD':
      return <Affiliate initialView="DASHBOARD" onLogout={handleLogout} userId={session?.user?.id} />;

    default:
      return <Landing onNavigate={navigate} />;
  }
};

const CopyIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
);

interface AuthScreenProps {
  role: UserRole;
  isSignup: boolean;
  onBack: () => void;
  onSwitch: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ role, isSignup, onBack, onSwitch }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      localStorage.setItem('partnerz_intended_role', role);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
      
    } catch (err: any) {
      console.error("Login failed:", err);
      if (err.message?.includes("missing OAuth secret") || (err.msg && err.msg.includes("missing OAuth secret"))) {
        setError("⚠️ Config Error: Google Login is missing keys. See Troubleshooting below.");
      } else {
        setError(err.message || "Authentication failed. Please check console.");
      }
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      localStorage.setItem('partnerz_intended_role', role);

      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: role
            }
          }
        });
        if (error) throw error;
        
        if (data.session) {
           // Auto logged in
        } else if (data.user) {
           setMessage("Account created! Please check your email inbox to confirm your account before logging in.");
           setIsLoading(false);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }

    } catch (err: any) {
      console.error("Email auth failed:", err);
      
      let errMsg = err.message || "Authentication failed.";
      
      if (errMsg.includes("Email not confirmed")) {
        errMsg = "Please verify your email address. Check your inbox (and spam folder) for the confirmation link.";
      } else if (errMsg.includes("Invalid login credentials")) {
        errMsg = "Invalid email or password. Please try again.";
      }

      setError(errMsg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.3)] border border-white/10 max-w-md w-full overflow-hidden relative z-10 flex flex-col">
        <div className="p-8 text-center">
           <div className="flex justify-center mb-6">
              <Logo className="text-2xl" onClick={onBack} />
           </div>
           
           <h2 className="text-2xl font-bold text-white mb-2">
             {isSignup ? "Sign Up" : "Sign In"}
           </h2>
           <p className="text-slate-400 mb-6 text-sm">
             {isSignup ? `Start your ${role === UserRole.SAAS ? 'SaaS' : 'Partner'} journey.` : `Sign in to your ${role === UserRole.SAAS ? 'SaaS' : 'Partner'} portal.`}
           </p>

           {error && (
             <div className="mb-6 p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-left animate-fade-in-up">
               <div className="flex items-start gap-3">
                 <div className="text-red-400 mt-0.5 flex-shrink-0">⚠️</div>
                 <p className="text-red-200 text-xs leading-relaxed font-medium">{error}</p>
               </div>
             </div>
           )}

           {message && (
             <div className="mb-6 p-3 bg-emerald-900/30 border border-emerald-500/30 rounded-lg text-left animate-fade-in-up">
               <div className="flex items-start gap-3">
                 <div className="text-emerald-400 mt-0.5 flex-shrink-0">✓</div>
                 <p className="text-emerald-200 text-xs leading-relaxed font-medium">{message}</p>
               </div>
             </div>
           )}

           <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
              <Input 
                type="email" 
                placeholder="Email address" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                className="bg-slate-950/50"
              />
              <Input 
                type="password" 
                placeholder="Password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                className="bg-slate-950/50"
                minLength={6}
              />
              <Button type="submit" variant="glow" className="w-full" isLoading={isLoading}>
                {isSignup ? "Create Account" : "Sign In"}
              </Button>
           </form>

           <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900/80 text-slate-500">Or continue with</span>
              </div>
           </div>

           <button 
             onClick={handleGoogleClick}
             disabled={isLoading}
             className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-4 rounded-xl transition-all focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg text-sm"
           >
             {isLoading ? (
               <div className="h-5 w-5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>
             ) : (
               <GoogleIcon className="h-5 w-5" />
             )}
             <span>Google</span>
           </button>

           <div className="mt-6 text-[10px] text-slate-500">
             By clicking continue, you agree to our <a href="#" className="underline hover:text-white transition-colors">Terms of Service</a> and <a href="#" className="underline hover:text-white transition-colors">Privacy Policy</a>.
           </div>

           <div className="mt-4 border-t border-slate-800 pt-4">
              <button 
                onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                className="flex items-center justify-center w-full text-xs text-slate-500 hover:text-indigo-400 transition-colors gap-1"
                type="button"
              >
                <HelpCircle className="w-3 h-3" />
                Auth Troubleshooting
                {showTroubleshooting ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
              </button>
              
              {showTroubleshooting && (
                <div className="mt-3 text-left bg-slate-950/50 p-3 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-2">
                  <p className="font-bold text-slate-300">Common Errors:</p>
                   <div>
                    <span className="text-indigo-400 font-medium">Validation Failed:</span>
                    <p className="mt-0.5">Ensure you entered a valid email. Passwords must be at least 6 characters.</p>
                  </div>
                   <div>
                    <span className="text-indigo-400 font-medium">Email not confirmed:</span>
                    <p className="mt-0.5">You must click the link sent to your email before you can log in.</p>
                  </div>
                  <div>
                    <span className="text-red-400 font-medium">Google Error 403:</span>
                    <p className="mt-0.5">Project in "Testing" mode? Click <strong>"Publish App"</strong> in Google Cloud.</p>
                  </div>
                   <div>
                    <span className="text-amber-400 font-medium">DB Error:</span>
                    <p className="mt-0.5">If the screen says "Table missing", run the SQL script provided on the error screen.</p>
                  </div>
                </div>
              )}
           </div>
        </div>
        <div className="bg-slate-900/80 px-8 py-4 border-t border-white/5 text-center flex flex-col gap-2">
          <button onClick={onSwitch} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            {isSignup ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
          <button onClick={onBack} className="text-xs text-slate-500 hover:text-white transition-colors">
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

const GoogleIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.23856)">
      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.059 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.734 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
    </g>
  </svg>
);

export default App;
