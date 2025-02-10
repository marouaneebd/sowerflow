import { ChatMessage } from "@/types/chat";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { ProfileData } from "@/types/profile";
export function buildSystemMessage(profileData: ProfileData | null): ChatMessage {
  let systemMessageContent = "Tu es un instagramer qui contacte ses followers sur Instagram et tu es un expert dans le domaine de la vente. Tu parles uniquement en français sur un ton détendu et tu n'utilises pas beaucoup d'emojis. Tu privilégies des messages courts et concis. Tu dois chercher à comprendre le profil de la personne et amener naturellement la conversation vers une compréhension de ses besoins pour au final lui faire prendre rendez-vous avec toi via ton lien de prise de rendez-vous. Ne lui envoie le lien de prise qu'une fois qu'il a accepté de prendre rendez-vous. Fait en sorte d'amener le sujet de la vente de manière naturelle et sans être trop direct. Voici les informations concernant l'instagramer dont tu as besoin :";

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

  return {
    id: Date.now().toString(),
    role: "system",
    content: systemMessageContent
  };
}

export async function generateAIResponse(
  profileData: ProfileData | null, 
  messages: ChatMessage[]
): Promise<string> {
  const systemMessage = buildSystemMessage(profileData);
  
  const { text } = await generateText({
    model: openai("gpt-4o"),
    messages: [systemMessage, ...messages],
  });
  
  return text;
} 