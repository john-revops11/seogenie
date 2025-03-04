
import React from "react";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { KeywordData } from "@/services/keywordService";
import { categorizeKeywordIntent } from "@/components/keyword-gaps/KeywordGapUtils";
import RankingLink from "./RankingLink";

interface KeywordTableBodyProps {
  paginatedKeywords: KeywordData[];
  isLoading: boolean;
  competitorDomains: string[];
  extractDomainName: (url: string) => string;
  keywords: KeywordData[];
  getRankingBadgeColor: (ranking: number | null) => string;
  getDifficultyColor: (difficulty: number) => string;
  getIntentBadgeColor: (keyword: string, difficulty: number, volume: number) => string;
  getIntentLabel: (keyword: string, difficulty: number, volume: number) => string;
}

const KeywordTableBody: React.FC<KeywordTableBodyProps> = ({
  paginatedKeywords,
  isLoading,
  competitorDomains,
  extractDomainName,
  keywords,
  getRankingBadgeColor,
  getDifficultyColor,
  getIntentBadgeColor,
  getIntentLabel
}) => {
  return (
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
              <RankingLink 
                url={item.rankingUrl} 
                position={item.position} 
                getRankingBadgeColor={getRankingBadgeColor} 
              />
            </TableCell>
            {competitorDomains.map((competitor, idx) => {
              const domainName = extractDomainName(competitor);
              return (
                <TableCell key={idx}>
                  <RankingLink 
                    url={item.competitorUrls?.[domainName]} 
                    position={item.competitorRankings?.[domainName]} 
                    getRankingBadgeColor={getRankingBadgeColor}
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
  );
};

export default KeywordTableBody;
