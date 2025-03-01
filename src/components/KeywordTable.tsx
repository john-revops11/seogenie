
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Search, Download, ArrowUpDown, Loader2, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { KeywordData } from "@/services/keywordService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface KeywordTableProps {
  domain: string;
  competitorDomains: string[];
  keywords: KeywordData[];
  isLoading: boolean;
}

const KeywordTable = ({ domain, competitorDomains, keywords, isLoading }: KeywordTableProps) => {
  const [filteredKeywords, setFilteredKeywords] = useState<KeywordData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{column: string; direction: 'asc' | 'desc'}>({
    column: 'monthly_search',
    direction: 'desc'
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [paginatedKeywords, setPaginatedKeywords] = useState<KeywordData[]>([]);
  
  // Handle incoming keyword data
  useEffect(() => {
    setFilteredKeywords(keywords);
    setCurrentPage(1); // Reset to first page when new data arrives
  }, [keywords]);
  
  // Handle search
  useEffect(() => {
    if (searchQuery) {
      const filtered = keywords.filter(k => 
        k.keyword.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredKeywords(filtered);
      setCurrentPage(1); // Reset to first page when search changes
    } else {
      setFilteredKeywords(keywords);
    }
  }, [searchQuery, keywords]);
  
  // Handle pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    setPaginatedKeywords(filteredKeywords.slice(startIndex, endIndex));
  }, [filteredKeywords, currentPage]);
  
  // Handle sorting
  const handleSort = (column: string) => {
    const newDirection = 
      sortConfig.column === column && sortConfig.direction === 'desc' ? 'asc' : 'desc';
    
    setSortConfig({ column, direction: newDirection });
    
    const sorted = [...filteredKeywords].sort((a, b) => {
      // Special case for position
      if (column === 'position') {
        // Handle null values in ranking
        if (a.position === null && b.position === null) return 0;
        if (a.position === null) return newDirection === 'asc' ? 1 : -1;
        if (b.position === null) return newDirection === 'asc' ? -1 : 1;
        
        return newDirection === 'asc' 
          ? a.position - b.position 
          : b.position - a.position;
      }
      
      // For other numeric columns
      if (['monthly_search', 'competition_index', 'cpc'].includes(column)) {
        const aValue = a[column as keyof KeywordData] as number;
        const bValue = b[column as keyof KeywordData] as number;
        return newDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // For string columns
      return newDirection === 'asc'
        ? String(a[column as keyof KeywordData]).localeCompare(String(b[column as keyof KeywordData]))
        : String(b[column as keyof KeywordData]).localeCompare(String(a[column as keyof KeywordData]));
    });
    
    setFilteredKeywords(sorted);
  };
  
  // Pagination controls
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

  // Safely extract domain name from URL string
  const extractDomainName = (url: string): string => {
    try {
      // If it's already a valid URL, extract the hostname
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const urlObj = new URL(url);
        return urlObj.hostname.replace(/^www\./, '');
      }
      
      // Try with https:// prefix
      try {
        const urlObj = new URL(`https://${url}`);
        return urlObj.hostname.replace(/^www\./, '');
      } catch (e) {
        // If that fails, just return the original string
        return url.replace(/^www\./, '');
      }
    } catch (error) {
      console.warn(`Failed to extract domain from: ${url}`, error);
      return url; // Return original string if all parsing fails
    }
  };

  // Handle CSV export
  const exportToCsv = () => {
    if (keywords.length === 0) return;
    
    // Create CSV header with URL columns
    let csvContent = "Keyword,Volume,Difficulty,CPC,$,";
    csvContent += `${domain},${domain} URL,`;
    competitorDomains.forEach(comp => {
      csvContent += `${comp},${comp} URL,`;
    });
    csvContent += "\n";
    
    // Add data rows
    keywords.forEach(item => {
      csvContent += `"${item.keyword}",${item.monthly_search},${item.competition_index},${item.cpc.toFixed(2)},`;
      csvContent += `${item.position || "-"},${item.rankingUrl || "-"},`;
      competitorDomains.forEach(comp => {
        const domainName = extractDomainName(comp);
        csvContent += `${item.competitorRankings?.[domainName] || "-"},${item.competitorUrls?.[domainName] || "-"},`;
      });
      csvContent += "\n";
    });
    
    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `seo_keywords_${domain}_analysis.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clickable link component for ranking URLs
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
          <div className="flex items-center gap-2">
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
          </div>
        </div>
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
                    <TableCell colSpan={5 + competitorDomains.length} className="h-24 text-center">
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
                    <TableCell colSpan={5 + competitorDomains.length} className="h-24 text-center">
                      {keywords.length === 0 ? "No keywords found. Start an analysis first." : "No matching keywords found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {/* Pagination Controls */}
        {filteredKeywords.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-xs text-muted-foreground">
              Showing {paginatedKeywords.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to {Math.min(currentPage * rowsPerPage, filteredKeywords.length)} of {filteredKeywords.length} keywords
            </div>
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
        )}
      </CardContent>
    </Card>
  );
};

export default KeywordTable;
