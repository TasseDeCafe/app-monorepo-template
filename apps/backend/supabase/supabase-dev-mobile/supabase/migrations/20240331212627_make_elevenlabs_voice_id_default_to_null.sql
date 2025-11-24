ALTER TABLE public.users
ALTER COLUMN elevenlabs_voice_id DROP DEFAULT,
ALTER COLUMN elevenlabs_voice_id SET DEFAULT NULL;
