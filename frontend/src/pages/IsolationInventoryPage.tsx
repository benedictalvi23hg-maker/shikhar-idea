import React, { useState, useEffect } from 'react'
import {
  ShieldAlert,
  Snowflake,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  RefreshCw,
  Building2
} from 'lucide-react'
import { shikharApi } from '../services/api'
import { Badge } from '../components/Badge'

export const IsolationInventoryPage: React.FC = () => {
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>(1) // Leh Depot
  const [isolationRiskFactor, setIsolationRiskFactor] = useState<number>(0.85) // 85% risk
  const [inventoryItems, setInventoryItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [whRes, invRes] = await Promise.all([
        shikharApi.getWarehouses(),
        shikharApi.getWarehouseInventory(selectedWarehouseId),
      ])
      setWarehouses(whRes)
      setInventoryItems(invRes)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedWarehouseId])

  const selectedWarehouse = warehouses.find((w) => w.id === selectedWarehouseId)

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      {/* Header */}
      <div className="bg-tactical-surface border border-tactical-border rounded p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tactical-green pulse-live" />
            <h1 className="text-base font-mono font-bold uppercase tracking-wider text-tactical-text">
              PAGE 7: WINTER EMERGENCY SUPPLY DAYS & PASS ISOLATION
            </h1>
          </div>
          <p className="text-xs font-mono text-tactical-muted mt-0.5">
            Calculates True Depot Endurance Factoring In Road Closure Odds, Elevation Drag & Stock Truth
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="amber">WINTER BUFFER ACTIVE</Badge>
        </div>
      </div>

      {/* Control Strip */}
      <div className="tactical-panel p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div>
          <label className="block text-[10px] text-tactical-muted uppercase mb-1 font-bold">
            Select High-Altitude Forward Depot
          </label>
          <select
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(Number(e.target.value))}
            className="w-full bg-tactical-card border border-tactical-border text-tactical-text p-2 rounded focus:outline-none focus:border-tactical-olive"
          >
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.code} - {w.name} (Elevation: {w.elevation_meters}m)
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-tactical-muted font-bold">
              Simulated Corridor Isolation Risk Factor:
            </span>
            <span className="font-bold text-tactical-amber">
              {(isolationRiskFactor * 100).toFixed(0)}% Probability of Winter Cutoff
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isolationRiskFactor}
            onChange={(e) => setIsolationRiskFactor(Number(e.target.value))}
            className="w-full accent-tactical-amber cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-tactical-muted">
            <span>0% (Plains Open)</span>
            <span>50% (Seasonal Rains)</span>
            <span>85% (Leh High-Alpine Winter)</span>
            <span>100% (Complete Blizzard Blockage)</span>
          </div>
        </div>
      </div>

      {/* Depot Summary Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="tactical-panel p-3 border-tactical-border">
          <span className="text-[10px] font-mono uppercase text-tactical-muted">Current Depot Load</span>
          <div className="text-xl font-mono font-bold text-tactical-text mt-1">
            {selectedWarehouse?.current_load_tons} / {selectedWarehouse?.total_capacity_tons} Tons
          </div>
          <span className="text-[10px] font-mono text-tactical-khaki">
            {selectedWarehouse ? ((selectedWarehouse.current_load_tons / selectedWarehouse.total_capacity_tons) * 100).toFixed(1) : 0}% Capacity
          </span>
        </div>

        <div className="tactical-panel p-3 border-tactical-green/40">
          <span className="text-[10px] font-mono uppercase text-tactical-muted">Sensor Accuracy Score</span>
          <div className="text-xl font-mono font-bold text-tactical-green mt-1">
            {selectedWarehouse ? (selectedWarehouse.stock_truth_score * 100).toFixed(1) : 98}%
          </div>
          <span className="text-[10px] font-mono text-tactical-muted">Sensor & Drum Verified</span>
        </div>

        <div className="tactical-panel p-3 border-tactical-amber/40">
          <span className="text-[10px] font-mono uppercase text-tactical-muted">Recommended Buffer Minimum</span>
          <div className="text-xl font-mono font-bold text-tactical-amber mt-1">
            {(30 + isolationRiskFactor * 60).toFixed(0)} Days
          </div>
          <span className="text-[10px] font-mono text-tactical-muted">Contingency Safety Reserve</span>
        </div>

        <div className="tactical-panel p-3 border-tactical-cyan/40">
          <span className="text-[10px] font-mono uppercase text-tactical-muted">Demand Drag Multiplier</span>
          <div className="text-xl font-mono font-bold text-tactical-cyan mt-1">
            {(1 + isolationRiskFactor * 0.8).toFixed(2)}x
          </div>
          <span className="text-[10px] font-mono text-tactical-muted">Sub-Zero Thermal Stress</span>
        </div>
      </div>

      {/* SKU-Level Isolation Days of Supply Table */}
      <div className="tactical-panel overflow-hidden">
        <div className="px-4 py-3 border-b border-tactical-border bg-tactical-card flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-tactical-text">
            Forward Depot SKU Isolation Endurance Table
          </h2>
          <span className="text-[10px] font-mono text-tactical-muted">
            Formula: Stock × Truth Score / [Demand × (1 + Isolation Drag)]
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-tactical-card/50 border-b border-tactical-border text-tactical-muted uppercase text-[10px]">
              <tr>
                <th className="px-4 py-2.5">SKU & Item</th>
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5 text-right">Physical On Hand</th>
                <th className="px-4 py-2.5 text-center">Raw Days of Supply</th>
                <th className="px-4 py-2.5 text-center">Safe Supply Days Remaining</th>
                <th className="px-4 py-2.5 text-center">Buffer Status</th>
                <th className="px-4 py-2.5">Pre-Winter Surge Directive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tactical-border/40">
              {inventoryItems.map((item) => {
                const rawDos = item.isolation_adjusted_dos * 1.5
                const adjustedDos = item.isolation_adjusted_dos * (1.0 - isolationRiskFactor * 0.35)
                const isShortage = adjustedDos < 25

                return (
                  <tr key={item.id} className="hover:bg-tactical-card/40 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="font-bold text-tactical-text">{item.product_name}</div>
                      <div className="text-[10px] text-tactical-khaki">{item.sku}</div>
                    </td>
                    <td className="px-4 py-2.5 text-tactical-muted">{item.category}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-tactical-text">
                      {item.quantity_on_hand.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-center text-tactical-muted">
                      {rawDos.toFixed(1)} Days
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span
                        className={`font-bold ${
                          adjustedDos < 15
                            ? 'text-tactical-red'
                            : adjustedDos < 30
                            ? 'text-tactical-amber'
                            : 'text-tactical-green'
                        }`}
                      >
                        {adjustedDos.toFixed(1)} Days
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <Badge variant={adjustedDos >= 45 ? 'green' : adjustedDos >= 25 ? 'amber' : 'red'}>
                        {adjustedDos >= 45 ? 'SAFE BUFFER' : adjustedDos >= 25 ? 'SURGE NEEDED' : 'CRITICAL DEFICIT'}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-[11px]">
                      {isShortage ? (
                        <span className="text-tactical-red font-semibold">
                          Requisition +500 units from Chandigarh before pass closure
                        </span>
                      ) : (
                        <span className="text-tactical-muted">Buffer compliant for winter duration</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
