-- 1. DỌN SẠCH TÀN DƯ CŨ (Drop legacy ISO tables and types)
DROP TABLE IF EXISTS public.iso_workflow_tasks CASCADE;
DROP TABLE IF EXISTS public.iso_workflow_instances CASCADE;
DROP TABLE IF EXISTS public.iso_workflow_edges CASCADE;
DROP TABLE IF EXISTS public.iso_workflow_nodes CASCADE;
DROP TABLE IF EXISTS public.iso_workflows CASCADE;

DROP TYPE IF EXISTS iso_workflow_category CASCADE;
DROP TYPE IF EXISTS iso_workflow_node_type CASCADE;
DROP TYPE IF EXISTS iso_workflow_instance_status CASCADE;
DROP TYPE IF EXISTS iso_workflow_task_status CASCADE;

-- 2. TẠO TYPE MỚI (CLEAN, NO PREFIX)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workflow_category') THEN
        CREATE TYPE workflow_category AS ENUM ('project', 'document', 'finance', 'hr', 'asset', 'other');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workflow_node_type') THEN
        CREATE TYPE workflow_node_type AS ENUM ('start', 'end', 'approval', 'input', 'automated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workflow_instance_status') THEN
        CREATE TYPE workflow_instance_status AS ENUM ('draft', 'in_progress', 'completed', 'rejected', 'cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workflow_task_status') THEN
        CREATE TYPE workflow_task_status AS ENUM ('pending', 'completed', 'skipped', 'transferred');
    END IF;
END
$$;

-- 3. QUY TRÌNH GỐC (Workflows)
CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category workflow_category DEFAULT 'other',
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. NÚT XỬ LÝ (Workflow Nodes)
CREATE TABLE IF NOT EXISTS public.workflow_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type workflow_node_type DEFAULT 'approval',
    assignee_role VARCHAR(100),
    sla_formula VARCHAR(255),
    form_config JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb, 
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LƯỚI KẾT NỐI (Workflow Edges)
CREATE TABLE IF NOT EXISTS public.workflow_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE NOT NULL,
    source_node UUID REFERENCES public.workflow_nodes(id) ON DELETE CASCADE,
    target_node UUID REFERENCES public.workflow_nodes(id) ON DELETE CASCADE,
    condition_expr TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BIÊN BẢN CHẠY THỰC TẾ (Workflow Instances)
CREATE TABLE IF NOT EXISTS public.workflow_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE RESTRICT NOT NULL,
    reference_id UUID,
    reference_type VARCHAR(100),
    status workflow_instance_status DEFAULT 'in_progress',
    current_node_id UUID REFERENCES public.workflow_nodes(id),
    context_data JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES auth.users(id),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. LỊCH SỬ GIAO VIỆC (Workflow Tasks)
CREATE TABLE IF NOT EXISTS public.workflow_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID REFERENCES public.workflow_instances(id) ON DELETE CASCADE NOT NULL,
    node_id UUID REFERENCES public.workflow_nodes(id) ON DELETE RESTRICT NOT NULL,
    assignee_id UUID REFERENCES auth.users(id),
    status workflow_task_status DEFAULT 'pending',
    action_taken VARCHAR(100),
    comments TEXT,
    digital_signature JSONB,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TRIGGER UPDATE TIME
CREATE TRIGGER set_timestamp_workflows
BEFORE UPDATE ON public.workflows
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_workflow_nodes
BEFORE UPDATE ON public.workflow_nodes
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_workflow_instances
BEFORE UPDATE ON public.workflow_instances
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- 9. BẬT BẢO MẬT (RLS) NHƯNG MỞ RỘNG ALL (Dành cho Dev/Admin)
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for workflows" ON public.workflows FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for workflow_nodes" ON public.workflow_nodes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for workflow_edges" ON public.workflow_edges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for workflow_instances" ON public.workflow_instances FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for workflow_tasks" ON public.workflow_tasks FOR ALL USING (true) WITH CHECK (true);
