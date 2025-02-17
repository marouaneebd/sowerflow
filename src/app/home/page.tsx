'use client'
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import OnboardingForm from '@/components/onboarding-form/OnboardingForm';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Analytics {
  conversations: Array<{
    created_at: string;
    updated_at: string;
    scoped_user_id: string;
    status: string;
  }>;
  stats: {
    totalConversations: number;
    settedConversations: number;
    conversionRate: number;
  };
}

export default function Home() {
  const router = useRouter();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  //const [showChat, setShowChat] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  const checkProfileStatus = async () => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      
      if (!data.onboardingForm || data.onboardingForm.status !== 'finished') {
        setNeedsOnboarding(true);
        //setShowChat(false);
      } else {
        setNeedsOnboarding(false);
        //setShowChat(true);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      setAnalytics(data);
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
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white">
        <div className="max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">
              Chargement...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (needsOnboarding) {
    return <OnboardingForm onComplete={checkProfileStatus} />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-white">
      {analytics && (
        <>
          <div className="grid gap-4 md:grid-cols-3 w-full max-w-7xl mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Conversations effectuées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.stats.totalConversations}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Conversations réussies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.stats.settedConversations}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Taux de conversion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.stats.conversionRate}%</div>
              </CardContent>
            </Card>
          </div>

          <div className="w-full max-w-7xl">
            <Card>
              <CardHeader>
                <CardTitle>Conversations Récentes</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date de création</TableHead>
                      <TableHead>Dernière mise à jour</TableHead>
                      <TableHead>Lien Instagram</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.conversations.map((conversation, index) => (
                      <TableRow key={index}>
                        <TableCell>{conversation.scoped_user_id}</TableCell>
                        <TableCell>{conversation.status}</TableCell>
                        <TableCell>{new Date(conversation.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(conversation.updated_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <a 
                            href={`https://ig.me/${conversation.scoped_user_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            Voir sur Instagram
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </main>
  );
}