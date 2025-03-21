
import { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { UserAuthDisplay } from "./dashboard/UserAuthDisplay";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SystemHealthCard from "./SystemHealthCard";

interface LayoutProps {
  children: ReactNode;
}

// Error fallback component
const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <Alert variant="destructive" className="m-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>
        {error.message || "An unexpected error occurred"}
      </AlertDescription>
    </Alert>
  );
};

const Layout = ({ children }: LayoutProps) => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    
    fetchUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="fixed inset-0 bg-grid-black/[0.02] -z-10"></div>
      <div className="flex justify-between items-center p-4">
        <UserAuthDisplay user={user} />
        <SystemHealthCard />
      </div>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        {children}
      </ErrorBoundary>
    </div>
  );
};

export default Layout;
