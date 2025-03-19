import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { stripe } from '@/app/stripe';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

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
        is_active: false,
        stripe_customer_id: stripeCustomer.id,
        credits_used: 0,
        end_date: new Date(new Date().setHours(0, 0, 0, 0))
      },
      stop_setter: false
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
        description: "SowerFlow subscription"
      }
    );

    return NextResponse.json({ success: true, email });
  } catch (error) {
    console.error('Error in signUp:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 