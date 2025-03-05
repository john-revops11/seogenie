
import React from "react";
import TemplateSelector from "./TemplateSelector";

interface ContentGeneratorStepTwoProps {
  contentType: string;
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

const ContentGeneratorStepTwo: React.FC<ContentGeneratorStepTwoProps> = ({
  contentType,
  selectedTemplateId,
  onSelectTemplate,
  onBack,
  onContinue
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Step 2: Choose a Template</h3>
      <TemplateSelector 
        contentType={contentType}
        selectedTemplateId={selectedTemplateId}
        onSelectTemplate={onSelectTemplate}
      />
      
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Back
        </button>
        <button
          onClick={onContinue}
          className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ContentGeneratorStepTwo;
