
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  CopyCheck,
  ArrowUpDown,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DataForSEOKeywordResult } from "@/hooks/keywords/useDataForSeoKeywordResearch";

interface KeywordResultsTableProps {
  data: DataForSEOKeywordResult[];
  isLoading: boolean;
  keyword: string;
  researchMethod: string;
}

type SortField = 'keyword' | 'searchVolume' | 'cpc' | 'competition';
type SortDirection = 'asc' | 'desc';

const KeywordResultsTable: React.FC<KeywordResultsTableProps> = ({
  data,
  isLoading,
  keyword,
  researchMethod
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('searchVolume');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const itemsPerPage = 10;
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const sortedData = [...data].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'keyword':
        comparison = a.keyword.localeCompare(b.keyword);
        break;
      case 'searchVolume':
        comparison = (a.searchVolume || 0) - (b.searchVolume || 0);
        break;
      case 'cpc':
        comparison = (a.cpc || 0) - (b.cpc || 0);
        break;
      case 'competition':
        comparison = (a.competition || 0) - (b.competition || 0);
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied to clipboard: ${text}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Skeleton className="h-4 w-full" /></TableHead>
              <TableHead><Skeleton className="h-4 w-full" /></TableHead>
              <TableHead><Skeleton className="h-4 w-full" /></TableHead>
              <TableHead><Skeleton className="h-4 w-full" /></TableHead>
              <TableHead><Skeleton className="h-4 w-full" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5).fill(0).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0 && keyword) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No keyword results found for "{keyword}" using {researchMethod === "related" ? "Related Keywords" : "Keyword Suggestions"} method.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Try a different keyword or research method.
        </p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Enter a keyword and select a research method to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Results for: <span className="font-bold">{keyword}</span>
          <Badge variant="outline" className="ml-2">
            {researchMethod === "related" ? "Related Keywords" : "Keyword Suggestions"}
          </Badge>
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%] cursor-pointer" onClick={() => handleSort('keyword')}>
              <div className="flex items-center">
                Keyword
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('searchVolume')}>
              <div className="flex items-center">
                Search Volume
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('cpc')}>
              <div className="flex items-center">
                CPC
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('competition')}>
              <div className="flex items-center">
                Competition
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleData.map((item, index) => {
            // Calculate trend direction
            let trendDirection = 'neutral';
            if (item.trend && Array.isArray(item.trend) && item.trend.length > 1) {
              const firstVal = item.trend[0] || 0;
              const lastVal = item.trend[item.trend.length - 1] || 0;
              trendDirection = firstVal < lastVal ? 'up' : firstVal > lastVal ? 'down' : 'neutral';
            }
            
            return (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.keyword}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {item.searchVolume?.toLocaleString() || "N/A"}
                    {trendDirection === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                    {trendDirection === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                    {trendDirection === 'neutral' && <Minus className="h-4 w-4 text-gray-500" />}
                  </div>
                </TableCell>
                <TableCell>${item.cpc?.toFixed(2) || "N/A"}</TableCell>
                <TableCell>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (item.competition || 0) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {Math.round((item.competition || 0) * 100)}%
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(item.keyword)}
                  >
                    <CopyCheck className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Page number buttons */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show 5 pages around current page
              let pageNum;
              if (totalPages <= 5) {
                // Less than 5 pages, show all
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                // Near start, show first 5
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                // Near end, show last 5
                pageNum = totalPages - 4 + i;
              } else {
                // In middle, show 2 before and 2 after
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeywordResultsTable;
