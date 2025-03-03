
import { Dispatch, SetStateAction } from "react";

export type ApiStatus = "connected" | "disconnected" | "error" | "checking";

export interface ApiStatusItem {
  status: ApiStatus;
  lastChecked: Date | null;
  errorMessage?: string;
  enabled: boolean;
}

export interface ApiStatusState {
  [key: string]: ApiStatusItem;
}

export interface ApiDetail {
  id: string;
  name: string;
  description: string;
}

export interface AiModel {
  id: string;
  name: string;
  description: string;
}

export interface TestResultState {
  status: "idle" | "success" | "error" | "loading";
  message?: string;
}

export interface StatusCardProps {
  expanded: boolean;
  setExpanded: Dispatch<SetStateAction<boolean>>;
}

export interface ApiToggleProps {
  apiId: string;
  apiStatus: ApiStatusState;
  toggleApiEnabled: (apiId: string) => void;
}

export interface ApiStatusBadgeProps {
  apiId: string;
  apiStatus: ApiStatusState;
}

export interface ApiTestingProps {
  apiStatus: ApiStatusState;
  selectedApiForTest: string;
  setSelectedApiForTest: Dispatch<SetStateAction<string>>;
  testResult: TestResultState;
  testApi: (apiId: string) => Promise<void>;
  selectedModel: string;
  handleModelChange: (value: string) => void;
}

// Constants that can be shared across components
export const API_DETAILS: ApiDetail[] = [
  { 
    id: "dataforseo", 
    name: "DataForSEO", 
    description: "Provides keyword research data" 
  },
  { 
    id: "openai", 
    name: "OpenAI", 
    description: "Powers content generation and AI-based keyword analysis" 
  },
  { 
    id: "googleKeyword", 
    name: "Google Keyword", 
    description: "Alternative source for keyword data" 
  },
  {
    id: "pinecone",
    name: "Pinecone",
    description: "Vector database for RAG (Retrieval-Augmented Generation)"
  }
];

export const AI_MODELS: AiModel[] = [
  { id: "gpt-4o", name: "GPT-4o", description: "Powerful model for content generation" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "Fast and capable model for most tasks" }, 
  { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Faster, more cost-effective version" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "Legacy model for basic tasks" }
];
