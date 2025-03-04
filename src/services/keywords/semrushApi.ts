
import { getApiKey } from './apiConfig';
import { toast } from 'sonner';

// SemRush API endpoints
const BASE_URL = "https://api.semrush.com/analytics/v1/";

interface SemRushParams {
  domain?: string;
  keyword?: string;
  database?: string;
  display_limit?: number;
  export_columns?: string;
  display_date?: string;
  [key: string]: string | number | undefined;
}

export const isSemrushConfigured = (): boolean => {
  return Boolean(getApiKey('semrush'));
};

export const fetchDomainOverview = async (domain: string): Promise<any> => {
  const apiKey = getApiKey('semrush');
  
  if (!apiKey) {
    toast.error("SemRush API key not configured");
    throw new Error("SemRush API key not configured");
  }
  
  const params: SemRushParams = {
    type: "domain_ranks",
    domain,
    database: "us",
    export_columns: "Dn,Rk,Or,Ot,Oc,Ad,At,Ac",
    key: apiKey
  };
  
  try {
    const response = await fetchFromSemrush(params);
    return parseSemrushCSV(response);
  } catch (error) {
    console.error("Error fetching domain overview from SemRush:", error);
    throw error;
  }
};

export const fetchKeywordData = async (keyword: string): Promise<any> => {
  const apiKey = getApiKey('semrush');
  
  if (!apiKey) {
    toast.error("SemRush API key not configured");
    throw new Error("SemRush API key not configured");
  }
  
  const params: SemRushParams = {
    type: "phrase_this",
    phrase: keyword,
    database: "us",
    export_columns: "Ph,Nq,Cp,Co,Nr,Td",
    display_limit: 10,
    key: apiKey
  };
  
  try {
    const response = await fetchFromSemrush(params);
    return parseSemrushCSV(response);
  } catch (error) {
    console.error("Error fetching keyword data from SemRush:", error);
    throw error;
  }
};

export const fetchDomainKeywords = async (domain: string, limit: number = 100): Promise<any> => {
  const apiKey = getApiKey('semrush');
  
  if (!apiKey) {
    toast.error("SemRush API key not configured");
    throw new Error("SemRush API key not configured");
  }
  
  const params: SemRushParams = {
    type: "domain_organic",
    domain,
    database: "us",
    export_columns: "Ph,Po,Pp,Nq,Cp,Co,Tr,Tc,Nr,Td",
    display_limit: limit,
    key: apiKey
  };
  
  try {
    const response = await fetchFromSemrush(params);
    return parseSemrushCSV(response);
  } catch (error) {
    console.error("Error fetching domain keywords from SemRush:", error);
    throw error;
  }
};

const fetchFromSemrush = async (params: SemRushParams): Promise<string> => {
  const url = new URL(BASE_URL);
  
  // Add parameters to URL
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, String(value));
    }
  });
  
  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SemRush API error: ${response.status} - ${errorText}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error("Error fetching from SemRush API:", error);
    throw error;
  }
};

// Helper function to parse SemRush CSV response
const parseSemrushCSV = (csvData: string): any[] => {
  // Handle error responses
  if (csvData.startsWith("ERROR")) {
    const errorMessage = csvData.split(" :: ")[1] || "Unknown error";
    toast.error(`SemRush API error: ${errorMessage}`);
    throw new Error(`SemRush API error: ${errorMessage}`);
  }
  
  // Parse CSV data
  const lines = csvData.trim().split("\n");
  
  if (lines.length <= 1) {
    return [];
  }
  
  const headers = lines[0].split(";");
  
  return lines.slice(1).map(line => {
    const values = line.split(";");
    const entry: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      entry[header] = values[index] || "";
    });
    
    return entry;
  });
};

// Test the SemRush API connection
export const testSemrushConnection = async (): Promise<boolean> => {
  try {
    const apiKey = getApiKey('semrush');
    
    if (!apiKey) {
      return false;
    }
    
    const params: SemRushParams = {
      type: "domain_ranks",
      domain: "example.com",
      database: "us",
      export_columns: "Dn",
      display_limit: 1,
      key: apiKey
    };
    
    const response = await fetchFromSemrush(params);
    return !response.startsWith("ERROR");
  } catch (error) {
    console.error("Error testing SemRush API connection:", error);
    return false;
  }
};
