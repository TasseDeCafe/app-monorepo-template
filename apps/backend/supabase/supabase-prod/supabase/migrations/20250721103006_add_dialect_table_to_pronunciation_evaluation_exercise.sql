ALTER TABLE public.pronunciation_evaluation_exercises
ADD COLUMN dialect VARCHAR(10) NOT NULL CHECK (LENGTH(dialect) >= 5);
