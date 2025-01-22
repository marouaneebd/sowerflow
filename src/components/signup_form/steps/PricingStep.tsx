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
      <Label>Quel est le prix du produit/service, et y a-t-il des options ou formules disponibles ?</Label>
      {pricing.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Input value={item.name} readOnly />
          <Input value={`${item.price}€`} readOnly />
          <Button type="button" variant="ghost" onClick={() => removePricing(index)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <Label htmlFor="newName">Nom du produit</Label>
          <Input
            id="newName"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nom du produit"
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="newPrice">Prix (€)</Label>
          <Input
            id="newPrice"
            type="number"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            placeholder="Prix"
          />
        </div>
        <Button type="button" onClick={addPricing}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

