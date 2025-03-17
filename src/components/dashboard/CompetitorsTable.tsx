
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, TrendingUp, TrendingDown, ArrowUpDown, Info, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCompetitorAnalysis } from "@/hooks/useCompetitorAnalysis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CompetitorsTableProps {
  domain: string;
  onMetricsLoaded?: (metrics: {
    organicTraffic: number;
    organicKeywords: number;
    trafficValue: number;
  }) => void;
}

export function CompetitorsTable({ domain, onMetricsLoaded }: CompetitorsTableProps) {
  const [customDomain, setCustomDomain] = useState(domain);
  const [competitorDomain, setCompetitorDomain] = useState("");
  const [showCompetitorInput, setShowCompetitorInput] = useState(false);
  const [recommendationsLoaded, setRecommendationsLoaded] = useState(false);

  const {
    competitors,
    domainMetrics,
    isLoading,
    error,
    sortConfig,
    handleSort,
    fetchCompetitorData,
    resetCompetitorData
  } = useCompetitorAnalysis(customDomain);

  const [dataFetched, setDataFetched] = useState(false);

  useEffect(() => {
    setCustomDomain(domain);
  }, [domain]);

  useEffect(() => {
    if (onMetricsLoaded && domainMetrics && dataFetched) {
      onMetricsLoaded(domainMetrics);
    }
  }, [domainMetrics, onMetricsLoaded, dataFetched]);

  const handleFetchData = () => {
    if (customDomain) {
      setDataFetched(true);
      fetchCompetitorData(customDomain);
    }
  };

  const handleAddCompetitor = () => {
    setShowCompetitorInput(!showCompetitorInput);
  };

  const submitCompetitor = () => {
    if (competitorDomain) {
      // This would be where you'd integrate a custom API call to analyze this competitor
      // For now, we'll just show a message
      alert(`Feature coming soon: Analyze competitor ${competitorDomain}`);
      setCompetitorDomain("");
      setShowCompetitorInput(false);
    }
  };

  const getRecommendedCompetitors = () => {
    setRecommendationsLoaded(true);
    handleFetchData();
  };

  const renderSortIcon = (column: string) => {
    if (sortConfig.key === column) {
      return sortConfig.direction === 'asc' ? 
        <TrendingUp className="ml-1 h-4 w-4" /> : 
        <TrendingDown className="ml-1 h-4 w-4" />;
    }
    return <ArrowUpDown className="ml-1 h-4 w-4" />;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Competitor Analysis</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p>This feature uses the DataForSEO API to fetch competitor data. Each analysis counts as an API call against your DataForSEO quota.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {!isLoading && competitors.length > 0 && (
            <Badge variant="outline" className="ml-2 text-xs">
              {competitors.length} competitors
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Domain input field */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Input 
              placeholder="Enter domain to analyze" 
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              className="flex-grow"
            />
            <Button 
              onClick={handleFetchData} 
              disabled={isLoading || !customDomain}
              className="whitespace-nowrap"
            >
              Analyze Competitors
            </Button>
          </div>

          {/* Add competitor input */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAddCompetitor}
              className="flex-shrink-0"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Specific Competitor
            </Button>
            
            {!dataFetched && !recommendationsLoaded && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={getRecommendedCompetitors}
                className="flex-shrink-0"
              >
                Get Recommended Competitors
              </Button>
            )}
          </div>
          
          {showCompetitorInput && (
            <div className="flex gap-2">
              <Input 
                placeholder="competitor.com" 
                value={competitorDomain}
                onChange={(e) => setCompetitorDomain(e.target.value)}
                className="flex-grow"
              />
              <Button onClick={submitCompetitor} disabled={!competitorDomain}>
                Add
              </Button>
            </div>
          )}

          {!dataFetched && !isLoading && !recommendationsLoaded ? (
            <Alert>
              <AlertDescription>
                Enter a domain above and click "Analyze Competitors" to find competitors for that domain. This will use the DataForSEO API and count against your API quota.
              </AlertDescription>
            </Alert>
          ) : error ? (
            <div className="p-4 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Competitor Domain</TableHead>
                    <TableHead className="text-right">
                      <Button 
                        variant="ghost" 
                        className="h-8 px-2 text-xs font-medium"
                        onClick={() => handleSort('intersections')}
                      >
                        Shared Keywords
                        {renderSortIcon('intersections')}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button 
                        variant="ghost" 
                        className="h-8 px-2 text-xs font-medium"
                        onClick={() => handleSort('avg_position')}
                      >
                        Avg. Position
                        {renderSortIcon('avg_position')}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button 
                        variant="ghost" 
                        className="h-8 px-2 text-xs font-medium"
                        onClick={() => handleSort('intersection_etv')}
                      >
                        Intersection ETV
                        {renderSortIcon('intersection_etv')}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button 
                        variant="ghost" 
                        className="h-8 px-2 text-xs font-medium"
                        onClick={() => handleSort('overall_etv')}
                      >
                        Overall ETV
                        {renderSortIcon('overall_etv')}
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : competitors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        {dataFetched ? "No competitor data available" : "Enter a domain and click 'Analyze Competitors'"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    competitors.map((competitor, index) => {
                      // Highlight top 3 recommended competitors
                      const isRecommended = index < 3;
                      const isTopEtv = index < 3 && sortConfig.key === 'intersection_etv';
                      const isTopPosition = index < 3 && sortConfig.key === 'avg_position' && sortConfig.direction === 'asc';
                      const isHighlighted = isTopEtv || isTopPosition;
                      
                      return (
                        <TableRow key={competitor.domain} className={isHighlighted ? "bg-gray-50" : ""}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              {isRecommended && (
                                <Badge className="mr-2 bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900">
                                  {index + 1}
                                </Badge>
                              )}
                              <a 
                                href={`https://${competitor.domain}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-600 hover:underline"
                              >
                                {competitor.domain}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{competitor.intersections.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{competitor.avg_position}</TableCell>
                          <TableCell className="text-right">${competitor.intersection_etv.toLocaleString()}</TableCell>
                          <TableCell className="text-right">${competitor.overall_etv.toLocaleString()}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
