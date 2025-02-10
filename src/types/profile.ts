export interface InstagramProfile {
  username: string;
  userId: string;
  biography?: string;
  permissions?: string[];
  accessToken: string;
  tokenExpires: string;
  lastUpdated: string;
}

export interface OnboardingForm {
  product?: string;
  offer?: string;
  pricing?: Array<{ name: string; price: number }>;
  callInfo?: string;
  calendly?: string;
}

export interface ProfileData {
  onboardingForm?: OnboardingForm;
  instagram?: InstagramProfile;
  plan?: 'free' | 'pro' | 'enterprise';
  createdAt?: string;
  lastUpdated?: string;
}