
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
      
      // Construct the proper Supabase Edge Function URL
      // Format should be: https://<project-id>.supabase.co/functions/v1/dataforseo
      const supabaseProjectId = 'rgtptfhlkplnahzehpci';
      const endpoint = `https://${supabaseProjectId}.supabase.co/functions/v1/dataforseo`;
      
      console.log(`Calling DataForSEO API endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint, {
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

      // Check if response.ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`DataForSEO API error (${response.status}):`, errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText || 'No response from server'}`);
      }

      // Check for empty response before parsing
      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty response received from server');
      }

      // Parse the JSON from text after validation
      const data = JSON.parse(responseText);
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
