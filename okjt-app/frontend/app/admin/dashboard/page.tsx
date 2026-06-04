"use client"

import React from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useApi } from '@/hooks/use-api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Eye, Users, TrendingUp, Globe, Clock, ExternalLink } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const AdminDashboardPage = () => {
    const { data: analytics, isLoading } = useApi('/analytics/summary')

    const statCards = [
        { label: 'Total Views', value: analytics?.total_views ?? 0, icon: Eye, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Today', value: analytics?.today_views ?? 0, icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { label: 'This Week', value: analytics?.week_views ?? 0, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        { label: 'Unique Visitors (30d)', value: analytics?.unique_visitors ?? 0, icon: Users, color: 'text-violet-400', bg: 'bg-violet-400/10' },
    ]

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
                    <p className="text-muted-foreground">Monitor site performance, page views, and visitor trends.</p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat) => {
                        const Icon = stat.icon
                        return (
                            <Card key={stat.label} className="bg-secondary/10 border-border/50">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-2 rounded-lg ${stat.bg}`}>
                                            <Icon size={20} className={stat.color} />
                                        </div>
                                    </div>
                                    {isLoading ? (
                                        <div className="h-8 w-24 bg-secondary/20 animate-pulse rounded" />
                                    ) : (
                                        <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Views Over Time */}
                    <Card className="bg-secondary/10 border-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Views Over Time</CardTitle>
                            <CardDescription>Page views for the last 14 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="h-[250px] w-full bg-secondary/5 animate-pulse rounded-lg flex items-center justify-center">
                                    <div className="w-full h-full p-4 flex flex-col justify-end gap-2">
                                        <div className="flex items-end justify-between gap-2 h-full">
                                            {[1,2,3,4,5,6,7,8,9,10].map(i => (
                                                <div key={i} className="bg-primary/10 rounded-t w-full" style={{ height: `${Math.random() * 60 + 20}%` }} />
                                            ))}
                                        </div>
                                        <div className="h-2 w-full bg-secondary/10 rounded" />
                                    </div>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={250}>
                                    <AreaChart data={analytics?.views_over_time || []}>
                                        <defs>
                                            <linearGradient id="viewGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.3)" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground)/0.5)" />
                                        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground)/0.5)" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--card))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                            }}
                                        />
                                        <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="url(#viewGradient)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top Pages */}
                    <Card className="bg-secondary/10 border-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Top Pages</CardTitle>
                            <CardDescription>Most visited pages (last 30 days)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="h-[250px] w-full bg-secondary/5 animate-pulse rounded-lg p-6 space-y-4">
                                    {[1,2,3,4,5].map(i => (
                                        <div key={i} className="flex gap-3">
                                            <div className="h-4 w-16 bg-secondary/20 rounded" />
                                            <div className="h-4 flex-1 bg-secondary/10 rounded" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={(analytics?.top_pages || []).slice(0, 6)} layout="vertical" margin={{ left: 80 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.3)" horizontal={false} />
                                        <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground)/0.5)" />
                                        <YAxis dataKey="path" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground)/0.5)" width={70} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--card))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                            }}
                                        />
                                        <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Top Referrers */}
                <Card className="bg-secondary/10 border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg">Top Referrers</CardTitle>
                        <CardDescription>Where your visitors come from (last 30 days)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <p className="text-muted-foreground">Loading...</p>
                        ) : analytics?.top_referrers?.length === 0 ? (
                            <div className="py-10 text-center border-2 border-dashed rounded-xl opacity-50">
                                No referrer data available yet.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {analytics?.top_referrers?.map((ref: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-3">
                                            <Globe size={16} className="text-muted-foreground" />
                                            <span className="text-sm font-medium truncate max-w-[300px]">{ref.referrer}</span>
                                        </div>
                                        <span className="text-sm font-bold text-primary">{ref.count} visits</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
}

export default AdminDashboardPage
