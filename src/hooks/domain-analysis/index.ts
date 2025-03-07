
import { useAnalysisState } from "./useAnalysisState";
import { useDomainActions } from "./useDomainActions";
import { useAnalysisActions } from "./useAnalysisActions";

/**
 * Main hook for domain analysis functionality
 */
export function useDomainAnalysis() {
  const {
    mainDomain, setMainDomain,
    competitorDomains, setCompetitorDomains,
    isAnalyzing, setIsAnalyzing,
    progress, setProgress,
    analysisComplete, setAnalysisComplete,
    keywordData, setKeywordData,
    analysisError, setAnalysisError
  } = useAnalysisState();

  const {
    onMainDomainChange,
    onAddCompetitorDomain,
    onRemoveCompetitorDomain,
    onUpdateCompetitorDomain,
    removeCompetitorFromAnalysis,
    handleAddCompetitorFromTable
  } = useDomainActions(
    mainDomain,
    setMainDomain,
    competitorDomains,
    setCompetitorDomains,
    isAnalyzing
  );

  const {
    handleReset,
    handleAnalyze
  } = useAnalysisActions(
    mainDomain,
    competitorDomains,
    setIsAnalyzing,
    setProgress,
    setKeywordData,
    setAnalysisComplete,
    setAnalysisError,
    setMainDomain,
    setCompetitorDomains
  );

  return {
    // State
    mainDomain,
    competitorDomains,
    isAnalyzing,
    progress,
    analysisComplete,
    keywordData,
    analysisError,
    
    // State setters
    setMainDomain,
    setAnalysisError,
    
    // Domain actions
    onMainDomainChange,
    onAddCompetitorDomain,
    onRemoveCompetitorDomain,
    onUpdateCompetitorDomain,
    
    // Analysis actions
    handleReset,
    handleAnalyze,
    handleAddCompetitorFromTable,
    removeCompetitorFromAnalysis
  };
}

// Export as default for import compatibility
export default useDomainAnalysis;
