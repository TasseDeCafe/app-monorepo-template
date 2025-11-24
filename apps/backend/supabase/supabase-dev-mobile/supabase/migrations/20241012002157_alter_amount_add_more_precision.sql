-- This migration was needed to fix a very bad limitation in the amount column, since Stripe returns the amount in cents
-- I (Kamil) was not able to save anything above 100€ in the amount column because the previous DECIMAL(10, 6) had an upper bound of
-- 9999, which would be 99.99€.
ALTER TABLE public.subscriptions
ALTER COLUMN amount TYPE DECIMAL(20, 6);
