import NextAuth, { NextAuthOptions, DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { signInWithEmailAndPassword, User as FirebaseUser } from 'firebase/auth';
import { auth, updateOrCreateStripeCustomerId, getStripeCustomerId } from '@/app/firebase';
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
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );
          const user: FirebaseUser = userCredential.user;

          if (user.email) {
            // Fetch or create Stripe customer ID
            let stripeCustomerId = await getStripeCustomerId(user.uid);
            if (!stripeCustomerId) {
              const stripeCustomer = await stripe.customers.create({
                email: user.email
              });
              stripeCustomerId = stripeCustomer.id;
              await updateOrCreateStripeCustomerId(stripeCustomerId, user.uid);
            }

            // Return the user object with uid and stripeCustomerId
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
        token.stripeCustomerId = user.stripeCustomerId; // Pass stripeCustomerId to the JWT
      }
      return token;
    },
    async session({ session, token }): Promise<Session> {
      if (token) {
        session.user.token = token;
        session.user.uid = token.uid;
        session.user.stripeCustomerId = token.stripeCustomerId; // Pass stripeCustomerId to the session
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
      await updateOrCreateStripeCustomerId(stripeCustomer.id, userId);
    }
  }
};

export default NextAuth(authOptions);
