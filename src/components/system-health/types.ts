
export type ApiStatusType = "success" | "warning" | "error" | "checking" | "connected" | "disconnected" | "idle";

export interface ApiStatus {
  status: ApiStatusType;
  enabled: boolean;
  errorMessage?: string;
  description?: string;
  lastChecked?: Date;
}

export interface ApiStatusState {
  [key: string]: ApiStatus;
}

export const API_DETAILS = [
  {
    id: "dataforseo",
    name: "DataForSEO API",
    description: "Keyword research and competitor analysis"
  },
  {
    id: "openai",
    name: "OpenAI API",
    description: "Content generation and topic analysis"
  },
  {
    id: "pinecone",
    name: "Pinecone Vector DB",
    description: "Vector database for RAG (Retrieval Augmented Generation)"
  },
  {
    id: "google-ads",
    name: "Google Ads API",
    description: "Keyword volume and CPC data"
  },
  {
    id: "googleKeyword",
    name: "Google Keyword API",
    description: "Keyword insights and suggestions"
  }
];

export interface ApiToggleProps {
  apiId: string;
  apiStatus: ApiStatusState;
  toggleApiEnabled: (apiId: string) => void;
}

export interface ApiStatusBadgeProps {
  apiId: string;
  apiStatus: ApiStatusState;
}

export type TestResultStatus = "idle" | "loading" | "success" | "error";

export interface TestResultState {
  status: TestResultStatus;
  message?: string;
}

export interface ApiTestingProps {
  apiStatus: ApiStatusState;
  selectedApiForTest: string;
  setSelectedApiForTest: (api: string) => void;
  testResult: TestResultState;
  testApi: (apiId: string) => void;
  selectedModel: string;
  handleModelChange: (model: string) => void;
}

export interface ApiHealth {
  overallStatus: ApiStatusType;
  activeApiCount: number;
  totalApiCount: number;
  lastUpdated: Date | null;
}

export const AI_MODELS = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    description: "Most powerful model, optimized for speed and quality"
  },
  {
    id: "gpt-4",
    name: "GPT-4",
    description: "Powerful model for complex tasks, but slower and more expensive"
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    description: "Good balance of quality and speed for most tasks"
  }
];
