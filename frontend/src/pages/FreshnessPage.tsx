import React, { useEffect, useState } from 'react'
import {
  Snowflake,
  Thermometer,
  Droplets,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  ShieldAlert
} from 'lucide-react'
import { shikharApi } from '../services/api'
import { Badge } from '../components/Badge'

export const FreshnessPage: React.FC = () => {
  const [batches, setBatches] = useState<any[]>([])
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null)
  
  // Simulation Controls for Thermal Kinetic Stress Testing
  const [testTemp, setTestTemp] = useState<number>(6.5)
  const [testHumidity, setTestHumidity] = useState<number>(55.0)
  const [predictionResult, setPredictionResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadBatches = async () => {
    try {
      const res = await shikharApi.getFreshnessBatches()
      setBatches(res)
      if (res.length > 0) {
        setSelectedBatchId(res[0].id)
        runArrheniusPrediction(res[0].id, 6.5, 55.0)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const runArrheniusPrediction = async (batchId: number, temp: number, hum: number) => {
    setIsLoading(true)
    try {
      const res = await shikharApi.predictFreshness({
        batch_id: batchId,
        temperature_override_c: temp,
        humidity_override_pct: hum
      })
      setPredictionResult(res)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBatches()
  }, [])

  const handleBatchSelect = (bId: number) => {
    setSelectedBatchId(bId)
    runArrheniusPrediction(bId, testTemp, testHumidity)
  }

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedBatchId) {
      runArrheniusPrediction(selectedBatchId, testTemp, testHumidity)
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
              PAGE 6: BATCH FRESHNESS & EXPIRY MONITOR
            </h1>
          </div>
          <p className="text-xs font-mono text-tactical-muted mt-0.5">
            Physics-Informed Shelf-Life • Dynamic Remaining Days Acceleration
          </p>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="bg-tactical-card px-3 py-1.5 rounded border border-tactical-amber/40 flex items-center space-x-2 text-[10px] font-mono text-tactical-amber">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>MANDATE: AI estimates do not substitute clinical or chemical safety checks.</span>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Monitored Perishable Batches */}
        <div className="lg:col-span-5 tactical-panel p-4 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-tactical-text mb-2 flex items-center gap-1.5">
              <Snowflake className="w-4 h-4 text-tactical-cyan" />
              Active Monitored Defense Batches
            </h2>
            <p className="text-[10px] font-mono text-tactical-muted mb-3">
              Real-time wireless temperature probes & smart level depletion sensors
            </p>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {batches.map((b) => (
                <div
                  key={b.id}
                  onClick={() => handleBatchSelect(b.id)}
                  className={`p-3 rounded border cursor-pointer transition-all ${
                    selectedBatchId === b.id
                      ? 'bg-tactical-olive/20 border-tactical-olive shadow-md'
                      : 'bg-tactical-card border-tactical-border hover:border-tactical-olive/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-tactical-text">
                      {b.product_name}
                    </span>
                    <Badge
                      variant={
                        b.quality_status === 'OPTIMAL'
                          ? 'green'
                          : b.quality_status === 'ELEVATED_RISK'
                          ? 'amber'
                          : 'red'
                      }
                    >
                      {b.quality_status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-tactical-muted mt-1">
                    <span>Batch: {b.batch_number}</span>
                    <span>Depot: {b.warehouse_name}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono pt-1.5 mt-1.5 border-t border-tactical-border/40">
                    <span className="text-tactical-khaki">
                      On-Hand: {b.quantity.toLocaleString()} units
                    </span>
                    <span className="text-tactical-cyan font-bold">
                      Dynamic RSL: {b.dynamic_rsl_days} Days
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Physics-Informed Degradation Workbench */}
        <div className="lg:col-span-7 tactical-panel p-4 space-y-4">
          <div className="border-b border-tactical-border/60 pb-2.5">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-tactical-text flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-tactical-amber" />
              Thermal Stress Simulation Workbench (Arrhenius Rate Equation)
            </h2>
            <p className="text-[10px] font-mono text-tactical-muted">
              Adjust temperature to simulate cold-chain breach and calculate accelerated quality loss velocity: k(T) = A·exp(-Ea/RT)
            </p>
          </div>

          {/* Sliders */}
          <form onSubmit={handleSimulate} className="bg-tactical-card p-3 rounded border border-tactical-border space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-tactical-muted flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-tactical-amber" />
                  Chamber / Ambient Exposure Temperature:
                </span>
                <span className="font-bold text-tactical-text">{testTemp}°C</span>
              </div>
              <input
                type="range"
                min="-25"
                max="45"
                step="0.5"
                value={testTemp}
                onChange={(e) => setTestTemp(Number(e.target.value))}
                className="w-full accent-tactical-olive cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-tactical-muted">
                <span>-25°C (Cryo)</span>
                <span>4°C (Nominal Cold)</span>
                <span>25°C (Ambient)</span>
                <span>45°C (Desert Thermal Shock)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-tactical-muted flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-tactical-cyan" />
                  Relative Humidity:
                </span>
                <span className="font-bold text-tactical-text">{testHumidity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="95"
                step="1"
                value={testHumidity}
                onChange={(e) => setTestHumidity(Number(e.target.value))}
                className="w-full accent-tactical-cyan cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-tactical-olive hover:bg-tactical-oliveLight text-white font-bold uppercase rounded flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Calculate Freshness & Expiry</span>
            </button>
          </form>

          {/* Prediction Output Results */}
          {predictionResult && (
            <div className="tactical-panel p-3.5 space-y-3 bg-tactical-card/70 border-tactical-border">
              <div className="flex items-center justify-between border-b border-tactical-border/50 pb-2">
                <span className="text-xs font-mono font-bold text-tactical-text">
                  KINETIC ANALYSIS RESULTS: {predictionResult.batch_number}
                </span>
                <Badge
                  variant={
                    predictionResult.risk_classification === 'OPTIMAL'
                      ? 'green'
                      : predictionResult.risk_classification === 'ELEVATED_RISK'
                      ? 'amber'
                      : 'red'
                  }
                >
                  {predictionResult.risk_classification}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center font-mono">
                <div className="p-2 rounded bg-tactical-surface border border-tactical-border">
                  <div className="text-[10px] text-tactical-muted">Days Left (Shelf-Life)</div>
                  <div className="text-base font-bold text-tactical-cyan">
                    {predictionResult.dynamic_remaining_shelf_life_days} Days
                  </div>
                </div>

                <div className="p-2 rounded bg-tactical-surface border border-tactical-border">
                  <div className="text-[10px] text-tactical-muted">Nominal Remaining</div>
                  <div className="text-base font-bold text-tactical-text">
                    {predictionResult.nominal_remaining_days} Days
                  </div>
                </div>

                <div className="p-2 rounded bg-tactical-surface border border-tactical-border">
                  <div className="text-[10px] text-tactical-muted">Depletion Velocity</div>
                  <div className="text-base font-bold text-tactical-amber">
                    {predictionResult.shelf_life_depletion_velocity}x Speed
                  </div>
                </div>

                <div className="p-2 rounded bg-tactical-surface border border-tactical-border">
                  <div className="text-[10px] text-tactical-muted">Physical Check</div>
                  <div className={`text-xs font-bold mt-1 ${predictionResult.inspection_mandated ? 'text-tactical-red' : 'text-tactical-green'}`}>
                    {predictionResult.inspection_mandated ? 'MANDATED' : 'PASS'}
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded bg-tactical-surface border border-tactical-border text-xs font-mono">
                <div className="text-tactical-khaki font-bold text-[10px] uppercase mb-1">
                  Tactical Quality Command Directive:
                </div>
                <div className="text-tactical-text">{predictionResult.recommended_action}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
