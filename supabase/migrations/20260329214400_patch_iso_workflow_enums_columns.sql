-- Migration: Bổ sung enum values và cột thiếu cho ISO Workflow Engine
-- Chạy sau migration 20260329202600_core_iso_workflow_schema.sql

-- 1. Thêm status 'in_progress' và 'rejected' vào iso_workflow_task_status
DO $$
BEGIN
    -- Check if value exists before adding
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'in_progress'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'iso_workflow_task_status')
    ) THEN
        ALTER TYPE iso_workflow_task_status ADD VALUE 'in_progress';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'rejected'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'iso_workflow_task_status')
    ) THEN
        ALTER TYPE iso_workflow_task_status ADD VALUE 'rejected';
    END IF;
END
$$;

-- 2. Thêm cột started_at cho tasks (tracking khi nào task bắt đầu thực hiện)
ALTER TABLE public.iso_workflow_tasks
    ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;

-- 3. Thêm cột cde_folder_id cho tasks (link tới thư mục CDE)
ALTER TABLE public.iso_workflow_tasks
    ADD COLUMN IF NOT EXISTS cde_folder_id UUID REFERENCES public.cde_folders(id) ON DELETE SET NULL;

-- Cập nhật Policies cũ, dùng public.user_accounts u join với employees e thay vì e.auth_user_id
-- Table: iso_workflows
DROP POLICY IF EXISTS "Cho phép Admin tạo/sửa luồng" ON public.iso_workflows;
CREATE POLICY "Cho phép Admin tạo/sửa luồng" ON public.iso_workflows FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.employees e 
        JOIN public.user_accounts u ON e.employee_id = u.employee_id
        WHERE u.auth_user_id::text = auth.uid()::text AND e.role = 'admin'
    )
);

-- Table: iso_workflow_nodes
DROP POLICY IF EXISTS "Cho phép Admin tạo/sửa nodes" ON public.iso_workflow_nodes;
CREATE POLICY "Cho phép Admin tạo/sửa nodes" ON public.iso_workflow_nodes FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.employees e 
        JOIN public.user_accounts u ON e.employee_id = u.employee_id
        WHERE u.auth_user_id::text = auth.uid()::text AND e.role = 'admin'
    )
);

-- Table: iso_workflow_edges
DROP POLICY IF EXISTS "Cho phép Admin tạo/sửa edges" ON public.iso_workflow_edges;
CREATE POLICY "Cho phép Admin tạo/sửa edges" ON public.iso_workflow_edges FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.employees e 
        JOIN public.user_accounts u ON e.employee_id = u.employee_id
        WHERE u.auth_user_id::text = auth.uid()::text AND e.role = 'admin'
    )
);

-- Table: iso_workflow_instances
DROP POLICY IF EXISTS "Cho phép người dùng tạo instance cho dự án của họ" ON public.iso_workflow_instances;
CREATE POLICY "Cho phép người dùng tạo instance" ON public.iso_workflow_instances FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.employees e 
        JOIN public.user_accounts u ON e.employee_id = u.employee_id
        WHERE u.auth_user_id::text = auth.uid()::text
    )
);

-- Table: iso_workflow_tasks
DROP POLICY IF EXISTS "Cho phép assignee cập nhật task" ON public.iso_workflow_tasks;
CREATE POLICY "Cho phép assignee cập nhật task" ON public.iso_workflow_tasks FOR UPDATE USING (
    assignee_id::text IN (
        SELECT e.employee_id FROM public.employees e 
        JOIN public.user_accounts u ON e.employee_id = u.employee_id
        WHERE u.auth_user_id::text = auth.uid()::text
    )
);

-- Tasks: admin tạo task, assignee cập nhật (policy UPDATE đã có)
CREATE POLICY "Admin tạo task" ON public.iso_workflow_tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.employees e 
            JOIN public.user_accounts u ON e.employee_id = u.employee_id
            WHERE u.auth_user_id::text = auth.uid()::text AND e.role = 'admin'
        )
    );

-- 5. Index tối ưu query My Tasks
CREATE INDEX IF NOT EXISTS idx_iso_workflow_tasks_assignee_status
    ON public.iso_workflow_tasks(assignee_id, status);

CREATE INDEX IF NOT EXISTS idx_iso_workflow_instances_reference
    ON public.iso_workflow_instances(reference_id, reference_type);
