const API_BASE = typeof window !== "undefined" && window.location.port === "5173" 
  ? "http://localhost:8000/api/v1" 
  : "/api/v1"

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("shikhar_token")
  
  const headers = new Headers(options.headers || {})
  headers.set("Content-Type", "application/json")
  if (token && token !== "undefined" && token !== "null" && token !== "mock-tactical-bearer-token") {
    headers.set("Authorization", `Bearer ${token}`)
  }

  let response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  })

  // Automatic JWT Refresh on Expiration (401)
  if (response.status === 401 && !endpoint.includes("/auth/")) {
    const refreshToken = localStorage.getItem("shikhar_refresh_token")
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken })
        })
        if (refreshRes.ok) {
          const tokenData = await refreshRes.json()
          localStorage.setItem("shikhar_token", tokenData.access_token)
          headers.set("Authorization", `Bearer ${tokenData.access_token}`)
          response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
          })
        }
      } catch (err) {
        // Refresh failed, proceed to error
      }
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(errorData.detail || "Tactical network transmission failure")
  }

  return response.json()
}

// Tactical API Methods
export const shikharApi = {
  // Auth
  login: async (data: any) => {
    const res = await apiFetch<any>("/auth/login", { method: "POST", body: JSON.stringify(data) })
    if (res.access_token) {
      localStorage.setItem("shikhar_token", res.access_token)
    }
    if (res.refresh_token) {
      localStorage.setItem("shikhar_refresh_token", res.refresh_token)
    }
    return res
  },
  getMe: () => apiFetch<any>("/auth/me"),
  verifyToken: () => apiFetch<any>("/auth/verify-token"),
  refreshToken: (refreshToken: string) => apiFetch<any>("/auth/refresh", { method: "POST", body: JSON.stringify({ refresh_token: refreshToken }) }),
  
  // Dashboard
  getDashboardSummary: () => apiFetch<any>("/dashboard/summary"),
  getDashboardCharts: () => apiFetch<any>("/dashboard/charts"),
  getDashboardAlerts: () => apiFetch<any[]>("/dashboard/alerts"),
  getRecentActivity: () => apiFetch<any[]>("/dashboard/activity"),
  
  // Inventory
  getInventory: (params?: { warehouse_id?: number; category_id?: number; low_stock_only?: boolean; search?: string }) => {
    const query = new URLSearchParams()
    if (params?.warehouse_id) query.append("warehouse_id", params.warehouse_id.toString())
    if (params?.category_id) query.append("category_id", params.category_id.toString())
    if (params?.low_stock_only) query.append("low_stock_only", "true")
    if (params?.search) query.append("search", params.search)
    return apiFetch<any[]>(`/inventory?${query.toString()}`)
  },
  getProducts: () => apiFetch<any[]>("/inventory/products"),
  createProduct: (data: any) => apiFetch<any>("/inventory", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id: number, data: any) => apiFetch<any>(`/inventory/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProduct: (id: number) => apiFetch<any>(`/inventory/${id}`, { method: "DELETE" }),
  receiveStock: (data: any) => apiFetch<any>("/inventory/receive", { method: "POST", body: JSON.stringify(data) }),
  dispatchStock: (data: any) => apiFetch<any>("/inventory/dispatch", { method: "POST", body: JSON.stringify(data) }),
  transferStock: (data: any) => apiFetch<any>("/inventory/transfer", { method: "POST", body: JSON.stringify(data) }),
  getInventoryHistory: () => apiFetch<any[]>("/inventory/history"),
  
  // Warehouses
  getWarehouses: () => apiFetch<any[]>("/warehouses"),
  getWarehouse: (id: number) => apiFetch<any>(`/warehouses/${id}`),
  createWarehouse: (data: any) => apiFetch<any>("/warehouses", { method: "POST", body: JSON.stringify(data) }),
  updateWarehouse: (id: number, data: any) => apiFetch<any>(`/warehouses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  getWarehouseInventory: (id: number) => apiFetch<any[]>(`/warehouses/${id}/inventory`),
  
  // Forecast
  runForecast: (data: { product_id: number; warehouse_id: number; horizon_days?: number; model_override?: string }) => 
    apiFetch<any>("/forecast/run", { method: "POST", body: JSON.stringify(data) }),
  getForecastPerformance: () => apiFetch<any>("/forecast/performance"),
  
  // Freshness
  predictFreshness: (data: { batch_id: number; temperature_override_c?: number; humidity_override_pct?: number }) =>
    apiFetch<any>("/freshness/predict", { method: "POST", body: JSON.stringify(data) }),
  getFreshnessBatches: () => apiFetch<any[]>("/freshness/batches"),
  getFreshnessRisks: () => apiFetch<any[]>("/freshness/risks"),
  
  // Transportation
  getConvoys: () => apiFetch<any[]>("/transportation"),
  getCorridors: () => apiFetch<any[]>("/transportation/reliability"),
  assessModeMix: (params: { cargo_weight_kg: number; urgency_level: string; passability_score: number }) =>
    apiFetch<any>(`/transportation/assess-mode-mix?cargo_weight_kg=${params.cargo_weight_kg}&urgency_level=${params.urgency_level}&passability_score=${params.passability_score}`, { method: "POST" }),
    
  // Weather
  getWeatherCurrent: () => apiFetch<any[]>("/weather/current"),
  getWeatherRisks: () => apiFetch<any[]>("/weather/risks"),
  getWeatherProviders: () => apiFetch<any[]>("/weather/providers"),
  
  // Suppliers
  getSuppliers: () => apiFetch<any[]>("/suppliers"),
  createSupplier: (data: any) => apiFetch<any>("/suppliers", { method: "POST", body: JSON.stringify(data) }),
  getSupplierPerformance: (id: number) => apiFetch<any>(`/suppliers/${id}/performance`),
  
  // Recommendations & Challenger AI
  getRecommendations: () => apiFetch<any[]>("/recommendations"),
  verifyRecommendation: (id: number) => apiFetch<any>(`/recommendations/verify?recommendation_id=${id}`, { method: "POST" }),
  takeRecommendationAction: (id: number, data: { action: string; tactical_rationale: string }) =>
    apiFetch<any>(`/recommendations/${id}/action`, { method: "POST", body: JSON.stringify(data) }),
    
  // Simulation
  runSimulation: (data: any) => apiFetch<any>("/simulation/run", { method: "POST", body: JSON.stringify(data) }),
  getSimulationHistory: () => apiFetch<any[]>("/simulation"),
  
  // IoT & Offline Ledger
  getIoTDevices: () => apiFetch<any[]>("/iot/devices"),
  recordReading: (data: any) => apiFetch<any>("/iot/readings", { method: "POST", body: JSON.stringify(data) }),
  syncOfflineEvent: (data: any) => apiFetch<any>("/iot/sync", { method: "POST", body: JSON.stringify(data) }),
  
  // Reports
  getReportsSummary: () => apiFetch<any>("/reports/summary"),
  
  // Admin & Security
  getAdminUsers: () => apiFetch<any[]>("/admin/users"),
  createAdminUser: (data: any) => apiFetch<any>("/admin/users", { method: "POST", body: JSON.stringify(data) }),
  updateAdminUser: (id: number, data: any) => apiFetch<any>(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  getAuditLogs: () => apiFetch<any[]>("/admin/audit-logs"),
  getIntegrations: () => apiFetch<any[]>("/admin/integrations"),
  updateIntegration: (id: number, data: any) => apiFetch<any>(`/admin/integrations/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  
  // AI Logistics Assistant
  queryAssistant: (data: { message: string; language?: string }) => 
    apiFetch<any>("/assistant/query", { method: "POST", body: JSON.stringify(data) })
}
