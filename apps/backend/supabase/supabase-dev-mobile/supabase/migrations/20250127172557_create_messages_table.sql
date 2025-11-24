CREATE TYPE message_role AS ENUM ('bot', 'user');

CREATE TABLE public.messages (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role message_role NOT NULL,
    content TEXT NOT NULL CHECK (length(content) > 0),
    language VARCHAR(3) NOT NULL CHECK (length(language) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.messages ADD CONSTRAINT check_content_not_empty CHECK (content != '');
ALTER TABLE public.messages ADD CONSTRAINT check_language_not_empty CHECK (language != '');

CREATE INDEX idx_messages_user_id ON public.messages(user_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_messages_language ON public.messages(language);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
