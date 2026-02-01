import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import {
    User as FirebaseUser,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import type { User } from "@shared/schema";

interface AuthContextType {
    // Firebase user
    firebaseUser: FirebaseUser | null;
    // App user with role
    user: User | null;
    // Loading state
    loading: boolean;
    // Auth methods
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, displayName: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    // Role helpers
    isAdmin: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch or create user profile from backend
    const fetchOrCreateUserProfile = useCallback(async (fbUser: FirebaseUser): Promise<User | null> => {
        try {
            const idToken = await fbUser.getIdToken();

            // Try to get existing profile
            const response = await fetch("/api/auth/profile", {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log("✅ Fetched user profile:", data.user?.email);
                return data.user;
            }

            // If not found, create new profile
            if (response.status === 404) {
                console.log("📝 Creating new user profile...");
                const createResponse = await fetch("/api/auth/profile", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${idToken}`,
                    },
                    body: JSON.stringify({
                        displayName: fbUser.displayName,
                        photoURL: fbUser.photoURL,
                    }),
                });

                if (createResponse.ok) {
                    const data = await createResponse.json();
                    console.log("✅ Created user profile:", data.user?.email);
                    return data.user;
                } else {
                    console.error("❌ Failed to create profile:", createResponse.status);
                }
            }

            return null;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            return null;
        }
    }, []);

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            console.log("🔄 Auth state changed:", fbUser?.email || "null");
            setFirebaseUser(fbUser);

            if (fbUser) {
                setLoading(true);
                const userProfile = await fetchOrCreateUserProfile(fbUser);
                setUser(userProfile);
                setLoading(false);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [fetchOrCreateUserProfile]);

    // Login with email/password
    const login = async (email: string, password: string) => {
        // Don't set loading here - let onAuthStateChanged handle it
        await signInWithEmailAndPassword(auth, email, password);
    };

    // Register with email/password
    const register = async (email: string, password: string, displayName: string) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Update display name
        await updateProfile(result.user, { displayName });
        // Force refresh to trigger onAuthStateChanged with updated profile
        await result.user.reload();
    };

    // Login with Google
    const loginWithGoogle = async () => {
        await signInWithPopup(auth, googleProvider);
    };

    // Logout
    const logout = async () => {
        await signOut(auth);
        setUser(null);
    };

    // Manual refresh profile
    const refreshProfile = useCallback(async () => {
        if (firebaseUser) {
            const userProfile = await fetchOrCreateUserProfile(firebaseUser);
            setUser(userProfile);
        }
    }, [firebaseUser, fetchOrCreateUserProfile]);

    const value: AuthContextType = {
        firebaseUser,
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshProfile,
        isAdmin: user?.role === "admin",
        isAuthenticated: !!firebaseUser && !!user, // Need both Firebase user AND profile
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
