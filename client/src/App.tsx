import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DiagnosisProvider } from "./contexts/DiagnosisContext";
import Home from "./pages/Home";
import Diagnosis from "./pages/Diagnosis";
import Result from "./pages/Result";
import TypeDetail from "./pages/TypeDetail";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/types/:typeId"} component={TypeDetail} />
      <Route path={"/diagnosis"} component={Diagnosis} />
      <Route path={"/result"} component={Result} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      >
        <DiagnosisProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </DiagnosisProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
