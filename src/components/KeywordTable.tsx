import { useState, useEffect, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Download, 
  ArrowUpDown, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  PlusCircle,
  Target,
  Filter,
  Trash2
} from "lucide-react";
import { KeywordData } from "@/services/keywordService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { runRevologySeoActions } from "@/services/keywords/revologySeoStrategy";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchDomainKeywords } from "@/services/keywordService";
import { categorizeKeywordIntent } from "@/components/keyword-gaps/KeywordGapUtils";

interface KeywordTableProps {
  domain: string;
  competitorDomains: string[];
  keywords: KeywordData[];
  isLoading: boolean;
  onAddCompetitor?: (newCompetitor: string) => void;
  onRemoveCompetitor?: (competitorToRemove: string) => void;
}

const KeywordTable = ({ domain, competitorDomains, keywords, isLoading, onAddCompetitor, onRemoveCompetitor }: KeywordTableProps) => {
  const [filteredKeywords, setFilteredKeywords] = useState<KeywordData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{column: string; direction: 'asc' | 'desc'}>({
    column: 'monthly_search',
    direction: 'desc'
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [paginatedKeywords, setPaginatedKeywords] = useState<KeywordData[]>([]);
  
  const [newCompetitor, setNewCompetitor] = useState("");
  const [showCompetitorInput, setShowCompetitorInput] = useState(false);
  const [loadingCompetitor, setLoadingCompetitor] = useState(false);
  
  const [isRunningSeoStrategy, setIsRunningSeoStrategy] = useState(false);
  const [intentFilter, setIntentFilter] = useState<string>("all");

  useEffect(() => {
    setFilteredKeywords(keywords);
    setCurrentPage(1);
  }, [keywords]);
  
  useEffect(() => {
    let filtered = [...keywords];
    
    if (searchQuery) {
      filtered = filtered.filter(k => 
        k.keyword.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (intentFilter !== "all") {
      filtered = filtered.filter(k => {
        const intent = categorizeKeywordIntent(k.keyword, k.competition_index, k.monthly_search);
        return intent === intentFilter;
      });
    }
    
    setFilteredKeywords(filtered);
    setCurrentPage(1);
  }, [searchQuery, keywords, intentFilter]);
  
  useEffect(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    setPaginatedKeywords(filteredKeywords.slice(startIndex, endIndex));
  }, [filteredKeywords, currentPage, rowsPerPage]);
  
  const handleSort = (column: string) => {
    const newDirection = 
      sortConfig.column === column && sortConfig.direction === 'desc' ? 'asc' : 'desc';
    
    setSortConfig({ column, direction: newDirection });
    
    const sorted = [...filteredKeywords].sort((a, b) => {
      if (column === 'position') {
        if (a.position === null && b.position === null) return 0;
        if (a.position === null) return newDirection === 'asc' ? 1 : -1;
        if (b.position === null) return newDirection === 'asc' ? -1 : 1;
        
        return newDirection === 'asc' 
          ? a.position - b.position 
          : b.position - a.position;
      }
      
      if (['monthly_search', 'competition_index', 'cpc'].includes(column)) {
        const aValue = a[column as keyof KeywordData] as number;
        const bValue = b[column as keyof KeywordData] as number;
        return newDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return newDirection === 'asc'
        ? String(a[column as keyof KeywordData]).localeCompare(String(b[column as keyof KeywordData]))
        : String(b[column as keyof KeywordData]).localeCompare(String(a[column as keyof KeywordData]));
    });
    
    setFilteredKeywords(sorted);
  };
  
  const totalPages = Math.ceil(filteredKeywords.length / rowsPerPage);
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  const getRankingBadgeColor = (ranking: number | null) => {
    if (ranking === null) return "bg-gray-200 text-gray-700";
    if (ranking <= 3) return "bg-green-100 text-green-800";
    if (ranking <= 10) return "bg-blue-100 text-blue-800";
    if (ranking <= 30) return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  };
  
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return "text-green-600";
    if (difficulty < 60) return "text-amber-600";
    return "text-red-600";
  };
  
  const getIntentLabel = (keyword: string, difficulty: number, volume: number): string => {
    const intent = categorizeKeywordIntent(keyword, difficulty, volume);
    switch (intent) {
      case 'informational': return 'Info';
      case 'navigational': return 'Nav';
      case 'commercial': return 'Com';
      case 'transactional': return 'Trans';
      default: return 'Info';
    }
  };
  
  const getIntentBadgeColor = (keyword: string, difficulty: number, volume: number): string => {
    const intent = categorizeKeywordIntent(keyword, difficulty, volume);
    switch (intent) {
      case 'informational':
        return "bg-blue-100 text-blue-800";
      case 'navigational':
        return "bg-purple-100 text-purple-800";
      case 'commercial':
        return "bg-amber-100 text-amber-800";
      case 'transactional':
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const extractDomainName = (url: string): string => {
    try {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const urlObj = new URL(url);
        return urlObj.hostname.replace(/^www\./, '');
      }
      
      try {
        const urlObj = new URL(`https://${url}`);
        return urlObj.hostname.replace(/^www\./, '');
      } catch (e) {
        return url.replace(/^www\./, '');
      }
    } catch (error) {
      console.warn(`Failed to extract domain from: ${url}`, error);
      return url;
    }
  };

  const exportToCsv = () => {
    if (keywords.length === 0) return;
    
    let csvContent = "Keyword,Volume,Difficulty,CPC,$,Intent,";
    csvContent += `${domain},${domain} URL,`;
    competitorDomains.forEach(comp => {
      csvContent += `${comp},${comp} URL,`;
    });
    csvContent += "\n";
    
    keywords.forEach(item => {
      const intent = getIntentLabel(item.keyword, item.competition_index, item.monthly_search);
      csvContent += `"${item.keyword}",${item.monthly_search},${item.competition_index},${item.cpc.toFixed(2)},$,${intent},`;
      csvContent += `${item.position || "-"},${item.rankingUrl || "-"},`;
      competitorDomains.forEach(comp => {
        const domainName = extractDomainName(comp);
        csvContent += `${item.competitorRankings?.[domainName] || "-"},${item.competitorUrls?.[domainName] || "-"},`;
      });
      csvContent += "\n";
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `seo_keywords_${domain}_analysis.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      
      if (onAddCompetitor) {
        onAddCompetitor(formattedUrl);
      }
      
      toast.success(`Added ${normalizedNewCompetitor} to competitors list`);
    } catch (error) {
      console.error("Error fetching competitor keywords:", error);
      toast.warning(`Added ${normalizedNewCompetitor} but couldn't fetch keywords. Will use sample data.`);
      
      if (onAddCompetitor) {
        onAddCompetitor(formattedUrl);
      }
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
    
    if (onRemoveCompetitor) {
      onRemoveCompetitor(competitor);
    } else {
      toast.error("Remove competitor function not available");
    }
  };

  const handleRunRevologySeoStrategy = async () => {
    if (!domain || competitorDomains.length === 0 || keywords.length === 0) {
      toast.error("Please ensure you have domain and competitor data first");
      return;
    }

    setIsRunningSeoStrategy(true);
    try {
      await runRevologySeoActions(domain, competitorDomains, keywords);
      toast.success("SEO strategy for Revology Analytics completed successfully");
    } catch (error) {
      console.error("Error running SEO strategy:", error);
      toast.error(`Failed to run SEO strategy: ${(error as Error).message}`);
    } finally {
      setIsRunningSeoStrategy(false);
    }
  };

  const RankingLink = ({ url, position }: { url: string | null | undefined, position: number | null | undefined }) => {
    if (!url || !position) return <Badge variant="outline">-</Badge>;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1"
            >
              <Badge className={`${getRankingBadgeColor(position)}`}>
                {position} <ExternalLink className="ml-1 h-3 w-3" />
              </Badge>
            </a>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs truncate max-w-56">{url}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const uniqueIntents = useMemo(() => {
    const intents = keywords.map(item => 
      categorizeKeywordIntent(item.keyword, item.competition_index, item.monthly_search)
    );
    return Array.from(new Set(intents));
  }, [keywords]);

  return (
    <Card className="glass-panel transition-all duration-300 hover:shadow-xl overflow-hidden">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Keyword Analysis</CardTitle>
            <CardDescription>
              Comparing {domain} with {competitorDomains.length} competitor{competitorDomains.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {domain && competitorDomains.length > 0 && keywords.length > 0 && (
              <Button 
                variant="danger"
                size="sm"
                className="transition-all whitespace-nowrap"
                onClick={handleRunRevologySeoStrategy}
                disabled={isLoading || isRunningSeoStrategy}
              >
                {isRunningSeoStrategy ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Running Strategy...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-1" />
                    Run Revology SEO Strategy
                  </>
                )}
              </Button>
            )}
            
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search keywords..."
                className="pl-8 transition-all w-[200px] md:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className="transition-all"
              onClick={exportToCsv}
              disabled={isLoading || keywords.length === 0}
            >
              <Download className="h-4 w-4" />
            </Button>
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
          </div>
        </div>
        
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
        
        {keywords.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filter by intent:</span>
            </div>
            <Select value={intentFilter} onValueChange={setIntentFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select intent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All intents</SelectItem>
                {uniqueIntents.map(intent => (
                  <SelectItem key={intent} value={intent}>
                    {intent.charAt(0).toUpperCase() + intent.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {competitorDomains.length > 0 && (
          <div className="mt-4">
            <div className="text-sm text-muted-foreground mb-2">Competitors:</div>
            <div className="flex flex-wrap gap-2">
              {competitorDomains.map((competitor, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1 px-3 py-1">
                  {extractDomainName(competitor)}
                  {onRemoveCompetitor && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 text-muted-foreground hover:text-destructive p-0"
                      onClick={() => handleRemoveCompetitor(competitor)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => handleSort('keyword')} className="cursor-pointer">
                    <div className="flex items-center">
                      Keyword
                      {sortConfig.column === 'keyword' && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort('monthly_search')} className="cursor-pointer">
                    <div className="flex items-center">
                      Volume
                      {sortConfig.column === 'monthly_search' && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort('competition_index')} className="cursor-pointer">
                    <div className="flex items-center">
                      Difficulty
                      {sortConfig.column === 'competition_index' && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort('cpc')} className="cursor-pointer">
                    <div className="flex items-center">
                      CPC
                      {sortConfig.column === 'cpc' && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-[100px]">
                    Intent
                  </TableHead>
                  <TableHead onClick={() => handleSort('position')} className="cursor-pointer">
                    <div className="flex items-center">
                      {domain} <ArrowUpDown className="ml-1 h-3 w-3" />
                    </div>
                  </TableHead>
                  {competitorDomains.map((competitor, index) => (
                    <TableHead key={index}>
                      {extractDomainName(competitor)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6 + competitorDomains.length} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
                        <p className="text-sm text-muted-foreground">Fetching keyword data...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedKeywords.length > 0 ? (
                  paginatedKeywords.map((item, index) => (
                    <TableRow key={index} className="transition-all hover:bg-muted/50">
                      <TableCell className="font-medium">{item.keyword}</TableCell>
                      <TableCell>{item.monthly_search.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={getDifficultyColor(item.competition_index)}>{item.competition_index}/100</span>
                      </TableCell>
                      <TableCell>${item.cpc.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getIntentBadgeColor(item.keyword, item.competition_index, item.monthly_search)}>
                          {getIntentLabel(item.keyword, item.competition_index, item.monthly_search)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <RankingLink url={item.rankingUrl} position={item.position} />
                      </TableCell>
                      {competitorDomains.map((competitor, idx) => {
                        const domainName = extractDomainName(competitor);
                        return (
                          <TableCell key={idx}>
                            <RankingLink 
                              url={item.competitorUrls?.[domainName]} 
                              position={item.competitorRankings?.[domainName]} 
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6 + competitorDomains.length} className="h-24 text-center">
                      {keywords.length === 0 ? "No keywords found. Start an analysis first." : "No matching keywords found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {filteredKeywords.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4">
            <div className="text-xs text-muted-foreground">
              Showing {paginatedKeywords.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to {Math.min(currentPage * rowsPerPage, filteredKeywords.length)} of {filteredKeywords.length} keywords
            </div>
            
            <div className="flex items-center gap-4">
              <Select 
                value={rowsPerPage.toString()} 
                onValueChange={(value) => setRowsPerPage(Number(value))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Rows per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                  <SelectItem value="100">100 per page</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1 || isLoading}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-xs">
                  Page {currentPage} of {totalPages || 1}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages || totalPages === 0 || isLoading}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KeywordTable;
