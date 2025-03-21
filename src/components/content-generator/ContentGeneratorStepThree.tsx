import React, { useEffect, useState } from "react";
import { getApiKey } from "@/services/keywords/apiConfig";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { defaultAIModels, AIProvider, AIModel, getModelsForProvider, getPrimaryModelForProvider } from "@/types/aiModels";
import { WORD_COUNT_OPTIONS } from "./WordCountSelector";
import { Button } from "@/components/ui/button";

interface ContentGeneratorStepThreeProps {
  contentType: string;
  selectedTemplateId: string;
  title: string;
  selectedKeywords: string[];
  creativity: number;
  ragEnabled: boolean;
  isGenerating: boolean;
  aiProvider: AIProvider;
  aiModel: string;
  wordCountOption: string;
  customSubheadings?: string[];
  onAIProviderChange: (provider: AIProvider) => void;
  onAIModelChange: (model: string) => void;
  onGenerateContent: () => void;
  onBack: () => void;
}

const ContentGeneratorStepThree: React.FC<ContentGeneratorStepThreeProps> = ({
  contentType,
  selectedTemplateId,
  title,
  selectedKeywords,
  creativity,
  ragEnabled,
  isGenerating,
  aiProvider,
  aiModel,
  wordCountOption,
  customSubheadings = [],
  onAIProviderChange,
  onAIModelChange,
  onGenerateContent,
  onBack
}) => {
  const [apiConfigured, setApiConfigured] = useState(true);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  
  useEffect(() => {
    const apiKey = getApiKey(aiProvider);
    if (!apiKey) {
      setApiConfigured(false);
      toast.error(`${aiProvider === 'openai' ? 'OpenAI' : 'Gemini AI'} API key is not configured. Please configure it in API Settings.`);
    } else {
      setApiConfigured(true);
    }
    
    setAvailableModels(getModelsForProvider(aiProvider));
    
    if (!aiModel || !availableModels.some(m => m.id === aiModel)) {
      const primaryModel = getPrimaryModelForProvider(aiProvider);
      if (primaryModel) {
        onAIModelChange(primaryModel.id);
      } else if (availableModels.length > 0) {
        onAIModelChange(availableModels[0].id);
      }
    }
  }, [aiProvider, aiModel, availableModels.length, onAIModelChange]);

  const handleGenerateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!apiConfigured) {
      toast.error(`Cannot generate content: ${aiProvider === 'openai' ? 'OpenAI' : 'Gemini AI'} API key is not configured`);
      return;
    }
    onGenerateContent();
  };

  const getModelName = (modelId: string): string => {
    const model = availableModels.find(m => m.id === modelId);
    return model ? model.name : modelId;
  };

  const selectedWordCount = WORD_COUNT_OPTIONS.find(option => option.value === wordCountOption);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Step 4: Generate Content</h3>
      
      {!apiConfigured && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-700">API Configuration Error</h4>
            <p className="text-sm text-red-600">
              {aiProvider === 'openai' ? 'OpenAI' : 'Gemini AI'} API key is not configured. 
              Please go to API Settings to configure your API key before generating content.
            </p>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <div className="space-y-3">
          <Label>AI Provider</Label>
          <Select 
            value={aiProvider} 
            onValueChange={(value: string) => onAIProviderChange(value as AIProvider)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select AI provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="gemini">Gemini AI</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-3">
          <Label>AI Model</Label>
          <Select 
            value={aiModel} 
            onValueChange={onAIModelChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select AI model" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map(model => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex flex-col">
                    <span>{model.name}</span>
                    <span className="text-xs text-muted-foreground">{model.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {availableModels.find(m => m.id === aiModel)?.description || 
             "Select a model for content generation"}
          </p>
        </div>
        
        <div className="p-4 bg-muted/30 rounded-md">
          <h4 className="font-medium">Content Configuration</h4>
          <div className="mt-2 text-sm">
            <div><span className="font-medium">Content Type:</span> {contentType}</div>
            <div><span className="font-medium">Template:</span> {selectedTemplateId || "Standard"}</div>
            <div><span className="font-medium">Title:</span> {title}</div>
            <div><span className="font-medium">Keywords:</span> {selectedKeywords.join(", ")}</div>
            <div><span className="font-medium">Creativity:</span> {creativity}%</div>
            <div><span className="font-medium">Word Count:</span> {selectedWordCount ? selectedWordCount.description : "Standard"}</div>
            <div><span className="font-medium">Generation Method:</span> {ragEnabled ? "RAG-Enhanced" : "Standard"}</div>
            <div><span className="font-medium">AI Provider:</span> {aiProvider === 'openai' ? 'OpenAI' : 'Gemini AI'}</div>
            <div><span className="font-medium">AI Model:</span> {getModelName(aiModel)}</div>
          </div>
          
          {customSubheadings.length > 0 && (
            <div className="mt-3">
              <h5 className="text-sm font-medium">Selected Subheadings ({customSubheadings.length})</h5>
              <ul className="mt-1 text-xs list-disc pl-5">
                {customSubheadings.map((heading, index) => (
                  <li key={index}>{heading}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <Button
          onClick={handleGenerateClick}
          type="button"
          disabled={isGenerating || !apiConfigured}
          className="w-full px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {isGenerating ? "Generating Content..." : !apiConfigured ? "API Not Configured" : "Generate Content"}
        </Button>
      </div>
      
      <div className="flex justify-between">
        <Button
          onClick={onBack}
          type="button"
          variant="ghost"
          className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Back
        </Button>
      </div>
    </div>
  );
};

export default ContentGeneratorStepThree;
