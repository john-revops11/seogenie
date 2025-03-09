
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
  files?: FileAttachment[];
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  url?: string;
  content?: string;
  analysis?: {
    tables?: any[];
    extractedText?: string;
    summary?: string;
  };
}

export interface ChatProps {
  analysisComplete: boolean;
  onGoToAnalysis: () => void;
}
