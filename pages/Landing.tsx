import React, { useState } from 'react';
import { ChevronRight, CheckCircle2, DollarSign, BarChart3, Globe2, ShieldCheck, ArrowRight, Menu, X, Zap, Sparkles, Layers, Users, Star } from 'lucide-react';
import { ViewState } from '../types';
import { Button, Logo, Card, Badge } from '../components/UI';
import { FEATURES_SAAS, FEATURES_AFFILIATE, FEATURED_SAAS, FEATURED_PARTNERS } from '../constants';

interface LandingProps {
  onNavigate: (view: ViewState) => void;
}

export const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Robust scrolling function that handles header offset
  const scrollToSection = (e: React.MouseEvent<HTMLElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80; // Height of sticky header + buffer
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative selection:bg-indigo-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-900/20 rounded-full blur-[128px]"></div>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-900/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Logo onClick={() => onNavigate('LANDING')} />
            <div className="hidden md:flex space-x-8 items-center">
              <button onClick={(e) => scrollToSection(e, 'how-it-works')} className="text-slate-400 hover:text-white transition-colors text-sm font-medium focus:outline-none">How It Works</button>
              <button onClick={(e) => scrollToSection(e, 'ecosystem')} className="text-slate-400 hover:text-white transition-colors text-sm font-medium focus:outline-none">Ecosystem</button>
              <button onClick={(e) => scrollToSection(e, 'features')} className="text-slate-400 hover:text-white transition-colors text-sm font-medium focus:outline-none">Features</button>
              <div className="flex items-center space-x-3 ml-4">
                <Button variant="ghost" size="sm" onClick={() => onNavigate('AFFILIATE_LOGIN')}>Affiliate Sign In</Button>
                <Button variant="secondary" size="sm" onClick={() => onNavigate('SAAS_LOGIN')}>SaaS Sign In</Button>
              </div>
            </div>
            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-400 hover:text-white">
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-4">
            <button onClick={(e) => scrollToSection(e, 'how-it-works')} className="block w-full text-left text-slate-400 hover:text-white">How It Works</button>
            <button onClick={(e) => scrollToSection(e, 'ecosystem')} className="block w-full text-left text-slate-400 hover:text-white">Ecosystem</button>
            <button onClick={(e) => scrollToSection(e, 'features')} className="block w-full text-left text-slate-400 hover:text-white">Features</button>
            <div className="pt-4 border-t border-slate-800 flex flex-col space-y-2">
               <Button variant="ghost" className="w-full justify-start" onClick={() => onNavigate('AFFILIATE_LOGIN')}>Affiliate Sign In</Button>
               <Button variant="secondary" className="w-full justify-start" onClick={() => onNavigate('SAAS_LOGIN')}>SaaS Sign In</Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-8 border border-indigo-500/20 backdrop-blur-sm animate-fade-in-up">
            <span className="flex h-1.5 w-1.5 bg-indigo-400 rounded-full mr-2 shadow-[0_0_10px_rgba(129,140,248,0.8)]"></span>
            The Future of SaaS Partnerships
          </div>
          
          <h1 className="text-5xl md:text-8xl font-bold text-white tracking-tight mb-8 leading-[1.1]">
            Start for Free, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 animate-gradient-x">
              Pay as You Sell
            </span>
          </h1>
          
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-400 mb-10 leading-relaxed">
            The next-gen affiliate network built exclusively for SaaS. Automated recurring commissions, seamless Stripe integration, and AI-powered insights.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" variant="glow" onClick={() => onNavigate('SAAS_SIGNUP')} className="group">
              For SaaS Brands <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => onNavigate('AFFILIATE_SIGNUP')}>
              For Affiliates
            </Button>
          </div>
          
          {/* Social Proof */}
          <div className="mt-20 pt-10 border-t border-white/5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-8">Powering Next-Gen SaaS Companies</p>
            <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="font-bold text-2xl text-white flex items-center gap-2"><div className="w-6 h-6 bg-white rounded-full"></div>Acme.inc</div>
              <div className="font-bold text-2xl text-white flex items-center gap-2"><div className="w-6 h-6 bg-white rounded-sm"></div>Globex</div>
              <div className="font-bold text-2xl text-white flex items-center gap-2"><div className="w-6 h-6 border-2 border-white rounded-full"></div>Soylent</div>
              <div className="font-bold text-2xl text-white flex items-center gap-2"><div className="w-6 h-6 bg-white rotate-45"></div>Umbrella</div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props / How It Works */}
      <section id="how-it-works" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-sm text-indigo-400 font-bold tracking-widest uppercase mb-2">Workflow</h2>
            <p className="text-4xl font-bold text-white">
              Autonomous Partnership Engine
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent z-0"></div>

            <Card className="relative z-10 p-8 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                <Globe2 className="h-8 w-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-3">1. Connect</h3>
              <p className="text-slate-400 text-center text-sm leading-relaxed">SaaS brands sync their Stripe account instantly. Set rules like 20% recurring revenue share.</p>
            </Card>

            <Card className="relative z-10 p-8 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                <BarChart3 className="h-8 w-8 text-violet-400" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-3">2. Promote</h3>
              <p className="text-slate-400 text-center text-sm leading-relaxed">Affiliates access unique links. We track every click, conversion, and churn event in real-time.</p>
            </Card>

            <Card className="relative z-10 p-8 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                <DollarSign className="h-8 w-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-3">3. Payout</h3>
              <p className="text-slate-400 text-center text-sm leading-relaxed">Commissions are calculated automatically and paid out via Stripe Connect. Zero manual work.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Ecosystem Section (New) */}
      <section id="ecosystem" className="py-24 relative border-t border-white/5 bg-slate-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
             <div className="inline-flex items-center px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-medium mb-6 border border-teal-500/20">
               <Globe2 className="w-3 h-3 mr-2" /> Global Network
             </div>
             <h2 className="text-4xl font-bold text-white mb-4">A Thriving Ecosystem</h2>
             <p className="text-slate-400 max-w-2xl mx-auto">Join the fastest growing network of SaaS innovators and elite marketers.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            
            {/* Featured SaaS */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20"><Layers className="h-5 w-5"/></span>
                  Trending SaaS
                </h3>
                <button onClick={() => onNavigate('SAAS_SIGNUP')} className="text-indigo-400 text-sm font-medium hover:text-indigo-300 flex items-center">
                  View Directory <ArrowRight className="ml-1 h-3 w-3"/>
                </button>
              </div>
              <div className="space-y-4">
                {FEATURED_SAAS.map((saas, i) => (
                  <Card key={i} className="p-5 flex items-start gap-4 hover:border-indigo-500/30 transition-all hover:bg-slate-800/40 group cursor-pointer">
                     <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${saas.color} flex items-center justify-center shadow-lg text-white font-bold text-lg shrink-0`}>
                       {saas.name[0]}
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-start">
                         <div>
                            <h4 className="font-bold text-white truncate">{saas.name}</h4>
                            <p className="text-xs text-slate-500 mb-1">{saas.category}</p>
                         </div>
                         <Badge variant="accent">{saas.commission}</Badge>
                       </div>
                       <p className="text-sm text-slate-400 line-clamp-1 group-hover:text-slate-300 transition-colors">{saas.description}</p>
                     </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Featured Partners */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="p-2 bg-violet-500/10 rounded-lg text-violet-400 border border-violet-500/20"><Users className="h-5 w-5"/></span>
                  Top Partnerz
                </h3>
                <button onClick={() => onNavigate('AFFILIATE_SIGNUP')} className="text-violet-400 text-sm font-medium hover:text-violet-300 flex items-center">
                  Find Affiliates <ArrowRight className="ml-1 h-3 w-3"/>
                </button>
              </div>
              <div className="space-y-4">
                {FEATURED_PARTNERS.map((partner, i) => (
                  <Card key={i} className="p-5 flex items-center gap-4 hover:border-violet-500/30 transition-all hover:bg-slate-800/40 group cursor-pointer">
                     <div className="relative">
                        <img 
                          src={partner.image} 
                          alt={partner.name} 
                          className="w-12 h-12 rounded-full border border-slate-700 object-cover shrink-0" 
                        />
                        <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5">
                           <div className="bg-emerald-500 w-3 h-3 rounded-full border border-slate-950"></div>
                        </div>
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-center mb-1">
                          <h4 className="font-bold text-white truncate">{partner.name}</h4>
                          <div className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                             <Sparkles className="w-3 h-3 mr-1" /> {partner.stats}
                          </div>
                       </div>
                       <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors flex items-center gap-2">
                         <span className="text-slate-500">•</span> {partner.type}
                       </p>
                     </div>
                  </Card>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Dual Audience Features */}
      <section id="features" className="py-24 bg-slate-900/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* For SaaS */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20"><ShieldCheck className="h-6 w-6 text-indigo-400"/></div>
                 <h2 className="text-3xl font-bold text-white">For SaaS Brands</h2>
              </div>
              <p className="text-lg text-slate-400 mb-10">
                Scale your MRR with a performance-based army. Only pay when you get paid.
              </p>
              <div className="grid gap-4">
                {FEATURES_SAAS.map((f, i) => (
                  <div key={i} className="group p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 flex items-start">
                    <div className="mt-1 mr-4 flex-shrink-0">
                       <CheckCircle2 className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-200 mb-1">{f.title}</h3>
                      <p className="text-slate-500 text-sm group-hover:text-slate-400 transition-colors">{f.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10">
                <Button variant="glow" onClick={() => onNavigate('SAAS_SIGNUP')}>Launch Your Program <ArrowRight className="ml-2 h-4 w-4"/></Button>
              </div>
            </div>

            {/* For Affiliates */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-violet-500/10 rounded-lg border border-violet-500/20"><UsersIcon className="h-6 w-6 text-violet-400"/></div>
                 <h2 className="text-3xl font-bold text-white">For Partnerz</h2>
              </div>
               <p className="text-lg text-slate-400 mb-10">
                Partner with high-growth SaaS tools and build a passive recurring revenue stream.
              </p>
              <div className="grid gap-4">
                {FEATURES_AFFILIATE.map((f, i) => (
                  <div key={i} className="group p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 flex items-start">
                    <div className="mt-1 mr-4 flex-shrink-0">
                       <Zap className="h-5 w-5 text-violet-500 group-hover:text-violet-400 transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-200 mb-1">{f.title}</h3>
                      <p className="text-slate-500 text-sm group-hover:text-slate-400 transition-colors">{f.description}</p>
                    </div>
                  </div>
                ))}
              </div>
               <div className="mt-10">
                <Button variant="outline" onClick={() => onNavigate('AFFILIATE_SIGNUP')}>Start Promoting <ArrowRight className="ml-2 h-4 w-4"/></Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-auto bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Logo onClick={() => onNavigate('LANDING')} />
            <p className="text-xs text-slate-600 mt-4">© 2024 Partnerz.ai. All rights reserved.</p>
          </div>
          <div className="flex space-x-8 text-slate-500 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const UsersIcon: React.FC<{className?:string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);