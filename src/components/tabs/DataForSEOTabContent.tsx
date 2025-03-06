
import DataForSEODashboard from "@/components/dataforseo/DataForSEODashboard";
import { DataForSEOAnalysisResult } from "@/components/dataforseo/types";

interface DataForSEOTabContentProps {
  analysisData: DataForSEOAnalysisResult | null;
  domain: string;
}

export const DataForSEOTabContent = ({ 
  analysisData, 
  domain 
}: DataForSEOTabContentProps) => {
  return (
    <DataForSEODashboard 
      analysisData={analysisData} 
      domain={domain} 
    />
  );
};
