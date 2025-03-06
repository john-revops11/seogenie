
import { useState } from "react";
import { toast } from "sonner";
import { DataForSEOAnalysisResult } from "@/components/dataforseo/types";

export function useDataForSEO() {
  const [dataForSEOAnalysisData, setDataForSEOAnalysisData] = useState<DataForSEOAnalysisResult | null>(null);
  const [dataForSEODomain, setDataForSEODomain] = useState("example.com");
  const [isDataForSEOLoading, setIsDataForSEOLoading] = useState(false);

  const analyzeWithDataForSEO = async (domain: string, keywords: string[] = []) => {
    if (!domain) {
      toast.error("Please enter a domain to analyze");
      return;
    }

    try {
      setIsDataForSEOLoading(true);
      setDataForSEODomain(domain);
      
      // Use the Supabase edge function to fetch DataForSEO data
      const response = await fetch('/api/dataforseo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'full_analysis',
          domain: domain,
          keywords: keywords.length > 0 ? keywords : [
            "pricing strategy", 
            "revenue growth", 
            "data analytics", 
            "business intelligence",
            "pricing analytics"
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze domain with DataForSEO');
      }

      const data = await response.json();
      setDataForSEOAnalysisData(data);
      toast.success(`Successfully analyzed ${domain} with DataForSEO`);
    } catch (error) {
      console.error("Error analyzing domain with DataForSEO:", error);
      toast.error(`Error analyzing domain: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDataForSEOLoading(false);
    }
  };

  return {
    dataForSEOAnalysisData,
    dataForSEODomain,
    isDataForSEOLoading,
    setDataForSEOAnalysisData,
    setDataForSEODomain,
    analyzeWithDataForSEO
  };
}
