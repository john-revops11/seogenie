
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ContentTemplate } from "@/services/keywords/types";
import { getContentTemplates } from "@/services/keywords/contentGenerationService";
import { Check } from "lucide-react";

interface TemplateSelectorProps {
  contentType: string;
  selectedTemplateId: string;
  templates?: ContentTemplate[]; // Add the templates prop to the interface
  onSelectTemplate: (templateId: string) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  contentType,
  selectedTemplateId,
  templates: propTemplates,
  onSelectTemplate
}) => {
  // Use provided templates from props or fetch them if not provided
  const templates = propTemplates || getContentTemplates(contentType);
  
  if (templates.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No templates available for this content type
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">Select a template:</div>
      
      <RadioGroup
        value={selectedTemplateId || templates[0].id}
        onValueChange={onSelectTemplate}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {templates.map((template) => (
          <div key={template.id} className="relative">
            <RadioGroupItem
              value={template.id}
              id={template.id}
              className="sr-only"
            />
            <Label
              htmlFor={template.id}
              className="cursor-pointer"
            >
              <Card className={`h-full transition-all ${
                selectedTemplateId === template.id 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'hover:border-primary/50'
              }`}>
                <CardHeader>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {template.structure.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  For {template.contentType} content
                </CardFooter>
              </Card>
              {selectedTemplateId === template.id && (
                <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default TemplateSelector;
