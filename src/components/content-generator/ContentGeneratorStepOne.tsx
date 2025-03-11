
import React from "react";
import { ContentTemplate } from "@/services/keywords/types";
import ContentTypeSelector from "./ContentTypeSelector";
import TemplateSelector from "./TemplateSelector";
import { Button } from "@/components/ui/button";

interface ContentGeneratorStepOneProps {
  contentType: string;
  selectedTemplateId: string;
  templates: ContentTemplate[];
  onContentTypeChange: (type: string) => void;
  onTemplateChange: (templateId: string) => void;
  onNext: () => void;
}

const ContentGeneratorStepOne: React.FC<ContentGeneratorStepOneProps> = ({
  contentType,
  selectedTemplateId,
  templates,
  onContentTypeChange,
  onTemplateChange,
  onNext
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Step 1: Select Content Type</h3>
      
      <div className="space-y-4">
        <ContentTypeSelector 
          value={contentType}
          onChange={onContentTypeChange}
        />
        
        <div className="pt-4">
          <h4 className="text-sm font-medium mb-3">Choose a Template</h4>
          <TemplateSelector 
            contentType={contentType}
            selectedTemplateId={selectedTemplateId}
            templates={templates.filter(t => t.contentType === contentType)}
            onSelectTemplate={onTemplateChange}
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default ContentGeneratorStepOne;
