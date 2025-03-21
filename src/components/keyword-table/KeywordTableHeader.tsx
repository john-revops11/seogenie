
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
import { extractDomainName } from "./utils";

interface TableHeaderProps {
  sortConfig: {
    column: string;
    direction: 'asc' | 'desc';
  };
  handleSort: (column: string) => void;
  domain: string;
  competitorDomains: string[];
}

const KeywordTableHeader = ({
  sortConfig,
  handleSort,
  domain,
  competitorDomains
}: TableHeaderProps) => {
  return (
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
  );
};

export default KeywordTableHeader;
