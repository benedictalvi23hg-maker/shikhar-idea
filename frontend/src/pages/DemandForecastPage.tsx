import React, { useEffect, useState } from 'react'
import {
  TrendingUp,
  BrainCircuit,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Play
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

export const DemandForecastPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [selectedProductId, setSelectedProductId] = useState<number>(3) // Default to High-Altitude Rations
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>(1) // Default to Leh Forward Depot
  const [horizonDays, setHorizonDays] = useState<number>(30)
  const [forecastData, setForecastData] = useState<any>(null)
  const [modelMetrics, setModelMetrics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadInitial = async () => {
    try {
      const [pRes, wRes, mRes] = await Promise.all([
        shikharApi.getProducts(),
        shikharApi.getWarehouses(),
        shikharApi.getForecastPerformance()
      ])
      setProducts(pRes)
      setWarehouses(wRes)
      setModelMetrics(mRes)
      
      // Auto run first forecast
      executeForecast(3, 1, 30)
    } catch (e) {
      console.error(e)
    }
  }

  const executeForecast = async (pId: number, wId: number, days: number) => {
    setIsLoading(true)
    try {
      const res = await shikharApi.runForecast({
        product_id: pId,
        warehouse_id: wId,
        horizon_days: days
      })
      setForecastData(res)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadInitial()
  }, [])

  const handleRunSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    executeForecast(selectedProductId, selectedWarehouseId, horizonDays)
  }

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      {/* Page Header */}
      <div className="bg-tactical-surface border border-tactical-border rounded p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tactical-green pulse-live" />
            <h1 className="text-base font-mono font-bold uppercase tracking-wider text-tactical-text">
              PAGE 5: AI DEMAND & CONSUMPTION FORECASTING
            </h1>
          </div>
          <p className="text-xs font-mono text-tactical-muted mt-0.5">
            XGBoost Ensemble & Intermittent Croston Modeling • Dynamic Horizon & Uncertainty Intervals
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {forecastData?.provenance && (
            <Badge variant={forecastData.provenance === 'ACTUAL' ? 'green' : 'amber'}>
              PROVENANCE: {forecastData.provenance}
            </Badge>
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div className="tactical-panel p-3.5">
        <form onSubmit={handleRunSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono items-end">
          <div>
            <label className="block text-[10px] text-tactical-muted uppercase mb-1">Select Strategic Item</label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                const pId = Number(e.target.value)
                setSelectedProductId(pId)
                executeForecast(pId, selectedWarehouseId, horizonDays)
              }}
              className="w-full bg-tactical-card border border-tactical-border text-tactical-text p-2 rounded focus:outline-none focus:border-tactical-olive"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} - {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-tactical-muted uppercase mb-1">Target Forward Depot</label>
            <select
              value={selectedWarehouseId}
              onChange={(e) => {
                const wId = Number(e.target.value)
                setSelectedWarehouseId(wId)
                executeForecast(selectedProductId, wId, horizonDays)
              }}
              className="w-full bg-tactical-card border border-tactical-border text-tactical-text p-2 rounded focus:outline-none focus:border-tactical-olive"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  [{w.code}] {w.name} ({w.elevation_meters}m)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-tactical-muted uppercase mb-1">Horizon Cadence</label>
            <div className="flex space-x-1 border border-tactical-border p-1 rounded bg-tactical-card">
              <button
                type="button"
                onClick={() => {
                  setHorizonDays(7)
                  executeForecast(selectedProductId, selectedWarehouseId, 7)
                }}
                className={`flex-1 py-1 text-center rounded transition-colors ${
                  horizonDays === 7 ? 'bg-tactical-olive text-white font-bold' : 'text-tactical-muted hover:text-white'
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => {
                  setHorizonDays(30)
                  executeForecast(selectedProductId, selectedWarehouseId, 30)
                }}
                className={`flex-1 py-1 text-center rounded transition-colors ${
                  horizonDays === 30 ? 'bg-tactical-olive text-white font-bold' : 'text-tactical-muted hover:text-white'
                }`}
              >
                30 Days
              </button>
              <button
                type="button"
                onClick={() => {
                  setHorizonDays(90)
                  executeForecast(selectedProductId, selectedWarehouseId, 90)
                }}
                className={`flex-1 py-1 text-center rounded transition-colors ${
                  horizonDays === 90 ? 'bg-tactical-olive text-white font-bold' : 'text-tactical-muted hover:text-white'
                }`}
              >
                90 Days
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-tactical-olive hover:bg-tactical-oliveLight text-white font-bold uppercase rounded flex items-center justify-center space-x-1.5 shadow transition-colors"
            >
              <Play className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Computing ML...' : 'Run Demand Forecast'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Main Trajectory Visualization */}
      <div className="tactical-panel p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-tactical-border/60 pb-2.5 gap-2">
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-tactical-text flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-tactical-oliveLight" />
              Predicted Consumption Trajectory: {forecastData?.product_name || 'Selected Item'}
            </h2>
            <p className="text-[10px] font-mono text-tactical-muted">
              Model Chosen by Router: <span className="text-tactical-khaki font-bold">{forecastData?.model_used || 'XGBoost-Ensemble-U4'}</span> • Confidence Score: <span className="text-tactical-green font-bold">{forecastData ? (forecastData.confidence_score * 100).toFixed(1) + '%' : '-'}</span> • RMSE: {forecastData?.historical_rmse}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-mono">
            <span className="text-tactical-muted">Depot:</span>
            <span className="text-tactical-text font-bold">{forecastData?.warehouse_name}</span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData?.forecast_points || []}>
              <defs>
                <linearGradient id="predColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#607F35" stopOpacity={0.7}/>
                  <stop offset="95%" stopColor="#607F35" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="ciColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E5A93C" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#E5A93C" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#243024" />
              <XAxis dataKey="date" stroke="#94A3B8" tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <YAxis stroke="#94A3B8" tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#141A14', borderColor: '#283528', fontSize: '11px', fontFamily: 'monospace' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
              <Area type="monotone" dataKey="confidence_upper" stroke="#E5A93C" strokeDasharray="3 3" strokeWidth={1} fill="transparent" name="95% Upper Bound" />
              <Area type="monotone" dataKey="predicted_demand" stroke="#607F35" strokeWidth={2.5} fillOpacity={1} fill="url(#predColor)" name="Predicted Daily Demand" />
              <Area type="monotone" dataKey="confidence_lower" stroke="#E5A93C" strokeDasharray="3 3" strokeWidth={1} fill="transparent" name="95% Lower Bound" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Performance & Router Strategy Matrix */}
      <div className="tactical-panel p-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-tactical-text mb-2 flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-tactical-khaki" />
          Forecast Router U4 Algorithm Benchmarks & Operational Diagnostics
        </h3>
        <p className="text-[10px] font-mono text-tactical-muted mb-3">
          The router inspects intermittency and variance depth. High zero-demand ratios automatically trigger Croston Intermittent forecasting.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-tactical-card border-b border-tactical-border text-tactical-muted uppercase text-[10px]">
              <tr>
                <th className="px-3 py-2">Model Architecture</th>
                <th className="px-3 py-2">Operational Suitability</th>
                <th className="px-3 py-2 text-center">MAPE %</th>
                <th className="px-3 py-2 text-center">RMSE</th>
                <th className="px-3 py-2 text-center">95% Interval Coverage</th>
                <th className="px-3 py-2 text-center">Engine Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tactical-border/40">
              {modelMetrics?.models_evaluated?.map((m: any) => (
                <tr key={m.model_name} className="hover:bg-tactical-card/40">
                  <td className="px-3 py-2 font-bold text-tactical-text">{m.model_name}</td>
                  <td className="px-3 py-2 text-tactical-muted text-[11px]">{m.suitability}</td>
                  <td className="px-3 py-2 text-center text-tactical-green font-bold">{m.mape_pct}%</td>
                  <td className="px-3 py-2 text-center text-tactical-text">{m.rmse}</td>
                  <td className="px-3 py-2 text-center text-tactical-khaki">{m.coverage_95_pct}%</td>
                  <td className="px-3 py-2 text-center">
                    <Badge variant={m.status === 'ACTIVE_PRIMARY' ? 'green' : 'olive'}>
                      {m.status}
                    </Badge>
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
