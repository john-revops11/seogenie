
import { ReactNode } from "react";

export interface ApiDetails {
  id: string;
  name: string;
  description: string;
  icon?: ReactNode; // For UI components
  iconName?: string; // For storage/services
  apiKey?: string;
  isConfigured: boolean;
  isActive: boolean;
}
