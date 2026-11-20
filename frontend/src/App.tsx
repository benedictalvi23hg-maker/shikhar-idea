import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { useAuthStore } from './store/authStore'

// Pages
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { LiveLogisticsPage } from './pages/LiveLogisticsPage'
import { InventoryPage } from './pages/InventoryPage'
import { DemandForecastPage } from './pages/DemandForecastPage'
import { FreshnessPage } from './pages/FreshnessPage'
import { IsolationInventoryPage } from './pages/IsolationInventoryPage'
import { WarehousesPage } from './pages/WarehousesPage'
import { TransportationPage } from './pages/TransportationPage'
import { WeatherIntelligencePage } from './pages/WeatherIntelligencePage'
import { SuppliersPage } from './pages/SuppliersPage'
import { AssistantPage } from './pages/AssistantPage'
import { ChallengerAIPage } from './pages/ChallengerAIPage'
import { DigitalTwinPage } from './pages/DigitalTwinPage'
import { IoTOfflinePage } from './pages/IoTOfflinePage'
import { ReportsPage } from './pages/ReportsPage'
import { AdminSecurityPage } from './pages/AdminSecurityPage'

// Protected Tactical Shell Layout
const TacticalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-tactical-bg overflow-hidden text-tactical-text font-sans antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-tactical-bg/95">
          {children}
        </main>
      </div>
    </div>
  )
}

export const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore()

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Tactical Pages */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <TacticalLayout>
                <DashboardPage />
              </TacticalLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <TacticalLayout>
                <DashboardPage />
              </TacticalLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/live-map"
          element={
            isAuthenticated ? (
              <TacticalLayout>
                <LiveLogisticsPage />
              </TacticalLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/map"
          element={
            isAuthenticated ? (
              <TacticalLayout>
                <LiveLogisticsPage />
              </TacticalLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/inventory"
          element={
            isAuthenticated ? (
              <TacticalLayout>
                <InventoryPage />
              </TacticalLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/forecast"
          element={
            isAuthenticated ? (
              <TacticalLayout>
                <DemandForecastPage />
              </TacticalLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/freshness"
          element={
            isAuthenticated ? (
              <TacticalLayout>
                <FreshnessPage />
              </TacticalLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/isolation"
          element={
            isAuthenticated ? (
              <TacticalLayout>
                <IsolationInventoryPage />
              </TacticalLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/warehouses"
          element={
            isAuthenticated ? (
              <TacticalLayout>
                <WarehousesPage />
              </TacticalLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/transportation"
          element={
            isAuthenticated ? (
              <TacticalLayout>
                <TransportationPage />
              </TacticalLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/weather"
          element={
            isAuthenticated ? (
              <TacticalLayout>
                <WeatherIntelligencePage />
              </TacticalLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/suppliers"
          element={
            isAuthenticated ? (
              <TacticalLayout>
                <SuppliersPage />
              </TacticalLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/assistant"
          element={
            isAuthenticated ? (
              <TacticalLayout>
                <AssistantPage />
              </TacticalLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/challenger-ai"
          element={
            isAuthenticated ? (
              <TacticalLayout>
                <ChallengerAIPage />
              </TacticalLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/recommendations"
          element={
            isAuthenticated ? (
              <TacticalLayout>
                <ChallengerAIPage />
              </TacticalLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/digital-twin"
          element={
            isAuthenticated ? (
              <TacticalLayout>
                <DigitalTwinPage />
              </TacticalLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/simulation"
          element={
            isAuthenticated ? (
              <TacticalLayout>
                <DigitalTwinPage />
              </TacticalLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/iot-offline"
          element={
            isAuthenticated ? (
              <TacticalLayout>
                <IoTOfflinePage />
              </TacticalLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/iot"
          element={
            isAuthenticated ? (
              <TacticalLayout>
                <IoTOfflinePage />
              </TacticalLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/reports"
          element={
            isAuthenticated ? (
              <TacticalLayout>
                <ReportsPage />
              </TacticalLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/admin"
          element={
            isAuthenticated ? (
              <TacticalLayout>
                <AdminSecurityPage />
              </TacticalLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
