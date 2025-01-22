'use client'
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import MultiStepForm from '@/components/signup_form/MultiStepForm';

export default function Onboarding() {
  const router = useRouter();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    } else if (status === 'authenticated') {
      // Check if user has already completed the form
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          if (data.onboardingForm) {
            router.push('/'); // Redirect to home/dashboard if form is completed
          }
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching profile:', error);
          setIsLoading(false);
        });
    }
  }, [status, router]);

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
        Construisons ensemble votre stratégie de setting
      </h1>
      <MultiStepForm />
    </main>
  )
} 