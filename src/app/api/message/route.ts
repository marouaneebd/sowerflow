import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth/next';

export async function OPTIONS() {
    const headers = {
        'Access-Control-Allow-Origin': '*', // Replace '*' with your specific origin if needed
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };
    return NextResponse.json({}, { headers });
}

export async function POST(req: NextRequest) {
    const headers = {
        'Access-Control-Allow-Origin': '*', // Replace '*' with your specific origin if needed
    };
    try {

        // Parse the request body
        const { templateId, targetFirstName, targetLastName, targetCompany } = await req.json();
        const session = await getServerSession({ req, ...authOptions });
        const uid = session?.user?.uid;

        console.log(templateId, targetFirstName);

        if (!uid) {
            return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401, headers });
        }

        if (!templateId) {
            return NextResponse.json({ error: 'Template ID is required' }, { status: 400, headers });
        }

        const templateRef = doc(db, 'templates', templateId);
        const templateSnap = await getDoc(templateRef);

        const profileRef = doc(db, 'profiles', uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists() && templateSnap.exists()) {
            console.log('profile and template found');
            const profileData = profileSnap.data();
            const templateData = templateSnap.data();

            const plan = profileData?.plan;

            const currentDate = new Date(new Date().setHours(0, 0, 0, 0));
            const dateCreditsRefreshed = profileData?.dateCreditsRefreshed;

            const reinitializeCredits = currentDate === dateCreditsRefreshed;
            const creditsUsed = reinitializeCredits ? 0 : profileData?.creditsUsed;

            const remainingCredits =
                (plan === 'assisted' ? 10 : plan === 'augmented' ? 15 : plan === 'automated' ? 20 : 0) - creditsUsed;

            if (profileData?.isActive && remainingCredits > 0) {
                let message = templateData?.messageContent;
                message = message.replaceAll('[firstname]', targetFirstName);
                message = message.replaceAll('[lastname]', targetLastName);
                message = message.replaceAll('[company]', targetCompany);

                if (reinitializeCredits) {
                    await updateDoc(profileRef, {
                        creditsUsed: 1,
                        dateCreditsRefreshed: new Date(new Date().setHours(0, 0, 0, 0)),
                        updatedAt: new Date().getTime().toString(),
                    });
                } else {
                    await updateDoc(profileRef, {
                        creditsUsed: creditsUsed + 1,
                        updatedAt: new Date().getTime().toString(),
                    });
                }

                return NextResponse.json({ message }, { headers });
            } else {
                return NextResponse.json({ error: 'Plan not active' }, { status: 400, headers });
            }
        } else {
            return NextResponse.json({ error: 'Profile or template not found' }, { status: 404, headers });
        }
    } catch (error) {
        console.error('Error creating message:', error);
        return NextResponse.json({ error: 'Failed to create message' }, { status: 500, headers });
    }
}
