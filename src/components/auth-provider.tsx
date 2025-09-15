"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading } = useAppStore();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Small delay to prevent flash
        await new Promise((resolve) => setTimeout(resolve, 100));

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session error:", error);
        }

        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            // Fetch user profile
            try {
              const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("id", session.user.id)
                .single();

              if (error) {
                console.error("Error fetching user profile:", error);
              } else {
                setProfile(data);
              }
            } catch (error) {
              console.error("Error fetching user profile:", error);
            }
          } else {
            setUser(null);
            setProfile(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        if (session?.user) {
          setUser(session.user);
          // Fetch user profile
          try {
            const { data, error } = await supabase
              .from("users")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (error) {
              console.error("Error fetching user profile:", error);
            } else {
              setProfile(data);
            }
          } catch (error) {
            console.error("Error fetching user profile:", error);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    });

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, setProfile, setLoading]);

  return <>{children}</>;
}
