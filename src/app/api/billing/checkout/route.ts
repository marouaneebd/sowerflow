import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/app/stripe'
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth/next';

export async function POST(req: NextRequest) {

    const { priceId, successUrl, cancelUrl } = await req.json();
    const session = await getServerSession({ req, ...authOptions });
    const customerId = session?.user?.stripeCustomerId

    if (!customerId) {
        return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
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
            customer: customerId,
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