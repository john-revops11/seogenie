
import React, { useEffect } from "react";
import ContentGeneratorContainer from "./content-generator/ContentGeneratorContainer";
import { useContentHistory } from "@/hooks/content-generator/useContentHistory";

interface ContentGeneratorProps {
  domain: string;
  selectedKeywords?: string[];
  initialTitle?: string;
}

const ContentGenerator: React.FC<ContentGeneratorProps> = ({
  domain,
  selectedKeywords = [],
  initialTitle = ""
}) => {
  const { saveToHistory } = useContentHistory();

  // Make sure the saveToHistory function is available to ContentGeneratorContainer
  return (
    <div className="w-full">
      <ContentGeneratorContainer 
        domain={domain}
        selectedKeywords={selectedKeywords}
        initialTitle={initialTitle}
        saveToHistory={saveToHistory}
      />
    </div>
  );
};

export default ContentGenerator;
