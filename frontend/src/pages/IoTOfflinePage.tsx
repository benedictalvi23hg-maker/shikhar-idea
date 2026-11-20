import React, { useEffect, useState } from 'react'
import {
  Radio,
  Wifi,
  WifiOff,
  BatteryCharging,
  RefreshCw,
  Sliders,
  HardDrive,
  Database,
  AlertTriangle,
  CheckCircle2,
  Send
} from 'lucide-react'
import { shikharApi } from '../services/api'
import { Badge } from '../components/Badge'
import {
  recordOfflineTransaction,
  getOfflineTransactions,
  syncOfflineLedger
} from '../services/offlineLedger'

export const IoTOfflinePage: React.FC = () => {
  const [devices, setDevices] = useState<any[]>([])
  const [offlineTxs, setOfflineTxs] = useState<any[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<string | null>(null)
  
  // Offline Transaction Creator Form State
  const [txType, setTxType] = useState('DISPATCH')
  const [warehouseId, setWarehouseId] = useState(1)
  const [productId, setProductId] = useState(1)
  const [quantity, setQuantity] = useState(25)
  const [notes, setNotes] = useState('Offline field patrol dispatch')

  const loadData = async () => {
    try {
      const devRes = await shikharApi.getIoTDevices()
      setDevices(devRes)
      const txs = await getOfflineTransactions()
      setOfflineTxs(txs)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateOfflineTx = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await recordOfflineTransaction(txType, {
        warehouse_id: warehouseId,
        product_id: productId,
        quantity,
        notes
      })
      const txs = await getOfflineTransactions()
      setOfflineTxs(txs)
      setNotes('Offline field patrol dispatch')
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      const res = await syncOfflineLedger()
      setSyncStatus(`Sync Finished: ${res.synced} Accepted, ${res.conflicts} Flagged`)
      const txs = await getOfflineTransactions()
      setOfflineTxs(txs)
    } catch (e: any) {
      setSyncStatus('Sync encountered communication error')
    } finally {
      setIsSyncing(false)
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
              PAGE 15: IOT SENSORS & OFFLINE SAFE LOGISTICS LEDGER
            </h1>
          </div>
          <p className="text-xs font-mono text-tactical-muted mt-0.5">
            Micro-Sensors • Smart-Drum Level Probes • Local Storage Safe Mode
          </p>
        </div>

        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-tactical-olive hover:bg-tactical-oliveLight rounded text-xs font-mono font-bold text-white transition-colors shadow"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>Sync Offline Entries</span>
        </button>
      </div>

      {syncStatus && (
        <div className="p-3 rounded bg-tactical-olive/15 border border-tactical-olive text-tactical-oliveLight text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* ESP32 Device Nodes & U8 Smart Drum Telemetry Grid */}
      <div className="tactical-panel p-4 space-y-3">
        <div className="border-b border-tactical-border/60 pb-2 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-tactical-text flex items-center gap-2">
              <Radio className="w-4 h-4 text-tactical-green" />
              ESP32 Wireless Sensor Fleet & U8 Smart-Drum Load Cells
            </h2>
            <p className="text-[10px] font-mono text-tactical-muted">
              Live MQTT broker telemetry streaming chamber temperature and fuel drum levels
            </p>
          </div>
          <Badge variant="green">MQTT BROKER ONLINE</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          {devices.map((dev) => (
            <div key={dev.id} className="p-3.5 rounded bg-tactical-card border border-tactical-border space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-tactical-khaki font-bold">{dev.device_uid}</span>
                  <h3 className="font-bold text-tactical-text text-xs mt-0.5">{dev.name}</h3>
                  <div className="text-[10px] text-tactical-muted">{dev.warehouse_name}</div>
                </div>
                <Badge variant={dev.is_online ? 'green' : 'amber'}>
                  {dev.is_online ? 'ONLINE' : 'HEARTBEAT LOST'}
                </Badge>
              </div>

              {/* Sensor Readings */}
              <div className="grid grid-cols-2 gap-2 text-center text-[11px] pt-2 border-t border-tactical-border/50">
                <div className="p-1.5 rounded bg-tactical-surface border border-tactical-border">
                  <span className="text-[9px] text-tactical-muted block">Temperature</span>
                  <span className="font-bold text-tactical-text">{dev.latest_temperature_c}°C</span>
                </div>
                <div className="p-1.5 rounded bg-tactical-surface border border-tactical-border">
                  <span className="text-[9px] text-tactical-muted block">Humidity</span>
                  <span className="font-bold text-tactical-text">{dev.latest_humidity_pct}%</span>
                </div>
              </div>

              {/* U8 Smart Drum Level Gauge */}
              {dev.latest_fill_level_pct !== null && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-tactical-muted">U8 Smart-Drum Level:</span>
                    <span className="text-tactical-cyan font-bold">{dev.latest_fill_level_pct}%</span>
                  </div>
                  <div className="w-full bg-tactical-surface h-2 rounded overflow-hidden border border-tactical-border">
                    <div
                      className="h-full bg-tactical-cyan"
                      style={{ width: `${dev.latest_fill_level_pct}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Hardware Health */}
              <div className="flex justify-between text-[9px] text-tactical-muted pt-2 border-t border-tactical-border/40">
                <span>Battery: {dev.battery_level_pct}%</span>
                <span>Signal: {dev.signal_strength_dbm} dBm</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* U7 Zero-Network Logistics Ledger: Local Offline Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Offline Transaction Logger */}
        <div className="lg:col-span-5 tactical-panel p-4 space-y-3">
          <div className="border-b border-tactical-border/60 pb-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-tactical-text flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-tactical-khaki" />
              Record Zero-Network Offline Transaction (IndexedDB)
            </h2>
            <p className="text-[10px] font-mono text-tactical-muted">
              Stores transactions locally on client device when network link is severed
            </p>
          </div>

          <form onSubmit={handleCreateOfflineTx} className="space-y-3 font-mono text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-tactical-muted uppercase mb-1">Transaction Type</label>
                <select
                  value={txType}
                  onChange={(e) => setTxType(e.target.value)}
                  className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
                >
                  <option value="DISPATCH">DISPATCH</option>
                  <option value="RECEIVE">RECEIVE</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-tactical-muted uppercase mb-1">Depot</label>
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(Number(e.target.value))}
                  className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
                >
                  <option value={1}>Leh Forward Depot</option>
                  <option value={2}>Chandigarh Strategic Hub</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-tactical-muted uppercase mb-1">Supply SKU</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(Number(e.target.value))}
                  className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
                >
                  <option value={1}>Universal Blood Plasma</option>
                  <option value={3}>High-Altitude Rations</option>
                  <option value={5}>Aviation Turbine Fuel</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-tactical-muted uppercase mb-1">Quantity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Tactical Field Note</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-tactical-card border border-tactical-border hover:border-tactical-olive text-tactical-text hover:text-white font-bold uppercase rounded flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Commit to IndexedDB Ledger</span>
            </button>
          </form>
        </div>

        {/* Local Sync Ledger Queue Table */}
        <div className="lg:col-span-7 tactical-panel p-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-tactical-border/60 pb-2 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-tactical-text">
                  Local IndexedDB Sync Queue & Conflict Auditor
                </h2>
                <p className="text-[10px] font-mono text-tactical-muted">
                  Queued operations awaiting handshake with Project SHIKHAR backend
                </p>
              </div>
              <Badge variant="cyan">{offlineTxs.length} LOCAL RECORDS</Badge>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-tactical-card border-b border-tactical-border text-tactical-muted uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2">Transaction ID</th>
                    <th className="px-3 py-2">Action</th>
                    <th className="px-3 py-2">Recorded At</th>
                    <th className="px-3 py-2 text-center">Sync State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tactical-border/40">
                  {offlineTxs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-tactical-muted">
                        No pending offline records. All field transactions synchronized.
                      </td>
                    </tr>
                  ) : (
                    offlineTxs.map((tx) => (
                      <tr key={tx.id} className="hover:bg-tactical-card/40">
                        <td className="px-3 py-2 text-tactical-text font-bold text-[11px]">{tx.id}</td>
                        <td className="px-3 py-2">
                          <span className="text-tactical-cyan">{tx.transactionType}</span> (Qty: {tx.payload.quantity})
                        </td>
                        <td className="px-3 py-2 text-tactical-muted text-[10px]">
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <Badge
                            variant={
                              tx.syncStatus === 'SYNCED'
                                ? 'green'
                                : tx.syncStatus === 'CONFLICT'
                                ? 'red'
                                : 'amber'
                            }
                          >
                            {tx.syncStatus}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
