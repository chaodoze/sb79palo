import type { Env } from "./types";

export interface ChatLogRow {
  session_id: string;
  turn_index: number;
  user_message: string;
  ai_answer: string;
  citations: Array<{ id: string; title: string; url: string }>;
  refused: boolean;
  intent_category: string;
  intent_specific: string;
  intent_unmet_need: string | null;
  model: string;
  input_tokens: number;
  output_tokens: number;
  estimated_cost_usd: number;
  ip_hash: string;
  user_agent: string;
}

export async function logChat(env: Env, row: ChatLogRow): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO chat_messages (
      session_id, turn_index, created_at,
      user_message, ai_answer, citations_json,
      refused, intent_category, intent_specific, intent_unmet_need,
      model, input_tokens, output_tokens, estimated_cost_usd,
      ip_hash, user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      row.session_id,
      row.turn_index,
      Date.now(),
      row.user_message,
      row.ai_answer,
      JSON.stringify(row.citations),
      row.refused ? 1 : 0,
      row.intent_category,
      row.intent_specific,
      row.intent_unmet_need,
      row.model,
      row.input_tokens,
      row.output_tokens,
      row.estimated_cost_usd,
      row.ip_hash,
      row.user_agent,
    )
    .run();
}

export function monthKey(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function getMonthlySpendUsd(env: Env, month = monthKey()): Promise<number> {
  const row = await env.DB.prepare(`SELECT total_cost_usd FROM spend_tracker WHERE month_key = ?`)
    .bind(month)
    .first<{ total_cost_usd: number }>();
  return row?.total_cost_usd ?? 0;
}

export async function addSpend(
  env: Env,
  inputTokens: number,
  outputTokens: number,
  costUsd: number,
  month = monthKey(),
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO spend_tracker (month_key, total_input_tokens, total_output_tokens, total_cost_usd, request_count, last_updated)
     VALUES (?, ?, ?, ?, 1, ?)
     ON CONFLICT(month_key) DO UPDATE SET
       total_input_tokens = total_input_tokens + excluded.total_input_tokens,
       total_output_tokens = total_output_tokens + excluded.total_output_tokens,
       total_cost_usd = total_cost_usd + excluded.total_cost_usd,
       request_count = request_count + 1,
       last_updated = excluded.last_updated`,
  )
    .bind(month, inputTokens, outputTokens, costUsd, Date.now())
    .run();
}
