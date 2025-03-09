import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { InfoIcon, Sparkles, Activity, Database } from "lucide-react";
import { isPineconeConfigured, testPineconeConnection } from "@/services/vector/pineconeService";
import PineconeConfigForm from "./PineconeConfigForm";
import { toast } from "sonner";

interface RagSettingsProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const RagSettings = ({ enabled, onToggle }: RagSettingsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPineconeReady, setIsPineconeReady] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  
  // Check Pinecone status initially and when component mounts
  useEffect(() => {
    checkPineconeStatus();
  }, []);
  
  const checkPineconeStatus = async () => {
    setIsChecking(true);
    try {
      // Check if Pinecone is configured
      const isPineconeConfig = isPineconeConfigured();
      
      if (isPineconeConfig) {
        // Try to make a test request to verify the connection
        try {
          const testResult = await testPineconeConnection();
          
          if (testResult.success) {
            console.info("Pinecone connection successful:", testResult.data);
            setIsPineconeReady(true);
            
            // If Pinecone is ready but RAG is not enabled, enable it automatically
            if (!enabled) {
              onToggle(true);
              toast.info("Pinecone RAG automatically enabled for enhanced content generation");
            }
          } else {
            console.error("Pinecone API error:", testResult.message);
            setIsPineconeReady(false);
          }
        } catch (error) {
          console.error("Error connecting to Pinecone:", error);
          setIsPineconeReady(false);
        }
      } else {
        setIsPineconeReady(false);
      }
    } catch (error) {
      console.error("Error checking Pinecone status:", error);
      setIsPineconeReady(false);
    } finally {
      setIsChecking(false);
    }
  };
  
  const handleToggle = (checked: boolean) => {
    if (checked && !isPineconeReady) {
      // If trying to enable RAG but Pinecone is not ready
      toast.error("Please configure Pinecone API before enabling RAG");
      return;
    }
    
    onToggle(checked);
    
    if (checked) {
      toast.success("RAG-enhanced content generation enabled");
    } else {
      toast.info("Standard content generation mode activated");
    }
  };
  
  const handleConfigSuccess = () => {
    setIsPineconeReady(true);
    checkPineconeStatus();
    toast.success("Pinecone configured successfully!");
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <Label htmlFor="rag-toggle" className="text-sm font-medium">
              RAG-Enhanced Content
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-80 text-xs">
                    Retrieval Augmented Generation (RAG) uses Pinecone vector database 
                    to find related content and enhance keyword organization.
                    This improves content relevance and quality.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            {isChecking ? (
              <Badge variant="outline" className="text-xs animate-pulse">
                <Activity className="h-3 w-3 mr-1" />
                Checking...
              </Badge>
            ) : !isPineconeReady ? (
              <Badge variant="outline" className="text-xs">
                <Database className="h-3 w-3 mr-1" />
                Setup Required
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                Ready
              </Badge>
            )}
            <Switch
              id="rag-toggle"
              checked={enabled && isPineconeReady}
              onCheckedChange={handleToggle}
              disabled={!isPineconeReady || isChecking}
            />
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground pl-6">
          {isChecking 
            ? "Checking Pinecone connection status..."
            : isPineconeReady
              ? "Organize keywords using vector similarity search for improved content quality."
              : "Configure Pinecone to enable RAG-enhanced content generation."}
        </p>
      </div>
      
      <div 
        className="underline text-xs text-muted-foreground cursor-pointer pl-6"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? "Hide configuration" : "Show configuration"}
      </div>
      
      {isExpanded && (
        <div className="pl-6 pt-2">
          <PineconeConfigForm onConfigSuccess={handleConfigSuccess} />
        </div>
      )}
    </div>
  );
};

export default RagSettings;
