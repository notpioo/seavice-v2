import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, Lock, User, Loader2, CheckCircle2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { register, loginWithGoogle } = useAuth();
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    // Password validation
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const passwordsMatch = password === confirmPassword && password.length > 0;

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast({
                title: "Password tidak cocok",
                description: "Pastikan password dan konfirmasi password sama",
                variant: "destructive",
            });
            return;
        }

        if (!hasMinLength || !hasUpperCase || !hasNumber) {
            toast({
                title: "Password tidak valid",
                description: "Password harus minimal 8 karakter, mengandung huruf besar dan angka",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            await register(email, password, displayName);
            toast({
                title: "Registrasi berhasil! 🎉",
                description: "Selamat datang di Seavice",
            });
            setLocation("/");
        } catch (error: any) {
            let message = "Terjadi kesalahan saat registrasi";
            if (error.code === "auth/email-already-in-use") {
                message = "Email sudah terdaftar";
            } else if (error.code === "auth/weak-password") {
                message = "Password terlalu lemah";
            } else if (error.code === "auth/invalid-email") {
                message = "Format email tidak valid";
            }
            toast({
                title: "Registrasi gagal",
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 flex items-center justify-center p-4 py-8">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-100/40 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-6 group cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-orange-300 flex items-center justify-center text-white font-bold text-xl group-hover:rotate-6 transition-transform shadow-lg shadow-orange-200">
                        S
                    </div>
                    <span className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                        Seavice
                    </span>
                </Link>

                <Card className="shadow-xl shadow-gray-200/50 border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl font-display">Buat Akun Baru</CardTitle>
                        <CardDescription className="text-gray-500">
                            Daftar untuk mulai menggunakan layanan Seavice
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        {/* Google Register Button */}
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
                            Daftar dengan Google
                        </Button>

                        {/* Divider */}
                        <div className="relative">
                            <Separator className="bg-gray-200" />
                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-gray-400">
                                atau
                            </span>
                        </div>

                        {/* Register Form */}
                        <form onSubmit={handleRegister} className="space-y-4">
                            {/* Display Name */}
                            <div className="space-y-2">
                                <Label htmlFor="displayName" className="text-gray-700 font-medium">
                                    Nama Lengkap
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="displayName"
                                        type="text"
                                        placeholder="John Doe"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="h-12 pl-10 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Email */}
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

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-700 font-medium">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Buat password"
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
                                {/* Password requirements */}
                                {password.length > 0 && (
                                    <div className="space-y-1 pt-1">
                                        <div className={`flex items-center gap-2 text-xs ${hasMinLength ? "text-green-600" : "text-gray-400"}`}>
                                            <CheckCircle2 className={`w-3.5 h-3.5 ${hasMinLength ? "fill-green-100" : ""}`} />
                                            Minimal 8 karakter
                                        </div>
                                        <div className={`flex items-center gap-2 text-xs ${hasUpperCase ? "text-green-600" : "text-gray-400"}`}>
                                            <CheckCircle2 className={`w-3.5 h-3.5 ${hasUpperCase ? "fill-green-100" : ""}`} />
                                            Mengandung huruf besar
                                        </div>
                                        <div className={`flex items-center gap-2 text-xs ${hasNumber ? "text-green-600" : "text-gray-400"}`}>
                                            <CheckCircle2 className={`w-3.5 h-3.5 ${hasNumber ? "fill-green-100" : ""}`} />
                                            Mengandung angka
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                                    Konfirmasi Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Ulangi password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`h-12 pl-10 pr-10 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 ${confirmPassword.length > 0 && !passwordsMatch ? "border-red-300 focus:border-red-400" : ""
                                            }`}
                                        required
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {confirmPassword.length > 0 && !passwordsMatch && (
                                    <p className="text-xs text-red-500">Password tidak cocok</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-orange-400 hover:from-orange-500 hover:to-orange-400 text-white font-semibold shadow-lg shadow-orange-200/50 transition-all duration-200"
                                disabled={isLoading || !passwordsMatch || !hasMinLength || !hasUpperCase || !hasNumber}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Memproses...
                                    </>
                                ) : (
                                    "Daftar Sekarang"
                                )}
                            </Button>
                        </form>

                        {/* Login Link */}
                        <p className="text-center text-gray-500 pt-2">
                            Sudah punya akun?{" "}
                            <Link href="/login" className="text-primary hover:text-orange-600 font-semibold transition-colors">
                                Masuk
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
