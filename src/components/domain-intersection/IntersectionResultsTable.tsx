
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";
import { IntersectionKeyword } from "@/hooks/useDomainIntersection";
import { getCompetitionLevelColor, getPositionDifference, KeywordBadges, PositionDifferenceBadge } from "./IntersectionTableUtils";

interface IntersectionResultsTableProps {
  intersectionData: IntersectionKeyword[];
  domains: { target1: string; target2: string };
  lastUpdated: string | null;
}

export function IntersectionResultsTable({ 
  intersectionData,
  domains,
  lastUpdated 
}: IntersectionResultsTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof IntersectionKeyword;
    direction: 'asc' | 'desc';
  }>({
    key: 'search_volume',
    direction: 'desc'
  });

  const handleSort = (key: keyof IntersectionKeyword) => {
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

  const sortedData = [...intersectionData].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const renderSortIcon = (column: keyof IntersectionKeyword) => {
    if (sortConfig.key === column) {
      return sortConfig.direction === 'asc' ? 
        <TrendingUp className="ml-1 h-4 w-4" /> : 
        <TrendingDown className="ml-1 h-4 w-4" />;
    }
    return <ArrowUpDown className="ml-1 h-4 w-4" />;
  };

  return (
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
            {sortedData.map((keyword, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {keyword.keyword}
                    <KeywordBadges keyword={keyword} />
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
                  <PositionDifferenceBadge keyword={keyword} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
