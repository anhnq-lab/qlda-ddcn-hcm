-- Cho phép admin hoặc những người dùng nội bộ (authenticated) được quyền quản trị Sổ tay Quy trình ISO
-- (Tobe Refined: Sau này có thể bọc bằng hàm check role Admin)

CREATE POLICY "Cho phép thêm quy trình ISO" ON public.iso_workflows
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Cho phép sửa quy trình ISO" ON public.iso_workflows
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Cho phép xoá quy trình ISO" ON public.iso_workflows
    FOR DELETE USING (auth.role() = 'authenticated');

-- Các bảng Node & Edges
CREATE POLICY "Cho phép quản trị node" ON public.iso_workflow_nodes
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Cho phép quản trị edges" ON public.iso_workflow_edges
    FOR ALL USING (auth.role() = 'authenticated');
