import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/app/stripe'
import { verifyAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
    const { priceId, successUrl, cancelUrl } = await req.json();
    const { stripeCustomerId } = await verifyAuth(req);

    if (!stripeCustomerId) {
        return NextResponse.json({ error: 'No Stripe customer ID found' }, { status: 400 });
    }

    try {
        const stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            customer: stripeCustomerId,
            success_url: successUrl,
            cancel_url: cancelUrl,
        });

        return NextResponse.json({ sessionId: stripeSession.id });
    } catch (error) {
        // Check if the error is an instance of Error
        if (error instanceof Error) {
            console.error('Error creating Stripe Checkout session:', error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Handle unknown error
        console.error('Unknown error creating Stripe Checkout session:', error);
        return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
}