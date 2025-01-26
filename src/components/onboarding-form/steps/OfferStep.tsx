import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

type OfferStepProps = {
  offer: string
  updateFormData: (field: 'offer', value: string) => void
}

export default function OfferStep({ offer, updateFormData }: OfferStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="offer">En quoi ton offre est-elle différente ou meilleure que celle de tes concurrents ?</Label>
        <Textarea
          id="offer"
          value={offer}
          onChange={(e) => updateFormData('offer', e.target.value)}
          required
        />
      </div>
    </div>
  )
}

