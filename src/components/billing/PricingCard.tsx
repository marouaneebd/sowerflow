'use client'
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { loadStripe } from '@stripe/stripe-js';
import { GradientButton } from '@/components/onboarding-form/GradientButton';


// Initialize Stripe with your public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type PlanTypes = 'assisted' | 'augmented' | 'automated';

interface PricingCardProps {
  plan: PlanTypes;
  selected: boolean
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, selected }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: session } = useSession(); // Get current user session

  // Function to handle the checkout process
  const handleCheckout = async () => {
    if (!session || !session.user) {
      alert('Please log in first');
      return;
    }

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: mapping.price_id[plan],
          successUrl: `${window.location.origin}/billing`,
          cancelUrl: `${window.location.origin}/billing`
        }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;

      // Redirect to Stripe Checkout
      if (stripe && sessionId) {
        await stripe.redirectToCheckout({ sessionId });
      } else {
        alert('Failed to load Stripe session.');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
    setIsSubmitting(false)
  };

  const handleBillingPortal = async () => {
    if (!session || !session.user) {
      alert('Please log in first');
      return;
    }

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const { url } = await response.json();

      if (url) {
        // Redirect the user to the billing portal
        window.location.href = url;
      } else {
        alert('Failed to load billing portal.');
      }
    } catch (error) {
      console.error('Error accessing billing portal:', error);
      alert('An error occurred. Please try again.');
    }
    setIsSubmitting(false)
  };

  const mapping = {
    "price_id": {
      "assisted": "price_1QAd6oIHyU82otGEokYNDgA9",
      "augmented": "price_1QAd7YIHyU82otGEMpJENleQ",
      "automated": "price_1QAdGWIHyU82otGElKnoIXcR"
    },
    "image": {
      "assisted": "/images/pricing_assisted.png",
      "augmented": "/images/pricing_augmented.png",
      "automated": "/images/pricing_automated.png"
    },
    // Faire dépendre du subscription
    "cta_text": {
      "assisted": "Downgrade",
      "augmented": "Manage",
      "automated": "Upgrade"
    },
    "display_hint": {
      "assisted": false,
      "augmented": true,
      "automated": false
    },
    "title": {
      "assisted": "Assisted",
      "augmented": "Augmented",
      "automated": "Automated"
    },
    "price": {
      "assisted": "4.90",
      "augmented": "9.90",
      "automated": "19.90"
    },
    "number_of_messages": {
      "assisted": "10",
      "augmented": "15",
      "automated": "20"
    },
    "ai_1_available": {
      "assisted": false,
      "augmented": true,
      "automated": true
    },
    "ai_2_available": {
      "assisted": false,
      "augmented": false,
      "automated": true
    },
    "ai_3_available": {
      "assisted": false,
      "augmented": false,
      "automated": true
    },
  }
  return (
    <div
      className={`max-w-sm bg-white rounded-2xl p-6 m-6 
        ${selected ? 'border border-gray-300 shadow-md hover:shadow-lg' : ''}
        transition-shadow`}
      style={selected ? { boxShadow: '0 0 3px #e5e7eb' } : {}}
    >      {/* Badge */}
      <div className={`${!mapping?.display_hint?.[plan] ? 'hidden' : ''} text-orange-500 font-semibold text-sm mb-2 flex items-center`}>
        <span>✨</span>
        <span className="ml-2">Smart choice</span>
      </div>
      
      {/* Image */}
      <div className="flex justify-center mb-4">
        <img src={mapping?.image?.[plan]} alt="Augmented" className="h-24 w-20" />
      </div>

      {/* Title */}
      <h2 className="text-2xl text-center mb-2">{mapping?.title?.[plan]}</h2>

      {/* Price */}
      <p className="text-3xl text-center font-semibold text-gray-900 mb-4">
        {mapping?.price?.[plan]}<span className="text-lg">€</span><span className="text-sm font-normal">/month</span>
      </p>

      {/* Features List */}
      <ul className="mb-6 space-y-2">
        <li className="flex items-center">
          <img src="/images/check.png" alt="Augmented" className="h-6 w-6" />
  <span className="pl-2">{mapping?.number_of_messages?.[plan]} automatic messages a day</span>
        </li>
        <li className="flex items-center">
        <img src="/images/check.png" alt="Augmented" className="h-6 w-6" />
        <span className="pl-2">Customizable message templates</span>
        </li>
        <li className="flex items-center">
        <img src="/images/check.png" alt="Augmented" className="h-6 w-6" />
        <span className="pl-2">Customizable profile targeting</span>
        </li>
        <li className="flex items-center">
        <img src={mapping?.ai_1_available?.[plan] ? "/images/check.png" : "/images/close.png"} alt="Augmented" className="h-6 w-6" />
        <span className="pl-2">AI generated messages</span>
        </li>
        <li className="flex items-center">
        <img src={mapping?.ai_2_available?.[plan] ? "/images/check.png" : "/images/close.png"} alt="Augmented" className="h-6 w-6" />
        <span className="pl-2">AI profile targeting</span>
        </li>
        <li className="flex items-center">
        <img src={mapping?.ai_3_available?.[plan] ? "/images/check.png" : "/images/close.png"} alt="Augmented" className="h-6 w-6" />
        <span className="pl-2">Automated follow-up messages</span>
        </li>
      </ul>

      {/* Sign up button */}
      <div className="flex justify-center">
        <GradientButton 
          onClick={selected ? handleBillingPortal : handleCheckout}
          className="w-full"
          isLoading={isSubmitting}
        >
          {mapping?.cta_text?.[plan]}
        </GradientButton>
      </div>
    </div>
  );
};

export default PricingCard;
