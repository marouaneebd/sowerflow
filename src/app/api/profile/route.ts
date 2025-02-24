import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { verifyAuth } from '@/lib/auth';
import { Profile } from '@/types/profile';

// GET method for fetching the profile
export async function GET(req: NextRequest) {
  try {
    const { uid } = await verifyAuth(req);
    const profileRef = doc(db, 'profiles', uid);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profile = profileSnap.data() as Profile;


    return NextResponse.json(profile);

  } catch (error) {
    console.error('Error in GET /api/profile:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST method to handle form submission
export async function POST(req: NextRequest) {
  try {
    const { uid } = await verifyAuth(req);

    const formData = await req.json();

    // Validate form data
    if (!formData || typeof formData !== 'object') {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }

    const profileRef = doc(db, 'profiles', uid);
    const profileSnap = await getDoc(profileRef);

    const timestamp = new Date().toISOString();
    const profileUpdate: Partial<Profile> = {
      onboarding_form: formData,
      updated_at: timestamp,
      ...((!profileSnap.exists()) && {
        created_at: timestamp,
        subscription: {
          plan: 'trial'
        }
      })
    };

    await (profileSnap.exists()
      ? updateDoc(profileRef, profileUpdate)
      : setDoc(profileRef, profileUpdate)
    );

    return NextResponse.json({
      message: `Profile ${profileSnap.exists() ? 'updated' : 'created'} successfully`,
      timestamp
    });

  } catch (error) {
    console.error('Error in POST /api/profile:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}