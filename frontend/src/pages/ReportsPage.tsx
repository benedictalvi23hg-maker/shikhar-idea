import React, { useEffect, useState } from 'react'
import {
  FileBarChart2,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  Package,
  Truck,
  Factory
} from 'lucide-react'
import { shikharApi } from '../services/api'
import { Badge } from '../components/Badge'

export const ReportsPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null)
  const [selectedReportType, setSelectedReportType] = useState('inventory')

  useEffect(() => {
    shikharApi.getReportsSummary().then(setSummary).catch(console.error)
  }, [])

  const handleDownload = (type: string) => {
    window.open(`/api/v1/reports/export?report_type=${type}`, '_blank')
  }

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      {/* Page Header */}
      <div className="bg-tactical-surface border border-tactical-border rounded p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tactical-green pulse-live" />
            <h1 className="text-base font-mono font-bold uppercase tracking-wider text-tactical-text">
              PAGE 16: REPORTS, AUDIT COMPLIANCE & ANALYTICS MANIFESTS
            </h1>
          </div>
          <p className="text-xs font-mono text-tactical-muted mt-0.5">
            Operational Audit Manifests • Multi-Echelon Export Services • Real CSV & Data Streaming
          </p>
        </div>

        <Badge variant="khaki">{summary?.security_classification || 'RESTRICTED'}</Badge>
      </div>

      {/* Summary Stat Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="tactical-panel p-3">
          <span className="text-[10px] font-mono uppercase text-tactical-muted">Verified Total SKUs</span>
          <div className="text-xl font-mono font-bold text-tactical-text mt-1">{summary?.total_catalog_skus ?? 8} Lines</div>
        </div>
        <div className="tactical-panel p-3">
          <span className="text-[10px] font-mono uppercase text-tactical-muted">Stocked Units Manifest</span>
          <div className="text-xl font-mono font-bold text-tactical-green mt-1">{summary?.total_units_stocked?.toLocaleString() ?? '18,480'}</div>
        </div>
        <div className="tactical-panel p-3">
          <span className="text-[10px] font-mono uppercase text-tactical-muted">Active Depots</span>
          <div className="text-xl font-mono font-bold text-tactical-khaki mt-1">{summary?.total_warehouses ?? 5} Hubs</div>
        </div>
        <div className="tactical-panel p-3">
          <span className="text-[10px] font-mono uppercase text-tactical-muted">Convoys in Field</span>
          <div className="text-xl font-mono font-bold text-tactical-cyan mt-1">{summary?.active_convoys_in_field ?? 2} En Route</div>
        </div>
      </div>

      {/* Report Generation Catalog */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Report 1: Complete Inventory Asset Manifest */}
        <div className="tactical-panel p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="w-8 h-8 rounded bg-tactical-olive/20 border border-tactical-olive flex items-center justify-center mb-2">
              <Package className="w-4 h-4 text-tactical-oliveLight" />
            </div>
            <h2 className="text-sm font-mono font-bold text-tactical-text">
              Complete Inventory Asset Manifest
            </h2>
            <p className="text-[11px] font-mono text-tactical-muted mt-1 leading-relaxed">
              Full relational inventory snapshot including SKU codes, on-hand counts, isolation-adjusted days of supply (U1), and U9 stock truth scores across all defense depots.
            </p>
          </div>

          <div className="pt-3 border-t border-tactical-border/50">
            <button
              onClick={() => handleDownload('inventory')}
              className="w-full py-2 rounded bg-tactical-card border border-tactical-border hover:border-tactical-olive text-xs font-mono font-bold text-tactical-text hover:text-white flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Inventory CSV</span>
            </button>
          </div>
        </div>

        {/* Report 2: Strategic Warehouses & Capacity Manifest */}
        <div className="tactical-panel p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="w-8 h-8 rounded bg-tactical-khaki/20 border border-tactical-khaki flex items-center justify-center mb-2">
              <Building2 className="w-4 h-4 text-tactical-khaki" />
            </div>
            <h2 className="text-sm font-mono font-bold text-tactical-text">
              Strategic Depots Capacity & Readiness
            </h2>
            <p className="text-[11px] font-mono text-tactical-muted mt-1 leading-relaxed">
              Multi-warehouse directory with total tonnage capacities, current loads, utilization percentages, elevation figures, and cold-chain/hazardous storage readiness indicators.
            </p>
          </div>

          <div className="pt-3 border-t border-tactical-border/50">
            <button
              onClick={() => handleDownload('warehouses')}
              className="w-full py-2 rounded bg-tactical-card border border-tactical-border hover:border-tactical-khaki text-xs font-mono font-bold text-tactical-text hover:text-white flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Warehouses CSV</span>
            </button>
          </div>
        </div>

        {/* Report 3: Supplier Risk & Lead-Time Manifest */}
        <div className="tactical-panel p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="w-8 h-8 rounded bg-tactical-amber/20 border border-tactical-amber flex items-center justify-center mb-2">
              <Factory className="w-4 h-4 text-tactical-amber" />
            </div>
            <h2 className="text-sm font-mono font-bold text-tactical-text">
              Vendor Reliability & Lead-Time Matrix
            </h2>
            <p className="text-[11px] font-mono text-tactical-muted mt-1 leading-relaxed">
              Historical supplier fulfillment ratings, on-time delivery percentages, quality pass ratios, lead time variances, and defense procurement risk classifications.
            </p>
          </div>

          <div className="pt-3 border-t border-tactical-border/50">
            <button
              onClick={() => handleDownload('suppliers')}
              className="w-full py-2 rounded bg-tactical-card border border-tactical-border hover:border-tactical-amber text-xs font-mono font-bold text-tactical-text hover:text-white flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Suppliers CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
