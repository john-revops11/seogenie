
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
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Most capable model for complex tasks and reasoning',
    capabilities: ['text', 'vision', 'function calling'],
    maxTokens: 8192,
    isPrimary: true
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
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'gemini',
    description: 'Google\'s most capable language model',
    capabilities: ['text'],
    maxTokens: 8192,
    isPrimary: true
  },
  {
    id: 'gemini-pro-vision',
    name: 'Gemini Pro Vision',
    provider: 'gemini',
    description: 'Supports both text and image inputs',
    capabilities: ['text', 'vision'],
    maxTokens: 4096
  }
];

export const getModelsForProvider = (provider: AIProvider): AIModel[] => {
  return defaultAIModels.filter(model => model.provider === provider);
};

export const getPrimaryModelForProvider = (provider: AIProvider): AIModel | undefined => {
  return defaultAIModels.find(model => model.provider === provider && model.isPrimary);
};
