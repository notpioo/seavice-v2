import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    ArrowLeft,
    Calendar,
    Shield,
    Coins,
    Heart,
    Ticket,
    Users,
    HelpCircle,
    MoreVertical,
    Edit,
    LogOut,
    Loader2,
    ChevronDown,
    Clock,
    Package,
    CheckCircle,
    History,
    Gift,
    Copy,
    Check,
    Camera,
    ImageIcon,
    LayoutDashboard,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// FAQ Data
const faqItems = [
    {
        question: "Bagaimana cara melakukan transaksi?",
        answer: "Pilih layanan yang diinginkan (Pulsa, Kuota, atau PLN), masukkan nomor tujuan, pilih nominal, lalu klik bayar. Transaksi akan diproses secara otomatis."
    },
    {
        question: "Berapa lama transaksi diproses?",
        answer: "Transaksi biasanya diproses dalam 1-5 menit. Untuk token PLN, token akan langsung muncul setelah pembayaran berhasil."
    },
    {
        question: "Bagaimana cara mendapatkan points?",
        answer: "Points didapatkan setiap melakukan transaksi. Setiap Rp 1.000 transaksi akan mendapatkan 10 points yang bisa ditukar dengan voucher."
    },
    {
        question: "Bagaimana cara menggunakan kode redeem?",
        answer: "Masukkan kode redeem pada menu Redeem, lalu klik tombol Redeem. Jika kode valid, bonus akan langsung ditambahkan ke akun Anda."
    },
    {
        question: "Apa itu Seavice Points?",
        answer: "Seavice Points adalah program loyalitas yang memberikan poin setiap transaksi. Points dapat ditukar dengan voucher diskon untuk transaksi selanjutnya."
    },
];

export default function Profile() {
    const { user, firebaseUser, isAdmin, logout, refreshProfile } = useAuth();
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [redeemCode, setRedeemCode] = useState("");
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    // User data
    const points = user?.points || 0;
    const referralCode = "SEAVICE2026";

    // Order counts from transactions
    const [orderCounts, setOrderCounts] = useState({
        unpaid: 0,
        processing: 0,
        completed: 0,
    });

    // Fetch order counts
    useEffect(() => {
        const fetchOrderCounts = async () => {
            try {
                const token = await firebaseUser?.getIdToken();
                if (!token) return;

                const response = await fetch("/api/orders", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) return;

                const data = await response.json();
                const transactions = data.transactions || [];

                setOrderCounts({
                    unpaid: transactions.filter((tx: any) => tx.paymentStatus === "unpaid" && tx.status === "pending").length,
                    processing: transactions.filter((tx: any) => tx.status === "processing").length,
                    completed: transactions.filter((tx: any) => tx.status === "success").length,
                });
            } catch (error) {
                console.error("Error fetching order counts:", error);
            }
        };

        if (firebaseUser) {
            fetchOrderCounts();
        }
    }, [firebaseUser]);

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

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    // Handle logout
    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            toast({
                title: "Logout berhasil",
                description: "Sampai jumpa lagi!",
            });
            setLocation("/");
        } catch (error) {
            toast({
                title: "Logout gagal",
                description: "Terjadi kesalahan",
                variant: "destructive",
            });
        } finally {
            setIsLoggingOut(false);
        }
    };

    // Handle redeem
    const handleRedeem = async () => {
        if (!redeemCode.trim()) {
            toast({
                title: "Kode tidak valid",
                description: "Masukkan kode redeem terlebih dahulu",
                variant: "destructive",
            });
            return;
        }

        setIsRedeeming(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast({
            title: "Kode tidak ditemukan",
            description: "Kode yang Anda masukkan tidak valid atau sudah kadaluarsa",
            variant: "destructive",
        });
        setRedeemCode("");
        setIsRedeeming(false);
    };

    // Copy referral code
    const copyReferralCode = () => {
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        toast({
            title: "Kode disalin!",
            description: "Kode referral berhasil disalin ke clipboard",
        });
        setTimeout(() => setCopied(false), 2000);
    };

    // Handle banner upload
    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File terlalu besar",
                description: "Ukuran maksimal file adalah 5MB",
                variant: "destructive",
            });
            return;
        }

        setIsUploadingBanner(true);
        try {
            const formData = new FormData();
            formData.append("image", file);

            const token = await firebaseUser?.getIdToken();
            const res = await fetch("/api/upload/banner", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            toast({
                title: "Banner berhasil diupload!",
                description: "Banner profil Anda telah diperbarui",
            });

            // Refresh page to show new banner
            await refreshProfile();
        } catch (error) {
            console.error("Upload error:", error);
            toast({
                title: "Upload gagal",
                description: "Terjadi kesalahan saat mengupload gambar",
                variant: "destructive",
            });
        } finally {
            setIsUploadingBanner(false);
        }
    };

    // Order status menu
    const orderMenu = [
        { icon: Clock, label: "Belum Bayar", href: "/transactions?status=unpaid", count: orderCounts.unpaid },
        { icon: Package, label: "Diproses", href: "/transactions?status=processing", count: orderCounts.processing },
        { icon: CheckCircle, label: "Selesai", href: "/transactions?status=completed", count: orderCounts.completed },
        { icon: History, label: "Riwayat", href: "/transactions", count: null },
    ];

    // Features menu
    const featuresMenu = [
        { icon: Heart, label: "Favorite", type: "link", href: "#" },
        { icon: Ticket, label: "Voucher", type: "link", href: "#" },
        { icon: Gift, label: "Redeem", type: "redeem" },
        { icon: Users, label: "Referral", type: "referral" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <Navbar />

            <main className="container mx-auto px-4 lg:px-8 py-6 max-w-6xl">
                {/* Back Button */}
                <Link href="/">
                    <Button variant="ghost" className="mb-4 gap-2 text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="w-4 h-4" />
                        Kembali
                    </Button>
                </Link>

                {/* Main Card */}
                <Card className="shadow-xl shadow-gray-200/50 border-0 bg-white overflow-hidden">
                    {/* Hidden file input */}
                    <input
                        type="file"
                        ref={bannerInputRef}
                        onChange={handleBannerUpload}
                        accept="image/*"
                        className="hidden"
                    />

                    {/* Banner Section */}
                    <div className="relative h-32 sm:h-40 bg-gradient-to-r from-orange-200 via-orange-300 to-amber-200">
                        {/* Banner Image (if available) */}
                        {user?.bannerUrl && (
                            <img
                                src={user.bannerUrl}
                                alt="Banner"
                                className="w-full h-full object-cover"
                            />
                        )}

                        {/* Upload loading overlay */}
                        {isUploadingBanner && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            </div>
                        )}

                        {/* 3-dot Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="absolute top-3 right-3 rounded-full bg-black/30 hover:bg-black/50 text-white">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                    className="gap-2 cursor-pointer"
                                    onClick={() => bannerInputRef.current?.click()}
                                    disabled={isUploadingBanner}
                                >
                                    <ImageIcon className="w-4 h-4" />
                                    Ganti Banner
                                </DropdownMenuItem>
                                <Link href="/profile/edit">
                                    <DropdownMenuItem className="gap-2 cursor-pointer">
                                        <Edit className="w-4 h-4" />
                                        Edit Profile
                                    </DropdownMenuItem>
                                </Link>
                                {isAdmin && (
                                    <Link href="/admin">
                                        <DropdownMenuItem className="gap-2 cursor-pointer">
                                            <LayoutDashboard className="w-4 h-4" />
                                            Admin Panel
                                        </DropdownMenuItem>
                                    </Link>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                >
                                    {isLoggingOut ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <LogOut className="w-4 h-4" />
                                    )}
                                    {isLoggingOut ? "Logging out..." : "Logout"}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Profile Info Section */}
                    <div className="px-6 pb-6">
                        {/* Avatar - overlapping banner */}
                        <div className="relative -mt-12 mb-4">
                            <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                                <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || "User"} />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-orange-400 text-white text-3xl font-bold">
                                    {getInitials(user?.displayName)}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        {/* User Info */}
                        <div>
                            <h1 className="text-2xl font-display font-bold text-gray-900 flex items-center gap-2">
                                {user?.displayName || "User"}
                                {isAdmin && (
                                    <Badge className="bg-orange-200 text-orange-700 border-0 gap-1 text-xs">
                                        <Shield className="w-3 h-3" />
                                        Admin
                                    </Badge>
                                )}
                            </h1>
                            <p className="text-gray-500">{user?.email}</p>
                            <div className="flex items-center gap-2 mt-1 text-gray-400 text-sm">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Member sejak {user?.createdAt ? formatDate(user.createdAt) : "baru"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100" />

                    {/* Content Section */}
                    <CardContent className="p-0">
                        {/* Order Status Menu */}
                        <div className="grid grid-cols-4 border-b border-gray-100">
                            {orderMenu.map((item) => (
                                <Link key={item.label} href={item.href}>
                                    <div className="flex flex-col items-center gap-2 py-5 hover:bg-orange-50/50 transition-colors cursor-pointer group relative">
                                        <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 group-hover:bg-orange-100 transition-colors relative">
                                            <item.icon className="w-5 h-5" />
                                            {item.count !== null && item.count > 0 && (
                                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                                    {item.count}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">{item.label}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Features Menu */}
                        <div className="grid grid-cols-4 border-b border-gray-100">
                            {featuresMenu.map((item) => {
                                // Redeem Dialog
                                if (item.type === "redeem") {
                                    return (
                                        <Dialog key={item.label}>
                                            <DialogTrigger asChild>
                                                <button className="flex flex-col items-center gap-2 py-5 hover:bg-orange-50/50 transition-colors cursor-pointer group">
                                                    <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 group-hover:bg-orange-100 transition-colors">
                                                        <item.icon className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-xs sm:text-sm font-medium text-gray-700">{item.label}</span>
                                                </button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>Redeem Kode</DialogTitle>
                                                    <DialogDescription>
                                                        Masukkan kode voucher atau promo untuk mendapatkan bonus
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="flex gap-2 mt-4">
                                                    <Input
                                                        placeholder="Masukkan kode..."
                                                        value={redeemCode}
                                                        onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                                                        className="font-mono uppercase"
                                                        disabled={isRedeeming}
                                                    />
                                                    <Button
                                                        onClick={handleRedeem}
                                                        disabled={isRedeeming || !redeemCode.trim()}
                                                        className="bg-orange-500 hover:bg-orange-600"
                                                    >
                                                        {isRedeeming ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            "Redeem"
                                                        )}
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    );
                                }

                                // Referral Dialog
                                if (item.type === "referral") {
                                    return (
                                        <Dialog key={item.label}>
                                            <DialogTrigger asChild>
                                                <button className="flex flex-col items-center gap-2 py-5 hover:bg-orange-50/50 transition-colors cursor-pointer group">
                                                    <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 group-hover:bg-orange-100 transition-colors">
                                                        <item.icon className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-xs sm:text-sm font-medium text-gray-700">{item.label}</span>
                                                </button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>Kode Referral</DialogTitle>
                                                    <DialogDescription>
                                                        Bagikan kode referral kamu dan dapatkan bonus 5000 points untuk setiap teman yang mendaftar!
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="flex gap-2 mt-4">
                                                    <div className="flex-1 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 font-mono font-bold text-orange-600 text-center text-lg">
                                                        {referralCode}
                                                    </div>
                                                    <Button
                                                        onClick={copyReferralCode}
                                                        variant="outline"
                                                        className="border-orange-200 hover:bg-orange-50"
                                                    >
                                                        {copied ? (
                                                            <Check className="w-4 h-4 text-green-600" />
                                                        ) : (
                                                            <Copy className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    );
                                }

                                // Regular Link
                                return (
                                    <Link key={item.label} href={item.href || "#"}>
                                        <div className="flex flex-col items-center gap-2 py-5 hover:bg-orange-50/50 transition-colors cursor-pointer group">
                                            <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 group-hover:bg-orange-100 transition-colors">
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs sm:text-sm font-medium text-gray-700">{item.label}</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Points Section */}
                        <Link href="#">
                            <div className="flex items-center gap-4 py-5 px-6 border-b border-gray-100 hover:bg-orange-50/50 transition-colors cursor-pointer group">
                                <div className="p-3 bg-orange-100 rounded-2xl text-orange-600">
                                    <Coins className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">Seavice Points</h3>
                                    <p className="text-sm text-gray-500">Tukar dengan voucher & diskon menarik</p>
                                </div>
                                <span className="text-2xl font-bold text-orange-600">{points.toLocaleString("id-ID")}</span>
                            </div>
                        </Link>

                        {/* FAQ Section */}
                        <div className="px-6 py-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
                                    <HelpCircle className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-gray-900">Pertanyaan Umum (FAQ)</h3>
                            </div>

                            <div className="space-y-2">
                                {faqItems.map((faq, index) => (
                                    <Collapsible
                                        key={index}
                                        open={openFaq === index}
                                        onOpenChange={() => setOpenFaq(openFaq === index ? null : index)}
                                    >
                                        <CollapsibleTrigger className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-orange-50 rounded-xl transition-colors text-left">
                                            <span className="font-medium text-gray-700 text-sm pr-4">{faq.question}</span>
                                            <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${openFaq === index ? "rotate-180" : ""}`} />
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="px-4 pt-2 pb-4">
                                            <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                                        </CollapsibleContent>
                                    </Collapsible>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
