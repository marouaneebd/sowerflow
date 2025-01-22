'use client';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { GradientButton } from '@/components/signup_form/GradientButton';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Transition } from '@/components/signup_form/Transition';

type FormData = {
  email: string,
  password: string
}

export default function Signin() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
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
    return formData.email !== '' && formData.password !== ''
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isStepValid()) {
      try {
        setIsSubmitting(true)
        const email = formData.email;
        const password = formData.password;
        await signIn('credentials', { email, password, redirect: true, callbackUrl: '/' });
      } catch (error) {
        console.log(error);
      }
      setIsSubmitting(false)
    };
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[#ff6b2b] to-[#d22dfc] text-transparent bg-clip-text">
        Connexion
      </h1>
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="pt-6">
        </CardContent>
        <Transition key="signin">
          <form onSubmit={handleSubmit}>
            <CardContent className="min-h-[200px]">
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
                  <div className="flex justify-end">
                  <Link href="/forgot-password">
                    <Button variant="link" className="p-0 h-auto text-sm text-gray-400 hover:text-gray-900 ml-auto">
                      Mot de passe oublié ?
                    </Button>
                  </Link>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <div className="w-full">
                <GradientButton type="submit" disabled={!isStepValid()} isLoading={isSubmitting} className="w-full">
                  Se connecter
                </GradientButton>
              </div>
              <div className="w-full">
                <Link href="/signup">
                  <Button variant="outline" className="w-full">
                    Inscription
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
