import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Target, ChevronDown, LayoutDashboard, Shield, LogOut, User } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200" data-testid="app-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button data-testid="navbar-logo" onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Target className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-['Outfit'] font-bold text-base text-slate-900 hidden sm:block">GrantGrabber</span>
          </button>
          <div className="flex items-center gap-1">
            <Button
              data-testid="nav-dashboard-link"
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className={`text-sm font-medium rounded-md ${isActive("/dashboard") ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
            >
              <LayoutDashboard className="w-4 h-4 mr-1.5" /> Dashboard
            </Button>
            {user?.role === "admin" && (
              <Button
                data-testid="nav-admin-link"
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin")}
                className={`text-sm font-medium rounded-md ${isActive("/admin") ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
              >
                <Shield className="w-4 h-4 mr-1.5" /> Admin
              </Button>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button data-testid="user-menu-trigger" variant="ghost" size="sm" className="text-sm font-medium text-slate-600 hover:text-slate-900 gap-2 rounded-lg">
              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <span className="hidden sm:block max-w-[120px] truncate">{user?.name || user?.email}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-lg border-slate-200 shadow-lg">
            <DropdownMenuLabel className="font-['Outfit'] text-sm font-semibold">
              <div>{user?.name}</div>
              <div className="font-['Manrope'] text-xs font-normal text-slate-400">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-testid="menu-dashboard" onClick={() => navigate("/dashboard")} className="text-sm cursor-pointer">
              <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
            </DropdownMenuItem>
            {user?.role === "admin" && (
              <DropdownMenuItem data-testid="menu-admin" onClick={() => navigate("/admin")} className="text-sm cursor-pointer">
                <Shield className="w-4 h-4 mr-2" /> Admin Panel
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem data-testid="menu-logout" onClick={handleLogout} className="text-sm text-red-600 cursor-pointer focus:text-red-600">
              <LogOut className="w-4 h-4 mr-2" /> Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
