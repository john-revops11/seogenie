
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Search } from "lucide-react";
import KeywordTable from "@/components/KeywordTable";
import KeywordGapCard from "@/components/KeywordGapCard";
import SeoRecommendationsCard from "@/components/SeoRecommendationsCard";
import ContentGenerator from "@/components/ContentGenerator";
import ContentIdeasGenerator from "@/components/ContentIdeasGenerator";

const Index = () => {
  const [domain, setDomain] = useState("");
  const [competitorDomains, setCompetitorDomains] = useState([""]);
  const [keywords, setKeywords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDomain(e.target.value);
  };
  
  const handleCompetitorChange = (index: number, value: string) => {
    const updatedCompetitors = [...competitorDomains];
    updatedCompetitors[index] = value;
    setCompetitorDomains(updatedCompetitors);
  };
  
  const addCompetitorField = () => {
    setCompetitorDomains([...competitorDomains, ""]);
  };
  
  const removeCompetitorField = (index: number) => {
    const updatedCompetitors = [...competitorDomains];
    updatedCompetitors.splice(index, 1);
    setCompetitorDomains(updatedCompetitors);
  };
  
  const handleAnalyze = async () => {
    if (!domain) {
      toast.error("Please enter a domain to analyze");
      return;
    }
    
    setIsLoading(true);
    setKeywords([]);
    
    try {
      const response = await fetch(`/api/analyze?domain=${domain}&competitorDomains=${competitorDomains.join(',')}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setKeywords(data.keywords);
        toast.success("Domain analysis completed successfully!");
      } else {
        toast.error("Domain analysis failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Error during domain analysis:", error);
      toast.error(`An error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">SEO Keyword Analysis Tool</h1>
      
      <Card className="mb-6 glass-panel">
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="domain" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
              Main Domain
            </label>
            <div className="relative">
              <Input 
                id="domain" 
                placeholder="Enter domain to analyze" 
                value={domain}
                onChange={handleDomainChange}
                disabled={isLoading}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
              Competitor Domains
            </label>
            {competitorDomains.map((competitor, index) => (
              <div key={index} className="flex items-center space-x-2 mb-1">
                <Input
                  type="url"
                  placeholder="Enter competitor domain"
                  value={competitor}
                  onChange={(e) => handleCompetitorChange(index, e.target.value)}
                  disabled={isLoading}
                />
                {competitorDomains.length > 1 ? (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => removeCompetitorField(index)}
                    disabled={isLoading}
                  >
                    -
                  </Button>
                ) : null}
              </div>
            ))}
            <Button 
              type="button" 
              variant="secondary" 
              onClick={addCompetitorField}
              disabled={isLoading}
            >
              Add Competitor
            </Button>
          </div>
          
          <Button 
            onClick={handleAnalyze} 
            disabled={isLoading || !domain}
            className="w-full bg-revology hover:bg-revology-dark mt-4 md:mt-0"
          >
            {isLoading ? "Analyzing..." : "Analyze Domain"}
          </Button>
        </CardContent>
      </Card>
      
      {keywords.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <ContentIdeasGenerator 
            domain={domain} 
            competitorDomains={competitorDomains} 
            keywords={keywords} 
            isLoading={isLoading} 
          />
          <div className="md:col-span-1 xl:col-span-2">
            <ContentGenerator 
              domain={domain} 
              allKeywords={keywords} 
            />
          </div>
        </div>
      )}
      
      {keywords.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <KeywordTable 
            domain={domain}
            competitorDomains={competitorDomains}
            keywords={keywords}
            isLoading={isLoading}
          />
          <div className="flex flex-col gap-6">
            <KeywordGapCard 
              domain={domain}
              competitorDomains={competitorDomains}
              keywords={keywords}
              isLoading={isLoading}
            />
            <SeoRecommendationsCard 
              domain={domain}
              keywords={keywords}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
