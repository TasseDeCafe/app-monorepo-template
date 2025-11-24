CREATE TABLE public.saved_words (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    word_id INTEGER NOT NULL REFERENCES public.words(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, word_id)
);

CREATE INDEX idx_saved_words_user_id ON public.saved_words(user_id);
CREATE INDEX idx_saved_words_word_id ON public.saved_words(word_id);

ALTER TABLE public.saved_words ENABLE ROW LEVEL SECURITY;
