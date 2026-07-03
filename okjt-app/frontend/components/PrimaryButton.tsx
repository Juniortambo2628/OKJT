"use client"

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

interface PrimaryButtonProps {
    href?: string
    onClick?: () => void
    children: React.ReactNode
    className?: string
    showArrow?: boolean
    variant?: 'solid' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    type?: 'button' | 'submit'
    disabled?: boolean
}

export default function PrimaryButton({
    href,
    onClick,
    children,
    className,
    showArrow = true,
    variant = 'solid',
    size = 'md',
    type = 'button',
    disabled = false
}: PrimaryButtonProps) {
    const baseClasses = cn(
        "inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-all duration-300 group",
        "rounded-full backdrop-blur-sm",
        size === 'sm' && "h-10 px-5 text-[11px]",
        size === 'md' && "h-12 px-7 text-xs",
        size === 'lg' && "h-14 px-10 text-sm",
        variant === 'solid' && "bg-primary text-[#14110b] hover:bg-primary/90 hover:scale-[1.03] active:scale-[0.98] shadow-lg shadow-primary/20",
        variant === 'outline' && "border border-primary/40 text-primary hover:bg-primary/10 hover:border-primary",
        variant === 'ghost' && "text-foreground/70 hover:text-primary hover:bg-primary/5",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
    )

    const content = (
        <>
            {children}
            {showArrow && (
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            )}
        </>
    )

    if (href) {
        return (
            <Link href={href} className={baseClasses}>
                {content}
            </Link>
        )
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={baseClasses}
        >
            {content}
        </button>
    )
}
