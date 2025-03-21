
import React from "react";
import ContentGeneratorContainer from "./content-generator/ContentGeneratorContainer";
import { useContentHistory } from "@/hooks/content-generator/useContentHistory";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  
  return (
    <div className="w-full px-4 py-6 space-y-6">
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
