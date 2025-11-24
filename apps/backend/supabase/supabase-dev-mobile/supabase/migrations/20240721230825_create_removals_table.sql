CREATE TYPE removal_type AS ENUM ('account', 'voice');

CREATE TABLE public.removals (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    elevenlabs_voice_id VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    type removal_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    was_successful BOOLEAN DEFAULT FALSE NOT NULL
);

ALTER TABLE public.removals ENABLE ROW LEVEL SECURITY;
