import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/useAuth";
import GlobalBackgroundMusic from "@/components/GlobalBackgroundMusic";
import Index from "./pages/Index";
import Meditate from "./pages/Meditate";
import Sounds from "./pages/Sounds";
import Music from "./pages/Music";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <GlobalBackgroundMusic />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/meditate" element={<Meditate />} />
              <Route path="/sounds" element={<Sounds />} />
              <Route path="/music" element={<Music />} />
              <Route path="/auth" element={<Auth />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
