'use client';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import BasicButton from '@/components/general/BasicButton';


export default function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      router.push('/home');
    }
  }, [session, router]);

  const signin = async () => {
    try {
      await signIn('credentials', { email, password, redirect: true, callbackUrl: '/' });
      setMessage("");
    } catch (error) {
      console.log(error);
      setMessage("Signin failed. Please try again.");
    }
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-10 max-w-lg w-full">
          <div className="flex flex-col items-center">
            <img
              className="h-16 w-16 mb-6"
              src="/images/fire.png"
              alt="Logo"
            />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Welcome Back
            </h2>
            <p className="text-gray-500 mb-6 text-center">
              Please sign in to your account
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:border-[#ff6b2b] focus:ring-1 focus:ring-[#ff6b2b]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div
                  onClick={() => router.push('/forgot-password')}
                  className="text-sm text-[#ff6b2b] cursor-pointer hover:text-[#e66026]">
                  Forgot password?
                </div>
              </div>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:border-[#ff6b2b] focus:ring-1 focus:ring-[#ff6b2b]"
                />
              </div>
            </div>

            {message && <p className="mt-2 text-center text-sm text-red-500">{message}</p>}

            <div className="flex justify-center">
              <BasicButton
                disabled={!email || !password}
                onClick={signin}
                buttonText="Sign In"
                type="general"
              />
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Dont have an account?
            <button onClick={() => router.push('/signup')} className="text-[#ff6b2b] hover:text-[#e66026] font-semibold">
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
