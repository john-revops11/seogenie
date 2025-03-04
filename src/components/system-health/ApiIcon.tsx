
import { 
  Database, 
  MessageSquareText, 
  Zap, 
  Activity, 
  ExternalLink, 
  BarChart 
} from "lucide-react";
import { ApiIconProps } from "@/types/systemHealth";
import { cn } from "@/lib/utils";

export const ApiIcon = ({ api, className }: ApiIconProps) => {
  return (
    <span className={cn("inline-block", className)}>
      {getApiIcon(api)}
    </span>
  );
};

export const getApiIcon = (api: string) => {
  switch (api) {
    case "pinecone": return <Database className="h-4 w-4" />;
    case "openai": return <MessageSquareText className="h-4 w-4" />;
    case "googleAds": return <Zap className="h-4 w-4" />;
    case "dataForSeo": return <Activity className="h-4 w-4" />;
    case "rapidApi": return <ExternalLink className="h-4 w-4" />;
    case "semrush": return <BarChart className="h-4 w-4" />;
    default: return <Activity className="h-4 w-4" />;
  }
};

export const getApiName = (api: string) => {
  switch (api) {
    case "pinecone": return "Pinecone";
    case "openai": return "OpenAI";
    case "googleAds": return "Google Ads";
    case "dataForSeo": return "DataForSEO";
    case "rapidApi": return "RapidAPI";
    case "semrush": return "SemRush";
    default: return api;
  }
};

export const getFixSuggestion = (api: string, status: string) => {
  if (status !== "error") return null;
  
  switch (api) {
    case "pinecone":
      return "Configure Pinecone API key in Settings";
    case "openai":
      return "Update OpenAI API key or check quota";
    case "googleAds":
      return "Verify Google Ads credentials and network";
    case "dataForSeo":
      return "Subscription payment required";
    case "rapidApi":
      return "Upgrade RapidAPI plan or wait for quota reset";
    case "semrush":
      return "Check SemRush API key or subscription";
    default:
      return "Check API configuration";
  }
};
