
import { DomainAnalyticsDashboard } from "@/components/dashboard/DomainAnalyticsDashboard";
import { UserAuthDisplay } from "@/components/dashboard/UserAuthDisplay";
import { AlertMessages } from "@/components/dashboard/AlertMessages";
import { DataForSeoStatusIndicator } from "@/components/dashboard/DataForSeoStatusIndicator";
import SystemHealthCard from "@/components/SystemHealthCard";

export function DashboardTabContent() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start mb-8">
        <UserAuthDisplay />
        <SystemHealthCard />
      </div>
      
      <AlertMessages />
      
      <div className="mb-8">
        <DataForSeoStatusIndicator />
      </div>
      
      <DomainAnalyticsDashboard />
    </div>
  );
}
