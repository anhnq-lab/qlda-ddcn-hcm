-- Add is_deleted column to workflow_nodes if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'workflow_nodes' 
          AND column_name = 'is_deleted'
    ) THEN
        ALTER TABLE public.workflow_nodes ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
    END IF;
END
$$;
