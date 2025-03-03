
import { ApiStatusState } from "../types";
import { isPineconeConfigured, testPineconeConnection } from "@/services/vector/pineconeService";
import { initializePinecone } from "./initializePinecone";

/**
 * Initialize the Pinecone status in the API status state
 */
export const initializePineconeStatus = async (
  setApiStatus: React.Dispatch<React.SetStateAction<ApiStatusState>>
) => {
  try {
    // If Pinecone is not already configured, initialize it
    if (!isPineconeConfigured()) {
      const isConnected = await initializePinecone();
      
      if (isConnected) {
        setApiStatus(prev => ({
          ...prev,
          pinecone: {
            ...prev.pinecone,
            status: "connected",
            enabled: true,
            lastChecked: new Date()
          }
        }));
      }
    } else {
      // If already configured, just test the connection
      const isConnected = await testPineconeConnection();
      
      setApiStatus(prev => ({
        ...prev,
        pinecone: {
          ...prev.pinecone,
          status: isConnected ? "connected" : "error",
          enabled: true,
          lastChecked: new Date()
        }
      }));
    }
  } catch (error) {
    console.error("Error initializing Pinecone status:", error);
  }
};

/**
 * Calculate the overall health based on API statuses
 */
export const calculateOverallHealth = (apiStatus: ApiStatusState): "healthy" | "degraded" | "critical" | "unknown" => {
  const enabledApis = Object.values(apiStatus).filter(api => api.enabled);
  if (enabledApis.length === 0) return "unknown";
  
  const connectedCount = enabledApis.filter(api => api.status === "connected").length;
  const totalCount = enabledApis.length;
  
  if (connectedCount === totalCount) return "healthy";
  if (connectedCount === 0) return "critical";
  return "degraded";
};
