
import { toast } from "sonner";
import { GeneratedContent } from "@/services/keywords/types";
import { AIProvider } from "@/types/aiModels";
import { generateContent } from "./contentGenerator";
import { StepType, GeneratedContentInternal } from "./useContentGeneratorState";

export function useContentActions(
  setIsGenerating: (generating: boolean) => void,
  setGeneratedContent: (content: GeneratedContentInternal | null) => void,
  setGeneratedContentData: (content: GeneratedContent | null) => void,
  setActiveStep: (step: StepType) => void
) {
  // Generate content based on all parameters
  const handleGenerateContent = async (
    title: string,
    selectedKeywords: string[],
    contentType: string,
    contentPreferences: string[],
    ragEnabled: boolean,
    aiProvider: AIProvider,
    aiModel: string,
    creativity: number
  ) => {
    if (!title) {
      toast.error("Please provide a title");
      return;
    }

    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      // Generate content
      const contentData = await generateContent(
        title,
        selectedKeywords,
        contentType,
        contentPreferences,
        ragEnabled,
        aiProvider,
        aiModel,
        creativity
      );

      // Update state with generated content
      setGeneratedContentData(contentData);

      // Convert blocks to HTML string for the existing interface
      const contentHtml = contentData.blocks.map(block => block.content).join('\n');

      setGeneratedContent({
        title,
        metaDescription: contentData.metaDescription,
        outline: contentData.outline,
        content: contentHtml
      });

      // Move to final step
      setActiveStep(4);
      toast.success("Content generated successfully!");
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error(`Failed to generate content: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Select a title
  const handleSelectTitle = (
    setTitle: (title: string) => void,
    title: string
  ) => {
    setTitle(title);
  };

  // Toggle content preference
  const handleContentPreferenceToggle = (
    setContentPreferences: (prefs: string[]) => void,
    preference: string
  ) => {
    setContentPreferences(prev => 
      prev.includes(preference) 
        ? prev.filter(p => p !== preference) 
        : [...prev, preference]
    );
  };

  // Toggle RAG
  const handleRagToggle = (
    setRagEnabled: (enabled: boolean) => void
  ) => {
    setRagEnabled(prev => !prev);
  };

  // Handle content type change
  const handleContentTypeChange = (
    setContentType: (type: string) => void,
    type: string
  ) => {
    setContentType(type);
  };

  // Handle creativity change
  const handleCreativityChange = (
    setCreativity: (value: number) => void,
    value: number
  ) => {
    setCreativity(value);
  };

  return {
    handleGenerateContent,
    handleSelectTitle,
    handleContentPreferenceToggle,
    handleRagToggle,
    handleContentTypeChange,
    handleCreativityChange
  };
}
