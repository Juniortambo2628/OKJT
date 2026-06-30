"use client"

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import ImageUploader from '@/components/admin/ImageUploader'

export type SettingsFieldType = 'text' | 'textarea' | 'image' | 'boolean'

export interface SettingsFieldConfig {
    key: string
    label: string
    type: SettingsFieldType
    placeholder?: string
    accept?: string[]
    maxSizeMB?: number
}

interface SettingsFieldProps {
    config: SettingsFieldConfig
    value: string
    onChange: (key: string, value: string) => void
    className?: string
}

function SettingsFieldInput({ config, value, onChange, className }: SettingsFieldProps) {
    switch (config.type) {
        case 'text':
            return (
                <div className={`space-y-2 ${className}`}>
                    <Label className="text-sm font-semibold text-foreground/80">{config.label}</Label>
                    <Input
                        value={value || ''}
                        onChange={(e) => onChange(config.key, e.target.value)}
                        placeholder={config.placeholder}
                        className="bg-background/50"
                    />
                </div>
            )
        case 'textarea':
            return (
                <div className={`space-y-2 ${className}`}>
                    <Label className="text-sm font-semibold text-foreground/80">{config.label}</Label>
                    <textarea
                        value={value || ''}
                        onChange={(e) => onChange(config.key, e.target.value)}
                        placeholder={config.placeholder}
                        className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background/50 text-sm resize-y"
                    />
                </div>
            )
        case 'image':
            return (
                <ImageUploader
                    label={config.label}
                    value={value || ''}
                    onChange={(url) => onChange(config.key, url)}
                    accept={config.accept}
                    maxSizeMB={config.maxSizeMB || 10}
                />
            )
        case 'boolean':
            return (
                <div className={`flex items-center justify-between ${className}`}>
                    <Label className="text-sm font-semibold text-foreground/80">{config.label}</Label>
                    <Switch
                        checked={value === '1' || value === 'true'}
                        onCheckedChange={(checked) => onChange(config.key, checked ? '1' : '0')}
                    />
                </div>
            )
        default:
            return null
    }
}

export default SettingsFieldInput

interface SettingsFieldGroupProps {
    fields: SettingsFieldConfig[]
    values: Record<string, string>
    onChange: (key: string, value: string) => void
    className?: string
}

export function SettingsFieldGroup({ fields, values, onChange, className = '' }: SettingsFieldGroupProps) {
    return (
        <div className={`space-y-6 ${className}`}>
            {fields.map((field) => (
                <SettingsFieldInput
                    key={field.key}
                    config={field}
                    value={values[field.key] || ''}
                    onChange={onChange}
                />
            ))}
        </div>
    )
}
