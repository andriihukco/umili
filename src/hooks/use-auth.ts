import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';

export interface AuthUser {
  id: string;
  email: string;
  role: 'freelancer' | 'client' | 'admin';
  name: string;
  avatar?: string;
}

export function useAuth() {
  const { user, profile, isLoading, setUser, setProfile } = useAppStore();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (user && profile) {
      setAuthUser({
        id: user.id,
        email: user.email || '',
        role: profile.role,
        name: profile.name,
        avatar: profile.avatar || undefined,
      });
    } else {
      setAuthUser(null);
    }
  }, [user, profile]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Clear all state immediately
      setUser(null);
      setProfile(null);
      setAuthUser(null);
      // Force a small delay to ensure state updates propagate
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error("Error signing out:", error);
      // Still clear state even if signOut fails
      setUser(null);
      setProfile(null);
      setAuthUser(null);
    }
  };

  const hasRole = (role: 'freelancer' | 'client' | 'admin') => {
    return authUser?.role === role;
  };

  const hasAnyRole = (roles: ('freelancer' | 'client' | 'admin')[]) => {
    return authUser ? roles.includes(authUser.role) : false;
  };

  const isClient = () => hasAnyRole(['client', 'admin']);
  const isFreelancer = () => hasAnyRole(['freelancer', 'admin']);
  const isAdmin = () => hasRole('admin');


  return {
    user: authUser,
    isLoading,
    isAuthenticated: !!authUser,
    signOut,
    hasRole,
    hasAnyRole,
    isClient,
    isFreelancer,
    isAdmin,
  };
}
