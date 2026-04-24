import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import NewDelivery from "./pages/NewDelivery";
import EditDelivery from "./pages/EditDelivery";
import DeliveryDetail from "./pages/DeliveryDetail";
import Drivers from "./pages/Drivers";
import NewDriver from "./pages/NewDriver";
import Login from "./pages/Login";

function Router() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");

  useEffect(() => {
    const handleStorageChange = () => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(loggedIn);
    };

    // Ouvir mudanças no localStorage (funciona em abas diferentes)
    window.addEventListener("storage", handleStorageChange);

    // Também ouvir mudanças locais (mesma aba)
    window.addEventListener("isLoggedInChanged", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("isLoggedInChanged", handleStorageChange);
    };
  }, []);

  return (
    <Switch>
      <Route path="/login" component={Login} />
      {isLoggedIn ? (
        <>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/new-delivery" component={NewDelivery} />
          <Route path="/edit-delivery/:id" component={EditDelivery} />
          <Route path="/delivery/:id" component={DeliveryDetail} />
          <Route path="/drivers" component={Drivers} />
          <Route path="/new-driver" component={NewDriver} />
        </>
      ) : null}
      <Route path="/404" component={NotFound} />
      <Route component={isLoggedIn ? NotFound : Login} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
