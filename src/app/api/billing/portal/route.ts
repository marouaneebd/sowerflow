import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/app/stripe'

export async function POST(req: NextRequest) {
  try {
    const { customerId } = await req.json();

    if (!customerId) {
      return NextResponse.json({ error: 'Missing customer ID' }, { status: 400 });
    }

    // Make sure NEXT_PUBLIC_URL is fully qualified with http:// or https://
    const returnUrl = `${process.env.DOMAIN_URL}/billing`; // Full URL

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
