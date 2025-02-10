import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { verifyAuth } from '@/lib/auth';
import { ChatMessage } from "@/types/chat"

export const maxDuration = 30
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    // Verify authentication
    const auth = await verifyAuth(req);
    
    // Only get user profile for regular users
    let profileData = null;
    if (!auth.isSystem) {
      const docRef = doc(db, 'profiles', auth.uid);
      const docSnap = await getDoc(docRef);
      profileData = docSnap.exists() ? docSnap.data() : null;
    }
    
    const { messages, profile } = await req.json();

    // If it's a system request, get the profile using profileId
    if (auth.isSystem && profile) {
      profileData = profile;
    }

    // Base system message
    let systemMessageContent = "Tu es un instagramer qui contacte ses followers sur Instagram et tu es un expert dans le domaine de la vente. Tu parles uniquement en français sur un ton détendu et tu n'utilises pas beaucoup d'emojis. Tu privilégies des messages courts et concis. Tu dois chercher à comprendre le profil de la personne et amener naturellement la conversation vers une compréhension de ses besoins pour au final lui faire prendre rendez-vous avec toi via ton lien de prise de rendez-vous. Ne lui envoie le lien de prise qu'une fois qu'il a accepté de prendre rendez-vous. Fait en sorte d'amener le sujet de la vente de manière naturelle et sans être trop direct. Voici les informations concernant l'instagramer dont tu as besoin :"
    
    // Enhance system message with onboarding data if available
    if (profileData?.onboardingForm) {
      const form = profileData.onboardingForm;
      
      if (form.product) {
        systemMessageContent += `\n- Service proposé: ${form.product}`;
      }
      
      if (form.offer) {
        systemMessageContent += `\n- L'offre est meilleure que les autres pour les raisons suivantes: ${form.offer}`;
      }
      
      if (form.pricing && form.pricing.length > 0) {
        systemMessageContent += `\n- Offres disponibles:`;
        form.pricing.forEach((item: { name: string; price: number }) => {
          systemMessageContent += `\n  * ${item.name}: ${item.price}€`;
        });
      }

      if (form.callInfo) {
        systemMessageContent += `\n- Avant de prendre rendez-vous, l'instagramer doit avoir les informations suivantes: ${form.callInfo}`;
      }
      
      if (form.calendly) {
        systemMessageContent += `\n- Lien de prise de rendez-vous: ${form.calendly}`;
      }
    }
    
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "system",
      content: systemMessageContent
    }

    const { text } = await generateText({
      model: openai("gpt-4o"),
      messages: [systemMessage, ...messages],
    })

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

