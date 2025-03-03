import { ChatMessage } from "@/types/chat";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { Profile, PricingItem } from "@/types/profile";
import { z } from "zod";
import { adminDb } from '@/lib/firebase-admin';

// Change from array to object with function name as key
const availableTools = {
  abandonedConversation: {
    parameters: z.object({
      reason: z.string().describe('La raison pour laquelle la conversation est abandonnée')
    }),
    description: 'Utilise cette fonction si l\'utilisateur montre clairement qu\'il n\'est pas intéressé ou que la conversation ne mène nulle part.',
    execute: async (args: { reason: string }, _profile?: Profile, conversationId?: string) => {
      console.log('Abandon de la conversation', args.reason);

      if (conversationId) {
        const conversationRef = adminDb.collection('conversations').doc(conversationId);
        await conversationRef.update({
          status: 'abandoned',
          updated_at: Date.now(),
          abandon_reason: args.reason
        });
      }

      return "Pas de problème si tu n'es pas intéressé, je te souhaite une excellente continuation ! N'hésite pas à me contacter si tu changes d'avis.";
    }
  },
  settedConversation: {
    parameters: z.object({
      reason: z.string().describe('La raison pour laquelle la conversation est terminée')
    }),
    description: 'Utilise cette fonction si la conversation est terminée et que l\'utilisateur a pris rendez-vous avec toi.',
    execute: async (args: { reason: string }, profile: Profile, conversationId?: string) => {
      console.log('Conversation convertie en rendez-vous', args.reason);

      if (conversationId) {
        const conversationRef = adminDb.collection('conversations').doc(conversationId);
        await conversationRef.update({
          status: 'setted',
          updated_at: Date.now(),
          setted_reason: args.reason
        });
      }

      return `Voici un lien pour prendre rendez-vous : ${profile.onboarding_form?.calendly}`;
    }
  }
} as const;

export function buildDeveloperMessage(profileData: Profile | null): ChatMessage {
  let developerMessageContent = "Tu es un instagramer qui contacte ses followers sur Instagram et tu es un expert dans le domaine de la vente. Tu parles uniquement en français avec un vocabulaire familier et tu n'utilises pas beaucoup d'emojis. Tu privilégies des messages courts et concis. Tu dois chercher à comprendre le profil de la personne et amener naturellement la conversation vers une compréhension de ses besoins pour au final lui faire prendre rendez-vous avec toi via ton lien de prise de rendez-vous. Ne lui envoie le lien de prise qu'une fois qu'il a accepté de prendre rendez-vous. Fait en sorte d'amener le sujet de la vente de manière naturelle et sans être trop direct. Voici les informations concernant l'instagramer dont tu as besoin :";

  if (profileData?.onboarding_form) {
    const form = profileData.onboarding_form;

    if (form.product) {
      developerMessageContent += `\n- Service proposé: ${form.product}`;
    }

    if (form.offer) {
      developerMessageContent += `\n- L'offre est meilleure que les autres pour les raisons suivantes: ${form.offer}`;
    }

    if (form.pricing && form.pricing.length > 0) {
      developerMessageContent += `\n- Offres disponibles:`;
      form.pricing.forEach((item: PricingItem) => {
        developerMessageContent += `\n  * ${item.name}: ${item.price}€`;
      });
    }

    if (form.call_info) {
      developerMessageContent += `\n- Avant de prendre rendez-vous, l'instagramer doit avoir les informations suivantes: ${form.call_info}`;
    }
  }

  return {
    id: Date.now().toString(),
    role: "system",
    content: developerMessageContent
  };
}

export async function generateAIResponse(
  profileData: Profile,
  messages: ChatMessage[],
  conversationId?: string
): Promise<string> {
  const developerMessage = buildDeveloperMessage(profileData);

  interface ToolResult {
    type: string;
    toolCallId: string;
    toolName: string;
    args: Record<string, unknown>;
    result: string;
  }

  const response = await generateText({
    model: openai("gpt-4o-mini"),
    messages: [developerMessage, ...messages],
    tools: Object.entries(availableTools).reduce((acc, [name, tool]) => ({
      ...acc,
      [name]: {
        parameters: tool.parameters,
        description: tool.description,
        execute: async (args: { reason: string }) => {
          const result = await tool.execute(args, profileData, conversationId);
          return result;
        }
      }
    }), {})
  });

  // Update profile with new credits used
  const profileRef = adminDb.collection('profiles').doc(profileData.uuid);
  await profileRef.update({
    subscription: {
      ...profileData.subscription,
      credits_used: (profileData.subscription?.credits_used || 0) + 1
    }
  });

  // Si un outil a été appelé, retourner son résultat
  if (response.toolResults && response.toolResults.length > 0) {
    return (response.toolResults as ToolResult[])[0].result;
  }

  // Sinon retourner la réponse texte normale
  return response.text;
} 