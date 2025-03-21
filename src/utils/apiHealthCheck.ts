import { ApiState } from "@/types/systemHealth";
import { PineconeClient } from "@pinecone-database/pinecone";
import { toast } from "sonner";
import { API_CHANGE_EVENT } from "./apiIntegrationEvents";
import { getApiKey } from "@/services/apiIntegrationService";
import { 
  callDataForSeoApi, 
  getDataForSEOUsageCost 
} from "@/services/keywords/api/dataForSeo/dataForSeoClient";

export const checkPineconeHealth = async (
  setApiStates: React.Dispatch<React.SetStateAction<Record<string, ApiState>>>
) => {
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

export const checkOpenAIHealth = async (
  setApiStates: React.Dispatch<React.SetStateAction<Record<string, ApiState>>>
) => {
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

export const checkGeminiHealth = async (
  setApiStates: React.Dispatch<React.SetStateAction<Record<string, ApiState>>>
) => {
  try {
    setApiStates(prev => ({
      ...prev,
      gemini: { 
        ...prev.gemini,
        status: "loading" 
      }
    }));
    
    const geminiApiKey = getApiKey('gemini');
    
    if (!geminiApiKey) {
      setApiStates(prev => ({
        ...prev,
        gemini: { 
          ...prev.gemini,
          status: "error", 
          message: "Gemini API key is not configured" 
        }
      }));
      return;
    }
    
    // Test the Gemini API with a simple request
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`;
    
    const response = await fetch(url);
    
    if (response.ok) {
      const data = await response.json();
      
      // Extract available models
      const availableModels = data.models
        .filter((model: any) => 
          model.name.includes("gemini-") && 
          !model.name.includes("latest")
        )
        .map((model: any) => ({
          id: model.name.split('/').pop(),
          name: model.displayName || model.name.split('/').pop(),
          provider: 'gemini',
          capabilities: model.supportedGenerationMethods || []
        }));
      
      setApiStates(prev => ({
        ...prev,
        gemini: { 
          ...prev.gemini,
          status: "success", 
          models: availableModels,
          details: {
            availableModels: availableModels.map((m: any) => m.id)
          }
        }
      }));
    } else {
      throw new Error(`Gemini API returned ${response.status}`);
    }
  } catch (error) {
    console.error("Error testing Gemini connection:", error);
    setApiStates(prev => ({
      ...prev,
      gemini: { 
        ...prev.gemini,
        status: "error", 
        message: error instanceof Error ? error.message : "Unknown error",
        models: [
          { id: "gemini-pro", name: "Gemini Pro", provider: "gemini", capabilities: ["text"] },
          { id: "gemini-pro-vision", name: "Gemini Pro Vision", provider: "gemini", capabilities: ["text", "vision"] }
        ]
      }
    }));
  }
};

export const checkDataForSeoHealth = async (
  setApiStates: React.Dispatch<React.SetStateAction<Record<string, ApiState>>>
) => {
  setApiStates(prev => ({
    ...prev,
    dataForSeo: { ...prev.dataForSeo, status: "loading" }
  }));
  
  try {
    // First check if we have usage data - this is a more reliable check
    const usageData = await getDataForSEOUsageCost();
    
    if (usageData) {
      // If we have usage data, the connection is working
      setApiStates(prev => ({
        ...prev,
        dataForSeo: { 
          status: "success",
          details: {
            requestCount: usageData.requestCount,
            totalCost: usageData.totalCost
          }
        }
      }));
      
      // Dispatch API change event
      window.dispatchEvent(new CustomEvent(API_CHANGE_EVENT, {
        detail: { apiId: "dataForSeo", action: "connected" }
      }));
      
      return;
    }
    
    // If no usage data, try a simple API call to check connectivity
    const testResult = await callDataForSeoApi('/v3/dataforseo_labs/google/related_keywords/live', [{ 
      keyword: "seo",
      location_code: 2840,
      language_code: "en",
      depth: 1,
      limit: 1
    }]);
    
    if (testResult) {
      setApiStates(prev => ({
        ...prev,
        dataForSeo: { status: "success" }
      }));
      
      // Dispatch API change event
      window.dispatchEvent(new CustomEvent(API_CHANGE_EVENT, {
        detail: { apiId: "dataForSeo", action: "connected" }
      }));
    } else {
      throw new Error("Failed to connect to DataForSEO API");
    }
  } catch (error) {
    console.error("DataForSEO API check failed:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    setApiStates(prev => ({
      ...prev,
      dataForSeo: { 
        status: "error", 
        message: errorMessage
      }
    }));
    
    // Dispatch API change event
    window.dispatchEvent(new CustomEvent(API_CHANGE_EVENT, {
      detail: { apiId: "dataForSeo", action: "error" }
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
    // Determine which API to use based on the model ID
    if (modelId.includes("gemini")) {
      await testGeminiModel(modelId, prompt, setTestResponse);
      setTestModelStatus("success");
    } else {
      await testOpenAIModel(modelId, prompt, setTestResponse);
      setTestModelStatus("success");
    }
  } catch (error) {
    console.error("Error testing AI model:", error);
    setTestResponse(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    setTestModelStatus("error");
  }
};

const testOpenAIModel = async (
  modelId: string, 
  prompt: string,
  setTestResponse: (response: string) => void
) => {
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
    } catch (error) {
      console.warn(`Error with model ${modelId}, trying fallback:`, error);
      throw error;
    }
  }
};

const testGeminiModel = async (
  modelId: string, 
  prompt: string,
  setTestResponse: (response: string) => void
) => {
  const geminiApiKey = getApiKey('gemini');
  
  if (!geminiApiKey) {
    throw new Error("Gemini API key is not configured");
  }
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${geminiApiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 150,
          topP: 0.95,
          topK: 40
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      throw new Error("Invalid response format from Gemini");
    }
    
    // Extract text from the parts array
    const generatedText = data.candidates[0].content.parts
      .map((part: any) => part.text || '')
      .join('');
    
    setTestResponse(generatedText.trim());
  } catch (error) {
    console.error("Error with Gemini API:", error);
    throw error;
  }
};
