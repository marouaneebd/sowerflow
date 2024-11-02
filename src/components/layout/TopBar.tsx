'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TopBar() {
    const router = useRouter();
    const { data: session } = useSession();
    const [isTrial, setIsTrial] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    const dismissBanner = () => {
        setIsVisible(false);
    };

    useEffect(() => {
        async function fetchProfileData() {
            try {
                const response = await fetch('api/profile');
                if (response.ok) {
                    const profileData = await response.json();
                    setIsTrial(profileData.isTrial);
                }
            } catch (error) {
                console.error('Failed to fetch profile data:', error);
            }
        }
        fetchProfileData();
    }, []);

    const redirectBilling = (): void => {
        router.push("/billing");
    };

    if (!session || !isTrial || !isVisible) return null;

    return (
        <aside className="h-10">
          <nav className="h-full flex items-center justify-center bg-orange-600 text-white shadow-md px-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  {/* Information Icon */}
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm.75 12h-1.5v-1.5h1.5V14zm0-3h-1.5V6h1.5v5z" />
                </svg>
                <span className="text-sm font-medium ml-2">
                  You are currently on a trial plan.
                </span>
              </div>
              <button
                onClick={redirectBilling}
                className="text-sm underline hover:text-orange-200"
              >
                Upgrade Plan
              </button>
              <button
                onClick={dismissBanner}
                className="hover:text-orange-200"
                aria-label="Dismiss"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  {/* Close Icon */}
                  <path
                    fillRule="evenodd"
                    d="M10 8.586l-4.95-4.95a1 1 0 10-1.414 1.414L8.586 10l-4.95 4.95a1 1 0 101.414 1.414L10 11.414l4.95 4.95a1 1 0 001.414-1.414L11.414 10l4.95-4.95a1 1 0 00-1.414-1.414L10 8.586z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </nav>
        </aside>
      );
      
}
