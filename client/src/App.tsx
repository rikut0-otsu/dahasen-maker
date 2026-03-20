import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import { Route, Switch } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DiagnosisProvider } from "./contexts/DiagnosisContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Diagnosis from "./pages/Diagnosis";
import Result from "./pages/Result";
import TypeDetail from "./pages/TypeDetail";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route
        path="/"
        component={() => (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/types/:typeId"
        component={() => (
          <ProtectedRoute>
            <TypeDetail />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/diagnosis"
        component={() => (
          <ProtectedRoute>
            <Diagnosis />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/result"
        component={() => (
          <ProtectedRoute>
            <Result />
          </ProtectedRoute>
        )}
      />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        switchable={true}
      >
        <AuthProvider>
          <DiagnosisProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </DiagnosisProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
