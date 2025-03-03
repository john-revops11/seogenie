import { ApiHealth, ApiStatus, ApiStatusItem } from '../types';
import { testPineconeConnection } from '@/services/vector/connection';

const getDefaultApiStatus = (): ApiStatus => ({
  mainApiStatus: {
    name: 'Main API',
    status: 'unknown',
    lastChecked: null,
  },
  googleApiStatus: {
    name: 'Google API',
    status: 'unknown',
    lastChecked: null,
  },
  dataForSeoApiStatus: {
    name: 'DataForSEO API',
    status: 'unknown',
    lastChecked: null,
  },
  pineconeApiStatus: {
    name: 'Pinecone API',
    status: 'unknown',
    lastChecked: null,
  },
});

const updateApiHealth = (status: ApiStatus, setApiHealth: React.Dispatch<React.SetStateAction<ApiHealth>>): void => {
  const operationalCount = Object.values(status).filter(api => api.status === 'operational').length;
  const totalApis = Object.keys(status).length;
  const healthPercentage = (operationalCount / totalApis) * 100;

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
  setApiStatus: React.Dispatch<React.SetStateAction<ApiStatus>>,
  setApiHealth: React.Dispatch<React.SetStateAction<ApiHealth>>
): Promise<void> => {
  try {
    const storedStatus = localStorage.getItem('apiStatus');
    const status = storedStatus ? JSON.parse(storedStatus) : getDefaultApiStatus();
    
    // Ensure Pinecone status is checked on initialization
    if (status.pineconeApiStatus) {
      const isPineconeWorking = await testPineconeConnection();
      status.pineconeApiStatus.status = isPineconeWorking ? 'operational' : 'down';
      status.pineconeApiStatus.lastChecked = new Date().toISOString();
    }
    
    setApiStatus(status);
    updateApiHealth(status, setApiHealth);
  } catch (error) {
    console.error('Error initializing API status check:', error);
  }
};
