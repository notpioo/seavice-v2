import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Smartphone,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Wallet
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Provider, PPOBProduct } from "@shared/schema";

// Format to Rupiah
function formatRupiah(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export default function PulsaPage() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [provider, setProvider] = useState<Provider | null>(null);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [products, setProducts] = useState<PPOBProduct[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<PPOBProduct | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [transactionId, setTransactionId] = useState("");

    const { isAuthenticated, user, firebaseUser } = useAuth();
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    // Fetch providers on mount
    useEffect(() => {
        fetch("/api/ppob/providers?type=pulsa")
            .then(res => res.json())
            .then(data => setProviders(data))
            .catch(err => console.error("Error fetching providers:", err));
    }, []);

    // Detect provider from phone number
    useEffect(() => {
        if (phoneNumber.length >= 4) {
            fetch(`/api/ppob/detect-provider?phone=${phoneNumber}`)
                .then(res => res.json())
                .then(data => {
                    if (data.provider) {
                        setProvider(data.provider);
                        // Fetch products for this provider
                        fetch(`/api/ppob/products?providerId=${data.provider.id}&type=pulsa`)
                            .then(res => res.json())
                            .then(products => setProducts(products))
                            .catch(err => console.error("Error fetching products:", err));
                    } else {
                        setProvider(null);
                        setProducts([]);
                    }
                })
                .catch(err => console.error("Error detecting provider:", err));
        } else {
            setProvider(null);
            setProducts([]);
        }
        setSelectedProduct(null);
    }, [phoneNumber]);

    // Handle phone input
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value.length <= 13) {
            setPhoneNumber(value);
        }
    };

    // Handle continue to checkout
    const handleContinue = () => {
        if (!isAuthenticated) {
            toast({
                title: "Login diperlukan",
                description: "Silakan login untuk melakukan transaksi",
                variant: "destructive",
            });
            setLocation("/login");
            return;
        }

        if (!selectedProduct || !phoneNumber || !provider) return;

        // Navigate to checkout with product data
        const params = new URLSearchParams({
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            providerId: provider.id,
            providerName: provider.name,
            type: "pulsa",
            target: phoneNumber,
            price: selectedProduct.price.toString(),
        });

        setLocation(`/checkout?${params.toString()}`);
    };

    // Reset for new transaction
    const handleNewTransaction = () => {
        setPhoneNumber("");
        setProvider(null);
        setProducts([]);
        setSelectedProduct(null);
        setShowSuccess(false);
        setTransactionId("");
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
                                Transaksi Berhasil!
                            </h2>
                            <p className="text-gray-500 mb-6">
                                Pulsa sedang diproses dan akan masuk dalam beberapa saat
                            </p>

                            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">ID Transaksi</span>
                                    <span className="font-mono text-sm">{transactionId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Nomor</span>
                                    <span className="font-medium">{phoneNumber}</span>
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
                                    Transaksi Baru
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
        <div className="min-h-screen bg-gray-50 pb-8">
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
                        <h1 className="text-2xl font-display font-bold text-gray-900">Isi Pulsa</h1>
                        <p className="text-gray-500 text-sm">Pulsa instan ke semua operator</p>
                    </div>
                </div>

                {/* Phone Input */}
                <Card className="shadow-lg shadow-gray-200/50 border-0 mb-6">
                    <CardContent className="pt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nomor Handphone
                        </label>
                        <div className="relative">
                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                type="tel"
                                placeholder="Contoh: 081234567890"
                                value={phoneNumber}
                                onChange={handlePhoneChange}
                                className="h-14 pl-12 pr-4 text-lg rounded-xl border-gray-200 focus:border-primary"
                            />
                            {provider && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <img
                                        src={provider.image}
                                        alt={provider.name}
                                        className="h-8 w-auto object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = "none";
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        {provider && (
                            <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                {provider.name} terdeteksi
                            </p>
                        )}
                        {phoneNumber.length >= 4 && !provider && (
                            <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                Operator tidak dikenali
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Products Grid */}
                {products.length > 0 && (
                    <Card className="shadow-lg shadow-gray-200/50 border-0 mb-6">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-display">Pilih Nominal</CardTitle>
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
                                        <div className="font-bold text-gray-900">{product.name}</div>
                                        <div className="text-primary font-semibold text-sm mt-1">
                                            {formatRupiah(product.price)}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Provider Selection (if no number entered) */}
                {!provider && phoneNumber.length < 4 && providers.length > 0 && (
                    <Card className="shadow-lg shadow-gray-200/50 border-0 mb-6">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-display">Operator Tersedia</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                                {providers.map((p) => (
                                    <div
                                        key={p.id}
                                        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-orange-50 transition-colors"
                                    >
                                        <img
                                            src={p.image}
                                            alt={p.name}
                                            className="h-10 w-auto object-contain"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "https://via.placeholder.com/40?text=" + p.name[0];
                                            }}
                                        />
                                        <span className="text-xs text-gray-600 text-center">{p.name}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

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
                                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                                    {selectedProduct.name}
                                </Badge>
                            </div>
                            <Button
                                onClick={handleContinue}
                                disabled={!phoneNumber || !selectedProduct}
                                className="w-full h-14 rounded-xl bg-gradient-to-r from-primary to-orange-400 hover:from-orange-500 hover:to-orange-400 text-white font-semibold text-lg shadow-lg shadow-orange-200/50"
                            >
                                <Wallet className="w-5 h-5 mr-2" />
                                Lanjut ke Pembayaran
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
