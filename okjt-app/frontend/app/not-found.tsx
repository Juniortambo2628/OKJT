"use client"

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function NotFound() {
    return (
        <main className="flex min-h-screen flex-col bg-[#050a1b] text-white">
            <Navbar />
            
            <section className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-6 py-32">
                {/* Background Decor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center relative z-10"
                >
                    <span className="text-primary font-mono font-bold text-sm tracking-[0.5em] uppercase mb-6 block">Error 404</span>
                    
                    <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tighter">
                        Lost in <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-200 to-white">Engineering.</span>
                    </h1>
                    
                    <p className="text-slate-400 max-w-lg mx-auto mb-12 text-lg leading-relaxed">
                        The resource you are looking for has been moved, archived, or never existed in this dimension. Let&apos;s get you back on track.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Button 
                            asChild
                            size="lg"
                            className="h-16 px-10 rounded-none bg-primary hover:bg-primary/90 text-black font-bold uppercase tracking-widest gap-3 group transition-all hover:scale-105"
                        >
                            <Link href="/">
                                <Home size={18} />
                                Back to Base
                            </Link>
                        </Button>
                        
                        <Button 
                            variant="outline"
                            size="lg"
                            className="h-16 px-10 rounded-none border-white/10 hover:bg-white/5 text-white font-bold uppercase tracking-widest gap-3 transition-all"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft size={18} />
                            Go Back
                        </Button>
                    </div>
                </motion.div>
                
                {/* Decorative Elements */}
                <div className="absolute bottom-20 left-10 w-40 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="absolute top-40 right-10 w-40 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </section>
            
            <Footer />
        </main>
    )
}
