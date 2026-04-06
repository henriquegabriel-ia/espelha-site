export type AIProvider = 'openai' | 'anthropic' | 'gemini';

export interface ProviderConfig {
  type: 'byo' | 'lovable-ai' | 'none';
  provider?: AIProvider;
  apiKey?: string;
}
