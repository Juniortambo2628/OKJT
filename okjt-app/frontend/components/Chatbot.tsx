"use client"

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, ChevronRight } from 'lucide-react'
import { useSettings } from '@/hooks/use-settings'

interface Message {
    id: number
    role: 'bot' | 'user'
    text: string
}

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false)
    const { isEnabled, getSetting, isLoading } = useSettings()

    const faqDataJson = getSetting('chatbot_faq_data')
    const quickRepliesJson = getSetting('chatbot_quick_replies')

    const faqData = React.useMemo(() => {
        try {
            if (faqDataJson) {
                if (typeof faqDataJson === 'string') return JSON.parse(faqDataJson)
                return faqDataJson
            }
        } catch (e) { console.error("FAQ parse error", e) }
        return [
            {
                keywords: ['web', 'development', 'app', 'nextjs', 'laravel'],
                answer: 'We specialise in premium web engineering using Next.js, React, and Laravel to build high-performance applications.'
            },
            {
                keywords: ['contact', 'reach', 'email', 'phone', 'office', 'talk'],
                answer: 'You can reach us through our Contact page at /contact, or email us at hello@okjtech.co.ke.'
            },
            {
                keywords: ['service', 'offer', 'provide', 'do', 'help', 'what'],
                answer: 'OKJTech provides three core services: Custom Web Development, UI/UX Design, and Digital Strategy.'
            }
        ]
    }, [faqDataJson])

    const quickReplies = React.useMemo(() => {
        try {
            if (quickRepliesJson) {
                if (typeof quickRepliesJson === 'string') return JSON.parse(quickRepliesJson)
                return quickRepliesJson
            }
        } catch (e) { console.error("Quick replies parse error", e) }
        return [
            'What services do you offer?',
            'Tell me about Web Engineering',
            'How can I contact you?',
        ]
    }, [quickRepliesJson])

    const [messages, setMessages] = useState<Message[]>([
        { id: 0, role: 'bot', text: 'Hello! I\'m the OKJTech assistant. How can I help you today?' }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const isAssistantEnabled = isEnabled('okjt_assistant_enabled')

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        if (isOpen) inputRef.current?.focus()
    }, [isOpen])

    const findAnswer = (query: string): string => {
        const lower = query.toLowerCase()
        let bestMatch = { score: 0, answer: '' }

        for (const faq of faqData) {
            if (!faq.keywords || !Array.isArray(faq.keywords)) continue
            const score = faq.keywords.reduce((acc: number, kw: string) => acc + (lower.includes(kw.toLowerCase()) ? 1 : 0), 0)
            if (score > bestMatch.score) {
                bestMatch = { score, answer: faq.answer }
            }
        }

        return bestMatch.score > 0
            ? bestMatch.answer
            : 'I appreciate your question! For specialised queries, I\'d recommend reaching out to our team directly through the Contact page or requesting a consultation. Our experts can provide detailed guidance tailored to your needs.'
    }

    const handleSend = (text?: string) => {
        const msg = text || input.trim()
        if (!msg) return

        const userMsg: Message = { id: Date.now(), role: 'user', text: msg }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsTyping(true)

        setTimeout(() => {
            const answer = findAnswer(msg)
            setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: answer }])
            setIsTyping(false)
        }, 800 + Math.random() * 500)
    }

    if (isLoading || !isAssistantEnabled) return null

    return (
        <>
            {/* Floating button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-[80] w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all group"
                    >
                        <MessageCircle className="text-white" size={24} />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="fixed bottom-6 right-6 z-[80] w-[380px] h-[520px] bg-background border border-border shadow-2xl shadow-black/20 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-primary/20 rounded-full flex items-center justify-center">
                                    <Bot size={18} className="text-primary" />
                                </div>
                                <div>
                                    <h4 className="text-foreground font-bold text-sm">OKJTech Assistant</h4>
                                    <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> Online
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-muted-foreground/40 hover:text-foreground">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                        msg.role === 'bot' ? 'bg-primary/10' : 'bg-secondary'
                                    }`}>
                                        {msg.role === 'bot' ? <Bot size={14} className="text-primary" /> : <User size={14} className="text-muted-foreground" />}
                                    </div>
                                    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                                        msg.role === 'bot'
                                            ? 'bg-secondary/40 text-foreground rounded-tl-none border border-border/50'
                                            : 'bg-primary text-white rounded-tr-none shadow-md shadow-primary/10'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex gap-2">
                                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                        <Bot size={14} className="text-primary" />
                                    </div>
                                    <div className="bg-secondary/40 border border-border/50 rounded-xl rounded-tl-none px-4 py-3">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-muted-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-2 h-2 bg-muted-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-2 h-2 bg-muted-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick replies (only show initially) */}
                        {messages.length <= 1 && (
                            <div className="px-4 pb-2 flex flex-wrap gap-2">
                                {Array.isArray(quickReplies) && quickReplies.map((qr: string) => (
                                    <button
                                        key={qr}
                                        onClick={() => handleSend(qr)}
                                        className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-all flex items-center gap-1"
                                    >
                                        {qr} <ChevronRight size={10} />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-3 border-t border-border bg-background">
                            <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask a question..."
                                    className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/40 focus:border-primary/50"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="p-2 bg-primary rounded-lg text-white disabled:opacity-30 hover:bg-primary/90 transition-all"
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default Chatbot
