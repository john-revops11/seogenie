
import { toast } from "sonner";
import { validateUrl, formatUrl } from "./domainUtils";

/**
 * Hook for domain management actions
 */
export function useDomainActions(
  mainDomain: string,
  setMainDomain: (value: string) => void,
  competitorDomains: string[],
  setCompetitorDomains: (domains: string[]) => void,
  isAnalyzing: boolean
) {
  const onMainDomainChange = (value: string) => {
    if (isAnalyzing) return;
    setMainDomain(value);
  };

  const onAddCompetitorDomain = () => {
    if (isAnalyzing) return;
    setCompetitorDomains([...competitorDomains, ""]);
  };

  const onRemoveCompetitorDomain = (index: number) => {
    if (isAnalyzing) return;
    const newDomains = [...competitorDomains];
    newDomains.splice(index, 1);
    setCompetitorDomains(newDomains);
  };

  const onUpdateCompetitorDomain = (index: number, value: string) => {
    if (isAnalyzing) return;
    const newDomains = [...competitorDomains];
    newDomains[index] = value;
    setCompetitorDomains(newDomains);
  };

  const removeCompetitorFromAnalysis = (competitorToRemove: string) => {
    if (isAnalyzing) {
      toast.error("Cannot remove competitors during analysis");
      return;
    }

    const updatedCompetitors = competitorDomains.filter(
      domain => domain.toLowerCase() !== competitorToRemove.toLowerCase()
    );
    
    if (updatedCompetitors.length === competitorDomains.length) {
      toast.error(`Could not find competitor ${competitorToRemove} to remove`);
      return;
    }
    
    setCompetitorDomains(updatedCompetitors);
    
    try {
      const savedData = localStorage.getItem('seoAnalysisData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        parsedData.competitorDomains = updatedCompetitors;
        localStorage.setItem('seoAnalysisData', JSON.stringify(parsedData));
      }
    } catch (error) {
      console.error("Error updating saved analysis:", error);
    }
    
    toast.success(`Removed ${competitorToRemove} from competitors`);
  };

  const handleAddCompetitorFromTable = (newCompetitor: string) => {
    if (isAnalyzing) return;
    
    const normalizedNewCompetitor = newCompetitor.trim().toLowerCase();
    
    const exists = competitorDomains.some(domain => 
      domain.trim().toLowerCase() === normalizedNewCompetitor
    );
    
    if (exists) {
      toast.error("This competitor is already in your analysis");
      return;
    }
    
    setCompetitorDomains(prev => [...prev.filter(domain => domain.trim() !== ""), newCompetitor]);
    toast.success(`Added ${normalizedNewCompetitor} to competitors list`);
  };

  return {
    onMainDomainChange,
    onAddCompetitorDomain,
    onRemoveCompetitorDomain,
    onUpdateCompetitorDomain,
    removeCompetitorFromAnalysis,
    handleAddCompetitorFromTable,
    validateUrl,
    formatUrl
  };
}
