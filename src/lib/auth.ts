import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export async function verifyAuth(req: Request) {
  // Regular user authentication
  const session = await getServerSession({ req, ...authOptions });
  const uid = session?.user?.uid;
  
  if (!uid) {
    throw new Error('Unauthorized, please log in.');
  }
  
  return { 
    uid,
    email: session?.user?.email,
    stripeCustomerId: session?.user?.stripeCustomerId,
    isSystem: false
  };
} 