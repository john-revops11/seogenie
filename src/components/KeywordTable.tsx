
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Search, Download, ArrowUpDown, Loader2 } from "lucide-react";

interface KeywordData {
  keyword: string;
  volume: number;
  difficulty: number;
  cpc: number;
  mainRanking: number | null;
  competitorRankings: Record<string, number | null>;
}

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
    column: 'volume',
    direction: 'desc'
  });
  
  // Handle incoming keyword data
  useEffect(() => {
    setFilteredKeywords(keywords);
  }, [keywords]);
  
  // Handle search
  useEffect(() => {
    if (searchQuery) {
      const filtered = keywords.filter(k => 
        k.keyword.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredKeywords(filtered);
    } else {
      setFilteredKeywords(keywords);
    }
  }, [searchQuery, keywords]);
  
  // Handle sorting
  const handleSort = (column: string) => {
    const newDirection = 
      sortConfig.column === column && sortConfig.direction === 'desc' ? 'asc' : 'desc';
    
    setSortConfig({ column, direction: newDirection });
    
    const sorted = [...filteredKeywords].sort((a, b) => {
      // Special case for mainRanking
      if (column === 'mainRanking') {
        // Handle null values in ranking
        if (a.mainRanking === null && b.mainRanking === null) return 0;
        if (a.mainRanking === null) return newDirection === 'asc' ? 1 : -1;
        if (b.mainRanking === null) return newDirection === 'asc' ? -1 : 1;
        
        return newDirection === 'asc' 
          ? a.mainRanking - b.mainRanking 
          : b.mainRanking - a.mainRanking;
      }
      
      // For other numeric columns
      if (['volume', 'difficulty', 'cpc'].includes(column)) {
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

  // Handle CSV export
  const exportToCsv = () => {
    if (keywords.length === 0) return;
    
    // Create CSV header
    let csvContent = "Keyword,Volume,Difficulty,CPC,$,";
    csvContent += `${domain},`;
    competitorDomains.forEach(comp => {
      csvContent += `${comp},`;
    });
    csvContent += "\n";
    
    // Add data rows
    keywords.forEach(item => {
      csvContent += `"${item.keyword}",${item.volume},${item.difficulty},${item.cpc.toFixed(2)},`;
      csvContent += `${item.mainRanking || "-"},`;
      competitorDomains.forEach(comp => {
        const domainName = new URL(comp).hostname.replace(/^www\./, '');
        csvContent += `${item.competitorRankings[domainName] || "-"},`;
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
                  <TableHead onClick={() => handleSort('volume')} className="cursor-pointer">
                    <div className="flex items-center">
                      Volume
                      {sortConfig.column === 'volume' && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort('difficulty')} className="cursor-pointer">
                    <div className="flex items-center">
                      Difficulty
                      {sortConfig.column === 'difficulty' && (
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
                  <TableHead onClick={() => handleSort('mainRanking')} className="cursor-pointer">
                    <div className="flex items-center">
                      {domain} <ArrowUpDown className="ml-1 h-3 w-3" />
                    </div>
                  </TableHead>
                  {competitorDomains.map((competitor, index) => (
                    <TableHead key={index}>
                      {new URL(competitor).hostname.replace(/^www\./, '')}
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
                ) : filteredKeywords.length > 0 ? (
                  filteredKeywords.map((item, index) => (
                    <TableRow key={index} className="transition-all hover:bg-muted/50">
                      <TableCell className="font-medium">{item.keyword}</TableCell>
                      <TableCell>{item.volume.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={getDifficultyColor(item.difficulty)}>{item.difficulty}/100</span>
                      </TableCell>
                      <TableCell>${item.cpc.toFixed(2)}</TableCell>
                      <TableCell>
                        {item.mainRanking ? (
                          <Badge className={`${getRankingBadgeColor(item.mainRanking)}`}>
                            {item.mainRanking}
                          </Badge>
                        ) : (
                          <Badge variant="outline">-</Badge>
                        )}
                      </TableCell>
                      {competitorDomains.map((competitor, idx) => {
                        const domainName = new URL(competitor).hostname.replace(/^www\./, '');
                        return (
                          <TableCell key={idx}>
                            {item.competitorRankings[domainName] ? (
                              <Badge className={`${getRankingBadgeColor(item.competitorRankings[domainName])}`}>
                                {item.competitorRankings[domainName]}
                              </Badge>
                            ) : (
                              <Badge variant="outline">-</Badge>
                            )}
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
        <div className="text-xs text-muted-foreground mt-4">
          {keywords.length > 0 && (
            <>Showing {filteredKeywords.length} out of {keywords.length} keywords</>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KeywordTable;
