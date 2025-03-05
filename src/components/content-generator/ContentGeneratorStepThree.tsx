
import React from "react";

interface ContentGeneratorStepThreeProps {
  contentType: string;
  selectedTemplateId: string;
  title: string;
  selectedKeywords: string[];
  creativity: number;
  ragEnabled: boolean;
  isGenerating: boolean;
  onGenerateContent: () => void;
  onBack: () => void;
}

const ContentGeneratorStepThree: React.FC<ContentGeneratorStepThreeProps> = ({
  contentType,
  selectedTemplateId,
  title,
  selectedKeywords,
  creativity,
  ragEnabled,
  isGenerating,
  onGenerateContent,
  onBack
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Step 3: Generate Content</h3>
      <div className="space-y-4">
        <div className="p-4 bg-muted/30 rounded-md">
          <h4 className="font-medium">Content Configuration</h4>
          <div className="mt-2 text-sm">
            <div><span className="font-medium">Content Type:</span> {contentType}</div>
            <div><span className="font-medium">Template:</span> {selectedTemplateId || "Standard"}</div>
            <div><span className="font-medium">Title:</span> {title}</div>
            <div><span className="font-medium">Keywords:</span> {selectedKeywords.join(", ")}</div>
            <div><span className="font-medium">Creativity:</span> {creativity}%</div>
            <div><span className="font-medium">Generation Method:</span> {ragEnabled ? "RAG-Enhanced" : "Standard"}</div>
          </div>
        </div>
        
        <button
          onClick={onGenerateContent}
          disabled={isGenerating}
          className="w-full px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {isGenerating ? "Generating Content..." : "Generate Content"}
        </button>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default ContentGeneratorStepThree;
