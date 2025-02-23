'use client'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import InstagramStep from './steps/InstagramStep'
import ProductStep from './steps/ProductStep'
import OfferStep from './steps/OfferStep'
import PricingStep from './steps/PricingStep'
import CallInfoStep from './steps/CallInfoStep'
import MessagesStep from './steps/MessagesStep'
import PhoneStep from './steps/PhoneStep'
import CalendlyStep from './steps/CalendlyStep'
import { Transition } from './Transition'
import { ProgressBar } from './ProgressBar'
import { GradientButton } from './GradientButton'

export type FormData = {
  instagram: string
  instagramBio?: string
  product: string
  offer: string
  pricing: PricingItem[]
  callInfo: string
  messages: string[]
  phone: string
  calendly: string
  status: 'not_started' | 'ongoing' | 'finished'
}

type PricingItem = {
  name: string
  price: string
}

type Props = {
  onComplete?: () => void;
}

export default function OnboardingForm({ onComplete }: Props) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    instagram: '',
    instagramBio: '',
    product: '',
    offer: '',
    pricing: [],
    callInfo: '',
    messages: [],
    phone: '',
    calendly: '',
    status: 'not_started'
  })

  useEffect(() => {
    if (formData.status === 'not_started') {
      setFormData(prev => ({ ...prev, status: 'ongoing' }))
    }
  }, [])

  const saveProgress = async (newData: Partial<FormData>) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData)
      });

      if (!response.ok) {
        throw new Error('Failed to save progress');
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  const updateFormData = async (field: keyof FormData, value: FormData[keyof FormData]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (isStepValid()) {
      saveProgress(formData)
      setStep(prev => Math.min(prev + 1, 8))
    }
  }

  const prevStep = () => {
    saveProgress(formData)
    setStep(prev => Math.max(prev - 1, 1))
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.instagram !== ''
      case 2:
        return formData.product !== ''
      case 3:
        return formData.offer !== ''
      case 4:
        return formData.pricing.length > 0
      case 5:
        return formData.callInfo !== ''
      case 6:
        return true
      case 7:
        return formData.phone !== ''
      case 8:
        return formData.calendly !== ''
      default:
        return false
    }
  }

  const renderStep = () => {
    return (
      <Transition key={step}>
        {(() => {
          switch (step) {
            case 1:
              return <InstagramStep
                instagram={formData.instagram}
                instagramBio={formData.instagramBio}
                updateFormData={updateFormData}
              />
            case 2:
              return <ProductStep
                product={formData.product}
                updateFormData={updateFormData}
              />
            case 3:
              return <OfferStep
                offer={formData.offer}
                updateFormData={updateFormData}
              />
            case 4:
              return <PricingStep
                pricing={formData.pricing}
                updateFormData={updateFormData}
              />
            case 5:
              return <CallInfoStep
                callInfo={formData.callInfo}
                updateFormData={updateFormData}
              />
            case 6:
              return <MessagesStep
                messages={formData.messages}
                updateFormData={updateFormData}
              />
            case 7:
              return <PhoneStep
                phone={formData.phone}
                updateFormData={updateFormData}
              />
            case 8:
              return <CalendlyStep
                calendly={formData.calendly}
                updateFormData={updateFormData}
              />
            default:
              return null
          }
        })()}
      </Transition>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isStepValid()) {
      setIsSubmitting(true)
      try {
        const finalFormData = { ...formData, status: 'finished' as const }
        await saveProgress(finalFormData)
        if (onComplete) {
          onComplete()
        }
      } catch (error) {
        console.error('Error submitting form:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-white">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[#ff6b2b] to-[#d22dfc] text-transparent bg-clip-text">
        Construisons ensemble ta stratégie de setting
      </h1>
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="pt-6">
          <ProgressBar currentStep={step} totalSteps={8} />
        </CardContent>
        <form onSubmit={handleSubmit}>
          <CardContent className="min-h-[300px]">
            {renderStep()}
          </CardContent>
          <CardFooter className={`flex ${step === 1 ? 'justify-end' : 'justify-between'}`}>
            {step > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                Précédent
              </Button>
            )}
            {step < 8 ? (
              <GradientButton
                type="button"
                onClick={nextStep}
                disabled={!isStepValid()}
              >
                Suivant
              </GradientButton>
            ) : (
              <GradientButton
                type="submit"
                isLoading={isSubmitting}
                disabled={!isStepValid()}
              >
                Soumettre
              </GradientButton>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

