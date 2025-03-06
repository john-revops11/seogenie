
import { toast } from "sonner";
import { generateContent } from "./contentGenerator";
import { GeneratedContent } from "@/services/keywords/types";
import { AIProvider } from "@/types/aiModels";

export function useContentActions(
  domain: string,
  setIsGenerating: (loading: boolean) => void,
  setGeneratedContent: (content: any) => void,
  setGeneratedContentData: (data: GeneratedContent | null) => void
) {
  // Generate content with specified parameters
  const handleGenerateContent = async (
    selectedKeywords: string[],
    contentType: string,
    title: string,
    creativity: number,
    contentPreferences: string[],
    selectedTemplateId: string,
    aiProvider: AIProvider = "openai",
    aiModel: string = "gpt-4o-mini",
    ragEnabled: boolean = false
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
      const { content, generatedContent } = await generateContent({
        domain,
        keywords: selectedKeywords,
        contentType,
        title,
        creativity,
        contentPreferences,
        templateId: selectedTemplateId,
        aiProvider,
        aiModel,
        ragEnabled
      });

      // Update state with generated content
      setGeneratedContent({
        title: generatedContent.title,
        metaDescription: generatedContent.metaDescription,
        outline: generatedContent.outline,
        content: Array.isArray(content) ? content.join("\n\n") : content
      });

      setGeneratedContentData(generatedContent);
      toast.success("Content generated successfully!");
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error(`Failed to generate content: ${(error as Error).message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Reset content to empty state
  const handleResetContent = () => {
    setGeneratedContent(null);
    setGeneratedContentData(null);
  };

  // Handle regenerate content with the same parameters
  const handleRegenerateContent = async (
    selectedKeywords: string[],
    contentType: string,
    title: string,
    creativity: number,
    contentPreferences: string[],
    selectedTemplateId: string,
    aiProvider: AIProvider = "openai",
    aiModel: string = "gpt-4o-mini",
    ragEnabled: boolean = false
  ) => {
    // Simply reuse the handleGenerateContent function
    await handleGenerateContent(
      selectedKeywords,
      contentType,
      title,
      creativity,
      contentPreferences,
      selectedTemplateId,
      aiProvider,
      aiModel,
      ragEnabled
    );
  };

  return {
    handleGenerateContent,
    handleResetContent,
    handleRegenerateContent
  };
}
