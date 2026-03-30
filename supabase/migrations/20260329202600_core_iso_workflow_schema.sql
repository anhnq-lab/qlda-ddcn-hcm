-- V1 of ISO Workflow Engine Core Schema
-- Đây là "Trái tim" của hệ thống phê duyệt cho toàn bộ Ban QLDA (Dự án, Tài chính, Hành chính, Nhân sự)

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'iso_workflow_category') THEN
        CREATE TYPE iso_workflow_category AS ENUM ('project', 'document', 'finance', 'hr', 'asset', 'other');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'iso_workflow_node_type') THEN
        CREATE TYPE iso_workflow_node_type AS ENUM ('start', 'end', 'approval', 'input', 'automated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'iso_workflow_instance_status') THEN
        CREATE TYPE iso_workflow_instance_status AS ENUM ('draft', 'in_progress', 'completed', 'rejected', 'cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'iso_workflow_task_status') THEN
        CREATE TYPE iso_workflow_task_status AS ENUM ('pending', 'completed', 'skipped', 'transferred');
    END IF;
END
$$;

-- 2. QUY TRÌNH GỐC (Định nghĩa)
CREATE TABLE IF NOT EXISTS public.iso_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category iso_workflow_category DEFAULT 'other',
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb, -- Cấu hình nâng cao (biểu tượng, màu sắc...)
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CÁC ĐIỂM NÚT (Steps/Nodes)
CREATE TABLE IF NOT EXISTS public.iso_workflow_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES public.iso_workflows(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type iso_workflow_node_type DEFAULT 'approval',
    assignee_role VARCHAR(100), -- VD: 'project_manager', 'director', 'accountant'
    sla_formula VARCHAR(255), -- VD: '15d', hoặc 'context.amount > 50 ? 5d : 2d' (hỗ trợ code chạy biến động)
    form_config JSONB DEFAULT '{}'::jsonb, -- VD: [ { field: 'nguoi_ky', type: 'user_select', required: true } ]
    metadata JSONB DEFAULT '{}'::jsonb, -- Tọa độ hiển thị trên Canvas (x, y)
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. LUỒNG CHẢY (Edges / Branching logic)
CREATE TABLE IF NOT EXISTS public.iso_workflow_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES public.iso_workflows(id) ON DELETE CASCADE NOT NULL,
    source_node UUID REFERENCES public.iso_workflow_nodes(id) ON DELETE CASCADE,
    target_node UUID REFERENCES public.iso_workflow_nodes(id) ON DELETE CASCADE,
    condition_expr TEXT, -- VD: 'action == "APPROVE"' hoặc 'form.total > 500'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LƯỢT CHẠY THỰC TẾ (Instances / Runs)
-- Mỗi khi tạo một Đề xuất, 1 Dự án, 1 Công văn... cần chạy quy trình thì sinh ra dòng này
CREATE TABLE IF NOT EXISTS public.iso_workflow_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES public.iso_workflows(id) ON DELETE RESTRICT NOT NULL,
    reference_id UUID, -- Khoá ngoại mềm trỏ tới bảng dự án, tờ trình, công văn...
    reference_type VARCHAR(100), -- VD: 'project', 'contract_payment'
    status iso_workflow_instance_status DEFAULT 'in_progress',
    current_node_id UUID REFERENCES public.iso_workflow_nodes(id),
    context_data JSONB DEFAULT '{}'::jsonb, -- Gom góp mọi dữ liệu (Form) dọc đường đi
    created_by UUID REFERENCES auth.users(id),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. GIAO VIỆC & LƯU LỊCH SỬ DUYỆT (Audit Trail - Tuân thủ ISO)
-- Dùng để query trang "My Tasks"
CREATE TABLE IF NOT EXISTS public.iso_workflow_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID REFERENCES public.iso_workflow_instances(id) ON DELETE CASCADE NOT NULL,
    node_id UUID REFERENCES public.iso_workflow_nodes(id) ON DELETE RESTRICT NOT NULL,
    assignee_id UUID REFERENCES auth.users(id), -- Người bị giao việc
    status iso_workflow_task_status DEFAULT 'pending',
    action_taken VARCHAR(100), -- VD: 'APPROVED', 'REJECTED', 'RETURNED'
    comments TEXT, -- Ý kiến chỉ đạo/lý do từ chối
    digital_signature JSONB, -- [Tùy chọn] Lưu token ký số/mật khẩu cấp 2
    due_date TIMESTAMPTZ, -- Hạn chót dựa trên SLA
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- trigger_set_timestamp function (nếu chưa có)
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Triggers cập nhật thời gian
CREATE TRIGGER set_timestamp_iso_workflows
BEFORE UPDATE ON public.iso_workflows
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_iso_workflow_nodes
BEFORE UPDATE ON public.iso_workflow_nodes
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_iso_workflow_instances
BEFORE UPDATE ON public.iso_workflow_instances
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- 8. Row Level Security (RLS) Policies căn bản
ALTER TABLE public.iso_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iso_workflow_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iso_workflow_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iso_workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iso_workflow_tasks ENABLE ROW LEVEL SECURITY;

-- Mọi người đều được xem định nghĩa quy trình
CREATE POLICY "Cho phép xem định nghĩa quy trình" ON public.iso_workflows FOR SELECT USING (true);
CREATE POLICY "Cho phép xem node quy trình" ON public.iso_workflow_nodes FOR SELECT USING (true);
CREATE POLICY "Cho phép xem edge quy trình" ON public.iso_workflow_edges FOR SELECT USING (true);

-- Cho phép nhân sự xem các Instance (hồ sơ) liên quan đến mình
CREATE POLICY "Xem hồ sơ tạo ra hoặc được assign" ON public.iso_workflow_instances 
FOR SELECT USING (
    created_by = auth.uid() 
    OR 
    EXISTS (SELECT 1 FROM public.iso_workflow_tasks t WHERE t.instance_id = public.iso_workflow_instances.id AND t.assignee_id = auth.uid())
);

-- Cho phép nhân sự xem nhiệm vụ (My Tasks) của chính mình
CREATE POLICY "Xem việc của tôi" ON public.iso_workflow_tasks 
FOR SELECT USING (assignee_id = auth.uid() OR EXISTS (SELECT 1 FROM public.iso_workflow_instances ctx WHERE ctx.id = instance_id AND ctx.created_by = auth.uid()));

-- Cho phép cập nhật Task (Duyệt/Ký)
CREATE POLICY "Cập nhật task của chính mình" ON public.iso_workflow_tasks 
FOR UPDATE USING (assignee_id = auth.uid());
