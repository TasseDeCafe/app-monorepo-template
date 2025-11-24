ALTER TABLE public.users
    ADD COLUMN daily_study_minutes INTEGER CHECK (daily_study_minutes >= 1 AND daily_study_minutes <= 240);
