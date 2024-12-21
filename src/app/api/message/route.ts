import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth/next';

// A small helper function to store a message or error in the "messages" collection
async function storeMessageInFirebase({
    uid,
    content,
    error,
}: {
    uid: string | undefined;
    content?: string;
    error?: string;
}) {
    // If uid is missing, you'll still need a doc ID. Fallback to 'unknown' if uid is not defined.
    const docId = uid
        ? `${uid}-${Date.now()}`
        : `unknown-${Date.now()}`;

    await setDoc(doc(db, 'messages', docId), {
        uid: uid ?? null,
        created_at: new Date().toISOString(),
        ...(content ? { message: content } : {}),
        ...(error ? { error } : {}),
    });
}

export async function POST(req: NextRequest) {
    try {
        // Parse the request body
        const { templateId, targetFirstName, targetLastName, targetCompany } =
            await req.json();
        const session = await getServerSession({ req, ...authOptions });
        const uid = session?.user?.uid;

        if (!uid) {
            // Store error message in "messages" collection
            await storeMessageInFirebase({
                uid,
                error: 'Unauthorized. Please log in.',
            });
            return NextResponse.json(
                { error: 'Unauthorized. Please log in.' },
                { status: 401 }
            );
        }

        if (!templateId) {
            // Store error message in "messages" collection
            await storeMessageInFirebase({
                uid,
                error: 'Template ID is required.',
            });
            return NextResponse.json(
                { error: 'Template ID is required' },
                { status: 400 }
            );
        }

        const templateRef = doc(db, 'templates', templateId);
        const templateSnap = await getDoc(templateRef);

        const profileRef = doc(db, 'profiles', uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists() && templateSnap.exists()) {
            const profileData = profileSnap.data();
            const templateData = templateSnap.data();

            const plan = profileData?.plan;

            // Zero out time for date comparisons
            const currentDate = new Date(new Date().setHours(0, 0, 0, 0));
            const dateCreditsRefreshed = profileData?.dateCreditsRefreshed;
            const reinitializeCredits = currentDate.valueOf() === dateCreditsRefreshed?.toDate()?.valueOf();

            const creditsUsed = reinitializeCredits ? 0 : profileData?.creditsUsed;
            const creditsByPlan =
                plan === 'assisted'
                    ? 10
                    : plan === 'augmented'
                        ? 15
                        : plan === 'automated'
                            ? 20
                            : 0;

            const remainingCredits = creditsByPlan - creditsUsed;

            if (profileData?.isActive && remainingCredits > 0) {
                let message = templateData?.templateContent;
                message = message.replaceAll('[firstname]', targetFirstName);
                message = message.replaceAll('[lastname]', targetLastName);
                message = message.replaceAll('[company]', targetCompany);

                // Update credits
                if (reinitializeCredits) {
                    await updateDoc(profileRef, {
                        creditsUsed: 1,
                        dateCreditsRefreshed: currentDate, // or new Date(new Date().setHours(0, 0, 0, 0))
                        updatedAt: new Date().getTime().toString(),
                    });
                } else {
                    await updateDoc(profileRef, {
                        creditsUsed: creditsUsed + 1,
                        updatedAt: new Date().getTime().toString(),
                    });
                }

                // Store success message in "messages" collection
                await storeMessageInFirebase({
                    uid,
                    content: message,
                });

                return NextResponse.json({ message });
            } else {
                // Store error message in "messages" collection
                await storeMessageInFirebase({
                    uid,
                    error: 'Plan not active or no remaining credits',
                });
                return NextResponse.json(
                    { error: 'Plan not active or no remaining credits' },
                    { status: 400 }
                );
            }
        } else {
            // Store error message in "messages" collection
            await storeMessageInFirebase({
                uid,
                error: 'Profile or template not found',
            });
            return NextResponse.json(
                { error: 'Profile or template not found' },
                { status: 404 }
            );
        }
    } catch (error: any) {
        console.error('Error creating message:', error);

        // Store the error in "messages" collection
        await storeMessageInFirebase({
            uid: undefined, // or pass a known uid if available
            error: error?.message || 'Failed to create message',
        });

        return NextResponse.json(
            { error: 'Failed to create message' },
            { status: 500 }
        );
    }
}
