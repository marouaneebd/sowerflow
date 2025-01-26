import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/app/stripe';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const { stripeCustomerId } = await verifyAuth(req);
        const { returnUrl } = await req.json();

        if (!stripeCustomerId) {
            return NextResponse.json({ error: 'No Stripe customer ID found' }, { status: 400 });
        }

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: returnUrl,
        });

        return NextResponse.json({ url: portalSession.url });
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error creating Stripe Portal session:', error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        console.error('Unknown error creating Stripe Portal session:', error);
        return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
}
