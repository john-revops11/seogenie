
import React from "react";
import { GeneratedContent } from "@/services/keywords/types";
import { useContentGeneratorState } from "@/hooks/content-generator/useContentGeneratorState";
import ContentGeneratorStateManager from "./ContentGeneratorStateManager";

interface ContentGeneratorProviderProps {
  domain: string;
  selectedKeywords?: string[];
  initialTitle?: string;
  saveToHistory: (content: GeneratedContent) => Promise<void>;
  children: (props: {
    state: ReturnType<typeof useContentGeneratorState>[0];
    dispatch: ReturnType<typeof useContentGeneratorState>[1];
    handleContentGenerated: (result: any) => Promise<void>;
    setBackgroundGenerationActive: React.Dispatch<React.SetStateAction<boolean>>;
    backgroundGenerationActive: boolean;
  }) => React.ReactNode;
}

const ContentGeneratorProvider: React.FC<ContentGeneratorProviderProps> = ({
  domain,
  selectedKeywords = [],
  initialTitle = "",
  saveToHistory,
  children
}) => {
  return (
    <ContentGeneratorStateManager
      domain={domain}
      selectedKeywords={selectedKeywords}
      initialTitle={initialTitle}
      saveToHistory={saveToHistory}
    >
      {children}
    </ContentGeneratorStateManager>
  );
};

export default ContentGeneratorProvider;
