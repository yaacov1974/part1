
export type ViewState = 'LANDING' | 'SAAS_LOGIN' | 'SAAS_SIGNUP' | 'SAAS_DASHBOARD' | 'SAAS_ONBOARDING' | 'AFFILIATE_LOGIN' | 'AFFILIATE_SIGNUP' | 'AFFILIATE_DASHBOARD' | 'AFFILIATE_ONBOARDING';

export enum UserRole {
  SAAS = 'SAAS',
  AFFILIATE = 'AFFILIATE'
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  onboarding_complete: boolean;
  metadata?: any;
  created_at?: string;
}

export interface AffiliateProfileData {
  fullName: string;
  publicName: string;
  bio: string;
  niches: string[];
  trafficSources: string[];
  socials: {
    youtube?: string;
    tiktok?: string;
    instagram?: string;
    website?: string;
  };
  audience: {
    subscribers?: string;
    emailList?: string;
    monthlyTraffic?: string;
  };
  preferredSaaS: string[];
  currency: string;
  stripeConnected: boolean;
}

export interface NavItem {
  label: string;
  view: ViewState;
  icon?: any;
}

export interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: any;
}

export enum CommissionType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED'
}

export interface ProgramConfig {
  name: string;
  description: string;
  commissionType: CommissionType;
  commissionValue: number;
  cookieDays: number;
  isRecurring: boolean;
  termsAccepted: boolean;
}
