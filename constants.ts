
export const MOCK_REVENUE_DATA = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 2000 },
  { name: 'Apr', value: 2780 },
  { name: 'May', value: 1890 },
  { name: 'Jun', value: 2390 },
  { name: 'Jul', value: 3490 },
];

export const MOCK_AFFILIATES = [
  { id: 1, name: 'Alex Johnson', status: 'Active', revenue: '$1,200', commission: '$240', clicks: 450 },
  { id: 2, name: 'Sarah Smith', status: 'Pending', revenue: '$0', commission: '$0', clicks: 12 },
  { id: 3, name: 'Tech Reviewer Pro', status: 'Active', revenue: '$4,500', commission: '$900', clicks: 1200 },
  { id: 4, name: 'Growth Hacker Daily', status: 'Blocked', revenue: '$50', commission: '$10', clicks: 500 },
];

export const MOCK_PAYOUTS = [
  { id: 1, date: '2023-10-01', amount: '$240.00', status: 'Paid', method: 'Stripe' },
  { id: 2, date: '2023-09-01', amount: '$150.00', status: 'Paid', method: 'Stripe' },
];

export const FEATURES_SAAS = [
  { title: "Start for Free", description: "No upfront costs. You only pay when you make a sale." },
  { title: "Stripe Integration", description: "Automated payouts and billing via Stripe Connect." },
  { title: "Recurring Commissions", description: "Perfect for SaaS. Reward affiliates for subscription renewals." },
  { title: "Detailed Tracking", description: "Cookie-based attribution with fraud detection." }
];

export const FEATURES_AFFILIATE = [
  { title: "High Payouts", description: "Earn recurring revenue from top SaaS tools." },
  { title: "Direct Stripe Payouts", description: "Get paid directly to your bank account." },
  { title: "Real-time Dashboard", description: "Track every click and conversion as it happens." },
  { title: "Marketing Assets", description: "Access banners and swipe copy instantly." }
];

export const FEATURED_SAAS = [
  {
    name: "MailFlow AI",
    category: "Email Marketing",
    commission: "30% Recurring",
    description: "AI-powered email sequences for B2B founders.",
    color: "from-indigo-500 to-blue-500"
  },
  {
    name: "RankFast",
    category: "SEO Tool",
    commission: "$100 CPA",
    description: "Dominate search rankings with one click.",
    color: "from-emerald-500 to-teal-500"
  },
  {
    name: "DesignBot",
    category: "Creative",
    commission: "20% Lifetime",
    description: "Generate social media assets automatically.",
    color: "from-violet-500 to-fuchsia-500"
  }
];

export const FEATURED_PARTNERS = [
  {
    name: "TechCruncher",
    type: "Review Blog",
    stats: "$45k+ Earned",
    description: "Deep dive reviews of the latest SaaS tools.",
    initials: "TC",
    image: "https://images.unsplash.com/photo-1542596768-5d1d21f1cf72?w=150&h=150&fit=crop&crop=faces"
  },
  {
    name: "Sarah Vlogs",
    type: "Influencer",
    stats: "12k Clicks/mo",
    description: "Helping creators monetize their content.",
    initials: "SV",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces"
  },
  {
    name: "Growth Hackerz",
    type: "Agency",
    stats: "Elite Partner",
    description: "A community of 5000+ growth marketers.",
    initials: "GH",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop&crop=faces"
  }
];
