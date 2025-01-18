import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type EmailStepProps = {
  email: string
  password: string
  updateFormData: (field: 'email' | 'password', value: string) => void
}

export default function EmailStep({ email, password, updateFormData }: EmailStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => updateFormData('email', e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => updateFormData('password', e.target.value)}
          required
        />
      </div>
    </div>
  )
}

