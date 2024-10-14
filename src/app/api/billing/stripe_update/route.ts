import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '@/app/stripe'
import { db } from '@/app/firebase';
import { doc, getDocs, setDoc, updateDoc, deleteDoc, query, collection, where } from 'firebase/firestore';
import Stripe from 'stripe';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.STRIPE_WEBHOOK_API_KEY;

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  let event: Stripe.Event;

  try {
    // Parse the Stripe event
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'] as string, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${JSON.stringify(err)}` });
  }

  const subscription = event.data.object as Stripe.Subscription;

  // Handle different Stripe event types
  if (event.type === 'customer.subscription.updated') {
    const customerId = subscription.customer as string;

    try {
      // Find the customer document in the 'profiles' collection by Stripe's customerId
      const profilesRef = collection(db, 'profiles');
      const q = query(profilesRef, where('stripeCustomerId', '==', customerId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      // Update the profile document with the subscription status
      querySnapshot.forEach(async (document) => {
        const docRef = doc(db, 'templates', document.id);
        await updateDoc(docRef, {
            plan: "new"
          });
      });

      return res.status(200).json({ message: 'Subscription updated successfully' });
    } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.status(200).json({ received: true });
}

