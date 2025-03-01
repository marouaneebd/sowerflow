import { adminDb } from '@/lib/firebase-admin';

export async function initializeProfile(stripeCustomerId: string, uid: string, email: string): Promise<void> {
  const profileRef = adminDb.collection('profiles').doc(uid);
  await profileRef.set({
    uuid: uid,
    email: email,
    subscription: {
      plan: 'trial',
      stripe_customer_id: stripeCustomerId,
      credits_used: 0,
      end_date: new Date(new Date().setHours(0, 0, 0, 0))
    }
  });
}

export async function getStripeCustomerId(uid: string): Promise<string | null> {
  try {
    const profileRef = adminDb.collection('profiles').doc(uid);
    const profile = await profileRef.get();
    
    if (profile.exists) {
      const data = profile.data();
      return data?.subscription?.stripe_customer_id || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting Stripe customer ID:', error);
    return null;
  }
} 