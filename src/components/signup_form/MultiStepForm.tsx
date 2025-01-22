'use client'

import { useState } from 'react'
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
import { useRouter } from 'next/navigation'

type PricingItem = {
  name: string
  price: string
}

type FormData = {
  instagram: string
  product: string
  offer: string
  pricing: PricingItem[]
  callInfo: string
  messages: string[]
  phone: string
  calendly: string
}

export default function MultiStepForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    instagram: '',
    product: '',
    offer: '',
    pricing: [],
    callInfo: '',
    messages: [],
    phone: '',
    calendly: ''
  })

  const updateFormData = (field: keyof FormData, value: FormData[keyof FormData]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => setStep(prev => Math.min(prev + 1, 8))
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

  const isStepValid = () => {
    switch(step) {
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
          switch(step) {
            case 1:
              return <InstagramStep 
                instagram={formData.instagram} 
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
        const response = await fetch('/api/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          throw new Error('Failed to submit form');
        }

        console.log('Form submitted successfully');
        router.refresh()
        router.push('/')
        
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  return (
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
  )
}

