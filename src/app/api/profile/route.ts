import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAuth } from '@/lib/auth';
import { Profile, OnboardingForm } from '@/types/profile';

// GET method for fetching the profile
export async function GET(req: NextRequest) {
  try {
    const { uid } = await verifyAuth(req);
    const profileRef = adminDb.collection('profiles').doc(uid);
    const profileSnap = await profileRef.get();

    if (!profileSnap.exists) {
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

    const { onboarding_form } = await req.json();

    // Verify if the onboarding_form respects the OnboardingForm type
    if (
      !onboarding_form ||
      typeof onboarding_form !== 'object' ||
      !onboarding_form.product ||
      !onboarding_form.offer ||
      !onboarding_form.pricing ||
      !onboarding_form.messages ||
      !onboarding_form.phone ||
      !onboarding_form.calendly ||
      !onboarding_form.call_info ||
      !onboarding_form.status
    ) {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }

    const profileRef = adminDb.collection('profiles').doc(uid);
    const profileSnap = await profileRef.get();

    const timestamp = new Date().toISOString();
    const profileUpdate: Partial<Profile> = {
      onboarding_form: onboarding_form,
      updated_at: timestamp
    };

    await (profileSnap.exists
      ? profileRef.update(profileUpdate)
      : profileRef.set(profileUpdate)
    );

    return NextResponse.json({
      message: `Profile ${profileSnap.exists ? 'updated' : 'created'} successfully`,
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