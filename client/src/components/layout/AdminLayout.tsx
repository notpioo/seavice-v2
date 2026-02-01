import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Store,
    Wallet
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [location] = useLocation();
    const { logout, user } = useAuth();

    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
        { icon: Store, label: "Produk PPOB", href: "/admin/products" },
        { icon: ShoppingCart, label: "Transaksi", href: "/admin/transactions" },
        { icon: Users, label: "Pengguna", href: "/admin/users" },
        { icon: Wallet, label: "Deposit & Saldo", href: "/admin/deposits" },
        { icon: Settings, label: "Pengaturan", href: "/admin/settings" },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="h-full flex flex-col">
                    {/* Logo Area */}
                    <div className="h-16 flex items-center px-6 border-b border-gray-100">
                        <Link href="/admin">
                            <div className="flex items-center gap-2 font-bold text-xl text-orange-500 cursor-pointer">
                                <span className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center text-lg">S</span>
                                Seavice Admin
                            </div>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                        {navItems.map((item) => {
                            const isActive = location === item.href;
                            return (
                                <Link key={item.href} href={item.href}>
                                    <Button
                                        variant={isActive ? "secondary" : "ghost"}
                                        className={`w-full justify-start gap-3 ${isActive
                                                ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                            }`}
                                    >
                                        <item.icon className={`w-5 h-5 ${isActive ? "text-orange-500" : "text-gray-400"}`} />
                                        {item.label}
                                    </Button>
                                </Link>
                            );
                        })}
                    </div>

                    {/* User & Logout */}
                    <div className="p-4 border-t border-gray-100">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                                {user?.displayName?.[0] || "A"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{user?.displayName}</p>
                                <p className="text-xs text-gray-400 truncate">Admin</p>
                            </div>
                        </div>
                        <Link href="/">
                            <Button variant="outline" className="w-full gap-2 text-gray-600 border-gray-200 hover:bg-gray-50">
                                <LogOut className="w-4 h-4" />
                                Keluar Panel
                            </Button>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="h-16 lg:hidden bg-white border-b border-gray-200 flex items-center px-4 sticky top-0 z-30">
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                        <Menu className="w-6 h-6" />
                    </Button>
                    <span className="ml-4 font-bold text-gray-900">Admin Panel</span>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
