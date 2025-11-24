-- Drop and recreate translation_exercises table with UUID instead of integer and add dialect column
-- Also update translation_exercise_selections foreign key to use UUID

DROP TABLE IF EXISTS public.translation_exercise_selections CASCADE;

DROP TABLE IF EXISTS public.translation_exercises CASCADE;

CREATE TABLE public.translation_exercises (
    id uuid not null primary key DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    study_language VARCHAR(3) NOT NULL CHECK (length(study_language) > 0),
    mother_language VARCHAR(3) NOT NULL CHECK (length(mother_language) > 0),
    dialect VARCHAR(10) NOT NULL CHECK (LENGTH(dialect) >= 5),
    mother_language_sentence TEXT NOT NULL CHECK (length(mother_language_sentence) > 0),
    study_language_sentence TEXT NOT NULL CHECK (length(study_language_sentence) > 0),
    grammar_patterns JSONB DEFAULT '[]'::jsonb,
    user_translation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    skipped BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE public.translation_exercise_selections (
    id uuid not null primary key DEFAULT gen_random_uuid(),
    translation_exercise_id uuid NOT NULL REFERENCES public.translation_exercises(id) ON DELETE CASCADE,
    selection_chunks TEXT[] NOT NULL CHECK (array_length(selection_chunks, 1) > 0),
    selection_positions INTEGER[] NOT NULL CHECK (array_length(selection_positions, 1) > 0),
    language VARCHAR(3) NOT NULL CHECK (length(language) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT selection_positions_length_matches_chunks_length CHECK (array_length(selection_chunks, 1) = array_length(selection_positions, 1))
);

CREATE INDEX idx_translation_exercises_user_id ON public.translation_exercises(user_id);
CREATE INDEX idx_translation_exercises_created_at ON public.translation_exercises(created_at DESC);
CREATE INDEX idx_translation_exercises_user_language_pair ON public.translation_exercises(user_id, study_language, mother_language, completed_at DESC);
CREATE INDEX idx_translation_exercises_user_incomplete ON public.translation_exercises(user_id, created_at ASC) WHERE completed_at IS NULL;

CREATE INDEX idx_translation_exercise_selections_exercise_id ON public.translation_exercise_selections(translation_exercise_id);
CREATE INDEX idx_translation_exercise_selections_language ON public.translation_exercise_selections(language);
CREATE INDEX idx_translation_exercise_selections_chunks ON public.translation_exercise_selections USING GIN(selection_chunks);

ALTER TABLE public.translation_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_exercise_selections ENABLE ROW LEVEL SECURITY;