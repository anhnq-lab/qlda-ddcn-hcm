-- =================================================================
-- PATCH: Thêm các cột còn thiếu cho bảng workflow_tasks
-- 
-- Nguyên nhân: Bảng gốc chỉ có các cột cơ bản (node_id, status, 
-- comments...) nhưng code frontend đang ghi thêm name, progress,
-- metadata, task_type, start_date, started_at, cde_folder_id.
-- Khi upsert các trường này bị "unknown column" → lỗi silent fail.
-- =================================================================

-- 1. name — tên công việc
ALTER TABLE public.workflow_tasks 
  ADD COLUMN IF NOT EXISTS name VARCHAR(500);

-- 2. task_type — phân loại: 'workflow' (từ template) hoặc 'ad-hoc' (tạo tay)
ALTER TABLE public.workflow_tasks 
  ADD COLUMN IF NOT EXISTS task_type VARCHAR(50) DEFAULT 'workflow';

-- 3. start_date — ngày bắt đầu kế hoạch
ALTER TABLE public.workflow_tasks 
  ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;

-- 4. started_at — ngày bắt đầu thực tế
ALTER TABLE public.workflow_tasks 
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;

-- 5. progress — tiến độ 0-100
ALTER TABLE public.workflow_tasks 
  ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;

-- 6. metadata — JSONB chứa dữ liệu mở rộng (subtasks, attachments, costs...)
ALTER TABLE public.workflow_tasks 
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 7. cde_folder_id — liên kết tới CDE folder
ALTER TABLE public.workflow_tasks 
  ADD COLUMN IF NOT EXISTS cde_folder_id VARCHAR(255);

-- 8. updated_at — timestamp cập nhật (service ghi mỗi lần save)
ALTER TABLE public.workflow_tasks 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 9. Cho phép node_id NULL cho các task ad-hoc (không thuộc bước nào)
ALTER TABLE public.workflow_tasks 
  ALTER COLUMN node_id DROP NOT NULL;

-- 10. Index cho truy vấn nhanh
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_instance 
  ON public.workflow_tasks(instance_id);

CREATE INDEX IF NOT EXISTS idx_workflow_tasks_status 
  ON public.workflow_tasks(status);

CREATE INDEX IF NOT EXISTS idx_workflow_tasks_assignee 
  ON public.workflow_tasks(assignee_id);
