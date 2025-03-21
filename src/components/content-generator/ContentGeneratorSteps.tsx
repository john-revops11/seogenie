
import React from "react";
import { Check } from "lucide-react";

interface ContentGeneratorStepsProps {
  step: number;
  stepLabels: string[];
}

const ContentGeneratorSteps: React.FC<ContentGeneratorStepsProps> = ({ step, stepLabels }) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {stepLabels.map((_, index) => (
            <div
              key={index}
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                step >= index + 1 
                  ? 'bg-primary text-white' 
                  : 'border border-input bg-background'
              }`}
            >
              {step > index + 1 ? <Check className="h-4 w-4" /> : index + 1}
            </div>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          {stepLabels[step - 1]}
        </div>
      </div>
    </div>
  );
};

export default ContentGeneratorSteps;
