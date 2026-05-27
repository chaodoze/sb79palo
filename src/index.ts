import type { Env } from "./types";
import { handleChat } from "./chat";

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/api/chat") return handleChat(req, env);
    if (url.pathname === "/api/health") return new Response("ok", { status: 200 });
    return env.ASSETS.fetch(req);
  },
} satisfies ExportedHandler<Env>;
