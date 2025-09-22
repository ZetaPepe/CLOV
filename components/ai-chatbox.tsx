"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, Bot, User } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isTyping?: boolean // Add typing indicator for line-by-line display
  lines?: string[] // Store lines for animated display
}

type WorkflowStep = "initial" | "awaiting_link" | "awaiting_tier" | "awaiting_field" | "awaiting_fomo" | "complete"

export function AIChatbox() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm CLOV AI, your crypto influencer valuation assistant. Please provide a social media link or username to get started with the valuation process.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [workflowStep, setWorkflowStep] = useState<WorkflowStep>("awaiting_link")
  const [selectedTier, setSelectedTier] = useState<string>("")
  const [selectedField, setSelectedField] = useState<string>("")
  const [selectedFomo, setSelectedFomo] = useState<string>("")
  const [userLink, setUserLink] = useState("")
  const [hasUserInteracted, setHasUserInteracted] = useState(false)

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    // Method 1: Scroll the messages end element into view
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      })
    }

    // Method 2: Fallback scroll container method with delay for mobile
    setTimeout(() => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight
        }
      }
    }, 100)
  }

  useEffect(() => {
    if (hasUserInteracted) {
      scrollToBottom()
    }
  }, [messages, isLoading, hasUserInteracted])

  const isValidLinkOrUsername = (text: string): boolean => {
    const urlRegex = /(https?:\/\/[^\s]+)/
    const usernameRegex = /^@[\w.]+$/

    return urlRegex.test(text) || usernameRegex.test(text)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    if (!hasUserInteracted) {
      setHasUserInteracted(true)
    }

    if (workflowStep === "awaiting_link") {
      if (!isValidLinkOrUsername(input.trim())) {
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content:
            "Please provide either a social media link (e.g., https://twitter.com/username) or a username preceded by @ symbol (e.g., @username).",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
        setInput("")
        return
      }

      // Valid link/username provided
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input.trim(),
        timestamp: new Date(),
      }

      setUserLink(input.trim())
      setMessages((prev) => [...prev, userMessage])
      setInput("")
      setWorkflowStep("awaiting_tier")

      const tierPromptMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Great! Now please select the follower count tier for this influencer:",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, tierPromptMessage])
      return
    }

    if (workflowStep === "complete") {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input.trim(),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInput("")
      setIsLoading(true)

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "Failed to get response")
        }

        const data = await response.json()

        if (!data.success || !data.message) {
          throw new Error(data.error || "Invalid response format")
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message.content,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
      } catch (error) {
        console.error("Error sending message:", error)
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleTierSelection = async (tier: string) => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true)
    }

    setSelectedTier(tier)

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `Selected tier: ${tier}`,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setWorkflowStep("awaiting_field")

    const fieldPromptMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "Perfect! Now please select the influencer's field:",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, fieldPromptMessage])
  }

  const handleFieldSelection = async (field: string) => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true)
    }

    setSelectedField(field)

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `Selected field: ${field}`,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setWorkflowStep("awaiting_fomo")

    const fomoPromptMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "Excellent! Now please select the FOMO factor:",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, fomoPromptMessage])
  }

  const handleFomoSelection = async (fomo: string) => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true)
    }

    setSelectedFomo(fomo)

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `Selected FOMO factor: ${fomo}`,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tier: selectedTier,
          field: selectedField,
          fomo: fomo,
          userLink: userLink,
          isTemplateRequest: true,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get template response")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isTyping: true,
        lines: data.lines || [],
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)

      if (data.lines && data.lines.length > 0) {
        let currentLineIndex = 0
        const displayInterval = setInterval(() => {
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id === assistantMessage.id) {
                const linesToShow = data.lines.slice(0, currentLineIndex + 1)
                return {
                  ...msg,
                  content: linesToShow.join("\n"),
                  isTyping: currentLineIndex < data.lines.length - 1,
                }
              }
              return msg
            }),
          )

          currentLineIndex++
          if (currentLineIndex >= data.lines.length) {
            clearInterval(displayInterval)
          }
        }, 100)
      }

      setWorkflowStep("complete")
    } catch (error) {
      console.error("Error getting template:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error getting the valuation template. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id="contact" className="text-white py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold tracking-tight text-purple-300 sm:text-5xl mb-4 drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]">
              Chat with CLOV AI
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Get instant insights about crypto influencer valuations and market analysis from our AI-powered assistant.
            </p>
          </div>

          <Card className="liquid-glass-enhanced border-white/20">
            <CardHeader className="pb-4 bg-black/60 border-b border-white/10">
              <CardTitle className="flex items-center gap-2 text-white">
                <Bot className="w-5 h-5 text-purple-400" />
                <span className="text-white font-semibold">CLOV AI Assistant</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea ref={scrollAreaRef} className="h-96 w-full rounded-md border border-white/10 p-4 bg-black/40">
                <div className="space-y-4 min-w-full overflow-x-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"} min-w-0`}
                    >
                      <div
                        className={`flex gap-2 max-w-[85%] sm:max-w-[80%] min-w-0 ${
                          message.role === "user" ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.role === "user"
                              ? "bg-lime-500/20 text-lime-400"
                              : "bg-purple-500/20 text-purple-400"
                          }`}
                        >
                          {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div
                          className={`rounded-lg px-4 py-2 min-w-0 overflow-x-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent ${
                            message.role === "user"
                              ? "bg-lime-500/20 text-white border border-lime-500/30"
                              : "bg-black/30 text-gray-100 border border-white/20"
                          }`}
                          style={{
                            /* Enable smooth horizontal scrolling on mobile */
                            WebkitOverflowScrolling: "touch",
                            scrollbarWidth: "thin",
                          }}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap font-mono break-words">
                            {message.content}
                            {message.isTyping && <span className="animate-pulse">|</span>}
                          </p>
                          <span className="text-xs text-gray-300 mt-1 block">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-500/20 text-purple-400">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-black/30 text-white border border-white/20 rounded-lg px-4 py-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {workflowStep === "awaiting_tier" && !isLoading && (
                <div className="space-y-3">
                  <Select onValueChange={handleTierSelection} disabled={isLoading}>
                    <SelectTrigger className="bg-lime-400 border-lime-300 text-black hover:bg-lime-300 transition-colors font-medium">
                      <SelectValue placeholder="Select follower count tier" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/20">
                      <SelectItem value="under-100k" className="text-white hover:bg-white/10">
                        Under 100k followers
                      </SelectItem>
                      <SelectItem value="100k-500k" className="text-white hover:bg-white/10">
                        100k - 500k followers
                      </SelectItem>
                      <SelectItem value="500k-1m" className="text-white hover:bg-white/10">
                        500k - 1M followers
                      </SelectItem>
                      <SelectItem value="1m-plus" className="text-white hover:bg-white/10">
                        1M+ followers
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {workflowStep === "awaiting_field" && !isLoading && (
                <div className="space-y-3">
                  <Select onValueChange={handleFieldSelection} disabled={isLoading}>
                    <SelectTrigger className="bg-lime-400 border-lime-300 text-black hover:bg-lime-300 transition-colors font-medium">
                      <SelectValue placeholder="Select the influencer's field" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/20">
                      <SelectItem value="crypto" className="text-white hover:bg-white/10">
                        Crypto
                      </SelectItem>
                      <SelectItem value="finance" className="text-white hover:bg-white/10">
                        Finance
                      </SelectItem>
                      <SelectItem value="ai" className="text-white hover:bg-white/10">
                        AI
                      </SelectItem>
                      <SelectItem value="gaming" className="text-white hover:bg-white/10">
                        Gaming
                      </SelectItem>
                      <SelectItem value="politics" className="text-white hover:bg-white/10">
                        Politics
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {workflowStep === "awaiting_fomo" && !isLoading && (
                <div className="space-y-3">
                  <Select onValueChange={handleFomoSelection} disabled={isLoading}>
                    <SelectTrigger className="bg-lime-400 border-lime-300 text-black hover:bg-lime-300 transition-colors font-medium">
                      <SelectValue placeholder="Select the FOMO factor" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/20">
                      <SelectItem value="0.1-0.3" className="text-white hover:bg-white/10">
                        0.1 – 0.3
                      </SelectItem>
                      <SelectItem value="0.3-0.6" className="text-white hover:bg-white/10">
                        0.3 – 0.6
                      </SelectItem>
                      <SelectItem value="0.6-0.8" className="text-white hover:bg-white/10">
                        0.6 – 0.8
                      </SelectItem>
                      <SelectItem value="0.8-1.0" className="text-white hover:bg-white/10">
                        0.8 – 1.0
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(workflowStep === "awaiting_link" || workflowStep === "complete") && (
                <form onSubmit={sendMessage} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      workflowStep === "awaiting_link"
                        ? "Enter social media link or username..."
                        : "Ask me anything about crypto influencer valuations..."
                    }
                    className="flex-1 bg-black/20 border-white/20 text-white placeholder:text-white/60 focus:border-purple-400/50"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white border-purple-500/50"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
