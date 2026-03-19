import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import { Route, Switch } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DiagnosisProvider } from "./contexts/DiagnosisContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Diagnosis from "./pages/Diagnosis";
import Result from "./pages/Result";
import TypeDetail from "./pages/TypeDetail";

function RootPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="animate-pulse rounded-2xl border border-border bg-card px-10 py-8 text-center">
          <p className="text-lg font-semibold">読み込み中…</p>
          <p className="mt-2 text-sm text-muted-foreground">少々お待ちください。</p>
        </div>
      </div>
    );
  }

  return user ? <Home /> : <Login />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={RootPage} />
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
        defaultTheme="light"
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
