
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { toast } from "sonner";
import ContentGeneratorStepOne from "./content-generator/ContentGeneratorStepOne";
import ContentGeneratorStepTwo from "./content-generator/ContentGeneratorStepTwo";
import ContentGeneratorStepThree from "./content-generator/ContentGeneratorStepThree";
import ContentPreview from "./content-generator/ContentPreview";
import SubheadingRecommendations from "./content-generator/SubheadingRecommendations";
import { generateContent } from "@/hooks/content-generator/contentGenerator";
import { useContentTemplates } from "@/hooks/content-generator/contentTemplates";
import { useContentPreferences } from "@/hooks/content-generator/contentPreferences";
import { AIProvider } from "@/types/aiModels";
import { GeneratedContent } from "@/services/keywords/types";
import { WORD_COUNT_OPTIONS } from "./content-generator/WordCountSelector";

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
  const [step, setStep] = useState(1);
  const [contentType, setContentType] = useState("blog-post");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [title, setTitle] = useState(initialTitle);
  const [keywords, setKeywords] = useState<string[]>(selectedKeywords);
  const [creativity, setCreativity] = useState(50);
  const [ragEnabled, setRagEnabled] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [contentHtml, setContentHtml] = useState("");
  const [aiProvider, setAIProvider] = useState<AIProvider>("openai");
  const [aiModel, setAIModel] = useState("");
  const [wordCountOption, setWordCountOption] = useState("standard");
  const [selectedSubheadings, setSelectedSubheadings] = useState<string[]>([]);
  
  const { templates } = useContentTemplates();
  const { contentPreferences, selectedPreferences, togglePreference } = useContentPreferences();

  useEffect(() => {
    if (selectedKeywords.length > 0) {
      setKeywords(selectedKeywords);
    }
    
    if (initialTitle) {
      setTitle(initialTitle);
    }
  }, [selectedKeywords, initialTitle]);

  const handleNextStep = () => {
    if (step === 1 && !contentType) {
      toast.error("Please select a content type");
      return;
    }
    
    if (step === 2) {
      if (!title) {
        toast.error("Please enter a title");
        return;
      }
      
      if (keywords.length === 0) {
        toast.error("Please add at least one keyword");
        return;
      }
    }
    
    setStep(step + 1);
  };

  const handleBackStep = () => {
    setStep(step - 1);
  };

  const handleContentTypeChange = (type: string) => {
    setContentType(type);
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleKeywordsChange = (newKeywords: string[]) => {
    setKeywords(newKeywords);
  };

  const handleCreativityChange = (value: number) => {
    setCreativity(value);
  };

  const handleRagToggle = (enabled: boolean) => {
    setRagEnabled(enabled);
  };

  const handleAIProviderChange = (provider: AIProvider) => {
    setAIProvider(provider);
    setAIModel(""); // Reset model when provider changes
  };

  const handleAIModelChange = (model: string) => {
    setAIModel(model);
  };

  const handleWordCountOptionChange = (option: string) => {
    setWordCountOption(option);
  };

  const handleBackToStepTwo = () => {
    setStep(2);
  };
  
  const handleSubheadingsSelected = (subheadings: string[]) => {
    setSelectedSubheadings(subheadings);
    setStep(4); // Move to AI settings step
  };

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    
    try {
      const result = await generateContent({
        domain,
        keywords,
        contentType,
        title,
        creativity,
        contentPreferences: selectedPreferences,
        templateId: selectedTemplateId,
        aiProvider,
        aiModel,
        ragEnabled,
        wordCountOption,
        customSubheadings: selectedSubheadings
      });
      
      setContentHtml(result.content);
      setGeneratedContent(result.generatedContent);
      
      toast.success("Content generated successfully!");
      setStep(5); // Move to preview step
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <ContentGeneratorStepOne
            contentType={contentType}
            selectedTemplateId={selectedTemplateId}
            templates={templates}
            onContentTypeChange={handleContentTypeChange}
            onTemplateChange={handleTemplateChange}
            onNext={handleNextStep}
          />
        );
      case 2:
        return (
          <ContentGeneratorStepTwo
            title={title}
            keywords={keywords}
            creativity={creativity}
            ragEnabled={ragEnabled}
            contentPreferences={contentPreferences}
            selectedPreferences={selectedPreferences}
            wordCountOption={wordCountOption}
            onTitleChange={handleTitleChange}
            onKeywordsChange={handleKeywordsChange}
            onCreativityChange={handleCreativityChange}
            onRagToggle={handleRagToggle}
            onTogglePreference={togglePreference}
            onWordCountOptionChange={handleWordCountOptionChange}
            onNext={handleNextStep}
            onBack={handleBackStep}
          />
        );
      case 3:
        return (
          <SubheadingRecommendations
            title={title}
            keywords={keywords}
            contentType={contentType}
            onSubheadingsSelected={handleSubheadingsSelected}
            onBack={handleBackStep}
          />
        );
      case 4:
        return (
          <ContentGeneratorStepThree
            contentType={contentType}
            selectedTemplateId={selectedTemplateId}
            title={title}
            selectedKeywords={keywords}
            creativity={creativity}
            ragEnabled={ragEnabled}
            isGenerating={isGenerating}
            aiProvider={aiProvider}
            aiModel={aiModel}
            wordCountOption={wordCountOption}
            customSubheadings={selectedSubheadings}
            onAIProviderChange={handleAIProviderChange}
            onAIModelChange={handleAIModelChange}
            onGenerateContent={handleGenerateContent}
            onBack={() => setStep(3)}
          />
        );
      case 5:
        return (
          <ContentPreview
            content={contentHtml}
            generatedContent={generatedContent}
            onBack={() => setStep(4)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Content Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 1 ? 'bg-primary text-white' : 'border border-input bg-background'}`}>
                {step > 1 ? <Check className="h-4 w-4" /> : "1"}
              </div>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 2 ? 'bg-primary text-white' : 'border border-input bg-background'}`}>
                {step > 2 ? <Check className="h-4 w-4" /> : "2"}
              </div>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 3 ? 'bg-primary text-white' : 'border border-input bg-background'}`}>
                {step > 3 ? <Check className="h-4 w-4" /> : "3"}
              </div>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 4 ? 'bg-primary text-white' : 'border border-input bg-background'}`}>
                {step > 4 ? <Check className="h-4 w-4" /> : "4"}
              </div>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 5 ? 'bg-primary text-white' : 'border border-input bg-background'}`}>
                {step > 5 ? <Check className="h-4 w-4" /> : "5"}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {step === 1 && "Content Type"}
              {step === 2 && "Content Details"}
              {step === 3 && "Subheadings"}
              {step === 4 && "AI Settings"}
              {step === 5 && "Preview"}
            </div>
          </div>
        </div>
        
        {renderStepContent()}
      </CardContent>
    </Card>
  );
};

export default ContentGenerator;
