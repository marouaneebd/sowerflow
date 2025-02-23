import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { verifyAuth } from '@/lib/auth';
import { Profile } from '@/types/profile';

// GET method for fetching the profile
export async function GET(req: NextRequest) {
  try {
    const { uid, email } = await verifyAuth(req);
    const docRef = doc(db, 'profiles', uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profileData = docSnap.data();

    return NextResponse.json({
      ...profileData,
      email
    });

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

    const docRef = doc(db, 'profiles', uid);
    const docSnap = await getDoc(docRef);

    const timestamp = new Date().toISOString();
    const profileUpdate: Partial<Profile> = {
      onboarding_form: formData,
      updated_at: timestamp,
      ...((!docSnap.exists()) && { 
        created_at: timestamp,
        plan: 'trial'
      })
    };

    await (docSnap.exists() 
      ? updateDoc(docRef, profileUpdate)
      : setDoc(docRef, profileUpdate)
    );

    return NextResponse.json({ 
      message: `Profile ${docSnap.exists() ? 'updated' : 'created'} successfully`,
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