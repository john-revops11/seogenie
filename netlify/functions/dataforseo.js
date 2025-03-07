
const fetch = require('node-fetch');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// DataForSEO credentials
const login = "armin@revologyanalytics.com";
const password = "ab4016dc9302b8cf";
const AUTH_HEADER = Buffer.from(`${login}:${password}`).toString('base64');

// Helper function to make DataForSEO API requests
async function makeDataForSEORequest(endpoint, method, data = null) {
  const url = `https://api.dataforseo.com${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Authorization': `Basic ${AUTH_HEADER}`,
      'Content-Type': 'application/json',
    },
  };
  
  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }
  
  try {
    console.log(`Making DataForSEO request to ${url}`);
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DataForSEO API request failed with status ${response.status}: ${errorText}`);
      throw new Error(`API request failed with status ${response.status}: ${errorText.substring(0, 200)}`);
    }
    
    const json = await response.json();
    console.log(`DataForSEO response success: ${json.status_code === 20000}`);
    
    // Check for API-level errors
    if (json.status_code !== 20000) {
      throw new Error(`DataForSEO API error: ${json.status_message}`);
    }
    
    return json;
  } catch (error) {
    console.error(`Error making DataForSEO request to ${endpoint}:`, error);
    throw error;
  }
}

// Function to get domain keywords
async function getDomainKeywords(domain, location_code = 2840) {
  const task = [{
    target: domain.startsWith('http') ? domain : `https://${domain}`,
    location_code,
    language_code: "en",
    limit: 100,
  }];
  
  try {
    // Use the correct endpoint for domain keywords
    const result = await makeDataForSEORequest('/v3/dataforseo_labs/domain_keywords/live', 'POST', task);
    const keywords = result?.tasks?.[0]?.result?.[0]?.items || [];
    
    return {
      success: true,
      results: keywords.map((item) => ({
        keyword: item.keyword || "",
        search_volume: item.search_volume || 0,
        position: item.position || null,
        cpc: item.cpc || 0,
        traffic: item.traffic || 0,
        competition: item.competition_index || 0,
      })),
    };
  } catch (error) {
    console.error('Error getting domain keywords:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }
  
  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Only POST requests are supported' })
    };
  }
  
  try {
    console.log("DataForSEO Edge Function received a request");
    
    // Parse request body
    let body;
    try {
      body = JSON.parse(event.body);
      console.log("Request body:", JSON.stringify(body).substring(0, 500) + "...");
    } catch (error) {
      console.error('Error parsing request body:', error);
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'Invalid JSON in request body' })
      };
    }
    
    const { action, domain, keywords, location_code = 2840 } = body;
    
    if (!action) {
      throw new Error('Action is required');
    }
    
    let result;
    
    switch (action) {
      case 'domain_keywords':
        if (!domain) {
          throw new Error('Domain is required');
        }
        result = await getDomainKeywords(domain, location_code);
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error processing request:', error);
    
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: error.message || 'Unknown error' })
    };
  }
};
