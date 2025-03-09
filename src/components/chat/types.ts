
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  ragInfo?: {
    used: boolean;
    chunksRetrieved?: number;
    relevanceScore?: number;
  };
}

export interface ChatProps {
  analysisComplete: boolean;
  onGoToAnalysis: () => void;
}
