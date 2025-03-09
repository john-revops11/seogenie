
import { useState } from "react";
import { toast } from "sonner";
import { analyzeDomains } from "@/services/keywords/domainAnalysis";
import { validateUrl, formatUrl } from "./domainUtils";

/**
 * Hook for domain analysis actions
 */
export function useAnalysisActions(
  mainDomain: string,
  competitorDomains: string[],
  setIsAnalyzing: (value: boolean) => void,
  setProgress: (value: number) => void,
  setKeywordData: (data: any[]) => void,
  setAnalysisComplete: (value: boolean) => void,
  setAnalysisError: (error: string | null) => void,
  setMainDomain: (value: string) => void,
  setCompetitorDomains: (domains: string[]) => void
) {
  const handleReset = () => {
    setAnalysisError(null);
    setProgress(0);
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    setKeywordData([]);
    setMainDomain("");
    setCompetitorDomains([""]);
    
    localStorage.removeItem('seoAnalysisData');
    
    toast.success("Analysis data has been reset");
  };

  const handleAnalyze = async () => {
    setAnalysisError(null);
    
    if (!mainDomain || !validateUrl(mainDomain)) {
      toast.error("Please enter a valid main domain");
      return;
    }
    
    const validCompetitorDomains = competitorDomains.filter(domain => domain.trim() !== "");
    
    if (validCompetitorDomains.length === 0) {
      toast.error("Please add at least one competitor domain");
      return;
    }
    
    if (validCompetitorDomains.some(domain => !validateUrl(domain))) {
      toast.error("Please enter valid competitor domains");
      return;
    }
    
    const formattedMainDomain = formatUrl(mainDomain);
    const formattedCompetitorDomains = validCompetitorDomains.map(formatUrl);
    
    setIsAnalyzing(true);
    setProgress(10);
    setKeywordData([]);
    setAnalysisComplete(false);
    
    console.info("Analyzing domains:", formattedMainDomain, formattedCompetitorDomains);
    
    try {
      // Set progress indicators manually
      setTimeout(() => setProgress(30), 500);
      setTimeout(() => setProgress(60), 1500);
      
      const result = await analyzeDomains(formattedMainDomain, formattedCompetitorDomains);
      
      if (result.success) {
        const keywords = Array.isArray(result.keywords) ? result.keywords : [];
        setKeywordData(keywords);
        setProgress(100);
        
        setTimeout(() => {
          setIsAnalyzing(false);
          setAnalysisComplete(true);
          toast.success("Analysis complete! View your results in the dashboard.");
        }, 500);
      } else {
        // Handle case where result.error might not exist
        const errorMessage = result.error || "Analysis failed with unknown error";
        throw new Error(errorMessage);
      }
    } catch (error) {
      setIsAnalyzing(false);
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Analysis error:", errorMessage);
      setAnalysisError(errorMessage);
      toast.error(`Analysis failed: ${errorMessage}`);
      setProgress(0);
    }
  };

  return {
    handleReset,
    handleAnalyze
  };
}
