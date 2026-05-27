-- Chat-widget telemetry for the council-watch "Ask AI about SB 79" experiment.
-- One row per turn: what the user asked, what the AI answered, which sources it
-- cited, and a structured intent classification we can later mine to learn what
-- readers are repeatedly asking about (and what we're not covering).

CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  turn_index INTEGER NOT NULL,
  created_at INTEGER NOT NULL,                -- unix ms
  user_message TEXT NOT NULL,
  ai_answer TEXT NOT NULL,
  citations_json TEXT,                        -- JSON array of {id,title,url}
  refused INTEGER NOT NULL DEFAULT 0,         -- 1 if AI declined / out-of-scope
  intent_category TEXT,
  intent_specific TEXT,
  intent_unmet_need TEXT,
  model TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  estimated_cost_usd REAL,
  ip_hash TEXT,                               -- sha256(IP + IP_HASH_SALT)
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_messages(session_id, turn_index);
CREATE INDEX IF NOT EXISTS idx_chat_intent  ON chat_messages(intent_category, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_messages(created_at);

-- Running spend totals so the Worker can enforce a monthly cap before calling OpenAI.
CREATE TABLE IF NOT EXISTS spend_tracker (
  month_key TEXT PRIMARY KEY,                 -- YYYY-MM (UTC)
  total_input_tokens INTEGER NOT NULL DEFAULT 0,
  total_output_tokens INTEGER NOT NULL DEFAULT 0,
  total_cost_usd REAL NOT NULL DEFAULT 0,
  request_count INTEGER NOT NULL DEFAULT 0,
  last_updated INTEGER NOT NULL DEFAULT 0
);
