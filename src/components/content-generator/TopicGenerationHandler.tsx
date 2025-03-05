
import { useEffect } from "react";
import { toast } from "sonner";

interface TopicGenerationHandlerProps {
  onGenerateFromKeyword: (primaryKeyword: string, relatedKeywords: string[]) => void;
}

const TopicGenerationHandler: React.FC<TopicGenerationHandlerProps> = ({ 
  onGenerateFromKeyword 
}) => {
  useEffect(() => {
    const handleGenerateFromKeyword = (event: any) => {
      const { primaryKeyword, relatedKeywords } = event.detail;
      
      if (primaryKeyword) {
        console.log("TopicGenerationHandler received event:", event.detail);
        toast.info(`Generating content for "${primaryKeyword}"`, { id: "keyword-gen" });
        onGenerateFromKeyword(primaryKeyword, relatedKeywords || []);
      } else {
        console.error("TopicGenerationHandler received event without primaryKeyword:", event.detail);
        toast.error("Missing primary keyword for content generation");
      }
    };
    
    // Listen for the custom event
    window.addEventListener('generate-content-from-keyword', handleGenerateFromKeyword);
    
    return () => {
      window.removeEventListener('generate-content-from-keyword', handleGenerateFromKeyword);
    };
  }, [onGenerateFromKeyword]);

  return null; // This is a behavior-only component, no UI
};

export default TopicGenerationHandler;
