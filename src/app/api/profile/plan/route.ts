import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';


// GET method for fetching the plan field from a user's profile
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Reference to the document in the 'profiles' collection
    const docRef = doc(db, 'profiles', body.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // Get the 'plan' field value and check if it's valid
      const plan = data?.plan;
      const validPlans = ['none', 'assisted', 'augmented', 'automated'];

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