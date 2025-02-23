import { useState, useEffect } from 'react'
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { FormData } from '../OnboardingForm'
import { Profile } from '@/types/profile'

interface InstagramStepProps {
  instagram: string
  instagramBio?: string
  updateFormData: (field: keyof FormData, value: FormData[keyof FormData]) => Promise<void>
}

export default function InstagramStep({ instagram, instagramBio, updateFormData }: InstagramStepProps) {
  const [error, setError] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Replace with your Instagram App ID and Redirect URI
  const INSTAGRAM_CLIENT_ID = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID
  const REDIRECT_URI = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI
  
  useEffect(() => {
    // Check if user is already connected to Instagram
    const checkInstagramConnection = async () => {
      try {
        const response = await fetch('/api/profile')
        const profile = await response.json() as Profile;


        
        if (profile.instagram?.username) {
          // Check if token is expired
          const tokenExpires = new Date(profile.instagram.token_expires)
          const now = new Date()
          
          if (tokenExpires > now) {
            setIsConnected(true)
            updateFormData('instagram', profile.instagram.username)
            updateFormData('instagramBio', profile.instagram.biography)
          } else {
            // Token is expired, reset connection state
            setIsConnected(false)
            setError('La connexion Instagram a expiré. Veuillez vous reconnecter.')
          }
        }
      } catch (err) {
        console.error('Error checking Instagram connection:', err)
      } finally {
        setIsLoading(false)
      }
    }

    checkInstagramConnection()

    // Handle Instagram OAuth redirect
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    
    if (code) {
      handleInstagramCallback(code)
    }
  }, [])

  const handleInstagramLogin = () => {
    const authUrl = `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=${INSTAGRAM_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish`
    window.location.href = authUrl
  }

  const handleInstagramCallback = async (code: string) => {
    try {
      const response = await fetch('/api/instagram/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()
      
      if (data.username) {
        setIsConnected(true)
        updateFormData('instagram', data.username)
        if (data.biography) {
          updateFormData('instagramBio', data.biography)
        }
        setError('')
      }
    } catch (err) {
      setError('Erreur lors de la connexion à Instagram: ' + err)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        {instagram ? (
          <div className="space-y-2">
            <p className="text-green-600">
              ✓ Compte Instagram connecté: @{instagram}
            </p>
            {instagramBio && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium mb-2">Votre bio Instagram:</h3>
                <p className="text-sm text-gray-600">{instagramBio}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="instagram">Connecte ton compte Instagram</Label>
            
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <span className="text-sm text-gray-500">Chargement...</span>
              </div>
            ) : !isConnected ? (
              <Button 
                onClick={handleInstagramLogin}
                className="w-full flex items-center justify-center gap-2"
              >
                <InstagramIcon className="w-5 h-5" />
                Se connecter avec Instagram
              </Button>
            ) : (
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md">
                <span className="text-green-600">✓</span>
                <span>Connecté en tant que @{instagram}</span>
              </div>
            )}
            
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

