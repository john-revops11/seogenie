
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { generateContent } from '@/hooks/content-generator/contentGenerator';

interface ContentGeneratorBackgroundWorkerProps {
  isGenerating: boolean;
  domain: string;
  contentGeneratorState: any;
  onContentGenerated: (result: any) => Promise<void>;
  onSetBackgroundActive: (active: boolean) => void;
}

const ContentGeneratorBackgroundWorker: React.FC<ContentGeneratorBackgroundWorkerProps> = ({
  isGenerating,
  domain,
  contentGeneratorState,
  onContentGenerated,
  onSetBackgroundActive
}) => {
  useEffect(() => {
    if (!isGenerating) return;
    
    const performContentGeneration = async () => {
      try {
        // Notify the user that generation will continue in the background if page is hidden
        if (document.hidden) {
          toast.info("Content generation will continue in the background");
        }
        
        // Perform generation directly without using a worker
        const result = await generateContent({
          domain,
          keywords: contentGeneratorState.keywords,
          contentType: contentGeneratorState.contentType,
          title: contentGeneratorState.title,
          creativity: contentGeneratorState.creativity,
          contentPreferences: contentGeneratorState.contentPreferences || [],
          templateId: contentGeneratorState.selectedTemplateId,
          aiProvider: contentGeneratorState.aiProvider,
          aiModel: contentGeneratorState.aiModel,
          ragEnabled: contentGeneratorState.ragEnabled,
          wordCountOption: contentGeneratorState.wordCountOption,
          customSubheadings: contentGeneratorState.selectedSubheadings
        });
        
        // Use the handler to process the result
        await onContentGenerated(result);
      } catch (error) {
        console.error("Error generating content:", error);
        toast.error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
        onSetBackgroundActive(false);
      }
    };
    
    // Start the content generation process
    performContentGeneration();
    onSetBackgroundActive(true);
  }, [isGenerating]);

  // This is a utility component that doesn't render anything
  return null;
};

export default ContentGeneratorBackgroundWorker;
