
import { useEffect } from "react";
import { toast } from "sonner";
import { keywordGapsCache } from "../keyword-gaps/KeywordGapUtils";

interface KeywordEventHandlerProps {
  onGenerateFromKeyword: (primaryKeyword: string, relatedKeywords?: string[]) => void;
  setSelectedKeywords: (keywords: string[]) => void;
  handleGenerateTopics: () => void;
}

const KeywordEventHandler: React.FC<KeywordEventHandlerProps> = ({
  onGenerateFromKeyword,
  setSelectedKeywords,
  handleGenerateTopics
}) => {
  // Listen for the custom event to handle keyword selection from other components
  useEffect(() => {
    const handleGenerateFromKeywordEvent = (event: CustomEvent) => {
      const { primaryKeyword, relatedKeywords } = event.detail;
      if (primaryKeyword) {
        const keywordsToUse = [primaryKeyword];
        if (relatedKeywords && Array.isArray(relatedKeywords)) {
          keywordsToUse.push(...relatedKeywords.slice(0, 2)); // Add up to 2 related keywords
        }
        setSelectedKeywords(keywordsToUse);
        console.log("Setting keywords from event:", keywordsToUse);
        // Update cache with the new keywords
        keywordGapsCache.selectedKeywords = keywordsToUse;
        handleGenerateTopics(); // Automatically generate topics for selected keywords
      }
    };

    window.addEventListener('generate-content-from-keyword', handleGenerateFromKeywordEvent as EventListener);
    
    return () => {
      window.removeEventListener('generate-content-from-keyword', handleGenerateFromKeywordEvent as EventListener);
    };
  }, [handleGenerateTopics, setSelectedKeywords]);

  return null; // This is a behavior-only component, no UI
};

export default KeywordEventHandler;
