
import React, { useEffect } from 'react';
import { toast } from 'sonner';

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
    
    const generateContent = async () => {
      try {
        const { generateContent } = await import("@/hooks/content-generator/contentGenerator");
        // Create background worker to handle content generation
        const worker = new Worker(
          URL.createObjectURL(
            new Blob([
              `self.onmessage = async (e) => {
                const { domain, keywords, contentType, title, creativity, contentPreferences, templateId, aiProvider, aiModel, ragEnabled, wordCountOption, customSubheadings } = e.data;
                
                try {
                  // Import would not work in a worker so we'll post a message to handle it in the main thread
                  self.postMessage({ type: 'status', status: 'generating' });
                } catch (error) {
                  self.postMessage({ type: 'error', error: error.toString() });
                }
              }`
            ], { type: 'application/javascript' })
          )
        );
        
        worker.onmessage = async (e) => {
          if (e.data.type === 'status' && e.data.status === 'generating') {
            // Perform generation in main thread since imports won't work in worker
            try {
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
            
            worker.terminate();
          } else if (e.data.type === 'error') {
            console.error("Worker error:", e.data.error);
            toast.error(`Failed to generate content: ${e.data.error}`);
            onSetBackgroundActive(false);
            worker.terminate();
          }
        };
        
        // Start the worker
        worker.postMessage({
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
        
        // Notify the user that generation will continue in the background
        if (document.hidden) {
          toast.info("Content generation will continue in the background");
        }
      } catch (error) {
        console.error("Error generating content:", error);
        toast.error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
        onSetBackgroundActive(false);
      }
    };
    
    generateContent();
    onSetBackgroundActive(true);
  }, [isGenerating]);

  // This is a utility component that doesn't render anything
  return null;
};

export default ContentGeneratorBackgroundWorker;
