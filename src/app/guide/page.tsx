'use client'
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientButton } from '@/components/onboarding-form/GradientButton';

export default function Guide() {
  const router = useRouter();
  return (
    <div className="container mx-auto py-10 px-4 md:px-6 max-w-5xl">
      <h1 className="text-4xl font-bold mb-8 text-center">Guide d&apos;Utilisation de votre Setter</h1>
      
      <p className="text-lg mb-8 text-center">
        Votre setter vous permet d&apos;automatiser les conversations avec les personnes qui interagissent avec votre profil Instagram. 
        Voici les différents événements qui peuvent déclencher l&apos;envoi de messages automatiques.
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Qu&apos;est-ce qu&apos;un déclencheur ?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Un déclencheur est une action effectuée par un utilisateur Instagram qui interagit avec votre contenu. 
            Lorsqu&apos;un de ces événements se produit, notre système peut automatiquement envoyer un message personnalisé à cette personne, 
            augmentant ainsi vos chances de convertir cet intérêt en rendez-vous commercial.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Les commentaires</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Chaque fois qu&apos;une personne commente l&apos;une de vos publications ou vidéos en direct, notre système peut être déclenché.
          </p>
          
          <h3 className="text-xl font-semibold mb-2">Comment maximiser ces déclencheurs ?</h3>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>Publiez régulièrement du contenu qui suscite des réactions (questions, sondages, débats)</li>
            <li>Terminez vos posts avec une question pour encourager les commentaires</li>
            <li>Organisez des sessions en direct et encouragez l&apos;interaction</li>
            <li>Répondez aux commentaires pour stimuler davantage de conversations</li>
            <li>Créez des concours qui nécessitent de commenter pour participer</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Les mentions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Lorsqu&apos;une personne vous mentionne (@votrecompte) dans une publication ou un commentaire, notre système peut envoyer un message automatisé.
          </p>
          
          <h3 className="text-xl font-semibold mb-2">Comment maximiser ces déclencheurs ?</h3>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>Encouragez vos clients existants à vous mentionner dans leurs publications</li>
            <li>Créez des campagnes "Mentionnez-nous pour..." avec un incitatif</li>
            <li>Partagez et réagissez aux stories où vous êtes mentionné pour encourager d&apos;autres à faire de même</li>
            <li>Collaborez avec des influenceurs qui vous mentionneront</li>
            <li>Créez des événements virtuels avec un hashtag dédié et encouragez les mentions</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Les messages directs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Notre système peut répondre automatiquement aux personnes qui vous envoient un message direct ou qui répondent à votre story.
          </p>
          
          <h3 className="text-xl font-semibold mb-2">Comment maximiser ces déclencheurs ?</h3>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>Ajoutez des stickers interactifs à vos stories (questions, sondages, quiz)</li>
            <li>Créez des stories qui incitent à l&apos;action ("Envoyez-moi un message pour...")</li>
            <li>Partagez des offres exclusives disponibles uniquement via message direct</li>
            <li>Mettez en place un appel à l&apos;action clair dans votre bio ("DM pour plus d&apos;infos")</li>
            <li>Utilisez les fonctionnalités de liens dans les stories avec un CTA fort</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Réponses aux publicités (Reels, Carrousel, etc.)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Lorsque quelqu&apos;un interagit avec vos publicités Instagram, notre système peut également être déclenché.
          </p>
          
          <h3 className="text-xl font-semibold mb-2">Comment maximiser ces déclencheurs ?</h3>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>Créez des publicités qui encouragent les commentaires</li>
            <li>Utilisez des publicités avec des boutons CTA qui dirigent vers une conversation</li>
            <li>Testez différents formats publicitaires (carrousel, stories, reels) pour maximiser l&apos;engagement</li>
            <li>Ciblez précisément votre audience pour augmenter la pertinence et l&apos;engagement</li>
            <li>Incluez une offre spéciale accessible uniquement en commentant ou en envoyant un message</li>
          </ul>
        </CardContent>
      </Card>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-bold text-green-800 mb-3">Conseils supplémentaires pour maximiser les déclencheurs</h3>
        <ul className="list-disc pl-5 mb-4 space-y-3 text-green-700">
          <li>
            <strong>Soyez cohérent :</strong> Publiez régulièrement pour maintenir votre audience engagée
          </li>
          <li>
            <strong>Créez du contenu de qualité :</strong> Plus votre contenu est pertinent et intéressant, plus il génère d&apos;interactions
          </li>
          <li>
            <strong>Utilisez les hashtags stratégiquement :</strong> Ils augmentent la visibilité de vos publications
          </li>
          <li>
            <strong>Créez des partenariats :</strong> Collaborez avec d&apos;autres comptes pour élargir votre audience
          </li>
          <li>
            <strong>Analysez vos performances :</strong> Identifiez le type de contenu qui génère le plus d&apos;interactions et adaptez votre stratégie
          </li>
        </ul>
      </div>

      <div className="text-center">
        <GradientButton
          onClick={() => router.push('/home')}
        >
          Commencer à configurer mes automatisations
        </GradientButton>
      </div>
    </div>
  )
}