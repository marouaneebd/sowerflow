import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export async function verifyAuth(req: Request) {
  // Check for service account token
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token === process.env.SERVICE_ACCOUNT_TOKEN) {
      // Return a default system UID for internal operations
      return {
        uid: 'system',
        isSystem: true
      };
    }
  }

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