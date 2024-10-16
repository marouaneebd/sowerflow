import { stripe } from '@/app/stripe';
import { db } from '@/app/firebase';
import { doc, getDocs, updateDoc, query, collection, where } from 'firebase/firestore';
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const price_ids = {
  "assisted": "price_1Q2eySIHyU82otGEK3Te8zGb",
  "augmented": "price_1Q2eywIHyU82otGEGEYwpbyh",
  "automated": "price_1Q2ezLIHyU82otGExUGl6dP9"
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

  if (event.type === 'customer.subscription.updated') {
    const customerId = subscription.customer as string;
    const priceId = subscription.items.data[0].price.id;
    const isTrial = subscription.status === 'trialing'; // Check if the subscription is in trial

    let plan: string | null = null;

    // Match the priceId with the appropriate plan
    for (const [key, value] of Object.entries(price_ids)) {
      if (value === priceId) {
        plan = key;
        break;
      }
    }

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
        await updateDoc(docRef, {
          plan: plan,
          isTrial: isTrial // Add the trial status to the user's profile
        });
      }

      return NextResponse.json({ message: 'Subscription updated successfully' }, { status: 200 });
    } catch (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
