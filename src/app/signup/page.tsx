'use client';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MultiStepForm from '@/components/signup_form/MultiStepForm'


export default function Signup() {
  const router = useRouter();

  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      router.push('/home');
    }
  }, [session, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[#ff6b2b] to-[#d22dfc] text-transparent bg-clip-text">
        Inscription
      </h1>
      <MultiStepForm />
    </main>
  )

}
