import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type InstagramStepProps = {
  instagram: string
  updateFormData: (field: 'instagram', value: string) => void
}

export default function InstagramStep({ instagram, updateFormData }: InstagramStepProps) {
  const [error, setError] = useState('')

  const validateInstagram = (value: string) => {
    const regex = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/
    if (!regex.test(value)) {
      setError('Nom d&apos;utilisateur Instagram invalide')
    } else {
      setError('')
    }
    updateFormData('instagram', value)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="instagram">Comment s&apos;appelle ta page Instagram ?</Label>
        <Input
          id="instagram"
          type="text"
          value={instagram}
          onChange={(e) => validateInstagram(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  )
}

