
import { useState, useEffect } from "react";
import { ApiDetails } from "@/types/apiIntegration";
import { getDefaultApiConfigs } from "@/data/defaultApiConfigs";
import { toast } from "sonner";
import { 
  testPineconeConnection, 
  isPineconeConfigured 
} from "@/services/vector/pineconeService";
import { getApiKey } from "@/services/keywords/apiConfig";

const useApiHealth = () => {
  const [apis, setApis] = useState<ApiDetails[]>(getDefaultApiConfigs());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApiStatus = async () => {
      setIsLoading(true);
      
      try {
        // Check each API status
        const updatedApis = await Promise.all(
          apis.map(async (api) => {
            // Determine if API is configured and active
            const apiKey = getApiKey(api.id);
            const isConfigured = Boolean(apiKey);
            
            let isActive = false;
            
            // Test connection based on API type
            if (isConfigured) {
              try {
                switch (api.id) {
                  case "pinecone":
                    if (isPineconeConfigured()) {
                      const result = await testPineconeConnection();
                      isActive = result.success;
                    }
                    break;
                    
                  case "openai":
                  case "gemini":
                  case "dataforseo":
                    // Simple validation for these APIs - if key exists, mark as active
                    // (actual testing happens when we use them)
                    isActive = Boolean(apiKey);
                    break;
                    
                  default:
                    isActive = false;
                }
              } catch (error) {
                console.error(`Error testing ${api.id} connection:`, error);
                isActive = false;
              }
            }
            
            return {
              ...api,
              isConfigured,
              apiKey: apiKey || api.apiKey,
              isActive
            };
          })
        );
        
        setApis(updatedApis);
      } catch (error) {
        console.error("Error fetching API status:", error);
        toast.error("Failed to load API status");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApiStatus();
  }, []);
  
  const testConnection = async (apiId: string): Promise<boolean> => {
    try {
      const api = apis.find(a => a.id === apiId);
      
      if (!api) {
        throw new Error(`API ${apiId} not found`);
      }
      
      switch (apiId) {
        case "pinecone":
          const pineconeResult = await testPineconeConnection();
          
          if (pineconeResult.success) {
            setApis(prev => prev.map(a => 
              a.id === apiId ? { ...a, isActive: true } : a
            ));
            return true;
          } else {
            throw new Error(pineconeResult.message);
          }
          
        case "openai":
          // Simple OpenAI API verification
          const openaiKey = getApiKey("openai");
          if (!openaiKey) throw new Error("OpenAI API key not configured");
          
          const openaiResponse = await fetch("https://api.openai.com/v1/models", {
            headers: {
              "Authorization": `Bearer ${openaiKey}`
            }
          });
          
          if (!openaiResponse.ok) {
            throw new Error(`OpenAI API error: ${openaiResponse.status}`);
          }
          
          setApis(prev => prev.map(a => 
            a.id === apiId ? { ...a, isActive: true } : a
          ));
          return true;
          
        case "gemini":
          // Simple Gemini API verification
          const geminiKey = getApiKey("gemini");
          if (!geminiKey) throw new Error("Gemini API key not configured");
          
          const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
          
          if (!geminiResponse.ok) {
            throw new Error(`Gemini API error: ${geminiResponse.status}`);
          }
          
          setApis(prev => prev.map(a => 
            a.id === apiId ? { ...a, isActive: true } : a
          ));
          return true;
          
        case "dataforseo":
          // Check DataForSEO API
          const dataForSeoKey = getApiKey("dataforseo");
          if (!dataForSeoKey) throw new Error("DataForSEO API key not configured");
          
          // Credentials format should be username:password
          if (!dataForSeoKey.includes(":")) {
            throw new Error("DataForSEO credentials should be in format username:password");
          }
          
          const [username, password] = dataForSeoKey.split(":");
          const credentials = btoa(`${username}:${password}`);
          
          const dataForSeoResponse = await fetch("https://api.dataforseo.com/v3/merchant/google/locations", {
            headers: {
              "Authorization": `Basic ${credentials}`
            }
          });
          
          if (!dataForSeoResponse.ok) {
            throw new Error(`DataForSEO API error: ${dataForSeoResponse.status}`);
          }
          
          setApis(prev => prev.map(a => 
            a.id === apiId ? { ...a, isActive: true } : a
          ));
          return true;
          
        default:
          throw new Error(`Testing for ${apiId} not implemented`);
      }
    } catch (error) {
      console.error(`Error testing ${apiId} connection:`, error);
      
      // Update the API status to inactive
      setApis(prev => prev.map(a => 
        a.id === apiId ? { ...a, isActive: false } : a
      ));
      
      throw error;
    }
  };

  return {
    apis,
    isLoading,
    testConnection
  };
};

export default useApiHealth;
