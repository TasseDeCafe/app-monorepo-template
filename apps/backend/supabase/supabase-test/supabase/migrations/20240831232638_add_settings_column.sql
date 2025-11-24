ALTER TABLE public.users ADD COLUMN settings JSONB NOT NULL DEFAULT '{}'::JSONB;

CREATE INDEX idx_users_settings ON public.users USING GIN (settings);