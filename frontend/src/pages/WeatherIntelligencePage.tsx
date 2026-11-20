import React, { useEffect, useState } from 'react'
import {
  CloudSun,
  Snowflake,
  Wind,
  Eye,
  Thermometer,
  ShieldAlert,
  Radio,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { shikharApi } from '../services/api'
import { Badge } from '../components/Badge'

export const WeatherIntelligencePage: React.FC = () => {
  const [observations, setObservations] = useState<any[]>([])
  const [providers, setProviders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [obsRes, provRes] = await Promise.all([
        shikharApi.getWeatherCurrent(),
        shikharApi.getWeatherProviders()
      ])
      setObservations(obsRes)
      setProviders(provRes)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      {/* Page Header */}
      <div className="bg-tactical-surface border border-tactical-border rounded p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tactical-green pulse-live" />
            <h1 className="text-base font-mono font-bold uppercase tracking-wider text-tactical-text">
              PAGE 10: CLIMATE & WEATHER INTELLIGENCE • SATELLITE RADAR
            </h1>
          </div>
          <p className="text-xs font-mono text-tactical-muted mt-0.5">
            Sub-Zero Atmospheric Monitoring • Avalanche & Blizzard Prediction • Grounding Verified
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-tactical-card border border-tactical-border hover:border-tactical-olive rounded text-xs font-mono text-tactical-muted hover:text-white transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-tactical-olive' : ''}`} />
          <span>Refresh Weather Telemetry</span>
        </button>
      </div>

      {/* Regional Observation Stations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {observations.map((obs) => (
          <div key={obs.id} className="tactical-panel p-4 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-tactical-muted uppercase">
                    {obs.warehouse_name}
                  </span>
                  <h2 className="text-sm font-mono font-bold text-tactical-text mt-0.5">
                    {obs.region_name}
                  </h2>
                </div>
                <Badge
                  variant={
                    obs.environmental_threat_code === 'GREEN_NOMINAL'
                      ? 'green'
                      : obs.environmental_threat_code === 'AMBER_CAUTION'
                      ? 'amber'
                      : 'red'
                  }
                >
                  {obs.environmental_threat_code.replace('_', ' ')}
                </Badge>
              </div>

              {/* Primary Temperature & Visual */}
              <div className="flex items-baseline space-x-2 my-3">
                <span className="text-3xl font-mono font-bold text-tactical-text">
                  {obs.temperature_c > 0 ? `+${obs.temperature_c}` : obs.temperature_c}°C
                </span>
                <span className="text-xs font-mono text-tactical-muted">
                  {obs.temperature_c < 0 ? 'SUB-ZERO FREEZE' : 'NOMINAL TEMPERATE'}
                </span>
              </div>

              {/* Atmospheric Sensor Readings Grid */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-tactical-muted pt-2 border-t border-tactical-border/50">
                <div className="flex items-center space-x-1.5">
                  <Snowflake className="w-3.5 h-3.5 text-tactical-cyan" />
                  <span>Snowfall: <strong className="text-tactical-text">{obs.snowfall_cm} cm</strong></span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Wind className="w-3.5 h-3.5 text-tactical-amber" />
                  <span>Winds: <strong className="text-tactical-text">{obs.wind_speed_kmh} km/h</strong></span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Eye className="w-3.5 h-3.5 text-tactical-khaki" />
                  <span>Visibility: <strong className="text-tactical-text">{obs.visibility_km} km</strong></span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CloudSun className="w-3.5 h-3.5 text-tactical-oliveLight" />
                  <span>Satellite: <strong className="text-tactical-text">{obs.satellite_cloud_index}</strong></span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-tactical-border/40 text-[9px] font-mono text-tactical-muted flex justify-between items-center">
              <span>Source: {obs.provider_source}</span>
              <span className="text-tactical-oliveLight">LIVE</span>
            </div>
          </div>
        ))}
      </div>

      {/* Weather Ingestion Providers Status Table */}
      <div className="tactical-panel p-4 space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-tactical-text flex items-center gap-2 border-b border-tactical-border/60 pb-2">
          <Radio className="w-4 h-4 text-tactical-cyan" />
          Configured Climatology & Satellite Telemetry Ingestion Providers
        </h2>
        <p className="text-[10px] font-mono text-tactical-muted">
          All external providers are verified against live APIs. Non-connected feeds are explicitly labelled simulated.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-tactical-card border-b border-tactical-border text-tactical-muted uppercase text-[10px]">
              <tr>
                <th className="px-3.5 py-2">Provider Authority</th>
                <th className="px-3 py-2 text-center">Status</th>
                <th className="px-3 py-2 text-center">Latency</th>
                <th className="px-3 py-2 text-center">Telemetry Provenance</th>
                <th className="px-3 py-2 text-center">Operational Sync Cadence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tactical-border/40">
              {providers.map((p) => (
                <tr key={p.name} className="hover:bg-tactical-card/40">
                  <td className="px-3.5 py-2 font-bold text-tactical-text">{p.name}</td>
                  <td className="px-3 py-2 text-center">
                    <Badge variant={p.status.includes('CONNECTED') ? 'green' : 'amber'}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-center text-tactical-muted">
                    {p.latency_ms > 0 ? `${p.latency_ms} ms` : '-'}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Badge variant={p.is_real_data ? 'green' : 'amber'}>
                      {p.is_real_data ? 'REAL DATA STREAM' : 'SIMULATED / MOCK'}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-center text-tactical-khaki text-[11px]">
                    {p.last_synced}
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
