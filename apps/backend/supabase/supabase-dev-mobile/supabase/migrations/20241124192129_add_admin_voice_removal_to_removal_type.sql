CREATE TYPE removal_type_new AS ENUM ('account', 'voice', 'voice_removal_by_admin');

ALTER TABLE public.removals
  ALTER COLUMN type DROP DEFAULT,
  ALTER COLUMN type TYPE removal_type_new
    USING (type::text::removal_type_new);

DROP TYPE removal_type;

ALTER TYPE removal_type_new RENAME TO removal_type;
