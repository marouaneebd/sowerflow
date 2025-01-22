import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type CalendlyStepProps = {
  calendly: string
  updateFormData: (field: 'calendly', value: string) => void
}

export default function CalendlyStep({ calendly, updateFormData }: CalendlyStepProps) {
  const [error, setError] = useState('')

  const validateLink = (value: string) => {
    const regex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
    if (!regex.test(value)) {
      setError('Lien invalide')
    } else {
      setError('')
    }
    updateFormData('calendly', value)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="calendly">As tu un lien de prise de rendez-vous (Calendly, Calendar …) ?</Label>
        <Input
          id="calendly"
          type="url"
          value={calendly}
          onChange={(e) => validateLink(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  )
}

