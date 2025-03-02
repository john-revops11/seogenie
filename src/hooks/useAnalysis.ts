
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { analyzeDomains } from "@/services/keywordService";

export const useAnalysis = () => {
  const [mainDomain, setMainDomain] = useState("");
  const [competitorDomains, setCompetitorDomains] = useState<string[]>([""]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [keywordData, setKeywordData] = useState<any[]>([]);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    setAnalysisError(null);
  }, []);
  
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

  const validateUrl = (url: string) => {
    if (!url) return false;
    
    let processedUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      processedUrl = 'https://' + url;
    }
    
    try {
      new URL(processedUrl);
      return true;
    } catch (e) {
      return false;
    }
  };

  const formatUrl = (url: string) => {
    if (!url) return "";
    
    if (!/^https?:\/\//i.test(url)) {
      return 'https://' + url;
    }
    return url;
  };

  const handleReset = () => {
    setAnalysisError(null);
    setProgress(0);
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    setKeywordData([]);
    setMainDomain("");
    setCompetitorDomains([""]);
    
    localStorage.removeItem('seoAnalysisData');
    localStorage.removeItem('dataForSeoErrors');
    localStorage.removeItem('openAiErrors');
    localStorage.removeItem('googleKeywordErrors');
    
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
    setProgress(0);
    setKeywordData([]);
    setAnalysisComplete(false);
    
    console.info("Analyzing domains:", formattedMainDomain, formattedCompetitorDomains);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        if (newProgress >= 95) {
          clearInterval(interval);
          return 95;
        }
        return newProgress;
      });
    }, 800);
    
    try {
      const result = await analyzeDomains(formattedMainDomain, formattedCompetitorDomains);
      
      if (result.success) {
        const keywords = Array.isArray(result.keywords) ? result.keywords : [];
        setKeywordData(keywords);
        setProgress(100);
        
        localStorage.removeItem('dataForSeoErrors');
        localStorage.removeItem('openAiErrors');
        localStorage.removeItem('googleKeywordErrors');
        
        setTimeout(() => {
          setIsAnalyzing(false);
          setAnalysisComplete(true);
          toast.success("Analysis complete! View your results in the dashboard.");
        }, 500);
      } else {
        throw new Error("Analysis failed");
      }
    } catch (error) {
      clearInterval(interval);
      setIsAnalyzing(false);
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setAnalysisError(errorMessage);
      
      if (errorMessage.includes("DataForSEO")) {
        localStorage.setItem('dataForSeoErrors', errorMessage);
      }
      if (errorMessage.includes("OpenAI")) {
        localStorage.setItem('openAiErrors', errorMessage);
      }
      if (errorMessage.includes("Google")) {
        localStorage.setItem('googleKeywordErrors', errorMessage);
      }
      
      toast.error(`Analysis failed: ${errorMessage}`);
      setProgress(0);
    }
  };

  const getValidCompetitorDomains = () => competitorDomains.filter(domain => domain && domain.trim() !== "");

  return {
    mainDomain,
    setMainDomain,
    competitorDomains,
    setCompetitorDomains,
    isAnalyzing,
    progress,
    analysisComplete,
    keywordData,
    analysisError,
    handleReset,
    handleAnalyze,
    getValidCompetitorDomains
  };
};
