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

// Add these helper functions to support serialization/deserialization
const serializeState = (state: ContentGeneratorState): string => {
  return JSON.stringify(state);
};

const deserializeState = (serializedState: string): Partial<ContentGeneratorState> => {
  try {
    return JSON.parse(serializedState);
  } catch (error) {
    console.error("Error deserializing state:", error);
    return {};
  }
};

// Reducer function
const contentGeneratorReducer = (state: ContentGeneratorState, action: ContentGeneratorAction): ContentGeneratorState => {
  let newState: ContentGeneratorState;
  
  switch (action.type) {
    case 'SET_STEP':
      newState = { ...state, step: action.payload };
      break;
    case 'SET_CONTENT_TYPE':
      newState = { ...state, contentType: action.payload };
      break;
    case 'SET_TEMPLATE_ID':
      newState = { ...state, selectedTemplateId: action.payload };
      break;
    case 'SET_TITLE':
      newState = { ...state, title: action.payload };
      break;
    case 'SET_KEYWORDS':
      newState = { ...state, keywords: action.payload };
      break;
    case 'SET_CREATIVITY':
      newState = { ...state, creativity: action.payload };
      break;
    case 'SET_RAG_ENABLED':
      newState = { ...state, ragEnabled: action.payload };
      break;
    case 'SET_IS_GENERATING':
      newState = { ...state, isGenerating: action.payload };
      break;
    case 'SET_GENERATED_CONTENT':
      newState = { ...state, generatedContent: action.payload };
      break;
    case 'SET_CONTENT_HTML':
      newState = { ...state, contentHtml: action.payload };
      break;
    case 'SET_CONTENT_DATA':
      newState = { ...state, contentData: action.payload };
      break;
    case 'SET_AI_PROVIDER':
      newState = { ...state, aiProvider: action.payload };
      break;
    case 'SET_AI_MODEL':
      newState = { ...state, aiModel: action.payload };
      break;
    case 'SET_WORD_COUNT_OPTION':
      newState = { ...state, wordCountOption: action.payload };
      break;
    case 'SET_SUBHEADINGS':
      newState = { ...state, selectedSubheadings: action.payload };
      break;
    case 'SET_IS_LOADING_TOPICS':
      newState = { ...state, isLoadingTopics: action.payload };
      break;
    case 'SET_TOPICS':
      newState = { ...state, topics: action.payload };
      break;
    case 'SET_TITLE_SUGGESTIONS':
      newState = { ...state, titleSuggestions: action.payload };
      break;
    case 'SET_SELECTED_TOPIC':
      newState = { ...state, selectedTopic: action.payload };
      break;
    case 'SET_CONTENT_PREFERENCES':
      newState = { ...state, contentPreferences: action.payload };
      break;
    case 'RESET_STATE':
      // Reset to initial state but keep the AI provider and model
      newState = {
        ...initialState,
        aiProvider: state.aiProvider,
        aiModel: state.aiModel
      };
      break;
    default:
      return state;
  }
  
  return newState;
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
