-- Rename subscriptions table, enum type, and update all associated constraints and indexes

-- Rename the enum type
ALTER TYPE subscription_status RENAME TO stripe_subscription_status;

-- Rename the table
ALTER TABLE subscriptions RENAME TO stripe_subscriptions;

-- Update the indexes to match the new table name
ALTER INDEX idx_subscriptions_user_id RENAME TO idx_stripe_subscriptions_user_id;
ALTER INDEX idx_subscriptions_stripe_subscription_id RENAME TO idx_stripe_subscriptions_stripe_subscription_id;
ALTER INDEX idx_subscriptions_stripe_product_id RENAME TO idx_stripe_subscriptions_stripe_product_id;

-- Rename primary key constraint
ALTER TABLE public.stripe_subscriptions
    RENAME CONSTRAINT subscriptions_pkey
    TO stripe_subscriptions_pkey;

-- Rename unique constraint
ALTER TABLE public.stripe_subscriptions
    RENAME CONSTRAINT subscriptions_stripe_subscription_id_key
    TO stripe_subscriptions_stripe_subscription_id_key;

-- Rename foreign key constraint
ALTER TABLE public.stripe_subscriptions
    RENAME CONSTRAINT subscriptions_user_id_fkey
    TO stripe_subscriptions_user_id_fkey;
