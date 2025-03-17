
import React, { useEffect } from "react";
import { toast } from "sonner";
import { GeneratedContent } from "@/services/keywords/types";
import { useContentGeneratorState } from "@/hooks/content-generator/useContentGeneratorState";

interface ContentGeneratorStateManagerProps {
  domain: string;
  selectedKeywords?: string[];
  initialTitle?: string;
  saveToHistory: (content: GeneratedContent) => Promise<void>;
  children: (props: {
    state: ReturnType<typeof useContentGeneratorState>[0];
    dispatch: ReturnType<typeof useContentGeneratorState>[1];
    handleContentGenerated: (result: any) => Promise<void>;
    setBackgroundGenerationActive: React.Dispatch<React.SetStateAction<boolean>>;
    backgroundGenerationActive: boolean;
  }) => React.ReactNode;
}

const ContentGeneratorStateManager: React.FC<ContentGeneratorStateManagerProps> = ({
  domain,
  selectedKeywords = [],
  initialTitle = "",
  saveToHistory,
  children
}) => {
  const [state, dispatch, applyRestoredState] = useContentGeneratorState();
  const [backgroundGenerationActive, setBackgroundGenerationActive] = React.useState(false);
  
  // Load state from localStorage on initial render
  useEffect(() => {
    const savedState = localStorage.getItem('contentGeneratorState');
    
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        // Only restore if we have generated content
        if (parsedState.generatedContent || parsedState.contentHtml) {
          applyRestoredState(parsedState);
          toast.info("Restored previously generated content");
          return; // Skip the reset if we restored state
        }
      } catch (error) {
        console.error("Error parsing saved content generator state:", error);
      }
    }
    
    // If no saved state or error, reset to initial state
    dispatch({ type: 'RESET_STATE' });
    
    if (selectedKeywords && selectedKeywords.length > 0) {
      dispatch({ type: 'SET_KEYWORDS', payload: selectedKeywords });
    }
    
    if (initialTitle && initialTitle.trim() !== "") {
      dispatch({ type: 'SET_TITLE', payload: initialTitle });
    }
  }, []);
  
  // Check for background generation on window focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && backgroundGenerationActive) {
        setBackgroundGenerationActive(false);
        toast.success("Content generation completed in background");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [backgroundGenerationActive]);
  
  // Save state to localStorage whenever it changes
  useEffect(() => {
    // Only save state if we have generated content
    if (state.generatedContent || state.contentHtml) {
      const stateToSave = {
        ...state,
        isGenerating: false // Always save with isGenerating = false
      };
      localStorage.setItem('contentGeneratorState', JSON.stringify(stateToSave));
    }
  }, [state]);
  
  useEffect(() => {
    if (selectedKeywords && selectedKeywords.length > 0) {
      dispatch({ type: 'SET_KEYWORDS', payload: selectedKeywords });
    }
  }, [JSON.stringify(selectedKeywords)]);

  // Function to handle content generation success
  const handleContentGenerated = async (result) => {
    dispatch({ type: 'SET_CONTENT_HTML', payload: result.content });
    dispatch({ type: 'SET_GENERATED_CONTENT', payload: result.generatedContent });
    
    // Save the generated content to history in Supabase
    try {
      await saveToHistory(result.generatedContent);
    } catch (error) {
      console.error("Error saving to history:", error);
      // Continue even if saving to history fails - don't block the user
    }
    
    toast.success("Content generated successfully!");
    dispatch({ type: 'SET_STEP', payload: 5 });
    setBackgroundGenerationActive(false);
  };

  return (
    <>
      {children({
        state,
        dispatch,
        handleContentGenerated,
        setBackgroundGenerationActive,
        backgroundGenerationActive,
      })}
    </>
  );
};

export default ContentGeneratorStateManager;
