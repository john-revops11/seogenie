
import { useState, useEffect } from 'react';
import { ApiDetails } from '@/types/apiIntegration';
import { loadApisFromStorage } from '@/services/apiIntegrationService';

export const useApiHealth = () => {
  const [apis, setApis] = useState<ApiDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadApis = () => {
      setIsLoading(true);
      const savedApis = loadApisFromStorage();
      setApis(savedApis);
      setIsLoading(false);
    };

    loadApis();

    // Listen for API changes
    const handleApiChange = () => {
      loadApis();
    };

    window.addEventListener('api-change', handleApiChange);
    
    return () => {
      window.removeEventListener('api-change', handleApiChange);
    };
  }, []);

  return { apis, isLoading };
};

export default useApiHealth;
