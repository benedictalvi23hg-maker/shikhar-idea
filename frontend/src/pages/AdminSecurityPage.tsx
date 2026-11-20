import React, { useEffect, useState } from 'react'
import {
  ShieldCheck,
  UserPlus,
  Key,
  Lock,
  Layers,
  Activity,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Sliders,
  Radio,
  CloudSun
} from 'lucide-react'
import { shikharApi } from '../services/api'
import { Badge } from '../components/Badge'
import { Modal } from '../components/Modal'

export const AdminSecurityPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [integrations, setIntegrations] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'integrations'>('users')
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    military_rank: 'Lieutenant Colonel',
    department: 'Northern Logistics Command',
    roles: ['Logistics Manager']
  })

  const loadAdminData = async () => {
    setIsLoading(true)
    try {
      const [uRes, aRes, iRes] = await Promise.all([
        shikharApi.getAdminUsers(),
        shikharApi.getAuditLogs(),
        shikharApi.getIntegrations()
      ])
      setUsers(uRes)
      setAuditLogs(aRes)
      setIntegrations(iRes)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await shikharApi.createAdminUser(newUser)
      setShowAddUserModal(false)
      loadAdminData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      {/* Page Header */}
      <div className="bg-tactical-surface border border-tactical-border rounded p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tactical-green pulse-live" />
            <h1 className="text-base font-mono font-bold uppercase tracking-wider text-tactical-text">
              PAGE 17: SECURITY, RBAC & INTEGRATION ADMINISTRATION
            </h1>
          </div>
          <p className="text-xs font-mono text-tactical-muted mt-0.5">
            Role-Based Access Enforcement • Immutable Audit Ledger • External Provider Credentials & Endpoints
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="olive">OWASP STIG HARDENED</Badge>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-tactical-olive hover:bg-tactical-oliveLight rounded text-xs font-mono font-bold text-white transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Operator</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 border border-tactical-border p-0.5 rounded bg-tactical-surface text-xs font-mono">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-1.5 rounded transition-colors ${
            activeTab === 'users' ? 'bg-tactical-olive text-white font-bold' : 'text-tactical-muted hover:text-white'
          }`}
        >
          Operator Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-1.5 rounded transition-colors ${
            activeTab === 'audit' ? 'bg-tactical-olive text-white font-bold' : 'text-tactical-muted hover:text-white'
          }`}
        >
          Audit Ledger ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('integrations')}
          className={`px-4 py-1.5 rounded transition-colors ${
            activeTab === 'integrations' ? 'bg-tactical-olive text-white font-bold' : 'text-tactical-muted hover:text-white'
          }`}
        >
          External Integrations & API Keys ({integrations.length})
        </button>
      </div>

      {/* Tab 1: User Management */}
      {activeTab === 'users' && (
        <div className="tactical-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-tactical-card/80 border-b border-tactical-border text-tactical-muted uppercase text-[10px]">
                <tr>
                  <th className="px-3.5 py-2.5">Operator Identity</th>
                  <th className="px-3 py-2.5">Rank & Service ID</th>
                  <th className="px-3 py-2.5">Assigned Department</th>
                  <th className="px-3 py-2.5">Assigned RBAC Roles</th>
                  <th className="px-3 py-2.5 text-center">Account Status</th>
                  <th className="px-3 py-2.5 text-right">Commissioned At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tactical-border/40">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-tactical-card/40 transition-colors">
                    <td className="px-3.5 py-2.5">
                      <div className="font-bold text-tactical-text">{u.full_name}</div>
                      <div className="text-[10px] text-tactical-khaki">{u.username} • {u.email}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="text-tactical-text font-semibold">{u.military_rank}</div>
                      <div className="text-[10px] text-tactical-muted">{u.service_id || 'OFFICER-CORPS'}</div>
                    </td>
                    <td className="px-3 py-2.5 text-tactical-muted text-[11px]">{u.department}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {u.roles?.map((r: string) => (
                          <span
                            key={r}
                            className="px-1.5 py-0.5 rounded bg-tactical-olive/20 text-tactical-oliveLight text-[9px] font-bold border border-tactical-olive/40"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <Badge variant={u.is_active ? 'green' : 'red'}>
                        {u.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right text-tactical-muted text-[11px]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="tactical-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-tactical-card/80 border-b border-tactical-border text-tactical-muted uppercase text-[10px]">
                <tr>
                  <th className="px-3.5 py-2.5">Timestamp (UTC)</th>
                  <th className="px-3 py-2.5">Action Executed</th>
                  <th className="px-3 py-2.5">Operator</th>
                  <th className="px-3 py-2.5">Target Entity</th>
                  <th className="px-3 py-2.5">Source IP</th>
                  <th className="px-3 py-2.5">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tactical-border/40">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-tactical-muted">
                      No security audit events recorded. System nominal.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-tactical-card/40 transition-colors">
                      <td className="px-3.5 py-2 text-tactical-muted text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 font-bold text-tactical-text">{log.action}</td>
                      <td className="px-3 py-2 text-tactical-khaki">{log.user_name}</td>
                      <td className="px-3 py-2 text-tactical-muted">{log.entity_type || '-'}</td>
                      <td className="px-3 py-2 text-tactical-muted text-[10px]">{log.ip_address}</td>
                      <td className="px-3 py-2 text-tactical-text text-[11px] truncate max-w-sm">
                        {log.details || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Integrations & API Keys */}
      {activeTab === 'integrations' && (
        <div className="space-y-3">
          <div className="tactical-panel p-4 space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-tactical-text border-b border-tactical-border/60 pb-2">
              Defense Integration Registry & Endpoint Connectors
            </h2>
            <p className="text-[10px] font-mono text-tactical-muted">
              Connect external weather feeds, satellite data providers, MQTT brokers, and private LLM backends.
              All credentials remain secured on the backend environment (.env) and are never exposed in frontend bundles.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono pt-2">
              {integrations.map((item) => (
                <div key={item.id} className="p-3.5 rounded bg-tactical-card border border-tactical-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-tactical-text">{item.service_name}</span>
                    <Badge variant={item.status === 'CONNECTED' ? 'green' : 'amber'}>
                      {item.status}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-tactical-khaki font-semibold">{item.provider_name}</div>
                  <div className="text-[10px] text-tactical-muted truncate">
                    Endpoint: {item.endpoint_url || 'Configured via backend env'}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-tactical-border/40 text-[9px] text-tactical-muted">
                    <span>Health Check: {new Date(item.last_health_check).toLocaleTimeString()}</span>
                    <span className={item.is_enabled ? 'text-tactical-green font-bold' : 'text-tactical-red'}>
                      {item.is_enabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Operator */}
      <Modal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        title="Commission Tactical Logistics Operator"
        subtitle="Provisions new user identity and assigns RBAC permissions"
      >
        <form onSubmit={handleCreateUser} className="space-y-3 font-mono text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Username / Service Handle</label>
              <input
                type="text"
                required
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                placeholder="major.sharma"
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Official Defense Email</label>
              <input
                type="email"
                required
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="v.sharma@shikhar.mod.gov.in"
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={newUser.full_name}
                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                placeholder="Major Vikram Sharma"
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Initial Password</label>
              <input
                type="password"
                required
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="••••••••••••"
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Military Rank</label>
              <input
                type="text"
                value={newUser.military_rank}
                onChange={(e) => setNewUser({ ...newUser, military_rank: e.target.value })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Initial Role Assignment</label>
              <select
                value={newUser.roles[0]}
                onChange={(e) => setNewUser({ ...newUser, roles: [e.target.value] })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              >
                <option value="Super Administrator">Super Administrator</option>
                <option value="Logistics Manager">Logistics Manager</option>
                <option value="Warehouse Manager">Warehouse Manager</option>
                <option value="Analyst">Analyst</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-tactical-border">
            <button
              type="button"
              onClick={() => setShowAddUserModal(false)}
              className="px-3 py-1.5 rounded bg-tactical-card border border-tactical-border text-tactical-muted hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-tactical-olive hover:bg-tactical-oliveLight text-white font-bold"
            >
              Commission Operator
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
