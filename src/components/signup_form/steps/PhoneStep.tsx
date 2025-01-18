import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type PhoneStepProps = {
  phone: string
  updateFormData: (field: 'phone', value: string) => void
}

export default function PhoneStep({ phone, updateFormData }: PhoneStepProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="phone">Numéro de téléphone</Label>
      <Input
        id="phone"
        type="tel"
        value={phone}
        onChange={(e) => updateFormData('phone', e.target.value)}
        required
      />
    </div>
  )
}

