import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import FacilitiesPage from "@/pages/FacilitiesPage";
import BookingsPage from "@/pages/BookingsPage";
import TicketsPage from "@/pages/TicketsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import CheckInPage from "@/pages/CheckInPage";
import OAuthSuccess from "@/pages/OAuthSuccess";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function AuthGate() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <LoginPage />;
  return <AppLayout />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AuthGate />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/facilities" element={<FacilitiesPage />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/check-in" element={<CheckInPage />} />
            </Route>
            <Route path="/oauth-success" element={<OAuthSuccess />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
