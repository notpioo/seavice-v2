import { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
    ArrowLeft,
    Smartphone,
    Loader2,
    CheckCircle2,
    Wallet,
    CreditCard,
    Ticket,
    Coins,
    AlertCircle,
    Sparkles
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import "@/types/midtrans.d.ts";

// Format to Rupiah
function formatRupiah(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export default function CheckoutPage() {
    const searchString = useSearch();
    const [, setLocation] = useLocation();
    const { user, firebaseUser, isAuthenticated, refreshProfile } = useAuth();
    const { toast } = useToast();

    // Parse URL params
    const params = new URLSearchParams(searchString);
    const productId = params.get("productId") || "";
    const productName = params.get("productName") || "";
    const providerId = params.get("providerId") || "";
    const providerName = params.get("providerName") || "";
    const target = params.get("target") || "";
    const type = params.get("type") || "pulsa";
    const price = parseInt(params.get("price") || "0");

    // States
    const [paymentMethod, setPaymentMethod] = useState<"points" | "midtrans">("midtrans");
    const [voucherCode, setVoucherCode] = useState("");
    const [voucherDiscount, setVoucherDiscount] = useState(0);
    const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
    const [voucherApplied, setVoucherApplied] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [usePoints, setUsePoints] = useState(false);

    // User points
    const userPoints = user?.points || 0;

    // Calculate amounts
    const pointsToUse = usePoints ? Math.min(userPoints, price - voucherDiscount) : 0;
    const finalPrice = Math.max(0, price - voucherDiscount - pointsToUse);
    const canPayWithPointsOnly = userPoints >= (price - voucherDiscount);

    // Redirect if no product
    useEffect(() => {
        if (!productId || !price) {
            setLocation("/");
        }
    }, [productId, price, setLocation]);

    // Apply voucher
    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) return;

        setIsApplyingVoucher(true);

        // Simulate voucher check (mock)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock vouchers
        const mockVouchers: Record<string, number> = {
            "DISKON10": 0.1, // 10% discount
            "DISKON20": 0.2, // 20% discount
            "GRATIS5K": 5000, // Flat 5000
        };

        const discount = mockVouchers[voucherCode.toUpperCase()];

        if (discount) {
            const discountAmount = discount < 1 ? Math.floor(price * discount) : discount;
            setVoucherDiscount(discountAmount);
            setVoucherApplied(true);
            toast({
                title: "Voucher berhasil diterapkan! 🎉",
                description: `Diskon ${formatRupiah(discountAmount)}`,
            });
        } else {
            toast({
                title: "Voucher tidak valid",
                description: "Kode voucher tidak ditemukan atau sudah kadaluarsa",
                variant: "destructive",
            });
        }

        setIsApplyingVoucher(false);
    };

    // Remove voucher
    const handleRemoveVoucher = () => {
        setVoucherCode("");
        setVoucherDiscount(0);
        setVoucherApplied(false);
    };

    // Handle checkout
    const handleCheckout = async () => {
        if (!isAuthenticated) {
            toast({
                title: "Login diperlukan",
                description: "Silakan login untuk melakukan transaksi",
                variant: "destructive",
            });
            setLocation("/login");
            return;
        }

        setIsProcessing(true);

        try {
            const token = await firebaseUser?.getIdToken();
            if (!token) throw new Error("No auth token");

            // If paying with points only
            if (paymentMethod === "points" && canPayWithPointsOnly) {
                const response = await fetch("/api/orders/create-with-points", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        productId,
                        productName,
                        providerId,
                        providerName,
                        type,
                        target,
                        price,
                        pointsUsed: price - voucherDiscount,
                        voucherCode: voucherApplied ? voucherCode : null,
                        voucherDiscount,
                    }),
                });

                if (!response.ok) throw new Error("Failed to create order");

                const data = await response.json();

                // Refresh user profile to update points
                await refreshProfile();

                toast({
                    title: "Pembayaran berhasil! 🎉",
                    description: `${productName} sedang diproses`,
                });

                setLocation(`/orders/${data.orderId}`);
                return;
            }

            // If using Midtrans (with optional partial points)
            const response = await fetch("/api/orders/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    productId,
                    productName,
                    providerId,
                    providerName,
                    type,
                    target,
                    price: finalPrice, // Price after points & voucher deduction
                    originalPrice: price,
                    pointsUsed: pointsToUse,
                    voucherCode: voucherApplied ? voucherCode : null,
                    voucherDiscount,
                }),
            });

            if (!response.ok) throw new Error("Failed to create order");

            const data = await response.json();

            setIsProcessing(false);

            // Open Midtrans Snap popup
            window.snap.pay(data.snapToken, {
                onSuccess: async (result) => {
                    console.log("Payment success:", result);

                    // Confirm payment to server (for local dev without webhook)
                    try {
                        await fetch(`/api/orders/${data.orderId}/confirm-payment`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                        });
                    } catch (e) {
                        console.error("Confirm payment error:", e);
                    }

                    await refreshProfile();
                    toast({
                        title: "Pembayaran berhasil! 🎉",
                        description: `${productName} sedang diproses`,
                    });
                    setLocation(`/orders/${data.orderId}`);
                },
                onPending: (result) => {
                    console.log("Payment pending:", result);
                    toast({
                        title: "Menunggu pembayaran",
                        description: "Silakan selesaikan pembayaran Anda",
                    });
                    setLocation(`/orders/${data.orderId}`);
                },
                onError: (result) => {
                    console.error("Payment error:", result);
                    toast({
                        title: "Pembayaran gagal",
                        description: "Terjadi kesalahan saat memproses pembayaran",
                        variant: "destructive",
                    });
                },
                onClose: () => {
                    console.log("Snap popup closed");
                },
            });
        } catch (error) {
            console.error("Checkout error:", error);
            toast({
                title: "Checkout gagal",
                description: "Terjadi kesalahan, silakan coba lagi",
                variant: "destructive",
            });
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <Navbar />

            <div className="container mx-auto px-4 lg:px-8 py-6 max-w-2xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
                </div>

                {/* Order Details */}
                <Card className="mb-4 border-0 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-orange-500" />
                            Detail Pesanan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Produk</span>
                            <span className="font-medium">{productName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Provider</span>
                            <span className="font-medium">{providerName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Nomor Tujuan</span>
                            <span className="font-medium font-mono">{target}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                            <span className="text-gray-500">Harga</span>
                            <span className="font-bold text-lg">{formatRupiah(price)}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Voucher Section */}
                <Card className="mb-4 border-0 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-orange-500" />
                            Gunakan Voucher
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {voucherApplied ? (
                            <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="font-medium text-green-800">{voucherCode}</p>
                                        <p className="text-sm text-green-600">Diskon {formatRupiah(voucherDiscount)}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={handleRemoveVoucher} className="text-red-500 hover:text-red-600">
                                    Hapus
                                </Button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Masukkan kode voucher"
                                    value={voucherCode}
                                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                                    className="font-mono uppercase"
                                    disabled={isApplyingVoucher}
                                />
                                <Button
                                    onClick={handleApplyVoucher}
                                    disabled={isApplyingVoucher || !voucherCode.trim()}
                                    className="bg-orange-500 hover:bg-orange-600"
                                >
                                    {isApplyingVoucher ? <Loader2 className="w-4 h-4 animate-spin" /> : "Terapkan"}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Payment Method */}
                <Card className="mb-4 border-0 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-orange-500" />
                            Metode Pembayaran
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Points Toggle */}
                        <div
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${usePoints
                                ? "border-orange-500 bg-orange-50"
                                : "border-gray-200 hover:border-gray-300"
                                }`}
                            onClick={() => setUsePoints(!usePoints)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <Coins className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Gunakan Seavice Points</p>
                                        <p className="text-sm text-gray-500">Saldo: <span className="font-bold text-orange-600">{userPoints.toLocaleString()}</span> points</p>
                                    </div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${usePoints ? "border-orange-500 bg-orange-500" : "border-gray-300"
                                    }`}>
                                    {usePoints && <CheckCircle2 className="w-4 h-4 text-white" />}
                                </div>
                            </div>
                            {usePoints && userPoints > 0 && (
                                <div className="mt-3 pt-3 border-t border-orange-200">
                                    <p className="text-sm text-orange-700">
                                        <Sparkles className="w-4 h-4 inline mr-1" />
                                        Menggunakan <span className="font-bold">{pointsToUse.toLocaleString()}</span> points
                                        {canPayWithPointsOnly && " (Bayar penuh dengan points!)"}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* If can't pay with points only, show Midtrans option */}
                        {(!usePoints || !canPayWithPointsOnly) && (
                            <div className="p-4 rounded-xl border-2 border-orange-500 bg-orange-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <CreditCard className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Pembayaran Online</p>
                                        <p className="text-sm text-gray-500">QRIS, E-Wallet, Virtual Account, dll</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Points not enough warning */}
                        {usePoints && !canPayWithPointsOnly && userPoints > 0 && (
                            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-800">
                                    Points tidak cukup untuk bayar penuh. Sisa <span className="font-bold">{formatRupiah(finalPrice)}</span> akan dibayar via pembayaran online.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Summary */}
                <Card className="mb-6 border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white">
                    <CardContent className="pt-6 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Harga Produk</span>
                            <span>{formatRupiah(price)}</span>
                        </div>
                        {voucherDiscount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Diskon Voucher</span>
                                <span>-{formatRupiah(voucherDiscount)}</span>
                            </div>
                        )}
                        {pointsToUse > 0 && (
                            <div className="flex justify-between text-sm text-orange-600">
                                <span>Potongan Points</span>
                                <span>-{formatRupiah(pointsToUse)}</span>
                            </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total Bayar</span>
                            <span className="text-orange-600">{formatRupiah(finalPrice)}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Checkout Button */}
                <Button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Memproses...
                        </>
                    ) : finalPrice === 0 ? (
                        <>
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            Bayar dengan Points
                        </>
                    ) : (
                        <>
                            <CreditCard className="w-5 h-5 mr-2" />
                            Bayar {formatRupiah(finalPrice)}
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
