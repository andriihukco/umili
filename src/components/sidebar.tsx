"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/hooks/use-auth";
import { useNotificationsCount } from "@/components/ui/notifications-manager";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import {
  Home,
  Briefcase,
  Users,
  MessageSquare,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Bell,
  HelpCircle,
  Shield,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed?: boolean;
  onCollapseToggle?: () => void;
}

export function Sidebar({
  isOpen,
  onToggle,
  isCollapsed = false,
  onCollapseToggle,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const unreadCount = useNotificationsCount();
  const [fallbackUser, setFallbackUser] = useState<{
    id: string;
    email: string | null;
    role: string;
    name: string;
    avatar?: string | null;
  } | null>(null);

  // Fallback: get user directly from Supabase if useAuth fails
  useEffect(() => {
    const getFallbackUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user && !user) {
        // Try to get profile directly
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setFallbackUser({
            id: session.user.id,
            email: session.user.email || null,
            role: profile.role,
            name: profile.name,
            avatar: profile.avatar,
          });
        }
      } else if (!session?.user) {
        // Clear fallback user when no session
        setFallbackUser(null);
      }
    };

    if (!user) {
      getFallbackUser();
    } else {
      // Clear fallback user when main user is available
      setFallbackUser(null);
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => pathname === path;

  // Get role-specific navigation items
  const getNavigationItems = () => {
    // Info/About links for non-authenticated users
    const infoItems = [
      {
        title: "Контакти і допомога",
        href: "/info",
        icon: HelpCircle,
      },
    ];

    // Base items for non-authenticated users
    const baseItems = [
      { title: "Головна", href: "/", icon: Home },
      {
        title: "Каталог умільців",
        href: "/catalog/freelancers",
        icon: Users,
      },
      { title: "Каталог завдань", href: "/catalog/tasks", icon: Briefcase },
      ...infoItems,
    ];

    const currentUser = user || fallbackUser;
    if (!currentUser) return baseItems;

    switch (currentUser.role) {
      case "admin":
        return [
          { title: "Dashboard", href: "/", icon: Home },
          { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
          { title: "User Management", href: "/admin/users", icon: Shield },
          {
            title: "Projects & Tasks",
            href: "/admin/projects",
            icon: FileText,
          },
        ];

      case "client":
        return [
          { title: "Dashboard", href: "/", icon: Home },
          { title: "Notifications", href: "/notifications", icon: Bell },
          { title: "My Jobs", href: "/client-jobs", icon: FileText },
          {
            title: "Каталог умільців",
            href: "/catalog/freelancers",
            icon: Users,
          },
          {
            title: "Active Projects",
            href: "/active-projects",
            icon: FileText,
          },
          { title: "Chat", href: "/chat", icon: MessageSquare },
          ...infoItems,
        ];

      case "freelancer":
        return [
          { title: "Dashboard", href: "/dashboard", icon: Home },
          { title: "Notifications", href: "/notifications", icon: Bell },
          {
            title: "My Jobs",
            href: "/freelancer-jobs",
            icon: Briefcase,
          },
          {
            title: "Active Projects",
            href: "/active-projects",
            icon: FileText,
          },
          { title: "Chat", href: "/chat", icon: MessageSquare },
          ...infoItems,
        ];

      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 w-64 ${isCollapsed ? "lg:w-16" : "lg:w-64"}`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div
            className={`flex h-16 items-center border-b border-gray-200 ${
              isCollapsed ? "justify-center px-2" : "justify-between px-6"
            }`}
          >
            {!isCollapsed && (
              <Link href="/" className="flex items-center space-x-2">
                <Logo size="md" className="text-gray-900" />
              </Link>
            )}
            <div className="flex items-center">
              {onCollapseToggle && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCollapseToggle}
                  className={`hidden lg:flex ${
                    isCollapsed ? "px-3 py-2 justify-center" : ""
                  }`}
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="lg:hidden"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav
            className={`flex-1 overflow-y-auto ${isCollapsed ? "p-2" : "p-4"}`}
          >
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const showNotificationBadge =
                  item.href === "/notifications" && unreadCount > 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center rounded-lg text-sm font-medium transition-all duration-200 px-3 py-2 ${
                      isActive(item.href)
                        ? "bg-gray-100 text-gray-900 font-semibold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    } ${isCollapsed ? "justify-center" : "space-x-3"}`}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <div className="relative">
                      <Icon className="h-4 w-4" />
                      {showNotificationBadge && (
                        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span>{item.title}</span>
                        {showNotificationBadge && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Section */}
          <div
            className={`border-t border-gray-200 ${
              isCollapsed ? "p-2" : "p-4"
            }`}
          >
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`w-full px-3 py-2 ${
                      isCollapsed ? "justify-center" : "justify-start"
                    }`}
                    title={
                      isCollapsed
                        ? `${(user || fallbackUser)?.name || "Користувач"} - ${
                            (user || fallbackUser)?.role === "admin"
                              ? "Admin"
                              : (user || fallbackUser)?.role === "client"
                              ? "Клієнт"
                              : "Умілець"
                          }`
                        : undefined
                    }
                  >
                    <div
                      className={`flex items-center ${
                        isCollapsed ? "" : "space-x-3"
                      }`}
                    >
                      <Avatar
                        className={`${isCollapsed ? "h-8 w-8" : "h-8 w-8"}`}
                      >
                        <AvatarImage
                          src={(user || fallbackUser)?.avatar || ""}
                          alt={(user || fallbackUser)?.name || ""}
                        />
                        <AvatarFallback>
                          {(user || fallbackUser)?.name?.charAt(0) ||
                            (user || fallbackUser)?.email?.charAt(0) ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                      {!isCollapsed && (
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium text-gray-900">
                            {(user || fallbackUser)?.name || "Користувач"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {(user || fallbackUser)?.role === "admin"
                              ? "Admin"
                              : (user || fallbackUser)?.role === "client"
                              ? "Клієнт"
                              : "Умілець"}
                          </span>
                        </div>
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">
                        {(user || fallbackUser)?.name || "Користувач"}
                      </p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {(user || fallbackUser)?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Профіль
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Налаштування
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Вийти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="space-y-4">
                {/* Auth Buttons */}
                <div className="space-y-2">
                  {isCollapsed ? (
                    <Button
                      variant="ghost"
                      asChild
                      className="w-full px-3 py-2 justify-center"
                      title="Увійти"
                    >
                      <Link href="/auth/login">
                        <User className="h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        asChild
                        className="w-full justify-center"
                      >
                        <Link href="/auth/login">Увійти</Link>
                      </Button>
                      <Button asChild className="w-full">
                        <Link href="/auth/register">Реєстрація</Link>
                      </Button>
                    </>
                  )}
                </div>

                {/* Footer Links */}
                {!isCollapsed && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="space-y-3">
                      <div className="text-xs text-gray-500">
                        <div className="flex flex-wrap gap-x-3">
                          <Link
                            href="/terms"
                            className="hover:text-gray-700 transition-colors"
                          >
                            Умови використання
                          </Link>
                          <Link
                            href="/privacy"
                            className="hover:text-gray-700 transition-colors"
                          >
                            Політика конфіденційності
                          </Link>
                          <Link
                            href="/cookies"
                            className="hover:text-gray-700 transition-colors"
                          >
                            Cookie Policy
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function MobileHeader({ onToggle }: { onToggle: () => void }) {
  return (
    <header className="lg:hidden border-b bg-white sticky top-0 z-50 flex">
      <div className="flex h-16 items-center justify-between px-4 w-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="z-50 flex-shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link
          href="/"
          className="flex items-center space-x-2 flex-1 justify-center"
        >
          <Logo size="md" />
        </Link>
        <div className="w-9 flex-shrink-0" /> {/* Spacer for centering */}
      </div>
    </header>
  );
}
