import React, { useEffect, useState } from 'react'
import {
  Truck,
  Plane,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Play
} from 'lucide-react'
import { shikharApi } from '../services/api'
import { Badge } from '../components/Badge'

export const TransportationPage: React.FC = () => {
  const [convoys, setConvoys] = useState<any[]>([])
  const [corridors, setCorridors] = useState<any[]>([])
  
  // U5 & U6 Optimizer Calculator State
  const [cargoWeight, setCargoWeight] = useState<number>(8500)
  const [urgencyLevel, setUrgencyLevel] = useState<string>('TACTICAL_HIGH')
  const [selectedPassability, setSelectedPassability] = useState<number>(0.42)
  const [optimizationResult, setOptimizationResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadData = async () => {
    try {
      const [cRes, corrRes] = await Promise.all([
        shikharApi.getConvoys(),
        shikharApi.getCorridors()
      ])
      setConvoys(cRes)
      setCorridors(corrRes)
      
      // Auto run first mode-mix assessment
      runModeMix(8500, 'TACTICAL_HIGH', 0.42)
    } catch (e) {
      console.error(e)
    }
  }

  const runModeMix = async (wt: number, urg: string, pass: number) => {
    setIsLoading(true)
    try {
      const res = await shikharApi.assessModeMix({
        cargo_weight_kg: wt,
        urgency_level: urg,
        passability_score: pass
      })
      setOptimizationResult(res)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOptimizeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    runModeMix(cargoWeight, urgencyLevel, selectedPassability)
  }

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      {/* Page Header */}
      <div className="bg-tactical-surface border border-tactical-border rounded p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tactical-green pulse-live" />
            <h1 className="text-base font-mono font-bold uppercase tracking-wider text-tactical-text">
              PAGE 9: TRANSPORTATION INTELLIGENCE & U2 CORRIDOR RELIABILITY GRAPH
            </h1>
          </div>
          <p className="text-xs font-mono text-tactical-muted mt-0.5">
            U5 Last-Mile Mode-Mix Optimizer • U6 Lift-per-kg Prioritizer • Active Echelons
          </p>
        </div>

        <Badge variant="amber">OR-TOOLS ROUTING VERIFIED</Badge>
      </div>

      {/* U2 Corridor Reliability Cards */}
      <div className="tactical-panel p-4 space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-tactical-text flex items-center gap-2 border-b border-tactical-border/60 pb-2">
          <Compass className="w-4 h-4 text-tactical-khaki" />
          U2 Strategic Corridor Reliability Matrix & Avalanche Hazard
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          {corridors.map((corr) => (
            <div
              key={corr.id}
              onClick={() => {
                setSelectedPassability(corr.passability_score)
                runModeMix(cargoWeight, urgencyLevel, corr.passability_score)
              }}
              className="p-3 rounded bg-tactical-card border border-tactical-border hover:border-tactical-olive cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-tactical-khaki font-bold">{corr.code}</span>
                <Badge variant={corr.passability_score > 0.7 ? 'green' : corr.passability_score > 0.4 ? 'amber' : 'red'}>
                  {corr.current_status}
                </Badge>
              </div>
              <h3 className="font-bold text-tactical-text text-xs line-clamp-1">{corr.name}</h3>

              <div className="mt-3 space-y-1 text-[10px] text-tactical-muted pt-2 border-t border-tactical-border/50">
                <div className="flex justify-between">
                  <span>Passability Index:</span>
                  <span className="font-bold text-tactical-text">{(corr.passability_score * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Avalanche Risk:</span>
                  <span className={`font-bold ${corr.avalanche_risk_index > 0.5 ? 'text-tactical-red' : 'text-tactical-green'}`}>
                    {(corr.avalanche_risk_index * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Transit Duration:</span>
                  <span className="text-tactical-text">{corr.average_transit_hours} Hours</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mode-Mix Optimizer & Lift-Per-Kg Tool (U5 & U6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Input Parameters */}
        <div className="lg:col-span-5 tactical-panel p-4 space-y-3">
          <div className="border-b border-tactical-border/60 pb-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-tactical-text flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-tactical-oliveLight" />
              U5 Last-Mile Mode-Mix & U6 Lift-per-kg Optimizer
            </h2>
            <p className="text-[10px] font-mono text-tactical-muted">
              Dynamically evaluates whether to dispatch Surface Heavy Convoys vs Rotary Heavy Airlift (Mi-17V5)
            </p>
          </div>

          <form onSubmit={handleOptimizeSubmit} className="space-y-3 text-xs font-mono">
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Consignment Weight (Kg)</label>
              <input
                type="number"
                value={cargoWeight}
                onChange={(e) => setCargoWeight(Number(e.target.value))}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>

            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Tactical Urgency</label>
              <select
                value={urgencyLevel}
                onChange={(e) => setUrgencyLevel(e.target.value)}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              >
                <option value="CRITICAL_LIFE_SUPPORT">Critical Life Support (Medical / Plasma)</option>
                <option value="TACTICAL_HIGH">Tactical High Readiness</option>
                <option value="NORMAL">Standard Routine Echelon</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-tactical-muted mb-1">
                <span>Selected Corridor Passability:</span>
                <span className="font-bold text-tactical-amber">{(selectedPassability * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={selectedPassability}
                onChange={(e) => setSelectedPassability(Number(e.target.value))}
                className="w-full accent-tactical-olive"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-tactical-olive hover:bg-tactical-oliveLight text-white font-bold uppercase rounded flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Optimize Transportation Mode</span>
            </button>
          </form>
        </div>

        {/* Output Evaluation */}
        <div className="lg:col-span-7 tactical-panel p-4 flex flex-col justify-between">
          <div className="border-b border-tactical-border/60 pb-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-tactical-text">
              Optimization Directive & Vehicle Sortie Calculations
            </h2>
            <p className="text-[10px] font-mono text-tactical-muted">OR-Tools Mathematical Decision Support Output</p>
          </div>

          {optimizationResult && (
            <div className="space-y-3 font-mono my-auto">
              <div className="p-3 rounded bg-tactical-card border border-tactical-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-tactical-muted uppercase">Recommended Tactical Mode:</span>
                  <div className="text-base font-bold text-tactical-cyan flex items-center gap-1.5 mt-0.5">
                    {optimizationResult.recommended_mode === 'ROTARY_HEAVY_AIRLIFT' ? (
                      <Plane className="w-4 h-4 text-tactical-cyan" />
                    ) : (
                      <Truck className="w-4 h-4 text-tactical-green" />
                    )}
                    {optimizationResult.recommended_mode.replace(/_/g, ' ')}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-tactical-muted uppercase">Sorties / Echelons:</span>
                  <div className="text-xl font-bold text-tactical-text">
                    {optimizationResult.estimated_echelons_required}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded bg-tactical-surface border border-tactical-border text-xs">
                <span className="text-[10px] font-bold text-tactical-khaki uppercase block mb-1">
                  Tactical Route Rationale:
                </span>
                <p className="text-tactical-text leading-relaxed">{optimizationResult.rationale}</p>
              </div>

              <div className="flex items-center justify-between text-[11px] p-2 rounded bg-tactical-card border border-tactical-border">
                <span className="text-tactical-muted">U6 Lift-per-kg Priority:</span>
                <Badge variant={optimizationResult.u6_lift_per_kg_priority === 'CRITICAL' ? 'red' : 'green'}>
                  {optimizationResult.u6_lift_per_kg_priority}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Convoys Manifest Table */}
      <div className="tactical-panel overflow-hidden">
        <div className="px-4 py-3 border-b border-tactical-border bg-tactical-card flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-tactical-text">
            Active Tactical Convoys & In-Transit Echelons
          </h2>
          <span className="text-[10px] font-mono text-tactical-muted">Live Satellite Positioning Feed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-tactical-card/50 border-b border-tactical-border text-tactical-muted uppercase text-[10px]">
              <tr>
                <th className="px-3.5 py-2">Echelon ID</th>
                <th className="px-3 py-2">Mode</th>
                <th className="px-3 py-2">Corridor / Route</th>
                <th className="px-3 py-2">Origin ➔ Destination</th>
                <th className="px-3 py-2 text-right">Cargo (Kg)</th>
                <th className="px-3 py-2 text-center">Status</th>
                <th className="px-3 py-2 text-center">Environmental Risk</th>
                <th className="px-3 py-2">Tactical Mission Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tactical-border/40">
              {convoys.map((c) => (
                <tr key={c.id} className="hover:bg-tactical-card/40 transition-colors">
                  <td className="px-3.5 py-2 font-bold text-tactical-text">{c.convoy_code}</td>
                  <td className="px-3 py-2">
                    <span className="text-tactical-cyan font-semibold">{c.transport_mode}</span>
                  </td>
                  <td className="px-3 py-2 text-tactical-muted text-[11px]">{c.corridor_name}</td>
                  <td className="px-3 py-2 text-tactical-text">
                    {c.source_warehouse_name} ➔ {c.dest_warehouse_name}
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-tactical-text">
                    {c.cargo_weight_kg.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Badge variant={c.status === 'IN_TRANSIT' ? 'green' : 'amber'}>
                      {c.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Badge variant={c.environmental_risk_level === 'LOW' ? 'green' : 'amber'}>
                      {c.environmental_risk_level}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-[10px] text-tactical-muted truncate max-w-xs">
                    {c.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
