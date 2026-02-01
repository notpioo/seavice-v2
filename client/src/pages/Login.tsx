import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login, loginWithGoogle } = useAuth();
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(email, password);
            toast({
                title: "Login berhasil! 🎉",
                description: "Selamat datang kembali di Seavice",
            });
            setLocation("/");
        } catch (error: any) {
            let message = "Terjadi kesalahan saat login";
            if (error.code === "auth/invalid-credential") {
                message = "Email atau password salah";
            } else if (error.code === "auth/user-not-found") {
                message = "Akun tidak ditemukan";
            } else if (error.code === "auth/too-many-requests") {
                message = "Terlalu banyak percobaan. Coba lagi nanti";
            }
            toast({
                title: "Login gagal",
                description: message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await loginWithGoogle();
            toast({
                title: "Login berhasil! 🎉",
                description: "Selamat datang di Seavice",
            });
            setLocation("/");
        } catch (error: any) {
            toast({
                title: "Login gagal",
                description: "Gagal login dengan Google",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-100/40 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-8 group cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-orange-300 flex items-center justify-center text-white font-bold text-xl group-hover:rotate-6 transition-transform shadow-lg shadow-orange-200">
                        S
                    </div>
                    <span className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                        Seavice
                    </span>
                </Link>

                <Card className="shadow-xl shadow-gray-200/50 border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl font-display">Masuk ke Akun</CardTitle>
                        <CardDescription className="text-gray-500">
                            Selamat datang kembali! Silakan masuk untuk melanjutkan
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Google Login Button */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-12 rounded-xl border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                <FcGoogle className="w-5 h-5 mr-2" />
                            )}
                            Lanjutkan dengan Google
                        </Button>

                        {/* Divider */}
                        <div className="relative">
                            <Separator className="bg-gray-200" />
                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-gray-400">
                                atau
                            </span>
                        </div>

                        {/* Email Login Form */}
                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700 font-medium">
                                    Email
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="nama@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 pl-10 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-gray-700 font-medium">
                                        Password
                                    </Label>
                                    <Link href="/forgot-password" className="text-sm text-primary hover:text-orange-600 transition-colors">
                                        Lupa password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Masukkan password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-12 pl-10 pr-10 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20"
                                        required
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-orange-400 hover:from-orange-500 hover:to-orange-400 text-white font-semibold shadow-lg shadow-orange-200/50 transition-all duration-200"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Memproses...
                                    </>
                                ) : (
                                    "Masuk"
                                )}
                            </Button>
                        </form>

                        {/* Register Link */}
                        <p className="text-center text-gray-500 pt-2">
                            Belum punya akun?{" "}
                            <Link href="/register" className="text-primary hover:text-orange-600 font-semibold transition-colors">
                                Daftar sekarang
                            </Link>
                        </p>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-center text-gray-400 text-sm mt-6">
                    © 2026 Seavice. All rights reserved.
                </p>
            </div>
        </div>
    );
}
