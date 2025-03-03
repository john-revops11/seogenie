
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { isPineconeConfigured } from "@/services/vector/pineconeService";
import { isGoogleAdsConfigured } from "@/services/keywords/googleAds/googleAdsClient";
import { ApiStatusState, TestResultState, ApiStatusType } from "./system-health/types";
import { 
  checkApiHealth, 
  loadApiStates, 
  loadSelectedModel, 
  saveApiStates, 
  saveSelectedModel, 
  testApi,
  initializePineconeStatus
} from "./system-health/utils";
import { CollapsedCard } from "./system-health/CollapsedCard";
import { ExpandedCard } from "./system-health/ExpandedCard";

const SystemHealthCard = () => {
  const [expanded, setExpanded] = useState(false);
  const [showTesting, setShowTesting] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatusState>({
    dataforseo: { status: "checking" as ApiStatusType, lastChecked: null, enabled: true },
    openai: { status: "checking" as ApiStatusType, lastChecked: null, enabled: true },
    googleKeyword: { status: "checking" as ApiStatusType, lastChecked: null, enabled: true },
    "google-ads": { status: "checking" as ApiStatusType, lastChecked: null, enabled: isGoogleAdsConfigured() },
    pinecone: { status: "checking" as ApiStatusType, lastChecked: null, enabled: isPineconeConfigured() },
  });
  const [checking, setChecking] = useState(false);
  const [selectedApiForTest, setSelectedApiForTest] = useState<string>("dataforseo");
  const [testResult, setTestResult] = useState<TestResultState>({
    status: "idle"
  });
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4o");

  const handleCheckApiHealth = async () => {
    await checkApiHealth(apiStatus, setApiStatus, setChecking);
  };

  const handleTestApi = async (apiId: string) => {
    await testApi(apiId, apiStatus, selectedModel, setTestResult, handleCheckApiHealth);
  };

  const toggleApiEnabled = (apiId: string) => {
    setApiStatus(prev => {
      const newStates = { 
        ...prev,
        [apiId]: {
          ...prev[apiId],
          enabled: !prev[apiId].enabled,
          status: !prev[apiId].enabled ? "checking" as ApiStatusType : "disconnected" as ApiStatusType
        }
      };
      
      saveApiStates(newStates);
      
      if (!apiStatus[apiId].enabled) {
        handleCheckApiHealth();
      }
      
      return newStates;
    });
  };

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    saveSelectedModel(value);
  };

  useEffect(() => {
    loadApiStates(setApiStatus);
    initializePineconeStatus(setApiStatus);
    loadSelectedModel(setSelectedModel);
    handleCheckApiHealth();
    
    const intervalId = setInterval(handleCheckApiHealth, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Card className={`absolute top-4 right-4 z-10 shadow-md transition-all duration-300 border-gray-200 hover:shadow-lg ${expanded ? 'w-80' : 'w-auto'}`}>
      <CardContent className="p-3">
        {expanded ? (
          <ExpandedCard
            apiStatus={apiStatus}
            checking={checking}
            showTesting={showTesting}
            setShowTesting={setShowTesting}
            checkApiHealth={handleCheckApiHealth}
            setExpanded={setExpanded}
            selectedApiForTest={selectedApiForTest}
            setSelectedApiForTest={setSelectedApiForTest}
            testResult={testResult}
            testApi={handleTestApi}
            toggleApiEnabled={toggleApiEnabled}
            selectedModel={selectedModel}
            handleModelChange={handleModelChange}
          />
        ) : (
          <CollapsedCard 
            apiStatus={apiStatus} 
            setExpanded={setExpanded} 
          />
        )}
      </CardContent>
    </Card>
  );
};

export default SystemHealthCard;
