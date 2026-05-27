import OpenAI from "openai";
import type { ChatTurn, CitationAnnotation, ModelCallResult, ModelOutput } from "./types";
import { RESPONSE_SCHEMA, SYSTEM_PROMPT } from "./prompts";

interface CallArgs {
  apiKey: string;
  model: string;
  vectorStoreId: string;
  history: ChatTurn[];
}

export async function callModel({ apiKey, model, vectorStoreId, history }: CallArgs): Promise<ModelCallResult> {
  const client = new OpenAI({ apiKey });

  const response = await client.responses.create({
    model,
    instructions: SYSTEM_PROMPT,
    input: history.map((turn) => ({ role: turn.role, content: turn.content })),
    tools: [{ type: "file_search", vector_store_ids: [vectorStoreId] }],
    text: {
      format: {
        type: "json_schema",
        name: "chat_response",
        schema: RESPONSE_SCHEMA as unknown as Record<string, unknown>,
        strict: true,
      },
    },
  });

  const outputText = response.output_text ?? "";
  let parsed: ModelOutput;
  try {
    parsed = JSON.parse(outputText) as ModelOutput;
  } catch (err) {
    throw new Error(`model did not return valid JSON: ${(err as Error).message}\n--- raw ---\n${outputText}`);
  }

  const annotations = extractAnnotations(response);

  const usage = {
    input_tokens: response.usage?.input_tokens ?? 0,
    output_tokens: response.usage?.output_tokens ?? 0,
  };

  return { parsed, annotations, usage, model: response.model ?? model };
}

function extractAnnotations(response: unknown): CitationAnnotation[] {
  const out: CitationAnnotation[] = [];
  const r = response as { output?: Array<{ content?: Array<{ annotations?: unknown[] }> }> };
  if (!Array.isArray(r.output)) return out;
  for (const item of r.output) {
    if (!Array.isArray(item?.content)) continue;
    for (const chunk of item.content) {
      const anns = (chunk?.annotations ?? []) as Array<Record<string, unknown>>;
      for (const a of anns) {
        if (a.type === "file_citation" && typeof a.file_id === "string") {
          out.push({ file_id: a.file_id, filename: typeof a.filename === "string" ? a.filename : undefined });
        }
      }
    }
  }
  return out;
}
