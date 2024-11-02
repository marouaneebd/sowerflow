import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth/next';


export async function POST(req: NextRequest) {
    try {
        // Parse the request body
        const { templateId, targetFirstName, targetLastName, targetCompany, } = await req.json();
        const session = await getServerSession({ req, ...authOptions });
        const uid = session?.user?.uid

        if (!uid) {
            return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
        }

        if (!templateId) {
            return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
        }

        const templateRef = doc(db, 'templates', templateId);
        const templateSnap = await getDoc(templateRef);

        console.log('ok 1')

        const profileRef = doc(db, 'profiles', uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists() && templateSnap.exists()) {
            console.log('ok 2')

            const profileData = profileSnap.data();
            const templateData = templateSnap.data();

            const plan = profileData?.plan;

            const currentDate = new Date(new Date().setHours(0, 0, 0, 0));
            const dateCreditsRefreshed = profileData?.dateCreditsRefreshed;

            console.log('ok 3')

            const reinitializeCredits = currentDate === dateCreditsRefreshed;
            console.log('ok 4')

            const creditsUsed = reinitializeCredits ? 0 : profileData?.creditsUsed;
            console.log('ok 5')


            const remainingCredits = (plan === "assisted" ? 10 : plan === "augmented" ? 15 : plan === "automated" ? 20 : 0) - creditsUsed;
            console.log('ok 5')

            console.log(profileData)


            if (profileData?.isActive && remainingCredits > 0) {

                let message = templateData?.templateContent;
                message = message.replaceAll('[firstname]', targetFirstName);
                message = message.replaceAll('[lastname]', targetLastName);
                message = message.replaceAll('[company]', targetCompany);

                if (reinitializeCredits) {
                    await updateDoc(profileRef, {
                        creditsUsed: 1,
                        dateCreditsRefreshed: new Date(new Date().setHours(0, 0, 0, 0)),
                        updatedAt: new Date().getTime().toString()
                    });
                }
                else {
                    await updateDoc(profileRef, {
                        creditsUsed: creditsUsed + 1,
                        updatedAt: new Date().getTime().toString()
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