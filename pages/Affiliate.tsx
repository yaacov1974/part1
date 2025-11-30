
import React, { useState } from 'react';
import { LayoutDashboard, Link as LinkIcon, Download, CreditCard, LogOut, Copy, Search, User, Globe, Users, CheckCircle2, ChevronRight, UploadCloud } from 'lucide-react';
import { Button, Card, Badge, Input, Logo } from '../components/UI';
import { MOCK_PAYOUTS } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AffiliateProfileData } from '../types';
import { createAffiliateProfile, updateOnboardingStatus } from '../lib/supabase';

interface AffiliateProps {
  onLogout: () => void;
  userId?: string;
  initialView?: 'ONBOARDING' | 'DASHBOARD';
}

export const Affiliate: React.FC<AffiliateProps> = ({ onLogout, userId, initialView = 'DASHBOARD' }) => {
  const [mode, setMode] = useState<'ONBOARDING' | 'DASHBOARD'>(initialView);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'LINKS' | 'PAYMENTS'>('DASHBOARD');

  // --- ONBOARDING STATE ---
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<AffiliateProfileData>({
    fullName: '',
    publicName: '',
    bio: '',
    niches: [],
    trafficSources: [],
    socials: {},
    audience: {},
    preferredSaaS: [],
    currency: 'USD',
    stripeConnected: false
  });

  // --- HANDLERS ---
  const updateData = (field: keyof AffiliateProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedData = (section: 'socials' | 'audience', field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const toggleSelection = (field: 'niches' | 'trafficSources' | 'preferredSaaS', value: string) => {
    setProfileData(prev => {
      const current = prev[field];
      const exists = current.includes(value);
      return {
        ...prev,
        [field]: exists ? current.filter(item => item !== value) : [...current, value]
      };
    });
  };

  const handleFinishOnboarding = async () => {
    setIsSaving(true);
    try {
      if (userId) {
        // 1. Save detailed profile data to dedicated table
        const { error: profileError } = await createAffiliateProfile(userId, profileData);
        
        if (profileError) {
          console.error("Failed to create affiliate profile:", profileError);
          alert("Error saving profile details. Please check if the 'affiliate_profiles' table exists in Supabase.");
          return;
        }

        // 2. Mark onboarding as complete in the main profiles table
        await updateOnboardingStatus(userId, true);
      }
      setMode('DASHBOARD');
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("Something went wrong. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- ONBOARDING RENDER ---
  if (mode === 'ONBOARDING') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center pt-10 pb-10">
        <div className="w-full max-w-3xl px-4">
          <div className="flex justify-between items-center mb-8">
            <Logo onClick={onLogout} />
            <div className="text-sm text-slate-500 font-medium tracking-wide">AFFILIATE SETUP</div>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-1.5 mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-1.5 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" style={{ width: `${(step / 4) * 100}%` }}></div>
          </div>

          <Card className="p-8 border-slate-800">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Identity & Branding</h2>
                  <p className="text-slate-400 mt-2">How should we display you in the Partnerz directory?</p>
                </div>
                
                <div className="flex items-center gap-6 mb-4">
                  <div className="w-20 h-20 bg-slate-900 rounded-full flex flex-col items-center justify-center border-2 border-dashed border-slate-700 text-slate-500 cursor-pointer hover:border-violet-500 hover:text-violet-500 transition-colors">
                    <UploadCloud className="h-6 w-6 mb-1" />
                    <span className="text-[10px]">Upload</span>
                  </div>
                  <div>
                     <h3 className="text-white font-medium">Profile Photo / Logo</h3>
                     <p className="text-xs text-slate-500">Recommended 400x400px</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="Full Legal Name" 
                    placeholder="e.g. John Doe"
                    value={profileData.fullName}
                    onChange={(e) => updateData('fullName', e.target.value)}
                  />
                  <Input 
                    label="Public Nickname / Handle" 
                    placeholder="e.g. SaaSReviewer"
                    value={profileData.publicName}
                    onChange={(e) => updateData('publicName', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">Short Bio (1-2 lines)</label>
                  <textarea 
                    className="block w-full bg-slate-950/50 rounded-lg border border-slate-800 shadow-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-slate-200 placeholder-slate-600 sm:text-sm px-3 py-2.5 transition-colors"
                    rows={3}
                    placeholder="I help startups grow through content and SEO..."
                    value={profileData.bio}
                    onChange={(e) => updateData('bio', e.target.value)}
                  />
                </div>

                <div className="flex justify-end mt-6">
                   <Button variant="glow" onClick={() => setStep(2)} disabled={!profileData.fullName}>Next: Reach & Niche</Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Focus & Reach</h2>
                  <p className="text-slate-400 mt-2">Help us match you with the best SaaS programs.</p>
                </div>

                {/* Niches */}
                <div>
                   <label className="block text-sm font-bold text-white mb-3">Your Marketing Niches</label>
                   <div className="flex flex-wrap gap-2">
                     {['AI', 'SaaS', 'Productivity', 'Marketing', 'Finance', 'E-commerce', 'Developers', 'Design'].map(niche => (
                       <button
                         key={niche}
                         onClick={() => toggleSelection('niches', niche)}
                         className={`px-4 py-2 rounded-full text-sm border transition-all ${profileData.niches.includes(niche) ? 'bg-violet-600/20 border-violet-500 text-violet-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                       >
                         {niche}
                       </button>
                     ))}
                   </div>
                </div>

                {/* Traffic Sources */}
                <div>
                   <label className="block text-sm font-bold text-white mb-3">Main Traffic Sources</label>
                   <div className="flex flex-wrap gap-2">
                     {['TikTok', 'YouTube', 'Instagram', 'Blog/SEO', 'Email List', 'Paid Ads', 'Twitter/X', 'LinkedIn'].map(source => (
                       <button
                         key={source}
                         onClick={() => toggleSelection('trafficSources', source)}
                         className={`px-4 py-2 rounded-full text-sm border transition-all ${profileData.trafficSources.includes(source) ? 'bg-fuchsia-600/20 border-fuchsia-500 text-fuchsia-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                       >
                         {source}
                       </button>
                     ))}
                   </div>
                </div>

                {/* Social Links */}
                <div>
                   <label className="block text-sm font-bold text-white mb-3">Key Links</label>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input 
                        placeholder="YouTube Channel URL" 
                        icon={<Globe className="h-4 w-4"/>} 
                        value={profileData.socials.youtube || ''}
                        onChange={(e) => updateNestedData('socials', 'youtube', e.target.value)}
                      />
                      <Input 
                        placeholder="TikTok Handle" 
                        icon={<span className="font-bold">@</span>} 
                        value={profileData.socials.tiktok || ''}
                        onChange={(e) => updateNestedData('socials', 'tiktok', e.target.value)}
                      />
                      <Input 
                        placeholder="Instagram" 
                        icon={<span className="font-bold">@</span>} 
                        value={profileData.socials.instagram || ''}
                        onChange={(e) => updateNestedData('socials', 'instagram', e.target.value)}
                      />
                      <Input 
                        placeholder="Website / Blog" 
                        icon={<Globe className="h-4 w-4"/>} 
                        value={profileData.socials.website || ''}
                        onChange={(e) => updateNestedData('socials', 'website', e.target.value)}
                      />
                   </div>
                </div>

                <div className="flex justify-between mt-6">
                   <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                   <Button variant="glow" onClick={() => setStep(3)}>Next: Audience Stats</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Audience & Preferences</h2>
                  <p className="text-slate-400 mt-2">Give brands an idea of your scale.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input 
                    label="Followers / Subscribers" 
                    placeholder="e.g. 15k"
                    value={profileData.audience.subscribers || ''}
                    onChange={(e) => updateNestedData('audience', 'subscribers', e.target.value)}
                  />
                  <Input 
                    label="Email List Size" 
                    placeholder="e.g. 5,000"
                    value={profileData.audience.emailList || ''}
                    onChange={(e) => updateNestedData('audience', 'emailList', e.target.value)}
                  />
                  <Input 
                    label="Monthly Traffic" 
                    placeholder="e.g. 50k visits"
                    value={profileData.audience.monthlyTraffic || ''}
                    onChange={(e) => updateNestedData('audience', 'monthlyTraffic', e.target.value)}
                  />
                </div>

                <div>
                   <label className="block text-sm font-bold text-white mb-3">Which SaaS tools do you prefer to promote?</label>
                   <div className="grid grid-cols-2 gap-3">
                     {['AI Tools & Generators', 'Business & CRM', 'Creator Tools', 'Productivity Apps', 'DevTools', 'Marketing Platforms'].map(type => (
                       <label key={type} className="flex items-center p-3 rounded-lg border border-slate-800 bg-slate-900/50 cursor-pointer hover:bg-slate-800 transition-colors">
                         <input 
                           type="checkbox"
                           className="form-checkbox h-4 w-4 text-violet-600 rounded border-slate-700 bg-slate-900 focus:ring-violet-500"
                           checked={profileData.preferredSaaS.includes(type)}
                           onChange={() => toggleSelection('preferredSaaS', type)}
                         />
                         <span className="ml-3 text-sm text-slate-300">{type}</span>
                       </label>
                     ))}
                   </div>
                </div>

                <div className="flex justify-between mt-6">
                   <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                   <Button variant="glow" onClick={() => setStep(4)}>Next: Payments</Button>
                </div>
              </div>
            )}

            {step === 4 && (
               <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Get Paid</h2>
                  <p className="text-slate-400 mt-2">Connect your payout method securely.</p>
                </div>

                <div className="bg-slate-950/30 p-8 rounded-xl border border-slate-800 text-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/5 to-transparent pointer-events-none"></div>

                  {!profileData.stripeConnected ? (
                    <>
                      <div className="mx-auto w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center shadow-lg mb-6 border border-slate-800">
                        <CreditCard className="h-8 w-8 text-fuchsia-400" />
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">Stripe Connect Express</h3>
                      <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto leading-relaxed">
                        We use Stripe to ensure you get paid fast. Stripe handles all tax forms and identity verification.
                      </p>
                      
                      <div className="flex justify-center mb-8">
                        <select 
                          className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-fuchsia-500 focus:border-fuchsia-500 block p-2.5"
                          value={profileData.currency}
                          onChange={(e) => updateData('currency', e.target.value)}
                        >
                          <option value="USD">USD ($) - US Dollar</option>
                          <option value="EUR">EUR (€) - Euro</option>
                          <option value="GBP">GBP (£) - British Pound</option>
                          <option value="ILS">ILS (₪) - Israeli Shekel</option>
                        </select>
                      </div>

                      <Button 
                        size="lg" 
                        onClick={() => {
                          setIsSaving(true);
                          setTimeout(() => {
                             updateData('stripeConnected', true);
                             setIsSaving(false);
                          }, 1500);
                        }} 
                        isLoading={isSaving}
                        className="bg-[#635BFF] hover:bg-[#5851df] text-white border-none shadow-[0_0_15px_rgba(99,91,255,0.4)]"
                      >
                        Start Stripe Onboarding
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center animate-fade-in-up">
                       <div className="w-16 h-16 bg-emerald-900/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
                         <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                       </div>
                       <h3 className="text-lg font-bold text-emerald-400 mb-2">Payouts Active</h3>
                       <p className="text-slate-400 text-sm mb-6">Your Stripe Express account is ready.</p>
                       <Button variant="outline" size="sm" onClick={() => updateData('stripeConnected', false)}>Manage Settings</Button>
                    </div>
                  )}
                </div>

                <div className="flex justify-between mt-6">
                   <Button variant="ghost" onClick={() => setStep(3)}>Back</Button>
                   <Button variant="glow" onClick={handleFinishOnboarding} disabled={!profileData.stripeConnected} isLoading={isSaving}>Complete Setup</Button>
                </div>
               </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // --- DASHBOARD RENDER ---
  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/50 border-r border-slate-800 fixed h-full z-10 hidden md:block backdrop-blur-md">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 cursor-pointer" onClick={onLogout}>
           <div className="flex items-center gap-2 font-bold text-xl text-white">
              <div className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white p-1 rounded-lg shadow-lg shadow-indigo-500/30">P</div>
              Partnerz.ai
            </div>
        </div>
        <nav className="p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('DASHBOARD')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'DASHBOARD' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('LINKS')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'LINKS' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <LinkIcon className="h-5 w-5" />
            <span>Referral Links</span>
          </button>
          <button 
            onClick={() => setActiveTab('PAYMENTS')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'PAYMENTS' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <CreditCard className="h-5 w-5" />
            <span>Payments</span>
          </button>
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="ghost" className="w-full justify-start text-red-400 hover:bg-red-900/20 hover:text-red-300" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8">
         <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {activeTab === 'DASHBOARD' && 'Performance Overview'}
              {activeTab === 'LINKS' && 'Your Referral Assets'}
              {activeTab === 'PAYMENTS' && 'Payout History'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">You've earned <span className="text-emerald-400 font-bold">$240.00</span> this month!</p>
          </div>
          <div className="flex items-center space-x-3">
             <span className="text-sm font-medium text-slate-400">Alex Johnson</span>
             <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 border border-white/10 flex items-center justify-center text-white font-bold shadow-lg">AJ</div>
          </div>
        </header>

        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-5 bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                 <p className="text-indigo-100 text-xs font-medium uppercase tracking-wider">Unpaid Earnings</p>
                 <p className="text-3xl font-bold mt-2">$480.00</p>
                 <p className="text-xs text-indigo-200 mt-2 bg-white/10 inline-block px-2 py-1 rounded">Next payout: Nov 1st</p>
              </Card>
              <Card className="p-5">
                 <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Lifetime Earnings</p>
                 <p className="text-2xl font-bold mt-2 text-white">$12,450</p>
              </Card>
              <Card className="p-5">
                 <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Clicks (30d)</p>
                 <p className="text-2xl font-bold mt-2 text-white">1,240</p>
              </Card>
              <Card className="p-5">
                 <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Conversions</p>
                 <p className="text-2xl font-bold mt-2 text-white">42</p>
              </Card>
            </div>

            <Card className="p-8 h-96 border-slate-800">
               <h3 className="text-lg font-bold text-white mb-6">Earnings History</h3>
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={[
                    { name: 'Mon', value: 12 },
                    { name: 'Tue', value: 19 },
                    { name: 'Wed', value: 3 },
                    { name: 'Thu', value: 25 },
                    { name: 'Fri', value: 42 },
                    { name: 'Sat', value: 10 },
                    { name: 'Sun', value: 20 },
                 ]}>
                    <defs>
                      <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#475569" axisLine={false} tickLine={false} />
                    <YAxis stroke="#475569" axisLine={false} tickLine={false} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#a78bfa' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fill="#8b5cf6" fillOpacity={1} style={{ fill: 'url(#colorEarnings)' }} />
                 </AreaChart>
               </ResponsiveContainer>
            </Card>
          </div>
        )}

        {activeTab === 'LINKS' && (
           <div className="space-y-6">
             <div className="flex gap-4 mb-6">
               <Input placeholder="Search programs..." className="max-w-md" icon={<Search className="h-4 w-4 text-slate-500" />} />
             </div>

             <div className="space-y-4">
               {[1, 2, 3].map((i) => (
                 <Card key={i} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-slate-800 hover:border-indigo-500/30 transition-colors">
                    <div className="flex items-start gap-5">
                       <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800 shadow-inner">
                          <span className="font-bold text-indigo-400">P{i}</span>
                       </div>
                       <div>
                         <h3 className="font-bold text-white text-lg">Acme SaaS Tool {i}</h3>
                         <div className="flex items-center gap-3 mt-1">
                            <Badge variant="accent">20% Recurring</Badge>
                            <span className="text-sm text-slate-500">60 Day Cookie</span>
                         </div>
                         
                         <div className="flex items-center gap-2 bg-slate-950/50 px-3 py-2 rounded-lg border border-slate-800 mt-3 max-w-md">
                           <code className="text-xs text-slate-300 font-mono flex-1">https://partnerz.ai/ref/alex/{i}</code>
                           <button className="text-indigo-400 hover:text-white transition-colors" onClick={() => alert("Copied!")}><Copy className="h-3 w-3"/></button>
                         </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button variant="secondary" size="sm"><Download className="h-4 w-4 mr-2"/> Assets</Button>
                      <Button size="sm" variant="glow">Custom Link</Button>
                    </div>
                 </Card>
               ))}
             </div>
           </div>
        )}

        {activeTab === 'PAYMENTS' && (
          <div className="space-y-6">
             <Card className="p-6 bg-slate-900/30 border-slate-800">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                      <CreditCard className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Payout Method</h3>
                      <p className="text-sm text-slate-500">Connected via Stripe Connect</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">Manage on Stripe</Button>
                </div>
             </Card>

             <Card className="border-slate-800 overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/30">
                 <h3 className="font-bold text-white">Payout History</h3>
               </div>
               <table className="min-w-full divide-y divide-slate-800">
                 <thead className="bg-slate-900/50">
                   <tr>
                     <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                     <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                     <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Method</th>
                     <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-800 bg-slate-900/20">
                   {MOCK_PAYOUTS.map(p => (
                     <tr key={p.id} className="hover:bg-slate-800/30">
                       <td className="px-6 py-4 text-sm text-slate-400">{p.date}</td>
                       <td className="px-6 py-4 text-sm font-medium text-white">{p.amount}</td>
                       <td className="px-6 py-4 text-sm text-slate-400 flex items-center gap-2">
                         <CreditCard className="h-3 w-3 text-slate-500"/> {p.method}
                       </td>
                       <td className="px-6 py-4">
                         <Badge variant="success">{p.status}</Badge>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </Card>
          </div>
        )}
      </main>
    </div>
  );
};
