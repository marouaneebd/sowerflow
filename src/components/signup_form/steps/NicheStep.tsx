import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShirtIcon as Tshirt, Palette, Dumbbell, Plane, Utensils, Smartphone, PaintbrushIcon as PaintBrush, Music, Coffee, Briefcase, GraduationCap, MoreHorizontal } from 'lucide-react'

type NicheStepProps = {
  niche: string
  updateFormData: (field: 'niche', value: string) => void
}

const niches = [
  { value: "Mode", icon: Tshirt },
  { value: "Beauté", icon: Palette },
  { value: "Fitness", icon: Dumbbell },
  { value: "Voyage", icon: Plane },
  { value: "Nourriture", icon: Utensils },
  { value: "Technologie", icon: Smartphone },
  { value: "Art", icon: PaintBrush },
  { value: "Musique", icon: Music },
  { value: "Lifestyle", icon: Coffee },
  { value: "Business", icon: Briefcase },
  { value: "Éducation", icon: GraduationCap },
  { value: "Autre", icon: MoreHorizontal }
]

export default function NicheStep({ niche, updateFormData }: NicheStepProps) {
  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold">Dans quelle niche opérez-vous ?</Label>
        <ScrollArea className="h-[300px] pr-4">
        <div className="grid grid-cols-3 gap-4 p-4">
          {niches.map((item) => (
            <Card 
              key={item.value}
              className={`cursor-pointer transition-all ${
                niche === item.value ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => updateFormData('niche', item.value)}
            >
              <CardContent className="flex items-center p-4">
                <item.icon className="w-6 h-6 mr-2" />
                <span className="text-sm">{item.value}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

