import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff, Lock, User as UserIcon, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { shikharApi } from '../services/api'

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('commander.shikhar')
  const [password, setPassword] = useState('Shikhar2026!')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg(null)

    try {
      const res = await shikharApi.login({
        username_or_email: username,
        password: password,
        remember_me: rememberMe
      })
      setAuth(res.access_token, res.user_info)
      navigate('/')
    } catch (err: any) {
      // If backend unreachable or login fails, provide clean tactical error
      setErrorMsg(err.message || 'Authentication failed. Please verify military credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePresetSelect = (presetUser: string) => {
    setUsername(presetUser)
    setPassword('Shikhar2026!')
  }

  return (
    <div className="min-h-screen bg-tactical-bg flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background Decorative Tactical Grid Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#283528_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-tactical-olive/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-tactical-surface border border-tactical-border rounded-lg shadow-2xl z-10 overflow-hidden">
        {/* Card Header */}
        <div className="bg-tactical-card px-6 py-5 border-b border-tactical-border text-center">
          <div className="w-12 h-12 mx-auto rounded-lg bg-tactical-olive/20 border border-tactical-olive flex items-center justify-center mb-3 shadow-inner">
            <Shield className="w-6 h-6 text-tactical-oliveLight" />
          </div>
          <h1 className="text-lg font-mono font-bold tracking-widest text-tactical-text uppercase">
            PROJECT SHIKHAR
          </h1>
          <p className="text-[11px] font-mono text-tactical-khaki tracking-tight mt-1">
            PREDICTIVE LOGISTICS & SUPPLY CHAIN COMMAND
          </p>
        </div>

        {/* Login Form */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded bg-tactical-red/10 border border-tactical-red/30 flex items-start space-x-2.5 text-xs text-tactical-red font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-tactical-muted uppercase text-[10px] font-bold mb-1.5">
                Service Identity / Username
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-tactical-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. commander.shikhar"
                  className="w-full bg-tactical-card border border-tactical-border text-tactical-text pl-9 pr-3 py-2 rounded focus:outline-none focus:border-tactical-olive"
                />
              </div>
            </div>

            <div>
              <label className="block text-tactical-muted uppercase text-[10px] font-bold mb-1.5">
                Tactical Security Key / Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-tactical-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-tactical-card border border-tactical-border text-tactical-text pl-9 pr-9 py-2 rounded focus:outline-none focus:border-tactical-olive"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-tactical-muted hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 text-tactical-muted cursor-pointer text-[11px]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-tactical-border bg-tactical-card text-tactical-olive focus:ring-0"
                />
                <span>Remember tactical session</span>
              </label>
              <span className="text-[10px] text-tactical-khaki/80 cursor-pointer hover:underline">
                Reset Key
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded bg-tactical-olive hover:bg-tactical-oliveLight text-white font-mono font-bold uppercase tracking-wider text-xs shadow-md transition-all flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <span>Authenticating Protocol...</span>
              ) : (
                <span>Authorize & Connect</span>
              )}
            </button>
          </form>

          {/* Preset Military Accounts */}
          <div className="mt-6 pt-4 border-t border-tactical-border/60">
            <span className="block text-[10px] font-mono text-tactical-muted uppercase text-center mb-2 font-bold">
              Rapid Role Simulation Selectors
            </span>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => handlePresetSelect('commander.shikhar')}
                className="p-1.5 rounded bg-tactical-card border border-tactical-border hover:border-tactical-olive text-tactical-text hover:text-white transition-colors text-left"
              >
                <div className="font-bold text-tactical-oliveLight">Brigadier General</div>
                <div className="text-tactical-muted truncate">commander.shikhar</div>
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect('logistics.officer')}
                className="p-1.5 rounded bg-tactical-card border border-tactical-border hover:border-tactical-olive text-tactical-text hover:text-white transition-colors text-left"
              >
                <div className="font-bold text-tactical-khaki">Logistics Colonel</div>
                <div className="text-tactical-muted truncate">logistics.officer</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security Classification Banner */}
        <div className="bg-tactical-card/40 px-4 py-2 border-t border-tactical-border text-center">
          <p className="text-[9px] font-mono text-tactical-muted uppercase tracking-widest">
            RESTRICTED OPERATIONAL DEFENSE ENVIRONMENT • DISA STIG COMPLIANT
          </p>
        </div>
      </div>
    </div>
  )
}
