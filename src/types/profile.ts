export interface InstagramProfile {
  username: string;
  userId: string;
  biography?: string;
  permissions?: string[];
  access_token: string;
  token_expires: string;
  updated_at: string;
}

export interface OnboardingForm {
  product?: string;
  offer?: string;
  pricing?: Array<{ name: string; price: number }>;
  call_info?: string;
  calendly?: string;
  status?: 'pending' | 'finished';
}

export interface Profile {
  uuid: string;
  onboarding_form?: OnboardingForm;
  instagram?: InstagramProfile;
  plan?: 'trial' | 'standard';
  created_at?: string;
  updated_at?: string;
  stripe_customer_id?: string;
  subscription_end_date?: string;
  is_active?: boolean;
  credits_used?: number;
}