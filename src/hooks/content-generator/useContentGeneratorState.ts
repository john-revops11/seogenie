
import { useReducer, useEffect } from "react";
import { GeneratedContent } from "@/services/keywords/types";
import { AIProvider, getPrimaryModelForProvider } from "@/types/aiModels";
import { isPineconeConfigured } from "@/services/vector/pineconeService";

export type StepType = 1 | 2 | 3 | 4 | 5;

// State interface
export interface ContentGeneratorState {
  step: StepType;
  contentType: string;
  selectedTemplateId: string;
  title: string;
  keywords: string[];
  creativity: number;
  ragEnabled: boolean;
  isGenerating: boolean;
  generatedContent: GeneratedContent | null;
  contentHtml: string;
  aiProvider: AIProvider;
  aiModel: string;
  wordCountOption: string;
  selectedSubheadings: string[];
}

// Action types
type ContentGeneratorAction =
  | { type: 'SET_STEP'; payload: StepType }
  | { type: 'SET_CONTENT_TYPE'; payload: string }
  | { type: 'SET_TEMPLATE_ID'; payload: string }
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'SET_KEYWORDS'; payload: string[] }
  | { type: 'SET_CREATIVITY'; payload: number }
  | { type: 'SET_RAG_ENABLED'; payload: boolean }
  | { type: 'SET_IS_GENERATING'; payload: boolean }
  | { type: 'SET_GENERATED_CONTENT'; payload: GeneratedContent | null }
  | { type: 'SET_CONTENT_HTML'; payload: string }
  | { type: 'SET_AI_PROVIDER'; payload: AIProvider }
  | { type: 'SET_AI_MODEL'; payload: string }
  | { type: 'SET_WORD_COUNT_OPTION'; payload: string }
  | { type: 'SET_SUBHEADINGS'; payload: string[] };

// Reducer function
const contentGeneratorReducer = (state: ContentGeneratorState, action: ContentGeneratorAction): ContentGeneratorState => {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SET_CONTENT_TYPE':
      return { ...state, contentType: action.payload };
    case 'SET_TEMPLATE_ID':
      return { ...state, selectedTemplateId: action.payload };
    case 'SET_TITLE':
      return { ...state, title: action.payload };
    case 'SET_KEYWORDS':
      return { ...state, keywords: action.payload };
    case 'SET_CREATIVITY':
      return { ...state, creativity: action.payload };
    case 'SET_RAG_ENABLED':
      return { ...state, ragEnabled: action.payload };
    case 'SET_IS_GENERATING':
      return { ...state, isGenerating: action.payload };
    case 'SET_GENERATED_CONTENT':
      return { ...state, generatedContent: action.payload };
    case 'SET_CONTENT_HTML':
      return { ...state, contentHtml: action.payload };
    case 'SET_AI_PROVIDER':
      return { ...state, aiProvider: action.payload };
    case 'SET_AI_MODEL':
      return { ...state, aiModel: action.payload };
    case 'SET_WORD_COUNT_OPTION':
      return { ...state, wordCountOption: action.payload };
    case 'SET_SUBHEADINGS':
      return { ...state, selectedSubheadings: action.payload };
    default:
      return state;
  }
};

export function useContentGeneratorState() {
  // Get primary model for default OpenAI provider
  const primaryModel = getPrimaryModelForProvider('openai');
  
  // Set initial state
  const initialState: ContentGeneratorState = {
    step: 1,
    contentType: "blog-post",
    selectedTemplateId: "",
    title: "",
    keywords: [],
    creativity: 50,
    ragEnabled: isPineconeConfigured(),
    isGenerating: false,
    generatedContent: null,
    contentHtml: "",
    aiProvider: "openai",
    aiModel: primaryModel?.id || "gpt-4o-1",
    wordCountOption: "standard",
    selectedSubheadings: []
  };
  
  // Create reducer
  const [state, dispatch] = useReducer(contentGeneratorReducer, initialState);
  
  // Update AI model when provider changes
  useEffect(() => {
    const primaryModel = getPrimaryModelForProvider(state.aiProvider);
    if (primaryModel) {
      dispatch({ type: 'SET_AI_MODEL', payload: primaryModel.id });
    }
  }, [state.aiProvider]);
  
  return [state, dispatch] as const;
}
