
import { 
  Search, 
  Zap, 
  Database, 
  MessageSquareText,
  ExternalLink,
  BarChart,
  Sparkles
} from "lucide-react";
import { ApiDetails } from "@/types/apiIntegration";

export const getDefaultApiConfigs = (): ApiDetails[] => [
  {
    id: "pinecone",
    name: "Pinecone",
    description: "Vector database for semantic search",
    icon: <Database className="h-5 w-5 text-blue-600" />,
    iconName: "database",
    isConfigured: false,
    isActive: false
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "AI models for content generation",
    icon: <MessageSquareText className="h-5 w-5 text-green-600" />,
    iconName: "messageSquareText",
    apiKey: "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",
    isConfigured: true,
    isActive: true
  },
  {
    id: "gemini",
    name: "Gemini AI",
    description: "Google's AI models for content generation",
    icon: <Sparkles className="h-5 w-5 text-purple-600" />,
    iconName: "sparkles",
    apiKey: "AIzaSyCJIDNvI7w8jpjyWLI9yaPp3PWAeD95AnA",
    isConfigured: true,
    isActive: true
  },
  {
    id: "dataforseo",
    name: "DataForSEO",
    description: "Keyword research API (username:password format)",
    icon: <Search className="h-5 w-5 text-amber-600" />,
    iconName: "search",
    apiKey: "armin@revologyanalytics.com:ab4016dc9302b8cf",
    isConfigured: true,
    isActive: true
  },
  {
    id: "googleads",
    name: "Google Ads",
    description: "Keyword and ad performance data",
    icon: <Zap className="h-5 w-5 text-red-600" />,
    iconName: "zap",
    isConfigured: false,
    isActive: false
  },
  {
    id: "rapidapi",
    name: "RapidAPI",
    description: "API marketplace for keyword tools",
    icon: <ExternalLink className="h-5 w-5 text-purple-600" />,
    iconName: "externalLink",
    apiKey: "6549be50bbmsh1d48a68f7367e70p18d2c2jsnacb70e5f1571",
    isConfigured: true,
    isActive: false
  },
  {
    id: "semrush",
    name: "SemRush",
    description: "Competitor research and keyword analytics",
    icon: <BarChart className="h-5 w-5 text-teal-600" />,
    iconName: "barChart",
    isConfigured: false,
    isActive: false
  }
];
