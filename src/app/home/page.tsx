'use client'
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';


export default function Home() {
  const router = useRouter();

  const { data: session, status } = useSession();

  useEffect(() => {
    // Redirect to sign-in if the session is not authenticated
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
    else {
      if (typeof window !== 'undefined') {
        window.postMessage(
          {
            type: 'LOGIN_SUCCESS',
            token: session?.user.token, // Replace with the actual token you want to send
          },
          '*'
        );
        console.log('Message sent to Chrome extension:', session?.user.token);
        //localStorage.setItem('session', JSON.stringify(session));
      }
    }
  }, [status, router]);




  return (
    <div className="p-6">
      <iframe
        src="https://my-autobot.webflow.io/"
        className="w-full h-full"
        style={{ border: 'none' }}
        title="Full Screen iFrame"
      ></iframe>
    </div>
  );
}