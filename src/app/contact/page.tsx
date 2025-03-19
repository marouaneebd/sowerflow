'use client'
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { SupportTicket } from "@/types/support"

const formSchema = z.object({
  subject: z.string({
    required_error: "Veuillez sélectionner un sujet",
  }),
  description: z.string().min(10, {
    message: "La description doit contenir au moins 10 caractères",
  }),
})

const statusColors = {
  open: 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  resolved: 'bg-green-50 text-green-700 border-green-200',
  closed: 'bg-gray-50 text-gray-700 border-gray-200',
};

const statusLabels = {
  open: 'Ouvert',
  in_progress: 'En cours',
  resolved: 'Résolu',
  closed: 'Fermé',
};

const subjectLabels = {
  paiement: 'Paiement',
  technical: 'Problèmes techniques',
  feature: 'Proposition de fonctionnalité',
  other: 'Autre',
};

export default function Contact() {
  const router = useRouter();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [tickets, setTickets] = useState<(SupportTicket & { id: string })[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      setSubmitStatus(null);
      
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      setSubmitStatus({ 
        type: 'success', 
        message: 'Votre demande a été envoyée avec succès' 
      });
      form.reset();
      // We'll handle ticket fetching in the callback
      const fetchLatestTickets = async () => {
        try {
          const response = await fetch('/api/support');
          if (!response.ok) throw new Error('Failed to fetch tickets');
          const data = await response.json();
          setTickets(data);
        } catch (error) {
          console.error('Error fetching tickets:', error);
        }
      };
      fetchLatestTickets();
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus({ 
        type: 'error', 
        message: 'Une erreur est survenue lors de l\'envoi de votre demande' 
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
      return;
    }
    
    if (status === 'authenticated') {
      const checkProfileStatus = async () => {
        try {
          const res = await fetch('/api/profile');
          if (!res.ok) {
            router.push('/signin');
            return;
          }
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching profile:', error);
          router.push('/signin');
          setIsLoading(false);
        }
      };

      const fetchTickets = async () => {
        try {
          const response = await fetch('/api/support');
          if (!response.ok) throw new Error('Failed to fetch tickets');
          const data = await response.json();
          setTickets(data);
        } catch (error) {
          console.error('Error fetching tickets:', error);
        }
      };

      checkProfileStatus();
      fetchTickets();
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-24 bg-white">
      <div className="w-full max-w-4xl">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Contactez-nous</h1>
        
        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-6 sm:mb-8">
          {submitStatus && (
            <div className={`p-3 sm:p-4 mb-4 sm:mb-6 rounded-md ${
              submitStatus.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {submitStatus.message}
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Sujet</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-sm sm:text-base">
                          <SelectValue placeholder="Sélectionnez un sujet" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="paiement">Paiement</SelectItem>
                        <SelectItem value="technical">Problèmes techniques</SelectItem>
                        <SelectItem value="feature">Proposition de fonctionnalité</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Décrivez votre demande..."
                        className="resize-none text-sm sm:text-base min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer'}
              </Button>
            </form>
          </Form>
        </div>

        {/* Tickets Section */}
        {tickets.length > 0 && (
          <div className="mt-8 sm:mt-12">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Vos demandes précédentes</h2>
            <div className="space-y-3 sm:space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-3 sm:mb-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-medium">{subjectLabels[ticket.subject]}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Créé le {formatDate(ticket.created_at)}
                      </p>
                    </div>
                    <span className={`self-start px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm border ${statusColors[ticket.status]}`}>
                      {statusLabels[ticket.status]}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}