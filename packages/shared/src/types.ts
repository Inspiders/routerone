export interface OpenAIChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
}

export interface OpenAIChatRequest {
  model?: string;
  messages: OpenAIChatMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  route?: string;
}

export interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AnthropicRequest {
  model?: string;
  messages: AnthropicMessage[];
  max_tokens: number;
  stream?: boolean;
  temperature?: number;
  system?: string;
  route?: string;
}

export interface UnifiedRequest {
  messages: Array<{ role: string; content: string }>;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  route?: string;
  format: "openai" | "anthropic";
}

export interface ModelConfig {
  provider: string;
  model: string;
  costPer1kInput: number;
  costPer1kOutput: number;
  qualityScore: number;
}

export interface RouteConfig {
  name: string;
  qualityThreshold: number;
  minQualityModel: string;
  models: ModelConfig[];
}

export interface CostBreakdown {
  inputTokens: number;
  outputTokens: number;
  cost: number;
  baselineCost: number;
  savings: number;
  model: string;
  provider: string;
}
