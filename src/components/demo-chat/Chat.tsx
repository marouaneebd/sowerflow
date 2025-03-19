"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { unstable_noStore as noStore } from "next/cache"
import { ChatMessage } from "@/types/chat"
import { GradientButton } from "@/components/onboarding-form/GradientButton"
import { Transition } from "@/components/onboarding-form/Transition"
import Link from "next/link"

export const maxDuration = 30
export const dynamic = "force-dynamic"

export default function Chat() {
  noStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [showActivation, setShowActivation] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const startConversation = async () => {
    setHasStarted(true)
    setIsTyping(true)
    try {
      const response = await fetch("/api/bot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [] }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch initial response")
      }

      const data = await response.json()
      setMessages([
        { id: Date.now().toString(), role: "assistant" as const, content: data.message }
      ])
    } catch (error) {
      console.error("Error initializing chat:", error)
      setMessages([
        { 
          id: Date.now().toString(), 
          role: "assistant" as const, 
          content: "Désolé, j'ai rencontré une erreur lors de l'initialisation. Veuillez rafraîchir la page ou contacter le support." 
        }
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: ChatMessage = { id: Date.now().toString(), role: "user" as const, content: input }
    setMessages((prevMessages) => [...prevMessages, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      const response = await fetch("/api/bot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch response")
      }

      const data = await response.json()
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: Date.now().toString(), role: "assistant" as const, content: data.message },
      ])
    } catch (error) {
      console.error("Error:", error)
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: Date.now().toString(), role: "assistant" as const, content: "Désolé, j'ai rencontré une erreur. Veuillez réessayer ou contacter le support." },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    if (hasStarted) {
      const timer = setTimeout(() => {
        setShowActivation(true)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [hasStarted])

  if (!hasStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white p-0 sm:p-4">
        <Card className="w-full max-w-5xl sm:max-w-2xl text-center">
          <CardHeader>
            <CardTitle>Essayez votre setter gratuitement</CardTitle>
            <CardDescription className="mt-2">
              Testez votre setter et voyez comment il interagit avec vos prospects Instagram.
              Cette démonstration vous donnera un aperçu de l&apos;expérience utilisateur.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <GradientButton onClick={startConversation} className="mt-4 px-8 py-4">
              Simuler une conversation
            </GradientButton>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white p-0 sm:p-4">
      {showActivation && (
        <Transition key="activation-message">
          <div className="mb-4 w-full max-w-5xl sm:max-w-2xl text-center space-y-3">
            <p className="text-base font-normal">Pour commencer à utiliser votre setter en situation réelle, activez votre compte</p>
            <Link href="/billing" className="block mt-2">
              <GradientButton className="px-8 py-4">
                Activer mon compte
              </GradientButton>
            </Link>
          </div>
        </Transition>
      )}
      {hasStarted ? (
        <Transition key="chat-interface">
          <Card className="w-full max-w-5xl sm:max-w-2xl">
            <CardHeader>
              <CardTitle>Cette conversation simule l&apos;engagement de votre setter avec un prospect</CardTitle>
            </CardHeader>
            <CardContent className="h-[35vh] overflow-y-auto">
              {messages
                .filter((m) => m.role !== "system")
                .map((m) => (
                  <div key={m.id.toString()} className={`mb-4 ${m.role === "user" ? "text-right" : "text-left"}`}>
                    <span
                      className={`inline-block p-2 rounded-lg ${
                        m.role === "user" ? "bg-black text-white" : "bg-gray-200 text-black"
                      }`}
                    >
                      {m.content}
                    </span>
                  </div>
                ))}
              {isTyping && (
                <div className="text-left">
                  <span className="inline-block p-2 rounded-lg bg-gray-200 text-black">
                    <span className="flex space-x-1">
                      <span className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce"></span>
                    </span>
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>
            <CardFooter>
              <form onSubmit={handleSubmit} className="flex w-full space-x-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Écrivez votre message ici..."
                  className="flex-grow"
                />
                <Button type="submit" disabled={isTyping}>
                  Envoyer
                </Button>
              </form>
            </CardFooter>
          </Card>
        </Transition>
      ) : (
        <Card className="w-full max-w-5xl sm:max-w-2xl text-center">
          <CardHeader>
            <CardTitle>Essayez votre setter gratuitement</CardTitle>
            <CardDescription className="mt-2">
              Testez votre setter et voyez comment il interagit avec vos prospects Instagram.
              Cette démonstration vous donnera un aperçu de l&apos;expérience utilisateur.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <GradientButton onClick={startConversation} className="mt-4 px-8 py-4">
              Simuler une conversation
            </GradientButton>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

