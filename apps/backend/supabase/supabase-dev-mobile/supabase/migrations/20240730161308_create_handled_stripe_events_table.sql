CREATE TABLE IF NOT EXISTS handled_stripe_events (
    id SERIAL PRIMARY KEY,
    event_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_handled_stripe_events_event_id ON handled_stripe_events(event_id);

ALTER TABLE public.handled_stripe_events ENABLE ROW LEVEL SECURITY;