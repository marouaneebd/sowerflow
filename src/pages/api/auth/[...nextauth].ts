import NextAuth, { NextAuthOptions, DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { getStripeCustomerId, initializeProfile } from '@/app/api/auth/actions';
import { stripe } from '@/app/stripe';
import { Session } from 'next-auth';

declare module 'next-auth' {
  interface User {
    uid: string;
    stripeCustomerId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    uid: string;
    stripeCustomerId?: string;
  }
}

declare module 'next-auth' {
  interface Session {
    user: {
      token: JWT;
      uid: string;
      stripeCustomerId?: string;
    } & DefaultSession['user'];
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        try {
          // Use client-side Firebase for authentication
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );
          const user = userCredential.user;

          if (user.email) {
            // Use server-side functions for everything else
            let stripeCustomerId = await getStripeCustomerId(user.uid);
            
            if (!stripeCustomerId) {
              const stripeCustomer = await stripe.customers.create({
                email: user.email
              });
              stripeCustomerId = stripeCustomer.id;
              await initializeProfile(stripeCustomerId, user.uid, user.email);
            }

            return {
              id: user.uid,
              email: user.email,
              uid: user.uid,
              stripeCustomerId,
            };
          }
          return null;
        } catch (error) {
          console.error('Error during sign-in:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        token.uid = user.uid;
        token.stripeCustomerId = user.stripeCustomerId;
      }
      return token;
    },
    async session({ session, token }): Promise<Session> {
      if (token) {
        session.user.token = token;
        session.user.uid = token.uid;
        session.user.stripeCustomerId = token.stripeCustomerId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
  events: {
    createUser: async (message) => {
      const userId = message.user.id;
      const email = message.user.email;

      if (!userId || !email) {
        return;
      }

      // Create Stripe customer
      const stripeCustomer = await stripe.customers.create({
        email,
      });

      // Save Stripe customer ID in Firestore
      await initializeProfile(stripeCustomer.id, userId, email);
    }
  }
};

export default NextAuth(authOptions);
