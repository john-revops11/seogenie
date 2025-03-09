
import React from "react";
import { MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIProvider, AIModel, getModelsForProvider } from "@/types/aiModels";
import RagSettings from "@/components/content-generator/RagSettings";

interface ChatSettingsProps {
  provider: AIProvider;
  selectedModel: string;
  availableModels: AIModel[];
  ragEnabled: boolean;
  messagesCount: number;
  isLoading: boolean;
  onProviderChange: (provider: AIProvider) => void;
  onModelChange: (model: string) => void;
  onRagToggle: (enabled: boolean) => void;
  onClearChat: () => void;
}

export const ChatSettings: React.FC<ChatSettingsProps> = ({
  provider,
  selectedModel,
  availableModels,
  ragEnabled,
  messagesCount,
  isLoading,
  onProviderChange,
  onModelChange,
  onRagToggle,
  onClearChat
}) => {
  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        Pricing Consultant
      </h3>
      
      <div className="space-y-2">
        <Label>AI Provider</Label>
        <RadioGroup 
          defaultValue={provider} 
          onValueChange={(value) => onProviderChange(value as AIProvider)}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="openai" id="openai" />
            <Label htmlFor="openai">OpenAI</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="gemini" id="gemini" />
            <Label htmlFor="gemini">Google Gemini</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="space-y-2">
        <Label>Language Model</Label>
        <Select value={selectedModel} onValueChange={onModelChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {availableModels.map(model => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedModel && (
          <p className="text-xs text-muted-foreground mt-1">
            {availableModels.find(m => m.id === selectedModel)?.description || ""}
          </p>
        )}
      </div>
      
      <RagSettings enabled={ragEnabled} onToggle={onRagToggle} />
      
      <Button 
        variant="outline" 
        onClick={onClearChat} 
        disabled={messagesCount === 0 || isLoading} 
        className="w-full"
      >
        Clear Chat
      </Button>
    </Card>
  );
};

export default ChatSettings;
