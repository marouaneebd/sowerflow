'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Profile } from '@/types/profile';

export default function TopBar() {
    const router = useRouter();
    const { data: session } = useSession();
    const [profile, setProfile] = useState<Profile | null>(null);

    const redirectBilling = useCallback((): void => {
        router.push("/billing");
    }, [router]);

    // Fetch profile data
    useEffect(() => {
        let isMounted = true;

        async function fetchProfileData() {
            try {
                const response = await fetch('api/profile', {
                    headers: {
                        'Cache-Control': 'no-store'
                    }
                });
                if (!isMounted) return;

                if (response.ok) {
                    const profileData = await response.json();
                    setProfile(profileData);
                }
            } catch (error) {
                console.error('Failed to fetch profile data:', error);
            }
        }

        if (session) {
            fetchProfileData();
        }

        return () => {
            isMounted = false;
        };
    }, [session]);

    if (profile?.subscription?.is_active === false) {
        return (
            <header className="h-10 z-10">
                <nav className="h-full flex items-center justify-center bg-gradient-to-r from-[#ff6b2b] to-[#d22dfc] text-white shadow-md px-6">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <svg
                                className="h-5 w-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                            >
                                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm.75 12h-1.5v-1.5h1.5V14zm0-3h-1.5V6h1.5v5z" />
                            </svg>
                            <span className="text-sm font-medium ml-2">
                                Votre compte n&apos;est pas activé. Pour l&apos;activer, veuillez vous rendre sur la page de facturation.
                            </span>
                        </div>
                        <button
                            onClick={redirectBilling}
                            className="underline hover:text-orange-200 transition-colors duration-200"
                        >
                            Activer mon compte
                        </button>
                    </div>
                </nav>
            </header>
    );
    }

    return null;


}
