
import { KeywordData } from "@/services/keywordService";
import { categorizeKeywordIntent } from "@/components/keyword-gaps/KeywordGapUtils";

// Function to extract domain name from URL
export const extractDomainName = (url: string): string => {
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const urlObj = new URL(url);
      return urlObj.hostname.replace(/^www\./, '');
    }
    
    try {
      const urlObj = new URL(`https://${url}`);
      return urlObj.hostname.replace(/^www\./, '');
    } catch (e) {
      return url.replace(/^www\./, '');
    }
  } catch (error) {
    console.warn(`Failed to extract domain from: ${url}`, error);
    return url;
  }
};

// Function to determine ranking badge color based on position
export const getRankingBadgeColor = (ranking: number | null) => {
  if (ranking === null) return "bg-gray-200 text-gray-700";
  if (ranking <= 3) return "bg-green-100 text-green-800";
  if (ranking <= 10) return "bg-blue-100 text-blue-800";
  if (ranking <= 30) return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
};

// Function to determine difficulty color based on score
export const getDifficultyColor = (difficulty: number) => {
  if (difficulty < 30) return "text-green-600";
  if (difficulty < 60) return "text-amber-600";
  return "text-red-600";
};

// Function to get intent label for a keyword
export const getIntentLabel = (keyword: string, difficulty: number, volume: number): string => {
  const intent = categorizeKeywordIntent(keyword, difficulty, volume);
  switch (intent) {
    case 'informational': return 'Info';
    case 'navigational': return 'Nav';
    case 'commercial': return 'Com';
    case 'transactional': return 'Trans';
    default: return 'Info';
  }
};

// Function to get intent badge color based on intent type
export const getIntentBadgeColor = (keyword: string, difficulty: number, volume: number): string => {
  const intent = categorizeKeywordIntent(keyword, difficulty, volume);
  switch (intent) {
    case 'informational':
      return "bg-blue-100 text-blue-800";
    case 'navigational':
      return "bg-purple-100 text-purple-800";
    case 'commercial':
      return "bg-amber-100 text-amber-800";
    case 'transactional':
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Function to export keywords to CSV
export const exportToCsv = (keywords: KeywordData[], domain?: string, competitorDomains?: string[]) => {
  if (keywords.length === 0) return;
  
  const mainDomain = domain || '';
  const competitors = competitorDomains || [];
  
  let csvContent = "Keyword,Volume,Difficulty,CPC,$,Intent,";
  csvContent += `${mainDomain},${mainDomain} URL,`;
  competitors.forEach(comp => {
    csvContent += `${comp},${comp} URL,`;
  });
  csvContent += "\n";
  
  keywords.forEach(item => {
    const intent = getIntentLabel(item.keyword, item.competition_index, item.monthly_search);
    csvContent += `"${item.keyword}",${item.monthly_search},${item.competition_index},${item.cpc.toFixed(2)},$,${intent},`;
    csvContent += `${item.position || "-"},${item.rankingUrl || "-"},`;
    competitorDomains?.forEach(comp => {
      const domainName = extractDomainName(comp);
      csvContent += `${item.competitorRankings?.[domainName] || "-"},${item.competitorUrls?.[domainName] || "-"},`;
    });
    csvContent += "\n";
  });
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `seo_keywords_${mainDomain || 'analysis'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
