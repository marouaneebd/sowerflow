'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card"
import EmailStep from './steps/EmailStep'
import PhoneStep from './steps/PhoneStep'
import TypeStep from './steps/TypeStep'
import NicheStep from './steps/NicheStep'
import { Transition } from './Transition'
import { ProgressBar } from './ProgressBar'
import { GradientButton } from './GradientButton'

type FormData = {
  email: string
  password: string
  phone: string
  type: 'Instagrammer' | 'Agence marketing' | 'Entreprise' | ''
  niche: string
}

export default function MultiStepForm() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    phone: '',
    type: '',
    niche: ''
  })

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4))
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

  const isStepValid = () => {
    switch(step) {
      case 1:
        return formData.email !== '' && formData.password !== ''
      case 2:
        return formData.type !== ''
      case 3:
        return formData.niche !== ''
      case 4:
        return formData.phone !== ''
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
              return <EmailStep 
                email={formData.email} 
                password={formData.password} 
                updateFormData={updateFormData} 
              />
            case 2:
              return <TypeStep 
                type={formData.type as 'Instagrammer' | 'Agence marketing' | 'Entreprise' | ''}
                updateFormData={updateFormData} 
              />
            case 3:
              return <NicheStep 
                niche={formData.niche} 
                updateFormData={updateFormData} 
              />
            case 4:
              return <PhoneStep 
                phone={formData.phone} 
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Form submitted:', formData)
      setIsSubmitting(false)
      // Here you would typically send the data to your backend
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardContent className="pt-6">
        <ProgressBar currentStep={step} totalSteps={4} />
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
          {step < 4 ? (
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

