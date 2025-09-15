"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";

export default function DebugAuthPage() {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const [authUser, setAuthUser] = useState<unknown>(null);
  const [profile, setProfile] = useState<unknown>(null);
  const [session, setSession] = useState<unknown>(null);
  const [dbUser, setDbUser] = useState<unknown>(null);

  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        // Get current session
        const { data: sessionData } = await supabase.auth.getSession();
        setSession(sessionData.session);

        // Get current user
        const {
          data: { user: authUserData },
        } = await supabase.auth.getUser();
        setAuthUser(authUserData);

        if (authUserData) {
          // Get user profile from database
          const { data: profileData, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", authUserData.id)
            .single();

          if (error) {
            console.error("Error fetching profile:", error);
          } else {
            setProfile(profileData);
            setDbUser(profileData);
          }
        }
      } catch (error) {
        console.error("Error fetching auth data:", error);
      }
    };

    fetchAuthData();
  }, []);

  const testAdminAccess = () => {
    console.log("=== AUTHENTICATION DEBUG ===");
    console.log("useAuth user:", user);
    console.log("useAuth isLoading:", isLoading);
    console.log("useAuth isAuthenticated:", isAuthenticated);
    console.log("useAuth isAdmin:", isAdmin);
    console.log("Session:", session);
    console.log("Auth User:", authUser);
    console.log("Profile:", profile);
    console.log("DB User:", dbUser);
    console.log("===========================");
  };

  const signInAsAdmin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "hukdrew@gmail.com",
        password: "admin123",
      });

      if (error) {
        console.error("Sign in error:", error);
        alert("Sign in failed: " + error.message);
      } else {
        console.log("Sign in successful:", data);
        alert("Signed in successfully!");
        // Refresh the page to update auth state
        window.location.reload();
      }
    } catch (error) {
      console.error("Sign in error:", error);
      alert("Sign in failed: " + error);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      alert("Signed out successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Sign out error:", error);
      alert("Sign out failed: " + error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Debug Authentication"
        description="Diagnose authentication and admin access issues"
      />
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Authentication Status */}
          <Card>
            <CardHeader>
              <CardTitle>Authentication Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Loading:</span>
                <Badge variant={isLoading ? "destructive" : "default"}>
                  {isLoading ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Authenticated:</span>
                <Badge variant={isAuthenticated ? "default" : "destructive"}>
                  {isAuthenticated ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Is Admin:</span>
                <Badge variant={isAdmin() ? "default" : "destructive"}>
                  {isAdmin() ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>User Role:</span>
                <Badge variant="outline">{user?.role || "None"}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <strong>Name:</strong> {user?.name || "N/A"}
              </div>
              <div>
                <strong>Email:</strong> {user?.email || "N/A"}
              </div>
              <div>
                <strong>ID:</strong> {user?.id || "N/A"}
              </div>
              <div>
                <strong>Role:</strong> {user?.role || "N/A"}
              </div>
              <div>
                <strong>Avatar:</strong> {user?.avatar || "N/A"}
              </div>
            </CardContent>
          </Card>

          {/* Raw Data */}
          <Card>
            <CardHeader>
              <CardTitle>Raw Session Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(session, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* Raw Profile Data */}
          <Card>
            <CardHeader>
              <CardTitle>Raw Profile Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(dbUser, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <Button onClick={testAdminAccess}>Log Debug Info</Button>
          <Button onClick={signInAsAdmin} variant="outline">
            Sign In as Admin (hukdrew@gmail.com)
          </Button>
          <Button onClick={signOut} variant="destructive">
            Sign Out
          </Button>
        </div>

        {/* Admin Access Test */}
        {isAdmin() && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-green-600">
                ✅ Admin Access Confirmed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>You have admin access! You should be able to access:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>
                  <a
                    href="/admin/analytics"
                    className="text-blue-600 hover:underline"
                  >
                    Analytics
                  </a>
                </li>
                <li>
                  <Link
                    href="/admin/users"
                    className="text-blue-600 hover:underline"
                  >
                    User Management
                  </Link>
                </li>
                <li>
                  <a
                    href="/admin/projects"
                    className="text-blue-600 hover:underline"
                  >
                    Projects & Tasks
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}

        {!isAdmin() && isAuthenticated && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-red-600">❌ No Admin Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p>You are authenticated but don&apos;t have admin privileges.</p>
              <p className="mt-2">
                Current role: <strong>{user?.role}</strong>
              </p>
              <p className="mt-2">
                Please sign in with an admin account or contact support.
              </p>
            </CardContent>
          </Card>
        )}

        {!isAuthenticated && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-yellow-600">
                ⚠️ Not Authenticated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                You are not signed in. Please sign in to access admin features.
              </p>
              <p className="mt-2">
                Try signing in with:{" "}
                <strong>hukdrew@gmail.com / admin123</strong>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
