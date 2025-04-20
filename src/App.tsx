import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import Index from "@/pages/Index";
import Attendance from "@/pages/Attendance";
import LiveFeed from "@/pages/LiveFeed";
import GPS from "@/pages/GPS";
import NotFound from "@/pages/NotFound";
import { useState } from "react";

// In a real application, you would have a proper authentication system
// This is a simple mock for demonstration purposes
const useAuth = () => {
  // Check if user is authenticated (in a real app, this would validate tokens, etc.)
  const [isAuthenticated] = useState(localStorage.getItem("isAuthenticated") === "true");
  
  const login = () => {
    localStorage.setItem("isAuthenticated", "true");
    window.location.href = "/";
  };
  
  const logout = () => {
    localStorage.setItem("isAuthenticated", "false");
    window.location.href = "/login";
  };
  
  return { isAuthenticated, login, logout };
};

const queryClient = new QueryClient();

const App = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/" /> : <Login />} 
            />
            <Route 
              path="/" 
              element={isAuthenticated ? <Index /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/attendance" 
              element={isAuthenticated ? <Attendance /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/live-feed" 
              element={isAuthenticated ? <LiveFeed /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/gps" 
              element={isAuthenticated ? <GPS /> : <Navigate to="/login" />} 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
