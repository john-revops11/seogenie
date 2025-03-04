
import { KeywordData } from "@/services/keywordService";

export interface KeywordTableProps {
  domain: string;
  competitorDomains: string[];
  keywords: KeywordData[];
  isLoading: boolean;
  onAddCompetitor?: (newCompetitor: string) => void;
  onRemoveCompetitor?: (competitorToRemove: string) => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  isLoading: boolean;
}

export interface CompetitorManagementProps {
  domain: string;
  competitorDomains: string[];
  onAddCompetitor: (newCompetitor: string) => void;
  onRemoveCompetitor: (competitorToRemove: string) => void;
  isLoading: boolean;
}

export interface KeywordFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  intentFilter: string;
  setIntentFilter: (intent: string) => void;
  uniqueIntents: string[];
  isLoading: boolean;
  keywords: KeywordData[];
  onExportCsv: () => void;
}

export interface TableHeaderProps {
  sortConfig: {
    column: string;
    direction: 'asc' | 'desc';
  };
  handleSort: (column: string) => void;
  domain: string;
  competitorDomains: string[];
  extractDomainName: (url: string) => string;
}

export interface RankingLinkProps {
  url: string | null | undefined;
  position: number | null | undefined;
  getRankingBadgeColor: (ranking: number | null) => string;
}
