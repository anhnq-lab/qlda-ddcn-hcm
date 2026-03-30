-- Tắt checking để insert dễ dàng nếu cần (hoặc dùng DO block)
DO $$
DECLARE
    v_wf_qn uuid;
    v_wf_a uuid;
    v_wf_b uuid;
    v_wf_c uuid;
    v_wf_c_ktkt uuid;
    v_node_id uuid;
    v_prev_node_id uuid;
    
    TYPE t_step IS RECORD (
        code VARCHAR,
        name VARCHAR,
        type VARCHAR,
        sla_qn INT,
        sla_a INT,
        sla_b INT,
        sla_c INT,
        sla_c_ktkt INT,
        skip_ktkt BOOLEAN
    );
    
    v_steps t_step[];
    v_step t_step;
BEGIN
    -- Xoá dữ liệu cấu hình cũ (nếu có)
    DELETE FROM iso_workflows WHERE category = 'project';

    -- 1. Create Workflows
    INSERT INTO iso_workflows (name, code, description, category, version, is_active)
    VALUES ('Quy trình ISO Quan trọng Quốc gia', 'ISO-QN', '17 bước vòng đời dự án đầu tư công chuẩn ISO 9001 (Sổ tay Hành chính 2025).', 'project', 1, true)
    RETURNING id INTO v_wf_qn;

    INSERT INTO iso_workflows (name, code, description, category, version, is_active)
    VALUES ('Quy trình ISO Nhóm dự án A', 'ISO-A', '17 bước vòng đời dự án', 'project', 1, true)
    RETURNING id INTO v_wf_a;

    INSERT INTO iso_workflows (name, code, description, category, version, is_active)
    VALUES ('Quy trình ISO Nhóm dự án B', 'ISO-B', '17 bước vòng đời dự án', 'project', 1, true)
    RETURNING id INTO v_wf_b;

    INSERT INTO iso_workflows (name, code, description, category, version, is_active)
    VALUES ('Quy trình ISO Nhóm C (Báo cáo NCKT)', 'ISO-C', '17 bước vòng đời dự án (Dự án có TK Cơ sở)', 'project', 1, true)
    RETURNING id INTO v_wf_c;

    INSERT INTO iso_workflows (name, code, description, category, version, is_active)
    VALUES ('Quy trình ISO Nhóm C (Báo cáo KT-KT)', 'ISO-C_KTKT', 'Rút gọn bước thiết kế bản vẽ thi công', 'project', 1, true)
    RETURNING id INTO v_wf_c_ktkt;

    -- 2. Define Master Steps
    v_steps := ARRAY[
        ROW('CBTD-01', 'Lập hồ sơ CTĐT', 'start', 45, 45, 30, 30, 30, false)::t_step,
        ROW('CBTD-02', 'Thẩm định hồ sơ CTĐT', 'approval', 45, 45, 30, 30, 30, false)::t_step,
        ROW('CBTD-03', 'Phê duyệt CTĐT', 'approval', 15, 15, 10, 10, 10, false)::t_step,
        ROW('CBTD-04', 'Lập Dự án đầu tư / Báo cáo KT-KT', 'input', 60, 45, 30, 20, 20, false)::t_step,
        ROW('CBTD-05', 'Thỏa thuận chuyên ngành', 'approval', 20, 20, 15, 15, 15, false)::t_step,
        ROW('CBTD-06', 'Thẩm định Dự án', 'approval', 40, 40, 30, 20, 20, false)::t_step,
        ROW('CBTD-07', 'Phê duyệt Dự án đầu tư', 'approval', 15, 15, 10, 10, 10, false)::t_step,
        
        ROW('THDA-08', 'Lập, duyệt Kế hoạch LCNT', 'approval', 10, 10, 7, 7, 7, false)::t_step,
        ROW('THDA-09', 'Thiết kế bản vẽ thi công', 'input', 45, 30, 20, 15, 0, true)::t_step,
        ROW('THDA-10', 'Giải phóng mặt bằng', 'approval', 180, 120, 90, 60, 60, false)::t_step,
        ROW('THDA-11', 'Lựa chọn nhà thầu', 'approval', 45, 45, 30, 30, 30, false)::t_step,
        ROW('THDA-12', 'Thi công & Giám sát', 'input', 720, 360, 240, 180, 180, false)::t_step,
        ROW('THDA-13', 'Nghiệm thu hoàn thành', 'approval', 30, 30, 20, 15, 15, false)::t_step,
        
        ROW('KTDA-14', 'Lập hồ sơ Quyết toán', 'input', 270, 270, 180, 120, 120, false)::t_step,
        ROW('KTDA-15', 'Kiểm toán báo cáo Quyết toán', 'approval', 45, 45, 30, 30, 30, false)::t_step,
        ROW('KTDA-16', 'Thẩm tra Quyết toán dự án', 'approval', 60, 60, 45, 30, 30, false)::t_step,
        ROW('KTDA-17', 'Phê duyệt QT, Tất toán', 'end', 15, 15, 10, 10, 10, false)::t_step
    ];

    -- Group QN
    v_prev_node_id := NULL;
    FOREACH v_step IN ARRAY v_steps LOOP
        INSERT INTO iso_workflow_nodes (workflow_id, name, type, assignee_role, sla_formula)
        VALUES (v_wf_qn, '[' || v_step.code || '] ' || v_step.name, v_step.type::iso_workflow_node_type, 'manager', v_step.sla_qn || 'd')
        RETURNING id INTO v_node_id;

        IF v_prev_node_id IS NOT NULL THEN
            INSERT INTO iso_workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_qn, v_prev_node_id, v_node_id);
        END IF;
        v_prev_node_id := v_node_id;
    END LOOP;

    -- Group A
    v_prev_node_id := NULL;
    FOREACH v_step IN ARRAY v_steps LOOP
        INSERT INTO iso_workflow_nodes (workflow_id, name, type, assignee_role, sla_formula)
        VALUES (v_wf_a, '[' || v_step.code || '] ' || v_step.name, v_step.type::iso_workflow_node_type, 'manager', v_step.sla_a || 'd')
        RETURNING id INTO v_node_id;

        IF v_prev_node_id IS NOT NULL THEN
            INSERT INTO iso_workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_a, v_prev_node_id, v_node_id);
        END IF;
        v_prev_node_id := v_node_id;
    END LOOP;

    -- Group B
    v_prev_node_id := NULL;
    FOREACH v_step IN ARRAY v_steps LOOP
        INSERT INTO iso_workflow_nodes (workflow_id, name, type, assignee_role, sla_formula)
        VALUES (v_wf_b, '[' || v_step.code || '] ' || v_step.name, v_step.type::iso_workflow_node_type, 'manager', v_step.sla_b || 'd')
        RETURNING id INTO v_node_id;

        IF v_prev_node_id IS NOT NULL THEN
            INSERT INTO iso_workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_b, v_prev_node_id, v_node_id);
        END IF;
        v_prev_node_id := v_node_id;
    END LOOP;

    -- Group C
    v_prev_node_id := NULL;
    FOREACH v_step IN ARRAY v_steps LOOP
        INSERT INTO iso_workflow_nodes (workflow_id, name, type, assignee_role, sla_formula)
        VALUES (v_wf_c, '[' || v_step.code || '] ' || v_step.name, v_step.type::iso_workflow_node_type, 'manager', v_step.sla_c || 'd')
        RETURNING id INTO v_node_id;

        IF v_prev_node_id IS NOT NULL THEN
            INSERT INTO iso_workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_c, v_prev_node_id, v_node_id);
        END IF;
        v_prev_node_id := v_node_id;
    END LOOP;

    -- Group C_KTKT
    v_prev_node_id := NULL;
    FOREACH v_step IN ARRAY v_steps LOOP
        IF NOT v_step.skip_ktkt THEN
            INSERT INTO iso_workflow_nodes (workflow_id, name, type, assignee_role, sla_formula)
            VALUES (v_wf_c_ktkt, '[' || v_step.code || '] ' || v_step.name, v_step.type::iso_workflow_node_type, 'manager', v_step.sla_c_ktkt || 'd')
            RETURNING id INTO v_node_id;

            IF v_prev_node_id IS NOT NULL THEN
                INSERT INTO iso_workflow_edges (workflow_id, source_node, target_node) VALUES (v_wf_c_ktkt, v_prev_node_id, v_node_id);
            END IF;
            v_prev_node_id := v_node_id;
        END IF;
    END LOOP;

END $$;
