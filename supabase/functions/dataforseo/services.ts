
import { corsHeaders, supabase } from "./config.ts";
import * as competitorsService from "./services/competitors.ts";
import * as intersectionService from "./services/intersection.ts";
import * as keywordsService from "./services/keywords.ts";
import * as overviewService from "./services/overview.ts";
import * as rankingsService from "./services/rankings.ts";

// Export getDomainKeywords for external use
export const getDomainKeywords = keywordsService.getDomainKeywords;

// Export getCompetitorDomains for external use
export const getCompetitorDomains = competitorsService.getCompetitorDomains;

// Export getRankedKeywords for external use
export const getRankedKeywords = rankingsService.getRankedKeywords;

// Export getDomainIntersection for external use
export const getDomainIntersection = intersectionService.getDomainIntersection;

// Export getDomainOverview for external use
export const getDomainOverview = overviewService.getDomainOverview;
