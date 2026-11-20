import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  MapPin,
  Package,
  TrendingUp,
  Snowflake,
  ShieldAlert,
  Building2,
  Truck,
  CloudSun,
  Factory,
  Bot,
  BrainCircuit,
  Binary,
  Radio,
  FileBarChart2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react'
import { useI18nStore } from '../i18n/i18nStore'

interface NavItem {
  key: string
  defaultName: string
  path: string
  icon: React.ElementType
  badge?: string
}

const navItems: NavItem[] = [
  { key: 'nav.dashboard', defaultName: 'Command Dashboard', path: '/', icon: LayoutDashboard },
  { key: 'nav.liveMap', defaultName: 'Live Logistics Map', path: '/live-map', icon: MapPin },
  { key: 'nav.inventory', defaultName: 'Smart Inventory', path: '/inventory', icon: Package },
  { key: 'nav.forecast', defaultName: 'AI Demand Forecast', path: '/forecast', icon: TrendingUp },
  { key: 'nav.freshness', defaultName: 'Freshness & Expiry Monitor', path: '/freshness', icon: Snowflake },
  { key: 'nav.isolation', defaultName: 'Winter Emergency Stock', path: '/isolation', icon: ShieldAlert },
  { key: 'nav.warehouses', defaultName: 'All Warehouses & Depots', path: '/warehouses', icon: Building2 },
  { key: 'nav.transportation', defaultName: 'Convoy & Route Intel', path: '/transportation', icon: Truck },
  { key: 'nav.weather', defaultName: 'Climate & Weather Pass', path: '/weather', icon: CloudSun },
  { key: 'nav.suppliers', defaultName: 'Suppliers & Vendors', path: '/suppliers', icon: Factory },
  { key: 'nav.assistant', defaultName: 'AI Tactical Assistant', path: '/assistant', icon: Bot },
  { key: 'nav.challengerAi', defaultName: 'AI Recommendation Check', path: '/challenger-ai', icon: BrainCircuit, badge: 'AI Verify' },
  { key: 'nav.digitalTwin', defaultName: 'Scenario Simulation', path: '/digital-twin', icon: Binary, badge: 'Sim' },
  { key: 'nav.iotOffline', defaultName: 'Offline Safe Mode', path: '/iot-offline', icon: Radio },
  { key: 'nav.reports', defaultName: 'Reports & Analytics', path: '/reports', icon: FileBarChart2 },
  { key: 'nav.admin', defaultName: 'Security & Access', path: '/admin', icon: ShieldCheck },
]

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { t } = useI18nStore()

  return (
    <aside
      className={`h-screen bg-tactical-surface border-r border-tactical-border flex flex-col transition-all duration-300 select-none z-30 sticky top-0 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-tactical-border bg-tactical-card/50">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded bg-tactical-olive/20 border border-tactical-olive flex items-center justify-center shrink-0 shadow-inner">
            <Shield className="w-5 h-5 text-tactical-oliveLight" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-mono font-bold tracking-wider text-sm text-tactical-text uppercase flex items-center gap-1.5">
                SHIKHAR
                <span className="text-[10px] bg-tactical-olive/30 border border-tactical-olive/50 text-tactical-oliveLight px-1 py-0.2 rounded font-mono">
                  TAC-OPS
                </span>
              </span>
              <span className="text-[10px] text-tactical-khaki/80 font-mono tracking-tight truncate">
                PREDICTIVE LOGISTICS
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-tactical-card text-tactical-muted hover:text-white transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center px-2.5 py-2 rounded text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-tactical-olive/20 text-white border-l-2 border-tactical-olive font-semibold shadow-sm'
                  : 'text-tactical-muted hover:text-tactical-text hover:bg-tactical-card/70'
              }`}
              title={collapsed ? t(item.key, item.defaultName) : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive ? 'text-tactical-oliveLight scale-105' : 'text-tactical-muted group-hover:text-tactical-text'
                } ${!collapsed ? 'mr-2.5' : 'mx-auto'}`}
              />
              {!collapsed && (
                <div className="flex items-center justify-between w-full overflow-hidden">
                  <span className="truncate">{t(item.key, item.defaultName)}</span>
                  {item.badge && (
                    <span className="text-[9px] font-mono font-bold bg-tactical-amber/20 text-tactical-amber border border-tactical-amber/40 px-1 py-0.2 rounded">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          )
        })}
      </div>

      {/* Footer System Status */}
      <div className="p-2 border-t border-tactical-border bg-tactical-card/30">
        {!collapsed ? (
          <div className="flex items-center justify-between text-[10px] font-mono text-tactical-muted px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-tactical-green pulse-live inline-block" />
              DEFENSE GRID ACTIVE
            </span>
            <span className="text-tactical-khaki font-semibold">SEC-V1</span>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <span className="w-2.5 h-2.5 rounded-full bg-tactical-green pulse-live" title="Grid Active" />
          </div>
        )}
      </div>
    </aside>
  )
}
