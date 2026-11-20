import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Bell,
  RefreshCw,
  Wifi,
  WifiOff,
  UserCheck,
  LogOut,
  ChevronDown,
  Check,
  Globe,
  Shield
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useI18nStore } from '../i18n/i18nStore'
import { SupportedLanguage } from '../i18n/translations'
import { syncOfflineLedger } from '../services/offlineLedger'

interface HeaderProps {
  readinessScore?: number
  unreadAlertsCount?: number
}

export const Header: React.FC<HeaderProps> = ({ readinessScore = 82.3, unreadAlertsCount = 3 }) => {
  const { user, activeRole, setActiveRole, logout } = useAuthStore()
  const { language, setLanguage, t } = useI18nStore()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<string | null>(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  // Track online/offline status
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const toggleNetworkMode = async () => {
    const nextState = !isOnline
    setIsOnline(nextState)
    if (nextState) {
      setIsSyncing(true)
      try {
        const result = await syncOfflineLedger()
        setSyncStatus(`SATCOM Restored • Synced ${result.synced} entries`)
        setTimeout(() => setSyncStatus(null), 4000)
      } catch (e) {
        setSyncStatus('SATCOM Connected')
        setTimeout(() => setSyncStatus(null), 3000)
      } finally {
        setIsSyncing(false)
      }
    } else {
      setSyncStatus('Offline Safe Mode Active')
      setTimeout(() => setSyncStatus(null), 3000)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/inventory?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const availableRoles = [
    'Super Administrator',
    'Logistics Manager',
    'Warehouse Manager',
    'Analyst',
  ]

  return (
    <header className="h-16 bg-tactical-surface border-b border-tactical-border px-4 lg:px-6 flex items-center justify-between sticky top-0 z-20 gap-4">
      {/* 1. Left: Search Bar - Fixed non-collapsing width so it NEVER shrinks to 0 */}
      <div className="w-52 sm:w-64 md:w-72 shrink-0">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 text-tactical-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('header.searchPlaceholder', 'Search depot, SKU, convoy...')}
            className="w-full bg-tactical-card border border-tactical-border text-tactical-text text-xs pl-9 pr-3 py-1.5 rounded focus:outline-none focus:border-tactical-olive font-mono placeholder:text-tactical-muted/60 transition-all"
          />
        </form>
      </div>

      {/* 2. Center: Compact Tactical Readiness & Safety Badge */}
      <div className="hidden md:flex items-center space-x-2 bg-tactical-card px-3 py-1 rounded border border-tactical-border text-xs font-mono shrink-0">
        <span className="w-2 h-2 rounded-full bg-tactical-green pulse-live inline-block" />
        <span className="text-[11px] uppercase text-tactical-muted font-bold tracking-wider">
          {t('header.readinessScore', 'READINESS')}:
        </span>
        <span className="font-bold text-tactical-green">{readinessScore.toFixed(1)}%</span>
        <span className="text-tactical-border">|</span>
        <span className="text-tactical-amber font-semibold text-[11px]">SAFE (WINTER)</span>
      </div>

      {/* 3. Right: Clean Controls Toolbar with generous spacing */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* Language Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center space-x-1.5 bg-tactical-card border border-tactical-border hover:border-tactical-olive px-2.5 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer"
            title="Change Platform Language"
          >
            <Globe className="w-3.5 h-3.5 text-tactical-oliveLight shrink-0" />
            <span className="font-bold text-tactical-text">
              {language === 'en' ? 'English' : language === 'hi' ? 'हिन्दी' : 'தமிழ்'}
            </span>
            <ChevronDown className="w-3 h-3 text-tactical-muted" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-tactical-surface border border-tactical-border rounded shadow-xl py-1 z-50">
              {[
                { code: 'en' as SupportedLanguage, label: 'English', sub: 'Standard' },
                { code: 'hi' as SupportedLanguage, label: 'हिन्दी (Hindi)', sub: 'भारतीय सेना' },
                { code: 'ta' as SupportedLanguage, label: 'தமிழ் (Tamil)', sub: 'ராணுவப் பிரிவு' }
              ].map((langItem) => (
                <button
                  key={langItem.code}
                  onClick={() => {
                    setLanguage(langItem.code)
                    setShowLangMenu(false)
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs font-mono hover:bg-tactical-card flex items-center justify-between transition-colors border-b border-tactical-border/30 last:border-0"
                >
                  <div>
                    <div className={language === langItem.code ? 'text-tactical-oliveLight font-bold' : 'text-tactical-text'}>
                      {langItem.label}
                    </div>
                    <div className="text-[9px] text-tactical-muted">{langItem.sub}</div>
                  </div>
                  {language === langItem.code && <Check className="w-3.5 h-3.5 text-tactical-oliveLight shrink-0 ml-2" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SATCOM / Network Mode Toggle */}
        <button
          onClick={toggleNetworkMode}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded text-xs font-mono border transition-all cursor-pointer ${
            isOnline
              ? 'border-tactical-green/60 bg-tactical-green/10 text-tactical-green hover:bg-tactical-green/20'
              : 'border-tactical-amber bg-tactical-amber/20 text-tactical-amber hover:bg-tactical-amber/30 ring-1 ring-tactical-amber/50'
          }`}
          title="Toggle Online (SATCOM) and Offline Safe Mode"
        >
          {isOnline ? (
            <span className="w-2 h-2 rounded-full bg-tactical-green pulse-live shrink-0" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-tactical-amber shrink-0" />
          )}
          {isOnline ? (
            <Wifi className="w-3.5 h-3.5 text-tactical-green shrink-0" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-tactical-amber shrink-0" />
          )}
          <span className="font-bold">
            {isOnline ? 'SATCOM' : 'OFFLINE'}
          </span>
          <RefreshCw className={`w-3 h-3 ml-0.5 ${isSyncing ? 'animate-spin text-tactical-oliveLight' : ''}`} />
        </button>

        {syncStatus && (
          <span className="text-[10px] font-mono text-tactical-oliveLight hidden xl:inline">
            {syncStatus}
          </span>
        )}

        {/* Alerts Bell */}
        <button
          onClick={() => navigate('/dashboard')}
          className="p-1.5 rounded bg-tactical-card border border-tactical-border hover:border-tactical-olive text-tactical-muted hover:text-white relative transition-colors cursor-pointer"
          title="Tactical Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-tactical-red text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center border border-tactical-bg">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* Unified Commander Profile & Role Switcher Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 bg-tactical-card hover:bg-tactical-card/80 border border-tactical-border hover:border-tactical-olive px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer"
            title="Operator Profile & Role Clearance"
          >
            <UserCheck className="w-3.5 h-3.5 text-tactical-khaki shrink-0" />
            <div className="flex flex-col text-left leading-tight">
              <span className="font-bold text-tactical-text text-xs whitespace-nowrap">
                Brig. Gen. Rawat
              </span>
              <span className="text-[9px] text-tactical-oliveLight font-semibold">
                {activeRole === 'Super Administrator' ? 'Super Admin' : activeRole}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-tactical-muted shrink-0" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-tactical-surface border border-tactical-border rounded shadow-2xl py-2 z-50">
              <div className="px-3.5 py-2 border-b border-tactical-border/60">
                <div className="font-bold text-xs text-tactical-text">{user?.full_name || 'Brigadier General R. K. Rawat'}</div>
                <div className="text-[10px] font-mono text-tactical-khaki">{user?.military_rank || 'Brigadier General'}</div>
                <div className="text-[9px] font-mono text-tactical-muted mt-0.5">Northern Command Logistics HQ</div>
              </div>

              <div className="px-3.5 py-1.5 text-[10px] font-mono text-tactical-muted uppercase font-bold">
                Select Active Role (RBAC)
              </div>
              {availableRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setActiveRole(role)
                    setShowProfileMenu(false)
                  }}
                  className="w-full text-left px-3.5 py-1.5 text-xs font-mono hover:bg-tactical-card flex items-center justify-between transition-colors border-b border-tactical-border/30 last:border-0"
                >
                  <span className={activeRole === role ? 'text-tactical-oliveLight font-bold' : 'text-tactical-text'}>
                    {role}
                  </span>
                  {activeRole === role && <Check className="w-3.5 h-3.5 text-tactical-oliveLight shrink-0 ml-2" />}
                </button>
              ))}

              <div className="pt-2 mt-1 border-t border-tactical-border/60 px-3">
                <button
                  onClick={() => {
                    logout()
                    navigate('/login')
                  }}
                  className="w-full py-1.5 rounded bg-tactical-card hover:bg-tactical-red/20 border border-tactical-border hover:border-tactical-red/50 text-tactical-red text-xs font-mono font-bold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout / Terminate Session</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Dedicated Logout Icon Button */}
        <button
          onClick={() => {
            logout()
            navigate('/login')
          }}
          className="p-1.5 rounded bg-tactical-card hover:bg-tactical-card/80 border border-tactical-border hover:border-tactical-red text-tactical-muted hover:text-tactical-red transition-colors cursor-pointer shrink-0"
          title="Logout (Terminate Session)"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
