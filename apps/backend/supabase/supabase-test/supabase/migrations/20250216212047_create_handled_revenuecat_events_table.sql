CREATE TABLE IF NOT EXISTS handled_revenuecat_events (
    id SERIAL PRIMARY KEY,
    event_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_handled_revenuecat_events_event_id ON handled_revenuecat_events(event_id);

ALTER TABLE public.handled_revenuecat_events ENABLE ROW LEVEL SECURITY;
