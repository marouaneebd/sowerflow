import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ProductStepProps = {
  product: string
  updateFormData: (field: 'product', value: string) => void
}

export default function ProductStep({ product, updateFormData }: ProductStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="product">Quel est ton produit/service ?</Label>
        <Input
          id="product"
          type="text"
          value={product}
          onChange={(e) => updateFormData('product', e.target.value)}
          required
        />
      </div>
    </div>
  )
}

