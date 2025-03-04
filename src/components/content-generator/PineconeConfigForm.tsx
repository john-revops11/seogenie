import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  PlusCircle,
  InfoIcon,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import { 
  configurePinecone, 
  getPineconeConfig, 
  isPineconeConfigured 
} from "@/services/vector/pineconeService";

interface PineconeConfigFormProps {
  onConfigSuccess?: () => void;
}

export const PineconeConfigForm = ({ onConfigSuccess }: PineconeConfigFormProps) => {
  const [apiKey, setApiKey] = useState("");
  const [indexName, setIndexName] = useState("content-index");
  const [isConfigured, setIsConfigured] = useState(isPineconeConfigured());
  const [configDetails, setConfigDetails] = useState(() => {
    try {
      return getPineconeConfig();
    } catch (error) {
      return { apiKey: "", index: "", environment: "" };
    }
  });
  
  const handleSaveConfig = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter a valid Pinecone API Key");
      return;
    }
    
    try {
      configurePinecone(apiKey, indexName);
      setIsConfigured(true);
      setConfigDetails(getPineconeConfig());
      toast.success("Pinecone configured successfully");
      setApiKey(""); // Clear for security
      
      if (onConfigSuccess) {
        onConfigSuccess();
      }
    } catch (error) {
      toast.error(`Failed to configure Pinecone: ${(error as Error).message}`);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-500" />
          <h3 className="text-sm font-medium">Pinecone Vector DB</h3>
        </div>
        
        {isConfigured ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Configured</span>
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            <span>Not Configured</span>
          </Badge>
        )}
      </div>
      
      <div className="text-xs text-muted-foreground">
        Connect to Pinecone to enhance content generation with Retrieval Augmented Generation (RAG).
      </div>
      
      {isConfigured ? (
        <div className="rounded-md border p-3 bg-muted/30 space-y-2">
          <div className="text-xs">
            <strong>API Key:</strong> {configDetails.apiKey}
          </div>
          <div className="text-xs">
            <strong>Index:</strong> {configDetails.index}
          </div>
          <div className="text-xs">
            <strong>Environment:</strong> {configDetails.environment}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs mt-2"
            onClick={() => setIsConfigured(false)}
          >
            Update Configuration
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="pinecone-api-key" className="text-xs">
              <div className="flex items-center gap-1">
                <span>Pinecone API Key</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="w-3 h-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-80 text-xs">
                        Get your API key from the Pinecone dashboard. This enables RAG for enhanced content generation.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </Label>
            <Input
              id="pinecone-api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Pinecone API Key"
              type="password"
              className="text-xs"
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="pinecone-index" className="text-xs">Index Name</Label>
            <Input
              id="pinecone-index"
              value={indexName}
              onChange={(e) => setIndexName(e.target.value)}
              placeholder="content-index"
              className="text-xs"
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            className="w-full text-xs"
            onClick={handleSaveConfig}
            disabled={!apiKey.trim()}
          >
            <PlusCircle className="w-3 h-3 mr-1" />
            Configure Pinecone
          </Button>
        </div>
      )}
    </div>
  );
};

export default PineconeConfigForm;
