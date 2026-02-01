import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Zap,
    Loader2,
    CheckCircle2,
    Wallet,
    Copy,
    Check
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { PPOBProduct } from "@shared/schema";

// Format to Rupiah
function formatRupiah(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export default function PLNPage() {
    const [customerId, setCustomerId] = useState("");
    const [products, setProducts] = useState<PPOBProduct[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<PPOBProduct | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [transactionId, setTransactionId] = useState("");
    const [serialNumber, setSerialNumber] = useState("");
    const [copied, setCopied] = useState(false);

    const { isAuthenticated, user } = useAuth();
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    // Fetch PLN products on mount
    useEffect(() => {
        fetch("/api/ppob/products?providerId=pln&type=pln")
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.error("Error fetching products:", err));
    }, []);

    // Handle customer ID input
    const handleCustomerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value.length <= 12) {
            setCustomerId(value);
        }
    };

    // Validate customer ID (11-12 digits for PLN prepaid)
    const isValidCustomerId = customerId.length >= 11 && customerId.length <= 12;

    // Handle purchase
    const handlePurchase = async () => {
        if (!isAuthenticated) {
            toast({
                title: "Login diperlukan",
                description: "Silakan login untuk melakukan transaksi",
                variant: "destructive",
            });
            setLocation("/login");
            return;
        }

        if (!selectedProduct || !isValidCustomerId) return;

        setIsProcessing(true);

        try {
            const token = await user?.uid ?
                (await import("@/lib/firebase")).auth.currentUser?.getIdToken() : null;

            if (!token) {
                throw new Error("No auth token");
            }

            const response = await fetch("/api/ppob/transaction", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    productId: selectedProduct.id,
                    target: customerId,
                }),
            });

            if (!response.ok) {
                throw new Error("Transaction failed");
            }

            const data = await response.json();
            setTransactionId(data.transaction.id);

            // Poll for serial number (simulated)
            setTimeout(() => {
                setSerialNumber("1234-5678-9012-3456-7890");
                setShowSuccess(true);
            }, 2500);

            toast({
                title: "Transaksi berhasil! 🎉",
                description: `Token PLN sedang diproses`,
            });
        } catch (error) {
            console.error("Transaction error:", error);
            toast({
                title: "Transaksi gagal",
                description: "Terjadi kesalahan, silakan coba lagi",
                variant: "destructive",
            });
            setIsProcessing(false);
        }
    };

    // Copy token to clipboard
    const handleCopyToken = () => {
        navigator.clipboard.writeText(serialNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
            title: "Token disalin!",
            description: "Token berhasil disalin ke clipboard",
        });
    };

    // Reset for new transaction
    const handleNewTransaction = () => {
        setCustomerId("");
        setSelectedProduct(null);
        setShowSuccess(false);
        setTransactionId("");
        setSerialNumber("");
        setIsProcessing(false);
    };

    // Success view
    if (showSuccess) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="container mx-auto px-4 py-8 max-w-md">
                    <Card className="shadow-xl shadow-gray-200/50 border-0 text-center">
                        <CardContent className="pt-12 pb-8">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
                                Token PLN Berhasil!
                            </h2>
                            <p className="text-gray-500 mb-6">
                                Masukkan token ini ke meteran listrik Anda
                            </p>

                            {/* Token Display */}
                            <div className="bg-gradient-to-r from-primary to-orange-400 rounded-2xl p-6 mb-6">
                                <p className="text-white/80 text-sm mb-2">Token PLN Anda:</p>
                                <p className="text-white text-2xl font-mono font-bold tracking-wider">
                                    {serialNumber}
                                </p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCopyToken}
                                    className="mt-3 text-white hover:bg-white/20"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4 mr-1" />
                                            Disalin!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 mr-1" />
                                            Salin Token
                                        </>
                                    )}
                                </Button>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">ID Transaksi</span>
                                    <span className="font-mono text-sm">{transactionId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">ID Pelanggan</span>
                                    <span className="font-medium">{customerId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Produk</span>
                                    <span className="font-medium">{selectedProduct?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Total</span>
                                    <span className="font-bold text-primary">{formatRupiah(selectedProduct?.price || 0)}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={handleNewTransaction}
                                    className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-orange-400"
                                >
                                    Beli Token Lagi
                                </Button>
                                <Link href="/">
                                    <Button variant="outline" className="w-full h-12 rounded-xl">
                                        Kembali ke Beranda
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            <Navbar />

            <main className="container mx-auto px-4 lg:px-8 py-6 max-w-6xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-gray-900">Token PLN</h1>
                        <p className="text-gray-500 text-sm">Beli token listrik prabayar</p>
                    </div>
                </div>

                {/* Customer ID Input */}
                <Card className="shadow-lg shadow-gray-200/50 border-0 mb-6">
                    <CardContent className="pt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nomor Meter / ID Pelanggan
                        </label>
                        <div className="relative">
                            <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-500" />
                            <Input
                                type="tel"
                                placeholder="Masukkan 11-12 digit nomor meter"
                                value={customerId}
                                onChange={handleCustomerIdChange}
                                className="h-14 pl-12 pr-4 text-lg rounded-xl border-gray-200 focus:border-primary"
                            />
                        </div>
                        {customerId.length > 0 && !isValidCustomerId && (
                            <p className="text-sm text-amber-600 mt-2">
                                Nomor meter harus 11-12 digit
                            </p>
                        )}
                        {isValidCustomerId && (
                            <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                Nomor meter valid
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Token Options */}
                <Card className="shadow-lg shadow-gray-200/50 border-0 mb-6">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-display">Pilih Nominal Token</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {products.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => setSelectedProduct(product)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${selectedProduct?.id === product.id
                                        ? "border-primary bg-orange-50 shadow-md"
                                        : "border-gray-200 hover:border-orange-200 hover:bg-orange-50/50"
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Zap className="w-4 h-4 text-yellow-500" />
                                        <span className="font-bold text-gray-900">{product.name}</span>
                                    </div>
                                    {product.description && (
                                        <p className="text-xs text-gray-500 mb-2">{product.description}</p>
                                    )}
                                    <div className="text-primary font-semibold">
                                        {formatRupiah(product.price)}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Info Box */}
                <Card className="bg-blue-50 border-blue-100 mb-6">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Zap className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium text-blue-900">Informasi</p>
                                <p className="text-sm text-blue-700">
                                    Token listrik akan dikirim langsung ke nomor meter Anda.
                                    Simpan token dan masukkan ke meteran prabayar.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Purchase Button */}
                {selectedProduct && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
                        <div className="container mx-auto max-w-6xl px-4 lg:px-8">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-sm text-gray-500">Total Pembayaran</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {formatRupiah(selectedProduct.price)}
                                    </p>
                                </div>
                                <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                                    {selectedProduct.name}
                                </Badge>
                            </div>
                            <Button
                                onClick={handlePurchase}
                                disabled={isProcessing || !isValidCustomerId}
                                className="w-full h-14 rounded-xl bg-gradient-to-r from-primary to-orange-400 hover:from-orange-500 hover:to-orange-400 text-white font-semibold text-lg shadow-lg shadow-orange-200/50"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Memproses Token...
                                    </>
                                ) : (
                                    <>
                                        <Wallet className="w-5 h-5 mr-2" />
                                        Bayar Sekarang
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
