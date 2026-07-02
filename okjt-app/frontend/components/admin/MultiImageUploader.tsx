"use client"

import React from 'react'
import { Plus, X } from 'lucide-react'
import ImageUploader from '@/components/admin/ImageUploader'

interface MultiImageUploaderProps {
    value: string[]
    onChange: (urls: string[]) => void
    label?: string
    className?: string
    maxImages?: number
}

export default function MultiImageUploader({ value, onChange, label, className, maxImages = 10 }: MultiImageUploaderProps) {
    const handleAdd = () => {
        if (value.length < maxImages) {
            onChange([...value, ''])
        }
    }

    const handleUpdate = (index: number, url: string) => {
        const updated = [...value]
        updated[index] = url
        onChange(updated)
    }

    const handleRemove = (index: number) => {
        onChange(value.filter((_, i) => i !== index))
    }

    return (
        <div className={className}>
            {label && <label className="text-sm font-semibold text-foreground/80 mb-2 block">{label}</label>}

            <div className="space-y-3">
                {value.map((url, index) => (
                    <div key={index} className="relative">
                        <ImageUploader
                            value={url}
                            onChange={(newUrl) => handleUpdate(index, newUrl)}
                        />
                        <button
                            type="button"
                            onClick={() => handleRemove(index)}
                            className="absolute top-2 right-2 z-10 p-1 bg-destructive rounded-full text-white hover:bg-destructive/80 shadow-md"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}

                {value.length < maxImages && (
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="w-full border-2 border-dashed border-border/50 rounded-lg py-3 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                    >
                        <Plus className="h-4 w-4" />
                        Add Image
                    </button>
                )}
            </div>

            {value.length > 0 && (
                <p className="text-[10px] text-muted-foreground/50 mt-2">{value.length} of {maxImages} images added</p>
            )}
        </div>
    )
}
