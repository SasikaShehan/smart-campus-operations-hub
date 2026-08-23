import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth, Role } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import FacilitiesPage from "@/pages/FacilitiesPage";
import BookingsPage from "@/pages/BookingsPage";
import TicketsPage from "@/pages/TicketsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import CheckInPage from "@/pages/CheckInPage";
import UserManagementPage from "@/pages/UserManagementPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

// Guard for role-restricted routes
function RoleRoute({
  element,
  allowedRoles,
}: {
  element: JSX.Element;
  allowedRoles: Role[];
}) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return element;
}

function AuthGate() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }
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
              {/* All authenticated roles */}
              <Route path="/" element={<DashboardPage />} />
              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />

              {/* Student + Lecturer + Manager + Admin */}
              <Route
                path="/facilities"
                element={
                  <RoleRoute
                    allowedRoles={["ADMIN", "MANAGER", "STUDENT", "LECTURER"]}
                    element={<FacilitiesPage />}
                  />
                }
              />
              <Route
                path="/bookings"
                element={
                  <RoleRoute
                    allowedRoles={["ADMIN", "MANAGER", "STUDENT", "LECTURER"]}
                    element={<BookingsPage />}
                  />
                }
              />

              {/* Admin + Manager only */}
              <Route
                path="/analytics"
                element={
                  <RoleRoute
                    allowedRoles={["ADMIN", "MANAGER"]}
                    element={<AnalyticsPage />}
                  />
                }
              />

              {/* Admin + Manager + Technician only */}
              <Route
                path="/check-in"
                element={
                  <RoleRoute
                    allowedRoles={["ADMIN", "MANAGER", "TECHNICIAN"]}
                    element={<CheckInPage />}
                  />
                }
              />

              {/* ADMIN only */}
              <Route
                path="/users"
                element={
                  <RoleRoute
                    allowedRoles={["ADMIN"]}
                    element={<UserManagementPage />}
                  />
                }
              />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
