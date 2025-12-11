Generate the database types with this command:

supabase gen types typescript --local > database.public.types.ts

or for the auth database:

supabase gen types typescript --local --schema auth > database.auth.types.ts