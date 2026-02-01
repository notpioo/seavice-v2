import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    XCircle,
    Loader2,
    Copy,
    Check,
    Smartphone,
    Receipt,
    RefreshCw,
    Home
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
        month: "long",
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

export default function OrderDetailPage() {
    const params = useParams();
    const orderId = params.orderId as string;
    const [, setLocation] = useLocation();
    const { firebaseUser } = useAuth();
    const { toast } = useToast();

    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch transaction
    const fetchTransaction = async () => {
        try {
            const token = await firebaseUser?.getIdToken();
            if (!token) return;

            const response = await fetch(`/api/orders/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Order not found");
            }

            const data = await response.json();
            setTransaction(data.transaction);
        } catch (error) {
            console.error("Error fetching order:", error);
            toast({
                title: "Error",
                description: "Gagal memuat detail pesanan",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        if (firebaseUser && orderId) {
            fetchTransaction();
        }
    }, [firebaseUser, orderId]);

    // Auto refresh if processing
    useEffect(() => {
        if (transaction?.status === "processing" || transaction?.status === "pending") {
            const interval = setInterval(fetchTransaction, 3000);
            return () => clearInterval(interval);
        }
    }, [transaction?.status]);

    // Copy to clipboard
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
            title: "Disalin!",
            description: "Teks berhasil disalin ke clipboard",
        });
    };

    // Refresh manually
    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchTransaction();
    };

    // Status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "success":
                return (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Sukses
                    </Badge>
                );
            case "processing":
                return (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Diproses
                    </Badge>
                );
            case "pending":
                return (
                    <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 gap-1">
                        <Clock className="w-3 h-3" />
                        Menunggu
                    </Badge>
                );
            case "failed":
                return (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 gap-1">
                        <XCircle className="w-3 h-3" />
                        Gagal
                    </Badge>
                );
            default:
                return <Badge>{status}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
            </div>
        );
    }

    if (!transaction) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="container mx-auto px-4 py-12 text-center">
                    <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Pesanan Tidak Ditemukan</h1>
                    <p className="text-gray-500 mb-6">Pesanan dengan ID tersebut tidak ditemukan atau Anda tidak memiliki akses.</p>
                    <Link href="/">
                        <Button className="bg-orange-500 hover:bg-orange-600">
                            <Home className="w-4 h-4 mr-2" />
                            Kembali ke Beranda
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <Navbar />

            <div className="container mx-auto px-4 lg:px-8 py-6 max-w-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-xl font-bold text-gray-900">Detail Pesanan</h1>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
                    </Button>
                </div>

                {/* Status Card */}
                <Card className={`mb-4 border-0 shadow-sm overflow-hidden ${transaction.status === "success"
                        ? "bg-gradient-to-r from-green-50 to-green-100"
                        : transaction.status === "failed"
                            ? "bg-gradient-to-r from-red-50 to-red-100"
                            : "bg-gradient-to-r from-blue-50 to-blue-100"
                    }`}>
                    <CardContent className="pt-6 text-center">
                        {transaction.status === "success" ? (
                            <>
                                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-green-800 mb-1">Transaksi Berhasil!</h2>
                                <p className="text-green-600">Pesanan Anda telah berhasil diproses</p>
                            </>
                        ) : transaction.status === "failed" ? (
                            <>
                                <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-4">
                                    <XCircle className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-red-800 mb-1">Transaksi Gagal</h2>
                                <p className="text-red-600">Maaf, pesanan Anda tidak dapat diproses</p>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-4">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                                <h2 className="text-xl font-bold text-blue-800 mb-1">Sedang Diproses</h2>
                                <p className="text-blue-600">Mohon tunggu, pesanan sedang diproses...</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Serial Number (if success) */}
                {transaction.status === "success" && transaction.serialNumber && (
                    <Card className="mb-4 border-2 border-green-200 shadow-sm">
                        <CardContent className="pt-6">
                            <p className="text-sm text-gray-500 mb-2 text-center">Serial Number</p>
                            <div className="flex items-center justify-center gap-2 bg-gray-100 p-3 rounded-lg">
                                <code className="text-lg font-mono font-bold text-gray-800">
                                    {transaction.serialNumber}
                                </code>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleCopy(transaction.serialNumber!)}
                                    className="h-8 w-8"
                                >
                                    {copied ? (
                                        <Check className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Order Details */}
                <Card className="mb-4 border-0 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-orange-500" />
                            Detail Transaksi
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">ID Transaksi</span>
                            <div className="flex items-center gap-1">
                                <span className="font-mono text-sm">{transaction.id}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleCopy(transaction.id)}
                                    className="h-6 w-6"
                                >
                                    <Copy className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Status</span>
                            {getStatusBadge(transaction.status)}
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Tanggal</span>
                            <span className="text-sm">{formatDate(transaction.createdAt)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                            <span className="text-gray-500">Produk</span>
                            <span className="font-medium">{transaction.productName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Provider</span>
                            <span className="font-medium">{transaction.providerName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Nomor Tujuan</span>
                            <span className="font-mono">{transaction.target}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                            <span className="text-gray-500">Metode Pembayaran</span>
                            <span className="font-medium capitalize">
                                {transaction.paymentMethod === "points" ? "Seavice Points" : transaction.paymentMethod || "-"}
                            </span>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span className="text-orange-600">{formatRupiah(transaction.price)}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-3">
                    <Link href="/" className="flex-1">
                        <Button variant="outline" className="w-full">
                            <Home className="w-4 h-4 mr-2" />
                            Beranda
                        </Button>
                    </Link>
                    <Link href="/ppob/pulsa" className="flex-1">
                        <Button className="w-full bg-orange-500 hover:bg-orange-600">
                            <Smartphone className="w-4 h-4 mr-2" />
                            Beli Lagi
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
