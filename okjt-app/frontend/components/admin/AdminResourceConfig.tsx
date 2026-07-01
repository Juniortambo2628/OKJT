"use client"

import React from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { FormField } from '@/components/admin/core/FormField'
import { IconPicker } from '@/components/admin/IconPicker'
import ImageUploader from '@/components/admin/ImageUploader'
import RichTextEditor from '@/components/admin/RichTextEditor'
import { ADMIN_INPUT_CLASSES } from '@/lib/config'
import { iconMap } from '@/components/admin/constants'

export interface FieldConfig {
  key: string
  label: string
  type: 'text' | 'number' | 'textarea' | 'rich-text' | 'select' | 'switch' | 'checkbox' | 'image' | 'icon-picker'
  required?: boolean
  placeholder?: string
  options?: { label: string; value: string }[]
  helperText?: string
  span?: number
  minRows?: number
  richTextMinHeight?: number
  imageAccept?: string[]
  imageMaxSizeMB?: number
}

export interface AdminResourceConfig<T> {
  endpoint: string
  resourceName: string
  title: string
  description: string
  actionLabel: string
  fields: FieldConfig[]
  initialForm: Partial<T>
  validate: (form: Partial<T>) => string | null
  filterFn: (item: T, term: string) => boolean
  statusField?: keyof T
  activeLabel?: string
  inactiveLabel?: string
  gridColsClass?: string
  dialogSizeClass?: string
  initialSortBy?: string
  initialSortOrder?: 'asc' | 'desc'
  hideStatusFilter?: boolean
  filterPlaceholder?: string
}

export function renderFieldsFromConfig(
  fields: FieldConfig[],
  form: Record<string, any>,
  setForm: (form: Record<string, any>) => void
) {
  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const value = form[field.key]
        const spanClass = field.span === 2 ? 'col-span-full' : ''

        const handleChange = (val: any) => setForm({ ...form, [field.key]: val })

        let input: React.ReactNode

        switch (field.type) {
          case 'text':
            input = (
              <Input
                className={ADMIN_INPUT_CLASSES}
                placeholder={field.placeholder}
                value={value || ''}
                onChange={(e) => handleChange(e.target.value)}
              />
            )
            break

          case 'number':
            input = (
              <Input
                type="number"
                className={ADMIN_INPUT_CLASSES}
                placeholder={field.placeholder}
                value={value ?? 0}
                onChange={(e) => handleChange(parseInt(e.target.value) || 0)}
              />
            )
            break

          case 'textarea':
            input = (
              <Textarea
                className={ADMIN_INPUT_CLASSES}
                placeholder={field.placeholder}
                rows={field.minRows || 4}
                value={value || ''}
                onChange={(e) => handleChange(e.target.value)}
              />
            )
            break

          case 'rich-text':
            input = (
              <RichTextEditor
                value={value || ''}
                onChange={handleChange}
              />
            )
            break

          case 'select':
            input = (
              <select
                className={ADMIN_INPUT_CLASSES}
                value={value || ''}
                onChange={(e) => handleChange(e.target.value)}
              >
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )
            break

          case 'switch':
            input = (
              <Switch
                checked={!!value}
                onCheckedChange={handleChange}
              />
            )
            break

          case 'checkbox':
            input = (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={!!value}
                  onCheckedChange={handleChange}
                  className="border-border"
                />
                <span className="text-sm text-muted-foreground">{field.placeholder || 'Enable'}</span>
              </div>
            )
            break

          case 'image':
            input = (
              <ImageUploader
                value={value || ''}
                onChange={handleChange}
                accept={field.imageAccept}
                maxSizeMB={field.imageMaxSizeMB}
              />
            )
            break

          case 'icon-picker':
            input = (
              <IconPicker
                selectedIcon={value || ''}
                onSelect={handleChange}
                icons={iconMap}
              />
            )
            break

          default:
            input = null
        }

        return (
          <div key={field.key} className={spanClass}>
            <FormField label={field.label + (field.required ? ' *' : '')}>
              {input}
              {field.helperText && (
                <p className="text-xs text-muted-foreground mt-1">{field.helperText}</p>
              )}
            </FormField>
          </div>
        )
      })}
    </div>
  )
}
