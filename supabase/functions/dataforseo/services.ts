
import { makeDataForSEORequest } from "./api-client.ts";
import { corsHeaders } from "./config.ts";

// Get keywords for a specific domain
export async function getDomainKeywords(domain, locationCode = 2840, languageCode = "en") {
  try {
    // Clean the domain
    const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
    console.log(`Fetching keywords for domain: ${cleanDomain}`);
    
    // Call DataForSEO keywords_for_site endpoint
    const response = await makeDataForSEORequest('/v3/dataforseo_labs/google/keywords_for_site/live', 'POST', [
      {
        target: cleanDomain,
        location_code: locationCode || 2840,
        language_code: languageCode || "en",
        include_serp_info: false,
        include_subdomains: true,
        ignore_synonyms: false,
        include_clickstream_data: false,
        limit: 500
      }
    ]);
    
    if (response.status_code !== 20000) {
      return {
        success: false,
        error: response.status_message || "API error",
      };
    }
    
    // Convert to standard format
    const results = [];
    
    if (response.tasks && response.tasks.length > 0 && response.tasks[0].result) {
      response.tasks[0].result.forEach(resultItem => {
        if (resultItem.items && Array.isArray(resultItem.items)) {
          resultItem.items.forEach(item => {
            results.push({
              keyword: item.keyword,
              monthly_search: item.keyword_data?.keyword_info?.search_volume || 0,
              competition_index: item.keyword_data?.keyword_info?.competition_index || 0,
              cpc: item.keyword_data?.keyword_info?.cpc || 0,
              difficulty: calculateDifficulty(item),
              position: item.serp_item?.position || null,
              search_intent: determineSearchIntent(item.keyword)
            });
          });
        }
      });
    }
    
    return {
      success: true,
      results: results,
    };
  } catch (error) {
    console.error(`Error in getDomainKeywords:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Get competitor domains for a given domain
export async function getCompetitorDomains(domain, locationCode = 2840, limit = 10) {
  try {
    // Clean the domain
    const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
    
    // Call DataForSEO competitors_domain endpoint
    const response = await makeDataForSEORequest('/v3/dataforseo_labs/google/competitors_domain/live', 'POST', [
      {
        target: cleanDomain,
        location_code: locationCode,
        language_code: "en",
        limit: limit
      }
    ]);
    
    if (response.status_code !== 20000) {
      return {
        success: false,
        error: response.status_message || "API error",
      };
    }
    
    // Convert to standard format
    const results = [];
    
    if (response.tasks && response.tasks.length > 0 && response.tasks[0].result) {
      response.tasks[0].result.forEach(resultItem => {
        if (resultItem.items && Array.isArray(resultItem.items)) {
          resultItem.items.forEach(item => {
            results.push({
              competitor_domain: item.domain,
              intersections: item.intersections,
              relevance_score: item.metrics?.organic?.relevance || 0,
              shared_keywords: item.metrics?.organic?.intersections || 0,
            });
          });
        }
      });
    }
    
    return {
      success: true,
      results: results,
    };
  } catch (error) {
    console.error(`Error in getCompetitorDomains:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Get ranked keywords for a specific domain
export async function getRankedKeywords(domain, locationCode = 2840, languageCode = "en", limit = 100, orderBy = ["keyword_data.keyword_info.search_volume,desc"]) {
  try {
    // Clean the domain
    const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
    
    // Call DataForSEO ranked_keywords endpoint
    const response = await makeDataForSEORequest('/v3/dataforseo_labs/google/ranked_keywords/live', 'POST', [
      {
        target: cleanDomain,
        location_code: locationCode,
        language_code: languageCode,
        limit: limit,
        order_by: orderBy
      }
    ]);
    
    if (response.status_code !== 20000) {
      return {
        success: false,
        error: response.status_message || "API error",
      };
    }
    
    // Convert to standard format
    const results = [];
    
    if (response.tasks && response.tasks.length > 0 && response.tasks[0].result) {
      response.tasks[0].result.forEach(resultItem => {
        if (resultItem.items && Array.isArray(resultItem.items)) {
          resultItem.items.forEach(item => {
            results.push({
              keyword: item.keyword,
              position: item.position,
              previous_position: item.previous_position,
              search_volume: item.keyword_data?.keyword_info?.search_volume || 0,
              cpc: item.keyword_data?.keyword_info?.cpc || 0,
              competition: item.keyword_data?.keyword_info?.competition || 0,
              search_intent: determineSearchIntent(item.keyword),
              url: item.url
            });
          });
        }
      });
    }
    
    return {
      success: true,
      results: results,
    };
  } catch (error) {
    console.error(`Error in getRankedKeywords:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Get domain intersection (keywords that multiple domains rank for)
export async function getDomainIntersection(target1, target2, locationCode = 2840, limit = 100) {
  try {
    // Clean the domains
    const cleanTarget1 = target1.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
    const cleanTarget2 = target2.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
    
    // Call DataForSEO domain_intersection endpoint
    const response = await makeDataForSEORequest('/v3/dataforseo_labs/google/domain_intersection/live', 'POST', [
      {
        target1: cleanTarget1,
        target2: cleanTarget2,
        location_code: locationCode,
        language_code: "en",
        include_serp_info: true,
        intersections: true,
        item_types: ["organic"],
        limit: limit
      }
    ]);
    
    if (response.status_code !== 20000) {
      return {
        success: false,
        error: response.status_message || "API error",
      };
    }
    
    // Convert to standard format
    const results = [];
    
    if (response.tasks && response.tasks.length > 0 && response.tasks[0].result) {
      response.tasks[0].result.forEach(resultItem => {
        if (resultItem.items && Array.isArray(resultItem.items)) {
          resultItem.items.forEach(item => {
            results.push({
              keyword: item.keyword,
              search_volume: item.keyword_data?.keyword_info?.search_volume || 0,
              cpc: item.keyword_data?.keyword_info?.cpc || 0,
              competition: item.keyword_data?.keyword_info?.competition || 0,
              target1_position: item.target1_intersection_data?.organic_position || null,
              target2_position: item.target2_intersection_data?.organic_position || null,
              search_intent: determineSearchIntent(item.keyword)
            });
          });
        }
      });
    }
    
    return {
      success: true,
      results: results,
    };
  } catch (error) {
    console.error(`Error in getDomainIntersection:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Get domain overview
export async function getDomainOverview(domain, locationCode = 2840) {
  try {
    // Clean the domain
    const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
    
    // Call DataForSEO domain_rank_overview endpoint
    const response = await makeDataForSEORequest('/v3/dataforseo_labs/google/domain_rank_overview/live', 'POST', [
      {
        target: cleanDomain,
        location_code: locationCode,
        language_code: "en",
        ignore_synonyms: false
      }
    ]);
    
    return response;
  } catch (error) {
    console.error(`Error in getDomainOverview:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Helper functions
function calculateDifficulty(item) {
  // Create a difficulty score (0-100) based on competition and other factors
  const competition = item.keyword_data?.keyword_info?.competition_index || 0;
  const searchVolume = item.keyword_data?.keyword_info?.search_volume || 0;
  
  // Higher competition and search volume means more difficult
  let difficulty = competition;
  
  // Adjust based on search volume (higher volume typically means more competitive)
  if (searchVolume > 5000) difficulty += 10;
  else if (searchVolume > 1000) difficulty += 5;
  
  // Cap at 100
  return Math.min(100, difficulty);
}

function determineSearchIntent(keyword) {
  const keywordLower = keyword.toLowerCase();
  
  // Informational intent
  if (keywordLower.includes('how') || keywordLower.includes('what') || 
      keywordLower.includes('why') || keywordLower.includes('guide') || 
      keywordLower.includes('tutorial')) {
    return 'informational';
  }
  
  // Transactional intent
  if (keywordLower.includes('buy') || keywordLower.includes('price') || 
      keywordLower.includes('cheap') || keywordLower.includes('deal') || 
      keywordLower.includes('purchase') || keywordLower.includes('coupon') ||
      keywordLower.includes('discount')) {
    return 'transactional';
  }
  
  // Commercial intent
  if (keywordLower.includes('best') || keywordLower.includes('top') || 
      keywordLower.includes('review') || keywordLower.includes('vs') || 
      keywordLower.includes('versus') || keywordLower.includes('comparison') ||
      keywordLower.includes('compare')) {
    return 'commercial';
  }
  
  // Navigational intent
  if (keywordLower.includes('login') || keywordLower.includes('sign in') || 
      keywordLower.includes('website') || keywordLower.includes('official') || 
      keywordLower.includes('download')) {
    return 'navigational';
  }
  
  // Default to informational
  return 'informational';
}
