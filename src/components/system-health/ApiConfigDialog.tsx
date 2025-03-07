
import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ApiDetails } from "@/types/apiIntegration";
import { toast } from "sonner";
import { getApiKey, setApiKey } from "@/services/keywords/apiConfig";
import { testSemrushConnection } from "@/services/keywords/semrushApi";
import { updateApi } from "@/services/apiIntegrationService";
import { broadcastApiChange } from "@/utils/apiIntegrationEvents";
import { ApiConfigForm } from "./ApiConfigForm";
import { AiModelConfig } from "./AiModelConfig";
import { AIProvider } from "@/types/aiModels";

interface ApiConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  api: ApiDetails;
}

export const ApiConfigDialog: React.FC<ApiConfigDialogProps> = ({ 
  isOpen, 
  onClose, 
  api 
}) => {
  const [apiKey, setApiKeyState] = useState<string>(getApiKey(api.id) || "");
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string>("");
  const [isAiApi, setIsAiApi] = useState<boolean>(false);

  useEffect(() => {
    if (api) {
      setApiKeyState(getApiKey(api.id) || "");
      setIsAiApi(api.id === "openai" || api.id === "gemini");
    }
  }, [api]);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error("API Key is required");
      return;
    }

    const updatedApi: ApiDetails = {
      ...api,
      apiKey,
      isConfigured: true,
      isActive: true
    };

    try {
      setApiKey(api.id, apiKey);
      await updateApi(updatedApi);
      toast.success(`${api.name} API key saved successfully`);
      broadcastApiChange(api.id, 'update');
      onClose();
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error(`Failed to save ${api.name} API key`);
    }
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key first");
      return;
    }

    setIsTesting(true);
    setTestResult("");

    try {
      if (api.id === "semrush") {
        const isConnected = await testSemrushConnection();
        setTestResult(isConnected ? "Connection successful!" : "Connection failed. Please check your API key.");
        toast[isConnected ? "success" : "error"](isConnected ? "Connection successful!" : "Connection failed");
      }
    } catch (error) {
      console.error(`Error testing ${api.name} connection:`, error);
      setTestResult(`Error: ${error.message || "Unknown error occurred"}`);
      toast.error("Test failed");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {api.icon && <span>{api.icon}</span>}
            Configure {api.name} API
          </DialogTitle>
          <DialogDescription>
            {api.description || `Enter your ${api.name} API credentials to integrate with this service.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isAiApi ? (
            <AiModelConfig 
              apiProvider={api.id as AIProvider}
              apiKey={apiKey}
              onApiKeyChange={setApiKeyState}
            />
          ) : (
            <ApiConfigForm
              apiId={api.id}
              apiName={api.name}
              initialApiKey={apiKey}
              isTesting={isTesting}
              testResult={testResult}
              onApiKeyChange={setApiKeyState}
              onTest={handleTest}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
