'use client'
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    } else if (status === 'authenticated') {
      // Check if user has completed the form
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          if (!data.onboardingForm) {
            router.push('/onboarding');
          }
          else {
            router.push('/demo-chat');
          }
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching profile:', error);
          setIsLoading(false);
        });
    }
  }, [status, router, session]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white">
        <div className="max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">
              Chargement...
            </p>
          </div>
        </div>
      </main>
    );
  }


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[#ff6b2b] to-[#d22dfc] text-transparent bg-clip-text">
        Welcome to your Dashboard
      </h1>
      {/* Add your dashboard content here */}
    </main>
  )
}