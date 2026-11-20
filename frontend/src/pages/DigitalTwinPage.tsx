import React, { useState } from 'react'
import {
  Binary,
  Play,
  RotateCcw,
  Sliders,
  ShieldAlert,
  Snowflake,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Thermometer
} from 'lucide-react'
import { shikharApi } from '../services/api'
import { Badge } from '../components/Badge'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

export const DigitalTwinPage: React.FC = () => {
  const [scenarioName, setScenarioName] = useState('Winter Blizzard & Zojila Closure 2026')
  const [durationDays, setDurationDays] = useState(30)
  const [corridorBlockageProb, setCorridorBlockageProb] = useState(0.75)
  const [tempDrop, setTempDrop] = useState(-18)
  const [demandSurge, setDemandSurge] = useState(1.4)
  const [supplierDelay, setSupplierDelay] = useState(14)
  
  const [simulationResult, setSimulationResult] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRunning(true)
    try {
      const res = await shikharApi.runSimulation({
        name: scenarioName,
        duration_days: durationDays,
        corridor_blockage_probability: corridorBlockageProb,
        temperature_drop_c: tempDrop,
        demand_surge_multiplier: demandSurge,
        supplier_delay_days: supplierDelay
      })
      setSimulationResult(res)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      {/* Page Header */}
      <div className="bg-tactical-surface border border-tactical-border rounded p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tactical-cyan pulse-live" />
            <h1 className="text-base font-mono font-bold uppercase tracking-wider text-tactical-text">
              PAGE 14: WHAT-IF SCENARIO & WINTER REHEARSAL SIMULATION
            </h1>
          </div>
          <p className="text-xs font-mono text-tactical-muted mt-0.5">
            Monte Carlo Stochastic Perturbation • Pass Closure Stress Testing • Supply Chain Resilience
          </p>
        </div>

        <div className="bg-tactical-card px-3 py-1.5 rounded border border-tactical-cyan/40 text-[10px] font-mono text-tactical-cyan">
          STATUS: SIMULATED ENVIRONMENT (ISOLATED FROM REAL INVENTORY)
        </div>
      </div>

      {/* Grid: Scenario Configuration Workbench & Quantitative Outcome */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Scenario Controls */}
        <div className="lg:col-span-5 tactical-panel p-4 space-y-4">
          <div className="border-b border-tactical-border/60 pb-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-tactical-text flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-tactical-khaki" />
              Scenario Disruption Parameters
            </h2>
            <p className="text-[10px] font-mono text-tactical-muted">
              Configure environmental, transit, and demand shocks to test forward depot endurance
            </p>
          </div>

          <form onSubmit={handleRunSimulation} className="space-y-3.5 text-xs font-mono">
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Scenario Nomenclature</label>
              <input
                type="text"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-tactical-muted">Simulation Duration:</span>
                <span className="font-bold text-tactical-text">{durationDays} Days</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full accent-tactical-olive"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-tactical-muted">Pass Blockage Probability:</span>
                <span className="font-bold text-tactical-red">{(corridorBlockageProb * 100).toFixed(0)}% Odds</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={corridorBlockageProb}
                onChange={(e) => setCorridorBlockageProb(Number(e.target.value))}
                className="w-full accent-tactical-red"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-tactical-muted">Sub-Zero Temperature Drop:</span>
                <span className="font-bold text-tactical-cyan">{tempDrop}°C</span>
              </div>
              <input
                type="range"
                min="-35"
                max="0"
                step="1"
                value={tempDrop}
                onChange={(e) => setTempDrop(Number(e.target.value))}
                className="w-full accent-tactical-cyan"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-tactical-muted">Surge Demand Multiplier:</span>
                <span className="font-bold text-tactical-amber">{demandSurge}x Consumption</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.1"
                value={demandSurge}
                onChange={(e) => setDemandSurge(Number(e.target.value))}
                className="w-full accent-tactical-amber"
              />
            </div>

            <button
              type="submit"
              disabled={isRunning}
              className="w-full py-2.5 bg-tactical-olive hover:bg-tactical-oliveLight text-white font-bold uppercase rounded flex items-center justify-center space-x-1.5 shadow transition-colors"
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Executing Simulation...' : 'Run Winter Simulation'}</span>
            </button>
          </form>
        </div>

        {/* Simulation Output Dashboard */}
        <div className="lg:col-span-7 tactical-panel p-4 flex flex-col justify-between space-y-4">
          <div className="border-b border-tactical-border/60 pb-2 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-tactical-text">
                Quantitative Stochastic Results & Survival Metrics
              </h2>
              <p className="text-[10px] font-mono text-tactical-muted">
                {simulationResult ? simulationResult.scenario_name : 'Awaiting scenario initiation'}
              </p>
            </div>
            {simulationResult && (
              <Badge variant={simulationResult.resilience_score > 75 ? 'green' : 'amber'}>
                RESILIENCE: {simulationResult.resilience_score}/100
              </Badge>
            )}
          </div>

          {simulationResult ? (
            <div className="space-y-4 font-mono">
              {/* Outcome Stat Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded bg-tactical-card border border-tactical-border">
                  <span className="text-[10px] text-tactical-muted block">Survival Rate</span>
                  <span className="text-lg font-bold text-tactical-green">
                    {simulationResult.overall_survival_rate_pct}%
                  </span>
                </div>
                <div className="p-2.5 rounded bg-tactical-card border border-tactical-border">
                  <span className="text-[10px] text-tactical-muted block">Stockout Days</span>
                  <span className={`text-lg font-bold ${simulationResult.simulated_stockouts_count > 0 ? 'text-tactical-red' : 'text-tactical-green'}`}>
                    {simulationResult.simulated_stockouts_count} Days
                  </span>
                </div>
                <div className="p-2.5 rounded bg-tactical-card border border-tactical-border">
                  <span className="text-[10px] text-tactical-muted block">Est. Cold Spoilage</span>
                  <span className="text-lg font-bold text-tactical-amber">
                    {simulationResult.estimated_spoilage_units} Units
                  </span>
                </div>
                <div className="p-2.5 rounded bg-tactical-card border border-tactical-border">
                  <span className="text-[10px] text-tactical-muted block">Critical Hub</span>
                  <span className="text-xs font-bold text-tactical-khaki truncate block mt-1">
                    Leh Forward
                  </span>
                </div>
              </div>

              {/* Trajectory Timeline Chart */}
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={simulationResult.metrics_timeline || []}>
                    <defs>
                      <linearGradient id="simStock" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#243024" />
                    <XAxis dataKey="day" stroke="#94A3B8" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                    <YAxis stroke="#94A3B8" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#141A14', borderColor: '#283528', fontSize: '11px', fontFamily: 'monospace' }}
                    />
                    <Area type="monotone" dataKey="stock_remaining" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#simStock)" name="Remaining Stock Units" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Mitigations Directives */}
              <div className="p-3 rounded bg-tactical-card border border-tactical-olive/60 text-xs">
                <span className="text-[10px] font-bold text-tactical-oliveLight uppercase block mb-1">
                  Tactical Twin Mitigation Recommendations:
                </span>
                <p className="text-tactical-text leading-relaxed">
                  {simulationResult.recommended_mitigations}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-tactical-muted font-mono text-xs py-16">
              Adjust disruption parameters and click &quot;Run Winter Rehearsal&quot; to execute Monte Carlo twin.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
