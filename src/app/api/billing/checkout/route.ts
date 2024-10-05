import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/app/stripe'

export async function POST(req: NextRequest) {
    try {
        const { priceId, successUrl, cancelUrl, customerId } = await req.json();

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            customer: customerId,
            success_url: successUrl,
            cancel_url: cancelUrl,
        });

        return NextResponse.json({ sessionId: session.id });
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