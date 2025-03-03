
import { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="fixed inset-0 bg-grid-black/[0.02] -z-10"></div>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        {children}
      </ErrorBoundary>
    </div>
  );
};

export default Layout;
