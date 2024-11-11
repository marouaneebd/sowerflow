'use client';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { signIn, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { useRouter } from 'next/navigation';
import BasicButton from '@/components/general/BasicButton';


export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      router.push('/home');
    }
  }, [session, router]);


  const signup = async () => {
    if (password !== passwordAgain) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await signIn('credentials', { email, password, redirect: true, callbackUrl: '/' });
      setMessage("Signup successful! You can now log in.");
    } catch (error) {
      console.log(error);
      setMessage("Signup failed. Please try again.");
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
              Sign Up
            </h2>
            <p className="text-gray-500 mb-6 text-center">
              Create a new account
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:border-[#ff6b2b] focus:ring-1 focus:ring-[#ff6b2b]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="passwordAgain" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="passwordAgain"
                  name="passwordAgain"
                  type="password"
                  autoComplete="new-password"
                  onChange={(e) => setPasswordAgain(e.target.value)}
                  required
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:border-[#ff6b2b] focus:ring-1 focus:ring-[#ff6b2b]"
                />
              </div>
            </div>

            {message && <p className="mt-2 text-center text-sm text-red-500">{message}</p>}

            <div className="flex justify-center">
              <BasicButton
                disabled={(!email || !password || !passwordAgain) || (password !== passwordAgain)}
                onClick={signup}
                buttonText="Sign Up"
                type="general"
              />
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?
            <button onClick={() => router.push('/signin')} className="text-[#ff6b2b] hover:text-[#e66026] font-semibold">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
