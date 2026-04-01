-- Script tạo tài khoản Auth (auth.users) và liên kết với user_accounts (Cập nhật hàng loạt)
-- Hướng dẫn: Chạy script này trong Supabase SQL Editor
-- Mục đích: Tạo tài khoản đăng nhập cho 9 nhân viên chưa có tài khoản.
-- Mật khẩu mặc định: 123456

DO $$
DECLARE
    rec RECORD;
    new_user_id UUID;
    default_password TEXT := '123456';
    encrypted_pw TEXT;
BEGIN
    -- Tạo mã băm mật khẩu chuẩn của Supabase (bcrypt)
    encrypted_pw := crypt(default_password, gen_salt('bf'));

    -- Lặp qua tất cả những employees chưa có user_accounts (hoặc chưa liên kết)
    FOR rec IN
        SELECT e.employee_id, e.full_name, e.email, e.phone
        FROM employees e
        LEFT JOIN user_accounts ua ON e.employee_id = ua.employee_id
        WHERE ua.employee_id IS NULL
    LOOP
        -- 1. Tạo auth_user_id (UUID mới)
        new_user_id := gen_random_uuid();

        -- 2. Đảm bảo có email hợp lệ (Dùng employee_id làm email dự phòng nếu email trống)
        IF rec.email IS NULL OR rec.email = '' THEN
            rec.email := lower(rec.employee_id) || '@bqlddcn.gov.vn';
        END IF;

        -- 3. Chèn vào bảng auth.users
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            new_user_id,
            'authenticated',
            'authenticated',
            rec.email,
            encrypted_pw,
            now(),
            '{"provider":"email","providers":["email"]}',
            jsonb_build_object('full_name', rec.full_name),
            now(),
            now()
        );

        -- 4. Chèn vào auth.identities
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            provider_id,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            new_user_id,
            format('{"sub":"%s","email":"%s"}', new_user_id, rec.email)::jsonb,
            'email',
            rec.email,
            now(),
            now(),
            now()
        );

        -- 5. Tạo dòng tương ứng trong user_accounts
        INSERT INTO public.user_accounts (
            auth_user_id,
            employee_id,
            username,
            password_hash,
            is_active
        ) VALUES (
            new_user_id,
            rec.employee_id,
            lower(rec.employee_id),
            encode(digest(default_password, 'sha256'), 'hex'), -- Băm giả lập cho hệ thống cũ nếu cần
            true
        );

        RAISE NOTICE 'Đã tạo tài khoản cho nhân viên: % - % - Email: %', rec.employee_id, rec.full_name, rec.email;
    END LOOP;
END $$;
