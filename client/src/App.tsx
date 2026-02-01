import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import EditProfile from "@/pages/EditProfile";
import PulsaPage from "@/pages/ppob/Pulsa";
import KuotaPage from "@/pages/ppob/Kuota";
import PLNPage from "@/pages/ppob/PLN";
import CheckoutPage from "@/pages/Checkout";
import OrderDetailPage from "@/pages/OrderDetail";
import TransactionsPage from "@/pages/Transactions";
import AdminDashboard from "@/pages/admin/Dashboard";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

// Loading component
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-orange-300 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 animate-pulse">
          S
        </div>
        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
      </div>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

// Guest route wrapper (redirect if already logged in)
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}

// Admin route wrapper
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (!isAdmin) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />

      {/* Auth routes (guest only) */}
      <Route path="/login">
        <GuestRoute>
          <Login />
        </GuestRoute>
      </Route>
      <Route path="/register">
        <GuestRoute>
          <Register />
        </GuestRoute>
      </Route>

      {/* Protected routes */}
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      <Route path="/profile/edit">
        <ProtectedRoute>
          <EditProfile />
        </ProtectedRoute>
      </Route>

      {/* PPOB routes (public, but purchase requires login) */}
      <Route path="/ppob/pulsa" component={PulsaPage} />
      <Route path="/ppob/kuota" component={KuotaPage} />
      <Route path="/ppob/pln" component={PLNPage} />

      {/* Checkout route */}
      <Route path="/checkout">
        <ProtectedRoute>
          <CheckoutPage />
        </ProtectedRoute>
      </Route>

      {/* Order Detail route */}
      <Route path="/orders/:orderId">
        <ProtectedRoute>
          <OrderDetailPage />
        </ProtectedRoute>
      </Route>

      {/* Transactions route */}
      <Route path="/transactions">
        <ProtectedRoute>
          <TransactionsPage />
        </ProtectedRoute>
      </Route>

      {/* Admin routes (future) */}
      {/* Admin routes */}
      <Route path="/admin">
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      </Route>

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
