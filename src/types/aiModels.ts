
export type AIProvider = 'openai' | 'gemini';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  description: string;
  capabilities: string[];
  maxTokens: number;
  isPrimary?: boolean;
}

export const defaultAIModels: AIModel[] = [
  // OpenAI models
  {
    id: 'gpt-4o-1',
    name: 'GPT-4o-1',
    provider: 'openai',
    description: 'Latest and most capable OpenAI model with enhanced multimodal capabilities',
    capabilities: ['text', 'vision', 'function calling'],
    maxTokens: 16384,
    isPrimary: true
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o (o1)',
    provider: 'openai',
    description: 'Powerful multimodal model for document analysis and table extraction',
    capabilities: ['text', 'vision', 'function calling', 'document analysis'],
    maxTokens: 8192
  },
  {
    id: 'gpt-4.5-turbo',
    name: 'GPT-4.5 Turbo',
    provider: 'openai',
    description: 'Advanced successor to GPT-4 with improved reasoning capabilities',
    capabilities: ['text', 'vision', 'function calling'],
    maxTokens: 12288
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Fast and cost-effective model for most tasks',
    capabilities: ['text', 'vision', 'function calling'],
    maxTokens: 4096
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    description: 'Good for straightforward content generation',
    capabilities: ['text', 'function calling'],
    maxTokens: 4096
  },
  // Gemini models
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'gemini',
    description: 'Latest Gemini model with advanced capabilities and context length',
    capabilities: ['text', 'vision'],
    maxTokens: 32768,
    isPrimary: true
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'gemini',
    description: 'Fast and efficient version of Gemini 1.5',
    capabilities: ['text', 'vision'],
    maxTokens: 16384
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'gemini',
    description: 'Previous generation Gemini model',
    capabilities: ['text'],
    maxTokens: 8192
  }
];

export const getModelsForProvider = (provider: AIProvider): AIModel[] => {
  return defaultAIModels.filter(model => model.provider === provider);
};

export const getPrimaryModelForProvider = (provider: AIProvider): AIModel | undefined => {
  return defaultAIModels.find(model => model.provider === provider && model.isPrimary);
};
