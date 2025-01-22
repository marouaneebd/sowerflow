'use client'
import { useState, useEffect } from 'react';
import { sendPasswordReset } from '../firebase';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GradientButton } from '@/components/signup_form/GradientButton';
import { Transition } from '@/components/signup_form/Transition';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { data: session } = useSession();

  // Set the mounted state to true once the component has mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && session) {
      router.push('/home');
    }
  }, [mounted, session, router]);

  // Prevent rendering the component until hydration is complete
  if (!mounted) return null;

  const reset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await sendPasswordReset(email);
      setMessage("");
      // Optionally redirect to signin page after successful reset
      router.push('/signin');
    } catch (error) {
      console.log(error);
      setMessage("La réinitialisation du mot de passe a échoué. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[#ff6b2b] to-[#d22dfc] text-transparent bg-clip-text">
        Mot de passe oublié
      </h1>
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="pt-6">
        </CardContent>
        <Transition key="forgot-password">
          <form onSubmit={reset}>
            <CardContent className="min-h-[150px]">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {message && <p className="text-red-500 text-sm text-center">{message}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <div className="w-full">
                <GradientButton 
                  type="submit" 
                  disabled={!email} 
                  isLoading={isSubmitting} 
                  className="w-full"
                >
                  Envoyer le lien de réinitialisation
                </GradientButton>
              </div>
              <div className="w-full">
                <Link href="/signin">
                  <Button variant="outline" className="w-full">
                    Retour à la connexion
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </form>
        </Transition>
      </Card>
    </main>
  );
}
