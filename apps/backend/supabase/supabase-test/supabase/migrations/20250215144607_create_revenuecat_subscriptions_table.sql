CREATE TYPE revenuecat_auto_renewal_status AS ENUM (
    'will_renew',
    'will_not_renew',
    'will_change_product',
    'will_pause',
    'requires_price_increase_consent',
    'has_already_renewed'
);

CREATE TYPE revenuecat_subscription_status AS ENUM (
    'trialing',
    'active',
    'expired',
    'in_grace_period',
    'in_billing_retry',
    'paused',
    'unknown',
    'incomplete'
);

CREATE TYPE revenuecat_store AS ENUM (
    'amazon',
    'app_store',
    'mac_app_store',
    'play_store',
    'promotional',
    'stripe',
    'rc_billing'
);

CREATE TABLE public.revenuecat_subscriptions (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    revenuecat_subscription_id VARCHAR(255) NOT NULL,
    revenuecat_original_customer_id VARCHAR(255) NOT NULL,
    revenuecat_product_id VARCHAR(255),
    starts_at TIMESTAMPTZ NOT NULL,
    current_period_starts_at TIMESTAMPTZ NOT NULL,
    current_period_ends_at TIMESTAMPTZ,
    gives_access BOOLEAN NOT NULL,
    pending_payment BOOLEAN NOT NULL,
    auto_renewal_status revenuecat_auto_renewal_status NOT NULL,
    status revenuecat_subscription_status NOT NULL,
    total_revenue_in_usd DECIMAL(10, 2) NOT NULL,
    presented_offering_id VARCHAR(255),
    environment VARCHAR(50) NOT NULL,
    store revenuecat_store NOT NULL,
    store_subscription_identifier VARCHAR(255) NOT NULL,
    ownership_type VARCHAR(50) NOT NULL,
    billing_country_code VARCHAR(2),
    management_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT revenuecat_subscriptions_subscription_id UNIQUE (revenuecat_subscription_id)
);

CREATE INDEX idx_revenuecat_subscriptions_user_id
    ON public.revenuecat_subscriptions USING btree (user_id);

ALTER TABLE public.revenuecat_subscriptions ENABLE ROW LEVEL SECURITY;