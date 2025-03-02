
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { runRevologySeoActions } from "@/services/keywords/revologySeoStrategy";
import { KeywordResearchProps, ResearchKeyword } from "./types";
import KeywordSearchForm from "./KeywordSearchForm";
import KeywordResultsTable from "./KeywordResultsTable";
import SeoStrategyButton from "./SeoStrategyButton";
import { fetchKeywordsFromOpenAI, prepareContentGeneration } from "./OpenAiKeywordService";

const KeywordResearch = ({ 
  domain, 
  competitorDomains, 
  keywords: existingKeywords, 
  onGenerateContent,
  onRunSeoStrategy
}: KeywordResearchProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const [keywords, setKeywords] = useState<ResearchKeyword[]>([]);
  const [isRunningSeoStrategy, setIsRunningSeoStrategy] = useState(false);

  const handleSearch = async (searchTerm: string) => {
    setIsSearching(true);
    try {
      const keywordResults = await fetchKeywordsFromOpenAI(searchTerm);
      setKeywords(keywordResults);
    } catch (error) {
      console.error("Error researching keywords:", error);
      toast.error(`Research failed: ${(error as Error).message}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGenerateContent = (keyword: string, relatedKeywords: string[]) => {
    prepareContentGeneration(domain, keyword, relatedKeywords);
    
    onGenerateContent(keyword, relatedKeywords);
    
    toast.success(`Preparing to generate content for "${keyword}" - switched to Content tab`);
  };

  const handleRunRevologySeoStrategy = async () => {
    if (!domain || competitorDomains.length === 0 || existingKeywords.length === 0) {
      toast.error("Please run a domain analysis first to collect competitor data");
      return;
    }

    setIsRunningSeoStrategy(true);
    try {
      await runRevologySeoActions(domain, competitorDomains, existingKeywords);
      if (onRunSeoStrategy) {
        onRunSeoStrategy();
      }
    } catch (error) {
      console.error("Error running SEO strategy:", error);
      toast.error(`Failed to run SEO strategy: ${(error as Error).message}`);
    } finally {
      setIsRunningSeoStrategy(false);
    }
  };

  const showSeoStrategyButton = domain && competitorDomains.length > 0 && existingKeywords.length > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Keyword Research</CardTitle>
            <CardDescription>Discover relevant keywords and content opportunities</CardDescription>
          </div>
          {showSeoStrategyButton && (
            <SeoStrategyButton 
              isRunningSeoStrategy={isRunningSeoStrategy} 
              onRunSeoStrategy={handleRunRevologySeoStrategy} 
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <KeywordSearchForm 
          onSearch={handleSearch}
          isSearching={isSearching}
        />

        <KeywordResultsTable 
          keywords={keywords} 
          onGenerateContent={handleGenerateContent} 
        />
      </CardContent>
    </Card>
  );
};

export default KeywordResearch;
