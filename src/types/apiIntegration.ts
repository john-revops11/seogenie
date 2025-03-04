
import { ReactNode } from "react";

export interface ApiDetails {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  apiKey?: string;
  isConfigured: boolean;
  isActive: boolean;
}
