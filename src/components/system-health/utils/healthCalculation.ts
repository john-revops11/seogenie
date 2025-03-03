
import { ApiStatusState } from "../types";
import { isPineconeConfigured } from "@/services/vector/pineconeService";

export const calculateOverallHealth = (apiStatus: ApiStatusState): "healthy" | "degraded" | "critical" => {
  const enabledApis = Object.entries(apiStatus).filter(([_, data]) => data.enabled);
  
  if (enabledApis.length === 0) {
    return "critical";
  }
  
  const statuses = enabledApis.map(([_, data]) => data.status);
  
  if (statuses.some(status => status === "checking")) {
    return "degraded";
  }
  
  if (statuses.every(status => status === "connected")) {
    return "healthy";
  }
  
  if (statuses.filter(status => status === "error").length >= Math.ceil(enabledApis.length / 2)) {
    return "critical";
  }
  
  return "degraded";
};

export const initializePineconeStatus = (setApiStatus: React.Dispatch<React.SetStateAction<ApiStatusState>>): void => {
  const isPineconeReady = isPineconeConfigured();
  setApiStatus(prev => ({
    ...prev,
    pinecone: {
      ...prev.pinecone,
      enabled: isPineconeReady,
      status: isPineconeReady ? "checking" : "disconnected" as const
    }
  }));
};
