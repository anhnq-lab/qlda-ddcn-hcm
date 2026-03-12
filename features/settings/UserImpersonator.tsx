/**
 * UserImpersonator — QLDA ĐDCN TP.HCM
 *
 * Admin UI to select an employee and impersonate them.
 * Shows active impersonation banner + permission preview.
 *
 * Pattern follows cic-erp-contract/components/settings/UserImpersonator.tsx
 */
import React, { useState, useEffect } from 'react';
import { Users, UserCheck, X, Search, Shield, ChevronDown, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Employee, Role } from '../../types';
import { useImpersonation } from '../../context/ImpersonationContext';
import {
    ALL_RESOURCES,
    RESOURCE_LABELS,
    ACTION_LABELS,
    ROLE_LABELS,
    DEFAULT_ROLE_PERMISSIONS,
    resolveSystemRole,
    type PermissionResource,
    type PermissionAction,
} from '../../types/permission.types';

const UserImpersonator: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { impersonatedUser, isImpersonating, startImpersonation, stopImpersonation } = useImpersonation();

    useEffect(() => {
        const fetchEmployees = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('employees')
                    .select('*')
                    .eq('status', 1)
                    .order('department')
                    .order('full_name');

                if (error) {
                    console.error('[UserImpersonator] Error:', error);
                    setLoading(false);
                    return;
                }

                if (data) {
                    setEmployees(data.map((e: any) => ({
                        EmployeeID: e.employee_id,
                        FullName: e.full_name,
                        Department: e.department || '',
                        Position: e.position || '',
                        Email: e.email || '',
                        Phone: e.phone || '',
                        AvatarUrl: e.avatar_url || '',
                        Status: e.status,
                        JoinDate: e.join_date || '',
                        Username: e.username || '',
                        Role: e.role as Role,
                    })));
                }
            } catch (err) {
                console.error('[UserImpersonator] Unexpected error:', err);
            }
            setLoading(false);
        };
        fetchEmployees();
    }, []);

    const filteredEmployees = employees.filter(emp =>
        emp.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.Position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.Department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectUser = (emp: Employee) => {
        startImpersonation(emp);
        setIsDropdownOpen(false);
        setSearchTerm('');
    };

    const handleStopImpersonation = () => {
        stopImpersonation();
    };

    // Get default permissions preview for impersonated user
    const systemRole = impersonatedUser
        ? resolveSystemRole(impersonatedUser.Role, impersonatedUser.Position)
        : null;
    const permissions = systemRole ? DEFAULT_ROLE_PERMISSIONS[systemRole] || {} : null;

    return (
        <div className="space-y-6">
            {/* Active Impersonation Banner */}
            {isImpersonating && impersonatedUser && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-400 rounded-lg p-5">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                {impersonatedUser.FullName?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold">
                                        <UserCheck size={12} />
                                        ĐANG GIẢ LÀM
                                    </span>
                                </div>
                                <p className="font-bold text-lg text-slate-800 dark:text-slate-200">{impersonatedUser.FullName}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {impersonatedUser.Position || impersonatedUser.Role}
                                    {impersonatedUser.Department && ` • ${impersonatedUser.Department}`}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleStopImpersonation}
                            className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-all shadow-md hover:shadow-lg"
                        >
                            <X size={18} />
                            Dừng giả làm
                        </button>
                    </div>

                    {/* Permissions Preview */}
                    {permissions && (
                        <div className="mt-5 pt-4 border-t border-amber-200 dark:border-amber-700">
                            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-1">
                                <Shield size={14} />
                                QUYỀN CỦA NGƯỜI NÀY ({ROLE_LABELS[systemRole!]}):
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                                {ALL_RESOURCES.map(resource => {
                                    const actions = (permissions as any)[resource] || [];
                                    return (
                                        <div key={resource} className={`rounded-lg p-2 text-xs ${actions.length > 0 ? 'bg-white dark:bg-slate-700' : 'bg-slate-100 dark:bg-slate-800 opacity-50'}`}>
                                            <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                                                {RESOURCE_LABELS[resource]}
                                            </span>
                                            <span className="text-slate-500 dark:text-slate-400">
                                                {actions.length > 0 ? actions.map((a: string) => ACTION_LABELS[a as PermissionAction] || a).join(', ') : '—'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* User Selection Dropdown */}
            <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Chọn nhân viên để giả làm
                </label>

                <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    disabled={loading}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 cursor-pointer"
                >
                    <span className={loading ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}>
                        {loading ? 'Đang tải danh sách...' : `${employees.length} nhân viên có sẵn`}
                    </span>
                    <ChevronDown size={20} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Content */}
                {isDropdownOpen && !loading && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl dark:shadow-black/40 overflow-hidden">
                        {/* Search */}
                        <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Tìm theo tên, chức vụ, phòng ban..."
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Employee List */}
                        <div className="max-h-80 overflow-y-auto">
                            {filteredEmployees.length === 0 ? (
                                <div className="p-4 text-center text-slate-400">Không tìm thấy nhân viên</div>
                            ) : (
                                filteredEmployees.map(emp => (
                                    <button
                                        key={emp.EmployeeID}
                                        onClick={() => handleSelectUser(emp)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-left border-b border-slate-50 dark:border-slate-800 last:border-b-0"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                            {emp.FullName?.charAt(0) || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{emp.FullName}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                {emp.Position || emp.Role}
                                                {emp.Department && ` • ${emp.Department}`}
                                            </p>
                                        </div>
                                        {impersonatedUser?.EmployeeID === emp.EmployeeID && (
                                            <Check size={18} className="text-green-500 flex-shrink-0" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Close dropdown when clicking outside */}
            {isDropdownOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                />
            )}

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm">
                <p className="font-semibold text-blue-700 dark:text-blue-400 mb-2">💡 Hướng dẫn:</p>
                <ol className="text-blue-600 dark:text-blue-300 space-y-1 text-xs list-decimal list-inside">
                    <li>Click vào dropdown để mở danh sách nhân viên</li>
                    <li>Tìm kiếm theo tên, chức vụ hoặc phòng ban</li>
                    <li>Click chọn nhân viên → Hệ thống sẽ thông báo xác nhận</li>
                    <li>Điều hướng qua các trang để xem quyền của họ</li>
                    <li>Click "Dừng giả làm" để quay về Admin</li>
                </ol>
            </div>
        </div>
    );
};

export default UserImpersonator;
