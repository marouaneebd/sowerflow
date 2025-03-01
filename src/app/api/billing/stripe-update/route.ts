import { stripe } from '@/app/stripe';
import { adminDb } from '@/lib/firebase-admin';
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { Profile } from '@/types/profile';

export async function POST(req: NextRequest) {
  let event: Stripe.Event;

  console.log('Stripe event received', req.body);

  try {
    const buf = await req.arrayBuffer();
    const body = Buffer.from(buf);
    const signature = req.headers.get('stripe-signature') as string;
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (err) {
    return NextResponse.json({ error: `Webhook Error: ${JSON.stringify(err)}` }, { status: 400 });
  }

  const subscription = event.data.object as Stripe.Subscription;
  const customerId = subscription.customer as string;
  const subscriptionEndDate = new Date(subscription.current_period_end * 1000);

  try {
    const profilesRef = adminDb.collection('profiles');
    const profileSnapshot = await profilesRef.where('stripe_customer_id', '==', customerId).get();

    if (profileSnapshot.empty) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profile = profileSnapshot.docs[0].data() as Profile;
    const profileDocRef = profilesRef.doc(profile.uuid);

    if (event.type === 'customer.subscription.deleted') {
      // If the subscription is deleted, deactivate the user's subscription
      await profileDocRef.update({
        subscription: {
          is_active: false,
          subscription_end_date: null
        }
      });
      return NextResponse.json({ message: 'Subscription updated successfully' }, { status: 200 });
    } else if (event.type === 'invoice.payment_failed') {
      // If a payment fails, deactivate the user's subscription
      await profileDocRef.update({
        subscription: {
          is_active: false,
          subscription_end_date: null
        }
      });
      return NextResponse.json({ message: 'Subscription updated successfully' }, { status: 200 });
    } else if (event.type === 'invoice.payment_succeeded') {
      // If a payment succeeds, ensure the user is marked as active and not in trial
      await profileDocRef.update({
        subscription: {
          is_active: true,
          subscription_end_date: subscriptionEndDate
        }
      });
      return NextResponse.json({ message: 'Subscription updated successfully' }, { status: 200 });
    }

    return NextResponse.json({ message: 'No update detected' }, { status: 400 });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
