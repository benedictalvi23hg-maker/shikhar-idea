import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  unit?: string
  icon: LucideIcon
  subtitle?: string
  trend?: string
  status?: 'optimal' | 'warning' | 'critical' | 'neutral'
  onClick?: () => void
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  subtitle,
  trend,
  status = 'neutral',
  onClick
}) => {
  const statusColors = {
    optimal: 'border-tactical-green/40 hover:border-tactical-green text-tactical-green',
    warning: 'border-tactical-amber/50 hover:border-tactical-amber text-tactical-amber',
    critical: 'border-tactical-red/50 hover:border-tactical-red text-tactical-red',
    neutral: 'border-tactical-border hover:border-tactical-olive text-tactical-khaki'
  }

  const iconBg = {
    optimal: 'bg-tactical-green/10 text-tactical-green border-tactical-green/20',
    warning: 'bg-tactical-amber/10 text-tactical-amber border-tactical-amber/20',
    critical: 'bg-tactical-red/10 text-tactical-red border-tactical-red/20',
    neutral: 'bg-tactical-olive/15 text-tactical-oliveLight border-tactical-olive/30'
  }

  return (
    <div
      onClick={onClick}
      className={`tactical-panel tactical-panel-hover p-3.5 flex flex-col justify-between transition-all ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : ''
      } ${statusColors[status]}`}
    >
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-tactical-muted font-semibold truncate pr-2">
          {title}
        </span>
        <div className={`w-7 h-7 rounded border flex items-center justify-center shrink-0 ${iconBg[status]}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="my-2">
        <div className="flex items-baseline space-x-1.5">
          <span className="text-2xl font-mono font-bold tracking-tight text-tactical-text">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-mono text-tactical-muted uppercase">{unit}</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-tactical-border/50">
        <span className="text-tactical-muted truncate">{subtitle || 'VERIFIED GROUND TRUTH'}</span>
        {trend && (
          <span className={`font-semibold shrink-0 ${trend.startsWith('+') ? 'text-tactical-green' : 'text-tactical-amber'}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  )
}
