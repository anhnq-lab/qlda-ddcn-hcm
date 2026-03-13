-- ============================================================
-- 015_seed_employees_full.sql
-- Dữ liệu mẫu đầy đủ: Nhân sự + Tài khoản cho Ban ĐHDA ĐDCN TP.HCM
-- Bổ sung ~35 nhân viên, đầy đủ 8 phòng ban/bộ phận
-- ============================================================

-- =============================================
-- PHÒNG BAN TỔ CHỨC (8 phòng ban chính):
-- 1. Ban Giám đốc (BGĐ) - 4 người (đã có NV001-004)
-- 2. Phòng Kế hoạch - Tổng hợp (KHTH)
-- 3. Phòng Tài chính - Kế toán (TCKT)
-- 4. Phòng Kỹ thuật - Thẩm định (KTTD)
-- 5. Ban QLDA 1 (Giao thông)
-- 6. Ban QLDA 2 (Dân dụng)
-- 7. Ban QLDA 3 (Hạ tầng kỹ thuật)
-- 8. Ban QLDA 4 (Công nghệ & Chuyển đổi số)
-- 9. Ban QLDA 5 (Môi trường & Thủy lợi)
-- 10. Văn phòng Ban (Hành chính)
-- =============================================

-- ── 1. BỔ SUNG NHÂN SỰ ──────────────────────────────

-- Phòng Kế hoạch - Tổng hợp
INSERT INTO employees (employee_id, full_name, email, phone, position, department, role, status, avatar_url, join_date)
VALUES
    ('NV005', 'Trần Minh Hoàng', 'hoang.tm@banddcn.gov.vn', '0901234501', 'Trưởng phòng', 'Phòng Kế hoạch - Tổng hợp', 'Manager', 1, 'https://ui-avatars.com/api/?name=Trần+Minh+Hoàng&background=3B82F6&color=fff', '2020-03-15'),
    ('NV006', 'Nguyễn Thị Lan Anh', 'lanhanh.nt@banddcn.gov.vn', '0901234502', 'Phó phòng', 'Phòng Kế hoạch - Tổng hợp', 'Manager', 1, 'https://ui-avatars.com/api/?name=Nguyễn+Thị+Lan+Anh&background=EC4899&color=fff', '2021-06-01'),
    ('NV007', 'Phạm Đức Thắng', 'thang.pd@banddcn.gov.vn', '0901234503', 'Chuyên viên chính', 'Phòng Kế hoạch - Tổng hợp', 'Staff', 1, 'https://ui-avatars.com/api/?name=Phạm+Đức+Thắng&background=10B981&color=fff', '2022-01-10'),
    ('NV008', 'Lê Thị Hương Giang', 'giang.lth@banddcn.gov.vn', '0901234504', 'Chuyên viên', 'Phòng Kế hoạch - Tổng hợp', 'Staff', 1, 'https://ui-avatars.com/api/?name=Lê+Thị+Hương+Giang&background=F97316&color=fff', '2023-04-20')
ON CONFLICT (employee_id) DO NOTHING;

-- Phòng Tài chính - Kế toán
INSERT INTO employees (employee_id, full_name, email, phone, position, department, role, status, avatar_url, join_date)
VALUES
    ('NV009', 'Võ Thị Kim Ngân', 'ngan.vtk@banddcn.gov.vn', '0901234505', 'Kế toán trưởng', 'Phòng Tài chính - Kế toán', 'Manager', 1, 'https://ui-avatars.com/api/?name=Võ+Thị+Kim+Ngân&background=8B5CF6&color=fff', '2019-08-01'),
    ('NV010', 'Đặng Hữu Phước', 'phuoc.dh@banddcn.gov.vn', '0901234506', 'Phó phòng', 'Phòng Tài chính - Kế toán', 'Manager', 1, 'https://ui-avatars.com/api/?name=Đặng+Hữu+Phước&background=06B6D4&color=fff', '2020-11-15'),
    ('NV011', 'Trần Ngọc Quỳnh', 'quynh.tn@banddcn.gov.vn', '0901234507', 'Kế toán viên', 'Phòng Tài chính - Kế toán', 'Staff', 1, 'https://ui-avatars.com/api/?name=Trần+Ngọc+Quỳnh&background=EF4444&color=fff', '2022-07-01'),
    ('NV012', 'Huỳnh Thanh Tùng', 'tung.ht@banddcn.gov.vn', '0901234508', 'Kế toán viên', 'Phòng Tài chính - Kế toán', 'Staff', 1, 'https://ui-avatars.com/api/?name=Huỳnh+Thanh+Tùng&background=84CC16&color=fff', '2023-09-15')
ON CONFLICT (employee_id) DO NOTHING;

-- Phòng Kỹ thuật - Thẩm định
INSERT INTO employees (employee_id, full_name, email, phone, position, department, role, status, avatar_url, join_date)
VALUES
    ('NV013', 'Nguyễn Quốc Bảo', 'bao.nq@banddcn.gov.vn', '0901234509', 'Trưởng phòng', 'Phòng Kỹ thuật - Thẩm định', 'Manager', 1, 'https://ui-avatars.com/api/?name=Nguyễn+Quốc+Bảo&background=0EA5E9&color=fff', '2018-05-01'),
    ('NV014', 'Lý Thị Thanh Hà', 'ha.ltt@banddcn.gov.vn', '0901234510', 'Phó phòng', 'Phòng Kỹ thuật - Thẩm định', 'Manager', 1, 'https://ui-avatars.com/api/?name=Lý+Thị+Thanh+Hà&background=D946EF&color=fff', '2020-02-10'),
    ('NV015', 'Bùi Anh Tuấn', 'tuan.ba@banddcn.gov.vn', '0901234511', 'Kỹ sư chính', 'Phòng Kỹ thuật - Thẩm định', 'Staff', 1, 'https://ui-avatars.com/api/?name=Bùi+Anh+Tuấn&background=14B8A6&color=fff', '2021-03-20'),
    ('NV016', 'Đỗ Minh Khoa', 'khoa.dm@banddcn.gov.vn', '0901234512', 'Kỹ sư', 'Phòng Kỹ thuật - Thẩm định', 'Staff', 1, 'https://ui-avatars.com/api/?name=Đỗ+Minh+Khoa&background=F59E0B&color=fff', '2023-01-05')
ON CONFLICT (employee_id) DO NOTHING;

-- Ban QLDA 1 (Giao thông)
INSERT INTO employees (employee_id, full_name, email, phone, position, department, role, status, avatar_url, join_date)
VALUES
    ('NV017', 'Phan Thanh Sơn', 'son.pt@banddcn.gov.vn', '0901234513', 'Giám đốc Ban QLDA', 'Ban QLDA 1', 'Manager', 1, 'https://ui-avatars.com/api/?name=Phan+Thanh+Sơn&background=3B82F6&color=fff', '2017-06-01'),
    ('NV018', 'Trương Văn Đạt', 'dat.tv@banddcn.gov.vn', '0901234514', 'Phó Giám đốc', 'Ban QLDA 1', 'Manager', 1, 'https://ui-avatars.com/api/?name=Trương+Văn+Đạt&background=6366F1&color=fff', '2019-09-15'),
    ('NV019', 'Lê Hoàng Nam', 'nam.lh@banddcn.gov.vn', '0901234515', 'Kỹ sư', 'Ban QLDA 1', 'Staff', 1, 'https://ui-avatars.com/api/?name=Lê+Hoàng+Nam&background=22C55E&color=fff', '2022-05-01'),
    ('NV020', 'Nguyễn Thị Phương', 'phuong.nt@banddcn.gov.vn', '0901234516', 'Chuyên viên', 'Ban QLDA 1', 'Staff', 1, 'https://ui-avatars.com/api/?name=Nguyễn+Thị+Phương&background=F43F5E&color=fff', '2023-03-10')
ON CONFLICT (employee_id) DO NOTHING;

-- Ban QLDA 2 (Dân dụng)
INSERT INTO employees (employee_id, full_name, email, phone, position, department, role, status, avatar_url, join_date)
VALUES
    ('NV021', 'Hoàng Minh Trí', 'tri.hm@banddcn.gov.vn', '0901234517', 'Giám đốc Ban QLDA', 'Ban QLDA 2', 'Manager', 1, 'https://ui-avatars.com/api/?name=Hoàng+Minh+Trí&background=10B981&color=fff', '2018-01-15'),
    ('NV022', 'Mai Thị Diễm', 'diem.mt@banddcn.gov.vn', '0901234518', 'Phó Giám đốc', 'Ban QLDA 2', 'Manager', 1, 'https://ui-avatars.com/api/?name=Mai+Thị+Diễm&background=A855F7&color=fff', '2020-04-01'),
    ('NV023', 'Vũ Đình Hùng', 'hung.vd@banddcn.gov.vn', '0901234519', 'Kỹ sư chính', 'Ban QLDA 2', 'Staff', 1, 'https://ui-avatars.com/api/?name=Vũ+Đình+Hùng&background=0284C7&color=fff', '2021-08-20'),
    ('NV024', 'Trần Thanh Thảo', 'thao.tt@banddcn.gov.vn', '0901234520', 'Chuyên viên', 'Ban QLDA 2', 'Staff', 1, 'https://ui-avatars.com/api/?name=Trần+Thanh+Thảo&background=E11D48&color=fff', '2023-06-15')
ON CONFLICT (employee_id) DO NOTHING;

-- Ban QLDA 3 (Hạ tầng kỹ thuật)
INSERT INTO employees (employee_id, full_name, email, phone, position, department, role, status, avatar_url, join_date)
VALUES
    ('NV025', 'Lâm Quốc Việt', 'viet.lq@banddcn.gov.vn', '0901234521', 'Giám đốc Ban QLDA', 'Ban QLDA 3', 'Manager', 1, 'https://ui-avatars.com/api/?name=Lâm+Quốc+Việt&background=8B5CF6&color=fff', '2019-02-01'),
    ('NV026', 'Đinh Thị Ngọc Ánh', 'anh.dtn@banddcn.gov.vn', '0901234522', 'Kỹ sư chính', 'Ban QLDA 3', 'Staff', 1, 'https://ui-avatars.com/api/?name=Đinh+Thị+Ngọc+Ánh&background=F97316&color=fff', '2021-11-10'),
    ('NV027', 'Cao Trung Kiên', 'kien.ct@banddcn.gov.vn', '0901234523', 'Kỹ sư', 'Ban QLDA 3', 'Staff', 1, 'https://ui-avatars.com/api/?name=Cao+Trung+Kiên&background=059669&color=fff', '2022-09-01')
ON CONFLICT (employee_id) DO NOTHING;

-- Ban QLDA 4 (Công nghệ & CĐS)
INSERT INTO employees (employee_id, full_name, email, phone, position, department, role, status, avatar_url, join_date)
VALUES
    ('NV028', 'Nguyễn Tuấn Anh', 'anh.nt@banddcn.gov.vn', '0901234524', 'Giám đốc Ban QLDA', 'Ban QLDA 4', 'Manager', 1, 'https://ui-avatars.com/api/?name=Nguyễn+Tuấn+Anh&background=F97316&color=fff', '2020-07-01'),
    ('NV029', 'Phạm Thị Hồng Nhung', 'nhung.pth@banddcn.gov.vn', '0901234525', 'Kỹ sư chính', 'Ban QLDA 4', 'Staff', 1, 'https://ui-avatars.com/api/?name=Phạm+Thị+Hồng+Nhung&background=7C3AED&color=fff', '2022-02-15'),
    ('NV030', 'Lê Quang Huy', 'huy.lq@banddcn.gov.vn', '0901234526', 'Kỹ sư', 'Ban QLDA 4', 'Staff', 1, 'https://ui-avatars.com/api/?name=Lê+Quang+Huy&background=2563EB&color=fff', '2023-08-01')
ON CONFLICT (employee_id) DO NOTHING;

-- Ban QLDA 5 (Môi trường & Thủy lợi)
INSERT INTO employees (employee_id, full_name, email, phone, position, department, role, status, avatar_url, join_date)
VALUES
    ('NV031', 'Trịnh Hữu Nghĩa', 'nghia.th@banddcn.gov.vn', '0901234527', 'Giám đốc Ban QLDA', 'Ban QLDA 5', 'Manager', 1, 'https://ui-avatars.com/api/?name=Trịnh+Hữu+Nghĩa&background=EF4444&color=fff', '2019-04-15'),
    ('NV032', 'Đào Thị Minh Tâm', 'tam.dtm@banddcn.gov.vn', '0901234528', 'Kỹ sư chính', 'Ban QLDA 5', 'Staff', 1, 'https://ui-avatars.com/api/?name=Đào+Thị+Minh+Tâm&background=0891B2&color=fff', '2021-06-20'),
    ('NV033', 'Ngô Văn Phú', 'phu.nv@banddcn.gov.vn', '0901234529', 'Chuyên viên', 'Ban QLDA 5', 'Staff', 1, 'https://ui-avatars.com/api/?name=Ngô+Văn+Phú&background=65A30D&color=fff', '2023-11-01')
ON CONFLICT (employee_id) DO NOTHING;

-- Văn phòng Ban (Hành chính)
INSERT INTO employees (employee_id, full_name, email, phone, position, department, role, status, avatar_url, join_date)
VALUES
    ('NV034', 'Lưu Thị Mỹ Linh', 'linh.ltm@banddcn.gov.vn', '0901234530', 'Chánh Văn phòng', 'Văn phòng Ban', 'Manager', 1, 'https://ui-avatars.com/api/?name=Lưu+Thị+Mỹ+Linh&background=DB2777&color=fff', '2018-10-01'),
    ('NV035', 'Hồ Sỹ Đại', 'dai.hs@banddcn.gov.vn', '0901234531', 'Phó Văn phòng', 'Văn phòng Ban', 'Manager', 1, 'https://ui-avatars.com/api/?name=Hồ+Sỹ+Đại&background=4F46E5&color=fff', '2020-12-01'),
    ('NV036', 'Phan Thị Hoa', 'hoa.pt@banddcn.gov.vn', '0901234532', 'Nhân viên', 'Văn phòng Ban', 'Staff', 1, 'https://ui-avatars.com/api/?name=Phan+Thị+Hoa&background=16A34A&color=fff', '2023-02-01'),
    ('NV037', 'Nguyễn Văn Tín', 'tin.nv@banddcn.gov.vn', '0901234533', 'Nhân viên', 'Văn phòng Ban', 'Staff', 1, 'https://ui-avatars.com/api/?name=Nguyễn+Văn+Tín&background=EA580C&color=fff', '2024-01-15')
ON CONFLICT (employee_id) DO NOTHING;

-- Tư vấn giám sát (TVGS) - Chuyên gia ngoài
INSERT INTO employees (employee_id, full_name, email, phone, position, department, role, status, avatar_url, join_date)
VALUES
    ('NV038', 'Đoàn Thanh Long', 'long.dt@banddcn.gov.vn', '0901234534', 'Tư vấn giám sát', 'Ban QLDA 1', 'Staff', 1, 'https://ui-avatars.com/api/?name=Đoàn+Thanh+Long&background=047857&color=fff', '2022-04-01'),
    ('NV039', 'Trần Văn Phong', 'phong.tv@banddcn.gov.vn', '0901234535', 'Tư vấn giám sát', 'Ban QLDA 2', 'Staff', 1, 'https://ui-avatars.com/api/?name=Trần+Văn+Phong&background=1D4ED8&color=fff', '2023-05-15')
ON CONFLICT (employee_id) DO NOTHING;


-- ── 2. TẠO TÀI KHOẢN ĐĂNG NHẬP ──────────────────────

INSERT INTO user_accounts (employee_id, username, password_hash) VALUES
    -- Phòng KHTH
    ('NV005', 'HOANG.TM', '123456'),
    ('NV006', 'LANHANH.NT', '123456'),
    ('NV007', 'THANG.PD', '123456'),
    ('NV008', 'GIANG.LTH', '123456'),
    -- Phòng TCKT
    ('NV009', 'NGAN.VTK', '123456'),
    ('NV010', 'PHUOC.DH', '123456'),
    ('NV011', 'QUYNH.TN', '123456'),
    ('NV012', 'TUNG.HT', '123456'),
    -- Phòng KTTD
    ('NV013', 'BAO.NQ', '123456'),
    ('NV014', 'HA.LTT', '123456'),
    ('NV015', 'TUAN.BA', '123456'),
    ('NV016', 'KHOA.DM', '123456'),
    -- Ban QLDA 1
    ('NV017', 'SON.PT', '123456'),
    ('NV018', 'DAT.TV', '123456'),
    ('NV019', 'NAM.LH', '123456'),
    ('NV020', 'PHUONG.NT', '123456'),
    -- Ban QLDA 2
    ('NV021', 'TRI.HM', '123456'),
    ('NV022', 'DIEM.MT', '123456'),
    ('NV023', 'HUNG.VD', '123456'),
    ('NV024', 'THAO.TT', '123456'),
    -- Ban QLDA 3
    ('NV025', 'VIET.LQ', '123456'),
    ('NV026', 'ANH.DTN', '123456'),
    ('NV027', 'KIEN.CT', '123456'),
    -- Ban QLDA 4
    ('NV028', 'ANH.NT', '123456'),
    ('NV029', 'NHUNG.PTH', '123456'),
    ('NV030', 'HUY.LQ', '123456'),
    -- Ban QLDA 5
    ('NV031', 'NGHIA.TH', '123456'),
    ('NV032', 'TAM.DTM', '123456'),
    ('NV033', 'PHU.NV', '123456'),
    -- Văn phòng Ban
    ('NV034', 'LINH.LTM', '123456'),
    ('NV035', 'DAI.HS', '123456'),
    ('NV036', 'HOA.PT', '123456'),
    ('NV037', 'TIN.NV', '123456'),
    -- TVGS
    ('NV038', 'LONG.DT', '123456'),
    ('NV039', 'PHONG.TV', '123456')
ON CONFLICT (username) DO NOTHING;

