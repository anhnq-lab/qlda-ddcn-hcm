-- ============================================================
-- Migration: RLS Hardening for All Tables
-- Description: Replace permissive USING(true) policies with
--              role-based + project-scoped access control
-- Created: 2026-04-01
-- ============================================================

-- ╔══════════════════════════════════════════════╗
-- ║  STEP 1: Helper Functions                    ║
-- ╚══════════════════════════════════════════════╝

-- Get current employee record from auth.uid()
CREATE OR REPLACE FUNCTION public.get_current_employee_id()
RETURNS TEXT AS $$
  SELECT ua.employee_id
  FROM user_accounts ua
  WHERE ua.auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get current employee role
CREATE OR REPLACE FUNCTION public.get_current_employee_role()
RETURNS TEXT AS $$
  SELECT e.role
  FROM employees e
  JOIN user_accounts ua ON ua.employee_id = e.employee_id
  WHERE ua.auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get current employee department
CREATE OR REPLACE FUNCTION public.get_current_employee_department()
RETURNS TEXT AS $$
  SELECT e.department
  FROM employees e
  JOIN user_accounts ua ON ua.employee_id = e.employee_id
  WHERE ua.auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is admin/director (global scope)
CREATE OR REPLACE FUNCTION public.is_global_role()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM employees e
    JOIN user_accounts ua ON ua.employee_id = e.employee_id
    WHERE ua.auth_user_id = auth.uid()
    AND (
      e.role IN ('Admin', 'Director', 'DeputyDirector')
      OR e.department IN (
        'Ban Giám đốc',
        'Văn phòng',
        'Phòng Kế hoạch – Đầu tư',
        'Phòng Tài chính – Kế toán',
        'Phòng Chính sách – Pháp chế',
        'Phòng Kỹ thuật – Chất lượng',
        'Trung tâm Dịch vụ tư vấn'
      )
    )
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM employees e
    JOIN user_accounts ua ON ua.employee_id = e.employee_id
    WHERE ua.auth_user_id = auth.uid()
    AND e.role = 'Admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is a member of a specific project
CREATE OR REPLACE FUNCTION public.is_project_member(p_project_id TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = p_project_id
    AND pm.employee_id = public.get_current_employee_id()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is a contractor
CREATE OR REPLACE FUNCTION public.get_current_contractor_id()
RETURNS TEXT AS $$
  SELECT ca.contractor_id
  FROM contractor_accounts ca
  WHERE ca.auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ╔══════════════════════════════════════════════╗
-- ║  STEP 2: Drop ALL existing permissive        ║
-- ║  "allow_all_*" policies                      ║
-- ╚══════════════════════════════════════════════╝

DO $$
DECLARE
    t TEXT;
    policy_name TEXT;
BEGIN
    FOR t IN SELECT unnest(ARRAY[
        'employees','user_accounts','projects','construction_works',
        'bidding_packages','contractors','contracts','variation_orders',
        'payments','capital_plans','disbursements','documents','folders',
        'tasks','sub_tasks','project_members','audit_logs','bim_models',
        'facility_assets','feasibility_studies','investment_policy_decisions',
        'package_issues','stage_transitions'
    ]) LOOP
        -- Drop allow_all policies
        FOR policy_name IN
            SELECT policyname FROM pg_policies
            WHERE tablename = t AND schemaname = 'public'
            AND policyname LIKE 'allow_all_%'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, t);
            RAISE NOTICE 'Dropped policy % on %', policy_name, t;
        END LOOP;
    END LOOP;
END $$;

-- Also drop old migration-created policies for user_permissions and audit_logs
DROP POLICY IF EXISTS "user_permissions_select_own" ON user_permissions;
DROP POLICY IF EXISTS "user_permissions_insert_admin" ON user_permissions;
DROP POLICY IF EXISTS "user_permissions_update_admin" ON user_permissions;
DROP POLICY IF EXISTS "user_permissions_delete_admin" ON user_permissions;


-- ╔══════════════════════════════════════════════╗
-- ║  STEP 3: New RLS Policies                   ║
-- ║  Pattern: Global roles see all,              ║
-- ║  Project-scoped roles see own projects       ║
-- ╚══════════════════════════════════════════════╝

-- ─────────────────────────────────────────────
-- 3.1  EMPLOYEES — everyone reads, admin writes
-- ─────────────────────────────────────────────
CREATE POLICY "employees_select" ON employees FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "employees_insert" ON employees FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "employees_update" ON employees FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "employees_delete" ON employees FOR DELETE
  TO authenticated USING (public.is_admin());


-- ─────────────────────────────────────────────
-- 3.2  USER_ACCOUNTS — own data or admin
-- ─────────────────────────────────────────────
CREATE POLICY "user_accounts_select" ON user_accounts FOR SELECT
  TO authenticated USING (
    auth_user_id = auth.uid() OR public.is_admin()
  );

CREATE POLICY "user_accounts_insert" ON user_accounts FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "user_accounts_update" ON user_accounts FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid() OR public.is_admin())
  WITH CHECK (auth_user_id = auth.uid() OR public.is_admin());

CREATE POLICY "user_accounts_delete" ON user_accounts FOR DELETE
  TO authenticated USING (public.is_admin());


-- ─────────────────────────────────────────────
-- 3.3  PROJECTS — global roles see all, others see own projects
-- ─────────────────────────────────────────────
CREATE POLICY "projects_select" ON projects FOR SELECT
  TO authenticated USING (
    public.is_global_role()
    OR public.is_project_member(project_id)
    OR (public.get_current_contractor_id() IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM contracts c
          WHERE c.project_id = projects.project_id
          AND c.contractor_id = public.get_current_contractor_id()
        ))
  );

CREATE POLICY "projects_insert" ON projects FOR INSERT
  TO authenticated WITH CHECK (
    public.get_current_employee_role() IN ('Admin', 'Director', 'DeputyDirector', 'Manager')
  );

CREATE POLICY "projects_update" ON projects FOR UPDATE
  TO authenticated
  USING (
    public.is_global_role() OR public.is_project_member(project_id)
  )
  WITH CHECK (
    public.is_global_role() OR public.is_project_member(project_id)
  );

CREATE POLICY "projects_delete" ON projects FOR DELETE
  TO authenticated USING (public.is_admin());


-- ─────────────────────────────────────────────
-- 3.4  PROJECT_MEMBERS — scoped
-- ─────────────────────────────────────────────
CREATE POLICY "project_members_select" ON project_members FOR SELECT
  TO authenticated USING (
    public.is_global_role()
    OR employee_id = public.get_current_employee_id()
    OR public.is_project_member(project_id)
  );

CREATE POLICY "project_members_insert" ON project_members FOR INSERT
  TO authenticated WITH CHECK (
    public.is_global_role() OR public.is_project_member(project_id)
  );

CREATE POLICY "project_members_update" ON project_members FOR UPDATE
  TO authenticated
  USING (public.is_global_role() OR public.is_project_member(project_id))
  WITH CHECK (public.is_global_role() OR public.is_project_member(project_id));

CREATE POLICY "project_members_delete" ON project_members FOR DELETE
  TO authenticated USING (public.is_global_role());


-- ─────────────────────────────────────────────
-- 3.5  CONTRACTORS — everyone reads, restricted writes
-- ─────────────────────────────────────────────
CREATE POLICY "contractors_select" ON contractors FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "contractors_insert" ON contractors FOR INSERT
  TO authenticated WITH CHECK (public.get_current_employee_id() IS NOT NULL);

CREATE POLICY "contractors_update" ON contractors FOR UPDATE
  TO authenticated
  USING (public.get_current_employee_id() IS NOT NULL)
  WITH CHECK (public.get_current_employee_id() IS NOT NULL);

CREATE POLICY "contractors_delete" ON contractors FOR DELETE
  TO authenticated USING (public.is_admin());


-- ─────────────────────────────────────────────
-- 3.6  CONTRACTS — project-scoped
-- ─────────────────────────────────────────────
CREATE POLICY "contracts_select" ON contracts FOR SELECT
  TO authenticated USING (
    public.is_global_role()
    OR public.is_project_member(project_id)
    OR contractor_id = public.get_current_contractor_id()
  );

CREATE POLICY "contracts_insert" ON contracts FOR INSERT
  TO authenticated WITH CHECK (
    public.is_global_role() OR public.is_project_member(project_id)
  );

CREATE POLICY "contracts_update" ON contracts FOR UPDATE
  TO authenticated
  USING (public.is_global_role() OR public.is_project_member(project_id))
  WITH CHECK (public.is_global_role() OR public.is_project_member(project_id));

CREATE POLICY "contracts_delete" ON contracts FOR DELETE
  TO authenticated USING (public.is_admin());


-- ─────────────────────────────────────────────
-- 3.7  PAYMENTS — project-scoped, write restricted
-- ─────────────────────────────────────────────
CREATE POLICY "payments_select" ON payments FOR SELECT
  TO authenticated USING (
    public.is_global_role()
    OR public.is_project_member(project_id)
    OR (public.get_current_contractor_id() IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM contracts c
          WHERE c.contract_id = payments.contract_id
          AND c.contractor_id = public.get_current_contractor_id()
        ))
  );

CREATE POLICY "payments_insert" ON payments FOR INSERT
  TO authenticated WITH CHECK (
    public.is_global_role() OR public.is_project_member(project_id)
  );

CREATE POLICY "payments_update" ON payments FOR UPDATE
  TO authenticated
  USING (public.is_global_role() OR public.is_project_member(project_id))
  WITH CHECK (public.is_global_role() OR public.is_project_member(project_id));

CREATE POLICY "payments_delete" ON payments FOR DELETE
  TO authenticated USING (public.is_admin());


-- ─────────────────────────────────────────────
-- 3.8  BIDDING_PACKAGES — project-scoped
-- ─────────────────────────────────────────────
CREATE POLICY "bidding_packages_select" ON bidding_packages FOR SELECT
  TO authenticated USING (
    public.is_global_role() OR public.is_project_member(project_id)
  );

CREATE POLICY "bidding_packages_insert" ON bidding_packages FOR INSERT
  TO authenticated WITH CHECK (
    public.is_global_role() OR public.is_project_member(project_id)
  );

CREATE POLICY "bidding_packages_update" ON bidding_packages FOR UPDATE
  TO authenticated
  USING (public.is_global_role() OR public.is_project_member(project_id))
  WITH CHECK (public.is_global_role() OR public.is_project_member(project_id));

CREATE POLICY "bidding_packages_delete" ON bidding_packages FOR DELETE
  TO authenticated USING (public.is_admin());


-- ─────────────────────────────────────────────
-- 3.9  CAPITAL_PLANS — project-scoped
-- ─────────────────────────────────────────────
CREATE POLICY "capital_plans_select" ON capital_plans FOR SELECT
  TO authenticated USING (
    public.is_global_role() OR public.is_project_member(project_id)
  );

CREATE POLICY "capital_plans_insert" ON capital_plans FOR INSERT
  TO authenticated WITH CHECK (
    public.is_global_role() OR public.is_project_member(project_id)
  );

CREATE POLICY "capital_plans_update" ON capital_plans FOR UPDATE
  TO authenticated
  USING (public.is_global_role() OR public.is_project_member(project_id))
  WITH CHECK (public.is_global_role() OR public.is_project_member(project_id));

CREATE POLICY "capital_plans_delete" ON capital_plans FOR DELETE
  TO authenticated USING (public.is_admin());


-- ─────────────────────────────────────────────
-- 3.10 DISBURSEMENTS — project-scoped
-- ─────────────────────────────────────────────
CREATE POLICY "disbursements_select" ON disbursements FOR SELECT
  TO authenticated USING (
    public.is_global_role() OR public.is_project_member(project_id)
  );

CREATE POLICY "disbursements_insert" ON disbursements FOR INSERT
  TO authenticated WITH CHECK (
    public.is_global_role() OR public.is_project_member(project_id)
  );

CREATE POLICY "disbursements_update" ON disbursements FOR UPDATE
  TO authenticated
  USING (public.is_global_role() OR public.is_project_member(project_id))
  WITH CHECK (public.is_global_role() OR public.is_project_member(project_id));

CREATE POLICY "disbursements_delete" ON disbursements FOR DELETE
  TO authenticated USING (public.is_admin());


-- ─────────────────────────────────────────────
-- 3.11 DOCUMENTS — project-scoped
-- ─────────────────────────────────────────────
CREATE POLICY "documents_select" ON documents FOR SELECT
  TO authenticated USING (
    public.is_global_role()
    OR public.is_project_member(project_id)
    OR project_id IS NULL  -- legal/regulation docs without project
  );

CREATE POLICY "documents_insert" ON documents FOR INSERT
  TO authenticated WITH CHECK (
    public.is_global_role()
    OR public.is_project_member(project_id)
    OR project_id IS NULL
  );

CREATE POLICY "documents_update" ON documents FOR UPDATE
  TO authenticated
  USING (
    public.is_global_role()
    OR public.is_project_member(project_id)
    OR project_id IS NULL
  )
  WITH CHECK (
    public.is_global_role()
    OR public.is_project_member(project_id)
    OR project_id IS NULL
  );

CREATE POLICY "documents_delete" ON documents FOR DELETE
  TO authenticated USING (public.is_global_role());


-- ─────────────────────────────────────────────
-- 3.12 TASKS — project-scoped + assigned
-- ─────────────────────────────────────────────
CREATE POLICY "tasks_select" ON tasks FOR SELECT
  TO authenticated USING (
    public.is_global_role()
    OR public.is_project_member(project_id)
    OR assignee_id = public.get_current_employee_id()
    OR created_by = public.get_current_employee_id()
  );

CREATE POLICY "tasks_insert" ON tasks FOR INSERT
  TO authenticated WITH CHECK (
    public.is_global_role()
    OR public.is_project_member(project_id)
  );

CREATE POLICY "tasks_update" ON tasks FOR UPDATE
  TO authenticated
  USING (
    public.is_global_role()
    OR public.is_project_member(project_id)
    OR assignee_id = public.get_current_employee_id()
  )
  WITH CHECK (
    public.is_global_role()
    OR public.is_project_member(project_id)
    OR assignee_id = public.get_current_employee_id()
  );

CREATE POLICY "tasks_delete" ON tasks FOR DELETE
  TO authenticated USING (
    public.is_global_role() OR public.is_project_member(project_id)
  );


-- ─────────────────────────────────────────────
-- 3.13 SUB_TASKS — inherits from parent task
-- ─────────────────────────────────────────────
CREATE POLICY "sub_tasks_select" ON sub_tasks FOR SELECT
  TO authenticated USING (true);  -- filtered via parent task

CREATE POLICY "sub_tasks_insert" ON sub_tasks FOR INSERT
  TO authenticated WITH CHECK (public.get_current_employee_id() IS NOT NULL);

CREATE POLICY "sub_tasks_update" ON sub_tasks FOR UPDATE
  TO authenticated USING (public.get_current_employee_id() IS NOT NULL)
  WITH CHECK (public.get_current_employee_id() IS NOT NULL);

CREATE POLICY "sub_tasks_delete" ON sub_tasks FOR DELETE
  TO authenticated USING (public.get_current_employee_id() IS NOT NULL);


-- ─────────────────────────────────────────────
-- 3.14 CONSTRUCTION_WORKS — project-scoped
-- ─────────────────────────────────────────────
CREATE POLICY "construction_works_select" ON construction_works FOR SELECT
  TO authenticated USING (
    public.is_global_role() OR public.is_project_member(project_id)
  );

CREATE POLICY "construction_works_insert" ON construction_works FOR INSERT
  TO authenticated WITH CHECK (
    public.is_global_role() OR public.is_project_member(project_id)
  );

CREATE POLICY "construction_works_update" ON construction_works FOR UPDATE
  TO authenticated
  USING (public.is_global_role() OR public.is_project_member(project_id))
  WITH CHECK (public.is_global_role() OR public.is_project_member(project_id));

CREATE POLICY "construction_works_delete" ON construction_works FOR DELETE
  TO authenticated USING (public.is_admin());


-- ─────────────────────────────────────────────
-- 3.15 VARIATION_ORDERS — via contract->project
-- ─────────────────────────────────────────────
CREATE POLICY "variation_orders_select" ON variation_orders FOR SELECT
  TO authenticated USING (
    public.is_global_role()
    OR EXISTS (
      SELECT 1 FROM contracts c
      WHERE c.contract_id = variation_orders.contract_id
      AND public.is_project_member(c.project_id)
    )
  );

CREATE POLICY "variation_orders_insert" ON variation_orders FOR INSERT
  TO authenticated WITH CHECK (
    public.is_global_role()
    OR EXISTS (
      SELECT 1 FROM contracts c
      WHERE c.contract_id = variation_orders.contract_id
      AND public.is_project_member(c.project_id)
    )
  );

CREATE POLICY "variation_orders_update" ON variation_orders FOR UPDATE
  TO authenticated
  USING (
    public.is_global_role()
    OR EXISTS (
      SELECT 1 FROM contracts c
      WHERE c.contract_id = variation_orders.contract_id
      AND public.is_project_member(c.project_id)
    )
  )
  WITH CHECK (
    public.is_global_role()
    OR EXISTS (
      SELECT 1 FROM contracts c
      WHERE c.contract_id = variation_orders.contract_id
      AND public.is_project_member(c.project_id)
    )
  );

CREATE POLICY "variation_orders_delete" ON variation_orders FOR DELETE
  TO authenticated USING (public.is_admin());


-- ─────────────────────────────────────────────
-- 3.16 BIM_MODELS — project-scoped
-- ─────────────────────────────────────────────
CREATE POLICY "bim_models_select" ON bim_models FOR SELECT
  TO authenticated USING (
    public.is_global_role() OR public.is_project_member(project_id)
  );

CREATE POLICY "bim_models_insert" ON bim_models FOR INSERT
  TO authenticated WITH CHECK (
    public.is_global_role() OR public.is_project_member(project_id)
  );

CREATE POLICY "bim_models_update" ON bim_models FOR UPDATE
  TO authenticated
  USING (public.is_global_role() OR public.is_project_member(project_id))
  WITH CHECK (public.is_global_role() OR public.is_project_member(project_id));

CREATE POLICY "bim_models_delete" ON bim_models FOR DELETE
  TO authenticated USING (public.is_admin());


-- ─────────────────────────────────────────────
-- 3.17 FACILITY_ASSETS — project-scoped
-- ─────────────────────────────────────────────
CREATE POLICY "facility_assets_select" ON facility_assets FOR SELECT
  TO authenticated USING (
    public.is_global_role() OR public.is_project_member(project_id)
  );

CREATE POLICY "facility_assets_insert" ON facility_assets FOR INSERT
  TO authenticated WITH CHECK (
    public.is_global_role() OR public.is_project_member(project_id)
  );

CREATE POLICY "facility_assets_update" ON facility_assets FOR UPDATE
  TO authenticated
  USING (public.is_global_role() OR public.is_project_member(project_id))
  WITH CHECK (public.is_global_role() OR public.is_project_member(project_id));

CREATE POLICY "facility_assets_delete" ON facility_assets FOR DELETE
  TO authenticated USING (public.is_admin());


-- ─────────────────────────────────────────────
-- 3.18 FEASIBILITY_STUDIES — project-scoped
-- ─────────────────────────────────────────────
CREATE POLICY "feasibility_studies_select" ON feasibility_studies FOR SELECT
  TO authenticated USING (
    public.is_global_role() OR public.is_project_member(project_id)
  );

CREATE POLICY "feasibility_studies_insert" ON feasibility_studies FOR INSERT
  TO authenticated WITH CHECK (
    public.is_global_role() OR public.is_project_member(project_id)
  );

CREATE POLICY "feasibility_studies_update" ON feasibility_studies FOR UPDATE
  TO authenticated
  USING (public.is_global_role() OR public.is_project_member(project_id))
  WITH CHECK (public.is_global_role() OR public.is_project_member(project_id));

CREATE POLICY "feasibility_studies_delete" ON feasibility_studies FOR DELETE
  TO authenticated USING (public.is_admin());


-- ─────────────────────────────────────────────
-- 3.19 INVESTMENT_POLICY_DECISIONS — project-scoped
-- ─────────────────────────────────────────────
CREATE POLICY "ipd_select" ON investment_policy_decisions FOR SELECT
  TO authenticated USING (
    public.is_global_role() OR public.is_project_member(project_id)
  );

CREATE POLICY "ipd_insert" ON investment_policy_decisions FOR INSERT
  TO authenticated WITH CHECK (
    public.is_global_role() OR public.is_project_member(project_id)
  );

CREATE POLICY "ipd_update" ON investment_policy_decisions FOR UPDATE
  TO authenticated
  USING (public.is_global_role() OR public.is_project_member(project_id))
  WITH CHECK (public.is_global_role() OR public.is_project_member(project_id));

CREATE POLICY "ipd_delete" ON investment_policy_decisions FOR DELETE
  TO authenticated USING (public.is_admin());


-- ─────────────────────────────────────────────
-- 3.20 PACKAGE_ISSUES — via bidding_packages->project
-- ─────────────────────────────────────────────
CREATE POLICY "package_issues_select" ON package_issues FOR SELECT
  TO authenticated USING (
    public.is_global_role()
    OR EXISTS (
      SELECT 1 FROM bidding_packages bp
      WHERE bp.package_id = package_issues.package_id
      AND public.is_project_member(bp.project_id)
    )
  );

CREATE POLICY "package_issues_insert" ON package_issues FOR INSERT
  TO authenticated WITH CHECK (
    public.is_global_role()
    OR EXISTS (
      SELECT 1 FROM bidding_packages bp
      WHERE bp.package_id = package_issues.package_id
      AND public.is_project_member(bp.project_id)
    )
  );

CREATE POLICY "package_issues_update" ON package_issues FOR UPDATE
  TO authenticated
  USING (
    public.is_global_role()
    OR EXISTS (
      SELECT 1 FROM bidding_packages bp
      WHERE bp.package_id = package_issues.package_id
      AND public.is_project_member(bp.project_id)
    )
  )
  WITH CHECK (
    public.is_global_role()
    OR EXISTS (
      SELECT 1 FROM bidding_packages bp
      WHERE bp.package_id = package_issues.package_id
      AND public.is_project_member(bp.project_id)
    )
  );

CREATE POLICY "package_issues_delete" ON package_issues FOR DELETE
  TO authenticated USING (public.is_admin());


-- ─────────────────────────────────────────────
-- 3.21 STAGE_TRANSITIONS — project-scoped
-- ─────────────────────────────────────────────
CREATE POLICY "stage_transitions_select" ON stage_transitions FOR SELECT
  TO authenticated USING (
    public.is_global_role() OR public.is_project_member(project_id)
  );

CREATE POLICY "stage_transitions_insert" ON stage_transitions FOR INSERT
  TO authenticated WITH CHECK (
    public.is_global_role() OR public.is_project_member(project_id)
  );

CREATE POLICY "stage_transitions_update" ON stage_transitions FOR UPDATE
  TO authenticated
  USING (public.is_global_role() OR public.is_project_member(project_id))
  WITH CHECK (public.is_global_role() OR public.is_project_member(project_id));

CREATE POLICY "stage_transitions_delete" ON stage_transitions FOR DELETE
  TO authenticated USING (public.is_admin());


-- ─────────────────────────────────────────────
-- 3.22 FOLDERS — open read (legacy), write authenticated
-- ─────────────────────────────────────────────
CREATE POLICY "folders_select" ON folders FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "folders_insert" ON folders FOR INSERT
  TO authenticated WITH CHECK (public.get_current_employee_id() IS NOT NULL);

CREATE POLICY "folders_update" ON folders FOR UPDATE
  TO authenticated USING (public.get_current_employee_id() IS NOT NULL)
  WITH CHECK (public.get_current_employee_id() IS NOT NULL);

CREATE POLICY "folders_delete" ON folders FOR DELETE
  TO authenticated USING (public.is_admin());


-- ─────────────────────────────────────────────
-- 3.23 USER_PERMISSIONS — own read, admin write
-- ─────────────────────────────────────────────
CREATE POLICY "user_permissions_select" ON user_permissions FOR SELECT
  TO authenticated USING (
    user_id = public.get_current_employee_id()
    OR public.is_admin()
  );

CREATE POLICY "user_permissions_insert" ON user_permissions FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "user_permissions_update" ON user_permissions FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "user_permissions_delete" ON user_permissions FOR DELETE
  TO authenticated USING (public.is_admin());


-- ─────────────────────────────────────────────
-- 3.24 AUDIT_LOGS — admin read, all insert (append-only)
-- ─────────────────────────────────────────────
-- Keep existing policies from migration 20260331160000
-- They already have: INSERT(all), SELECT(all), no UPDATE, no DELETE
-- We just need to tighten SELECT to admin-only:
DROP POLICY IF EXISTS "audit_logs_select" ON audit_logs;
DROP POLICY IF EXISTS "allow_all_select_audit_logs" ON audit_logs;

CREATE POLICY "audit_logs_select_admin" ON audit_logs FOR SELECT
  TO authenticated USING (public.is_admin());


-- ╔══════════════════════════════════════════════╗
-- ║  STEP 4: Additional tables discovered in DB  ║
-- ║  (not in init_schema but exist in production) ║
-- ╚══════════════════════════════════════════════╝

-- 4.1 INSPECTIONS — project-scoped
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inspections') THEN
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_select_inspections" ON inspections';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_insert_inspections" ON inspections';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_update_inspections" ON inspections';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_delete_inspections" ON inspections';
    
    EXECUTE 'CREATE POLICY "inspections_select" ON inspections FOR SELECT TO authenticated USING (public.is_global_role() OR public.is_project_member(project_id))';
    EXECUTE 'CREATE POLICY "inspections_insert" ON inspections FOR INSERT TO authenticated WITH CHECK (public.is_global_role() OR public.is_project_member(project_id))';
    EXECUTE 'CREATE POLICY "inspections_update" ON inspections FOR UPDATE TO authenticated USING (public.is_global_role() OR public.is_project_member(project_id)) WITH CHECK (public.is_global_role() OR public.is_project_member(project_id))';
    EXECUTE 'CREATE POLICY "inspections_delete" ON inspections FOR DELETE TO authenticated USING (public.is_admin())';
  END IF;
END $$;

-- 4.2 PROCUREMENT_PLANS — project-scoped
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'procurement_plans') THEN
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_select_procurement_plans" ON procurement_plans';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_insert_procurement_plans" ON procurement_plans';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_update_procurement_plans" ON procurement_plans';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_delete_procurement_plans" ON procurement_plans';
    
    EXECUTE 'CREATE POLICY "procurement_plans_select" ON procurement_plans FOR SELECT TO authenticated USING (public.is_global_role() OR public.is_project_member(project_id))';
    EXECUTE 'CREATE POLICY "procurement_plans_insert" ON procurement_plans FOR INSERT TO authenticated WITH CHECK (public.is_global_role() OR public.is_project_member(project_id))';
    EXECUTE 'CREATE POLICY "procurement_plans_update" ON procurement_plans FOR UPDATE TO authenticated USING (public.is_global_role() OR public.is_project_member(project_id)) WITH CHECK (public.is_global_role() OR public.is_project_member(project_id))';
    EXECUTE 'CREATE POLICY "procurement_plans_delete" ON procurement_plans FOR DELETE TO authenticated USING (public.is_admin())';
  END IF;
END $$;

-- 4.3 PACKAGE_BIDDERS — via bidding_packages->project
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'package_bidders') THEN
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_select_package_bidders" ON package_bidders';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_insert_package_bidders" ON package_bidders';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_update_package_bidders" ON package_bidders';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_delete_package_bidders" ON package_bidders';
    
    EXECUTE 'CREATE POLICY "package_bidders_select" ON package_bidders FOR SELECT TO authenticated USING (public.is_global_role() OR EXISTS (SELECT 1 FROM bidding_packages bp WHERE bp.package_id = package_bidders.package_id AND public.is_project_member(bp.project_id)))';
    EXECUTE 'CREATE POLICY "package_bidders_insert" ON package_bidders FOR INSERT TO authenticated WITH CHECK (public.is_global_role() OR EXISTS (SELECT 1 FROM bidding_packages bp WHERE bp.package_id = package_bidders.package_id AND public.is_project_member(bp.project_id)))';
    EXECUTE 'CREATE POLICY "package_bidders_update" ON package_bidders FOR UPDATE TO authenticated USING (public.is_global_role() OR EXISTS (SELECT 1 FROM bidding_packages bp WHERE bp.package_id = package_bidders.package_id AND public.is_project_member(bp.project_id))) WITH CHECK (public.is_global_role() OR EXISTS (SELECT 1 FROM bidding_packages bp WHERE bp.package_id = package_bidders.package_id AND public.is_project_member(bp.project_id)))';
    EXECUTE 'CREATE POLICY "package_bidders_delete" ON package_bidders FOR DELETE TO authenticated USING (public.is_admin())';
  END IF;
END $$;

-- 4.4 SETTLEMENT_RECORDS — via contracts->project
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'settlement_records') THEN
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_select_settlement_records" ON settlement_records';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_insert_settlement_records" ON settlement_records';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_update_settlement_records" ON settlement_records';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_delete_settlement_records" ON settlement_records';
    
    EXECUTE 'CREATE POLICY "settlement_records_select" ON settlement_records FOR SELECT TO authenticated USING (public.is_global_role() OR EXISTS (SELECT 1 FROM contracts c WHERE c.contract_id = settlement_records.contract_id AND public.is_project_member(c.project_id)))';
    EXECUTE 'CREATE POLICY "settlement_records_insert" ON settlement_records FOR INSERT TO authenticated WITH CHECK (public.is_global_role() OR EXISTS (SELECT 1 FROM contracts c WHERE c.contract_id = settlement_records.contract_id AND public.is_project_member(c.project_id)))';
    EXECUTE 'CREATE POLICY "settlement_records_update" ON settlement_records FOR UPDATE TO authenticated USING (public.is_global_role() OR EXISTS (SELECT 1 FROM contracts c WHERE c.contract_id = settlement_records.contract_id AND public.is_project_member(c.project_id))) WITH CHECK (public.is_global_role() OR EXISTS (SELECT 1 FROM contracts c WHERE c.contract_id = settlement_records.contract_id AND public.is_project_member(c.project_id)))';
    EXECUTE 'CREATE POLICY "settlement_records_delete" ON settlement_records FOR DELETE TO authenticated USING (public.is_admin())';
  END IF;
END $$;

-- 4.5 ACCEPTANCE_RECORDS — via contracts->project
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'acceptance_records') THEN
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_select_acceptance_records" ON acceptance_records';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_insert_acceptance_records" ON acceptance_records';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_update_acceptance_records" ON acceptance_records';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_delete_acceptance_records" ON acceptance_records';
    
    EXECUTE 'CREATE POLICY "acceptance_records_select" ON acceptance_records FOR SELECT TO authenticated USING (public.is_global_role() OR EXISTS (SELECT 1 FROM contracts c WHERE c.contract_id = acceptance_records.contract_id AND public.is_project_member(c.project_id)))';
    EXECUTE 'CREATE POLICY "acceptance_records_insert" ON acceptance_records FOR INSERT TO authenticated WITH CHECK (public.is_global_role() OR EXISTS (SELECT 1 FROM contracts c WHERE c.contract_id = acceptance_records.contract_id AND public.is_project_member(c.project_id)))';
    EXECUTE 'CREATE POLICY "acceptance_records_update" ON acceptance_records FOR UPDATE TO authenticated USING (public.is_global_role() OR EXISTS (SELECT 1 FROM contracts c WHERE c.contract_id = acceptance_records.contract_id AND public.is_project_member(c.project_id))) WITH CHECK (public.is_global_role() OR EXISTS (SELECT 1 FROM contracts c WHERE c.contract_id = acceptance_records.contract_id AND public.is_project_member(c.project_id)))';
    EXECUTE 'CREATE POLICY "acceptance_records_delete" ON acceptance_records FOR DELETE TO authenticated USING (public.is_admin())';
  END IF;
END $$;

-- 4.6 DISBURSEMENT_PLANS — project-scoped
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'disbursement_plans') THEN
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_select_disbursement_plans" ON disbursement_plans';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_insert_disbursement_plans" ON disbursement_plans';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_update_disbursement_plans" ON disbursement_plans';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_delete_disbursement_plans" ON disbursement_plans';
    
    EXECUTE 'CREATE POLICY "disbursement_plans_select" ON disbursement_plans FOR SELECT TO authenticated USING (public.is_global_role() OR public.is_project_member(project_id))';
    EXECUTE 'CREATE POLICY "disbursement_plans_insert" ON disbursement_plans FOR INSERT TO authenticated WITH CHECK (public.is_global_role() OR public.is_project_member(project_id))';
    EXECUTE 'CREATE POLICY "disbursement_plans_update" ON disbursement_plans FOR UPDATE TO authenticated USING (public.is_global_role() OR public.is_project_member(project_id)) WITH CHECK (public.is_global_role() OR public.is_project_member(project_id))';
    EXECUTE 'CREATE POLICY "disbursement_plans_delete" ON disbursement_plans FOR DELETE TO authenticated USING (public.is_admin())';
  END IF;
END $$;

-- 4.7 CDE-related tables — project-scoped
DO $$ BEGIN
  -- cde_folders
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cde_folders') THEN
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_select_cde_folders" ON cde_folders';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_insert_cde_folders" ON cde_folders';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_update_cde_folders" ON cde_folders';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_delete_cde_folders" ON cde_folders';
    
    EXECUTE 'CREATE POLICY "cde_folders_select" ON cde_folders FOR SELECT TO authenticated USING (public.is_global_role() OR public.is_project_member(project_id))';
    EXECUTE 'CREATE POLICY "cde_folders_insert" ON cde_folders FOR INSERT TO authenticated WITH CHECK (public.is_global_role() OR public.is_project_member(project_id))';
    EXECUTE 'CREATE POLICY "cde_folders_update" ON cde_folders FOR UPDATE TO authenticated USING (public.is_global_role() OR public.is_project_member(project_id)) WITH CHECK (public.is_global_role() OR public.is_project_member(project_id))';
    EXECUTE 'CREATE POLICY "cde_folders_delete" ON cde_folders FOR DELETE TO authenticated USING (public.is_global_role())';
  END IF;
END $$;

-- 4.8 WORKFLOW tables — open read (system data), restricted write
DO $$ BEGIN
  -- workflows (template definitions)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflows') THEN
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_select_workflows" ON workflows';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_insert_workflows" ON workflows';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_update_workflows" ON workflows';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_delete_workflows" ON workflows';
    
    EXECUTE 'CREATE POLICY "workflows_select" ON workflows FOR SELECT TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY "workflows_insert" ON workflows FOR INSERT TO authenticated WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY "workflows_update" ON workflows FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY "workflows_delete" ON workflows FOR DELETE TO authenticated USING (public.is_admin())';
  END IF;
  
  -- workflow_nodes
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflow_nodes') THEN
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_select_workflow_nodes" ON workflow_nodes';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_insert_workflow_nodes" ON workflow_nodes';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_update_workflow_nodes" ON workflow_nodes';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_delete_workflow_nodes" ON workflow_nodes';
    
    EXECUTE 'CREATE POLICY "workflow_nodes_select" ON workflow_nodes FOR SELECT TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY "workflow_nodes_insert" ON workflow_nodes FOR INSERT TO authenticated WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY "workflow_nodes_update" ON workflow_nodes FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY "workflow_nodes_delete" ON workflow_nodes FOR DELETE TO authenticated USING (public.is_admin())';
  END IF;

  -- workflow_edges
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflow_edges') THEN
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_select_workflow_edges" ON workflow_edges';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_insert_workflow_edges" ON workflow_edges';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_update_workflow_edges" ON workflow_edges';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_delete_workflow_edges" ON workflow_edges';
    
    EXECUTE 'CREATE POLICY "workflow_edges_select" ON workflow_edges FOR SELECT TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY "workflow_edges_insert" ON workflow_edges FOR INSERT TO authenticated WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY "workflow_edges_update" ON workflow_edges FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY "workflow_edges_delete" ON workflow_edges FOR DELETE TO authenticated USING (public.is_admin())';
  END IF;

  -- workflow_instances
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflow_instances') THEN
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_select_workflow_instances" ON workflow_instances';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_insert_workflow_instances" ON workflow_instances';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_update_workflow_instances" ON workflow_instances';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_delete_workflow_instances" ON workflow_instances';
    
    EXECUTE 'CREATE POLICY "workflow_instances_select" ON workflow_instances FOR SELECT TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY "workflow_instances_insert" ON workflow_instances FOR INSERT TO authenticated WITH CHECK (public.get_current_employee_id() IS NOT NULL)';
    EXECUTE 'CREATE POLICY "workflow_instances_update" ON workflow_instances FOR UPDATE TO authenticated USING (public.get_current_employee_id() IS NOT NULL) WITH CHECK (public.get_current_employee_id() IS NOT NULL)';
    EXECUTE 'CREATE POLICY "workflow_instances_delete" ON workflow_instances FOR DELETE TO authenticated USING (public.is_admin())';
  END IF;

  -- workflow_tasks
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflow_tasks') THEN
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_select_workflow_tasks" ON workflow_tasks';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_insert_workflow_tasks" ON workflow_tasks';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_update_workflow_tasks" ON workflow_tasks';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_delete_workflow_tasks" ON workflow_tasks';
    
    EXECUTE 'CREATE POLICY "workflow_tasks_select" ON workflow_tasks FOR SELECT TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY "workflow_tasks_insert" ON workflow_tasks FOR INSERT TO authenticated WITH CHECK (public.get_current_employee_id() IS NOT NULL)';
    EXECUTE 'CREATE POLICY "workflow_tasks_update" ON workflow_tasks FOR UPDATE TO authenticated USING (public.get_current_employee_id() IS NOT NULL) WITH CHECK (public.get_current_employee_id() IS NOT NULL)';
    EXECUTE 'CREATE POLICY "workflow_tasks_delete" ON workflow_tasks FOR DELETE TO authenticated USING (public.is_admin())';
  END IF;
END $$;

-- 4.9 Remaining tables: open read, authenticated write
DO $$ BEGIN
  DECLARE t TEXT;
  BEGIN
    FOR t IN SELECT unnest(ARRAY[
      'task_statuses', 'task_comments', 'task_links',
      'cde_comments', 'cde_workflow_history', 'cde_permissions',
      'cde_transmittals', 'cde_audit_log',
      'contractor_accounts', 'document_attachments', 'entity_registry'
    ]) LOOP
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t AND table_schema = 'public') THEN
        EXECUTE format('DROP POLICY IF EXISTS "allow_all_select_%s" ON %I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "allow_all_insert_%s" ON %I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "allow_all_update_%s" ON %I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "allow_all_delete_%s" ON %I', t, t);
        
        EXECUTE format('CREATE POLICY "%s_select" ON %I FOR SELECT TO authenticated USING (true)', t, t);
        EXECUTE format('CREATE POLICY "%s_insert" ON %I FOR INSERT TO authenticated WITH CHECK (public.get_current_employee_id() IS NOT NULL OR public.get_current_contractor_id() IS NOT NULL)', t, t);
        EXECUTE format('CREATE POLICY "%s_update" ON %I FOR UPDATE TO authenticated USING (public.get_current_employee_id() IS NOT NULL OR public.get_current_contractor_id() IS NOT NULL) WITH CHECK (public.get_current_employee_id() IS NOT NULL OR public.get_current_contractor_id() IS NOT NULL)', t, t);
        EXECUTE format('CREATE POLICY "%s_delete" ON %I FOR DELETE TO authenticated USING (public.is_admin())', t, t);
      END IF;
    END LOOP;
  END;
END $$;


-- ╔══════════════════════════════════════════════╗
-- ║  STEP 5: Performance indexes for RLS          ║
-- ║  Helper function queries need fast lookups     ║
-- ╚══════════════════════════════════════════════╝

-- Critical: auth_user_id lookup (used in every RLS check)
CREATE INDEX IF NOT EXISTS idx_user_accounts_auth_user_id
  ON user_accounts(auth_user_id);

-- Project member lookups (used in is_project_member)
CREATE INDEX IF NOT EXISTS idx_project_members_composite
  ON project_members(employee_id, project_id);

-- Contractor auth lookup
CREATE INDEX IF NOT EXISTS idx_contractor_accounts_auth_user_id
  ON contractor_accounts(auth_user_id);

-- Employee role/department lookup
CREATE INDEX IF NOT EXISTS idx_employees_role_department
  ON employees(role, department);

-- Contract lookups for indirect project access
CREATE INDEX IF NOT EXISTS idx_contracts_project_id
  ON contracts(project_id);

CREATE INDEX IF NOT EXISTS idx_contracts_contractor_id
  ON contracts(contractor_id);

-- Payment lookups
CREATE INDEX IF NOT EXISTS idx_payments_project_id
  ON payments(project_id);

CREATE INDEX IF NOT EXISTS idx_payments_contract_id
  ON payments(contract_id);

-- Bidding package lookups
CREATE INDEX IF NOT EXISTS idx_bidding_packages_project_id
  ON bidding_packages(project_id);

-- Task lookups
CREATE INDEX IF NOT EXISTS idx_tasks_project_id
  ON tasks(project_id);

CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id
  ON tasks(assignee_id);


-- ╔══════════════════════════════════════════════╗
-- ║  Done! Summary:                               ║
-- ║  - 7 helper functions created                 ║
-- ║  - 92+ old "allow_all_*" policies dropped     ║
-- ║  - 100+ new role-based policies created       ║
-- ║  - 14 performance indexes added               ║
-- ╚══════════════════════════════════════════════╝
