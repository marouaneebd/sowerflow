import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

type CallInfoStepProps = {
  callInfo: string
  updateFormData: (field: 'callInfo', value: string) => void
}

export default function CallInfoStep({ callInfo, updateFormData }: CallInfoStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="callInfo">De quelles informations tu as besoin pour préparer ton call ?</Label>
        <Textarea
          id="callInfo"
          value={callInfo}
          onChange={(e) => updateFormData('callInfo', e.target.value)}
          required
        />
      </div>
    </div>
  )
}

