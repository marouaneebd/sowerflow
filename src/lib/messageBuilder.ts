import { ChatMessage } from "@/types/chat";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { ProfileData } from "@/types/profile";
import { z } from "zod";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase";

// Change from array to object with function name as key
const availableTools = {
  abandonedConversation: {
    parameters: z.object({
      reason: z.string().describe('La raison pour laquelle la conversation est abandonnée')
    }),
    description: 'Utilise cette fonction si l\'utilisateur montre clairement qu\'il n\'est pas intéressé ou que la conversation ne mène nulle part.',
    execute: async (args: { reason: string }, conversationId?: string) => {
      console.log('Abandon de la conversation', args.reason);
      
      if (conversationId) {
        const conversationRef = doc(db, 'conversations', conversationId);
        await updateDoc(conversationRef, {
          status: 'abandoned',
          updated_at: Date.now(),
          abandon_reason: args.reason
        });
      }
      
      return { reason: args.reason };
    }
  },
  settedConversation: {
    parameters: z.object({
      reason: z.string().describe('La raison pour laquelle la conversation est terminée')
    }),
    description: 'Utilise cette fonction si la conversation est terminée et que l\'utilisateur a pris rendez-vous avec toi.',
    execute: async (args: { reason: string }, conversationId?: string) => {
      console.log('Conversation terminée', args.reason);
      
      if (conversationId) {
        const conversationRef = doc(db, 'conversations', conversationId);
        await updateDoc(conversationRef, {
          status: 'setted',
          updated_at: Date.now(),
          setted_reason: args.reason
        });
      }
      
      return { reason: args.reason };
    }
  }
} as const;

export function buildDeveloperMessage(profileData: ProfileData | null): ChatMessage {
  let developerMessageContent = "Tu es un instagramer qui contacte ses followers sur Instagram et tu es un expert dans le domaine de la vente. Tu parles uniquement en français sur un ton détendu et tu n'utilises pas beaucoup d'emojis. Tu privilégies des messages courts et concis. Tu dois chercher à comprendre le profil de la personne et amener naturellement la conversation vers une compréhension de ses besoins pour au final lui faire prendre rendez-vous avec toi via ton lien de prise de rendez-vous. Ne lui envoie le lien de prise qu'une fois qu'il a accepté de prendre rendez-vous. Fait en sorte d'amener le sujet de la vente de manière naturelle et sans être trop direct. Voici les informations concernant l'instagramer dont tu as besoin :";

  if (profileData?.onboardingForm) {
    const form = profileData.onboardingForm;
    
    if (form.product) {
      developerMessageContent += `\n- Service proposé: ${form.product}`;
    }
    
    if (form.offer) {
      developerMessageContent += `\n- L'offre est meilleure que les autres pour les raisons suivantes: ${form.offer}`;
    }
    
    if (form.pricing && form.pricing.length > 0) {
      developerMessageContent += `\n- Offres disponibles:`;
      form.pricing.forEach((item: { name: string; price: number }) => {
        developerMessageContent += `\n  * ${item.name}: ${item.price}€`;
      });
    }

    if (form.callInfo) {
      developerMessageContent += `\n- Avant de prendre rendez-vous, l'instagramer doit avoir les informations suivantes: ${form.callInfo}`;
    }
    
    if (form.calendly) {
      developerMessageContent += `\n- Lien de prise de rendez-vous: ${form.calendly}`;
    }
  }

  return {
    id: Date.now().toString(),
    role: "system",
    content: developerMessageContent
  };
}

export async function generateAIResponse(
  profileData: ProfileData | null, 
  messages: ChatMessage[],
  conversationId?: string
): Promise<string> {
  const developerMessage = buildDeveloperMessage(profileData);
  
  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    messages: [developerMessage, ...messages],
    tools: Object.entries(availableTools).reduce((acc, [name, tool]) => ({
      ...acc,
      [name]: {
        ...tool,
        execute: (args: { reason: string }) => tool.execute(args, conversationId)
      }
    }), {})
  });

  console.log('Réponse générée', text);

  return text;
} 