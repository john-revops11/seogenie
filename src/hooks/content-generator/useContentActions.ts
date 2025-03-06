
import { toast } from "sonner";
import { generateContent } from "./contentGenerator";
import { GeneratedContent } from "@/services/keywords/types";
import { AIProvider } from "@/types/aiModels";

export function useContentActions(
  setIsGenerating: (loading: boolean) => void,
  setGeneratedContent: (content: any) => void,
  setGeneratedContentData: (data: GeneratedContent | null) => void,
  setActiveStep: (step: number) => void
) {
  // Handle selecting a title
  const handleSelectTitle = (
    setTitle: (title: string) => void,
    selectedTitle: string
  ) => {
    setTitle(selectedTitle);
  };

  // Handle content preference toggle
  const handleContentPreferenceToggle = (
    setContentPreferences: (preferences: string[]) => void,
    preference: string
  ) => {
    // Create a function that takes the previous preferences and returns the new array
    const updatePreferences = (prevPreferences: string[]) => 
      prevPreferences.includes(preference)
        ? prevPreferences.filter(p => p !== preference)
        : [...prevPreferences, preference];
    
    // Pass this function to setContentPreferences
    setContentPreferences(updatePreferences);
  };

  // Handle RAG toggle
  const handleRagToggle = (setRagEnabled: (enabled: boolean) => void) => {
    // Create a function that takes the previous state and returns the new boolean
    const updateRagEnabled = (prevState: boolean) => !prevState;
    
    // Pass this function to setRagEnabled
    setRagEnabled(updateRagEnabled);
  };

  // Generate content with specified parameters
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
      toast.error("Please enter a title");
      return;
    }

    if (selectedKeywords.length === 0) {
      toast.error("Please select at least one keyword");
      return;
    }

    setIsGenerating(true);
    
    try {
      const result = await generateContent({
        domain: "",
        keywords: selectedKeywords,
        contentType,
        title,
        creativity,
        contentPreferences,
        templateId: "",
        aiProvider,
        aiModel,
        ragEnabled
      });

      // Update state with generated content
      setGeneratedContent({
        title: result.generatedContent.title,
        metaDescription: result.generatedContent.metaDescription,
        outline: result.generatedContent.outline,
        content: Array.isArray(result.content) ? result.content.join("\n\n") : result.content
      });

      setGeneratedContentData(result.generatedContent);
      toast.success("Content generated successfully!");
      setActiveStep(4); // Move to the final step
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error(`Failed to generate content: ${(error as Error).message}`);
    } finally {
      setIsGenerating(false);
    }
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
