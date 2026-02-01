import { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    XCircle,
    Loader2,
    Package,
    Smartphone,
    Receipt,
    ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Format to Rupiah
function formatRupiah(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

// Format date
function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

interface Transaction {
    id: string;
    userId: string;
    productId: string;
    productName: string;
    providerId: string;
    providerName: string;
    type: string;
    target: string;
    price: number;
    status: "pending" | "processing" | "success" | "failed";
    serialNumber?: string;
    paymentStatus: "unpaid" | "paid" | "expired" | "cancelled";
    paymentMethod?: string;
    paidAt?: string;
    createdAt: string;
    updatedAt: string;
}

export default function TransactionsPage() {
    const searchString = useSearch();
    const params = new URLSearchParams(searchString);
    const initialTab = params.get("status") || "all";

    const [, setLocation] = useLocation();
    const { firebaseUser } = useAuth();
    const { toast } = useToast();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(initialTab);

    // Fetch transactions
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const token = await firebaseUser?.getIdToken();
                if (!token) return;

                const response = await fetch("/api/orders", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch transactions");
                }

                const data = await response.json();
                setTransactions(data.transactions || []);
            } catch (error) {
                console.error("Error fetching transactions:", error);
                toast({
                    title: "Error",
                    description: "Gagal memuat riwayat transaksi",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (firebaseUser) {
            fetchTransactions();
        }
    }, [firebaseUser]);

    // Filter transactions by tab
    const filteredTransactions = transactions.filter((tx) => {
        switch (activeTab) {
            case "unpaid":
                return tx.paymentStatus === "unpaid" && tx.status === "pending";
            case "processing":
                return tx.status === "processing";
            case "completed":
                return tx.status === "success";
            case "failed":
                return tx.status === "failed";
            default:
                return true;
        }
    });

    // Count by status
    const counts = {
        all: transactions.length,
        unpaid: transactions.filter(tx => tx.paymentStatus === "unpaid" && tx.status === "pending").length,
        processing: transactions.filter(tx => tx.status === "processing").length,
        completed: transactions.filter(tx => tx.status === "success").length,
        failed: transactions.filter(tx => tx.status === "failed").length,
    };

    // Status badge
    const getStatusBadge = (tx: Transaction) => {
        if (tx.paymentStatus === "unpaid" && tx.status === "pending") {
            return (
                <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 text-xs">
                    Belum Bayar
                </Badge>
            );
        }
        switch (tx.status) {
            case "success":
                return (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                        Sukses
                    </Badge>
                );
            case "processing":
                return (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs">
                        Diproses
                    </Badge>
                );
            case "failed":
                return (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs">
                        Gagal
                    </Badge>
                );
            default:
                return <Badge className="text-xs">{tx.status}</Badge>;
        }
    };

    // Get icon for product type
    const getProductIcon = (type: string) => {
        switch (type) {
            case "pulsa":
                return <Smartphone className="w-5 h-5" />;
            default:
                return <Package className="w-5 h-5" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <Navbar />

            <div className="container mx-auto px-4 lg:px-8 py-6 max-w-2xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => setLocation("/profile")}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-xl font-bold text-gray-900">Transaksi Saya</h1>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full grid grid-cols-5 h-auto p-1 bg-gray-100 mb-4">
                        <TabsTrigger value="all" className="text-xs py-2">
                            Semua
                            {counts.all > 0 && <span className="ml-1 text-gray-400">({counts.all})</span>}
                        </TabsTrigger>
                        <TabsTrigger value="unpaid" className="text-xs py-2">
                            Belum Bayar
                            {counts.unpaid > 0 && <span className="ml-1 text-orange-500">({counts.unpaid})</span>}
                        </TabsTrigger>
                        <TabsTrigger value="processing" className="text-xs py-2">
                            Diproses
                            {counts.processing > 0 && <span className="ml-1 text-blue-500">({counts.processing})</span>}
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="text-xs py-2">
                            Selesai
                            {counts.completed > 0 && <span className="ml-1 text-green-500">({counts.completed})</span>}
                        </TabsTrigger>
                        <TabsTrigger value="failed" className="text-xs py-2">
                            Gagal
                            {counts.failed > 0 && <span className="ml-1 text-red-500">({counts.failed})</span>}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="mt-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                            </div>
                        ) : filteredTransactions.length === 0 ? (
                            <Card className="border-0 shadow-sm">
                                <CardContent className="py-12 text-center">
                                    <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">Belum ada transaksi</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {filteredTransactions.map((tx) => (
                                    <Link key={tx.id} href={`/orders/${tx.id}`}>
                                        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                            <CardContent className="p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                                        {getProductIcon(tx.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <p className="font-medium text-gray-900 truncate">
                                                                    {tx.productName}
                                                                </p>
                                                                <p className="text-sm text-gray-500 font-mono">
                                                                    {tx.target}
                                                                </p>
                                                            </div>
                                                            {getStatusBadge(tx)}
                                                        </div>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <p className="text-xs text-gray-400">
                                                                {formatDate(tx.createdAt)}
                                                            </p>
                                                            <p className="font-bold text-orange-600">
                                                                {formatRupiah(tx.price)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
