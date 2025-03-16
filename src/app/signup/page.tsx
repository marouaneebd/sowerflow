'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Transition } from '@/components/onboarding-form/Transition';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { GradientButton } from '@/components/onboarding-form/GradientButton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SignUpPage() {
  const { data: session } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validatePassword = (password: string): boolean => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*_-]/.test(password);
    
    return minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  };
  
  // Check individual password requirements
  const passwordChecks = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*]/.test(password),
  };
  
  // Check if passwords match when either password or repeatPassword changes
  useEffect(() => {
    if (password && repeatPassword) {
      setPasswordMismatch(password !== repeatPassword);
    } else {
      setPasswordMismatch(false);
    }
  }, [password, repeatPassword]);
  
  useEffect(() => {
    if (session) {
      router.push('/home');
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (password !== repeatPassword) {
      setPasswordMismatch(true);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      // Redirect to login or dashboard
      router.push('/signin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    return email !== '' && 
           password !== '' && 
           repeatPassword !== '' && 
           password === repeatPassword &&
           validatePassword(password);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-24 bg-white">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 bg-gradient-to-r from-[#ff6b2b] to-[#d22dfc] text-transparent bg-clip-text text-center px-4">
        Inscription
      </h1>
      <Card className="w-[95%] sm:w-full max-w-lg mx-auto">
        <CardContent className="pt-6">
        </CardContent>
        <Transition key="signin">
          <form onSubmit={handleSubmit}>
            <CardContent className="min-h-[250px]">
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
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="bg-slate-50 p-3 text-sm rounded border border-slate-200 text-slate-700">
                    <p className="font-medium mb-1">Votre mot de passe doit comporter :</p>
                    <ul className="space-y-1">
                      <li className={`flex items-center gap-2 ${passwordChecks.minLength ? 'text-green-600' : 'text-slate-700'}`}>
                        {passwordChecks.minLength ? '✓' : '○'} Au moins 8 caractères
                      </li>
                      <li className={`flex items-center gap-2 ${passwordChecks.hasUpperCase ? 'text-green-600' : 'text-slate-700'}`}>
                        {passwordChecks.hasUpperCase ? '✓' : '○'} Au moins une lettre majuscule
                      </li>
                      <li className={`flex items-center gap-2 ${passwordChecks.hasLowerCase ? 'text-green-600' : 'text-slate-700'}`}>
                        {passwordChecks.hasLowerCase ? '✓' : '○'} Au moins une lettre minuscule
                      </li>
                      <li className={`flex items-center gap-2 ${passwordChecks.hasNumbers ? 'text-green-600' : 'text-slate-700'}`}>
                        {passwordChecks.hasNumbers ? '✓' : '○'} Au moins un chiffre
                      </li>
                      <li className={`flex items-center gap-2 ${passwordChecks.hasSpecialChar ? 'text-green-600' : 'text-slate-700'}`}>
                        {passwordChecks.hasSpecialChar ? '✓' : '○'} Au moins un caractère spécial (!@#$%^&*_-)
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repeatPassword">Confirmer mot de passe</Label>
                  <Input
                    id="repeatPassword"
                    type="password"
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    required
                  />
                  {passwordMismatch && (
                    <div className="text-red-500 text-sm mt-1">
                      Les mots de passe ne correspondent pas
                    </div>
                  )}
                </div>
                {error && (
                  <div className="text-red-500 text-sm">{error}</div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <div className="w-full">
                <GradientButton type="submit" disabled={!isStepValid()} isLoading={isSubmitting} className="w-full">
                  S&apos;inscrire
                </GradientButton>
              </div>
              <div className="w-full">
                <Link href="/signin">
                  <Button variant="outline" className="w-full">
                    Connexion
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </form>
        </Transition>
      </Card>
    </main>
  )
}

