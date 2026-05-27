import type { ChatRequestBody, ChatResponsePayload, Env, FileMap } from "./types";
import fileMapJson from "../sources/file-map.json";
import {
  COST_PER_INPUT_TOKEN_USD,
  COST_PER_OUTPUT_TOKEN_USD,
  DEFAULT_MODEL,
  DEFAULT_MONTHLY_SPEND_CAP_USD,
} from "./prompts";
import { addSpend, getMonthlySpendUsd, logChat } from "./db";
import { callModel } from "./openai";

const fileMap = fileMapJson as FileMap;

const MAX_HISTORY_TURNS = 12;
const MAX_MESSAGE_CHARS = 4000;

export async function handleChat(req: Request, env: Env): Promise<Response> {
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  if (!env.VECTOR_STORE_ID || !env.OPENAI_API_KEY) {
    return json({ error: "chat not configured (missing VECTOR_STORE_ID or OPENAI_API_KEY)" }, 503);
  }

  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }
  if (!body.session_id || !Array.isArray(body.messages) || body.messages.length === 0) {
    return json({ error: "missing session_id or messages" }, 400);
  }

  const lastUserMessage = body.messages[body.messages.length - 1];
  if (lastUserMessage.role !== "user" || typeof lastUserMessage.content !== "string") {
    return json({ error: "final message must be from user" }, 400);
  }
  if (lastUserMessage.content.length > MAX_MESSAGE_CHARS) {
    return json({ error: `message too long (max ${MAX_MESSAGE_CHARS} chars)` }, 400);
  }

  const ip = req.headers.get("cf-connecting-ip") ?? "0.0.0.0";
  const userAgent = req.headers.get("user-agent") ?? "";

  const rl = await env.RATE_LIMITER.limit({ key: ip });
  if (!rl.success) return json({ error: "rate limit exceeded — try again in a minute" }, 429);

  const monthlyCap = Number(env.MONTHLY_SPEND_CAP_USD ?? DEFAULT_MONTHLY_SPEND_CAP_USD);
  const spendSoFar = await getMonthlySpendUsd(env);
  if (spendSoFar >= monthlyCap) {
    return json({ error: "monthly experiment budget reached — chat paused until next month" }, 503);
  }

  const ipHash = await hashIp(ip, env.IP_HASH_SALT);

  const history = body.messages
    .slice(-MAX_HISTORY_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));

  const model = env.CHAT_MODEL ?? DEFAULT_MODEL;

  let result;
  try {
    result = await callModel({
      apiKey: env.OPENAI_API_KEY,
      model,
      vectorStoreId: env.VECTOR_STORE_ID,
      history,
    });
  } catch (err) {
    console.error("openai call failed", err);
    return json({ error: "AI service error" }, 502);
  }

  const citations = resolveCitations(result.annotations.map((a) => a.file_id), result.parsed.cited_source_ids);
  const costUsd =
    result.usage.input_tokens * COST_PER_INPUT_TOKEN_USD + result.usage.output_tokens * COST_PER_OUTPUT_TOKEN_USD;

  const turnIndex = Math.floor(body.messages.length / 2);

  await Promise.all([
    logChat(env, {
      session_id: body.session_id,
      turn_index: turnIndex,
      user_message: lastUserMessage.content,
      ai_answer: result.parsed.answer,
      citations,
      refused: result.parsed.refused,
      intent_category: result.parsed.intent.category,
      intent_specific: result.parsed.intent.specific,
      intent_unmet_need: result.parsed.intent.unmet_need,
      model: result.model,
      input_tokens: result.usage.input_tokens,
      output_tokens: result.usage.output_tokens,
      estimated_cost_usd: costUsd,
      ip_hash: ipHash,
      user_agent: userAgent,
    }),
    addSpend(env, result.usage.input_tokens, result.usage.output_tokens, costUsd),
  ]);

  const payload: ChatResponsePayload = {
    answer: result.parsed.answer,
    citations,
    refused: result.parsed.refused,
    intent: result.parsed.intent,
  };
  return json(payload, 200);
}

function resolveCitations(annotationFileIds: string[], modelSelectedFileIds: string[]) {
  const seen = new Set<string>();
  const ordered: Array<{ id: string; title: string; url: string }> = [];

  const consider = (fileId: string) => {
    if (seen.has(fileId)) return;
    seen.add(fileId);
    const entry = Object.values(fileMap.entries).find((e) => e.openai_file_id === fileId);
    if (!entry) return;
    ordered.push({ id: entry.id, title: entry.title, url: entry.url });
  };

  for (const id of annotationFileIds) consider(id);
  for (const id of modelSelectedFileIds) consider(id);
  return ordered;
}

async function hashIp(ip: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
