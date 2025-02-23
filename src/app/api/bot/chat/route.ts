import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { verifyAuth } from '@/lib/auth';
import { generateAIResponse } from "@/lib/messageBuilder";
import { Profile } from '@/types/profile';

export const maxDuration = 30
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    // Verify authentication
    const auth = await verifyAuth(req);

    // Get messages from request
    const { messages } = await req.json();
    
    // Only get user profile for regular users
    const profileRef = doc(db, 'profiles', auth.uid);
    const profileSnap = await getDoc(profileRef);
    const profile = profileSnap.exists() ? profileSnap.data() as Profile : null;

    // Check if profile exists
    if (!profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    const text = await generateAIResponse(profile, messages);

    // Update profile with new credits used
    await updateDoc(profileRef, {
      subscription: {
        credits_used: (profile.subscription?.credits_used || 0) + 1
      }
    });

    return new Response(JSON.stringify({ message: text }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error generating response:", error)
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return new Response(JSON.stringify({ error: 'Unauthorized. Please log in.' }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    return new Response(JSON.stringify({ error: "Failed to generate response" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

