"use client"

import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { 
    Bold, 
    Italic, 
    List, 
    ListOrdered, 
    Link as LinkIcon, 
    Unlink, 
    Heading1, 
    Heading2, 
    Undo, 
    Redo 
} from 'lucide-react'

interface RichTextEditorProps {
    value: string
    onChange: (value: string) => void
    label?: string
    className?: string
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null

    const setLink = () => {
        const url = window.prompt('URL')
        if (url) {
            editor.chain().focus().setLink({ href: url }).run()
        }
    }

    return (
        <div className="flex flex-wrap gap-1 p-1 border-b border-border/50 bg-secondary/5 rounded-t-lg">
            <button
                onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run() }}
                className={`p-2 rounded hover:bg-secondary/80 transition-colors ${editor.isActive('bold') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                title="Bold"
            >
                <Bold size={16} />
            </button>
            <button
                onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run() }}
                className={`p-2 rounded hover:bg-secondary/80 transition-colors ${editor.isActive('italic') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                title="Italic"
            >
                <Italic size={16} />
            </button>
            <div className="w-[1px] h-6 bg-border/50 self-center mx-1" />
            <button
                onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run() }}
                className={`p-2 rounded hover:bg-secondary/80 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                title="H1"
            >
                <Heading1 size={16} />
            </button>
            <button
                onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run() }}
                className={`p-2 rounded hover:bg-secondary/80 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                title="H2"
            >
                <Heading2 size={16} />
            </button>
            <div className="w-[1px] h-6 bg-border/50 self-center mx-1" />
            <button
                onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run() }}
                className={`p-2 rounded hover:bg-secondary/80 transition-colors ${editor.isActive('bulletList') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                title="Bullet List"
            >
                <List size={16} />
            </button>
            <button
                onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run() }}
                className={`p-2 rounded hover:bg-secondary/80 transition-colors ${editor.isActive('orderedList') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                title="Ordered List"
            >
                <ListOrdered size={16} />
            </button>
            <div className="w-[1px] h-6 bg-border/50 self-center mx-1" />
            <button
                onClick={(e) => { e.preventDefault(); setLink() }}
                className={`p-2 rounded hover:bg-secondary/80 transition-colors ${editor.isActive('link') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                title="Link"
            >
                <LinkIcon size={16} />
            </button>
            <button
                onClick={(e) => { e.preventDefault(); editor.chain().focus().unsetLink().run() }}
                className="p-2 rounded hover:bg-secondary/80 transition-colors text-muted-foreground"
                disabled={!editor.isActive('link')}
                title="Unlink"
            >
                <Unlink size={16} />
            </button>
            <div className="flex-1" />
            <button
                onClick={(e) => { e.preventDefault(); editor.chain().focus().undo().run() }}
                className="p-2 rounded hover:bg-secondary/80 transition-colors text-muted-foreground"
                title="Undo"
            >
                <Undo size={16} />
            </button>
            <button
                onClick={(e) => { e.preventDefault(); editor.chain().focus().redo().run() }}
                className="p-2 rounded hover:bg-secondary/80 transition-colors text-muted-foreground"
                title="Redo"
            >
                <Redo size={16} />
            </button>
        </div>
    )
}

const RichTextEditor = ({ value, onChange, label, className }: RichTextEditorProps) => {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                // @ts-ignore — ensure no duplicate 'link' extension
                link: false,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary hover:underline cursor-pointer',
                },
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    // Update content if value changes externally (e.g. on load)
    React.useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value)
        }
    }, [value, editor])

    return (
        <div className={`space-y-2 ${className || ''}`}>
            {label && <label className="text-sm font-semibold text-foreground/80">{label}</label>}
            <div className="border border-border/50 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all bg-background/50">
                <MenuBar editor={editor} />
                <EditorContent 
                    editor={editor} 
                    className="prose prose-sm dark:prose-invert max-w-none p-4 min-h-[200px] focus:outline-none"
                />
            </div>
        </div>
    )
}

export default RichTextEditor
