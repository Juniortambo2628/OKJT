import React from 'react'

interface StatusBadgeProps {
    active: boolean
    activeLabel?: string
    inactiveLabel?: string
}

export function StatusBadge({ active, activeLabel = 'Active', inactiveLabel = 'Inactive' }: StatusBadgeProps) {
    return active ? (
        <span className="text-[10px] font-bold text-emerald-500 uppercase">{activeLabel}</span>
    ) : (
        <span className="text-[10px] font-bold text-amber-500 uppercase">{inactiveLabel}</span>
    )
}
