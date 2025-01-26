'use client'
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Chat from '@/components/demo-chat/Chat';
import OnboardingForm from '@/components/onboarding-form/OnboardingForm';

export default function Home() {
  const router = useRouter();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const checkProfileStatus = async () => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      
      if (!data.onboardingForm || data.onboardingForm.status !== 'finished') {
        setNeedsOnboarding(true);
        setShowChat(false);
      } else {
        setNeedsOnboarding(false);
        setShowChat(true);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    } else if (status === 'authenticated') {
      checkProfileStatus();
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

  if (needsOnboarding) {
    return <OnboardingForm onComplete={checkProfileStatus} />;
  }

  if (showChat) {
    return <Chat />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[#ff6b2b] to-[#d22dfc] text-transparent bg-clip-text">
        Bienvenue sur votre dashboard
      </h1>
    </main>
  );
}