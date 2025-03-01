'use client'
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import OnboardingForm from '@/components/onboarding-form/OnboardingForm';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Profile } from '@/types/profile';
import { Analytics } from '@/types/analytics';
import Chat from '@/components/demo-chat/Chat';

export default function Home() {
  const router = useRouter();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  const checkProfileStatus = async () => {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) {
        router.push('/signin');
        return;
      }
      const profile: Profile = await res.json();
      setProfile(profile);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      router.push('/signin');
      setIsLoading(false);
    }
  };

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
    if (status === 'unauthenticated') {
      router.push('/signin');
    } else if (status === 'authenticated') {
      checkProfileStatus();
      fetchAnalytics();
    }
  }, [status, router]);

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

  if (profile?.onboarding_form?.status !== 'finished') {
    return <OnboardingForm onComplete={checkProfileStatus} />;
  }

  // Sandbox interface for inactive subscriptions
  if (!profile?.subscription?.is_active) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Bienvenue dans votre espace de test</h1>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personnalisé</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Notre bot analyse en amont le profil de votre prospect et génère une conversation naturelle et personnalisée
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Automatisé</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Vos conversations sont gérées 24h/24 et 7j/7 afin de maximiser vos opportunités
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Efficace</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Notre IA a été entraînée sur des vraies conversation pour obtenir un maximum de rendez-vous qualifiés
                </p>
              </CardContent>
            </Card>
          </div>
          <Chat />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {analytics && (
        <div className="max-w-5xl mx-auto space-y-8">
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
                    {analytics.conversations.map((conversation, index) => (
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
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}