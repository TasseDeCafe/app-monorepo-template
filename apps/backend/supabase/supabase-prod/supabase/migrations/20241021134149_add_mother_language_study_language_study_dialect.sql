ALTER TABLE public.users
ADD COLUMN mother_language VARCHAR(3);

ALTER TABLE public.users
ADD COLUMN study_language VARCHAR(3);

ALTER TABLE public.users
ADD COLUMN study_dialect VARCHAR(20);
