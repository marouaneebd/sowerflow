'use client'
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';


export default function Home() {
  const [prompt, setPrompt] = useState('');
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
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            className="mx-auto h-20 w-auto"
            src="/images/fire.png"
            alt="Your Company"
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-black">
            Write a prompt below to explain what you are looking for
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="space-y-6">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium leading-6 text-black">
                My prompt
              </label>
              <div className="mt-2">
                <input
                  id="prompt"
                  name="prompt"
                  type="text"
                  autoComplete="I am looking for a job in M&A ..."
                  onChange={(e) => setPrompt(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-black shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                //onClick={() => handleSubmit()}
                disabled={!prompt}
                className="disabled:opacity-40 flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-black shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Save
              </button>
              <button
                //onClick={null}
                className="disabled:opacity-40 flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-black shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Log session
              </button>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            User UID: <span className="font-semibold">{session?.user?.uid}</span>
          </div>
        </div>
      </div >
    </>
  )
}