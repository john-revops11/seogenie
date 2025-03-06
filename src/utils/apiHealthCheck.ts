
import { ApiStates } from "@/types/systemHealth";
import { getApiKey } from "@/services/keywords/apiConfig";
import { isPineconeConfigured } from "@/services/vector/pineconeService";

export const checkPineconeHealth = async (setApiStates: (callback: (prev: ApiStates) => ApiStates) => void) => {
  try {
    setApiStates(prev => ({
      ...prev,
      pinecone: { status: "loading" }
    }));
    
    if (isPineconeConfigured()) {
      const response = await fetch(`https://revology-rag-llm-6hv3n2l.svc.aped-4627-b74a.pinecone.io/describe_index_stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': 'pcsk_2JMBqy_NGwjS5UqWkqAWDN6BGuW73KRJ9Hgd6G6T91LPpzsgkUMwchzzpXEQoFn7A1g797'
        },
        body: JSON.stringify({ filter: {} })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.info("Pinecone connection successful:", data);
        setApiStates(prev => ({
          ...prev,
          pinecone: { 
            status: "success", 
            details: {
              vectorCount: data.totalVectorCount,
              dimension: data.dimension
            }
          }
        }));
      } else {
        throw new Error(`Pinecone API returned ${response.status}`);
      }
    } else {
      setApiStates(prev => ({
        ...prev,
        pinecone: { 
          status: "error", 
          message: "Pinecone API not configured" 
        }
      }));
    }
  } catch (error) {
    console.error("Error testing Pinecone connection:", error);
    setApiStates(prev => ({
      ...prev,
      pinecone: { 
        status: "error", 
        message: error instanceof Error ? error.message : "Unknown error" 
      }
    }));
  }
};

export const checkOpenAIHealth = async (setApiStates: (callback: (prev: ApiStates) => ApiStates) => void) => {
  try {
    setApiStates(prev => ({
      ...prev,
      openai: { 
        ...prev.openai,
        status: "loading" 
      }
    }));
    
    const openaiApiKey = getApiKey('openai');
    
    if (!openaiApiKey) {
      setApiStates(prev => ({
        ...prev,
        openai: { 
          ...prev.openai,
          status: "error", 
          message: "OpenAI API key is not configured" 
        }
      }));
      return;
    }
    
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Filter for models that are actually accessible
      const availableModels = data.data
        .filter((model: any) => 
          model.id.includes("gpt-") || 
          model.id.includes("embedding")
        )
        .map((model: any) => model.id);
      
      setApiStates(prev => ({
        ...prev,
        openai: { 
          ...prev.openai,
          status: "success", 
          details: {
            availableModels: availableModels
          }
        }
      }));
    } else {
      throw new Error(`OpenAI API returned ${response.status}`);
    }
  } catch (error) {
    console.error("Error testing OpenAI connection:", error);
    setApiStates(prev => ({
      ...prev,
      openai: { 
        ...prev.openai,
        status: "error", 
        message: error instanceof Error ? error.message : "Unknown error" 
      }
    }));
  }
};

export const checkDataForSeoHealth = async (setApiStates: (callback: (prev: ApiStates) => ApiStates) => void) => {
  try {
    setApiStates(prev => ({
      ...prev,
      dataForSeo: { status: "loading" }
    }));
    
    const dataForSeoApiKey = getApiKey("dataforseo");
    console.log("Checking DataForSEO API health with key:", dataForSeoApiKey ? "Found key" : "No key found");
    
    if (!dataForSeoApiKey) {
      console.log("DataForSEO API not configured");
      setApiStates(prev => ({
        ...prev,
        dataForSeo: { 
          status: "error", 
          message: "DataForSEO API not configured" 
        }
      }));
      return;
    }
    
    // Parse credentials
    let login, password;
    
    // Check if credentials are in username:password format
    if (dataForSeoApiKey.includes(':')) {
      [login, password] = dataForSeoApiKey.split(':');
      
      if (!login || !password) {
        console.log("Invalid DataForSEO credentials format");
        setApiStates(prev => ({
          ...prev,
          dataForSeo: { 
            status: "error", 
            message: "Invalid format. Use: username:password" 
          }
        }));
        return;
      }
    } else {
      console.log("DataForSEO credentials not in username:password format");
      setApiStates(prev => ({
        ...prev,
        dataForSeo: { 
          status: "error", 
          message: "Invalid format. Use: username:password" 
        }
      }));
      return;
    }
    
    const encodedCredentials = btoa(`${login}:${password}`);
    console.log("Making request to DataForSEO API: locations endpoint");
    
    const response = await fetch("https://api.dataforseo.com/v3/merchant/google/locations", {
      method: "GET",
      headers: {
        "Authorization": `Basic ${encodedCredentials}`,
        "Content-Type": "application/json"
      }
    });
    
    console.log(`DataForSEO API response status: ${response.status}`);
    
    if (response.ok) {
      const responseData = await response.json();
      console.log("DataForSEO connection successful", responseData);
      
      setApiStates(prev => ({
        ...prev,
        dataForSeo: { 
          status: "success", 
          message: "API connection verified",
          details: {
            username: login,
            isActive: true
          }
        }
      }));
    } else {
      const errorData = await response.json();
      console.error("DataForSEO API error:", errorData);
      throw new Error(`DataForSEO API returned ${response.status}: ${errorData?.message || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Error testing DataForSEO connection:", error);
    setApiStates(prev => ({
      ...prev,
      dataForSeo: { 
        status: "error", 
        message: error instanceof Error ? error.message : "Unknown error" 
      }
    }));
  }
};

export const checkOtherApis = (setApiStates: (callback: (prev: ApiStates) => ApiStates) => void) => {
  // Google Ads
  try {
    setApiStates(prev => ({
      ...prev,
      googleAds: { status: "loading" }
    }));
    
    const googleAdsApiKey = getApiKey("googleads");
    if (!googleAdsApiKey) {
      setApiStates(prev => ({
        ...prev,
        googleAds: { 
          status: "error", 
          message: "Google Ads API not configured" 
        }
      }));
    } else {
      setTimeout(() => {
        setApiStates(prev => ({
          ...prev,
          googleAds: { 
            status: "error", 
            message: "Failed to fetch Google Ads API" 
          }
        }));
      }, 1000);
    }
  } catch (error) {
    console.error("Error testing Google Ads API connection:", error);
    setApiStates(prev => ({
      ...prev,
      googleAds: { 
        status: "error", 
        message: error instanceof Error ? error.message : "Unknown error" 
      }
    }));
  }
  
  // RapidAPI
  try {
    setApiStates(prev => ({
      ...prev,
      rapidApi: { status: "loading" }
    }));
    
    const rapidApiKey = getApiKey("rapidapi");
    if (!rapidApiKey) {
      setApiStates(prev => ({
        ...prev,
        rapidApi: { 
          status: "error", 
          message: "RapidAPI key not configured" 
        }
      }));
    } else {
      setTimeout(() => {
        setApiStates(prev => ({
          ...prev,
          rapidApi: { 
            status: "error", 
            message: "Monthly quota exceeded (429)" 
          }
        }));
      }, 600);
    }
  } catch (error) {
    console.error("Error testing RapidAPI connection:", error);
    setApiStates(prev => ({
      ...prev,
      rapidApi: { 
        status: "error", 
        message: error instanceof Error ? error.message : "Unknown error" 
      }
    }));
  }
};

export const testAiModel = async (
  modelId: string, 
  prompt: string,
  setTestModelStatus: (status: "idle" | "loading" | "success" | "error") => void,
  setTestResponse: (response: string) => void
) => {
  if (!modelId) return;

  setTestModelStatus("loading");
  setTestResponse("");

  try {
    const openaiApiKey = getApiKey('openai');
    
    if (!openaiApiKey) {
      throw new Error("OpenAI API key is not configured");
    }
    
    const isEmbeddingModel = modelId.includes("embedding");
    
    if (isEmbeddingModel) {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelId,
          input: prompt
        })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const embedding = data.data[0].embedding;
      const dimensions = embedding.length;
      
      setTestResponse(`✅ Success! Generated ${dimensions}-dimensional embedding vector.`);
      setTestModelStatus("success");
    } else {
      // Try the specified model first
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: modelId,
            messages: [
              {
                role: "system",
                content: "You are a helpful assistant that provides brief, accurate responses."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 150
          })
        });

        if (!response.ok) {
          throw new Error(`Error with model ${modelId}: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const responseText = data.choices[0].message.content;
        
        setTestResponse(responseText);
        setTestModelStatus("success");
      } catch (error) {
        console.warn(`Error with model ${modelId}, trying GPT-4 fallback:`, error);
        
        // Try GPT-4 fallback if the first one fails
        try {
          const fallbackResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer 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`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'gpt-4',
              messages: [
                {
                  role: "system",
                  content: "You are a helpful assistant that provides brief, accurate responses."
                },
                {
                  role: "user",
                  content: prompt
                }
              ],
              temperature: 0.7,
              max_tokens: 150
            })
          });
  
          if (!fallbackResponse.ok) {
            throw new Error(`Error with GPT-4 fallback: ${fallbackResponse.status} ${fallbackResponse.statusText}`);
          }
  
          const fallbackData = await fallbackResponse.json();
          const fallbackResponseText = fallbackData.choices[0].message.content;
          
          setTestResponse(`ℹ️ Used fallback model (gpt-4):\n${fallbackResponseText}`);
          setTestModelStatus("success");
        } catch (gpt4Error) {
          console.warn(`Error with GPT-4 fallback, trying GPT-3.5-turbo as final fallback:`, gpt4Error);
          
          // Try GPT-3.5-turbo as final fallback if GPT-4 also fails
          try {
            const finalFallbackResponse = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer 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`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                  {
                    role: "system",
                    content: "You are a helpful assistant that provides brief, accurate responses."
                  },
                  {
                    role: "user",
                    content: prompt
                  }
                ],
                temperature: 0.7,
                max_tokens: 150
              })
            });
    
            if (!finalFallbackResponse.ok) {
              throw new Error(`All models failed. Final error: ${finalFallbackResponse.status} ${finalFallbackResponse.statusText}`);
            }
    
            const finalFallbackData = await finalFallbackResponse.json();
            const finalFallbackResponseText = finalFallbackData.choices[0].message.content;
            
            setTestResponse(`ℹ️ Used second fallback model (gpt-3.5-turbo):\n${finalFallbackResponseText}`);
            setTestModelStatus("success");
          } catch (finalError) {
            throw new Error(`Original error: ${error.message}, GPT-4 error: ${gpt4Error.message}, Final error: ${finalError.message}`);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error testing AI model:", error);
    setTestResponse(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    setTestModelStatus("error");
  }
};
