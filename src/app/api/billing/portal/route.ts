import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/app/stripe'
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth/next';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession({ req, ...authOptions });
    const customerId = session?.user?.stripeCustomerId

    if (!customerId) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }
    

    // Make sure NEXT_PUBLIC_URL is fully qualified with http:// or https://
    const returnUrl = `${process.env.NEXT_PUBLIC_DOMAIN_URL}/billing`; // Full URL

    // Create a Stripe billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl, // Properly formatted return URL
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    const typedError = error as Error;
    console.error('Error creating billing portal session:', typedError.message);
    return NextResponse.json({ error: typedError.message }, { status: 500 });
  }
}
