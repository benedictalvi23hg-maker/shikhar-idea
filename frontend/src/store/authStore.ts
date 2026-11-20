import { create } from 'zustand'

export interface UserProfile {
  id: number
  username: string
  email: string
  full_name: string
  military_rank: string
  department: string
  roles: string[]
  is_superuser: boolean
}

interface AuthState {
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  activeRole: string
  setAuth: (token: string, user: UserProfile) => void
  setActiveRole: (role: string) => void
  logout: () => void
}

const DEFAULT_USER: UserProfile = {
  id: 1,
  username: "commander.shikhar",
  email: "commander@shikhar.mod.gov.in",
  full_name: "Brigadier General R. K. Rawat",
  military_rank: "Brigadier General",
  department: "Integrated Defense Logistics Staff",
  roles: ["Super Administrator", "Logistics Manager", "Warehouse Manager", "Analyst"],
  is_superuser: true
}

export const useAuthStore = create<AuthState>((set) => {
  const savedToken = localStorage.getItem("shikhar_token") || ""
  const savedUser = localStorage.getItem("shikhar_user") 
    ? JSON.parse(localStorage.getItem("shikhar_user")!) 
    : DEFAULT_USER

  return {
    user: savedUser,
    token: savedToken,
    isAuthenticated: Boolean(savedToken),
    activeRole: savedUser?.roles?.[0] || "Super Administrator",
    setAuth: (token, user) => {
      localStorage.setItem("shikhar_token", token)
      localStorage.setItem("shikhar_user", JSON.stringify(user))
      set({ token, user, isAuthenticated: true, activeRole: user.roles[0] || "Super Administrator" })
    },
    setActiveRole: (role) => set({ activeRole: role }),
    logout: () => {
      localStorage.removeItem("shikhar_token")
      localStorage.removeItem("shikhar_refresh_token")
      localStorage.removeItem("shikhar_user")
      set({ user: null, token: null, isAuthenticated: false, activeRole: "Viewer" })
    }
  }
})
