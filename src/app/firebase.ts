import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { Profile } from "@/types/profile";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID
};


// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();

// Set the persistence to LOCAL to make sure the user session persists across page reloads
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Persistence set to LOCAL');
  })
  .catch((error) => {
    console.error('Error setting persistence:', error);
  });


export async function initializeProfile(stripeCustomerId: string, uid: string, email: string): Promise<void> {
  try {
    const db = getFirestore();
    const profileRef = doc(db, "profiles", uid); // Reference to the document in the 'profiles' collection

    // Get the current document
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      await setDoc(profileRef, {
        email: email,
        subscription: {
          plan: 'trial',
          stripe_customer_id: stripeCustomerId,
          credits_used: 0,
          subscription_end_date: new Date(new Date().setHours(0, 0, 0, 0))
        }
      });
    }
    console.log("Document successfully written!");
  } catch (error) {
    console.error("Error writing document: ", error);
  }
}

export async function getStripeCustomerId(uid: string): Promise<string | null> {
  try {
    // Reference to the user's document in the 'profiles' collection
    const profileRef = doc(db, "profiles", uid);
    const profileSnap = await getDoc(profileRef);

    // Check if the document exists
    if (profileSnap.exists()) {
      const profile = profileSnap.data() as Profile;

      // Return the stripeCustomerId if it exists
      return profile.subscription?.stripe_customer_id || null;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching Stripe Customer ID:", error);
    return null;
  }
}

export async function sendPasswordReset(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error fetching Stripe Customer ID:", error);
    return null;
  }
};

export { app, db, auth }