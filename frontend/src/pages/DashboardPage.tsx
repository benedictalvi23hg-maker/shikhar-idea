import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Package,
  AlertTriangle,
  Snowflake,
  Truck,
  Factory,
  CloudSun,
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
  ArrowRight,
  Activity,
  CheckCircle2,
  RefreshCw,
  PieChart as PieIcon,
  HelpCircle
} from 'lucide-react'
import { StatCard } from '../components/StatCard'
import { Badge } from '../components/Badge'
import { shikharApi } from '../services/api'
import { useI18nStore } from '../i18n/i18nStore'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { language, t } = useI18nStore()
  const [summary, setSummary] = useState<any>(null)
  const [charts, setCharts] = useState<any>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const getLocalizedCategory = (name: string) => {
    if (name.includes('Medical') || name.includes('Plasma')) {
      if (language === 'hi') return 'चिकित्सा आपूर्ति एवं प्लाज्मा'
      if (language === 'ta') return 'மருத்துவ பொருட்கள் & பிளாஸ்மா'
      return 'Medical Supplies & Plasma'
    }
    if (name.includes('Rations') || name.includes('MRE')) {
      if (language === 'hi') return 'उच्च-ऊंचाई खाद्य राशन (MRE)'
      if (language === 'ta') return 'உயரமான இடங்களுக்கான உணவு (MRE)'
      return 'High-Altitude Rations & MRE'
    }
    if (name.includes('Fuel') || name.includes('POL')) {
      if (language === 'hi') return 'विमानन ईंधन एवं डीजल (POL)'
      if (language === 'ta') return 'விமான எரிபொருள் (POL)'
      return 'Aviation Fuel & Arctic Diesel'
    }
    if (name.includes('Batteries') || name.includes('UAV')) {
      if (language === 'hi') return 'ड्रोन लीथियम बैटरी'
      if (language === 'ta') return 'ட்ரோன் பேட்டரிகள்'
      return 'Drone & UAV Batteries'
    }
    if (name.includes('Clothing') || name.includes('Cold')) {
      if (language === 'hi') return 'अत्यधिक ठंड के सैन्य वस्त्र'
      if (language === 'ta') return 'கடும் குளிர்கால உடைகள்'
      return 'Extreme Cold Weather Clothing'
    }
    return name
  }

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const [sumRes, chartRes, alertRes, actRes, recRes] = await Promise.all([
        shikharApi.getDashboardSummary(),
        shikharApi.getDashboardCharts(),
        shikharApi.getDashboardAlerts(),
        shikharApi.getRecentActivity(),
        shikharApi.getRecommendations()
      ])
      setSummary(sumRes)
      setCharts(chartRes)
      setAlerts(alertRes)
      setRecentActivity(actRes)
      setRecommendations(recRes)
    } catch (e: any) {
      console.error('Failed to load dashboard data:', e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      {/* Top Banner: Operational Situation Report */}
      <div className="bg-tactical-surface border border-tactical-border rounded p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tactical-green pulse-live" />
            <h1 className="text-base font-mono font-bold uppercase tracking-wider text-tactical-text">
              DEFENSE THEATER LOGISTICS COMMAND • SITREP
            </h1>
          </div>
          <p className="text-xs font-mono text-tactical-muted mt-0.5">
            Operational Theater: Northern & Western Frontier Hubs • Physics & ML Engines Synchronized
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={loadDashboardData}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-tactical-card border border-tactical-border hover:border-tactical-olive rounded text-xs font-mono text-tactical-muted hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-tactical-olive' : ''}`} />
            <span>Refresh Feed</span>
          </button>
          <button
            onClick={() => navigate('/challenger-ai')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-tactical-olive hover:bg-tactical-oliveLight rounded text-xs font-mono font-bold text-white transition-colors shadow"
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>{t('terms.u18', 'AI Safety Check')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid - All connected with clicks */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        <StatCard
          title={t('kpi.activeWarehouses', 'Warehouses')}
          value={summary?.total_warehouses ?? 5}
          unit="Depots"
          icon={Building2}
          subtitle="All Commands"
          status="optimal"
          onClick={() => navigate('/warehouses')}
        />
        <StatCard
          title={t('kpi.totalInventory', 'Total Inventory')}
          value={summary?.total_inventory_units ? (summary.total_inventory_units / 1000).toFixed(1) + 'k' : '18.5k'}
          unit="Units"
          icon={Package}
          subtitle="Verified Ledger"
          status="optimal"
          onClick={() => navigate('/inventory')}
        />
        <StatCard
          title="Running Low"
          value={summary?.products_running_low ?? 5}
          unit="SKUs"
          icon={AlertTriangle}
          subtitle="Reorder Breach"
          status="warning"
          onClick={() => navigate('/inventory?low_stock_only=true')}
        />
        <StatCard
          title="Shortages (Pred)"
          value={summary?.predicted_shortages ?? 5}
          unit="Forecast"
          icon={TrendingUp}
          subtitle="D+30 Surge"
          status="warning"
          onClick={() => navigate('/forecast')}
        />
        <StatCard
          title="Freshness Risk"
          value={summary?.products_at_freshness_risk ?? 1}
          unit="Batches"
          icon={Snowflake}
          subtitle="Thermal Decay Risk"
          status="critical"
          onClick={() => navigate('/freshness')}
        />
        <StatCard
          title="Transit Risk"
          value={summary?.transportation_risk_indicators ?? 2}
          unit="Corridors"
          icon={Truck}
          subtitle="Avalanche Pass"
          status="warning"
          onClick={() => navigate('/transportation')}
        />
        <StatCard
          title="Supplier Rel."
          value={summary?.average_supplier_reliability ? `${summary.average_supplier_reliability}%` : '95.0%'}
          icon={Factory}
          subtitle="Fulfillment KPI"
          status="optimal"
          onClick={() => navigate('/suppliers')}
        />
        <StatCard
          title="Env. Hazards"
          value={summary?.active_environmental_alerts ?? 2}
          unit="Zones"
          icon={CloudSun}
          subtitle="Sub-zero / Snow"
          status="warning"
          onClick={() => navigate('/weather')}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Demand Forecasting & Trend Chart */}
        <div className="lg:col-span-8 tactical-panel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-tactical-border/60 pb-2.5 mb-3">
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-tactical-text flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-tactical-oliveLight" />
                AI Demand Trajectory & Forecast Horizon (U4 Router)
              </h2>
              <p className="text-[10px] font-mono text-tactical-muted">
                Confidence Band: 95% Interval • Intermittent & Trend-Adjusted
              </p>
            </div>
            <button
              onClick={() => navigate('/forecast')}
              className="text-[11px] font-mono text-tactical-khaki hover:text-white flex items-center gap-1 hover:underline"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.demand_trend || []}>
                <defs>
                  <linearGradient id="actualColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#607F35" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#607F35" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="forecastColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E5A93C" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#E5A93C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#243024" />
                <XAxis dataKey="period" stroke="#94A3B8" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141A14', borderColor: '#283528', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Area type="monotone" dataKey="actual" stroke="#607F35" strokeWidth={2} fillOpacity={1} fill="url(#actualColor)" name="Actual Demand" />
                <Area type="monotone" dataKey="forecast" stroke="#E5A93C" strokeDasharray="4 4" strokeWidth={2} fillOpacity={1} fill="url(#forecastColor)" name="Predicted Demand" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Split Pie: Strategic Asset Allocation */}
        <div className="lg:col-span-4 tactical-panel p-4 flex flex-col justify-between">
          <div className="border-b border-tactical-border/60 pb-2.5 mb-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-tactical-text flex items-center gap-1.5">
              <PieIcon className="w-3.5 h-3.5 text-tactical-oliveLight" />
              {t('assetAllocation.title', 'Strategic Asset Allocation')}
            </h2>
            <p className="text-[10px] font-mono text-tactical-muted">
              {t('assetAllocation.subtitle', 'Live Breakdown of Defense Supplies Across All Categories')}
            </p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={(charts?.category_split || []).map((c: any) => ({
                    ...c,
                    displayName: getLocalizedCategory(c.name)
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="displayName"
                >
                  {(charts?.category_split || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} units`, name]}
                  contentStyle={{ backgroundColor: '#141A14', borderColor: '#283528', fontSize: '11px', fontFamily: 'monospace' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Simple Explanation Note */}
          <div className="p-2 rounded bg-tactical-card/70 border border-tactical-border text-[10px] font-mono text-tactical-muted leading-tight mb-2">
            <span className="text-tactical-khaki font-semibold">ℹ️ {language === 'hi' ? 'सामग्री सारांश:' : language === 'ta' ? 'பொருட்கள் சுருக்கம்:' : 'Supply Summary:'} </span>
            {t('assetAllocation.description')}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] font-mono pt-2 border-t border-tactical-border/50">
            {(charts?.category_split || []).map((c: any) => (
              <div key={c.name} className="flex items-center space-x-1.5 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className="truncate text-tactical-muted" title={getLocalizedCategory(c.name)}>
                  {getLocalizedCategory(c.name)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row: Warehouse Comparisons & Tactical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Warehouse Capacity Comparison */}
        <div className="lg:col-span-7 tactical-panel p-4">
          <div className="flex items-center justify-between border-b border-tactical-border/60 pb-2.5 mb-3">
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-tactical-text flex items-center gap-2">
                <Building2 className="w-4 h-4 text-tactical-khaki" />
                Strategic Depot Load & Sensor Accuracy Score
              </h2>
              <p className="text-[10px] font-mono text-tactical-muted">
                Capacity vs Actual Load Tons • Live IoT sensor verification
              </p>
            </div>
            <button
              onClick={() => navigate('/warehouses')}
              className="text-[11px] font-mono text-tactical-khaki hover:text-white flex items-center gap-1 hover:underline"
            >
              <span>Manage Hubs</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.warehouse_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243024" />
                <XAxis dataKey="code" stroke="#94A3B8" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141A14', borderColor: '#283528', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Bar dataKey="capacity" fill="#2E3C2E" name="Total Capacity (Tons)" />
                <Bar dataKey="current_load" fill="#607F35" name="Current Stock (Tons)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Tactical Alerts & AI Recommendations */}
        <div className="lg:col-span-5 tactical-panel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-tactical-border/60 pb-2.5 mb-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-tactical-text flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-tactical-oliveLight" />
              AI Prioritized Safety Recommendations
            </h2>
            <Badge variant="olive">AI DECISION VERIFIED</Badge>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-60 pr-1">
            {recommendations.slice(0, 3).map((rec: any) => (
              <div
                key={rec.id}
                onClick={() => navigate('/challenger-ai')}
                className="p-2.5 rounded bg-tactical-card border border-tactical-border hover:border-tactical-olive cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono font-bold text-tactical-text truncate pr-2">
                    {rec.title}
                  </span>
                  <Badge variant={rec.urgency === 'IMMEDIATE_CRITICAL' ? 'red' : 'amber'}>
                    {rec.urgency.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-[10px] font-mono text-tactical-muted line-clamp-2">
                  {rec.description}
                </p>
                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-tactical-border/40 text-[9px] font-mono">
                  <span className="text-tactical-oliveLight flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Challenger Status: {rec.challenger_verification_status}
                  </span>
                  <span className="text-tactical-khaki font-bold">{rec.approval_status}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/challenger-ai')}
            className="w-full mt-3 py-1.5 rounded bg-tactical-card border border-tactical-border hover:border-tactical-olive text-[11px] font-mono text-tactical-text hover:text-white flex items-center justify-center space-x-1 transition-colors"
          >
            <span>Review Full Decision Ledger & Approvals</span>
            <ArrowRight className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>
    </div>
  )
}
