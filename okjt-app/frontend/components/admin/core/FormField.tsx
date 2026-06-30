import React from 'react'

interface FormFieldProps {
    label: string
    htmlFor?: string
    error?: string
    children: React.ReactNode
    className?: string
}

export function FormField({ label, htmlFor, error, children, className = '' }: FormFieldProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            <label htmlFor={htmlFor} className="text-sm font-medium text-muted-foreground">{label}</label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    )
}
