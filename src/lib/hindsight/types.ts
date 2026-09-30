export interface HindsightRetainPayload {
  content: string;
  metadata?: Record<string, string | number | boolean>;
  tags?: string[];
  bank_id?: string;
}

export interface HindsightRecallPayload {
  query: string;
  bank_id?: string;
  top_k?: number;
  tags?: string[];
}

export interface HindsightRecallResult {
  id: string;
  content: string;
  score?: number;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface HindsightRecallResponse {
  memories?: HindsightRecallResult[];
  results?: HindsightRecallResult[];
  status?: string;
}
