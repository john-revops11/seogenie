
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Settings, ExternalLink, CheckCircle, Save } from "lucide-react";
import RagSettings from "../RagSettings";
import { isPineconeConfigured, configurePinecone, getPineconeConfig } from "@/services/vector/pineconeService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AdvancedSettingsSectionProps {
  ragEnabled: boolean;
  onRagToggle: (enabled: boolean) => void;
  modelProvider?: 'openai' | 'gemini';
  onModelProviderChange?: (provider: 'openai' | 'gemini') => void;
}

const AdvancedSettingsSection: React.FC<AdvancedSettingsSectionProps> = ({
  ragEnabled,
  onRagToggle,
  modelProvider = 'openai',
  onModelProviderChange = () => {}
}) => {
  const [isPineconeReady, setIsPineconeReady] = useState(isPineconeConfigured());
  const [showPineconeConfig, setShowPineconeConfig] = useState(false);
  const [pineconeApiKey, setPineconeApiKey] = useState("");
  const [pineconeIndex, setPineconeIndex] = useState(getPineconeConfig().index);
  const [pineconeHost, setPineconeHost] = useState(getPineconeConfig().host || "");
  const [pineconeRegion, setPineconeRegion] = useState(getPineconeConfig().region || "us-east-1");
  const [selectedModelProvider, setSelectedModelProvider] = useState<'openai' | 'gemini'>(modelProvider);
  
  useEffect(() => {
    // Pre-populate with the provided values
    setPineconeApiKey("pcsk_2JMBqy_NGwjS5UqWkqAWDN6BGuW73KRJ9Hgd6G6T91LPpzsgkUMwchzzpXEQoFn7A1g797");
    setPineconeHost("https://revology-rag-llm-6hv3n2l.svc.aped-4627-b74a.pinecone.io");
    setPineconeIndex("llama-text-embed-v2-index");
    setPineconeRegion("us-east-1");
    
    // Re-check Pinecone configuration on component mount
    setIsPineconeReady(isPineconeConfigured());
    
    // Load the selected model provider from localStorage if available
    const savedProvider = localStorage.getItem('selectedAiProvider') as 'openai' | 'gemini' | null;
    if (savedProvider) {
      setSelectedModelProvider(savedProvider);
      onModelProviderChange(savedProvider);
    }
  }, []);
  
  const handleConfigurePinecone = () => {
    if (!pineconeApiKey.trim()) {
      toast.error("Please enter your Pinecone API key");
      return;
    }
    
    try {
      const result = configurePinecone(
        pineconeApiKey, 
        pineconeIndex, 
        pineconeHost, 
        pineconeRegion
      );
      setIsPineconeReady(true);
      setShowPineconeConfig(false);
      
      // Save the API integration to localStorage for system health
      const apiEnabledStates = JSON.parse(localStorage.getItem('apiEnabledStates') || '{}');
      apiEnabledStates.pinecone = true;
      localStorage.setItem('apiEnabledStates', JSON.stringify(apiEnabledStates));
      
      // Simulate API integration update
      const apiIntegrations = JSON.parse(localStorage.getItem('apiIntegrations') || '[]');
      const existingIndex = apiIntegrations.findIndex((api: any) => api.name === 'Pinecone');
      
      if (existingIndex >= 0) {
        apiIntegrations[existingIndex] = { 
          name: 'Pinecone', 
          key: pineconeApiKey.substring(0, 5) + '...',
          index: pineconeIndex,
          host: pineconeHost,
          region: pineconeRegion
        };
      } else {
        apiIntegrations.push({ 
          name: 'Pinecone', 
          key: pineconeApiKey.substring(0, 5) + '...',
          index: pineconeIndex,
          host: pineconeHost,
          region: pineconeRegion
        });
      }
      
      localStorage.setItem('apiIntegrations', JSON.stringify(apiIntegrations));
      
      toast.success("Pinecone configured successfully!");
      
      // Force a re-check of the RAG state
      setTimeout(() => {
        onRagToggle(true);
      }, 100);
    } catch (error) {
      console.error("Error configuring Pinecone:", error);
      toast.error("Failed to configure Pinecone");
    }
  };
  
  const handleModelProviderChange = (value: 'openai' | 'gemini') => {
    setSelectedModelProvider(value);
    onModelProviderChange(value);
    
    // Save the selection to localStorage
    localStorage.setItem('selectedAiProvider', value);
    
    toast.success(`Switched to ${value === 'openai' ? 'OpenAI' : 'Google Gemini'} for content generation`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-base">Advanced Settings</Label>
        <Settings className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <div className="space-y-3">
        <Label className="text-sm">AI Model Provider</Label>
        <RadioGroup 
          value={selectedModelProvider} 
          onValueChange={(value) => handleModelProviderChange(value as 'openai' | 'gemini')}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="openai" id="openai" />
            <Label htmlFor="openai" className="cursor-pointer">OpenAI (GPT-4o)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="gemini" id="gemini" />
            <Label htmlFor="gemini" className="cursor-pointer">Google Gemini 1.5 Pro</Label>
          </div>
        </RadioGroup>
        <p className="text-xs text-muted-foreground mt-1">
          Select which AI model to use for content generation
        </p>
      </div>
      
      <RagSettings 
        ragEnabled={ragEnabled && isPineconeReady} 
        onRagToggle={onRagToggle}
      />
      
      {!isPineconeReady && !showPineconeConfig && (
        <div className="text-xs flex items-center justify-between">
          <span className="text-muted-foreground">
            Configure your Pinecone settings
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-6 px-2 text-xs flex items-center gap-1"
            onClick={() => setShowPineconeConfig(true)}
          >
            Configure Pinecone
          </Button>
        </div>
      )}
      
      {showPineconeConfig && (
        <div className="p-3 border rounded-md bg-muted/10 space-y-3">
          <Label className="text-sm">Pinecone Configuration</Label>
          <div className="space-y-2">
            <div>
              <Label htmlFor="pinecone-api-key" className="text-xs">API Key</Label>
              <Input
                id="pinecone-api-key"
                value={pineconeApiKey}
                onChange={(e) => setPineconeApiKey(e.target.value)}
                placeholder="Enter your Pinecone API key"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="pinecone-index" className="text-xs">Index Name</Label>
              <Input
                id="pinecone-index"
                value={pineconeIndex}
                onChange={(e) => setPineconeIndex(e.target.value)}
                placeholder="content-index"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="pinecone-host" className="text-xs">Host URL (Optional)</Label>
              <Input
                id="pinecone-host"
                value={pineconeHost}
                onChange={(e) => setPineconeHost(e.target.value)}
                placeholder="https://your-index.svc.region.pinecone.io"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="pinecone-region" className="text-xs">Region</Label>
              <Input
                id="pinecone-region"
                value={pineconeRegion}
                onChange={(e) => setPineconeRegion(e.target.value)}
                placeholder="us-east-1"
                className="h-8 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowPineconeConfig(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                className="h-7 text-xs flex items-center gap-1"
                onClick={handleConfigurePinecone}
              >
                <Save className="h-3 w-3" /> Save
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {isPineconeReady && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-3 w-3" />
            <span>Pinecone configured</span>
          </div>
          <Button 
            variant="link" 
            size="sm" 
            className="h-6 p-0 text-xs flex items-center gap-1"
            onClick={() => setShowPineconeConfig(true)}
          >
            Update settings
          </Button>
        </div>
      )}
      
      {!isPineconeReady && (
        <div className="text-xs flex items-center justify-between">
          <span className="text-muted-foreground">
            Need a Pinecone account?
          </span>
          <Button 
            variant="link" 
            size="sm" 
            className="h-6 p-0 text-xs flex items-center gap-1"
            onClick={() => window.open("https://www.pinecone.io/", "_blank")}
          >
            Sign up for free <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground">
        These advanced settings help improve content quality and keyword organization
        by leveraging additional tools and technologies.
      </div>
    </div>
  );
};

export default AdvancedSettingsSection;
