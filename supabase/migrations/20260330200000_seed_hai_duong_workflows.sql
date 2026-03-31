-- ============================================================
-- SEED 3 QUY TRÌNH ĐẦU TƯ CÔNG - SỔ TAY HẢI DƯƠNG 2025
-- 1 bước thiết kế (BCKT-KT)
-- 2 bước thiết kế (TKCS → TKBVTC)
-- 3 bước thiết kế (TKCS → TKKT → TKBVTC)
-- ============================================================

-- Xóa dữ liệu cũ (nếu có)
DELETE FROM public.workflow_edges;
DELETE FROM public.workflow_nodes;
DELETE FROM public.workflows WHERE category = 'project';

DO $$
DECLARE
    -- Workflow IDs
    v_wf_1step UUID;
    v_wf_2step UUID;
    v_wf_3step UUID;

    -- Node IDs for chaining edges
    v_node_id UUID;
    v_prev_node UUID;

    -- Phase marker nodes
    v_phase1_start UUID;
    v_phase2_start UUID;
    v_phase3_start UUID;

BEGIN
-- ============================================================
-- QUY TRÌNH 1 BƯỚC THIẾT KẾ (BCKT-KT)
-- ============================================================
INSERT INTO public.workflows (code, name, description, category, version, is_active, metadata)
VALUES (
    'DTC-1STEP',
    'Quy trình dự án 1 bước thiết kế',
    'Dự án chỉ lập Báo cáo Kinh tế - Kỹ thuật (BCKT-KT), TKBVTC gộp chung. Áp dụng cho công trình quy mô nhỏ theo Sổ tay ĐTC Hải Dương 2025.',
    'project', 1, true,
    '{"design_steps": 1, "source": "So tay DTC Hai Duong 2025", "applicable": "Cong trinh quy mo nho"}'::jsonb
) RETURNING id INTO v_wf_1step;

-- --- GIAI ĐOẠN I: CHUẨN BỊ DỰ ÁN ---
v_prev_node := NULL;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_1step, 'Bắt đầu quy trình', 'start', 'system', NULL,
    '{"phase": "I", "phase_name": "Chuẩn bị dự án"}'::jsonb)
RETURNING id INTO v_node_id;
v_phase1_start := v_node_id;
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_1step, 'Lập Báo cáo đề xuất chủ trương đầu tư', 'input', 'don_vi_de_xuat', '20d',
    '{"phase": "I", "step": "I.1.1", "description": "Lập BCKT-KT / Báo cáo đề xuất CTrĐT"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_1step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_1step, 'Thẩm định chủ trương đầu tư', 'approval', 'hoi_dong_tham_dinh', '30d',
    '{"phase": "I", "step": "I.1.2", "description": "Thẩm định BCNCTKT, nguồn vốn & khả năng cân đối vốn"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_1step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_1step, 'Phê duyệt chủ trương đầu tư', 'approval', 'nguoi_quyet_dinh_dt', '10d',
    '{"phase": "I", "step": "I.1.4", "description": "Quyết định chủ trương đầu tư"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_1step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_1step, 'Giao Chủ đầu tư dự án', 'approval', 'nguoi_quyet_dinh_dt', '5d',
    '{"phase": "I", "step": "I.1.5"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_1step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_1step, 'Lập Báo cáo Kinh tế - Kỹ thuật (BCKT-KT)', 'input', 'tu_van_thiet_ke', '60d',
    '{"phase": "I", "step": "I.2.5", "description": "Lập BCKT-KT (gộp TKBVTC). Dự án 1 bước thiết kế."}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_1step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_1step, 'Thẩm định BCKT-KT', 'approval', 'co_quan_chuyen_mon', '20d',
    '{"phase": "I", "step": "I.2.5b", "description": "Thẩm định Báo cáo Kinh tế - Kỹ thuật đầu tư XD"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_1step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_1step, 'Phê duyệt dự án (BCKT-KT)', 'approval', 'nguoi_quyet_dinh_dt', '5d',
    '{"phase": "I", "step": "I.2.7"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_1step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

-- --- GIAI ĐOẠN II: THỰC HIỆN DỰ ÁN ---
INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_1step, 'Lập, phê duyệt KH LCNT', 'approval', 'chu_dau_tu', '30d',
    '{"phase": "II", "phase_name": "Thực hiện dự án", "step": "II.1.2", "description": "Lập, thẩm định, phê duyệt KHLCNT dự án. TĐ: 20 ngày, PD: 10 ngày"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_1step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_1step, 'Giải phóng mặt bằng (GPMB)', 'approval', 'hoi_dong_bt_ht_tdc', '90d',
    '{"phase": "II", "step": "II.1.1b", "description": "Tổ chức BT, HT&TĐC GPMB (12 bước con)"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_1step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_1step, 'Lựa chọn nhà thầu thi công', 'approval', 'chu_dau_tu', '30d',
    '{"phase": "II", "step": "II.2.2", "description": "Lựa chọn nhà thầu theo KH LCNT"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_1step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_1step, 'Thông báo khởi công', 'input', 'chu_dau_tu', '3d',
    '{"phase": "II", "step": "II.2.3.1", "description": "Thông báo khởi công ít nhất 03 ngày trước"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_1step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_1step, 'Thi công xây dựng & Giám sát', 'input', 'nha_thau_thi_cong', '180d',
    '{"phase": "II", "step": "II.2.3.2", "description": "Thi công, hoàn thành, bàn giao - 11 trình tự quản lý thi công"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_1step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_1step, 'Nghiệm thu hoàn thành công trình', 'approval', 'co_quan_qlnn_xd', '15d',
    '{"phase": "II", "step": "II.2.4.2", "description": "Kiểm tra nghiệm thu hoàn thành CT"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_1step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

-- --- GIAI ĐOẠN III: KẾT THÚC DỰ ÁN ---
INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_1step, 'Bàn giao công trình đưa vào sử dụng', 'input', 'chu_dau_tu', '15d',
    '{"phase": "III", "phase_name": "Kết thúc dự án", "step": "III.2"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_1step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_1step, 'Lập hồ sơ Quyết toán dự án', 'input', 'chu_dau_tu', '120d',
    '{"phase": "III", "step": "III.3.3", "description": "Nhóm C: 4 tháng"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_1step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_1step, 'Thẩm tra Quyết toán dự án', 'approval', 'so_tai_chinh', '90d',
    '{"phase": "III", "step": "III.3.4", "description": "Nhóm C: 3 tháng"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_1step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_1step, 'Phê duyệt QT, Tất toán & Đóng mã DA', 'end', 'nguoi_quyet_dinh_dt', '15d',
    '{"phase": "III", "step": "III.3.5+6", "description": "Phê duyệt QT (15 ngày) + Tất toán tài khoản, đóng mã DA"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_1step, v_prev_node, v_node_id);


-- ============================================================
-- QUY TRÌNH 2 BƯỚC THIẾT KẾ (TKCS → TKBVTC)
-- ============================================================
INSERT INTO public.workflows (code, name, description, category, version, is_active, metadata)
VALUES (
    'DTC-2STEP',
    'Quy trình dự án 2 bước thiết kế',
    'Thiết kế cơ sở (TKCS) → Thiết kế bản vẽ thi công (TKBVTC). Áp dụng dự án thông thường nhóm B, C theo Sổ tay ĐTC Hải Dương 2025.',
    'project', 1, true,
    '{"design_steps": 2, "source": "So tay DTC Hai Duong 2025", "applicable": "Du an nhom B, C thong thuong"}'::jsonb
) RETURNING id INTO v_wf_2step;

v_prev_node := NULL;

-- --- GIAI ĐOẠN I: CHUẨN BỊ DỰ ÁN ---
INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_2step, 'Bắt đầu quy trình', 'start', 'system', NULL,
    '{"phase": "I", "phase_name": "Chuẩn bị dự án"}'::jsonb)
RETURNING id INTO v_node_id;
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_2step, 'Lập Báo cáo đề xuất chủ trương đầu tư', 'input', 'don_vi_de_xuat', '20d',
    '{"phase": "I", "step": "I.1.1"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_2step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_2step, 'Thẩm định chủ trương đầu tư', 'approval', 'hoi_dong_tham_dinh', '30d',
    '{"phase": "I", "step": "I.1.2"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_2step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_2step, 'Phê duyệt chủ trương đầu tư', 'approval', 'nguoi_quyet_dinh_dt', '10d',
    '{"phase": "I", "step": "I.1.4"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_2step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_2step, 'Giao Chủ đầu tư dự án', 'approval', 'nguoi_quyet_dinh_dt', '5d',
    '{"phase": "I", "step": "I.1.5"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_2step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_2step, 'Lập dự toán chi phí chuẩn bị đầu tư', 'input', 'chu_dau_tu', '10d',
    '{"phase": "I", "step": "I.2.1"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_2step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_2step, 'Lập, phê duyệt KHLCNT bước chuẩn bị', 'approval', 'chu_dau_tu', '30d',
    '{"phase": "I", "step": "I.2.2", "description": "TĐ: 20 ngày, PD: 10 ngày"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_2step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_2step, 'LCNT khảo sát, tư vấn lập TKCS', 'approval', 'chu_dau_tu', '30d',
    '{"phase": "I", "step": "I.2.3"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_2step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_2step, 'Lập Báo cáo NCKT (có TKCS)', 'input', 'tu_van_thiet_ke', '60d',
    '{"phase": "I", "step": "I.2.5", "description": "Lập BCNCKT bao gồm Thiết kế cơ sở"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_2step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_2step, 'Thẩm định BCNCKT & TKCS', 'approval', 'co_quan_chuyen_mon', '30d',
    '{"phase": "I", "step": "I.2.5b", "description": "Nhóm B: 30 ngày, Nhóm C: 20 ngày"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_2step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_2step, 'Phê duyệt dự án', 'approval', 'nguoi_quyet_dinh_dt', '7d',
    '{"phase": "I", "step": "I.2.7"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_2step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

-- --- GIAI ĐOẠN II: THỰC HIỆN DỰ ÁN ---
INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_2step, 'Lập, phê duyệt NV KSTK (triển khai sau TKCS)', 'input', 'chu_dau_tu', '15d',
    '{"phase": "II", "phase_name": "Thực hiện dự án", "step": "II.1.1a"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_2step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_2step, 'Giải phóng mặt bằng (GPMB)', 'approval', 'hoi_dong_bt_ht_tdc', '120d',
    '{"phase": "II", "step": "II.1.1b", "description": "12 bước con GPMB"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_2step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_2step, 'Lập TKBVTC (thiết kế bước 2)', 'input', 'tu_van_thiet_ke', '30d',
    '{"phase": "II", "step": "II.1.4a", "description": "Lập TK bản vẽ thi công sau TKCS"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_2step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_2step, 'Thẩm định TKBVTC', 'approval', 'co_quan_chuyen_mon', '30d',
    '{"phase": "II", "step": "II.1.4a-TD", "description": "Cấp II-III: 30 ngày, còn lại: 20 ngày"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_2step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_2step, 'Phê duyệt TKBVTC', 'approval', 'chu_dau_tu', '7d',
    '{"phase": "II", "step": "II.1.4a-PD"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_2step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_2step, 'Lập, phê duyệt KH LCNT giai đoạn THDA', 'approval', 'chu_dau_tu', '30d',
    '{"phase": "II", "step": "II.2.1"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_2step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_2step, 'Lựa chọn nhà thầu thi công, giám sát', 'approval', 'chu_dau_tu', '30d',
    '{"phase": "II", "step": "II.2.2"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_2step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_2step, 'Thông báo khởi công', 'input', 'chu_dau_tu', '3d',
    '{"phase": "II", "step": "II.2.3.1"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_2step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_2step, 'Thi công xây dựng & Giám sát', 'input', 'nha_thau_thi_cong', '240d',
    '{"phase": "II", "step": "II.2.3.2", "description": "11 trình tự quản lý thi công"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_2step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_2step, 'Nghiệm thu hoàn thành công trình', 'approval', 'co_quan_qlnn_xd', '20d',
    '{"phase": "II", "step": "II.2.4.2"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_2step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

-- --- GIAI ĐOẠN III: KẾT THÚC DỰ ÁN ---
INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_2step, 'Bàn giao công trình đưa vào sử dụng', 'input', 'chu_dau_tu', '15d',
    '{"phase": "III", "phase_name": "Kết thúc dự án", "step": "III.2"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_2step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_2step, 'Lập hồ sơ Quyết toán dự án', 'input', 'chu_dau_tu', '180d',
    '{"phase": "III", "step": "III.3.3", "description": "Nhóm B: 6 tháng"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_2step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_2step, 'Thẩm tra Quyết toán dự án', 'approval', 'so_tai_chinh', '120d',
    '{"phase": "III", "step": "III.3.4", "description": "Nhóm B: 4 tháng"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_2step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_2step, 'Phê duyệt QT, Tất toán & Đóng mã DA', 'end', 'nguoi_quyet_dinh_dt', '20d',
    '{"phase": "III", "step": "III.3.5+6"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_2step, v_prev_node, v_node_id);


-- ============================================================
-- QUY TRÌNH 3 BƯỚC THIẾT KẾ (TKCS → TKKT → TKBVTC)
-- ============================================================
INSERT INTO public.workflows (code, name, description, category, version, is_active, metadata)
VALUES (
    'DTC-3STEP',
    'Quy trình dự án 3 bước thiết kế',
    'Thiết kế cơ sở (TKCS) → Thiết kế kỹ thuật (TKKT) → Thiết kế bản vẽ thi công (TKBVTC). Áp dụng dự án lớn, phức tạp nhóm A hoặc công trình cấp đặc biệt, cấp I theo Sổ tay ĐTC Hải Dương 2025.',
    'project', 1, true,
    '{"design_steps": 3, "source": "So tay DTC Hai Duong 2025", "applicable": "Du an nhom A, cong trinh cap dac biet, cap I"}'::jsonb
) RETURNING id INTO v_wf_3step;

v_prev_node := NULL;

-- --- GIAI ĐOẠN I: CHUẨN BỊ DỰ ÁN ---
INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_3step, 'Bắt đầu quy trình', 'start', 'system', NULL,
    '{"phase": "I", "phase_name": "Chuẩn bị dự án"}'::jsonb)
RETURNING id INTO v_node_id;
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_3step, 'Lập Báo cáo NCTKT / đề xuất chủ trương ĐT', 'input', 'don_vi_de_xuat', '30d',
    '{"phase": "I", "step": "I.1.1", "description": "Lập BCNCTKT (dự án nhóm A)"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_3step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_3step, 'Thẩm định chủ trương đầu tư', 'approval', 'hoi_dong_tham_dinh', '45d',
    '{"phase": "I", "step": "I.1.2", "description": "Nhóm A: 45 ngày"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_3step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_3step, 'Phê duyệt chủ trương đầu tư', 'approval', 'nguoi_quyet_dinh_dt', '15d',
    '{"phase": "I", "step": "I.1.4"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_3step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_3step, 'Giao Chủ đầu tư dự án', 'approval', 'nguoi_quyet_dinh_dt', '5d',
    '{"phase": "I", "step": "I.1.5"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_3step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_3step, 'Lập dự toán chi phí chuẩn bị đầu tư', 'input', 'chu_dau_tu', '10d',
    '{"phase": "I", "step": "I.2.1"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_3step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_3step, 'Lập, phê duyệt KHLCNT bước chuẩn bị', 'approval', 'chu_dau_tu', '30d',
    '{"phase": "I", "step": "I.2.2"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_3step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_3step, 'LCNT khảo sát, tư vấn lập TKCS', 'approval', 'chu_dau_tu', '30d',
    '{"phase": "I", "step": "I.2.3"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_3step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_3step, 'Lập Báo cáo NCKT (có TKCS)', 'input', 'tu_van_thiet_ke', '80d',
    '{"phase": "I", "step": "I.2.5", "description": "Nhóm A: 80 ngày"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_3step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_3step, 'Thẩm định BCNCKT & TKCS', 'approval', 'co_quan_chuyen_mon', '40d',
    '{"phase": "I", "step": "I.2.5b", "description": "Nhóm A: 40 ngày (phấn đấu 35)"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_3step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_3step, 'Phê duyệt dự án', 'approval', 'nguoi_quyet_dinh_dt', '7d',
    '{"phase": "I", "step": "I.2.7"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_3step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

-- --- GIAI ĐOẠN II: THỰC HIỆN DỰ ÁN ---
INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_3step, 'Lập, phê duyệt NV KSTK (triển khai sau TKCS)', 'input', 'chu_dau_tu', '15d',
    '{"phase": "II", "phase_name": "Thực hiện dự án", "step": "II.1.1a"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_3step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_3step, 'Giải phóng mặt bằng (GPMB)', 'approval', 'hoi_dong_bt_ht_tdc', '180d',
    '{"phase": "II", "step": "II.1.1b", "description": "12 bước con GPMB. DA nhóm A: 180 ngày"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_3step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

-- Bước thiết kế 2: TKKT (chỉ có ở quy trình 3 bước)
INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_3step, 'Lập Thiết kế Kỹ thuật (TKKT)', 'input', 'tu_van_thiet_ke', '45d',
    '{"phase": "II", "step": "II.1.4a-TKKT", "description": "Bước thiết kế thứ 2 - chỉ có ở QT 3 bước"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_3step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_3step, 'Thẩm định TKKT', 'approval', 'co_quan_chuyen_mon', '40d',
    '{"phase": "II", "step": "II.1.4a-TKKT-TD", "description": "Cấp đặc biệt/cấp I: 40 ngày"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_3step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_3step, 'Phê duyệt TKKT', 'approval', 'chu_dau_tu', '7d',
    '{"phase": "II", "step": "II.1.4a-TKKT-PD"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_3step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

-- Bước thiết kế 3: TKBVTC
INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_3step, 'Lập TKBVTC (thiết kế bước 3)', 'input', 'tu_van_thiet_ke', '30d',
    '{"phase": "II", "step": "II.1.4a-TKBVTC", "description": "TK bản vẽ thi công"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_3step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_3step, 'Lập, phê duyệt KH LCNT giai đoạn THDA', 'approval', 'chu_dau_tu', '30d',
    '{"phase": "II", "step": "II.2.1"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_3step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_3step, 'Lựa chọn nhà thầu thi công, giám sát', 'approval', 'chu_dau_tu', '45d',
    '{"phase": "II", "step": "II.2.2"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_3step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_3step, 'Thông báo khởi công', 'input', 'chu_dau_tu', '3d',
    '{"phase": "II", "step": "II.2.3.1"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_3step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_3step, 'Thi công xây dựng & Giám sát', 'input', 'nha_thau_thi_cong', '720d',
    '{"phase": "II", "step": "II.2.3.2", "description": "DA nhóm A: lên đến 720 ngày"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_3step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_3step, 'Nghiệm thu hoàn thành công trình', 'approval', 'co_quan_qlnn_xd', '30d',
    '{"phase": "II", "step": "II.2.4.2", "description": "CT cấp đặc biệt, cấp I: 30 ngày"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_3step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

-- --- GIAI ĐOẠN III: KẾT THÚC DỰ ÁN ---
INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_3step, 'Bàn giao công trình đưa vào sử dụng', 'input', 'chu_dau_tu', '30d',
    '{"phase": "III", "phase_name": "Kết thúc dự án", "step": "III.2"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_3step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_3step, 'Lập hồ sơ Quyết toán dự án', 'input', 'chu_dau_tu', '270d',
    '{"phase": "III", "step": "III.3.3", "description": "Nhóm A: 9 tháng"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_3step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_3step, 'Thẩm tra Quyết toán dự án', 'approval', 'so_tai_chinh', '240d',
    '{"phase": "III", "step": "III.3.4", "description": "Nhóm A: 8 tháng"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_3step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_3step, 'Phê duyệt QT dự án hoàn thành', 'approval', 'nguoi_quyet_dinh_dt', '30d',
    '{"phase": "III", "step": "III.3.5", "description": "Nhóm A: 1 tháng"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_3step, v_prev_node, v_node_id);
v_prev_node := v_node_id;

INSERT INTO public.workflow_nodes (workflow_id, name, type, assignee_role, sla_formula, metadata)
VALUES (v_wf_3step, 'Tất toán tài khoản & Đóng mã DA', 'end', 'chu_dau_tu', '15d',
    '{"phase": "III", "step": "III.3.6", "description": "CĐT tất toán → KBNN đối chiếu → STC đóng mã"}'::jsonb)
RETURNING id INTO v_node_id;
INSERT INTO public.workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_3step, v_prev_node, v_node_id);

RAISE NOTICE 'Successfully seeded 3 workflows: DTC-1STEP (% nodes), DTC-2STEP, DTC-3STEP',
    (SELECT COUNT(*) FROM public.workflow_nodes WHERE workflow_id = v_wf_1step);

END $$;
