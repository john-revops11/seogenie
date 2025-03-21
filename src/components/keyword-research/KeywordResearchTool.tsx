
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Search, Info } from "lucide-react";
import KeywordResultsTable from "./KeywordResultsTable";
import { useDataForSeoKeywordResearch } from "@/hooks/keywords/useDataForSeoKeywordResearch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type ResearchMethod = "related" | "suggestions";

interface KeywordResearchDescription {
  title: string;
  description: string;
}

const researchMethodDescriptions: Record<ResearchMethod, KeywordResearchDescription> = {
  related: {
    title: "Related Keywords",
    description: "Find keywords from 'searches related to' section in Google. Discover what users are searching for in relation to your topic."
  },
  suggestions: {
    title: "Keyword Suggestions",
    description: "Get long-tail keywords that include your seed keyword. Find variations with words before, after, or within your key phrase."
  }
};

const KeywordResearchTool: React.FC = () => {
  const [keyword, setKeyword] = useState("");
  const [researchMethod, setResearchMethod] = useState<ResearchMethod>("related");
  const { toast } = useToast();
  
  const {
    keywordResults,
    loading,
    error,
    fetchKeywords
  } = useDataForSeoKeywordResearch();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyword.trim()) {
      toast({
        title: "Please enter a keyword",
        description: "You need to provide a keyword to research",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await fetchKeywords(keyword, researchMethod);
    } catch (err) {
      toast({
        title: "Research failed",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  const currentDescription = researchMethodDescriptions[researchMethod];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          Keyword Research Tool
        </CardTitle>
        <CardDescription>
          Research keywords using different methods from DataForSEO
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Enter a keyword to research..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="w-full md:w-64">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative w-full">
                      <Select
                        value={researchMethod}
                        onValueChange={(value) => setResearchMethod(value as ResearchMethod)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Research Method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="related">Related Keywords</SelectItem>
                          <SelectItem value="suggestions">Keyword Suggestions</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="w-80 p-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">{currentDescription.title}</h4>
                      <p className="text-sm">{currentDescription.description}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <Button 
              type="submit" 
              disabled={loading || !keyword.trim()} 
              className="w-full md:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Research
                </>
              )}
            </Button>
          </div>
        </form>
        
        {error && (
          <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}
        
        <div className="mt-6">
          <KeywordResultsTable 
            data={keywordResults} 
            isLoading={loading} 
            keyword={keyword}
            researchMethod={researchMethod}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default KeywordResearchTool;
