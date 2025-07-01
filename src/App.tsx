import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TaskProvider } from "@/contexts/TaskContext";
import { FocusProvider } from "@/contexts/FocusContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute, PublicRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";

// Auth Pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import EmailVerification from "@/pages/EmailVerification";

// App Pages
import Dashboard from "@/pages/Dashboard";
import FocusMode from "@/pages/FocusMode";
import Calendar from "@/pages/Calendar";
import Analytics from "@/pages/Analytics";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <TaskProvider>
              <FocusProvider>
                <Routes>
                  {/* Public Routes */}
                  <Route element={<PublicRoute />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-email" element={<EmailVerification />} />
                  </Route>

                  {/* Protected Routes (wrapped in Layout) */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/focus" element={<FocusMode />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/profile" element={<Profile />} />
                    </Route>
                  </Route>

                  {/* Catch All */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </FocusProvider>
            </TaskProvider>
          </AuthProvider>
          <Toaster />
          <Sonner />
        </ThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
