import { stripe } from '@/app/stripe';
import { db } from '@/app/firebase';
import { doc, getDocs, updateDoc, query, collection, where } from 'firebase/firestore';
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const price_ids = {
  "assisted": "price_1QAd6oIHyU82otGEokYNDgA9",
  "augmented": "price_1QAd7YIHyU82otGEMpJENleQ",
  "automated": "price_1QAdGWIHyU82otGElKnoIXcR"
};

export async function POST(req: NextRequest) {
  let event: Stripe.Event;

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
  const priceId = subscription.items.data[0].price.id;
  const plan = (Object.keys(price_ids) as Array<keyof typeof price_ids>).find(key => price_ids[key] === priceId) || null;
  const isTrial = subscription.status === 'trialing'; // Trial status
  const isActive = subscription.status === 'active' || subscription.status === 'trialing'; // Active status
  const subscriptionEndDate = new Date(subscription.current_period_end * 1000); // Subscription end date (timestamp to Date object)

  if (!plan) {
    return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 });
  }

  try {
    const profilesRef = collection(db, 'profiles');
    const q = query(profilesRef, where('stripeCustomerId', '==', customerId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    for (const document of querySnapshot.docs) {
      const docRef = doc(db, 'profiles', document.id);

      if (event.type === 'customer.subscription.updated') {
        await updateDoc(docRef, {
          plan,
          isTrial,
          isActive,
          subscriptionEndDate // Set subscription end date
        });
      } else if (event.type === 'customer.subscription.deleted') {
        // If the subscription is deleted, deactivate the user's subscription
        await updateDoc(docRef, {
          isActive: false,
          isTrial: false
        });
      } else if (event.type === 'invoice.payment_failed') {
        // If a payment fails, deactivate the user's subscription
        await updateDoc(docRef, {
          isActive: false
        });
      } else if (event.type === 'invoice.payment_succeeded') {
        // If a payment succeeds, ensure the user is marked as active and not in trial
        await updateDoc(docRef, {
          isActive: true,
          isTrial: false
        });
      }
    }

    return NextResponse.json({ message: 'Subscription updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
