
import React from "react";
import { GeneratedContent } from "@/services/keywords/types";

interface ContentMetaInfoProps {
  generatedContent: GeneratedContent;
}

const ContentMetaInfo: React.FC<ContentMetaInfoProps> = ({ generatedContent }) => {
  return (
    <div className="space-y-6">
      <div className="p-2 bg-muted/30 rounded-md">
        <h4 className="text-sm font-medium mb-1">Meta Description</h4>
        <p className="text-sm text-muted-foreground">{generatedContent.metaDescription}</p>
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-medium">Outline</h4>
        <ul className="list-disc list-inside text-sm space-y-1 pl-2">
          {generatedContent.outline.map((item, index) => (
            <li key={index} className="text-muted-foreground">{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ContentMetaInfo;
