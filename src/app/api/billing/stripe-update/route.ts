import { stripe } from '@/app/stripe';
import { db } from '@/app/firebase';
import { doc, getDocs, updateDoc, query, collection, where } from 'firebase/firestore';
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  //const apiKey = req.headers.get('x-api-key');
  //const validApiKey = process.env.STRIPE_WEBHOOK_API_KEY;

  //if (!apiKey || apiKey !== validApiKey) {
    //return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  //}


  let event: Stripe.Event;

  try {
    const buf = await req.arrayBuffer();
    const body = Buffer.from(buf);
    
    // Proceed with the rest of your code
    const signature = req.headers.get('stripe-signature') as string;
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET as string);
    
  } catch (err) {
    return NextResponse.json({ error: `Webhook Error: ${JSON.stringify(err)}` }, { status: 400 });
  }

  const subscription = event.data.object as Stripe.Subscription;

  console.log(subscription)

  if (event.type === 'customer.subscription.updated') {
    const customerId = subscription.customer as string;

    try {
      const profilesRef = collection(db, 'profiles');
      const q = query(profilesRef, where('stripeCustomerId', '==', customerId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      querySnapshot.forEach(async (document) => {
        const docRef = doc(db, 'profiles', document.id); // Assuming you're updating the 'profiles' collection
        await updateDoc(docRef, {
          plan: "new"
        });
      });

      return NextResponse.json({ message: 'Subscription updated successfully' }, { status: 200 });
    } catch (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
