"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Bot, User } from "lucide-react"
import AccommodationCard from "./AccommodationCard"
import type { ChatMessage as ChatMessageType } from "@/lib/types"
import type { ComponentPropsWithoutRef } from "react"

interface ChatMessageProps {
  message: ChatMessageType
  isStreaming?: boolean
}

/* ── Markdown component overrides ─────────────────────────────────────────── */

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Headings
        h1: ({ children }) => (
          <h1 className="text-sm font-bold text-foreground mt-3 mb-1 pb-0.5 border-b border-border first:mt-0">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-sm font-bold text-foreground mt-2.5 mb-0.5 first:mt-0">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold text-foreground mt-2 mb-0.5 first:mt-0">
            {children}
          </h3>
        ),

        // Paragraphs
        p: ({ children }) => (
          <p className="text-sm leading-relaxed text-foreground mb-1.5 last:mb-0">
            {children}
          </p>
        ),

        // Lists — render as inline prose, no bullet symbols
        ul: ({ children }) => (
          <span className="inline">{children}</span>
        ),
        ol: ({ children }) => (
          <span className="inline">{children}</span>
        ),
        li: ({ children }) => (
          <span className="inline text-sm text-foreground">
            {children}{" "}
          </span>
        ),

        // Bold / Italic
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-muted-foreground">{children}</em>
        ),

        // Inline code
        code: ({ children, className, ...props }: ComponentPropsWithoutRef<"code">) => {
          const isBlock = className?.includes("language-")
          if (isBlock) {
            return (
              <code className="block bg-muted text-foreground text-xs rounded-lg px-3 py-2 my-2 overflow-x-auto font-mono whitespace-pre">
                {children}
              </code>
            )
          }
          return (
            <code className="bg-muted text-[#1A4FBF] dark:text-blue-400 text-xs font-mono px-1.5 py-0.5 rounded-md" {...props}>
              {children}
            </code>
          )
        },

        // Code block wrapper
        pre: ({ children }) => (
          <pre className="my-2 rounded-lg overflow-hidden">{children}</pre>
        ),

        // Horizontal rule (used as section separator)
        hr: () => (
          <hr className="my-3 border-border" />
        ),

        // Blockquote
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-[#1A4FBF] dark:border-blue-500 pl-3 my-2 text-muted-foreground italic text-sm">
            {children}
          </blockquote>
        ),

        // Table
        table: ({ children }) => (
          <div className="my-2 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-[#1A4FBF]/10 dark:bg-blue-900/30">{children}</thead>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-border">{children}</tbody>
        ),
        tr: ({ children }) => (
          <tr className="hover:bg-muted/40 transition-colors">{children}</tr>
        ),
        th: ({ children }) => (
          <th className="text-left px-3 py-2 text-xs font-semibold text-foreground uppercase tracking-wide">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-2 text-sm text-foreground">{children}</td>
        ),

        // Links
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1A4FBF] dark:text-blue-400 underline underline-offset-2 hover:opacity-80"
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

/* ── Message bubble ───────────────────────────────────────────────────────── */

export default function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${
          isUser ? "bg-[#FF5C5C]" : "bg-[#1A4FBF]"
        }`}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-white" />
        ) : (
          <Bot className="w-3.5 h-3.5 text-white" />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[88%] space-y-2 flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-[#FF5C5C] text-white rounded-tr-sm whitespace-pre-wrap"
              : "bg-card border border-border text-foreground shadow-sm rounded-tl-sm w-full"
          }`}
        >
          {isUser ? (
            message.content
          ) : (
            <>
              <MarkdownContent content={message.content} />
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-[#1A4FBF] ml-1 animate-pulse rounded-sm align-text-bottom opacity-70" />
              )}
            </>
          )}

          {/* Streaming cursor for user bubble (edge case) */}
          {isUser && isStreaming && (
            <span className="inline-block w-2 h-4 bg-white ml-1 animate-pulse rounded-sm align-text-bottom opacity-70" />
          )}
        </div>

        {/* Inline accommodation cards */}
        {!isUser && message.accommodations && message.accommodations.length > 0 && (
          <div className="w-full space-y-2">
            {message.accommodations.map((a) => (
              <AccommodationCard key={a.id} accommodation={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
