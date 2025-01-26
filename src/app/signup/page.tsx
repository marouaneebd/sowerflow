'use client';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { GradientButton } from '@/components/onboarding-form/GradientButton';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Transition } from '@/components/onboarding-form/Transition';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/app/firebase';


type FormData = {
  email: string,
  password: string,
  repeatPassword: string
}

export default function Signup() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    repeatPassword: ''
  })
  const router = useRouter();

  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      router.push('/home');
    }
  }, [session, router]);

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const isStepValid = () => {
    return formData.email !== '' && formData.password !== '' && formData.repeatPassword !== '' && formData.password === formData.repeatPassword
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isStepValid()) {
      signup();
    }
  }

  const signup = async () => {
    try {
      setIsSubmitting(true);
      const email = formData.email;
      const password = formData.password;
      await createUserWithEmailAndPassword(auth, email, password);
      await signIn('credentials', { email, password, redirect: true, callbackUrl: '/' });
    } catch (error) {
      console.log(error);
    }
    setIsSubmitting(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[#ff6b2b] to-[#d22dfc] text-transparent bg-clip-text">
        Inscription
      </h1>
      <Card className="w-full max-w-lg mx-auto">
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
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repeatPassword">Confirmer mot de passe</Label>
                  <Input
                    id="repeatPassword"
                    type="password"
                    value={formData.repeatPassword}
                    onChange={(e) => updateFormData('repeatPassword', e.target.value)}
                    required
                  />
                </div>
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

