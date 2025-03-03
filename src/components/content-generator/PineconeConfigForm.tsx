
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  configurePinecone, 
  getPineconeConfig, 
  isPineconeConfigured 
} from "@/services/vector/config";

interface PineconeConfigFormProps {
  onConfigured: () => void;
  onCancel?: () => void;
}

const PineconeConfigForm: React.FC<PineconeConfigFormProps> = ({ 
  onConfigured,
  onCancel 
}) => {
  const config = getPineconeConfig();
  const [pineconeApiKey, setPineconeApiKey] = useState("");
  const [pineconeIndex, setPineconeIndex] = useState(config.index);
  const [pineconeHost, setPineconeHost] = useState(config.host || "");
  const [pineconeRegion, setPineconeRegion] = useState(config.region || "us-east-1");
  
  const handleSave = () => {
    if (!pineconeApiKey.trim()) {
      toast.error("Please enter your Pinecone API key");
      return;
    }
    
    try {
      configurePinecone(
        pineconeApiKey, 
        pineconeIndex, 
        pineconeHost, 
        pineconeRegion
      );
      
      // Save to API integrations for display in settings
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
      
      toast.success("Pinecone configuration saved!");
      onConfigured();
    } catch (error) {
      console.error("Error configuring Pinecone:", error);
      toast.error(`Failed to save Pinecone configuration: ${(error as Error).message}`);
    }
  };

  return (
    <div className="space-y-3">
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
        {onCancel && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button
          variant="default"
          size="sm"
          className="h-7 text-xs"
          onClick={handleSave}
        >
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default PineconeConfigForm;
