import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth/next';


// GET method for fetching the plan field from a user's profile
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession({ req, ...authOptions });
    const uid = session?.user?.uid;
    const email = session?.user?.email;

    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }


    const docRef = doc(db, 'profiles', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const profileData = docSnap.data();

      // Get the 'plan' field value and check if it's valid
      const plan = profileData?.plan;
      const currentDate = new Date(new Date().setHours(0, 0, 0, 0));
      const dateCreditsRefreshed = profileData?.dateCreditsRefreshed;

      const reinitializeCredits = currentDate === dateCreditsRefreshed;
      const creditsUsed = reinitializeCredits ? 0 : profileData?.creditsUsed;

      const remainingCredits = (plan === "assisted" ? 10 : plan === "augmented" ? 15 : plan === "automated" ? 20 : 0) - creditsUsed;

      const profile = profileData;
      
      profile.email = email;
      profile.remainingCredits = remainingCredits

      if (profile) {
        return NextResponse.json(profile);
      } else {
        return NextResponse.json({ error: 'Invalid plan value' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching profile plan:', error);
    return NextResponse.json({ error: 'Failed to fetch plan' }, { status: 500 });
  }
}