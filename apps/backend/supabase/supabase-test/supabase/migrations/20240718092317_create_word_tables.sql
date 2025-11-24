CREATE TABLE public.words (
   id SERIAL PRIMARY KEY,
   language VARCHAR(3) NOT NULL,
   orthographic_form TEXT NOT NULL, -- we store the standalone graphical form of the word, example "Paris" and not "paris"
   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.words ADD CONSTRAINT check_orthographic_form_not_empty CHECK (orthographic_form != '');
ALTER TABLE public.words ADD CONSTRAINT check_language_not_empty CHECK (language != '');

ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_words_orthographic_form ON public.words(orthographic_form);
CREATE INDEX idx_words_language ON public.words(language);
CREATE UNIQUE INDEX idx_words_unique_word
ON public.words(language, orthographic_form);

CREATE TABLE public.user_pronunciations (
   id SERIAL PRIMARY KEY,
   word_definition_id INTEGER NOT NULL REFERENCES public.words(id),
   user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
   confidence FLOAT,
   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_pronunciations ADD CONSTRAINT check_confidence_range CHECK (confidence >= 0 AND confidence <= 1);

ALTER TABLE public.user_pronunciations ENABLE ROW LEVEL SECURITY;


CREATE INDEX idx_user_pronunciations_word_definition_id ON public.user_pronunciations(word_definition_id);
CREATE INDEX idx_user_pronunciations_created_at ON public.user_pronunciations(created_at);
CREATE INDEX idx_user_pronunciations_user_id ON public.user_pronunciations(user_id);
CREATE INDEX idx_user_pronunciations_confidence ON public.user_pronunciations(confidence DESC);

