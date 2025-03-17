
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ExternalLink, RefreshCw, Search } from "lucide-react";
import { CompetitorData } from "@/services/keywords/api/dataForSeo/competitorsDomain";
import { useCompetitorAnalysis, SortConfig } from "@/hooks/useCompetitorAnalysis";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CompetitorsTableProps {
  domain: string;
}

export function CompetitorsTable({ domain: initialDomain }: CompetitorsTableProps) {
  const [domain, setDomain] = useState(initialDomain || "");
  const {
    competitors,
    isLoading,
    error,
    lastUpdated,
    sortConfig,
    handleSort,
    fetchCompetitorData
  } = useCompetitorAnalysis(domain);

  const onAnalyze = () => {
    fetchCompetitorData(domain);
  };

  // Format number with commas and decimals
  const formatNumber = (num: number, decimals: number = 0) => {
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  // Get the appropriate sort icon
  const getSortIcon = (key: keyof CompetitorData) => {
    if (sortConfig.key === key) {
      return (
        <span className={`ml-1 inline-block transition-transform ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`}>
          ↓
        </span>
      );
    }
    return null;
  };

  // Determine if a competitor row should be highlighted (best performer)
  const shouldHighlight = (competitor: CompetitorData, index: number): boolean => {
    if (index === 0 && sortConfig.key === 'intersection_etv' && sortConfig.direction === 'desc') {
      return true;
    }
    if (index === 0 && sortConfig.key === 'avg_position' && sortConfig.direction === 'asc') {
      return true;
    }
    return false;
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          Competitor Analysis
          {lastUpdated && (
            <Badge variant="outline" className="ml-2 text-xs">
              Last updated: {lastUpdated}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Analyze competitors that share keywords with your domain
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter domain to analyze (e.g., example.com)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="max-w-md"
            />
            <Button
              onClick={onAnalyze}
              disabled={isLoading || !domain.trim()}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Analyze Competitors
                </>
              )}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : competitors.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">
                      <Button 
                        variant="ghost" 
                        className="p-0 font-medium"
                        onClick={() => handleSort('domain')}
                      >
                        Competitor Domain
                        {getSortIcon('domain')}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button 
                        variant="ghost" 
                        className="p-0 font-medium"
                        onClick={() => handleSort('intersections')}
                      >
                        Shared Keywords
                        {getSortIcon('intersections')}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button 
                        variant="ghost" 
                        className="p-0 font-medium"
                        onClick={() => handleSort('avg_position')}
                      >
                        Avg Position
                        {getSortIcon('avg_position')}
                        <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button 
                        variant="ghost" 
                        className="p-0 font-medium"
                        onClick={() => handleSort('intersection_etv')}
                      >
                        Shared ETV ($)
                        {getSortIcon('intersection_etv')}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button 
                        variant="ghost" 
                        className="p-0 font-medium"
                        onClick={() => handleSort('overall_etv')}
                      >
                        Overall ETV ($)
                        {getSortIcon('overall_etv')}
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {competitors.map((competitor, index) => (
                    <TableRow 
                      key={competitor.domain} 
                      className={shouldHighlight(competitor, index) 
                        ? "bg-green-50 hover:bg-green-100" 
                        : undefined
                      }
                    >
                      <TableCell>
                        <div className="flex items-center">
                          <span className="font-medium">{competitor.domain}</span>
                          <a 
                            href={`https://${competitor.domain}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-2 text-gray-400 hover:text-gray-600"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{formatNumber(competitor.intersections)}</TableCell>
                      <TableCell className="text-right">{competitor.avg_position}</TableCell>
                      <TableCell className="text-right">${formatNumber(competitor.intersection_etv, 2)}</TableCell>
                      <TableCell className="text-right">${formatNumber(competitor.overall_etv, 2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : lastUpdated ? (
            <div className="text-center py-6 text-gray-500">
              No competitor data found for this domain.
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              Enter a domain and click "Analyze Competitors" to view competitor data.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
