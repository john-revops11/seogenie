
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, TrendingUp, TrendingDown, ArrowUpDown, Info, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDomainIntersection } from "@/hooks/useDomainIntersection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CompetitorsTableProps {
  domain: string;
  onMetricsLoaded?: (metrics: {
    organicTraffic: number;
    organicKeywords: number;
    trafficValue: number;
  }) => void;
}

export function CompetitorsTable({ domain, onMetricsLoaded }: CompetitorsTableProps) {
  const [targetDomain, setTargetDomain] = useState(domain);
  const [competitorDomain, setCompetitorDomain] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  
  const {
    intersectionData,
    totalKeywords,
    isLoading,
    error,
    lastUpdated,
    domains,
    fetchIntersectionData,
    resetData
  } = useDomainIntersection();

  const [sortConfig, setSortConfig] = useState<{
    key: keyof typeof intersectionData[0];
    direction: 'asc' | 'desc';
  }>({
    key: 'search_volume',
    direction: 'desc'
  });

  useEffect(() => {
    setTargetDomain(domain);
  }, [domain]);

  const handleSort = (key: keyof typeof intersectionData[0]) => {
    setSortConfig((prevConfig) => {
      if (prevConfig.key === key) {
        return {
          key,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return {
        key,
        direction: 'desc'
      };
    });
  };

  const handleCompare = () => {
    if (targetDomain && competitorDomain) {
      setOpenDialog(true);
    } else {
      if (!targetDomain) {
        toast.error("Please enter a target domain");
      } else {
        toast.error("Please enter a competitor domain");
      }
    }
  };

  const confirmAnalysis = () => {
    fetchIntersectionData(targetDomain, competitorDomain);
    setOpenDialog(false);
  };

  const sortedData = [...intersectionData].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const getPositionDifference = (pos1: number, pos2: number) => {
    if (pos1 === 0 || pos2 === 0) return null;
    return pos1 - pos2;
  };

  const getCompetitionLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'HIGH': return "bg-red-100 text-red-800";
      case 'MEDIUM': return "bg-yellow-100 text-yellow-800";
      case 'LOW': return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const renderSortIcon = (column: keyof typeof intersectionData[0]) => {
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
            <span>Domain Intersection Analysis</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p>Compare your domain with a competitor to see common ranking keywords. This uses the DataForSEO API and counts against your API quota.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {!isLoading && intersectionData.length > 0 && (
            <Badge variant="outline" className="ml-2 text-xs">
              {intersectionData.length} shared keywords
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-grow space-y-2">
              <label className="text-sm font-medium">Your Domain</label>
              <Input 
                placeholder="yourdomain.com" 
                value={targetDomain}
                onChange={(e) => setTargetDomain(e.target.value)}
              />
            </div>
            <div className="flex-grow space-y-2">
              <label className="text-sm font-medium">Competitor Domain</label>
              <Input 
                placeholder="competitor.com" 
                value={competitorDomain}
                onChange={(e) => setCompetitorDomain(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={handleCompare} 
              disabled={isLoading || !targetDomain || !competitorDomain}
              className="whitespace-nowrap"
            >
              Compare Domains
            </Button>
            
            {intersectionData.length > 0 && (
              <Button 
                variant="outline" 
                onClick={resetData}
                disabled={isLoading}
              >
                Reset
              </Button>
            )}
          </div>
          
          <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm API Request</AlertDialogTitle>
                <AlertDialogDescription>
                  This will make an API call to DataForSEO to analyze common keywords between {targetDomain} and {competitorDomain}.
                  Each request counts against your API quota. Do you want to proceed?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmAnalysis}>
                  Proceed
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : isLoading ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full animate-spin" />
                <p>Analyzing intersection between {targetDomain} and {competitorDomain}...</p>
              </div>
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : intersectionData.length > 0 ? (
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-medium">
                  Showing {intersectionData.length} common keywords between <span className="font-bold">{domains.target1}</span> and <span className="font-bold">{domains.target2}</span>
                </h3>
                {lastUpdated && (
                  <p className="text-xs text-muted-foreground">Last updated: {lastUpdated}</p>
                )}
              </div>
              
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Keyword</TableHead>
                      <TableHead className="text-right">
                        <Button 
                          variant="ghost" 
                          className="h-8 px-2 text-xs font-medium"
                          onClick={() => handleSort('search_volume')}
                        >
                          Volume
                          {renderSortIcon('search_volume')}
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">
                        <Button 
                          variant="ghost" 
                          className="h-8 px-2 text-xs font-medium"
                          onClick={() => handleSort('competition_level')}
                        >
                          Competition
                          {renderSortIcon('competition_level')}
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">
                        <Button 
                          variant="ghost" 
                          className="h-8 px-2 text-xs font-medium"
                          onClick={() => handleSort('cpc')}
                        >
                          CPC
                          {renderSortIcon('cpc')}
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">
                        <Button 
                          variant="ghost" 
                          className="h-8 px-2 text-xs font-medium"
                          onClick={() => handleSort('target1_position')}
                        >
                          Your Position
                          {renderSortIcon('target1_position')}
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">
                        <Button 
                          variant="ghost" 
                          className="h-8 px-2 text-xs font-medium"
                          onClick={() => handleSort('target2_position')}
                        >
                          Competitor Position
                          {renderSortIcon('target2_position')}
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">Difference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedData.map((keyword, index) => {
                      const positionDiff = getPositionDifference(keyword.target1_position, keyword.target2_position);
                      const isWinning = positionDiff !== null && positionDiff < 0;
                      const isLosing = positionDiff !== null && positionDiff > 0;
                      
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {keyword.keyword}
                              {keyword.is_featured_snippet && (
                                <Badge variant="outline" className="bg-purple-100 text-purple-800">
                                  Featured
                                </Badge>
                              )}
                              {keyword.keyword_difficulty > 6 && (
                                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                  Difficult
                                </Badge>
                              )}
                            </div>
                            {keyword.core_keyword && keyword.core_keyword !== keyword.keyword && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Core: {keyword.core_keyword}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">{keyword.search_volume.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline" className={getCompetitionLevelColor(keyword.competition_level)}>
                              {keyword.competition_level || "Unknown"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">${keyword.cpc?.toFixed(2) || "0.00"}</TableCell>
                          <TableCell className="text-right">
                            {keyword.target1_position ? 
                              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                {keyword.target1_position}
                              </Badge> : 
                              "-"
                            }
                          </TableCell>
                          <TableCell className="text-right">
                            {keyword.target2_position ? 
                              <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                {keyword.target2_position}
                              </Badge> : 
                              "-"
                            }
                          </TableCell>
                          <TableCell className="text-right">
                            {positionDiff !== null ? (
                              <Badge variant={isWinning ? "secondary" : isLosing ? "destructive" : "outline"}>
                                {isWinning ? "+" : ""}{Math.abs(positionDiff)}
                              </Badge>
                            ) : "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : lastUpdated ? (
            <div className="text-center py-8 text-muted-foreground">
              No intersection data found between these domains
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                Enter your domain and a competitor domain, then click "Compare Domains" to find common keywords and ranking positions.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
