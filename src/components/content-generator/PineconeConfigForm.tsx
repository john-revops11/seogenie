
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { configurePinecone, getPineconeConfig, testPineconeConnection } from "@/services/vector/pineconeService";
import { toast } from "sonner";

interface PineconeConfigFormProps {
  onConfigSuccess?: () => void;
}

export const PineconeConfigForm: React.FC<PineconeConfigFormProps> = ({ onConfigSuccess }) => {
  const [apiKey, setApiKey] = useState("");
  const [index, setIndex] = useState("revology-rag-llm");
  const [environment, setEnvironment] = useState("aped-4627-b74a");
  const [isConfigured, setIsConfigured] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"none" | "success" | "error">("none");
  const [statusMessage, setStatusMessage] = useState("");
  const [vectorCount, setVectorCount] = useState(0);
  
  // Load current configuration when component mounts
  useEffect(() => {
    const config = getPineconeConfig();
    setApiKey(config.apiKey);
    setIndex(config.index);
    setEnvironment(config.environment);
    setIsConfigured(config.apiKey !== "");
    
    if (config.apiKey !== "") {
      testPineconeStatus();
    }
  }, []);
  
  const testPineconeStatus = async () => {
    setIsTesting(true);
    setConnectionStatus("none");
    setStatusMessage("Testing connection...");
    
    try {
      const result = await testPineconeConnection();
      
      if (result.success) {
        setConnectionStatus("success");
        setStatusMessage("Connection successful");
        setVectorCount(result.data?.totalVectorCount || 0);
      } else {
        setConnectionStatus("error");
        setStatusMessage(result.message);
      }
    } catch (error) {
      setConnectionStatus("error");
      setStatusMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsTesting(false);
    }
  };
  
  const handleSaveConfig = async () => {
    if (!apiKey.trim() || !index.trim() || !environment.trim()) {
      toast.error("All fields are required");
      return;
    }
    
    try {
      // Configure Pinecone
      const result = configurePinecone(apiKey, index, environment);
      
      if (result.success) {
        setIsConfigured(true);
        toast.success("Pinecone configuration saved");
        
        // Test the connection
        await testPineconeStatus();
        
        // Call the success callback if provided
        if (onConfigSuccess) {
          onConfigSuccess();
        }
      } else {
        toast.error("Failed to save configuration");
      }
    } catch (error) {
      toast.error(`Configuration error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="pinecone-api-key">Pinecone API Key</Label>
        <Input
          id="pinecone-api-key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="pcsk_..."
        />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="pinecone-index">Index Name</Label>
          <Input
            id="pinecone-index"
            value={index}
            onChange={(e) => setIndex(e.target.value)}
            placeholder="my-index"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="pinecone-environment">Environment</Label>
          <Input
            id="pinecone-environment"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            placeholder="us-west1-gcp"
          />
        </div>
      </div>
      
      <div className="flex space-x-3">
        <Button 
          onClick={handleSaveConfig}
          className="flex-1"
          disabled={!apiKey.trim() || !index.trim() || !environment.trim() || isTesting}
        >
          Save Configuration
        </Button>
        
        <Button
          variant="outline"
          onClick={testPineconeStatus}
          disabled={isTesting || !isConfigured}
          className="whitespace-nowrap"
        >
          {isTesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            "Test Connection"
          )}
        </Button>
      </div>
      
      {connectionStatus !== "none" && (
        <div className={`p-3 rounded-md flex items-center space-x-2 ${
          connectionStatus === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {connectionStatus === "success" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <div className="flex-1">
            <div className="font-medium">{connectionStatus === "success" ? "Connected" : "Connection Failed"}</div>
            <div className="text-sm">{statusMessage}</div>
            {connectionStatus === "success" && vectorCount > 0 && (
              <div className="text-sm">Vector count: {vectorCount}</div>
            )}
          </div>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground">
        <p>Need a Pinecone account? <a href="https://www.pinecone.io/" target="_blank" rel="noopener noreferrer" className="underline">Sign up for Pinecone</a></p>
        <p className="mt-1">Default Pinecone API key: <span className="font-mono text-xs">pcsk_2JMBqy_NGwjS5UqWkqAWDN6BGuW73KRJ9Hgd6G6T91LPpzsgkUMwchzzpXEQoFn7A1g797</span></p>
      </div>
    </div>
  );
};

export default PineconeConfigForm;
