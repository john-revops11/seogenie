
import { ReactNode } from "react";

export interface ApiHealth {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
  details?: Record<string, any>;
}

export interface ApiStates {
  pinecone: ApiHealth;
  openai: ApiHealth & {
    models?: {
      id: string;
      name: string;
      provider: string;
      capabilities: string[];
    }[];
  };
  googleAds: ApiHealth;
  dataForSeo: ApiHealth;
  rapidApi: ApiHealth;
}

export interface ApiCardDetailProps {
  api: keyof ApiStates;
  state: ApiHealth & {
    models?: {
      id: string;
      name: string;
      provider: string;
      capabilities: string[];
    }[];
  };
  expanded: boolean;
  onRetry: (api: keyof ApiStates) => void;
  onTestModels?: () => void;
  onOpenDocs?: () => void;
}
