import React, { useEffect, useState } from 'react'
import {
  Factory,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  RefreshCw,
  Building
} from 'lucide-react'
import { shikharApi } from '../services/api'
import { Badge } from '../components/Badge'
import { Modal } from '../components/Modal'

export const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null)
  const [performanceData, setPerformanceData] = useState<any>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [newSupForm, setNewSupForm] = useState({
    code: '',
    name: '',
    category: 'High-Calorie Rations',
    reliability_score: 0.95,
    on_time_delivery_rate: 94.0,
    quality_pass_rate: 99.0,
    lead_time_days: 7,
    risk_level: 'LOW_RISK',
    contact_person: '',
    email: '',
    phone: '',
    address: ''
  })

  const loadSuppliers = async () => {
    setIsLoading(true)
    try {
      const res = await shikharApi.getSuppliers()
      setSuppliers(res)
      if (res.length > 0 && !selectedSupplier) {
        setSelectedSupplier(res[0])
        loadPerformance(res[0].id)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const loadPerformance = async (sId: number) => {
    try {
      const perf = await shikharApi.getSupplierPerformance(sId)
      setPerformanceData(perf)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadSuppliers()
  }, [])

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await shikharApi.createSupplier(newSupForm)
      setShowAddModal(false)
      loadSuppliers()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleSelectSupplier = (s: any) => {
    setSelectedSupplier(s)
    loadPerformance(s.id)
  }

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      {/* Page Header */}
      <div className="bg-tactical-surface border border-tactical-border rounded p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tactical-green pulse-live" />
            <h1 className="text-base font-mono font-bold uppercase tracking-wider text-tactical-text">
              PAGE 11: PREDICTIVE SUPPLIER RISK INTELLIGENCE & AUDIT
            </h1>
          </div>
          <p className="text-xs font-mono text-tactical-muted mt-0.5">
            Vendor Fulfillment Rates • Quality Assurance Pass Ratio • Lead Time Volatility Monitoring
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-tactical-olive hover:bg-tactical-oliveLight rounded text-xs font-mono font-bold text-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register Defense Vendor</span>
        </button>
      </div>

      {/* Main Grid: Supplier List + Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Suppliers List */}
        <div className="lg:col-span-7 space-y-3">
          {suppliers.map((s) => (
            <div
              key={s.id}
              onClick={() => handleSelectSupplier(s)}
              className={`tactical-panel p-4 cursor-pointer transition-all ${
                selectedSupplier?.id === s.id
                  ? 'border-tactical-olive ring-1 ring-tactical-olive/50 bg-tactical-card'
                  : 'hover:border-tactical-olive/60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-tactical-khaki font-bold bg-tactical-card px-1.5 py-0.5 rounded border border-tactical-border">
                    {s.code}
                  </span>
                  <h2 className="text-sm font-mono font-bold text-tactical-text mt-1.5">
                    {s.name}
                  </h2>
                  <p className="text-[11px] font-mono text-tactical-muted">{s.category}</p>
                </div>
                <Badge variant={s.risk_level === 'LOW_RISK' ? 'green' : 'amber'}>
                  {s.risk_level.replace('_', ' ')}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono mt-3 pt-2.5 border-t border-tactical-border/50">
                <div className="p-1.5 rounded bg-tactical-surface border border-tactical-border">
                  <span className="text-[10px] text-tactical-muted block">Reliability</span>
                  <span className="font-bold text-tactical-green">
                    {(s.reliability_score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-1.5 rounded bg-tactical-surface border border-tactical-border">
                  <span className="text-[10px] text-tactical-muted block">On-Time Rate</span>
                  <span className="font-bold text-tactical-text">{s.on_time_delivery_rate}%</span>
                </div>
                <div className="p-1.5 rounded bg-tactical-surface border border-tactical-border">
                  <span className="text-[10px] text-tactical-muted block">Avg Lead Time</span>
                  <span className="font-bold text-tactical-khaki">{s.lead_time_days} Days</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Supplier Detailed Audit Card */}
        <div className="lg:col-span-5 tactical-panel p-4 flex flex-col justify-between space-y-4">
          {selectedSupplier ? (
            <div>
              <div className="border-b border-tactical-border/60 pb-3">
                <span className="text-[10px] font-mono text-tactical-muted uppercase font-bold">
                  Vendor Dossier & Performance Audit
                </span>
                <h2 className="text-base font-mono font-bold text-tactical-text mt-0.5">
                  {selectedSupplier.name}
                </h2>
                <div className="flex items-center space-x-2 text-xs font-mono text-tactical-khaki mt-1">
                  <span>Contact: {selectedSupplier.contact_person || 'Procurement Rep'}</span>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-1.5 text-xs font-mono text-tactical-muted my-3 bg-tactical-card p-3 rounded border border-tactical-border">
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-tactical-khaki" />
                  <span className="text-tactical-text">{selectedSupplier.email || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-tactical-khaki" />
                  <span className="text-tactical-text">{selectedSupplier.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="w-3.5 h-3.5 text-tactical-khaki" />
                  <span className="text-tactical-text truncate">{selectedSupplier.address || 'N/A'}</span>
                </div>
              </div>

              {/* Past Deliveries Table */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-tactical-muted uppercase">
                  Recent Contract Deliveries
                </span>
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 text-xs font-mono">
                  {performanceData?.historical_deliveries?.map((d: any) => (
                    <div
                      key={d.po_number}
                      className="p-2 rounded bg-tactical-surface border border-tactical-border flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-tactical-text">{d.po_number}</div>
                        <div className="text-[10px] text-tactical-muted">
                          Qty: {d.ordered_qty} units
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={d.status === 'DELIVERED' ? 'green' : 'amber'}>
                          {d.status}
                        </Badge>
                        <div className="text-[9px] text-tactical-muted mt-0.5">
                          {d.delay_days > 0 ? `+${d.delay_days}d delay` : 'On Schedule'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-tactical-muted font-mono text-xs py-8">
              Select a vendor profile to inspect performance metrics.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add Supplier */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register Defense Contractor / Supplier"
        subtitle="Adds vendor profile into reliability tracking and requisition matrix"
      >
        <form onSubmit={handleCreateSupplier} className="space-y-3 font-mono text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Vendor Code</label>
              <input
                type="text"
                required
                value={newSupForm.code}
                onChange={(e) => setNewSupForm({ ...newSupForm, code: e.target.value })}
                placeholder="SUP-EXPED-09"
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Company Name</label>
              <input
                type="text"
                required
                value={newSupForm.name}
                onChange={(e) => setNewSupForm({ ...newSupForm, name: e.target.value })}
                placeholder="Defense Battery Dynamics Corp"
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Category</label>
              <input
                type="text"
                value={newSupForm.category}
                onChange={(e) => setNewSupForm({ ...newSupForm, category: e.target.value })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Lead Time (Days)</label>
              <input
                type="number"
                value={newSupForm.lead_time_days}
                onChange={(e) => setNewSupForm({ ...newSupForm, lead_time_days: Number(e.target.value) })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Contact Officer</label>
              <input
                type="text"
                value={newSupForm.contact_person}
                onChange={(e) => setNewSupForm({ ...newSupForm, contact_person: e.target.value })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Email</label>
              <input
                type="email"
                value={newSupForm.email}
                onChange={(e) => setNewSupForm({ ...newSupForm, email: e.target.value })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-tactical-border">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-3 py-1.5 rounded bg-tactical-card border border-tactical-border text-tactical-muted hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-tactical-olive hover:bg-tactical-oliveLight text-white font-bold"
            >
              Register Supplier
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
