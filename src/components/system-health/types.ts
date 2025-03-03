
export type ApiStatusType = "success" | "warning" | "error" | "checking";

export interface ApiStatus {
  status: ApiStatusType;
  enabled: boolean;
  errorMessage?: string;
  description?: string;
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
    id: "gemini",
    name: "Google Gemini API",
    description: "Alternative content generation model"
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
  }
];
