CREATE TABLE public.translation_exercises (
                                              id SERIAL PRIMARY KEY,
                                              user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                                              study_language VARCHAR(3) NOT NULL CHECK (length(study_language) > 0),
                                              mother_language VARCHAR(3) NOT NULL CHECK (length(mother_language) > 0),
                                              mother_language_sentence TEXT NOT NULL CHECK (length(mother_language_sentence) > 0),
                                              study_language_sentence TEXT NOT NULL CHECK (length(study_language_sentence) > 0),
                                              grammar_patterns JSONB DEFAULT '[]'::jsonb,
                                              user_translation TEXT,
                                              created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                              completed_at TIMESTAMPTZ,
                                              skipped BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_translation_exercises_user_id ON public.translation_exercises(user_id);
CREATE INDEX idx_translation_exercises_created_at ON public.translation_exercises(created_at DESC);
CREATE INDEX idx_translation_exercises_user_language_pair ON public.translation_exercises(user_id, study_language, mother_language, completed_at DESC);
CREATE INDEX idx_translation_exercises_user_incomplete ON public.translation_exercises(user_id, created_at ASC) WHERE completed_at IS NULL;

ALTER TABLE public.translation_exercises ENABLE ROW LEVEL SECURITY;