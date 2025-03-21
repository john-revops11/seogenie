
import { Card } from "@/components/ui/card";
import { keywordGapsCache } from "./keyword-gaps/KeywordGapUtils";
import { useKeywordGapAnalysis } from "@/hooks/useKeywordGapAnalysis";
import KeywordGapHeader from "./keyword-gaps/KeywordGapHeader";
import KeywordGapContent from "./keyword-gaps/KeywordGapContent";
import KeywordGapFooterSection from "./keyword-gaps/KeywordGapFooterSection";

export { keywordGapsCache };

interface KeywordGapCardProps {
  domain: string;
  competitorDomains: string[];
  keywords: any[];
  isLoading: boolean;
}

export function KeywordGapCard({ domain, competitorDomains, keywords, isLoading }: KeywordGapCardProps) {
  const {
    keywordGaps,
    loading,
    error,
    selectedKeywords,
    currentPage,
    itemsPerPage,
    displayedKeywords,
    filterCompetitor,
    apiSource,
    locationCode,
    totalKeywords,
    totalPages,
    startItem,
    endItem,
    handleKeywordSelection,
    handlePageChange,
    handleCompetitorFilterChange,
    handleApiSourceChange,
    handleLocationChange,
    refreshAnalysis
  } = useKeywordGapAnalysis(domain, competitorDomains, keywords, isLoading);

  return (
    <Card className="animate-fade-in">
      <KeywordGapHeader
        competitorDomains={competitorDomains}
        selectedKeywordsCount={selectedKeywords.length}
        isLoading={loading || isLoading}
        apiSource={apiSource}
        onApiSourceChange={handleApiSourceChange}
        locationCode={locationCode}
        onLocationChange={handleLocationChange}
      />
      
      <KeywordGapContent
        keywordGaps={keywordGaps}
        displayedKeywords={displayedKeywords}
        filterCompetitor={filterCompetitor}
        onFilterChange={handleCompetitorFilterChange}
        selectedKeywords={selectedKeywords}
        onKeywordSelection={handleKeywordSelection}
        loading={loading}
        isLoading={isLoading}
        error={error}
        onRefreshAnalysis={refreshAnalysis}
        totalKeywords={totalKeywords}
      />
      
      <KeywordGapFooterSection
        currentPage={currentPage}
        totalPages={totalPages}
        startItem={startItem}
        endItem={endItem}
        totalKeywords={totalKeywords}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={(value) => {
          keywordGapsCache.itemsPerPage = value;
        }}
        shouldShowFooter={keywordGaps !== null && keywordGaps.length > 0}
      />
    </Card>
  );
}

export default KeywordGapCard;
