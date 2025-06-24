import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/AuthGuard";
import Login from "@/pages/Login";
import ChooseTemplate from "@/pages/ChooseTemplate";
import Dashboard from "@/pages/Dashboard";
import AddIntern from "@/pages/AddIntern";
import VerifyCertificate from "@/pages/VerifyCertificate";
import FirebaseSetup from "@/pages/FirebaseSetup";
import NotFound from "@/pages/not-found";
import { auth } from "@/lib/firebase";

function AppRoutes() {
  const { user, userSettings, loading } = useAuth();

  // Show Firebase setup if not configured
  if (!auth) {
    return <FirebaseSetup />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/verify/:certificateId" component={VerifyCertificate} />

      {/* Protected Routes */}
      <Route path="/choose-template">
        <AuthGuard fallback={<Login />}>
          {userSettings?.setupCompleted ? (
            <Dashboard />
          ) : (
            <ChooseTemplate />
          )}
        </AuthGuard>
      </Route>

      <Route path="/dashboard">
        <AuthGuard requireSetup fallback={
          user ? <ChooseTemplate /> : <Login />
        }>
          <Dashboard />
        </AuthGuard>
      </Route>

      <Route path="/add-intern">
        <AuthGuard requireSetup fallback={
          user ? <ChooseTemplate /> : <Login />
        }>
          <AddIntern />
        </AuthGuard>
      </Route>

      <Route path="/">
        {user ? (
          userSettings?.setupCompleted ? (
            <Dashboard />
          ) : (
            <ChooseTemplate />
          )
        ) : (
          <Login />
        )}
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AppRoutes />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
