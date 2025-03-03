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

// Type guard function to validate OnboardingForm
function isValidOnboardingForm(form: unknown): form is OnboardingForm {
  if (!form || typeof form !== 'object') {
    return false;
  }
  
  const formObj = form as Record<string, unknown>;
  return (
    typeof formObj.product === 'string' &&
    typeof formObj.offer === 'string' &&
    Array.isArray(formObj.pricing) &&
    Array.isArray(formObj.messages) &&
    typeof formObj.phone === 'string' &&
    typeof formObj.calendly === 'string' &&
    typeof formObj.call_info === 'string' &&
    (formObj.status === 'pending' || formObj.status === 'finished')
  );
}

// POST method to handle form submission
export async function POST(req: NextRequest) {
  try {
    const { uid } = await verifyAuth(req);
    const { onboarding_form, stop_setter } = await req.json();

    // Validate onboarding_form if it's present
    if (onboarding_form && !isValidOnboardingForm(onboarding_form)) {
      return NextResponse.json({ error: 'Invalid onboarding form data' }, { status: 400 });
    }

    // Validate stop_setter if it's present
    if (stop_setter !== undefined && typeof stop_setter !== 'boolean') {
      return NextResponse.json({ error: 'Invalid stop_setter value' }, { status: 400 });
    }

    // If neither onboarding_form nor stop_setter is provided
    if (!onboarding_form && stop_setter === undefined) {
      return NextResponse.json({ error: 'No valid data provided' }, { status: 400 });
    }

    const profileRef = adminDb.collection('profiles').doc(uid);
    const profileSnap = await profileRef.get();

    const timestamp = new Date().toISOString();
    const profileUpdate: Partial<Profile> = {
      updated_at: timestamp
    };

    if (onboarding_form) {
      profileUpdate.onboarding_form = onboarding_form;
    }
    if (stop_setter !== undefined) {
      profileUpdate.stop_setter = stop_setter;
    }

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