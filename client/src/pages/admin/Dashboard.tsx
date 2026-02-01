import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users,
    ShoppingCart,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    Activity,
    Package
} from "lucide-react";

export default function AdminDashboard() {
    // Mock Data Stats
    const stats = [
        {
            title: "Total Omset Hari Ini",
            value: "Rp 2.500.000",
            change: "+12%",
            trend: "up",
            icon: DollarSign,
            color: "text-green-600",
            bg: "bg-green-100",
        },
        {
            title: "Transaksi Sukses",
            value: "145",
            change: "+5%",
            trend: "up",
            icon: ShoppingCart,
            color: "text-blue-600",
            bg: "bg-blue-100",
        },
        {
            title: "User Baru",
            value: "12",
            change: "-2%",
            trend: "down",
            icon: Users,
            color: "text-orange-600",
            bg: "bg-orange-100",
        },
        {
            title: "Transaksi Gagal",
            value: "3",
            change: "1.2%",
            trend: "down", // down is good for failure rate
            icon: Activity,
            color: "text-red-600",
            bg: "bg-red-100",
        },
    ];

    // Mock Recent Transactions
    const recentTransactions = [
        { id: "TRX-001", user: "Andi Saputra", product: "Pulsa Telkomsel 10K", price: "Rp 12.000", status: "success", time: "Baru saja" },
        { id: "TRX-002", user: "Budi Santoso", product: "Token PLN 20K", price: "Rp 22.500", status: "processing", time: "5 menit lalu" },
        { id: "TRX-003", user: "Citra Dewi", product: "Kuota Indosat 2GB", price: "Rp 15.000", status: "success", time: "12 menit lalu" },
        { id: "TRX-004", user: "Dedi Mahendra", product: "Dana 50K", price: "Rp 52.000", status: "failed", time: "30 menit lalu" },
        { id: "TRX-005", user: "Eka Putri", product: "Pulsa XL 5K", price: "Rp 7.000", status: "success", time: "1 jam lalu" },
    ];

    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Overview performa bisnis hari ini</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"
                                    }`}>
                                    {stat.trend === "up" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                    {stat.change}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Transactions Chart (Placeholder) */}
                <div className="lg:col-span-2">
                    <Card className="border-0 shadow-sm h-full">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Grafik Penjualan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-100">
                                <p className="text-gray-400">Chart Area (Coming Soon)</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Transactions Feed */}
                <div className="lg:col-span-1">
                    <Card className="border-0 shadow-sm h-full">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Transaksi Terbaru</CardTitle>
                        </CardHeader>
                        <CardContent className="px-0">
                            <div className="space-y-4">
                                {recentTransactions.map((trx) => (
                                    <div key={trx.id} className="flex items-center gap-4 px-6 py-2 hover:bg-gray-50 transition-colors cursor-pointer">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${trx.status === "success" ? "bg-green-100 text-green-600" :
                                            trx.status === "processing" ? "bg-amber-100 text-amber-600" :
                                                "bg-red-100 text-red-600"
                                            }`}>
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{trx.product}</p>
                                            <p className="text-xs text-gray-500 truncate">{trx.user} • {trx.time}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-900">{trx.price}</p>
                                            <p className={`text-xs capitalize ${trx.status === "success" ? "text-green-600" :
                                                trx.status === "processing" ? "text-amber-600" :
                                                    "text-red-600"
                                                }`}>{trx.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 px-6">
                                <Button variant="outline" className="w-full text-sm">Lihat Semua Transaksi</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
