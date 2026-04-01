-- Add missing ENUM values for workflow_task_status
ALTER TYPE workflow_task_status ADD VALUE IF NOT EXISTS 'in_progress';
ALTER TYPE workflow_task_status ADD VALUE IF NOT EXISTS 'rejected';
