
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Plus, X, Search, Loader2 } from "lucide-react";

interface DomainAnalysisFormProps {
  mainDomain: string;
  competitorDomains: string[];
  isAnalyzing: boolean;
  progress: number;
  onMainDomainChange: (domain: string) => void;
  onAddCompetitorDomain: () => void;
  onRemoveCompetitorDomain: (index: number) => void;
  onUpdateCompetitorDomain: (index: number, value: string) => void;
  onAnalyze: () => void;
}

export const DomainAnalysisForm = ({
  mainDomain,
  competitorDomains,
  isAnalyzing,
  progress,
  onMainDomainChange,
  onAddCompetitorDomain,
  onRemoveCompetitorDomain,
  onUpdateCompetitorDomain,
  onAnalyze
}: DomainAnalysisFormProps) => {
  const renderProgressStatus = () => {
    if (progress < 25) return "Gathering keyword data...";
    if (progress < 50) return "Analyzing competitor domains...";
    if (progress < 75) return "Identifying keyword gaps...";
    if (progress < 95) return "Generating SEO recommendations...";
    return "Finalizing results...";
  };

  return (
    <Card className="glass-panel transition-all duration-300 hover:shadow-xl border-revology/10">
      <CardHeader>
        <CardTitle>Domain Analysis</CardTitle>
        <CardDescription>Enter your main domain and competitor domains to analyze</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="main-domain">Main Domain</Label>
            <Input
              id="main-domain"
              placeholder="example.com"
              value={mainDomain}
              onChange={(e) => onMainDomainChange(e.target.value)}
              className="transition-all focus:ring-2 focus:ring-revology/20"
              disabled={isAnalyzing}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Competitor Domains</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onAddCompetitorDomain}
                className="text-xs transition-all border-revology/30 text-revology hover:text-revology hover:bg-revology-light/50"
                disabled={isAnalyzing}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
            
            {competitorDomains.map((domain, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder={`competitor${index + 1}.com`}
                  value={domain}
                  onChange={(e) => onUpdateCompetitorDomain(index, e.target.value)}
                  className="transition-all focus:ring-2 focus:ring-revology/20"
                  disabled={isAnalyzing}
                />
                {competitorDomains.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveCompetitorDomain(index)}
                    className="h-8 w-8 hover:text-revology hover:bg-revology-light/50"
                    disabled={isAnalyzing}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <Button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="w-full mt-4 transition-all bg-revology hover:bg-revology-dark"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Analyze Keywords
            </>
          )}
        </Button>
        
        {isAnalyzing && (
          <div className="space-y-2 mt-4 animate-fade-in">
            <div className="flex items-center justify-between text-sm">
              <span>{renderProgressStatus()}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 transition-all progress-bar-animated bg-muted" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
