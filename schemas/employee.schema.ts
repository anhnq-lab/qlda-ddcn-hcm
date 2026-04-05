import { z } from 'zod';
import { EmployeeStatus, Role, Gender } from '../types';

export const EmployeeCreateSchema = z.object({
    FullName: z.string().min(1, 'Họ và tên là bắt buộc'),
    Department: z.string().min(1, 'Phòng ban là bắt buộc'),
    Position: z.string().min(1, 'Chức danh là bắt buộc'),
    Email: z.string().email('Email không đúng hợp lệ').or(z.literal('')).optional(),
    Phone: z.string().or(z.literal('')).optional(),
    Username: z.string().min(1, 'Tên đăng nhập là bắt buộc'),
    Password: z.string().or(z.literal('')).optional(),
    Role: z.nativeEnum(Role),
    Status: z.nativeEnum(EmployeeStatus),
    JoinDate: z.string()
});

export type EmployeeCreateInput = z.infer<typeof EmployeeCreateSchema>;
