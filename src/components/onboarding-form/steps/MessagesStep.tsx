import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, X } from 'lucide-react'

type MessagesStepProps = {
  messages: string[]
  updateFormData: (field: 'messages', value: string[]) => void
}

export default function MessagesStep({ messages, updateFormData }: MessagesStepProps) {
  const [newMessage, setNewMessage] = useState('')
  const [error, setError] = useState('')

  const validateUrl = (url: string) => {
    const regex = /^(https?:\/\/)?(www\.)?instagram\.com\/.+/i
    return regex.test(url)
  }

  const addMessage = () => {
    if (newMessage && validateUrl(newMessage)) {
      updateFormData('messages', [...messages, newMessage])
      setNewMessage('')
      setError('')
    } else {
      setError('Veuillez entrer un lien Instagram valide')
    }
  }

  const removeMessage = (index: number) => {
    const newMessages = messages.filter((_, i) => i !== index)
    updateFormData('messages', newMessages)
  }

  return (
    <div className="space-y-4">
      <Label>As-tu des liens vers des conversations Instagram qui ont bien fonctionné ou échoué par le passé ?</Label>
      {messages.map((message, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Input value={message} readOnly />
          <Button type="button" variant="ghost" onClick={() => removeMessage(index)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <Input
            type="url"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Lien de conversation Instagram"
          />
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
        <Button type="button" onClick={addMessage}>
          <Plus className="h-4 w-4" />
          <span className="text-xs sm:text-sm">Ajouter</span>

        </Button>
      </div>
    </div>
  )
}

