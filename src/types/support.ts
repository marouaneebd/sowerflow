export type SupportTicket = {
  uuid: string;
  subject: 'paiement' | 'technical' | 'feature' | 'other';
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
} 