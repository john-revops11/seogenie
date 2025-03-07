import { useState, useEffect, useMemo } from "react";
import { KeywordData } from "@/services/keywordService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import KeywordTableHeader from "@/components/keyword-table/KeywordTableHeader";
import KeywordTableBody from "@/components/keyword-table/KeywordTableBody";
import KeywordPagination from "@/components/keyword-table/KeywordPagination";
import KeywordFilter from "@/components/keyword-table/KeywordFilter";
import CompetitorManagement from "@/components/keyword-table/CompetitorManagement";
import SeoStrategyRunner from "@/components/keyword-table/SeoStrategyRunner";
import { Table } from "@/components/ui/table";
import { categorizeKeywordIntent } from "@/components/keyword-gaps/KeywordGapUtils";

interface KeywordTableProps {
  domain: string;
  competitorDomains: string[];
  keywords: KeywordData[];
  isLoading: boolean;
  onAddCompetitor?: (newCompetitor: string) => void;
  onRemoveCompetitor?: (competitorToRemove: string) => void;
}

const KeywordTable = ({ 
  domain, 
  competitorDomains, 
  keywords, 
  isLoading, 
  onAddCompetitor, 
  onRemoveCompetitor 
}: KeywordTableProps) => {
  const [filteredKeywords, setFilteredKeywords] = useState<KeywordData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{column: string; direction: 'asc' | 'desc'}>({
    column: 'monthly_search',
    direction: 'desc'
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [paginatedKeywords, setPaginatedKeywords] = useState<KeywordData[]>([]);
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
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
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
              <SeoStrategyRunner
                domain={domain}
                competitorDomains={competitorDomains}
                keywords={keywords}
                isLoading={isLoading}
              />
            )}
            
            <KeywordFilter
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              intentFilter={intentFilter}
              setIntentFilter={setIntentFilter}
              uniqueIntents={uniqueIntents}
              isLoading={isLoading}
              keywords={keywords}
            />
            
            {onAddCompetitor && (
              <CompetitorManagement
                domain={domain}
                competitorDomains={competitorDomains}
                onAddCompetitor={onAddCompetitor}
                onRemoveCompetitor={onRemoveCompetitor || (() => {})}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <KeywordTableHeader
                sortConfig={sortConfig}
                handleSort={handleSort}
                domain={domain}
                competitorDomains={competitorDomains}
              />
              <KeywordTableBody
                paginatedKeywords={paginatedKeywords}
                isLoading={isLoading}
                competitorDomains={competitorDomains}
                keywords={keywords}
                domain={domain}
              />
            </Table>
          </div>
        </div>
        
        {filteredKeywords.length > 0 && (
          <KeywordPagination
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            totalItems={filteredKeywords.length}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            isLoading={isLoading}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default KeywordTable;
