
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { fetchDomainKeywords } from "@/services/keywordService";
import { extractDomainName } from "./utils";

interface CompetitorManagementProps {
  domain: string;
  competitorDomains: string[];
  onAddCompetitor: (newCompetitor: string) => void;
  onRemoveCompetitor: (competitorToRemove: string) => void;
  isLoading: boolean;
}

const CompetitorManagement = ({
  domain,
  competitorDomains,
  onAddCompetitor,
  onRemoveCompetitor,
  isLoading
}: CompetitorManagementProps) => {
  const [newCompetitor, setNewCompetitor] = useState("");
  const [showCompetitorInput, setShowCompetitorInput] = useState(false);
  const [loadingCompetitor, setLoadingCompetitor] = useState(false);

  const handleAddCompetitor = () => {
    setShowCompetitorInput(true);
  };

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    
    try {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        new URL(url);
        return true;
      }
      
      new URL(`https://${url}`);
      return true;
    } catch (e) {
      return false;
    }
  };

  const confirmAddCompetitor = async () => {
    if (!newCompetitor.trim()) {
      toast.error("Please enter a competitor domain");
      return;
    }
    
    if (!validateUrl(newCompetitor)) {
      toast.error("Please enter a valid URL");
      return;
    }
    
    const normalizedNewCompetitor = extractDomainName(newCompetitor);
    const exists = competitorDomains.some(domain => 
      extractDomainName(domain) === normalizedNewCompetitor
    );
    
    if (exists) {
      toast.error("This competitor is already in your analysis");
      return;
    }
    
    let formattedUrl = newCompetitor;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    setLoadingCompetitor(true);
    
    try {
      toast.info(`Fetching keywords for ${formattedUrl}...`);
      await fetchDomainKeywords(formattedUrl);
      
      onAddCompetitor(formattedUrl);
      
      toast.success(`Added ${normalizedNewCompetitor} to competitors list`);
    } catch (error) {
      console.error("Error fetching competitor keywords:", error);
      toast.warning(`Added ${normalizedNewCompetitor} but couldn't fetch keywords. Will use sample data.`);
      
      onAddCompetitor(formattedUrl);
    } finally {
      setLoadingCompetitor(false);
      setNewCompetitor("");
      setShowCompetitorInput(false);
    }
  };

  const cancelAddCompetitor = () => {
    setNewCompetitor("");
    setShowCompetitorInput(false);
  };

  const handleRemoveCompetitor = (competitor: string) => {
    if (isLoading) {
      toast.error("Cannot remove competitors during analysis");
      return;
    }
    
    onRemoveCompetitor(competitor);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="transition-all border-revology/30 text-revology hover:text-revology hover:bg-revology-light/50"
        onClick={handleAddCompetitor}
        disabled={isLoading || showCompetitorInput || loadingCompetitor}
      >
        {loadingCompetitor ? (
          <>
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            <PlusCircle className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Add Competitor</span>
          </>
        )}
      </Button>
      
      {showCompetitorInput && (
        <div className="mt-4 flex items-center gap-2 animate-fade-down">
          <Input
            placeholder="competitor.com"
            value={newCompetitor}
            onChange={(e) => setNewCompetitor(e.target.value)}
            className="transition-all"
            autoFocus
          />
          <Button 
            variant="default" 
            size="sm" 
            onClick={confirmAddCompetitor}
            className="bg-revology hover:bg-revology-dark whitespace-nowrap"
            disabled={loadingCompetitor}
          >
            {loadingCompetitor ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : "Add"}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={cancelAddCompetitor}
            disabled={loadingCompetitor}
          >
            Cancel
          </Button>
        </div>
      )}
      
      {competitorDomains.length > 0 && (
        <div className="mt-4">
          <div className="text-sm text-muted-foreground mb-2">Competitors:</div>
          <div className="flex flex-wrap gap-2">
            {competitorDomains.map((competitor, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1 px-3 py-1">
                {extractDomainName(competitor)}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 text-muted-foreground hover:text-destructive p-0"
                  onClick={() => handleRemoveCompetitor(competitor)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default CompetitorManagement;
