
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIProvider, AIModel, getModelsForProvider } from "@/types/aiModels";
import { ModelTester } from "./ModelTester";
import { ApiConfigForm } from "./ApiConfigForm";

interface AiModelConfigProps {
  apiProvider: AIProvider;
  apiKey: string;
  onApiKeyChange: (value: string) => void;
}

export const AiModelConfig: React.FC<AiModelConfigProps> = ({
  apiProvider,
  apiKey,
  onApiKeyChange
}) => {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  
  useEffect(() => {
    const models = getModelsForProvider(apiProvider);
    setAvailableModels(models);
    
    // Set default model
    if (models.length > 0) {
      const defaultModel = models.find(m => m.isPrimary) || models[0];
      setSelectedModel(defaultModel.id);
    }
  }, [apiProvider]);

  return (
    <Tabs defaultValue="config" className="w-full">
      <TabsList className="w-full grid grid-cols-2">
        <TabsTrigger value="config">Configuration</TabsTrigger>
        <TabsTrigger value="test">Test Model</TabsTrigger>
      </TabsList>
      
      <TabsContent value="config" className="space-y-4 mt-4">
        <ApiConfigForm
          apiId={apiProvider}
          apiName={apiProvider === "openai" ? "OpenAI" : "Gemini"}
          initialApiKey={apiKey}
          isTesting={false}
          testResult=""
          onApiKeyChange={onApiKeyChange}
        />
      </TabsContent>
      
      <TabsContent value="test" className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="modelSelect">Select Model</Label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name} - {model.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <ModelTester 
          apiProvider={apiProvider}
          modelId={selectedModel}
          apiKey={apiKey}
        />
      </TabsContent>
    </Tabs>
  );
};
