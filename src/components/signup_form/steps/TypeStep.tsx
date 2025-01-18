import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Instagram, Building2, Briefcase } from 'lucide-react'

type TypeStepProps = {
  type: string
  updateFormData: (field: 'type', value: string) => void
}

export default function TypeStep({ type, updateFormData }: TypeStepProps) {
  const types = [
    { value: "Instagrammer", icon: Instagram, label: "Instagrammer" },
    { value: "Agence marketing", icon: Briefcase, label: "Agence marketing" },
    { value: "Entreprise", icon: Building2, label: "Entreprise" },
  ]

  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold">Comment vous décririez-vous ?</Label>
      <div className="grid grid-cols-3 gap-4">
        {types.map((item) => (
          <Card 
            key={item.value}
            className={`cursor-pointer transition-all ${
              type === item.value ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => updateFormData('type', item.value)}
          >
            <CardContent className="flex flex-col items-center justify-center p-6">
              <item.icon className="w-12 h-12 mb-2" />
              <span className="text-sm text-center">{item.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

