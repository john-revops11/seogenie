
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Search, Download, ArrowUpDown } from "lucide-react";

// Mock keyword data generator
const generateKeywordData = (domain: string, competitors: string[]) => {
  const keywordList = [
    "seo tools", "keyword research", "backlink checker", "seo analysis", 
    "website ranking", "content optimization", "meta description", "search engine optimization",
    "google ranking", "keyword tracking", "competitor analysis", "seo audit", 
    "link building", "on-page seo", "technical seo", "mobile optimization",
    "local seo", "page speed", "domain authority", "featured snippets"
  ];
  
  return keywordList.map(keyword => {
    const volume = Math.floor(Math.random() * 10000) + 100;
    const difficulty = Math.floor(Math.random() * 100);
    const cpc = parseFloat((Math.random() * 5).toFixed(2));
    
    const competitorRankings = {};
    competitors.forEach(comp => {
      competitorRankings[comp] = Math.random() < 0.7 ? Math.floor(Math.random() * 100) + 1 : null;
    });
    
    return {
      keyword,
      volume,
      difficulty,
      cpc,
      mainRanking: Math.random() < 0.6 ? Math.floor(Math.random() * 100) + 1 : null,
      competitorRankings
    };
  });
};

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
}

const KeywordTable = ({ domain, competitorDomains }: KeywordTableProps) => {
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [filteredKeywords, setFilteredKeywords] = useState<KeywordData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{column: string; direction: 'asc' | 'desc'}>({
    column: 'volume',
    direction: 'desc'
  });
  
  // Initialize data
  useEffect(() => {
    const data = generateKeywordData(domain, competitorDomains);
    setKeywords(data);
    setFilteredKeywords(data);
  }, [domain, competitorDomains]);
  
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
              />
            </div>
            <Button variant="outline" size="icon" className="transition-all">
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
                      {competitor}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKeywords.map((item, index) => (
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
                    {competitorDomains.map((competitor, idx) => (
                      <TableCell key={idx}>
                        {item.competitorRankings[competitor] ? (
                          <Badge className={`${getRankingBadgeColor(item.competitorRankings[competitor])}`}>
                            {item.competitorRankings[competitor]}
                          </Badge>
                        ) : (
                          <Badge variant="outline">-</Badge>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {filteredKeywords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5 + competitorDomains.length} className="h-24 text-center">
                      No keywords found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-4">
          Showing {filteredKeywords.length} out of {keywords.length} keywords
        </div>
      </CardContent>
    </Card>
  );
};

export default KeywordTable;
