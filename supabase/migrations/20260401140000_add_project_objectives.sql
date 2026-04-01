-- Add Objective and InvestmentScale columns to projects table
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS objective TEXT,
  ADD COLUMN IF NOT EXISTS investment_scale TEXT;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
