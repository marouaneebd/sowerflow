'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PricingCard from '@/components/billing/PricingCard';


const Billing = () => {
  const router = useRouter();

  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.user?.uid) {
      console.log("uid received")
    }
    // Redirect to sign-in if the session is not authenticated
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
      <PricingCard plan="assisted" selected={false} />
      <PricingCard plan="augmented" selected={true} />
      <PricingCard plan="automated" selected={false} />
      </div>
  );
};

export default Billing;
