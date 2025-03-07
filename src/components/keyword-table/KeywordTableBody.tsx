
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Loader2, Database, Server, Info } from "lucide-react";
import { KeywordData } from "@/services/keywordService";
import { Badge } from "@/components/ui/badge";
import RankingLink from "./RankingLink";
import { 
  extractDomainName, 
  getDifficultyColor, 
  getIntentBadgeColor, 
  getIntentLabel 
} from "./utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface KeywordTableBodyProps {
  paginatedKeywords: KeywordData[];
  isLoading: boolean;
  competitorDomains: string[];
  keywords: KeywordData[];
  domain: string;
}

const KeywordTableBody = ({ 
  paginatedKeywords, 
  isLoading, 
  competitorDomains, 
  keywords,
  domain
}: KeywordTableBodyProps) => {
  // Calculate keyword counts for main domain and each competitor
  const getKeywordCount = (domainName: string | null) => {
    if (!domainName) return 0;
    
    // For main domain, count keywords where position is not null
    if (domainName === extractDomainName(domain)) {
      return keywords.filter(kw => kw.position !== null).length;
    }
    
    // For competitors, count keywords where their position is not null
    return keywords.filter(kw => 
      kw.competitorRankings && 
      kw.competitorRankings[domainName] !== undefined
    ).length;
  };
  
  // Determine the data source based on keyword metadata
  const getDataSource = (isForMainDomain: boolean) => {
    // Check if we're using mock data
    const hasMockData = keywords.some(kw => 
      (isForMainDomain && !kw.rankingUrl?.includes('http')) || 
      (!isForMainDomain && kw.competitorUrls && Object.values(kw.competitorUrls).some(url => !url?.includes('http')))
    );
    
    if (hasMockData) {
      return {
        icon: <Database className="h-4 w-4 text-muted-foreground" />,
        label: "Sample Data",
        description: "This data is synthetically generated for demonstration"
      };
    }
    
    // Check if it's from an API source
    return {
      icon: <Server className="h-4 w-4 text-primary" />,
      label: "API Data",
      description: "This data is from a real API source"
    };
  };
  
  const mainDomainName = extractDomainName(domain);
  const mainDomainCount = getKeywordCount(mainDomainName);
  const mainDomainSource = getDataSource(true);
  
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
              <div className="flex items-center space-x-2">
                <RankingLink url={item.rankingUrl} position={item.position} />
                
                {index === 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground border px-1.5 py-0.5 rounded-sm">
                          {mainDomainSource.icon}
                          <span>{mainDomainCount}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="space-y-1">
                          <p className="font-medium">{mainDomainSource.label}</p>
                          <p className="text-xs">{mainDomainSource.description}</p>
                          <p className="text-xs font-medium">Found {mainDomainCount} keywords for {mainDomainName}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </TableCell>
            
            {competitorDomains.map((competitor, idx) => {
              const domainName = extractDomainName(competitor);
              const competitorCount = getKeywordCount(domainName);
              const competitorSource = getDataSource(false);
              
              return (
                <TableCell key={idx}>
                  <div className="flex items-center space-x-2">
                    <RankingLink 
                      url={item.competitorUrls?.[domainName]} 
                      position={item.competitorRankings?.[domainName]} 
                    />
                    
                    {index === 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground border px-1.5 py-0.5 rounded-sm">
                              {competitorSource.icon}
                              <span>{competitorCount}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <div className="space-y-1">
                              <p className="font-medium">{competitorSource.label}</p>
                              <p className="text-xs">{competitorSource.description}</p>
                              <p className="text-xs font-medium">Found {competitorCount} keywords for {domainName}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
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
