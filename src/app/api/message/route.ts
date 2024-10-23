import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth/next';

export async function GET(req: NextRequest) {
    try {
        // Retrieve query parameters from the URL
        const templateId = req.nextUrl.searchParams.get('templateId');
        const targetFirstName = req.nextUrl.searchParams.get('targetFirstName');
        const targetLastName = req.nextUrl.searchParams.get('targetLastName');
        const targetCompany = req.nextUrl.searchParams.get('targetCompany');

        // Get session details
        const session = await getServerSession({ req, ...authOptions });
        const uid = session?.user?.uid;

        // Check if the user is logged in
        if (!uid) {
            return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
        }

        // Validate required templateId parameter
        if (!templateId) {
            return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
        }

        console.log("ok 1")
        console.log(uid)


        const templateRef = doc(db, 'templates', templateId);
        const templateSnap = await getDoc(templateRef);

        const profileRef = doc(db, 'profiles', uid);
        const profileSnap = await getDoc(profileRef);

        console.log("ok 2")

        console.log(templateSnap.data())
        console.log(profileSnap.data())


        if (profileSnap.exists() && templateSnap.exists()) {
            console.log('Profile and template found');
            const profileData = profileSnap.data();
            const templateData = templateSnap.data();

            const plan = profileData?.plan;
            const currentDate = new Date(new Date().setHours(0, 0, 0, 0));
            const dateCreditsRefreshed = profileData?.dateCreditsRefreshed;

            const reinitializeCredits = currentDate === dateCreditsRefreshed;
            const creditsUsed = reinitializeCredits ? 0 : profileData?.creditsUsed;

            const remainingCredits =
                (plan === 'assisted' ? 10 : plan === 'augmented' ? 15 : plan === 'automated' ? 20 : 0) - creditsUsed;

            // Check if user has an active plan and remaining credits
            if (profileData?.isActive && remainingCredits > 0) {
                let message = templateData?.messageContent;
                message = message.replaceAll('[firstname]', targetFirstName || '');
                message = message.replaceAll('[lastname]', targetLastName || '');
                message = message.replaceAll('[company]', targetCompany || '');

                // Update the credits used
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

                return NextResponse.json({ message });
            } else {
                return NextResponse.json({ error: 'Plan not active or no remaining credits' }, { status: 400 });
            }
        } else {
            return NextResponse.json({ error: 'Profile or template not found' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error creating message:', error);
        return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
    }
}
