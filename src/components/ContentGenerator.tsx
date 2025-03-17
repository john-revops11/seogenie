
import React from "react";
import ContentGeneratorContainer from "./content-generator/ContentGeneratorContainer";

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
  return (
    <div className="w-full">
      <ContentGeneratorContainer 
        domain={domain}
        selectedKeywords={selectedKeywords}
        initialTitle={initialTitle}
      />
    </div>
  );
};

export default ContentGenerator;
