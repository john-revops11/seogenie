
import { useState } from "react";
import { DataForSEOAnalysisResult } from "@/components/dataforseo/types";

export function useDataForSEO() {
  const [dataForSEOAnalysisData, setDataForSEOAnalysisData] = useState<DataForSEOAnalysisResult | null>(null);
  const [dataForSEODomain, setDataForSEODomain] = useState("example.com");

  // Functions to handle DataForSEO API requests could be added here

  return {
    dataForSEOAnalysisData,
    dataForSEODomain,
    setDataForSEOAnalysisData,
    setDataForSEODomain
  };
}
