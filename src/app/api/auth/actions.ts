import { adminDb } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { stripe } from '@/app/stripe';

/**
 * Server action to create a new user account
 */
export async function signUp(email: string, password: string) {
  try {
    // Create the user with Firebase Admin
    const userRecord = await getAuth().createUser({
      email,
      password,
    });

    // Create Stripe customer
    const stripeCustomer = await stripe.customers.create({
      email,
    });

    // Initialize profile in Firestore
    const profileRef = adminDb.collection('profiles').doc(userRecord.uid);
    await profileRef.set({
      uuid: userRecord.uid,
      email: email,
      subscription: {
        plan: 'trial',
        stripe_customer_id: stripeCustomer.id,
        credits_used: 0,
        end_date: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });

    // Create subscription with 3-day trial
    const sub = await stripe.subscriptions.create({
      customer: stripeCustomer.id,
      items: [{ price: 'price_1Qj0cAIHyU82otGEuK5DNLDN' }],
      trial_period_days: 3,
    });

    await stripe.subscriptions.update(
      sub.id,
      {
        description: "Autobot subscription"
      }
    );

    return { success: true, email };
  } catch (error) {
    console.error('Error in signUp:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Initialize a new user profile in Firestore
 */
export async function initializeProfile(stripeCustomerId: string, uid: string, email: string): Promise<void> {
  try {
    const profileRef = adminDb.collection('profiles').doc(uid);
    const profileSnap = await profileRef.get();

    if (!profileSnap.exists) {
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
  } catch (error) {
    console.error('Error initializing profile:', error);
    throw error;
  }
}

/**
 * Get Stripe customer ID for a user
 */
export async function getStripeCustomerId(uid: string): Promise<string | null> {
  try {
    const profileRef = adminDb.collection('profiles').doc(uid);
    const profileSnap = await profileRef.get();

    if (profileSnap.exists) {
      const profileData = profileSnap.data();
      return profileData?.subscription?.stripe_customer_id || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting Stripe customer ID:', error);
    return null;
  }
} 