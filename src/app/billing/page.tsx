'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { GradientButton } from '@/components/onboarding-form/GradientButton';

const Billing = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  const openBillingPortal = async () => {
    if (session?.user?.uid) {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/billing/portal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            returnUrl: window.location.href,
          }),
        });

        const { url } = await response.json();
        if (url) {
          window.open(url, '_blank');
        } else {
          setError('Failed to load billing portal. Please try again.');
        }
      } catch (error) {
        console.error('Error accessing billing portal:', error);
        setError('An error occurred while accessing the billing portal. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    } else if (status === 'authenticated') {
      openBillingPortal();
    }
  }, [status, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white">
      <div className="max-w-md w-full">
        {error ? (
          <div className="text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <GradientButton
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Veuillez réessayer ou contacter le support
            </GradientButton>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Portail de facturation</h2>
            <p className="text-gray-600 mb-6">
              Si le portail ne s&apos;est pas ouvert automatiquement ou si vous l&apos;avez fermé, cliquez sur le bouton ci-dessous pour le réouvrir.
            </p>
            <GradientButton
              onClick={openBillingPortal}
              isLoading={isLoading}
              className="w-full"
            >
              Réouvrir le portail de facturation
            </GradientButton>
          </div>
        )}
      </div>
    </main>
  );
};

export default Billing;
