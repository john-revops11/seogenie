
import { useState, useEffect } from "react";

/**
 * Hook for managing domain analysis state
 */
export function useAnalysisState() {
  const [mainDomain, setMainDomain] = useState("");
  const [competitorDomains, setCompetitorDomains] = useState<string[]>([""]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [keywordData, setKeywordData] = useState<any[]>([]);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Load saved analysis from localStorage on mount
  useEffect(() => {
    try {
      const savedAnalysis = localStorage.getItem('seoAnalysisData');
      if (savedAnalysis) {
        const parsedData = JSON.parse(savedAnalysis);
        
        if (parsedData.mainDomain) setMainDomain(parsedData.mainDomain);
        if (Array.isArray(parsedData.competitorDomains)) setCompetitorDomains(parsedData.competitorDomains);
        if (Array.isArray(parsedData.keywordData)) {
          setKeywordData(parsedData.keywordData);
          setAnalysisComplete(true);
        }
      }
    } catch (error) {
      console.error("Error loading saved analysis:", error);
    }
  }, []);

  // Save analysis to localStorage when complete
  useEffect(() => {
    if (analysisComplete && keywordData.length > 0) {
      try {
        const dataToSave = {
          mainDomain,
          competitorDomains,
          keywordData,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('seoAnalysisData', JSON.stringify(dataToSave));
        console.log("Analysis data saved to localStorage");
      } catch (error) {
        console.error("Error saving analysis data:", error);
      }
    }
  }, [mainDomain, competitorDomains, keywordData, analysisComplete]);

  return {
    mainDomain, setMainDomain,
    competitorDomains, setCompetitorDomains,
    isAnalyzing, setIsAnalyzing,
    progress, setProgress,
    analysisComplete, setAnalysisComplete,
    keywordData, setKeywordData,
    analysisError, setAnalysisError
  };
}
