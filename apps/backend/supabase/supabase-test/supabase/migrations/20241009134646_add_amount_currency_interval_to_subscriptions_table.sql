-- https://docs.stripe.com/api/plans/object#plan_object-interval
CREATE TYPE subscription_interval AS ENUM ('month', 'year');

ALTER TABLE public.subscriptions
ADD COLUMN currency VARCHAR(10), -- https://docs.stripe.com/currencies
ADD COLUMN amount DECIMAL(10, 6), -- https://docs.stripe.com/api/plans/object#plan_object-amount
ADD COLUMN interval subscription_interval, -- we decided to not use 'day' and 'week' listed in https://docs.stripe.com/api/plans/object#plan_object-interval
ADD COLUMN interval_count INTEGER; -- https://docs.stripe.com/api/plans/object#plan_object-interval_count
