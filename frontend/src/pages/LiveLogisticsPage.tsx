import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { MapPin, Truck, AlertTriangle, Layers, Building2, Wind, Eye, RefreshCw } from 'lucide-react'
import { shikharApi } from '../services/api'
import { Badge } from '../components/Badge'

// Fix default Leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom Tactical SVG Markers
const createTacticalIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-tactical-marker',
    html: `
      <div style="background-color: #121712; border: 2px solid ${color}; border-radius: 4px; padding: 2px 6px; box-shadow: 0 0 10px ${color}88; color: #fff; font-family: monospace; font-size: 10px; font-weight: bold; white-space: nowrap; display: flex; align-items: center; gap: 4px;">
        <span style="width: 6px; height: 6px; border-radius: 50%; background-color: ${color}; display: inline-block;"></span>
        ${label}
      </div>
    `,
    iconSize: [80, 24],
    iconAnchor: [40, 12],
  })
}

const MAPBOX_TOKEN = "pk.eyJ1IjoiYmVuZWRpY3QxMjM0NTU2IiwiYSI6ImNtd25rOW9lYTAwZmMzNXE2Yzhndnpyc3QifQ.7thVNkZUSMxeVbGbOQPzdw"

export const LiveLogisticsPage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const layersGroupRef = useRef<L.LayerGroup | null>(null)
  const warehouseMarkersRef = useRef<Map<number, L.Marker>>(new Map())

  const [warehouses, setWarehouses] = useState<any[]>([])
  const [convoys, setConvoys] = useState<any[]>([])
  const [corridors, setCorridors] = useState<any[]>([])
  const [mapStyle, setMapStyle] = useState<'satellite' | 'dark' | 'osm'>('satellite')
  const [selectedDepotId, setSelectedDepotId] = useState<number | 'all'>('all')
  
  const [showWarehouses, setShowWarehouses] = useState(true)
  const [showConvoys, setShowConvoys] = useState(true)
  const [showWeatherZones, setShowWeatherZones] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [whRes, convRes, corrRes] = await Promise.all([
        shikharApi.getWarehouses(),
        shikharApi.getConvoys(),
        shikharApi.getCorridors(),
      ])
      setWarehouses(whRes)
      setConvoys(convRes)
      setCorridors(corrRes)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    const map = L.map(mapContainerRef.current).setView([33.5, 76.5], 7)
    
    // Default to Mapbox Satellite Streets
    const initialTile = L.tileLayer(
      `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
      {
        attribution: '&copy; Mapbox &copy; OpenStreetMap',
        tileSize: 512,
        zoomOffset: -1,
        maxZoom: 19
      }
    ).addTo(map)
    tileLayerRef.current = initialTile

    const layerGroup = L.layerGroup().addTo(map)
    mapInstanceRef.current = map
    layersGroupRef.current = layerGroup

    loadData()

    return () => {
      map.remove()
      mapInstanceRef.current = null
      tileLayerRef.current = null
    }
  }, [])

  // Switch Map Tile Layer (Mapbox Satellite / Mapbox Dark / OSM)
  useEffect(() => {
    if (!mapInstanceRef.current) return
    const map = mapInstanceRef.current
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current)
    }

    let newTile: L.TileLayer
    if (mapStyle === 'satellite') {
      newTile = L.tileLayer(
        `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
        {
          attribution: '&copy; Mapbox &copy; OpenStreetMap &copy; Maxar',
          tileSize: 512,
          zoomOffset: -1,
          maxZoom: 19
        }
      )
    } else if (mapStyle === 'dark') {
      newTile = L.tileLayer(
        `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
        {
          attribution: '&copy; Mapbox &copy; OpenStreetMap',
          tileSize: 512,
          zoomOffset: -1,
          maxZoom: 19
        }
      )
    } else {
      newTile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      })
    }

    newTile.addTo(map)
    tileLayerRef.current = newTile
  }, [mapStyle])

  const flyToDepot = (id: number | 'all') => {
    setSelectedDepotId(id)
    if (!mapInstanceRef.current) return
    if (id === 'all') {
      mapInstanceRef.current.flyTo([33.5, 76.5], 7, { duration: 1.2 })
    } else {
      const wh = warehouses.find((w) => w.id === id)
      if (wh) {
        mapInstanceRef.current.flyTo([wh.latitude, wh.longitude], 12, { duration: 1.5 })
        const m = warehouseMarkersRef.current.get(wh.id)
        if (m) {
          setTimeout(() => m.openPopup(), 1200)
        }
      }
    }
  }

  // Render Tactical Layers on Data / Toggles Change
  useEffect(() => {
    if (!layersGroupRef.current) return
    const group = layersGroupRef.current
    group.clearLayers()
    warehouseMarkersRef.current.clear()

    // 1. Warehouse Markers
    if (showWarehouses) {
      warehouses.forEach((wh) => {
        const marker = L.marker([wh.latitude, wh.longitude], {
          icon: createTacticalIcon(selectedDepotId === wh.id ? '#38BDF8' : '#607F35', wh.code)
        })
        warehouseMarkersRef.current.set(wh.id, marker)
        marker.bindPopup(`
          <div style="font-family: monospace; font-size: 11px; color: #111; line-height: 1.4;">
            <strong style="color: #3D5321; font-size: 12px;">${wh.name}</strong><br/>
            Region: ${wh.command_region}<br/>
            Elevation: ${wh.elevation_meters}m<br/>
            Current Load: ${wh.current_load_tons} / ${wh.total_capacity_tons} Tons<br/>
            Stock Truth Score: ${(wh.stock_truth_score * 100).toFixed(1)}%<br/>
            Isolation Risk: ${(wh.isolation_risk_score * 100).toFixed(1)}%<br/>
            <span style="color: green; font-weight: bold;">STATUS: ${wh.status}</span>
          </div>
        `)
        group.addLayer(marker)
      })
    }

    // 2. Convoys
    if (showConvoys) {
      convoys.filter(c => c.current_latitude && c.current_longitude).forEach((c) => {
        const marker = L.marker([c.current_latitude, c.current_longitude], {
          icon: createTacticalIcon(c.transport_mode === 'ROTARY_AIRLIFT' ? '#06B6D4' : '#E5A93C', c.convoy_code)
        })
        marker.bindPopup(`
          <div style="font-family: monospace; font-size: 11px; color: #111; line-height: 1.4;">
            <strong style="color: #B45309; font-size: 12px;">${c.convoy_code}</strong><br/>
            Mode: ${c.transport_mode}<br/>
            Cargo: ${c.cargo_weight_kg.toLocaleString()} kg<br/>
            Route: ${c.source_warehouse_name} ➔ ${c.dest_warehouse_name}<br/>
            Risk Level: ${c.environmental_risk_level}<br/>
            <em>${c.notes || ''}</em>
          </div>
        `)
        group.addLayer(marker)
      })
    }

    // 3. Corridors Polylines
    const corridorPaths = [
      { name: 'Manali-Leh Strategic Alpine Highway', coords: [[32.2396, 77.1887], [32.55, 77.3], [33.15, 77.4], [34.1526, 77.5771]], color: '#EF4444' },
      { name: 'Zojila Pass Expressway', coords: [[34.0837, 74.7973], [34.28, 75.32], [34.1526, 77.5771]], color: '#E5A93C' },
      { name: 'Delhi-Chandigarh Grand Trunk', coords: [[28.6139, 77.2090], [30.7333, 76.7794]], color: '#10B981' }
    ]
    corridorPaths.forEach(cp => {
      const poly = L.polyline(cp.coords as any, {
        color: cp.color,
        weight: 3,
        dashArray: '6, 6'
      })
      group.addLayer(poly)
    })

    // 4. Weather Avalanche & Blizzard Circles
    if (showWeatherZones) {
      const c1 = L.circle([34.1526, 77.5771], {
        radius: 65000,
        color: '#EF4444',
        fillColor: '#EF4444',
        fillOpacity: 0.15
      })
      const c2 = L.circle([34.28, 75.32], {
        radius: 45000,
        color: '#E5A93C',
        fillColor: '#E5A93C',
        fillOpacity: 0.12
      })
      group.addLayer(c1)
      group.addLayer(c2)
    }

  }, [showWarehouses, showConvoys, showWeatherZones, warehouses, convoys, corridors])

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      {/* Page Header */}
      <div className="bg-tactical-surface border border-tactical-border rounded p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tactical-green pulse-live" />
            <h1 className="text-base font-mono font-bold uppercase tracking-wider text-tactical-text">
              PAGE 3: LIVE LOGISTICS & GEOSPATIAL SITREP (GIS)
            </h1>
          </div>
          <p className="text-xs font-mono text-tactical-muted mt-0.5">
            Real-Time Tactical Map • Satellite Climatology & Multi-Modal Echelon Tracking
          </p>
        </div>

        {/* Map Layer Controls */}
        <div className="flex items-center space-x-2 flex-wrap text-xs font-mono">
          <label className="flex items-center space-x-1.5 bg-tactical-card px-2.5 py-1.5 rounded border border-tactical-border cursor-pointer hover:border-tactical-olive">
            <input
              type="checkbox"
              checked={showWarehouses}
              onChange={(e) => setShowWarehouses(e.target.checked)}
              className="rounded bg-tactical-surface border-tactical-border text-tactical-olive"
            />
            <span className="text-tactical-text">Strategic Depots</span>
          </label>

          <label className="flex items-center space-x-1.5 bg-tactical-card px-2.5 py-1.5 rounded border border-tactical-border cursor-pointer hover:border-tactical-olive">
            <input
              type="checkbox"
              checked={showConvoys}
              onChange={(e) => setShowConvoys(e.target.checked)}
              className="rounded bg-tactical-surface border-tactical-border text-tactical-olive"
            />
            <span className="text-tactical-text">Tactical Convoys</span>
          </label>

          <label className="flex items-center space-x-1.5 bg-tactical-card px-2.5 py-1.5 rounded border border-tactical-border cursor-pointer hover:border-tactical-olive">
            <input
              type="checkbox"
              checked={showWeatherZones}
              onChange={(e) => setShowWeatherZones(e.target.checked)}
              className="rounded bg-tactical-surface border-tactical-border text-tactical-olive"
            />
            <span className="text-tactical-text">Blizzard Hazard Circles</span>
          </label>

          {/* Mapbox Style Switcher */}
          <div className="flex items-center bg-tactical-card border border-tactical-border rounded p-0.5">
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                mapStyle === 'satellite'
                  ? 'bg-tactical-olive text-white font-bold'
                  : 'text-tactical-muted hover:text-white'
              }`}
              title="Mapbox High-Resolution Satellite Imagery"
            >
              🛰️ Satellite HD
            </button>
            <button
              onClick={() => setMapStyle('dark')}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                mapStyle === 'dark'
                  ? 'bg-tactical-olive text-white font-bold'
                  : 'text-tactical-muted hover:text-white'
              }`}
              title="Mapbox Dark Tactical Topography"
            >
              🌑 Dark Topo
            </button>
            <button
              onClick={() => setMapStyle('osm')}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                mapStyle === 'osm'
                  ? 'bg-tactical-olive text-white font-bold'
                  : 'text-tactical-muted hover:text-white'
              }`}
              title="OpenStreetMap Standard"
            >
              🗺️ OSM
            </button>
          </div>

          <button
            onClick={loadData}
            className="p-1.5 bg-tactical-card border border-tactical-border hover:border-tactical-olive rounded text-tactical-muted hover:text-white"
            title="Refresh GIS Feeds"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-tactical-olive' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tactical Depot Quick Selector Bar */}
      <div className="bg-tactical-surface border border-tactical-border rounded p-2.5 flex items-center justify-between gap-3 text-xs font-mono flex-wrap shadow-sm">
        <div className="flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-tactical-khaki" />
          <span className="font-bold uppercase text-tactical-text text-[11px]">Select Focus Depot:</span>
          <select
            value={selectedDepotId}
            onChange={(e) => flyToDepot(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-tactical-card border border-tactical-border text-tactical-text px-2.5 py-1 rounded text-xs focus:outline-none focus:border-tactical-olive"
          >
            <option value="all">🗺️ ALL SECTORS (Theater Overview)</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                📍 [{w.code}] {w.name} ({w.elevation_meters}m)
              </option>
            ))}
          </select>
        </div>

        {/* Quick Click Depot Focus Buttons */}
        <div className="flex items-center space-x-1.5 flex-wrap">
          <button
            onClick={() => flyToDepot('all')}
            className={`px-2.5 py-1 rounded text-[10px] font-mono border transition-colors ${
              selectedDepotId === 'all'
                ? 'bg-tactical-olive text-white border-tactical-olive font-bold'
                : 'border-tactical-border bg-tactical-card text-tactical-muted hover:text-white'
            }`}
          >
            🗺️ Reset View
          </button>
          {warehouses.map((w) => (
            <button
              key={w.id}
              onClick={() => flyToDepot(w.id)}
              className={`px-2.5 py-1 rounded text-[10px] font-mono border transition-colors ${
                selectedDepotId === w.id
                  ? 'bg-tactical-cyan text-black border-tactical-cyan font-bold shadow'
                  : 'border-tactical-border bg-tactical-card text-tactical-muted hover:text-white hover:border-tactical-olive'
              }`}
            >
              📍 {w.code.replace('WH-', '')} ({w.name.split(' ')[0]})
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Container */}
      <div className="tactical-panel p-2 overflow-hidden shadow-2xl relative">
        <div
          ref={mapContainerRef}
          className="h-[620px] w-full rounded border border-tactical-border overflow-hidden"
        />

        {/* Tactical Map Overlay Legend */}
        <div className="absolute bottom-6 right-6 z-[1000] bg-tactical-surface/95 border border-tactical-border p-3 rounded shadow-xl text-xs font-mono space-y-1.5 backdrop-blur">
          <div className="font-bold text-tactical-text uppercase tracking-wider text-[10px] border-b border-tactical-border/50 pb-1">
            Tactical Map Telemetry Key
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tactical-olive shrink-0" />
            <span className="text-tactical-muted">Strategic Logistics Depots</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tactical-amber shrink-0" />
            <span className="text-tactical-muted">Heavy Surface Convoys (En Route)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tactical-cyan shrink-0" />
            <span className="text-tactical-muted">Rotary Heavy Airlift (Mi-17V5)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tactical-red shrink-0" />
            <span className="text-tactical-muted">Sub-Zero Blizzard / Avalanche Hazard</span>
          </div>
        </div>
      </div>
    </div>
  )
}
