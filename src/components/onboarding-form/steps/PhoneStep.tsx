import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type PhoneStepProps = {
  phone: string
  updateFormData: (field: 'phone', value: string) => void
}

export default function PhoneStep({ phone, updateFormData }: PhoneStepProps) {
  const [error, setError] = useState('')

  const validatePhone = (value: string) => {
    const regex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/
    if (!regex.test(value)) {
      setError('Numéro de téléphone invalide')
    } else {
      setError('')
    }
    updateFormData('phone', value)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Quel est ton numéro de téléphone ?</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => validatePhone(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  )
}

