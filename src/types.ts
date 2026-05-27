export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  RATE_LIMITER: RateLimiter;
  VECTOR_STORE_ID: string;
  OPENAI_API_KEY: string;
  IP_HASH_SALT: string;
  CHAT_MODEL?: string;
  MONTHLY_SPEND_CAP_USD?: string;
}

export interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export type ChatRole = "user" | "assistant";

export interface ChatTurn {
  role: ChatRole;
  content: string;
}

export interface ChatRequestBody {
  session_id: string;
  messages: ChatTurn[];
}

export interface ChatResponsePayload {
  answer: string;
  citations: Array<{ id: string; title: string; url: string }>;
  refused: boolean;
  intent: {
    category: string;
    specific: string;
    unmet_need: string | null;
  };
}

export interface ModelOutput {
  answer: string;
  cited_source_ids: string[];
  refused: boolean;
  intent: {
    category: string;
    specific: string;
    unmet_need: string | null;
  };
}

export interface CitationAnnotation {
  file_id: string;
  filename?: string;
}

export interface ModelCallResult {
  parsed: ModelOutput;
  annotations: CitationAnnotation[];
  usage: { input_tokens: number; output_tokens: number };
  model: string;
}

export interface FileMapEntry {
  id: string;
  title: string;
  url: string;
  category: string;
  content_hash: string;
  openai_file_id: string;
}

export interface FileMap {
  vector_store_id: string;
  entries: Record<string, FileMapEntry>;
}
