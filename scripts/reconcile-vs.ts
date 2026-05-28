#!/usr/bin/env tsx
/**
 * Reconcile an existing OpenAI vector store with sources/index.json.
 *
 * Use this when a vector store exists already (e.g., from a partial/orphan
 * build-corpus run) and you want to adopt it instead of creating a new one.
 * The script:
 *
 *   1. Lists every file in the vector store with its filename.
 *   2. For each manifest entry, computes the expected filename and pairs it
 *      with the vector-store file. Local entries match on the filename
 *      build-corpus would have used; URL entries match on "<id>.md" or ".pdf".
 *   3. For each matched pair: if sources/<id>.<ext> already exists on disk we
 *      hash it; otherwise we download the VS file's content into sources/ and
 *      hash that.
 *   4. Writes sources/file-map.json with every adopted entry.
 *
 *   Run: OPENAI_API_KEY=… VECTOR_STORE_ID=vs_… tsx scripts/reconcile-vs.ts
 */

import OpenAI from "openai";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCES_DIR = join(REPO_ROOT, "sources");
const CACHE_DIR = join(REPO_ROOT, ".cache", "corpus");
const MANIFEST_PATH = join(SOURCES_DIR, "index.json");
const FILE_MAP_PATH = join(SOURCES_DIR, "file-map.json");

type Manifest = {
  vector_store_name: string;
  sources: Array<{ id: string; type: "local" | "url"; path?: string; url: string; title: string; category: string; format?: "html" | "pdf" | "skip" }>;
};

function sha256(buf: Buffer): string {
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

function expectedFilename(entry: Manifest["sources"][number]): string {
  if (entry.type === "local") {
    if (entry.path?.endsWith(".html")) return `${entry.id}.html`;
    return entry.path?.split("/").pop() ?? entry.id;
  }
  if (entry.format === "pdf") return `${entry.id}.pdf`;
  return `${entry.id}.md`;
}

function expectedDiskPath(entry: Manifest["sources"][number]): string {
  if (entry.type === "local") {
    if (entry.path?.endsWith(".html")) {
      mkdirSync(CACHE_DIR, { recursive: true });
      return join(CACHE_DIR, `${entry.id}.html`);
    }
    return join(REPO_ROOT, entry.path!);
  }
  if (entry.format === "pdf") return join(SOURCES_DIR, `${entry.id}.pdf`);
  return join(SOURCES_DIR, `${entry.id}.md`);
}

function diskContentBuffer(entry: Manifest["sources"][number]): Buffer | null {
  const p = expectedDiskPath(entry);
  if (entry.type === "local" && entry.path?.endsWith(".html")) {
    const srcPath = join(REPO_ROOT, entry.path);
    if (!existsSync(srcPath)) return null;
    const cleaned = stripChromeFromHtml(readFileSync(srcPath, "utf8"));
    writeFileSync(p, cleaned);
    return Buffer.from(cleaned);
  }
  if (!existsSync(p)) return null;
  return readFileSync(p);
}

async function downloadFileContent(client: OpenAI, fileId: string): Promise<Buffer> {
  const response = await client.files.content(fileId);
  const arrayBuf = await (response as Response).arrayBuffer();
  return Buffer.from(arrayBuf);
}

async function main(): Promise<void> {
  const vsId = process.env.VECTOR_STORE_ID;
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY required");
  if (!vsId) throw new Error("VECTOR_STORE_ID required");

  const client = new OpenAI();
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) as Manifest;

  console.log(`Listing vector store ${vsId}…`);
  const vsFiles: Array<{ id: string; filename: string }> = [];
  let cursor: string | undefined;
  do {
    const page = await client.vectorStores.files.list(vsId, cursor ? { after: cursor, limit: 100 } : { limit: 100 });
    for (const f of page.data) {
      const meta = await client.files.retrieve(f.id);
      vsFiles.push({ id: f.id, filename: meta.filename });
    }
    cursor = page.has_more && page.data.length > 0 ? page.data[page.data.length - 1].id : undefined;
  } while (cursor);
  console.log(`Found ${vsFiles.length} files in vector store.`);

  const byFilename = new Map(vsFiles.map((f) => [f.filename, f.id]));

  const entries: Record<string, { id: string; title: string; url: string; category: string; content_hash: string; openai_file_id: string }> = {};

  for (const entry of manifest.sources) {
    if (entry.type === "url" && entry.format === "skip") continue;
    const filename = expectedFilename(entry);
    const fileId = byFilename.get(filename);
    if (!fileId) {
      console.log(`miss   ${entry.id}  (expected filename "${filename}" — will be uploaded by build-corpus)`);
      continue;
    }

    let buf = diskContentBuffer(entry);
    if (!buf) {
      console.log(`fetch  ${entry.id}  (downloading content from VS)`);
      buf = await downloadFileContent(client, fileId);
      writeFileSync(expectedDiskPath(entry), buf);
    } else {
      console.log(`local  ${entry.id}  (using on-disk content)`);
    }

    entries[entry.id] = {
      id: entry.id,
      title: entry.title,
      url: entry.url,
      category: entry.category,
      content_hash: sha256(buf),
      openai_file_id: fileId,
    };
  }

  const matched = Object.keys(entries).length;
  const orphanVsFiles = vsFiles.filter((f) => !Object.values(entries).some((e) => e.openai_file_id === f.id));

  writeFileSync(FILE_MAP_PATH, JSON.stringify({ vector_store_id: vsId, entries }, null, 2) + "\n");

  console.log(`\nReconciled ${matched} manifest entries to existing VS files.`);
  if (orphanVsFiles.length) {
    console.log(`\nVS contains ${orphanVsFiles.length} file(s) that don't match any manifest entry:`);
    for (const f of orphanVsFiles) console.log(`  - ${f.id}  ${f.filename}`);
  }
  console.log(`\nfile-map.json written. Next: \`OPENAI_API_KEY=… VECTOR_STORE_ID=${vsId} npm run build-corpus\` to fill in missing entries.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
