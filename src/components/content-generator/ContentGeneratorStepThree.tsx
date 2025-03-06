
import React, { useEffect, useState } from "react";
import { getApiKey } from "@/services/keywords/apiConfig";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

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
  const [apiConfigured, setApiConfigured] = useState(true);
  
  useEffect(() => {
    const openaiKey = getApiKey('openai');
    if (!openaiKey) {
      setApiConfigured(false);
      toast.error("OpenAI API key is not configured. Please configure it in API Settings.");
    } else {
      setApiConfigured(true);
    }
  }, []);

  const handleGenerateClick = () => {
    if (!apiConfigured) {
      toast.error("Cannot generate content: OpenAI API key is not configured");
      return;
    }
    onGenerateContent();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Step 3: Generate Content</h3>
      
      {!apiConfigured && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-700">API Configuration Error</h4>
            <p className="text-sm text-red-600">
              OpenAI API key is not configured. Please go to API Settings to configure your OpenAI API key before generating content.
            </p>
          </div>
        </div>
      )}
      
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
          onClick={handleGenerateClick}
          disabled={isGenerating || !apiConfigured}
          className="w-full px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {isGenerating ? "Generating Content..." : !apiConfigured ? "API Not Configured" : "Generate Content"}
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
