import { create } from 'zustand'
import { User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  name: string
  email: string
  role: 'freelancer' | 'client' | 'admin'
  avatar?: string | null
  current_tier_id?: string | null
  created_at?: string
  updated_at?: string
}

interface AppState {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setLoading: (loading: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  profile: null,
  isLoading: false, // Start with loading false for now
  setUser: (user) => {
    set({ user });
  },
  setProfile: (profile) => {
    set({ profile });
  },
  setLoading: (isLoading) => {
    set({ isLoading });
  },
}))
