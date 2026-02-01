import { Search, ShoppingCart, User, Menu, LogOut, Settings, Shield } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  // Get initials from display name
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-orange-300 flex items-center justify-center text-white font-bold text-lg group-hover:rotate-6 transition-transform">
            S
          </div>
          <span className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Seavice
          </span>
        </Link>

        {/* Search Bar - Hidden on mobile, shown on desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="h-4 w-4" />
          </div>
          <Input
            type="search"
            placeholder="Search products, bills & services..."
            className="pl-10 h-10 w-full rounded-full bg-gray-50 border-transparent focus:bg-white focus:border-primary/20 transition-all duration-200"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon" className="md:hidden text-gray-500">
            <Search className="w-5 h-5" />
          </Button>

          <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-primary hover:bg-orange-50 rounded-full transition-colors">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white"></span>
          </Button>

          {/* User Menu */}
          {loading ? (
            <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-orange-50 transition-colors p-0">
                  <Avatar className="w-9 h-9 border-2 border-orange-100">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                    <AvatarFallback className="bg-gradient-to-tr from-primary to-orange-300 text-white text-sm font-semibold">
                      {getInitials(user.displayName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold text-gray-900">{user.displayName || "User"}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    {isAdmin && (
                      <span className="inline-flex items-center gap-1 text-xs text-orange-600 font-medium">
                        <Shield className="w-3 h-3" />
                        Admin
                      </span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem className="rounded-lg cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil Saya</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem className="rounded-lg cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Pengaturan</span>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem className="rounded-lg cursor-pointer text-orange-600">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="rounded-lg cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button
                variant="default"
                size="sm"
                className="rounded-full bg-gradient-to-r from-primary to-orange-400 hover:from-orange-500 hover:to-orange-400 text-white font-medium px-4 shadow-md shadow-orange-200/50"
              >
                Masuk
              </Button>
            </Link>
          )}

          <Button variant="ghost" size="icon" className="md:hidden text-gray-600">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
