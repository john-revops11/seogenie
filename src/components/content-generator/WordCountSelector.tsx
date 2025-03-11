
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type WordCountOption = {
  label: string;
  value: string;
  min: number;
  max: number;
  description: string;
};

export const WORD_COUNT_OPTIONS: WordCountOption[] = [
  {
    label: "Short",
    value: "short",
    min: 500,
    max: 800,
    description: "Brief overview (500-800 words)"
  },
  {
    label: "Standard",
    value: "standard",
    min: 800,
    max: 1200,
    description: "Standard article (800-1200 words)"
  },
  {
    label: "Detailed",
    value: "detailed",
    min: 1200,
    max: 1800,
    description: "Comprehensive content (1200-1800 words)"
  },
  {
    label: "Long-form",
    value: "long-form",
    min: 1800,
    max: 2500,
    description: "In-depth analysis (1800-2500 words)"
  }
];

interface WordCountSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const WordCountSelector: React.FC<WordCountSelectorProps> = ({
  value,
  onChange
}) => {
  return (
    <div className="space-y-3">
      <Label className="text-base">Target Word Count</Label>
      <RadioGroup 
        value={value} 
        onValueChange={onChange}
        className="grid grid-cols-1 sm:grid-cols-2 gap-2"
      >
        {WORD_COUNT_OPTIONS.map((option) => (
          <div key={option.value} className="flex items-start space-x-2">
            <RadioGroupItem value={option.value} id={`wordcount-${option.value}`} />
            <div className="grid gap-1.5">
              <Label 
                htmlFor={`wordcount-${option.value}`}
                className="font-medium cursor-pointer"
              >
                {option.label}
              </Label>
              <p className="text-sm text-muted-foreground">
                {option.description}
              </p>
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default WordCountSelector;
