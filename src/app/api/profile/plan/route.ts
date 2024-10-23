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
    console.log(session)


    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }


    const docRef = doc(db, 'profiles', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // Get the 'plan' field value and check if it's valid
      const plan = data?.plan;
      const validPlans = ['assisted', 'augmented', 'automated'];

      if (validPlans.includes(plan)) {
        return NextResponse.json({ plan });
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