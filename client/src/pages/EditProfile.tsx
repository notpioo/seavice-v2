import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Camera, Loader2, Save, User as UserIcon, Phone, MapPin, Mail } from "lucide-react";

export default function EditProfile() {
    const { user, firebaseUser, isAdmin, refreshProfile } = useAuth();
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    // Form states
    const [displayName, setDisplayName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    // File input ref
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || "");
            setPhone(user.phone || "");
            setAddress(user.address || "");
        }
    }, [user]);

    // Get initials
    const getInitials = (name: string | null | undefined) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Handle avatar upload
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File terlalu besar",
                description: "Maksimal 5MB",
                variant: "destructive",
            });
            return;
        }

        setIsUploadingAvatar(true);
        try {
            const formData = new FormData();
            formData.append("image", file);

            const token = await firebaseUser?.getIdToken();
            const res = await fetch("/api/upload/avatar", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            toast({
                title: "Foto berhasil diperbarui",
                description: "Foto profil Anda telah diganti",
            });

            // Refresh profile data
            await refreshProfile();
        } catch (error) {
            console.error("Upload avatar error:", error);
            toast({
                title: "Gagal upload",
                description: "Terjadi kesalahan saat mengupload foto",
                variant: "destructive",
            });
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    // Handle save profile
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = await firebaseUser?.getIdToken();
            const res = await fetch("/api/auth/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    displayName,
                    phone,
                    address,
                }),
            });

            if (!res.ok) throw new Error("Update failed");

            // Also update Firebase auth profile displayName if changed
            /* 
            // Note: This is usually handled by backend or separate call if needed, 
            // but for now we rely on our backend sync.
            */

            toast({
                title: "Profil disimpan",
                description: "Perubahan berhasil disimpan",
            });

            // Refresh profile data
            await refreshProfile();

            // Redirect back to profile after short delay
            setTimeout(() => setLocation("/profile"), 500);

        } catch (error) {
            console.error("Save profile error:", error);
            toast({
                title: "Gagal menyimpan",
                description: "Terjadi kesalahan saat menyimpan profil",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <Navbar />

            <div className="container mx-auto px-4 lg:px-8 py-6 max-w-2xl">
                {/* Back Button */}
                <Link href="/profile">
                    <Button variant="ghost" className="mb-4 gap-2 text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="w-4 h-4" />
                        Kembali
                    </Button>
                </Link>

                <Card className="shadow-lg border-0">
                    <CardHeader className="border-b border-gray-100 bg-white">
                        <CardTitle className="text-xl font-bold text-gray-900">Edit Profile</CardTitle>
                    </CardHeader>

                    <CardContent className="p-6">
                        <form onSubmit={handleSave} className="space-y-8">

                            {/* Avatar Section */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                                    <Avatar className="w-28 h-28 border-4 border-white shadow-lg">
                                        <AvatarImage src={user?.photoURL || undefined} className="object-cover" />
                                        <AvatarFallback className="bg-gradient-to-br from-primary to-orange-400 text-white text-3xl font-bold">
                                            {getInitials(user?.displayName)}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Edit Overlay */}
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>

                                    {/* Loading Overlay */}
                                    {isUploadingAvatar && (
                                        <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500">Klik foto untuk mengganti</p>
                                <input
                                    type="file"
                                    ref={avatarInputRef}
                                    onChange={handleAvatarUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>

                            <div className="space-y-4">
                                {/* Display Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="displayName" className="flex items-center gap-2">
                                        <UserIcon className="w-4 h-4 text-gray-500" />
                                        Nama Lengkap
                                    </Label>
                                    <Input
                                        id="displayName"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Masukkan nama lengkap"
                                        className="bg-gray-50/50"
                                    />
                                </div>

                                {/* Email (Read-only) */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-gray-400">
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </Label>
                                    <Input
                                        value={user?.email}
                                        disabled
                                        className="bg-gray-100 text-gray-500 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-400">Email tidak dapat diubah</p>
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        Nomor HP
                                    </Label>
                                    <Input
                                        id="phone"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="08xxxxxxxxxx"
                                        type="tel"
                                        className="bg-gray-50/50"
                                    />
                                </div>

                                {/* Address */}
                                <div className="space-y-2">
                                    <Label htmlFor="address" className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        Alamat
                                    </Label>
                                    <Input
                                        id="address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Masukkan alamat lengkap"
                                        className="bg-gray-50/50"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <Button
                                    type="submit"
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                                    disabled={isLoading || isUploadingAvatar}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Simpan Perubahan
                                        </>
                                    )}
                                </Button>
                            </div>

                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
