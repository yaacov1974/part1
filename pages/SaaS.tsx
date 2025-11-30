
import React, { useState } from 'react';
import { LayoutDashboard, Users, CreditCard, Settings, LogOut, Check, Copy, ExternalLink, AlertTriangle } from 'lucide-react';
import { ViewState, ProgramConfig, CommissionType } from '../types';
import { Button, Card, Input, Logo, Badge } from '../components/UI';
import { MOCK_REVENUE_DATA, MOCK_AFFILIATES } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { updateOnboardingStatus, createSaaSProgram } from '../lib/supabase';

interface SaaSProps {
  initialView?: 'ONBOARDING' | 'DASHBOARD';
  onLogout: () => void;
  userId?: string;
}

export const SaaS: React.FC<SaaSProps> = ({ initialView = 'DASHBOARD', onLogout, userId }) => {
  const [mode, setMode] = useState<'ONBOARDING' | 'DASHBOARD'>(initialView);
  
  // Onboarding State
  const [step, setStep] = useState(1);
  const [programConfig, setProgramConfig] = useState<ProgramConfig>({
    name: '',
    description: '',
    commissionType: CommissionType.PERCENTAGE,
    commissionValue: 20,
    cookieDays: 60,
    isRecurring: true,
    termsAccepted: false
  });
  const [stripeConnected, setStripeConnected] = useState(false);
  const [isSimulatingConnection, setIsSimulatingConnection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Dashboard State
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AFFILIATES' | 'SETTINGS'>('OVERVIEW');

  const handleProgramChange = (field: keyof ProgramConfig, value: any) => {
    setProgramConfig(prev => ({ ...prev, [field]: value }));
  };

  const simulateStripeConnect = () => {
    setIsSimulatingConnection(true);
    setTimeout(() => {
      setIsSimulatingConnection(false);
      setStripeConnected(true);
    }, 2000);
  };

  const finishOnboarding = async () => {
    setIsSaving(true);
    try {
      if (userId) {
        // 1. Create the SaaS Program entry in the database
        const { error: programError } = await createSaaSProgram(userId, {
          ...programConfig,
          stripeConnected
        });

        if (programError) {
          console.error("Failed to create SaaS program:", programError);
          alert("Error saving program details. Please check console or try again.");
          return; // Don't complete onboarding if program save fails
        }

        // 2. Mark profile as onboarding complete
        await updateOnboardingStatus(userId, true);
      }
      setMode('DASHBOARD');
    } catch (e) {
      console.error("Failed to save onboarding status", e);
      // Fallback in case of critical error, though user might be stuck in loop without DB setup
      alert("Something went wrong. Please ensure your database tables are set up.");
    } finally {
      setIsSaving(false);
    }
  };

  if (mode === 'ONBOARDING') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center pt-10 pb-10">
        <div className="w-full max-w-3xl px-4">
          <div className="flex justify-between items-center mb-8">
            <Logo onClick={onLogout} />
            <div className="text-sm text-slate-500 font-medium tracking-wide">INITIAL SETUP</div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-900 rounded-full h-1.5 mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-1.5 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${(step / 4) * 100}%` }}></div>
          </div>

          <Card className="p-8 border-slate-800">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Define Your Program</h2>
                  <p className="text-slate-400 mt-2">What will affiliates see in our AI-driven directory?</p>
                </div>
                <div className="space-y-4">
                  <Input 
                    label="Program Name" 
                    placeholder="e.g. Acme SaaS Partner Program" 
                    value={programConfig.name}
                    onChange={(e) => handleProgramChange('name', e.target.value)}
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">Program Description</label>
                    <textarea 
                      className="block w-full bg-slate-950/50 rounded-lg border border-slate-800 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 placeholder-slate-600 sm:text-sm px-3 py-2.5 transition-colors"
                      rows={4}
                      placeholder="Describe your SaaS and why affiliates should promote it..."
                      value={programConfig.description}
                      onChange={(e) => handleProgramChange('description', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                   <Button variant="glow" onClick={() => setStep(2)} disabled={!programConfig.name}>Next: Commission Rules</Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Commission Structure</h2>
                  <p className="text-slate-400 mt-2">Incentivize your partners.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                      <label className="block text-sm font-semibold text-slate-300 mb-3">Commission Type</label>
                      <div className="flex space-x-4">
                        <button 
                          className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${programConfig.commissionType === CommissionType.PERCENTAGE ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-transparent border-slate-700 text-slate-500 hover:border-slate-500'}`}
                          onClick={() => handleProgramChange('commissionType', CommissionType.PERCENTAGE)}
                        >
                          Percentage (%)
                        </button>
                        <button 
                          className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${programConfig.commissionType === CommissionType.FIXED ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-transparent border-slate-700 text-slate-500 hover:border-slate-500'}`}
                          onClick={() => handleProgramChange('commissionType', CommissionType.FIXED)}
                        >
                          Fixed Amount ($)
                        </button>
                      </div>
                   </div>
                   
                   <div>
                     <Input 
                        type="number" 
                        label={programConfig.commissionType === CommissionType.PERCENTAGE ? "Commission Rate (%)" : "Amount ($)"}
                        value={programConfig.commissionValue}
                        onChange={(e) => handleProgramChange('commissionValue', parseFloat(e.target.value))}
                      />
                      <p className="text-xs text-slate-500 mt-2 ml-1">Market standard for SaaS is 20-30%.</p>
                   </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-indigo-900/10 rounded-lg border border-indigo-500/20">
                  <input 
                    type="checkbox" 
                    id="recurring" 
                    checked={programConfig.isRecurring} 
                    onChange={(e) => handleProgramChange('isRecurring', e.target.checked)}
                    className="h-4 w-4 bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 rounded"
                  />
                  <label htmlFor="recurring" className="text-sm font-medium text-slate-300">
                    Recurring Commission (Pay every month the customer stays)
                  </label>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">Cookie Window (Days)</label>
                   <select 
                      className="block w-full bg-slate-950/50 rounded-lg border border-slate-800 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 sm:text-sm px-3 py-2.5"
                      value={programConfig.cookieDays}
                      onChange={(e) => handleProgramChange('cookieDays', parseInt(e.target.value))}
                   >
                     <option value={30}>30 Days</option>
                     <option value={60}>60 Days</option>
                     <option value={90}>90 Days</option>
                   </select>
                </div>

                <div className="flex justify-between mt-6">
                   <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                   <Button variant="glow" onClick={() => setStep(3)}>Next: Financials</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Connect Stripe</h2>
                  <p className="text-slate-400 mt-2">We use Stripe Connect for automated billing.</p>
                </div>

                <div className="bg-slate-950/30 p-8 rounded-xl border border-slate-800 text-center relative overflow-hidden">
                   {/* Background element */}
                   <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>

                  {!stripeConnected ? (
                    <>
                      <div className="mx-auto w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center shadow-lg mb-6 border border-slate-800">
                        <CreditCard className="h-8 w-8 text-indigo-400" />
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">Connect your Stripe Account</h3>
                      <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto">
                        We never store your banking credentials.
                      </p>
                      <Button 
                        size="lg" 
                        onClick={simulateStripeConnect} 
                        isLoading={isSimulatingConnection}
                        className="bg-[#635BFF] hover:bg-[#5851df] text-white border-none shadow-[0_0_15px_rgba(99,91,255,0.4)]"
                      >
                        Connect with Stripe
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center animate-fade-in-up">
                       <div className="w-16 h-16 bg-emerald-900/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
                         <Check className="h-8 w-8 text-emerald-400" />
                       </div>
                       <h3 className="text-lg font-bold text-emerald-400 mb-2">Stripe Connected</h3>
                       <p className="text-slate-400 text-sm mb-6">Your account is ready.</p>
                       <Button variant="outline" size="sm" onClick={() => setStripeConnected(false)}>Disconnect</Button>
                    </div>
                  )}
                </div>

                <div className="flex justify-between mt-6">
                   <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                   <Button variant="glow" onClick={() => setStep(4)} disabled={!stripeConnected}>Next: Tracking</Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Install Tracking</h2>
                  <p className="text-slate-400 mt-2">Add this snippet to your SaaS app.</p>
                </div>

                <div className="bg-black rounded-lg p-4 font-mono text-sm text-slate-300 relative group overflow-x-auto border border-slate-800">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="secondary" onClick={() => alert("Copied!")}><Copy className="h-4 w-4"/></Button>
                  </div>
                  <code className="whitespace-pre text-indigo-300">
{`<script>
  window.partnerz = window.partnerz || [];
  function ptz(){partnerz.push(arguments);}
  ptz('init', '${userId ? userId.split('-')[0] : 'PROGRAM_ID'}');
  ptz('track', 'pageview');
</script>
<script async src="https://cdn.partnerz.ai/track.js"></script>`}
                  </code>
                </div>

                <div className="bg-amber-900/10 border border-amber-500/20 rounded-lg p-4 flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-400 text-sm">Webhook Configuration</h4>
                    <p className="text-amber-300/70 text-xs mt-1">
                      Configure your Stripe webhook to point to <code className="bg-amber-900/30 px-1 rounded">https://api.partnerz.ai/webhooks/stripe</code>.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-slate-800">
                   <Button variant="outline" onClick={() => alert("Simulating a test event... Success!")}>Test Tracking</Button>
                   <Button size="lg" variant="glow" onClick={finishOnboarding} isLoading={isSaving}>Launch Program 🚀</Button>
                </div>
              </div>
            )}

          </Card>
        </div>
      </div>
    );
  }

  // DASHBOARD VIEW
  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/50 border-r border-slate-800 fixed h-full z-10 hidden md:block backdrop-blur-md">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Logo className="text-lg" onClick={onLogout} />
        </div>
        <nav className="p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('OVERVIEW')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'OVERVIEW' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Overview</span>
          </button>
          <button 
            onClick={() => setActiveTab('AFFILIATES')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'AFFILIATES' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Users className="h-5 w-5" />
            <span>Affiliates</span>
          </button>
          <button 
            onClick={() => setActiveTab('SETTINGS')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'SETTINGS' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
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
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {activeTab === 'OVERVIEW' && 'Dashboard'}
              {activeTab === 'AFFILIATES' && 'Affiliate Management'}
              {activeTab === 'SETTINGS' && 'Program Settings'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">Acme Inc • SaaS Partner Program</p>
          </div>
          <div className="flex items-center space-x-3">
             <Button variant="outline" size="sm">Help & Support</Button>
             <div className="h-8 w-8 rounded-full bg-indigo-600/20 border border-indigo-500/50 flex items-center justify-center text-indigo-400 font-bold">
               A
             </div>
          </div>
        </header>

        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 relative overflow-hidden group">
                 <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl -mr-16 -mt-16 transition-opacity group-hover:opacity-75"></div>
                 <div className="flex items-center justify-between relative z-10">
                   <div>
                     <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Revenue</p>
                     <p className="text-3xl font-bold text-white mt-2">$124,500</p>
                   </div>
                   <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20"><DollarSignIcon className="h-6 w-6 text-emerald-400" /></div>
                 </div>
                 <div className="mt-4 flex items-center text-xs text-emerald-400 relative z-10">
                   <ArrowUpIcon className="h-3 w-3 mr-1" /> +12% vs last month
                 </div>
              </Card>
              <Card className="p-6 relative overflow-hidden">
                 <div className="absolute right-0 top-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                 <div className="flex items-center justify-between relative z-10">
                   <div>
                     <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Commission Due</p>
                     <p className="text-3xl font-bold text-white mt-2">$3,450</p>
                   </div>
                   <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20"><CreditCard className="h-6 w-6 text-indigo-400" /></div>
                 </div>
                 <div className="mt-4 relative z-10">
                   <Button size="sm" variant="outline" className="w-full h-8 text-xs">Process Payouts</Button>
                 </div>
              </Card>
              <Card className="p-6 relative overflow-hidden">
                 <div className="absolute right-0 top-0 w-32 h-32 bg-cyan-600/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                 <div className="flex items-center justify-between relative z-10">
                   <div>
                     <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Partners</p>
                     <p className="text-3xl font-bold text-white mt-2">42</p>
                   </div>
                   <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20"><Users className="h-6 w-6 text-cyan-400" /></div>
                 </div>
                 <div className="mt-4 flex items-center text-xs text-slate-500 relative z-10">
                   3 pending approvals
                 </div>
              </Card>
            </div>

            {/* Chart */}
            <Card className="p-8 h-[400px] border-slate-800">
               <h3 className="text-lg font-bold text-white mb-6">Revenue Trend</h3>
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={MOCK_REVENUE_DATA}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#475569" axisLine={false} tickLine={false} />
                    <YAxis stroke="#475569" axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#818cf8' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                 </AreaChart>
               </ResponsiveContainer>
            </Card>
          </div>
        )}

        {activeTab === 'AFFILIATES' && (
          <Card className="overflow-hidden border-slate-800">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/30">
               <Input placeholder="Search affiliates..." className="max-w-xs" />
               <Button size="sm" variant="glow">Invite Affiliate</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Affiliate</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Unpaid Comm.</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-slate-900/20 divide-y divide-slate-800">
                  {MOCK_AFFILIATES.map(aff => (
                    <tr key={aff.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-400">{aff.name[0]}</div>
                          <div className="ml-4 text-sm font-medium text-white">{aff.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={aff.status === 'Active' ? 'success' : aff.status === 'Pending' ? 'warning' : 'neutral'}>
                          {aff.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{aff.revenue}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">{aff.commission}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-indigo-400 hover:text-indigo-300">Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'SETTINGS' && (
          <div className="max-w-2xl">
            <Card className="p-8 space-y-8 border-slate-800">
               <div>
                 <h3 className="text-lg font-medium leading-6 text-white border-b border-slate-800 pb-4 mb-6">Commission Rules</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Default Rate (%)" defaultValue="20" />
                    <Input label="Cookie Duration (Days)" defaultValue="60" />
                 </div>
               </div>
               
               <div>
                  <h3 className="text-lg font-medium leading-6 text-white border-b border-slate-800 pb-4 mb-6">Stripe Connection</h3>
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                     <div className="flex items-center">
                        <div className="bg-[#635BFF] p-2 rounded text-white mr-3 shadow-md">
                           <CreditCard size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Stripe Account</p>
                          <p className="text-xs text-slate-500">Connected: acct_123456789</p>
                        </div>
                     </div>
                     <Button size="sm" variant="secondary">Manage</Button>
                  </div>
               </div>

               <div className="pt-4 flex justify-end">
                 <Button variant="glow">Save Changes</Button>
               </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

const ArrowUpIcon: React.FC<{className?:string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
);
const DollarSignIcon: React.FC<{className?:string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);
