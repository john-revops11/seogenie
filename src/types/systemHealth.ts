
import { ReactNode } from "react";

export type ApiStatus = "idle" | "loading" | "success" | "error";

export interface ApiHealth {
  status: ApiStatus;
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

export interface ApiIconProps {
  api: string;
  className?: string;
}

export interface ApiStatusIndicatorProps {
  status: ApiStatus;
  label?: string;
  className?: string;
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

export interface ModelTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  models?: {
    id: string;
    name: string;
    provider: string;
    capabilities: string[];
  }[];
  onTestModel: (modelId: string, prompt: string) => Promise<void>;
  testModelStatus: ApiStatus;
  testResponse: string;
}
