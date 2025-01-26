"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { unstable_noStore as noStore } from "next/cache"

export const maxDuration = 30
export const dynamic = "force-dynamic"

export default function Chat() {
  noStore()
  const [messages, setMessages] = useState<{ id: string; role: string; content: string }[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { id: Date.now().toString(), role: "user", content: input }
    setMessages((prevMessages) => [...prevMessages, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      const response = await fetch("/api/chat", {
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
        { id: Date.now().toString(), role: "assistant", content: data.message },
      ])
    } catch (error) {
      console.error("Error:", error)
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: Date.now().toString(), role: "assistant", content: "Désolé, j'ai rencontré une erreur. Veuillez réessayer ou contacter le support." },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const initializeChat = async () => {
      setIsTyping(true)
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [] }),
        })

        if (!response.ok) {
          throw new Error("Failed to fetch initial response")
        }

        const data = await response.json()
        setMessages([
          { id: Date.now().toString(), role: "assistant", content: data.message }
        ])
      } catch (error) {
        console.error("Error initializing chat:", error)
        setMessages([
          { 
            id: Date.now().toString(), 
            role: "assistant", 
            content: "Désolé, j'ai rencontré une erreur lors de l'initialisation. Veuillez rafraîchir la page ou contacter le support." 
          }
        ])
      } finally {
        setIsTyping(false)
      }
    }

    initializeChat()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Commencez à discuter avec votre nouveau setter IA</CardTitle>
        </CardHeader>
        <CardContent className="h-[60vh] overflow-y-auto">
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
    </div>
  )
}

