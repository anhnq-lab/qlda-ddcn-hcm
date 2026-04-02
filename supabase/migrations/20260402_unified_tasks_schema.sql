-- ═══════════════════════════════════════════════════════════════
-- MIGRATION: Unified Tasks Schema
-- Mục tiêu: Gộp tasks + workflow_tasks → 1 bảng tasks duy nhất
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. DỌN SẠCH DỮ LIỆU CŨ (Demo data) ────────────────────
-- Xóa bảng con trước (FK dependencies)
DROP TABLE IF EXISTS public.sub_tasks CASCADE;
DROP TABLE IF EXISTS public.workflow_tasks CASCADE;
DROP TABLE IF EXISTS public.workflow_instances CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;

-- ─── 2. THÊM sort_order VÀO workflow_nodes ───────────────────
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'workflow_nodes' AND column_name = 'sort_order'
    ) THEN
        ALTER TABLE public.workflow_nodes ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
END $$;

-- ─── 3. TẠO ENUM MỚI (nếu chưa có) ─────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_type') THEN
        CREATE TYPE task_type AS ENUM ('project', 'internal');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'done');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
        CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
    END IF;
END $$;

-- ─── 4. BẢNG TASKS MỚI (UUID PK, Unified) ───────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Phân loại
    task_type task_type NOT NULL DEFAULT 'project',
    
    -- Liên kết dự án (nullable: nội bộ thì null)
    project_id TEXT REFERENCES public.projects(project_id) ON DELETE CASCADE,
    
    -- Tham chiếu quy trình mẫu (nullable: tạo thủ công thì null)
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE SET NULL,
    workflow_node_id UUID REFERENCES public.workflow_nodes(id) ON DELETE SET NULL,
    
    -- Thông tin cơ bản
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'todo',
    priority task_priority NOT NULL DEFAULT 'medium',
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    
    -- Người thực hiện
    assignee_id TEXT,
    approver_id TEXT,
    
    -- Thời gian kế hoạch
    start_date DATE,
    due_date DATE,
    duration_days INTEGER,
    
    -- Thời gian thực tế
    actual_start_date DATE,
    actual_end_date DATE,
    
    -- Phân loại giai đoạn (cho Tab Kế hoạch)
    phase VARCHAR(100),           -- e.g., 'preparation', 'execution', 'completion'
    step_code VARCHAR(255),       -- human-readable code, e.g., 'PREP_POLICY'
    sort_order INTEGER DEFAULT 0, -- thứ tự hiển thị
    
    -- Chi phí
    estimated_cost NUMERIC,
    actual_cost NUMERIC,
    
    -- Pháp lý & Tài liệu
    legal_basis TEXT,
    output_document TEXT,
    
    -- Quan hệ predecessor
    predecessor_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    
    -- Metadata JSONB (sub_tasks inline, attachments, etc.)
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Audit
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 5. BẢNG SUB_TASKS MỚI ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sub_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'todo',
    assignee_id TEXT,
    due_date DATE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 6. INDEXES ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_task_type ON public.tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_workflow_id ON public.tasks(workflow_id);
CREATE INDEX IF NOT EXISTS idx_tasks_workflow_node_id ON public.tasks(workflow_node_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_phase ON public.tasks(phase);
CREATE INDEX IF NOT EXISTS idx_sub_tasks_task_id ON public.sub_tasks(task_id);

-- ─── 7. TRIGGERS ─────────────────────────────────────────────
-- Updated_at auto-update (reuse existing trigger function)
CREATE OR REPLACE TRIGGER set_timestamp_tasks
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE OR REPLACE TRIGGER set_timestamp_sub_tasks
    BEFORE UPDATE ON public.sub_tasks
    FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- ─── 8. RLS POLICIES ─────────────────────────────────────────
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_tasks ENABLE ROW LEVEL SECURITY;

-- Dev/Admin: mở rộng toàn bộ (sẽ siết lại khi production)
CREATE POLICY "Enable all for tasks" ON public.tasks
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for sub_tasks" ON public.sub_tasks
    FOR ALL USING (true) WITH CHECK (true);

-- ─── 9. COMMENTS ─────────────────────────────────────────────
COMMENT ON TABLE public.tasks IS 'Bảng công việc thống nhất — dự án + nội bộ, có/không tham chiếu quy trình mẫu';
COMMENT ON TABLE public.sub_tasks IS 'Công việc con thuộc task cha';
COMMENT ON COLUMN public.tasks.task_type IS 'project: thuộc dự án, internal: nội bộ';
COMMENT ON COLUMN public.tasks.workflow_id IS 'Tham chiếu quy trình mẫu (nullable)';
COMMENT ON COLUMN public.tasks.workflow_node_id IS 'Tham chiếu bước trong quy trình mẫu (nullable)';
