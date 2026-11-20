import React, { useEffect, useState } from 'react'
import {
  Package,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Download,
  Filter,
  Trash2,
  Edit,
  History,
  AlertTriangle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react'
import { shikharApi } from '../services/api'
import { Badge } from '../components/Badge'
import { Modal } from '../components/Modal'

export const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'inventory' | 'history'>('inventory')
  
  // Filters
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Modals state
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [showAddFoodModal, setShowAddFoodModal] = useState(false)
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [showDispatchModal, setShowDispatchModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItemForAction, setSelectedItemForAction] = useState<any>(null)

  // Form states
  const [foodForm, setFoodForm] = useState({
    name: 'High-Altitude 24H MRE Ration Pack',
    sku: '',
    unit_of_measure: 'Ration Packs',
    weight_kg_per_unit: 1.2,
    reorder_threshold: 400,
    emergency_buffer_min: 150,
    unit_cost_inr: 850,
    shelf_life_days: 730,
    warehouse_id: 1,
    initial_quantity: 250,
    caloric_value: '3,800 kcal'
  })

  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    category_id: 1,
    unit_of_measure: 'Units',
    weight_kg_per_unit: 1.0,
    reorder_threshold: 500,
    emergency_buffer_min: 200,
    unit_cost_inr: 1000
  })

  const [receiveForm, setReceiveForm] = useState({
    warehouse_id: 1,
    product_id: 1,
    quantity: 100,
    batch_number: '',
    manufacture_date: new Date().toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    notes: 'Tactical intake consignment'
  })

  const [dispatchForm, setDispatchForm] = useState({
    warehouse_id: 1,
    product_id: 1,
    quantity: 50,
    destination: 'Forward Operating Base Alpha',
    notes: 'Operational deployment requisition'
  })

  const [transferForm, setTransferForm] = useState({
    source_warehouse_id: 2,
    dest_warehouse_id: 1,
    product_id: 1,
    quantity: 100,
    priority: 'TACTICAL_HIGH',
    transport_mode: 'HEAVY_CONVOY',
    notes: 'Pre-winter surge inter-depot balancing'
  })

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [invRes, whRes, prodRes, histRes] = await Promise.all([
        shikharApi.getInventory({
          warehouse_id: selectedWarehouse ? Number(selectedWarehouse) : undefined,
          category_id: selectedCategory ? Number(selectedCategory) : undefined,
          low_stock_only: lowStockOnly,
          search: search.trim() || undefined
        }),
        shikharApi.getWarehouses(),
        shikharApi.getProducts(),
        shikharApi.getInventoryHistory()
      ])
      setItems(invRes)
      setWarehouses(whRes)
      setProducts(prodRes)
      setHistory(histRes)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedWarehouse, selectedCategory, lowStockOnly])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadData()
  }

  // Action Submissions
  const handleAddFoodProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const generatedSku = foodForm.sku.trim() || `FOOD-RAT-${Date.now().toString().slice(-5)}`
      const createdProd = await shikharApi.createProduct({
        sku: generatedSku,
        name: foodForm.name,
        category_id: 2, // High-Altitude Rations & Food Supplies
        unit_of_measure: foodForm.unit_of_measure,
        weight_kg_per_unit: foodForm.weight_kg_per_unit,
        nominal_shelf_life_days: foodForm.shelf_life_days,
        reorder_threshold: foodForm.reorder_threshold,
        emergency_buffer_min: foodForm.emergency_buffer_min,
        unit_cost_inr: foodForm.unit_cost_inr,
        min_safe_temp_c: -30.0,
        max_safe_temp_c: 25.0
      })

      if (foodForm.initial_quantity > 0) {
        const now = new Date()
        const exp = new Date(Date.now() + foodForm.shelf_life_days * 86400000)
        await shikharApi.receiveStock({
          warehouse_id: foodForm.warehouse_id,
          product_id: createdProd.id,
          quantity: foodForm.initial_quantity,
          batch_number: `BATCH-RAT-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          manufacture_date: now.toISOString(),
          expiry_date: exp.toISOString(),
          notes: `Initial food consignment: ${foodForm.name} (${foodForm.caloric_value})`
        })
      }

      setShowAddFoodModal(false)
      loadData()
      alert(`Food Item "${foodForm.name}" created successfully with ${foodForm.initial_quantity} units deposited into depot!`)
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await shikharApi.createProduct(newProduct)
      setShowAddProductModal(false)
      loadData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleReceiveStock = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await shikharApi.receiveStock({
        ...receiveForm,
        manufacture_date: new Date(receiveForm.manufacture_date).toISOString(),
        expiry_date: new Date(receiveForm.expiry_date).toISOString(),
        batch_number: receiveForm.batch_number || `BATCH-${Date.now().toString().slice(-6)}`
      })
      setShowReceiveModal(false)
      loadData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleDispatchStock = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await shikharApi.dispatchStock(dispatchForm)
      setShowDispatchModal(false)
      loadData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleTransferStock = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await shikharApi.transferStock(transferForm)
      setShowTransferModal(false)
      loadData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleDeleteProduct = async () => {
    if (!selectedItemForAction) return
    try {
      await shikharApi.deleteProduct(selectedItemForAction.product_id)
      setShowDeleteModal(false)
      loadData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleExportCSV = () => {
    window.open('/api/v1/inventory/export-csv', '_blank')
  }

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      {/* Page Header */}
      <div className="bg-tactical-surface border border-tactical-border rounded p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tactical-green pulse-live" />
            <h1 className="text-base font-mono font-bold uppercase tracking-wider text-tactical-text">
              PAGE 4: SMART INVENTORY MANAGEMENT SYSTEM
            </h1>
          </div>
          <p className="text-xs font-mono text-tactical-muted mt-0.5">
            Physical Depot Ledger • Batch Arrhenius Tracking • Verified Stock Movement Actions
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 flex-wrap">
          <button
            onClick={() => setShowReceiveModal(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-tactical-card border border-tactical-border hover:border-tactical-green rounded text-xs font-mono text-tactical-green hover:bg-tactical-green/10 transition-colors"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Receive</span>
          </button>
          <button
            onClick={() => setShowDispatchModal(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-tactical-card border border-tactical-border hover:border-tactical-amber rounded text-xs font-mono text-tactical-amber hover:bg-tactical-amber/10 transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Dispatch</span>
          </button>
          <button
            onClick={() => setShowTransferModal(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-tactical-card border border-tactical-border hover:border-tactical-cyan rounded text-xs font-mono text-tactical-cyan hover:bg-tactical-cyan/10 transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Transfer</span>
          </button>
          <button
            onClick={() => setShowAddProductModal(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-tactical-olive hover:bg-tactical-oliveLight rounded text-xs font-mono font-bold text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add SKU</span>
          </button>
          <button
            onClick={() => setShowAddFoodModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-tactical-amber/20 border border-tactical-amber hover:bg-tactical-amber/30 rounded text-xs font-mono font-bold text-tactical-amber transition-colors shadow-sm"
            title="Register High-Altitude Food / Ration Consignment"
          >
            <span>🍲</span>
            <span>+ Add Food / Rations</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1 px-3 py-1.5 bg-tactical-card border border-tactical-border hover:border-tactical-khaki rounded text-xs font-mono text-tactical-khaki transition-colors"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs & Filters Bar */}
      <div className="tactical-panel p-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 border border-tactical-border p-0.5 rounded bg-tactical-card">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'inventory'
                ? 'bg-tactical-olive text-white font-bold'
                : 'text-tactical-muted hover:text-white'
            }`}
          >
            Active Inventory ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'history'
                ? 'bg-tactical-olive text-white font-bold'
                : 'text-tactical-muted hover:text-white'
            }`}
          >
            Audit History ({history.length})
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-2 w-full md:w-auto flex-wrap">
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="bg-tactical-card border border-tactical-border text-tactical-text px-2 py-1.5 rounded focus:outline-none focus:border-tactical-olive"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.code} - {w.name}
              </option>
            ))}
          </select>

          <label className="flex items-center space-x-1.5 bg-tactical-card px-2.5 py-1.5 rounded border border-tactical-border cursor-pointer text-tactical-muted hover:text-white">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="rounded bg-tactical-surface border-tactical-border text-tactical-olive"
            />
            <span className="text-tactical-amber">Low Stock Only</span>
          </label>

          <form onSubmit={handleSearchSubmit} className="flex">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter SKU or item..."
              className="bg-tactical-card border border-tactical-border text-tactical-text px-2.5 py-1.5 rounded-l focus:outline-none focus:border-tactical-olive w-36 sm:w-48"
            />
            <button
              type="submit"
              className="bg-tactical-border hover:bg-tactical-olive px-2.5 py-1.5 rounded-r text-white transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Main Table Content */}
      {activeTab === 'inventory' ? (
        <div className="tactical-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-tactical-card/80 border-b border-tactical-border text-tactical-muted uppercase text-[10px]">
                <tr>
                  <th className="px-3.5 py-2.5">SKU & Nomenclature</th>
                  <th className="px-3 py-2.5">Category</th>
                  <th className="px-3 py-2.5">Depot Location</th>
                  <th className="px-3 py-2.5 text-right">On Hand</th>
                  <th className="px-3 py-2.5 text-right">In Transit</th>
                  <th className="px-3 py-2.5 text-center">Safe Stock Days</th>
                  <th className="px-3 py-2.5 text-center">Sensor Accuracy</th>
                  <th className="px-3 py-2.5">Batches / Quality</th>
                  <th className="px-3 py-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tactical-border/40">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-tactical-muted">
                      No tactical inventory lines found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-tactical-card/40 transition-colors">
                      <td className="px-3.5 py-2.5">
                        <div className="font-bold text-tactical-text">{item.product_name}</div>
                        <div className="text-[10px] text-tactical-khaki">{item.sku}</div>
                      </td>
                      <td className="px-3 py-2.5 text-tactical-muted text-[11px] truncate max-w-[140px]">
                        {item.category_name}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-tactical-text font-semibold">{item.warehouse_name}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="font-bold text-tactical-text text-sm">
                          {item.quantity_on_hand.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right text-tactical-cyan">
                        {item.quantity_in_transit > 0 ? `+${item.quantity_in_transit.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`font-bold ${
                            item.isolation_adjusted_dos < 15
                              ? 'text-tactical-red'
                              : item.isolation_adjusted_dos < 30
                              ? 'text-tactical-amber'
                              : 'text-tactical-green'
                          }`}
                        >
                          {item.isolation_adjusted_dos.toFixed(1)} Days
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Badge variant={item.stock_truth_score >= 0.98 ? 'green' : 'amber'}>
                          {(item.stock_truth_score * 100).toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-col space-y-0.5">
                          {item.batches.slice(0, 1).map((b: any) => (
                            <span key={b.id} className="text-[10px] text-tactical-muted">
                              {b.batch_number}:{' '}
                              <span
                                className={
                                  b.quality_status === 'OPTIMAL'
                                    ? 'text-tactical-green'
                                    : 'text-tactical-red font-bold'
                                }
                              >
                                {b.quality_status}
                              </span>
                            </span>
                          ))}
                          {item.batches.length > 1 && (
                            <span className="text-[9px] text-tactical-khaki">
                              +{item.batches.length - 1} more batches
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <button
                          onClick={() => {
                            setSelectedItemForAction(item)
                            setShowDeleteModal(true)
                          }}
                          className="p-1 rounded text-tactical-muted hover:text-tactical-red hover:bg-tactical-card transition-colors"
                          title="Delete SKU Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* History Audit Ledger */
        <div className="tactical-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-tactical-card/80 border-b border-tactical-border text-tactical-muted uppercase text-[10px]">
                <tr>
                  <th className="px-3.5 py-2.5">Timestamp</th>
                  <th className="px-3 py-2.5">Transaction Type</th>
                  <th className="px-3 py-2.5">Supply Item</th>
                  <th className="px-3 py-2.5">Depot</th>
                  <th className="px-3 py-2.5 text-right">Quantity</th>
                  <th className="px-3 py-2.5 text-right">Balance Post-Tx</th>
                  <th className="px-3 py-2.5">Reference Doc</th>
                  <th className="px-3 py-2.5">Tactical Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tactical-border/40">
                {history.map((tx) => (
                  <tr key={tx.id} className="hover:bg-tactical-card/40 transition-colors">
                    <td className="px-3.5 py-2 text-tactical-muted text-[11px]">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      <Badge
                        variant={
                          tx.transaction_type === 'RECEIVE'
                            ? 'green'
                            : tx.transaction_type === 'DISPATCH'
                            ? 'amber'
                            : 'cyan'
                        }
                      >
                        {tx.transaction_type}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-tactical-text font-semibold">{tx.product_name}</td>
                    <td className="px-3 py-2 text-tactical-muted">{tx.warehouse_name}</td>
                    <td
                      className={`px-3 py-2 text-right font-bold ${
                        tx.quantity > 0 ? 'text-tactical-green' : 'text-tactical-amber'
                      }`}
                    >
                      {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                    </td>
                    <td className="px-3 py-2 text-right text-tactical-text font-bold">
                      {tx.balance_after}
                    </td>
                    <td className="px-3 py-2 text-tactical-khaki text-[11px]">
                      {tx.reference_number || '-'}
                    </td>
                    <td className="px-3 py-2 text-tactical-muted text-[11px] truncate max-w-xs">
                      {tx.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Add New Product */}
      <Modal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        title="Add New Strategic Defense SKU"
        subtitle="Registers catalog item and auto-provisions inventory slots across strategic depots"
      >
        <form onSubmit={handleCreateProduct} className="space-y-3 font-mono">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">SKU Code</label>
              <input
                type="text"
                required
                value={newProduct.sku}
                onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                placeholder="e.g. DEF-TACT-909"
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Product Nomenclature</label>
              <input
                type="text"
                required
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="e.g. Sub-Zero Tactical Rations"
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Category</label>
              <select
                value={newProduct.category_id}
                onChange={(e) => setNewProduct({ ...newProduct, category_id: Number(e.target.value) })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              >
                <option value={1}>Cold-Chain Medical & Plasma</option>
                <option value={2}>High-Altitude Rations & MRE</option>
                <option value={3}>Aviation Turbine Fuel (POL)</option>
                <option value={4}>Tactical UAV Lithium Batteries</option>
                <option value={5}>Extreme Cold Weather Clothing</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Unit of Measure</label>
              <input
                type="text"
                value={newProduct.unit_of_measure}
                onChange={(e) => setNewProduct({ ...newProduct, unit_of_measure: e.target.value })}
                placeholder="Cartons / Units / Litres"
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Unit Weight (Kg)</label>
              <input
                type="number"
                step="0.1"
                value={newProduct.weight_kg_per_unit}
                onChange={(e) => setNewProduct({ ...newProduct, weight_kg_per_unit: Number(e.target.value) })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Reorder Point</label>
              <input
                type="number"
                value={newProduct.reorder_threshold}
                onChange={(e) => setNewProduct({ ...newProduct, reorder_threshold: Number(e.target.value) })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Emergency Buffer</label>
              <input
                type="number"
                value={newProduct.emergency_buffer_min}
                onChange={(e) => setNewProduct({ ...newProduct, emergency_buffer_min: Number(e.target.value) })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-tactical-border">
            <button
              type="button"
              onClick={() => setShowAddProductModal(false)}
              className="px-3 py-1.5 rounded bg-tactical-card border border-tactical-border text-tactical-muted hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-tactical-olive hover:bg-tactical-oliveLight text-white font-bold"
            >
              Commit SKU
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Receive Stock */}
      <Modal
        isOpen={showReceiveModal}
        onClose={() => setShowReceiveModal(false)}
        title="Inbound Logistics Stock Reception"
        subtitle="Records physical consignment intake and logs batch for Arrhenius degradation tracking"
      >
        <form onSubmit={handleReceiveStock} className="space-y-3 font-mono">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Destination Depot</label>
              <select
                value={receiveForm.warehouse_id}
                onChange={(e) => setReceiveForm({ ...receiveForm, warehouse_id: Number(e.target.value) })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.code} - {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Supply SKU</label>
              <select
                value={receiveForm.product_id}
                onChange={(e) => setReceiveForm({ ...receiveForm, product_id: Number(e.target.value) })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} - {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Received Quantity</label>
              <input
                type="number"
                required
                min="1"
                value={receiveForm.quantity}
                onChange={(e) => setReceiveForm({ ...receiveForm, quantity: Number(e.target.value) })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Batch Identifier</label>
              <input
                type="text"
                value={receiveForm.batch_number}
                onChange={(e) => setReceiveForm({ ...receiveForm, batch_number: e.target.value })}
                placeholder="BATCH-2026-X88"
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Manufacture Date</label>
              <input
                type="date"
                value={receiveForm.manufacture_date}
                onChange={(e) => setReceiveForm({ ...receiveForm, manufacture_date: e.target.value })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Nominal Expiry Date</label>
              <input
                type="date"
                value={receiveForm.expiry_date}
                onChange={(e) => setReceiveForm({ ...receiveForm, expiry_date: e.target.value })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-tactical-muted uppercase mb-1">Tactical Intake Notes</label>
            <input
              type="text"
              value={receiveForm.notes}
              onChange={(e) => setReceiveForm({ ...receiveForm, notes: e.target.value })}
              className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-tactical-border">
            <button
              type="button"
              onClick={() => setShowReceiveModal(false)}
              className="px-3 py-1.5 rounded bg-tactical-card border border-tactical-border text-tactical-muted hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-tactical-green hover:bg-tactical-green/90 text-white font-bold"
            >
              Verify & Receive Consignment
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Dispatch Stock */}
      <Modal
        isOpen={showDispatchModal}
        onClose={() => setShowDispatchModal(false)}
        title="Outbound Tactical Stock Dispatch"
        subtitle="Deducts verified inventory quantities and updates audit balance"
      >
        <form onSubmit={handleDispatchStock} className="space-y-3 font-mono">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Source Depot</label>
              <select
                value={dispatchForm.warehouse_id}
                onChange={(e) => setDispatchForm({ ...dispatchForm, warehouse_id: Number(e.target.value) })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.code} - {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Supply SKU</label>
              <select
                value={dispatchForm.product_id}
                onChange={(e) => setDispatchForm({ ...dispatchForm, product_id: Number(e.target.value) })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} - {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Dispatch Quantity</label>
              <input
                type="number"
                required
                min="1"
                value={dispatchForm.quantity}
                onChange={(e) => setDispatchForm({ ...dispatchForm, quantity: Number(e.target.value) })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Destination Target</label>
              <input
                type="text"
                required
                value={dispatchForm.destination}
                onChange={(e) => setDispatchForm({ ...dispatchForm, destination: e.target.value })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-tactical-muted uppercase mb-1">Tactical Requisition Rationale</label>
            <input
              type="text"
              value={dispatchForm.notes}
              onChange={(e) => setDispatchForm({ ...dispatchForm, notes: e.target.value })}
              className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-tactical-border">
            <button
              type="button"
              onClick={() => setShowDispatchModal(false)}
              className="px-3 py-1.5 rounded bg-tactical-card border border-tactical-border text-tactical-muted hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-tactical-amber hover:bg-tactical-amber/90 text-black font-bold"
            >
              Execute Outbound Dispatch
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Inter-Depot Transfer */}
      <Modal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        title="Inter-Warehouse Tactical Stock Transfer"
        subtitle="Validates source balance and creates transit echelon tracking order"
      >
        <form onSubmit={handleTransferStock} className="space-y-3 font-mono">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Source Depot</label>
              <select
                value={transferForm.source_warehouse_id}
                onChange={(e) => setTransferForm({ ...transferForm, source_warehouse_id: Number(e.target.value) })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.code} - {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Destination Target Depot</label>
              <select
                value={transferForm.dest_warehouse_id}
                onChange={(e) => setTransferForm({ ...transferForm, dest_warehouse_id: Number(e.target.value) })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.code} - {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Item to Transfer</label>
              <select
                value={transferForm.product_id}
                onChange={(e) => setTransferForm({ ...transferForm, product_id: Number(e.target.value) })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} - {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Quantity</label>
              <input
                type="number"
                required
                min="1"
                value={transferForm.quantity}
                onChange={(e) => setTransferForm({ ...transferForm, quantity: Number(e.target.value) })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Transport Mode</label>
              <select
                value={transferForm.transport_mode}
                onChange={(e) => setTransferForm({ ...transferForm, transport_mode: e.target.value })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              >
                <option value="HEAVY_CONVOY">Heavy Logistics Convoy (Surface)</option>
                <option value="ROTARY_AIRLIFT">Rotary Heavy Airlift (Mi-17 / Chinook)</option>
                <option value="LIGHT_TACTICAL">4x4 All-Terrain Quick Echelon</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Tactical Priority</label>
              <select
                value={transferForm.priority}
                onChange={(e) => setTransferForm({ ...transferForm, priority: e.target.value })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              >
                <option value="TACTICAL_HIGH">Tactical High</option>
                <option value="EMERGENCY_CRITICAL">Emergency Critical</option>
                <option value="NORMAL">Normal Routine</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-tactical-border">
            <button
              type="button"
              onClick={() => setShowTransferModal(false)}
              className="px-3 py-1.5 rounded bg-tactical-card border border-tactical-border text-tactical-muted hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-tactical-cyan hover:bg-tactical-cyan/90 text-black font-bold"
            >
              Authorize Stock Transfer
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 5: Delete Product Confirmation */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Strategic SKU De-provisioning"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 font-mono">
          <p className="text-tactical-text">
            Are you certain you wish to de-provision SKU:{' '}
            <span className="font-bold text-tactical-red">{selectedItemForAction?.sku}</span> (
            {selectedItemForAction?.product_name})?
          </p>
          <p className="text-[11px] text-tactical-muted">
            The platform requires verified 0 units on-hand across all depots prior to catalog decommissioning.
          </p>
          <div className="flex justify-end space-x-2 pt-2 border-t border-tactical-border">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="px-3 py-1.5 rounded bg-tactical-card border border-tactical-border text-tactical-muted hover:text-white"
            >
              Abort
            </button>
            <button
              type="button"
              onClick={handleDeleteProduct}
              className="px-4 py-1.5 rounded bg-tactical-red hover:bg-tactical-red/90 text-white font-bold"
            >
              Confirm Decommission
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 6: Add Custom Food / Rations SKU */}
      <Modal
        isOpen={showAddFoodModal}
        onClose={() => setShowAddFoodModal(false)}
        title="Register High-Altitude Food / Ration SKU (Category: Food Supplies)"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleAddFoodProduct} className="space-y-3.5 font-mono text-xs">
          <div className="bg-tactical-card p-2.5 rounded border border-tactical-amber/40 text-[11px] text-tactical-amber flex items-center gap-2">
            <span>🍲</span>
            <span>Adds consumable combat rations directly under High-Altitude Rations & Food Supplies with automatic depot allocation.</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Ration / Food Name</label>
              <input
                type="text"
                required
                value={foodForm.name}
                onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                placeholder="e.g. Siachen 24H MRE Ration Pack"
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text focus:outline-none focus:border-tactical-amber"
              />
            </div>
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Custom SKU Code (Auto if blank)</label>
              <input
                type="text"
                value={foodForm.sku}
                onChange={(e) => setFoodForm({ ...foodForm, sku: e.target.value })}
                placeholder="e.g. RAT-MRE-SPECIAL-01"
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text focus:outline-none focus:border-tactical-amber"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Packaging / Unit</label>
              <select
                value={foodForm.unit_of_measure}
                onChange={(e) => setFoodForm({ ...foodForm, unit_of_measure: e.target.value })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              >
                <option value="Ration Packs">Ration Packs</option>
                <option value="Tins (500g)">Tins (500g)</option>
                <option value="Cartons (24x)">Cartons (24x)</option>
                <option value="Kilograms (KG)">Kilograms (KG)</option>
                <option value="Retort Pouches">Retort Pouches</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Weight / Unit (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={foodForm.weight_kg_per_unit}
                onChange={(e) => setFoodForm({ ...foodForm, weight_kg_per_unit: Number(e.target.value) })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Caloric Rating</label>
              <input
                type="text"
                value={foodForm.caloric_value}
                onChange={(e) => setFoodForm({ ...foodForm, caloric_value: e.target.value })}
                placeholder="e.g. 4,100 kcal"
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Initial Depot Target</label>
              <select
                value={foodForm.warehouse_id}
                onChange={(e) => setFoodForm({ ...foodForm, warehouse_id: Number(e.target.value) })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    [{w.code}] {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Initial Intake Qty</label>
              <input
                type="number"
                min="1"
                required
                value={foodForm.initial_quantity}
                onChange={(e) => setFoodForm({ ...foodForm, initial_quantity: Number(e.target.value) })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Shelf Life (Days)</label>
              <input
                type="number"
                min="30"
                required
                value={foodForm.shelf_life_days}
                onChange={(e) => setFoodForm({ ...foodForm, shelf_life_days: Number(e.target.value) })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Reorder Point</label>
              <input
                type="number"
                min="10"
                value={foodForm.reorder_threshold}
                onChange={(e) => setFoodForm({ ...foodForm, reorder_threshold: Number(e.target.value) })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Emergency Buffer</label>
              <input
                type="number"
                min="10"
                value={foodForm.emergency_buffer_min}
                onChange={(e) => setFoodForm({ ...foodForm, emergency_buffer_min: Number(e.target.value) })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
            <div>
              <label className="block text-[10px] text-tactical-muted uppercase mb-1">Cost / Unit (₹)</label>
              <input
                type="number"
                min="10"
                value={foodForm.unit_cost_inr}
                onChange={(e) => setFoodForm({ ...foodForm, unit_cost_inr: Number(e.target.value) })}
                className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-tactical-border">
            <button
              type="button"
              onClick={() => setShowAddFoodModal(false)}
              className="px-3 py-1.5 rounded bg-tactical-card border border-tactical-border text-tactical-muted hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-tactical-amber hover:bg-tactical-amber/90 text-black font-bold flex items-center gap-1.5 shadow"
            >
              <span>🍲</span>
              <span>Register Food SKU & Consign Stock</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
