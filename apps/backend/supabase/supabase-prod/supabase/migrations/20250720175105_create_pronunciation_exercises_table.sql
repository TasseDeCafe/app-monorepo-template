CREATE TABLE public.pronunciation_evaluation_exercises (
    id uuid not null primary key DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    language VARCHAR(3) NOT NULL CHECK (length(language) > 0),
    text TEXT NOT NULL CHECK (length(text) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.pronunciation_evaluation_attempts (
    id uuid not null primary key DEFAULT gen_random_uuid(),
    pronunciation_exercise_id uuid not null REFERENCES public.pronunciation_evaluation_exercises(id) ON DELETE CASCADE,
    user_parsed_input TEXT NOT NULL CHECK (length(user_parsed_input) > 0),
    user_score FLOAT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pronunciation_exercises_user_id ON public.pronunciation_evaluation_exercises(user_id);
CREATE INDEX idx_pronunciation_exercises_created_at ON public.pronunciation_evaluation_exercises(created_at DESC);
CREATE INDEX idx_pronunciation_exercises_user_language ON public.pronunciation_evaluation_exercises(user_id, language, created_at DESC);

CREATE INDEX idx_pronunciation_attempts_exercise_id ON public.pronunciation_evaluation_attempts(pronunciation_exercise_id);
CREATE INDEX idx_pronunciation_attempts_created_at ON public.pronunciation_evaluation_attempts(created_at DESC);

ALTER TABLE public.pronunciation_evaluation_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pronunciation_evaluation_attempts ENABLE ROW LEVEL SECURITY;
