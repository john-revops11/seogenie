
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="fixed inset-0 bg-grid-black/[0.02] -z-10"></div>
      {children}
    </div>
  );
};

export default Layout;
