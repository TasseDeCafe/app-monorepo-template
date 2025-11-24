CREATE TABLE public.translation_exercise_selections (
    id SERIAL PRIMARY KEY,
    translation_exercise_id INTEGER NOT NULL REFERENCES public.translation_exercises(id) ON DELETE CASCADE,
    selection_chunks TEXT[] NOT NULL CHECK (array_length(selection_chunks, 1) > 0),
    selection_positions INTEGER[] NOT NULL CHECK (array_length(selection_positions, 1) > 0),
    language VARCHAR(3) NOT NULL CHECK (length(language) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT selection_positions_length_matches_chunks_length CHECK (array_length(selection_chunks, 1) = array_length(selection_positions, 1))
);

CREATE INDEX idx_translation_exercise_selections_exercise_id ON public.translation_exercise_selections(translation_exercise_id);
CREATE INDEX idx_translation_exercise_selections_language ON public.translation_exercise_selections(language);
CREATE INDEX idx_translation_exercise_selections_chunks ON public.translation_exercise_selections USING GIN(selection_chunks);

ALTER TABLE public.translation_exercise_selections ENABLE ROW LEVEL SECURITY;