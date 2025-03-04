
import { ReactNode } from "react";

export type ApiStatus = "idle" | "loading" | "success" | "error";

export interface AiModel {
  id: string;
  name: string;
  provider: "openai" | "anthropic" | "perplexity" | "cohere" | "google";
  capabilities: string[];
  status?: ApiStatus;
  response?: string;
}

export interface ApiState {
  status: ApiStatus;
  message?: string;
  details?: Record<string, any>;
  models?: AiModel[];
  selectedModel?: string;
}

export interface ApiStates {
  pinecone: ApiState;
  openai: ApiState;
  googleAds: ApiState;
  dataForSeo: ApiState;
  rapidApi: ApiState;
}

export interface ApiStatusIndicatorProps {
  status: ApiStatus;
  label?: string;
  className?: string;
}

export interface ApiCardDetailProps {
  api: keyof ApiStates;
  state: ApiState;
  expanded: boolean;
  onRetry: (api: keyof ApiStates) => void;
  onTestModels?: () => void;
}

export interface ApiIconProps {
  api: keyof ApiStates;
  className?: string;
}

export interface ModelTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  models?: AiModel[];
  onTestModel: (modelId: string, prompt: string) => Promise<void>;
  testModelStatus: ApiStatus;
  testResponse: string;
}
