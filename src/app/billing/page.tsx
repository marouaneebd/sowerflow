'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const Billing = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    const redirectToBillingPortal = async () => {
      if (session?.user?.uid) {
        try {
          setIsLoading(true);
          setError(null);
          const response = await fetch('/api/billing/portal', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          });

          const { url } = await response.json();

          if (url) {
            window.location.href = url;
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

    if (status === 'unauthenticated') {
      router.push('/signin');
    } else if (status === 'authenticated') {
      redirectToBillingPortal();
    }
  }, [status, router, session?.user?.uid]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white">
      <div className="max-w-md w-full">
        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">
              En attente de redirection vers le portail de facturation ...
            </p>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Veuillez réessayer ou contacter le support
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
};

export default Billing;
