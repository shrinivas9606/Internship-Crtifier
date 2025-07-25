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
import BulkImport from "@/pages/BulkImport";
import VerifyCertificate from "@/pages/VerifyCertificate";
import FirebaseSetup from "@/pages/FirebaseSetup";
import NotFound from "@/pages/not-found";
import { auth } from "@/lib/firebase";
import InternList from "@/pages/InternList";

function AppRoutes() {
  const { user, userSettings, loading } = useAuth();

  console.log('AppRoutes render - User:', user?.email, 'Settings:', userSettings, 'Loading:', loading);

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
          {user && userSettings ?(
            <Dashboard />
          ) : user ? (
            <ChooseTemplate />
          ) : (
            <Login />
          )}
        </AuthGuard>
      </Route>
      <Route path="/edit-template">
        <AuthGuard fallback={<Login />}>
          {user ? (
            <ChooseTemplate isEditMode={true} />
          ) : (
            <Login />
          )}
        </AuthGuard>
      </Route>

      <Route path="/dashboard">
        <AuthGuard fallback={<Login />}>
          {user && userSettings ? (
            <Dashboard />
          ) : user ? (
            <ChooseTemplate />
          ) : (
            <Login />
          )}
        </AuthGuard>
      </Route>

      <Route path="/add-intern">
        <AuthGuard fallback={<Login />}>
          {user && userSettings ? (
            <AddIntern />
          ) : user ? (
            <ChooseTemplate />
          ) : (
            <Login />
          )}
        </AuthGuard>
      </Route>

      <Route path="/intern-list">
        <AuthGuard fallback={<Login />}>
          {user && userSettings ? (
            <InternList />
          ) : user ? (
            <ChooseTemplate />
          ) : (
            <Login />
          )}
        </AuthGuard>
      </Route>

      <Route path="/bulk-import">
        <AuthGuard fallback={<Login />}>
          {user && userSettings ? (
            <BulkImport />
          ) : user ? (
            <ChooseTemplate />
          ) : (
            <Login />
          )}
        </AuthGuard>
      </Route>

      <Route path="/">
        {user ? (
          userSettings ? (
            <Dashboard />
          ) : (
            <ChooseTemplate />
          )
        ) : (
          <Login />
        )}
      </Route>

      {/* Fallback */}
      <Route>
        <NotFound />
      </Route>
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
