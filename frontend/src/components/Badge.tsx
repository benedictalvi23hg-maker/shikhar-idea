import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'green' | 'amber' | 'red' | 'khaki' | 'olive' | 'cyan' | 'neutral'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const variantStyles = {
    green: 'bg-tactical-green/15 text-tactical-green border-tactical-green/40',
    amber: 'bg-tactical-amber/15 text-tactical-amber border-tactical-amber/40',
    red: 'bg-tactical-red/15 text-tactical-red border-tactical-red/40',
    khaki: 'bg-tactical-khaki/15 text-tactical-khaki border-tactical-khaki/40',
    olive: 'bg-tactical-olive/20 text-tactical-oliveLight border-tactical-olive/50',
    cyan: 'bg-tactical-cyan/15 text-tactical-cyan border-tactical-cyan/40',
    neutral: 'bg-tactical-card text-tactical-muted border-tactical-border'
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium border uppercase tracking-wider ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
