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
  contentData?: any;
  aiProvider: AIProvider;
  aiModel: string;
  wordCountOption: string;
  selectedSubheadings: string[];
  isLoadingTopics?: boolean;
  topics?: string[];
  titleSuggestions?: { [topic: string]: string[] };
  selectedTopic?: string;
  contentPreferences?: string[];
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
  | { type: 'SET_CONTENT_DATA'; payload: any }
  | { type: 'SET_AI_PROVIDER'; payload: AIProvider }
  | { type: 'SET_AI_MODEL'; payload: string }
  | { type: 'SET_WORD_COUNT_OPTION'; payload: string }
  | { type: 'SET_SUBHEADINGS'; payload: string[] }
  | { type: 'SET_IS_LOADING_TOPICS'; payload: boolean }
  | { type: 'SET_TOPICS'; payload: string[] }
  | { type: 'SET_TITLE_SUGGESTIONS'; payload: { [topic: string]: string[] } }
  | { type: 'SET_SELECTED_TOPIC'; payload: string }
  | { type: 'SET_CONTENT_PREFERENCES'; payload: string[] }
  | { type: 'RESET_STATE'; };

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
    case 'SET_CONTENT_DATA':
      return { ...state, contentData: action.payload };
    case 'SET_AI_PROVIDER':
      return { ...state, aiProvider: action.payload };
    case 'SET_AI_MODEL':
      return { ...state, aiModel: action.payload };
    case 'SET_WORD_COUNT_OPTION':
      return { ...state, wordCountOption: action.payload };
    case 'SET_SUBHEADINGS':
      return { ...state, selectedSubheadings: action.payload };
    case 'SET_IS_LOADING_TOPICS':
      return { ...state, isLoadingTopics: action.payload };
    case 'SET_TOPICS':
      return { ...state, topics: action.payload };
    case 'SET_TITLE_SUGGESTIONS':
      return { ...state, titleSuggestions: action.payload };
    case 'SET_SELECTED_TOPIC':
      return { ...state, selectedTopic: action.payload };
    case 'SET_CONTENT_PREFERENCES':
      return { ...state, contentPreferences: action.payload };
    case 'RESET_STATE':
      // Reset to initial state but keep the AI provider and model
      return {
        ...initialState,
        aiProvider: state.aiProvider,
        aiModel: state.aiModel
      };
    default:
      return state;
  }
};

// Define initialState outside the hook so it can be used in the RESET_STATE action
const primaryModel = getPrimaryModelForProvider('openai');
  
const initialState: ContentGeneratorState = {
  step: 1,
  contentType: "blog-post",
  selectedTemplateId: "",
  title: "",
  keywords: [], // Empty keywords by default
  creativity: 50,
  ragEnabled: isPineconeConfigured(),
  isGenerating: false,
  generatedContent: null,
  contentHtml: "",
  aiProvider: "openai",
  aiModel: primaryModel?.id || "gpt-4o",
  wordCountOption: "standard",
  selectedSubheadings: [],
  isLoadingTopics: false,
  topics: [],
  titleSuggestions: {},
  selectedTopic: "",
  contentPreferences: []
};

export function useContentGeneratorState() {
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

