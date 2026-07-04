"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Trash2, Bot } from "lucide-react"
import ChatMessage from "./ChatMessage"
import { streamChat } from "@/lib/api"
import type { ChatMessage as ChatMessageType } from "@/lib/types"

const SESSION_KEY = "tourplanner_session"
const HISTORY_KEY = "tourplanner_chat"

const QUICK_PROMPTS = [
  "Best places in winter under ₹15,000",
  "Plan a 5-day beach trip",
  "Budget hotels in Cox's Bazar",
  "Find a homestay in Sajek Valley",
  "7-day Thailand trip for 2 people",
  "Adventure trips in Bandarban",
]

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr"
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

function loadHistory(): ChatMessageType[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveHistory(messages: ChatMessageType[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(messages))
}

interface ChatWidgetProps {
  isOpen: boolean
  prefill?: string
  onOpen: () => void
  onClose: () => void
}

export default function ChatWidget({ isOpen, prefill, onOpen, onClose }: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const sessionId = useRef(getSessionId())

  useEffect(() => { setMessages(loadHistory()) }, [])

  useEffect(() => {
    if (isOpen && prefill) {
      setInput(prefill)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, prefill])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim()
      if (!content || isStreaming) return

      const userMsg: ChatMessageType = { role: "user", content }
      const updatedHistory = [...messages, userMsg]
      setMessages(updatedHistory)
      saveHistory(updatedHistory)
      setInput("")
      setError(null)
      setIsStreaming(true)

      const assistantMsg: ChatMessageType = { role: "assistant", content: "" }
      setMessages((prev) => [...prev, assistantMsg])

      try {
        const historyForApi = updatedHistory.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
        }))

        let fullReply = ""
        await streamChat(content, historyForApi, sessionId.current, (chunk) => {
          fullReply += chunk
          setMessages((prev) => {
            const next = [...prev]
            next[next.length - 1] = { role: "assistant", content: fullReply }
            return next
          })
        })

        setMessages((prev) => { saveHistory(prev); return prev })
      } catch {
        setMessages((prev) => {
          const next = [...prev]
          next[next.length - 1] = {
            role: "assistant",
            content: "Sorry, I couldn't connect to the travel assistant. Please try again.",
          }
          saveHistory(next)
          return next
        })
        setError("Connection failed. Is the backend running?")
      } finally {
        setIsStreaming(false)
      }
    },
    [input, messages, isStreaming]
  )

  const clearChat = () => {
    setMessages([])
    localStorage.removeItem(HISTORY_KEY)
    setError(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={onOpen}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#1A4FBF] hover:bg-[#1641a0] text-white shadow-2xl flex items-center justify-center transition-colors"
            aria-label="Open AI travel assistant"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF5C5C] rounded-full flex items-center justify-center text-xs font-bold text-white">
              AI
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-50 w-[95vw] max-w-2xl h-[85vh] max-h-[780px] flex flex-col rounded-2xl shadow-2xl overflow-hidden bg-background border border-border"
          >
            {/* Header */}
            <div className="bg-[#1A4FBF] px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">AI Travel Assistant</p>
                <p className="text-blue-200 text-xs">Powered by GPT-4o · Prices in ₹ INR</p>
              </div>
              <button
                onClick={clearChat}
                className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="space-y-4">
                  <div className="text-center pt-4">
                    <div className="w-12 h-12 rounded-full bg-[#1A4FBF]/10 dark:bg-[#1A4FBF]/20 flex items-center justify-center mx-auto mb-3">
                      <Bot className="w-6 h-6 text-[#1A4FBF] dark:text-blue-400" />
                    </div>
                    <p className="font-semibold text-foreground text-sm">Hello! I&apos;m your AI travel consultant.</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                      Tell me where you&apos;d like to go, your budget in ₹, and how many days — I&apos;ll plan everything.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_PROMPTS.map((p) => (
                      <button
                        key={p}
                        onClick={() => sendMessage(p)}
                        className="text-xs text-left px-3 py-2 bg-card border border-border rounded-xl hover:border-[#1A4FBF] dark:hover:border-blue-600 hover:text-[#1A4FBF] dark:hover:text-blue-400 transition-colors leading-snug text-muted-foreground"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  message={msg}
                  isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
                />
              ))}

              {error && (
                <p className="text-xs text-red-500 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="bg-card border-t border-border p-3">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about travel..."
                  rows={1}
                  className="flex-1 resize-none text-sm rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-[#1A4FBF] focus:ring-2 focus:ring-[#1A4FBF]/20 placeholder:text-muted-foreground text-foreground max-h-28 overflow-y-auto"
                  style={{ minHeight: "40px" }}
                  disabled={isStreaming}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isStreaming}
                  className="w-10 h-10 rounded-xl bg-[#1A4FBF] hover:bg-[#1641a0] text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 text-center">
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
