
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, TrendingUp, TrendingDown, ArrowUpDown, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCompetitorAnalysis } from "@/hooks/useCompetitorAnalysis";
import { Button } from "@/components/ui/button";
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
  const {
    competitors,
    domainMetrics,
    isLoading,
    error,
    sortConfig,
    handleSort,
    fetchCompetitorData
  } = useCompetitorAnalysis(domain);

  const [dataFetched, setDataFetched] = useState(false);

  useEffect(() => {
    if (onMetricsLoaded && domainMetrics && dataFetched) {
      onMetricsLoaded(domainMetrics);
    }
  }, [domainMetrics, onMetricsLoaded, dataFetched]);

  const handleFetchData = () => {
    if (domain) {
      setDataFetched(true);
      fetchCompetitorData(domain);
    }
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
        {!dataFetched && !isLoading ? (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Click the button below to fetch competitor data for {domain}. This will use the DataForSEO API and count against your API quota.
              </AlertDescription>
            </Alert>
            <Button onClick={handleFetchData} className="w-full sm:w-auto">
              Fetch Competitor Data
            </Button>
          </div>
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
                      No competitor data available
                    </TableCell>
                  </TableRow>
                ) : (
                  competitors.map((competitor, index) => {
                    // Check if this competitor is one of the top 3 by ETV or position
                    const isTopEtv = index < 3 && sortConfig.key === 'intersection_etv';
                    const isTopPosition = index < 3 && sortConfig.key === 'avg_position' && sortConfig.direction === 'asc';
                    const isHighlighted = isTopEtv || isTopPosition;
                    
                    return (
                      <TableRow key={competitor.domain} className={isHighlighted ? "bg-gray-50" : ""}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {isHighlighted && (
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
      </CardContent>
    </Card>
  );
}
