'use client'

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence, animate } from "framer-motion"
import ReactMarkdown from "react-markdown"
import { Badge } from "@/components/ui/badge"
const glowAnimation = {
    initial: { opacity: 0.5, scale: 1 },
    animate: {
        opacity: [0.5, 1, 0.5],
        scale: [1, 1.05, 1],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: [0.4, 0, 0.2, 1] as any,
        },
    },
}

const SUGGESTED_QUESTIONS = [
    { text: "How can I manage my anxiety better?" },
    { text: "I've been feeling overwhelmed lately" },
    { text: "Can we talk about improving sleep?" },
    { text: "I need help with work-life balance" },
]

export default function TherapyPage() {
    const params = useParams()
    const sessionId = params.sessionId as string
    const [message, setMessage] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [messages, setMessages] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [isChatPaused, setIsChatPaused] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const messageEndRef = useRef<HTMLDivElement>(null)

    const scrollBottom = () => {
        if (messageEndRef.current) {
            setTimeout(() => {
                messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
            }, 100)
        }
    }

    useEffect(() => {
        if (!isTyping) {
            scrollBottom()
        }
    }, [messages, isTyping])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim() || isTyping || isChatPaused) return

        const userMessage = {
            role: "user",
            content: message.trim(),
            timestamp: new Date(),
        }

        setMessages(prev => [...prev, userMessage])
        setMessage("")
        setIsTyping(true)

        try {
            const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: userMessage.content }),
            })

            if (!response.ok) {
                throw new Error("Failed to send message")
            }

            const data = await response.json()

            // Add AI response to messages
            if (data.aiMessage) {
                setMessages(prev => [...prev, {
                    ...data.aiMessage,
                    timestamp: new Date(data.aiMessage.timestamp),
                }])
            }
        } catch (error) {
            console.error("Error sending message:", error)
            // Add error message
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "I'm sorry, I'm having trouble responding right now. Please try again.",
                timestamp: new Date(),
            }])
        } finally {
            setIsTyping(false)
        }
    }

    const handleSuggestedQuestion = (text: string) => {
        setMessage(text)
    }

    useEffect(() => {
        if (!isTyping) {
            scrollBottom()
        }
    }, [messages, isTyping])

    return (
        <div className="relative max-w-7xl mx-auto px-4">
            <div className="flex h-[calc(100vh-4rem)] mt-20 gap-6">
                <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-background rounded-lg border">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div className="font-semibold">
                            <h2>Nerva AI</h2>
                            <p className="text-sm text-muted-foreground">
                                {messages.length} messages
                            </p>
                        </div>
                    </div>

                    {messages.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center p-4">
                            <div className="max-w-2xl w-full space-y-8">
                                <div className="text-center space-y-4">
                                    <div className="relative inline-flex flex-col items-center">
                                        <motion.div
                                            className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"
                                            initial="initial"
                                            animate="animate"
                                            variants={glowAnimation}
                                        />
                                        <div className="relative flex items-center gap-2 text-2xl font-semibold">
                                            <div className="relative">
                                                <Sparkles className="w-6 h-6 text-primary" />
                                                <motion.div
                                                    className="absolute inset-0 text-primary"
                                                    initial="initial"
                                                    animate="animate"
                                                    variants={glowAnimation}
                                                >
                                                    <Sparkles className="w-6 h-6" />
                                                </motion.div>
                                            </div>
                                            <span className="bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
                                                Nerva AI
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground mt-2">
                                            How can I assist you today?
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-3 relative">
                                    <motion.div
                                        className="absolute -inset-4 bg-gradient-to-b from-primary/5 to-transparent blur-xl"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    />
                                    {SUGGESTED_QUESTIONS.map((q, index) => (
                                        <motion.div
                                            key={q.text}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 + 0.5 }}
                                        >
                                            <Button
                                                variant="outline"
                                                className="w-full h-auto py-4 px-6 text-left justify-start hover:bg-muted/50 hover:border-primary/50 transition-all duration-300"
                                                onClick={() => handleSuggestedQuestion(q.text)}
                                            >
                                                {q.text}
                                            </Button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Chat messages
                        <div className="flex-1 overflow-y-auto scroll-smooth">
                            <div className="max-w-3xl mx-auto">
                                <AnimatePresence initial={false}>
                                    {messages.map((msg) => (
                                        <motion.div
                                            key={msg.timestamp.toISOString()}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className={cn(
                                                "px-6 py-8",
                                                msg.role === "assistant"
                                                    ? "bg-muted/30"
                                                    : "bg-background"
                                            )}
                                        >
                                            <div className="flex gap-4">
                                                <div className="w-8 h-8 shrink-0 mt-1">
                                                    {msg.role === "assistant" ? (
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
                                                            <Bot className="w-5 h-5" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                                                            <User className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-2 overflow-hidden min-h-[2rem]">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-medium text-sm">
                                                            {msg.role === "assistant"
                                                                ? "Nerva AI"
                                                                : "You"}
                                                        </p>
                                                        {msg.metadata?.technique && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                {msg.metadata.technique}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="prose prose-sm dark:prose-invert leading-relaxed">
                                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                    </div>
                                                    {msg.metadata?.goal && (
                                                        <p className="text-xs text-muted-foreground mt-2">
                                                            Goal: {msg.metadata.goal}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {isTyping && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="px-6 py-8 flex gap-4 bg-muted/30"
                                    >
                                        <div className="w-8 h-8 shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <p className="font-medium text-sm">Nerva AI</p>
                                            <p className="text-sm text-muted-foreground">Typing...</p>
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={messageEndRef} />
                            </div>
                        </div>
                    )}
                    <div className="border-t bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/50 p-4">
                        <form
                            onSubmit={handleSubmit}
                            className="max-w-3xl mx-auto flex gap-4 items-end relative"
                        >
                            <div className="flex-1 relative group">
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={
                                        isChatPaused
                                            ? "Complete the activity to continue..."
                                            : "Ask me anything..."
                                    }
                                    className={cn(
                                        "w-full resize-none rounded-2xl border bg-background",
                                        "p-3 pr-12 min-h-[48px] max-h-[200px]",
                                        "focus:outline-none focus:ring-2 focus:ring-primary/50",
                                        "transition-all duration-200",
                                        "placeholder:text-muted-foreground/70",
                                        (isTyping || isChatPaused) &&
                                        "opacity-50 cursor-not-allowed"
                                    )}
                                    rows={1}
                                    disabled={isTyping || isChatPaused}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                    }}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className={cn(
                                        "absolute right-1.5 bottom-3.5 h-[36px] w-[36px]",
                                        "rounded-xl transition-all duration-200",
                                        "bg-primary hover:bg-primary/90",
                                        "shadow-sm shadow-primary/20",
                                        (isTyping || isChatPaused || !message.trim()) &&
                                        "opacity-50 cursor-not-allowed",
                                        "group-hover:scale-105 group-focus-within:scale-105"
                                    )}
                                    disabled={isTyping || isChatPaused || !message.trim()}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }}
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </form>
                        <div className="mt-2 text-xs text-center text-muted-foreground">
                            Press <kbd className="px-2 py-0.5 rounded bg-muted">Enter ↵</kbd>{" "}
                            to send,
                            <kbd className="px-2 py-0.5 rounded bg-muted ml-1">
                                Shift + Enter
                            </kbd>{" "}
                            for new line
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}