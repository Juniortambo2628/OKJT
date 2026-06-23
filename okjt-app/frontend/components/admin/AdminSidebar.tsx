"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
    LayoutDashboard, 
    Briefcase, 
    FileText, 
    BarChart3, 
    Settings, 
    LogOut,
    ExternalLink,
    Quote,
    Building2,
    FolderOpen,
    PenTool,
    Users,
    MessageSquare,
    UserCircle,
    Zap,
    Mail,
    ShieldCheck,
    Rocket,
    Globe,
    Calendar
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAuth } from '@/components/AuthProvider'
import { useApi } from '@/hooks/use-api'
import { useTheme } from 'next-themes'
import { AdminThemeToggle } from './AdminThemeToggle'

const AdminSidebar = () => {
    const pathname = usePathname()
    const { logout } = useAuth()
    const { data: settingsByGroup } = useApi('/settings')

    // Helper to get setting value
    const getSetting = (key: string, defaultValue: string) => {
        if (!settingsByGroup) return defaultValue
        const allSettings = Object.values(settingsByGroup).flat() as any[]
        const setting = allSettings.find(s => s.key === key)
        return setting?.value || defaultValue
    }

    const { theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const logoWhiteBg = getSetting('logo_light', '/logos/OKJT-Logos/OKJTechLogo-Black_Transparent.png')
    const logoBlackBg = getSetting('logo_dark', '/logos/OKJT-Logos/OKJTechLogo-White_Transparent.png')
    
    const logo = theme === 'light' ? logoWhiteBg : logoBlackBg

    const menuItems = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Services', href: '/admin/services', icon: Briefcase },
        { name: 'Brand Pillars', href: '/admin/pillars', icon: Globe },
        { name: 'Insights', href: '/admin/insights', icon: FileText },
        { name: 'Projects', href: '/admin/projects', icon: FolderOpen },
        { name: 'Team', href: '/admin/team', icon: UserCircle },
        { name: 'Widgets', href: '/admin/widgets', icon: Zap },
        { name: 'Requests', href: '/admin/requests', icon: MessageSquare },
        { name: 'Stats', href: '/admin/stats', icon: BarChart3 },
        { name: 'Testimonials', href: '/admin/testimonials', icon: Quote },
        { name: 'Clients', href: '/admin/clients', icon: Building2 },
    { name: 'Subscribers', href: '/admin/subscribers', icon: Users },
    { name: 'RSVPs', href: '/admin/rsvps', icon: Calendar },
    { name: 'Email', href: '/admin/email', icon: Mail },
    { name: 'Legal', href: '/admin/legal', icon: ShieldCheck },
    { name: 'Content', href: '/admin/content', icon: PenTool },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
]

    return (
        <aside className="w-64 h-screen bg-secondary/10 border-r border-border/50 flex flex-col fixed left-0 top-0">
            <div className="p-6 border-b border-border/50">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <Image 
                            src={mounted ? logo : logoBlackBg} 
                            alt="OKJTech Logo" 
                            width={140} 
                            height={35} 
                            className="h-8 w-auto object-contain"
                        />
                        <ExternalLink size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />
                    </Link>
                    <AdminThemeToggle />
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                        <Link 
                            key={item.name} 
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-1.5 rounded-lg text-sm font-medium transition-all text-nowrap",
                                isActive 
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                            )}
                        >
                            <Icon size={16} />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-border/50">
                <button 
                    onClick={() => logout()}
                    className="flex items-center gap-3 px-4 py-1.5 w-full rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
                >
                    <LogOut size={16} />
                    Logout
                </button>
            </div>
        </aside>
    )
}

export default AdminSidebar
