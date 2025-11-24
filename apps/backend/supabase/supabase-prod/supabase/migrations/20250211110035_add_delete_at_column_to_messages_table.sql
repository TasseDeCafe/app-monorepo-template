-- First remove the old constraint
ALTER TABLE public.messages
DROP CONSTRAINT check_content_not_empty;

-- Allow content to be null
ALTER TABLE public.messages
    ALTER COLUMN content DROP NOT NULL;

-- Add deleted_at column
ALTER TABLE public.messages
    ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Add constraint to ensure content is null if and only if deleted_at is not null
ALTER TABLE public.messages
    ADD CONSTRAINT check_content_empty_only_if_deleted
        CHECK (
            (content IS NULL AND deleted_at IS NOT NULL) OR
            (content IS NOT NULL AND deleted_at IS NULL AND length(content) > 0)
            );

CREATE INDEX idx_messages_deleted_at ON public.messages(deleted_at);
