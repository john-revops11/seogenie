
import { ApiHealth, ApiStatus, ApiStatusState } from '../types';
import { testPineconeConnection } from '@/services/vector/connection';

export const getDefaultApiStatus = (): ApiStatusState => ({
  mainApi: {
    status: "checking" as ApiStatus,
    lastChecked: null,
    enabled: true
  },
  googleKeyword: {
    status: "checking" as ApiStatus,
    lastChecked: null,
    enabled: true
  },
  dataforseo: {
    status: "checking" as ApiStatus,
    lastChecked: null,
    enabled: true
  },
  pinecone: {
    status: "checking" as ApiStatus,
    lastChecked: null,
    enabled: true
  },
});

export const updateApiHealth = (status: ApiStatusState, setApiHealth: React.Dispatch<React.SetStateAction<ApiHealth>>): void => {
  const operationalCount = Object.values(status).filter(api => api.status === 'connected' && api.enabled).length;
  const totalEnabledApis = Object.values(status).filter(api => api.enabled).length;
  
  if (totalEnabledApis === 0) {
    setApiHealth('unhealthy');
    return;
  }
  
  const healthPercentage = (operationalCount / totalEnabledApis) * 100;

  let health: ApiHealth = 'unhealthy';
  if (healthPercentage === 100) {
    health = 'healthy';
  } else if (healthPercentage >= 50) {
    health = 'degraded';
  }

  setApiHealth(health);
};

/**
 * Check API statuses at app initialization
 */
export const initializeApiStatusCheck = async (
  setApiStatus: React.Dispatch<React.SetStateAction<ApiStatusState>>,
  setApiHealth: React.Dispatch<React.SetStateAction<ApiHealth>>
): Promise<void> => {
  try {
    const storedStatus = localStorage.getItem('apiStatus');
    const status = storedStatus ? JSON.parse(storedStatus) : getDefaultApiStatus();
    
    // Ensure Pinecone status is checked on initialization
    if (status.pinecone && status.pinecone.enabled) {
      const isPineconeWorking = await testPineconeConnection();
      status.pinecone.status = isPineconeWorking ? 'connected' as ApiStatus : 'error' as ApiStatus;
      status.pinecone.lastChecked = new Date();
    }
    
    setApiStatus(status);
    updateApiHealth(status, setApiHealth);
  } catch (error) {
    console.error('Error initializing API status check:', error);
  }
};

/**
 * Check all API health status
 */
export const checkApiHealth = async (
  apiStatus: ApiStatusState,
  setApiStatus: React.Dispatch<React.SetStateAction<ApiStatusState>>,
  setChecking: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> => {
  setChecking(true);
  
  try {
    const updatedStatus = { ...apiStatus };
    
    // Check Pinecone API if enabled
    if (updatedStatus.pinecone && updatedStatus.pinecone.enabled) {
      updatedStatus.pinecone.status = "checking" as ApiStatus;
      const isPineconeWorking = await testPineconeConnection();
      updatedStatus.pinecone.status = isPineconeWorking ? "connected" as ApiStatus : "error" as ApiStatus;
      updatedStatus.pinecone.lastChecked = new Date();
    }
    
    // TODO: Implement other API health checks
    // Simulate checking other APIs
    Object.keys(updatedStatus).forEach(key => {
      if (key !== 'pinecone' && updatedStatus[key].enabled) {
        const hasError = localStorage.getItem(`${key}Errors`);
        updatedStatus[key].status = hasError ? "error" as ApiStatus : "connected" as ApiStatus;
        updatedStatus[key].lastChecked = new Date();
      }
    });
    
    setApiStatus(updatedStatus);
    localStorage.setItem('apiStatus', JSON.stringify(updatedStatus));
  } catch (error) {
    console.error('Error checking API health:', error);
  } finally {
    setChecking(false);
  }
};
