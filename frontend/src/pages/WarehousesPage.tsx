import React, { useEffect, useState } from 'react'
import {
  Building2,
  Plus,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Plane,
  Compass,
  CheckCircle2,
  RefreshCw,
  Box
} from 'lucide-react'
import { shikharApi } from '../services/api'
import { Badge } from '../components/Badge'
import { Modal } from '../components/Modal'

export const WarehousesPage: React.FC = () => {
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null)
  const [warehouseInventory, setWarehouseInventory] = useState<any[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDossierModal, setShowDossierModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [newWhForm, setNewWhForm] = useState({
    code: '',
    name: '',
    command_region: 'Northern Command',
    latitude: 32.5,
    longitude: 76.5,
    elevation_meters: 1800,
    total_capacity_tons: 5000,
    current_load_tons: 1500,
    climate_zone: 'ALPINE_VALLEY',
    cold_chain_capable: true,
    hazardous_pol_capable: true,
    drone_hub_capable: true,
    helipad_available: true
  })

  const loadWarehouses = async () => {
    setIsLoading(true)
    try {
      const res = await shikharApi.getWarehouses()
      setWarehouses(res)
      if (res.length > 0 && !selectedWarehouse) {
        setSelectedWarehouse(res[0])
        shikharApi.getWarehouseInventory(res[0].id).then(setWarehouseInventory).catch(console.error)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectWarehouse = async (wh: any) => {
    setSelectedWarehouse(wh)
    setShowDossierModal(true)
    try {
      const inv = await shikharApi.getWarehouseInventory(wh.id)
      setWarehouseInventory(inv)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadWarehouses()
  }, [])

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await shikharApi.createWarehouse(newWhForm)
      setShowAddModal(false)
      loadWarehouses()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      {/* Header */}
      <div className="bg-tactical-surface border border-tactical-border rounded p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tactical-green pulse-live" />
            <h1 className="text-base font-mono font-bold uppercase tracking-wider text-tactical-text">
              PAGE 8: MULTI-WAREHOUSE DIRECTORY & SENSOR ACCURACY MATRIX
            </h1>
          </div>
          <p className="text-xs font-mono text-tactical-muted mt-0.5">
            Command Depots Directory • Depot Capabilities & Features • Smart Inter-Hub Redistribution
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-tactical-olive hover:bg-tactical-oliveLight rounded text-xs font-mono font-bold text-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register New Depot</span>
        </button>
      </div>

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {warehouses.map((wh) => (
          <div
            key={wh.id}
            onClick={() => handleSelectWarehouse(wh)}
            className={`tactical-panel p-4 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xl ${
              selectedWarehouse?.id === wh.id
                ? 'border-tactical-cyan ring-1 ring-tactical-cyan/60 bg-tactical-card'
                : 'hover:border-tactical-olive'
            }`}
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-tactical-oliveLight bg-tactical-olive/20 px-1.5 py-0.5 rounded border border-tactical-olive/40">
                    {wh.code}
                  </span>
                  <h2 className="text-sm font-mono font-bold text-tactical-text mt-1.5">
                    {wh.name}
                  </h2>
                </div>
                <Badge
                  variant={
                    wh.status === 'OPERATIONAL'
                      ? 'green'
                      : wh.status === 'WEATHER_RESTRICTED'
                      ? 'amber'
                      : 'red'
                  }
                >
                  {wh.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-tactical-muted mt-3 pt-2.5 border-t border-tactical-border/50">
                <div>Region: <span className="text-tactical-text">{wh.command_region}</span></div>
                <div>Altitude: <span className="text-tactical-text">{wh.elevation_meters}m</span></div>
                <div>Isolation Risk: <span className="text-tactical-amber font-bold">{(wh.isolation_risk_score * 100).toFixed(0)}%</span></div>
                <div>Sensor Accuracy: <span className="text-tactical-green font-bold">{(wh.stock_truth_score * 100).toFixed(1)}%</span></div>
              </div>

              {/* Capacity Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span className="text-tactical-muted">Depot Utilization:</span>
                  <span className="text-tactical-text font-bold">
                    {wh.current_load_tons} / {wh.total_capacity_tons} Tons ({wh.utilization_percentage}%)
                  </span>
                </div>
                <div className="w-full bg-tactical-surface h-2 rounded overflow-hidden border border-tactical-border">
                  <div
                    className={`h-full ${
                      wh.utilization_percentage > 85
                        ? 'bg-tactical-red'
                        : wh.utilization_percentage > 65
                        ? 'bg-tactical-amber'
                        : 'bg-tactical-olive'
                    }`}
                    style={{ width: `${Math.min(100, wh.utilization_percentage)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Tactical Capabilities Tags */}
            <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-tactical-border/40 text-[9px] font-mono">
              {wh.cold_chain_capable && (
                <span className="px-1.5 py-0.5 rounded bg-tactical-cyan/15 text-tactical-cyan border border-tactical-cyan/30">
                  Cold Chain (-20°C)
                </span>
              )}
              {wh.hazardous_pol_capable && (
                <span className="px-1.5 py-0.5 rounded bg-tactical-amber/15 text-tactical-amber border border-tactical-amber/30">
                  POL Aviation Fuels
                </span>
              )}
              {wh.helipad_available && (
                <span className="px-1.5 py-0.5 rounded bg-tactical-khaki/15 text-tactical-khaki border border-tactical-khaki/30">
                  Helipad / Rotary
                </span>
              )}
              {wh.drone_hub_capable && (
                <span className="px-1.5 py-0.5 rounded bg-tactical-olive/15 text-tactical-oliveLight border border-tactical-olive/30">
                  Tactical Drone Hub
                </span>
              )}
            </div>

            {/* Touch Action Prompt */}
            <div className="mt-2.5 pt-2 border-t border-tactical-border/40 flex items-center justify-between text-[10px] font-mono text-tactical-cyan">
              <span className="flex items-center gap-1">
                <span>👆</span>
                <span className="font-semibold">Touch to inspect full depot dossier</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Selected Warehouse Capability Readiness Details (U15) */}
      {selectedWarehouse && (
        <div className="tactical-panel p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-tactical-border/60 pb-2">
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-tactical-text flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-tactical-oliveLight" />
                Warehouse Facilities & Capabilities: {selectedWarehouse.name} ({selectedWarehouse.code})
              </h2>
              <p className="text-[10px] font-mono text-tactical-muted">
                Readiness certifications verified against military operational standards
              </p>
            </div>
            <Badge variant="olive">U15 AUDITED</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
            {selectedWarehouse.capabilities?.map((cap: any) => (
              <div key={cap.id} className="p-3 rounded bg-tactical-card border border-tactical-border">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-bold text-tactical-text">{cap.capability_name}</span>
                  <span className="text-tactical-green font-bold">{cap.readiness_percentage}%</span>
                </div>
                <div className="w-full bg-tactical-surface h-1.5 rounded overflow-hidden border border-tactical-border mb-2">
                  <div
                    className="h-full bg-tactical-green"
                    style={{ width: `${cap.readiness_percentage}%` }}
                  />
                </div>
                <div className="text-[9px] text-tactical-muted flex items-center justify-between">
                  <span>Certified: {new Date(cap.last_certified).toLocaleDateString()}</span>
                  <span className="text-tactical-oliveLight">PASS</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Register New Warehouse */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Commission Strategic Military Depot"
        subtitle="Registers facility into multi-warehouse graph and initializes capability profile"
      >
        <form onSubmit={handleCreateWarehouse} className="space-y-3 font-mono">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Depot Code</label>
              <input
                type="text"
                required
                value={newWhForm.code}
                onChange={(e) => setNewWhForm({ ...newWhForm, code: e.target.value })}
                placeholder="WH-EAST-02"
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Depot Name</label>
              <input
                type="text"
                required
                value={newWhForm.name}
                onChange={(e) => setNewWhForm({ ...newWhForm, name: e.target.value })}
                placeholder="Tawang Advanced Logistics Hub"
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Command Region</label>
              <select
                value={newWhForm.command_region}
                onChange={(e) => setNewWhForm({ ...newWhForm, command_region: e.target.value })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              >
                <option value="Northern Command">Northern Command</option>
                <option value="Western Command">Western Command</option>
                <option value="Eastern Command">Eastern Command</option>
                <option value="Central Command">Central Command</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Capacity (Tons)</label>
              <input
                type="number"
                value={newWhForm.total_capacity_tons}
                onChange={(e) => setNewWhForm({ ...newWhForm, total_capacity_tons: Number(e.target.value) })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Elevation (m)</label>
              <input
                type="number"
                value={newWhForm.elevation_meters}
                onChange={(e) => setNewWhForm({ ...newWhForm, elevation_meters: Number(e.target.value) })}
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
              Commission Depot
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Full Tactical Depot Inspection Dossier on Touch */}
      <Modal
        isOpen={showDossierModal}
        onClose={() => setShowDossierModal(false)}
        title={`TACTICAL DEPOT SITREP: ${selectedWarehouse?.name} (${selectedWarehouse?.code})`}
        maxWidth="max-w-3xl"
      >
        {selectedWarehouse && (
          <div className="space-y-4 font-mono text-xs">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded bg-tactical-card border border-tactical-border">
                <span className="text-[10px] text-tactical-muted uppercase block">Command Region</span>
                <span className="font-bold text-tactical-text">{selectedWarehouse.command_region}</span>
              </div>
              <div className="p-2.5 rounded bg-tactical-card border border-tactical-border">
                <span className="text-[10px] text-tactical-muted uppercase block">Altitude / Terrain</span>
                <span className="font-bold text-tactical-text">{selectedWarehouse.elevation_meters}m ({selectedWarehouse.climate_zone})</span>
              </div>
              <div className="p-2.5 rounded bg-tactical-card border border-tactical-border">
                <span className="text-[10px] text-tactical-muted uppercase block">U9 Stock Truth</span>
                <span className="font-bold text-tactical-green">{(selectedWarehouse.stock_truth_score * 100).toFixed(1)}% Sensor Verified</span>
              </div>
              <div className="p-2.5 rounded bg-tactical-card border border-tactical-border">
                <span className="text-[10px] text-tactical-muted uppercase block">U1 Isolation Risk</span>
                <span className="font-bold text-tactical-amber">{(selectedWarehouse.isolation_risk_score * 100).toFixed(0)}% Vulnerability</span>
              </div>
            </div>

            {/* Capacity Meter */}
            <div className="p-3 rounded bg-tactical-card border border-tactical-border space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-tactical-text">Storage Capacity Status:</span>
                <span className="text-tactical-khaki font-bold">{selectedWarehouse.current_load_tons} Tons / {selectedWarehouse.total_capacity_tons} Tons ({selectedWarehouse.utilization_percentage}%)</span>
              </div>
              <div className="w-full bg-tactical-surface h-2.5 rounded overflow-hidden border border-tactical-border">
                <div
                  className={`h-full ${
                    selectedWarehouse.utilization_percentage > 85 ? 'bg-tactical-red' : selectedWarehouse.utilization_percentage > 65 ? 'bg-tactical-amber' : 'bg-tactical-olive'
                  }`}
                  style={{ width: `${Math.min(100, selectedWarehouse.utilization_percentage)}%` }}
                />
              </div>
            </div>

            {/* Live Inventory On-Hand Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-tactical-border/60 pb-1.5">
                <h3 className="font-bold uppercase text-tactical-text text-xs flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-tactical-oliveLight" />
                  Active Stored Inventory Lines ({warehouseInventory.length})
                </h3>
                <span className="text-[10px] text-tactical-muted">Real-time ledger audit</span>
              </div>

              {warehouseInventory.length === 0 ? (
                <div className="p-4 text-center text-tactical-muted border border-tactical-border rounded bg-tactical-card">
                  No inventory lines currently stocked at this depot.
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto border border-tactical-border rounded">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-tactical-surface border-b border-tactical-border text-tactical-muted uppercase text-[9px] sticky top-0">
                      <tr>
                        <th className="p-2">SKU</th>
                        <th className="p-2">Item Name</th>
                        <th className="p-2 text-right">On Hand</th>
                        <th className="p-2 text-right">Isolation DoS</th>
                        <th className="p-2 text-center">Truth Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-tactical-border/40 bg-tactical-card">
                      {warehouseInventory.map((item) => (
                        <tr key={item.id} className="hover:bg-tactical-surface/50">
                          <td className="p-2 font-bold text-tactical-oliveLight">{item.sku}</td>
                          <td className="p-2 text-tactical-text">{item.product_name}</td>
                          <td className="p-2 text-right font-bold text-tactical-text">{item.quantity_on_hand}</td>
                          <td className="p-2 text-right text-tactical-amber font-bold">{item.isolation_adjusted_dos} Days</td>
                          <td className="p-2 text-center text-tactical-green">{(item.stock_truth_score * 100).toFixed(0)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Certified Capabilities */}
            <div className="space-y-1.5">
              <h4 className="font-bold uppercase text-[10px] text-tactical-muted">U15 Certified Facility Readiness</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {selectedWarehouse.capabilities?.map((cap: any) => (
                  <div key={cap.id} className="p-2 rounded bg-tactical-card border border-tactical-border text-[10px]">
                    <div className="flex justify-between font-bold mb-1">
                      <span className="truncate pr-1">{cap.capability_name}</span>
                      <span className="text-tactical-green">{cap.readiness_percentage}%</span>
                    </div>
                    <div className="w-full bg-tactical-surface h-1 rounded overflow-hidden">
                      <div className="h-full bg-tactical-green" style={{ width: `${cap.readiness_percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-tactical-border">
              <button
                type="button"
                onClick={() => setShowDossierModal(false)}
                className="px-4 py-1.5 rounded bg-tactical-olive hover:bg-tactical-oliveLight text-white font-bold"
              >
                Close Dossier
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
