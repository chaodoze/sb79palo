#!/usr/bin/env tsx
/**
 * Build / refresh the OpenAI vector store that grounds the council-watch chat widget.
 *
 *   - Reads sources/index.json (the manifest)
 *   - For each URL entry: fetches the content and caches it in sources/<id>.md or .pdf
 *   - For each local entry: strips nav/footer from HTML and writes a cleaned copy
 *     to .cache/corpus/<id>.html (gitignored)
 *   - Diffs every prepared file against the previous upload (sources/file-map.json
 *     tracks content hashes + OpenAI file IDs) and re-uploads only what changed
 *   - Removes vector-store files that no longer appear in the manifest
 *   - Emits the updated sources/file-map.json (committed to git so the Worker can
 *     map file_citation annotations back to corpus IDs and URLs)
 *
 *   Run: OPENAI_API_KEY=... npm run build-corpus
 *   First-run output prints the vector store ID — paste into wrangler.jsonc vars.VECTOR_STORE_ID.
 *   Subsequent runs pass VECTOR_STORE_ID via env to update the same store.
 */

import OpenAI from "openai";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, createReadStream, unlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCES_DIR = join(REPO_ROOT, "sources");
const CACHE_DIR = join(REPO_ROOT, ".cache", "corpus");
const MANIFEST_PATH = join(SOURCES_DIR, "index.json");
const FILE_MAP_PATH = join(SOURCES_DIR, "file-map.json");

const USER_AGENT = "sb79palo-corpus-indexer/1.0 (+https://sb79.numtot.org)";

type Manifest = {
  schema_version: number;
  vector_store_name: string;
  sources: SourceEntry[];
};

type SourceEntry = {
  id: string;
  type: "local" | "url";
  path?: string;
  url: string;
  title: string;
  category: string;
  format?: "html" | "pdf" | "skip";
  note?: string;
};

type FileMap = {
  vector_store_id: string;
  entries: Record<
    string,
    { id: string; title: string; url: string; category: string; content_hash: string; openai_file_id: string }
  >;
};

function sha256(buf: Buffer | string): string {
  return createHash("sha256").update(buf).digest("hex");
}

function stripChromeFromHtml(html: string): string {
  return html
    .replace(/<header\s+class="site-nav"[\s\S]*?<\/header>/i, "")
    .replace(/<footer\s+class="site-footer"[\s\S]*?<\/footer>/i, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<link\s[^>]*>/gi, "")
    .replace(/<a\s+class="skip"[\s\S]*?<\/a>/i, "");
}

function htmlToMarkdownish(html: string, url: string, title: string): string {
  const cleaned = stripChromeFromHtml(html);
  try {
    const dom = new JSDOM(cleaned, { url });
    const article = new Readability(dom.window.document).parse();
    if (article?.textContent && article.textContent.trim().length > 200) {
      return article.textContent.trim();
    }
    return dom.window.document.body?.textContent?.trim() ?? cleaned;
  } catch {
    return cleaned.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
}

function withFrontmatter(content: string, fm: Record<string, string>): string {
  const lines = ["---"];
  for (const [k, v] of Object.entries(fm)) lines.push(`${k}: ${JSON.stringify(v)}`);
  lines.push("---", "", content);
  return lines.join("\n");
}

async function fetchBytes(url: string): Promise<Buffer> {
  const res = await fetch(url, { headers: { "user-agent": USER_AGENT, accept: "*/*" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function preparePayload(entry: SourceEntry): Promise<{ filePath: string; content: Buffer; mime: string } | null> {
  if (entry.type === "url" && entry.format === "skip") return null;

  if (entry.type === "local") {
    if (!entry.path) throw new Error(`local entry ${entry.id} missing path`);
    const localPath = join(REPO_ROOT, entry.path);
    if (!existsSync(localPath)) throw new Error(`local file not found: ${entry.path}`);
    const raw = readFileSync(localPath);

    if (entry.path.endsWith(".html")) {
      mkdirSync(CACHE_DIR, { recursive: true });
      const cleaned = stripChromeFromHtml(raw.toString("utf8"));
      const cachePath = join(CACHE_DIR, `${entry.id}.html`);
      writeFileSync(cachePath, cleaned);
      return { filePath: cachePath, content: Buffer.from(cleaned), mime: "text/html" };
    }
    return { filePath: localPath, content: raw, mime: entry.path.endsWith(".md") ? "text/markdown" : "text/plain" };
  }

  // URL entry
  if (entry.format === "pdf") {
    const targetPath = join(SOURCES_DIR, `${entry.id}.pdf`);
    const bytes = await fetchBytes(entry.url);
    writeFileSync(targetPath, bytes);
    return { filePath: targetPath, content: bytes, mime: "application/pdf" };
  }

  const targetPath = join(SOURCES_DIR, `${entry.id}.md`);
  const bytes = await fetchBytes(entry.url);
  const html = bytes.toString("utf8");
  const text = htmlToMarkdownish(html, entry.url, entry.title);
  const md = withFrontmatter(text, {
    source_url: entry.url,
    title: entry.title,
    category: entry.category,
    fetched_at: new Date().toISOString(),
  });
  writeFileSync(targetPath, md);
  return { filePath: targetPath, content: Buffer.from(md), mime: "text/markdown" };
}

async function ensureVectorStore(client: OpenAI, existingId: string | undefined, name: string): Promise<string> {
  if (existingId) {
    try {
      const vs = await client.vectorStores.retrieve(existingId);
      console.log(`Using existing vector store: ${vs.id} (${vs.name})`);
      return vs.id;
    } catch {
      console.warn(`Stored vector store ${existingId} not found — creating a new one.`);
    }
  }
  const vs = await client.vectorStores.create({ name });
  console.log(`Created vector store: ${vs.id} (${vs.name})`);
  return vs.id;
}

async function waitForVectorStoreFile(client: OpenAI, vsId: string, fileId: string): Promise<void> {
  for (let attempt = 0; attempt < 120; attempt++) {
    const f = await client.vectorStores.files.retrieve(vsId, fileId);
    if (f.status === "completed") return;
    if (f.status === "failed" || f.status === "cancelled") {
      throw new Error(`vector store file ${fileId} ended in status=${f.status}: ${JSON.stringify(f.last_error)}`);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`vector store file ${fileId} did not finish indexing within 2 minutes`);
}

async function main(): Promise<void> {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set. Export it before running.");
    process.exit(1);
  }
  const client = new OpenAI();

  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) as Manifest;

  const previous: FileMap = existsSync(FILE_MAP_PATH)
    ? (JSON.parse(readFileSync(FILE_MAP_PATH, "utf8")) as FileMap)
    : { vector_store_id: "", entries: {} };

  const envVsId = process.env.VECTOR_STORE_ID || previous.vector_store_id || undefined;
  const vectorStoreId = await ensureVectorStore(client, envVsId, manifest.vector_store_name);

  const nextEntries: FileMap["entries"] = {};
  const manifestIds = new Set(manifest.sources.filter((s) => s.format !== "skip").map((s) => s.id));

  for (const entry of manifest.sources) {
    if (entry.type === "url" && entry.format === "skip") {
      console.log(`skip   ${entry.id}  (${entry.note ?? "marked skip"})`);
      continue;
    }
    process.stdout.write(`prep   ${entry.id} ... `);
    let payload;
    try {
      payload = await preparePayload(entry);
    } catch (err) {
      console.log(`FAIL — ${(err as Error).message}`);
      continue;
    }
    if (!payload) {
      console.log("skipped");
      continue;
    }
    const hash = sha256(payload.content);
    const prior = previous.entries[entry.id];
    const unchanged = prior && prior.content_hash === hash;

    if (unchanged) {
      console.log(`unchanged (file=${prior.openai_file_id})`);
      nextEntries[entry.id] = { ...prior, title: entry.title, url: entry.url, category: entry.category };
      continue;
    }

    if (prior) {
      console.log("changed — re-uploading");
      try { await client.vectorStores.files.del(vectorStoreId, prior.openai_file_id); } catch {}
      try { await client.files.del(prior.openai_file_id); } catch {}
    } else {
      console.log("new — uploading");
    }

    const uploaded = await client.files.create({
      file: createReadStream(payload.filePath),
      purpose: "assistants",
    });
    await client.vectorStores.files.create(vectorStoreId, { file_id: uploaded.id });
    await waitForVectorStoreFile(client, vectorStoreId, uploaded.id);

    nextEntries[entry.id] = {
      id: entry.id,
      title: entry.title,
      url: entry.url,
      category: entry.category,
      content_hash: hash,
      openai_file_id: uploaded.id,
    };
    console.log(`       indexed (file=${uploaded.id})`);
  }

  // Remove vector-store files for entries dropped from the manifest.
  for (const [id, prior] of Object.entries(previous.entries)) {
    if (manifestIds.has(id)) continue;
    console.log(`remove ${id} (file=${prior.openai_file_id})`);
    try { await client.vectorStores.files.del(vectorStoreId, prior.openai_file_id); } catch {}
    try { await client.files.del(prior.openai_file_id); } catch {}
  }

  const nextMap: FileMap = { vector_store_id: vectorStoreId, entries: nextEntries };
  writeFileSync(FILE_MAP_PATH, JSON.stringify(nextMap, null, 2) + "\n");

  console.log(`\nDone. Vector store: ${vectorStoreId}`);
  console.log(`Files indexed: ${Object.keys(nextEntries).length}`);
  console.log(`\nIf this is the first run, paste this into wrangler.jsonc:`);
  console.log(`    "vars": { "VECTOR_STORE_ID": "${vectorStoreId}" }`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
