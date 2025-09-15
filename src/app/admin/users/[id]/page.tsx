"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminOnly } from "@/components/route-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/ui/page-header";
import { BlockModal } from "@/components/ui/block-modal";
import {
  User,
  Mail,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Briefcase,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "freelancer" | "client" | "admin";
  avatar: string | null;
  bio: string | null;
  skills: string[] | null;
  hourly_rate: number | null;
  created_at: string;
  updated_at: string;
  is_blocked: boolean;
  block_reason: string | null;
  blocked_at: string | null;
}

interface UserStats {
  totalTasks: number;
  completedTasks: number;
  totalEarnings: number;
  averageRating: number;
}

export default function AdminUserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocking, setIsBlocking] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      // Fetch user profile
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError) {
        console.error("Error fetching user:", userError);
        return;
      }

      setUser(userData);

      // Fetch user stats
      const { data: tasksData } = await supabase
        .from("tasks")
        .select("budget, status")
        .or(`client_id.eq.${userId},freelancer_id.eq.${userId}`);

      const totalTasks = tasksData?.length || 0;
      const completedTasks =
        tasksData?.filter((t) => t.status === "completed").length || 0;
      const totalEarnings =
        tasksData
          ?.filter((t) => t.status === "completed")
          .reduce((sum, t) => sum + (t.budget || 0), 0) || 0;

      setStats({
        totalTasks,
        completedTasks,
        totalEarnings,
        averageRating: 4.5, // Placeholder - would need reviews table
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockUser = async (reason: string) => {
    setIsBlocking(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          is_blocked: true,
          block_reason: reason,
          blocked_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        console.error("Error blocking user:", error);
        alert(`Error blocking user: ${error.message || "Unknown error"}`);
        return;
      }

      // Update local state
      setUser((prev) =>
        prev
          ? {
              ...prev,
              is_blocked: true,
              block_reason: reason,
              blocked_at: new Date().toISOString(),
            }
          : null
      );

      alert("User blocked successfully!");
    } catch (error) {
      console.error("Error blocking user:", error);
      alert("Error blocking user. Please try again.");
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblockUser = async () => {
    setIsBlocking(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          is_blocked: false,
          block_reason: null,
          blocked_at: null,
        })
        .eq("id", userId);

      if (error) {
        console.error("Error unblocking user:", error);
        alert(`Error unblocking user: ${error.message || "Unknown error"}`);
        return;
      }

      // Update local state
      setUser((prev) =>
        prev
          ? {
              ...prev,
              is_blocked: false,
              block_reason: null,
              blocked_at: null,
            }
          : null
      );

      alert("User unblocked successfully!");
    } catch (error) {
      console.error("Error unblocking user:", error);
      alert("Error unblocking user. Please try again.");
    } finally {
      setIsBlocking(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleBadge = (role: string) => {
    const roleMap = {
      freelancer: { label: "Freelancer", variant: "default" as const },
      client: { label: "Client", variant: "secondary" as const },
      admin: { label: "Administrator", variant: "destructive" as const },
    };
    const roleInfo =
      roleMap[role as keyof typeof roleMap] || roleMap.freelancer;
    return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>;
  };

  if (isLoading) {
    return (
      <AdminOnly>
        <div className="min-h-screen bg-background">
          <PageHeader title="Loading..." description="Fetching user profile" />
          <div className="px-6 py-6">
            <div className="text-center">Loading user profile...</div>
          </div>
        </div>
      </AdminOnly>
    );
  }

  if (!user) {
    return (
      <AdminOnly>
        <div className="min-h-screen bg-background">
          <PageHeader
            title="User Not Found"
            description="The requested user could not be found"
          />
          <div className="px-6 py-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">User not found</p>
              <Button asChild>
                <Link href="/admin/users">Back to Users</Link>
              </Button>
            </div>
          </div>
        </div>
      </AdminOnly>
    );
  }

  return (
    <AdminOnly>
      <div className="min-h-screen bg-background">
        <PageHeader
          title={user.name}
          description={`${user.role} profile management`}
          actions={
            <Button variant="outline" asChild>
              <Link href="/admin/users" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Users
              </Link>
            </Button>
          }
        />

        <div className="px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar || ""} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-semibold">{user.name}</h2>
                          {getRoleBadge(user.role)}
                          {user.is_blocked && (
                            <Badge variant="destructive">Blocked</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user.bio && (
                    <div>
                      <h4 className="font-medium mb-2">Bio</h4>
                      <p className="text-sm text-muted-foreground">
                        {user.bio}
                      </p>
                    </div>
                  )}

                  {user.skills && user.skills.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {user.skills.map((skill, index) => (
                          <Badge key={index} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Joined: {formatDate(user.created_at)}
                      </span>
                    </div>
                    {user.hourly_rate && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Rate: ${user.hourly_rate}/hour
                        </span>
                      </div>
                    )}
                  </div>

                  {user.is_blocked && user.block_reason && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <h4 className="font-medium text-destructive">
                          Account Blocked
                        </h4>
                      </div>
                      <p className="text-sm text-destructive">
                        <strong>Reason:</strong> {user.block_reason}
                      </p>
                      {user.blocked_at && (
                        <p className="text-xs text-destructive mt-1">
                          Blocked on: {formatDate(user.blocked_at)}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* User Stats */}
              {stats && (
                <Card>
                  <CardHeader>
                    <CardTitle>Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">
                          {stats.totalTasks}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Tasks
                        </div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">
                          {stats.completedTasks}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Completed
                        </div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">
                          ${stats.totalEarnings}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Earnings
                        </div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">
                          {stats.averageRating}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Rating
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Admin Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {user.is_blocked ? (
                    <Button
                      onClick={handleUnblockUser}
                      disabled={isBlocking}
                      className="w-full"
                      variant="outline"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Unblock User
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setShowBlockModal(true)}
                      disabled={isBlocking}
                      className="w-full"
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Block User
                    </Button>
                  )}

                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/freelancers/${user.id}`}>
                      <User className="h-4 w-4 mr-2" />
                      View Public Profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <BlockModal
          isOpen={showBlockModal}
          onClose={() => setShowBlockModal(false)}
          onConfirm={handleBlockUser}
          title="Block User"
          description={`Are you sure you want to block ${user.name}? This will prevent them from accessing the platform.`}
          type="user"
        />
      </div>
    </AdminOnly>
  );
}
