'use client'
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import OnboardingForm from '@/components/onboarding-form/OnboardingForm';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { GradientButton } from '@/components/onboarding-form/GradientButton';
import { Profile } from '@/types/profile';
import { Analytics } from '@/types/analytics';
import Chat from '@/components/demo-chat/Chat';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activeStep, setActiveStep] = useState<'onboarding' | 'chat' | 'analytics'>('onboarding');

  const checkProfileStatus = async () => {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) {
        router.push('/signin');
        return;
      }
      const profile: Profile = await res.json();
      setProfile(profile);
      
      // Set active step based on profile status
      if (profile?.onboarding_form?.status !== 'finished') {
        setActiveStep('onboarding');
      } else if (!profile?.subscription?.is_active) {
        setActiveStep('chat');
      } else {
        setActiveStep('analytics');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      router.push('/signin');
      setIsLoading(false);
    }
  };

  const handleInstagramCallback = async (code: string) => {
    try {
      const response = await fetch('/api/instagram/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (data.username && data.userId && data.access_token && data.token_expires && data.updated_at) {
        setProfile((prevProfile) => {
          if (!prevProfile) return null;
          
          return {
            ...prevProfile,
            instagram: {
              username: data.username,
              userId: data.userId,
              access_token: data.access_token,
              token_expires: data.token_expires,
              updated_at: data.updated_at
            }
          };
        });
      }
      
      if (data.biography) {
        setProfile((prevProfile) => {
          if (!prevProfile || !prevProfile.instagram) return prevProfile;
          
          return {
            ...prevProfile,
            instagram: {
              ...prevProfile.instagram,
              biography: data.biography
            }
          };
        });
      }
    } catch (err) {
      console.error('Erreur lors de la connexion à Instagram: ' + err)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      const analyticsData: Analytics = await res.json();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  useEffect(() => {
    // Handle Instagram OAuth redirect
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      handleInstagramCallback(code);
    }

    if (status === 'unauthenticated') {
      router.push('/signin');
    } else if (status === 'authenticated') {
      checkProfileStatus();
      fetchAnalytics();
    }
  }, [status, router]);

  // Handle step change
  const handleStepChange = (step: 'onboarding' | 'chat' | 'analytics') => {
    setActiveStep(step);
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="text-gray-600 text-lg">Chargement...</p>
        </div>
      </main>
    );
  }

  // Determine if steps are completed
  const isOnboardingCompleted = profile?.onboarding_form?.status === 'finished';
  const isSubscriptionActive = profile?.subscription?.is_active;
  const isAnalyticsAvailable = isOnboardingCompleted && profile?.subscription?.is_active;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Step Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Step 1: Onboarding */}
          <Card 
            className={`cursor-pointer transition-all ${activeStep === 'onboarding' ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}`}
            onClick={() => handleStepChange('onboarding')}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">1</span>
                {isOnboardingCompleted && (
                  <span className="text-green-500">✓</span>
                )}
              </div>
              <CardTitle className="text-lg mt-2">Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Répondez à quelques questions pour personnaliser votre setter
              </p>
            </CardContent>
          </Card>

          {/* Step 2: Chat */}
          <Card 
            className={`cursor-pointer transition-all ${!isOnboardingCompleted ? 'opacity-50' : activeStep === 'chat' ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}`}
            onClick={() => isOnboardingCompleted && handleStepChange('chat')}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">2</span>
                {isSubscriptionActive && (
                  <span className="text-green-500">✓</span>
                )}
              </div>
              <CardTitle className="text-lg mt-2">Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Testez votre setter pour voir si il répond correctement à vos prospects
              </p>
            </CardContent>
          </Card>

          {/* Step 3: Analytics */}
          <Card 
            className={`cursor-pointer transition-all ${!isAnalyticsAvailable ? 'opacity-50' : activeStep === 'analytics' ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}`}
            onClick={() => isAnalyticsAvailable && handleStepChange('analytics')}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">3</span>
              </div>
              <CardTitle className="text-lg mt-2">Tableau de bord</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Suivez vos performances et analysez vos conversations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Content based on active step */}
        <div className="mt-8">
          {activeStep === 'onboarding' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              {profile && profile?.onboarding_form?.status !== 'finished' ? (
                <OnboardingForm profile={profile} onComplete={checkProfileStatus} />
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-xl font-semibold text-green-600 mb-2">Configuration terminée !</h3>
                  <p className="text-gray-600">Ces informations vont maintenant nous permettre de personnaliser votre setter</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        if (profile) {
                          setProfile({
                            ...profile,
                            onboarding_form: {
                              ...profile.onboarding_form,
                              status: 'pending'
                            }
                          });
                        }
                      }}
                    >
                      Recommencer la configuration
                    </Button>
                    <GradientButton 
                      onClick={() => handleStepChange('chat')}
                    >
                      Passer à l'étape suivante
                    </GradientButton>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeStep === 'chat' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Chat />
            </div>
          )}

          {activeStep === 'analytics' && analytics && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-gray-600">
                        Conversations effectuées
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{analytics.stats.totalConversations}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-gray-600">
                        Conversations réussies
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{analytics.stats.settedConversations}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-gray-600">
                        Taux de conversion
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{analytics.stats.conversionRate}%</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Conversations Récentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Date de création</TableHead>
                            <TableHead>Dernière mise à jour</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analytics.conversations.length > 0 ? (
                            analytics.conversations.map((conversation, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <a
                                    href={`https://www.instagram.com/${conversation.scoped_user_username}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline"
                                  >
                                    {conversation.scoped_user_username}
                                  </a>
                                </TableCell>
                                <TableCell>{conversation.status}</TableCell>
                                <TableCell>{new Date(conversation.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>{new Date(conversation.updated_at).toLocaleDateString()}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-8">
                                <div className="flex flex-col items-center justify-center space-y-4">
                                  <Image 
                                    src="/images/cat_desk.svg" 
                                    alt="Aucune conversation" 
                                    width={250} 
                                    height={250} 
                                  />
                                  <p className="text-gray-500 font-medium">Aucune conversation à afficher pour le moment</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}