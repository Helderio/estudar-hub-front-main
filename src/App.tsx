import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProjectDetails from "./pages/ProjectDetails";
import CreateProject from "./pages/CreateProject";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Events from "./pages/Events";
import CreateEvent from "./pages/CreateEvent";
import Invitations from "./pages/Invitations";
import Institutions from "./pages/Institutions";
import InstitutionDetails from "./pages/InstitutionDetails";
import Chat from "./pages/Chat";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPlaceholder from "./pages/admin/AdminPlaceholder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route element={<AuthLayout />}>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Route>
    <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects/:id" element={<ProjectDetails />} />
      <Route path="/create-project" element={<CreateProject />} />
      <Route path="/profile/:id" element={<Profile />} />
      <Route path="/edit-profile" element={<EditProfile />} />
      <Route path="/events" element={<Events />} />
      <Route path="/create-event" element={<CreateEvent />} />
      <Route path="/invitations" element={<Invitations />} />
      <Route path="/institutions" element={<Institutions />} />
      <Route path="/institutions/:id" element={<InstitutionDetails />} />
      <Route path="/chat" element={<Chat />} />
    </Route>
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<AdminDashboard />} />
      <Route path="analytics" element={<AdminPlaceholder />} />
      <Route path="users" element={<AdminPlaceholder />} />
      <Route path="projects" element={<AdminPlaceholder />} />
      <Route path="institutions" element={<AdminPlaceholder />} />
      <Route path="events" element={<AdminPlaceholder />} />
      <Route path="categories" element={<AdminPlaceholder />} />
      <Route path="rankings" element={<AdminPlaceholder />} />
      <Route path="settings" element={<AdminPlaceholder />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
