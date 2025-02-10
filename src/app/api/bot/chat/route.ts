import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { verifyAuth } from '@/lib/auth';
import { generateAIResponse } from "@/lib/messageBuilder";

export const maxDuration = 30
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    // Verify authentication
    const auth = await verifyAuth(req);

    // Get messages from request
    const { messages } = await req.json();
    
    // Only get user profile for regular users
    const docRef = doc(db, 'profiles', auth.uid);
    const docSnap = await getDoc(docRef);
    const profileData = docSnap.exists() ? docSnap.data() : null;
    

    const text = await generateAIResponse(profileData, messages);

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

