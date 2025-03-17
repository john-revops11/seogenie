
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, FileText, Settings, History, Globe, LayoutDashboard } from "lucide-react";

export const TabNavigation = () => {
  return (
    <TabsList className="grid grid-cols-6 w-full max-w-md">
      <TabsTrigger value="dashboard" className="flex items-center gap-2">
        <LayoutDashboard className="w-4 h-4" /> Dashboard
      </TabsTrigger>
      <TabsTrigger value="domain-analysis" className="flex items-center gap-2">
        <BarChart2 className="w-4 h-4" /> Domain Analysis
      </TabsTrigger>
      <TabsTrigger value="dataforseo" className="flex items-center gap-2">
        <Globe className="w-4 h-4" /> DataForSEO
      </TabsTrigger>
      <TabsTrigger value="content" className="flex items-center gap-2">
        <FileText className="w-4 h-4" /> Content
      </TabsTrigger>
      <TabsTrigger value="history" className="flex items-center gap-2">
        <History className="w-4 h-4" /> History
      </TabsTrigger>
      <TabsTrigger value="settings" className="flex items-center gap-2">
        <Settings className="w-4 h-4" /> Settings
      </TabsTrigger>
    </TabsList>
  );
};
