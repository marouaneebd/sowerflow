import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, X } from 'lucide-react'

type PricingItem = {
  name: string
  price: string
}

type PricingStepProps = {
  pricing: PricingItem[]
  updateFormData: (field: 'pricing', value: PricingItem[]) => void
}

export default function PricingStep({ pricing, updateFormData }: PricingStepProps) {
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')

  const addPricing = () => {
    if (newName && newPrice) {
      updateFormData('pricing', [...pricing, { name: newName, price: newPrice }])
      setNewName('')
      setNewPrice('')
    }
  }

  const removePricing = (index: number) => {
    const newPricing = pricing.filter((_, i) => i !== index)
    updateFormData('pricing', newPricing)
  }

  return (
    <div className="space-y-4">
      <Label className="text-sm sm:text-base">
        Quel est le prix du produit/service, et y a-t-il des options ou formules disponibles ?
      </Label>
      {pricing.map((item, index) => (
        <div key={index} className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="flex-1">
            <Input 
              value={item.name} 
              readOnly 
              className="text-xs sm:text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Input 
              value={`${item.price}€`} 
              readOnly 
              className="text-xs sm:text-sm"
            />
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => removePricing(index)}
              className="p-1 sm:p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
        <div className="flex-1 space-y-1">
          <Label htmlFor="newName" className="text-xs sm:text-sm">Nom du produit</Label>
          <Input
            id="newName"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nom du produit"
            className="text-xs sm:text-sm"
          />
        </div>
        <div className="flex-1 space-y-1">
          <Label htmlFor="newPrice" className="text-xs sm:text-sm">Prix (€)</Label>
          <Input
            id="newPrice"
            type="number"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            placeholder="Prix"
            className="text-xs sm:text-sm"
          />
        </div>
        <Button 
          type="button" 
          onClick={addPricing}
          className="w-full sm:w-auto mt-2 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-1" />
          <span className="text-xs sm:text-sm">Ajouter</span>
        </Button>
      </div>
    </div>
  )
}

