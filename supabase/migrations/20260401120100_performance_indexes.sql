-- ============================================================
-- Migration: Performance indexes for 200-user scale
-- Created: 2026-04-01
-- ============================================================

-- Capital plan lookups (dashboard, reports)
CREATE INDEX IF NOT EXISTS idx_capital_plans_project_year
  ON capital_plans(project_id, year);

-- Disbursement lookups
CREATE INDEX IF NOT EXISTS idx_disbursements_project_id
  ON disbursements(project_id);

CREATE INDEX IF NOT EXISTS idx_disbursements_date
  ON disbursements(date DESC);

-- Document lookups (CDE module)
CREATE INDEX IF NOT EXISTS idx_documents_project_id
  ON documents(project_id);

CREATE INDEX IF NOT EXISTS idx_documents_cde_folder_id
  ON documents(cde_folder_id);

CREATE INDEX IF NOT EXISTS idx_documents_cde_status
  ON documents(cde_status);

-- CDE folder lookups
CREATE INDEX IF NOT EXISTS idx_cde_folders_project_id
  ON cde_folders(project_id);

CREATE INDEX IF NOT EXISTS idx_cde_folders_parent_id
  ON cde_folders(parent_id);

-- Task composite indexes (project plan view)
CREATE INDEX IF NOT EXISTS idx_tasks_project_status
  ON tasks(project_id, status);

CREATE INDEX IF NOT EXISTS idx_tasks_created_by
  ON tasks(created_by);

-- Variation orders
CREATE INDEX IF NOT EXISTS idx_variation_orders_contract_id
  ON variation_orders(contract_id);

-- BIM models
CREATE INDEX IF NOT EXISTS idx_bim_models_project_id
  ON bim_models(project_id);

-- Facility assets
CREATE INDEX IF NOT EXISTS idx_facility_assets_project_id
  ON facility_assets(project_id);

-- Stage transitions (timeline)
CREATE INDEX IF NOT EXISTS idx_stage_transitions_project_id
  ON stage_transitions(project_id);

-- Construction works
CREATE INDEX IF NOT EXISTS idx_construction_works_project_id
  ON construction_works(project_id);

-- Workflow instances (project workflow)
CREATE INDEX IF NOT EXISTS idx_workflow_instances_reference
  ON workflow_instances(reference_id, reference_type);

-- Workflow tasks
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_instance_id
  ON workflow_tasks(instance_id);

CREATE INDEX IF NOT EXISTS idx_workflow_tasks_status
  ON workflow_tasks(status);

-- Disbursement plans (monthly view)
CREATE INDEX IF NOT EXISTS idx_disbursement_plans_project_year
  ON disbursement_plans(project_id, year);

-- User permissions (RBAC check performance)
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_resource
  ON user_permissions(user_id, resource);

-- Package bidders
CREATE INDEX IF NOT EXISTS idx_package_bidders_package_id
  ON package_bidders(package_id);

-- Inspections
CREATE INDEX IF NOT EXISTS idx_inspections_project_id
  ON inspections(project_id);
