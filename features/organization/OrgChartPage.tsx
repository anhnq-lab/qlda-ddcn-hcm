import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '../../hooks/useEmployees';
import {
    Network, Users, Building2, Briefcase, Award, UserCheck,
    Phone, Mail, ChevronRight, Landmark, Crown
} from 'lucide-react';

// ═══════════════════════════════════════════════════
// Ban DDCN TP.HCM — Org Chart Page
// ═══════════════════════════════════════════════════

// Department color map
const DEPT_COLORS: Record<string, { bg: string; text: string; border: string; gradientStyle: string }> = {
    'Văn phòng': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', gradientStyle: 'linear-gradient(to right, #3B82F6, #2563EB)' },
    'Phòng Kế hoạch – Đầu tư': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', gradientStyle: 'linear-gradient(to right, #10B981, #059669)' },
    'Phòng Tài chính – Kế toán': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', gradientStyle: 'linear-gradient(to right, #8B5CF6, #7C3AED)' },
    'Phòng Chính sách – Pháp chế': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', gradientStyle: 'linear-gradient(to right, #F43F5E, #E11D48)' },
    'Phòng Kỹ thuật – Chất lượng': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', gradientStyle: 'linear-gradient(to right, #A855F7, #9333EA)' },
    'Ban Điều hành dự án 1': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', gradientStyle: 'linear-gradient(to right, #3B82F6, #2563EB)' },
    'Ban Điều hành dự án 2': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', gradientStyle: 'linear-gradient(to right, #10B981, #059669)' },
    'Ban Điều hành dự án 3': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', gradientStyle: 'linear-gradient(to right, #8B5CF6, #7C3AED)' },
    'Ban Điều hành dự án 4': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', gradientStyle: 'linear-gradient(to right, #F97316, #EA580C)' },
    'Ban Điều hành dự án 5': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', gradientStyle: 'linear-gradient(to right, #EF4444, #DC2626)' },
    'Trung tâm Dịch vụ tư vấn': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', gradientStyle: 'linear-gradient(to right, #0EA5E9, #0284C7)' },
};

const defaultColor = { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', gradientStyle: 'linear-gradient(to right, #64748B, #475569)' };

const OrgChartPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: employees = [] } = useEmployees();

    // Group employees by department
    const deptGroups = useMemo(() => {
        const groups: Record<string, typeof employees> = {};
        employees.forEach(emp => {
            if (!groups[emp.Department]) groups[emp.Department] = [];
            groups[emp.Department].push(emp);
        });
        return groups;
    }, [employees]);

    // Extract leadership
    const leadership = useMemo(() => {
        const gd = employees.find(e => e.Position === 'Giám đốc Ban');
        const pgds = employees.filter(e => e.Position === 'Phó Giám đốc Ban');
        const kt = employees.find(e => e.Position === 'Kế toán trưởng');
        return { gd, pgds, kt };
    }, [employees]);

    const departments = [
        'Văn phòng',
        'Phòng Kế hoạch – Đầu tư',
        'Phòng Tài chính – Kế toán',
        'Phòng Chính sách – Pháp chế',
        'Phòng Kỹ thuật – Chất lượng',
        'Ban Điều hành dự án 1',
        'Ban Điều hành dự án 2',
        'Ban Điều hành dự án 3',
        'Ban Điều hành dự án 4',
        'Ban Điều hành dự án 5',
        'Trung tâm Dịch vụ tư vấn',
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl" style={{ background: 'linear-gradient(135deg, #D4A017 0%, #B8860B 100%)' }}>
                    <Network className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white">Sơ đồ tổ chức</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Ban QLDA ĐTXD các công trình Dân dụng và Công nghiệp TP.HCM</p>
                </div>
            </div>

            {/* ══════ VISUAL ORG CHART ══════ */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-8 overflow-x-auto">
                <div className="flex flex-col items-center min-w-[900px]">

                    {/* Level 0: UBND TP.HCM */}
                    <div className="relative z-10 mb-4 group">
                        <div className="bg-red-700 text-white px-10 py-2.5 rounded-xl shadow-lg border-2 border-white ring-1 ring-red-200 text-center cursor-default hover:scale-105 transition-transform">
                            <div className="flex items-center gap-2 justify-center">
                                <Landmark className="w-4 h-4" />
                                <h4 className="font-black text-[11px] uppercase tracking-tight">Ủy ban Nhân dân TP. Hồ Chí Minh</h4>
                            </div>
                        </div>
                        <div className="absolute top-full left-1/2 w-px h-5 bg-gray-300 -translate-x-1/2" />
                    </div>

                    {/* Level 1: Giám đốc Ban */}
                    <div className="relative z-10 mb-4 group">
                        <div className="px-10 py-3 rounded-xl shadow-lg border-2 border-white ring-1 ring-gray-200 text-center relative cursor-default hover:scale-105 transition-transform text-white"
                            style={{ background: 'linear-gradient(135deg, #D4A017 0%, #B8860B 100%)' }}>
                            <div className="flex items-center gap-2 justify-center">
                                <Crown className="w-4 h-4" />
                                <h4 className="font-black text-sm uppercase tracking-tight">Giám đốc Ban</h4>
                            </div>
                            {leadership.gd && (
                                <p className="text-[10px] mt-0.5 opacity-80">{leadership.gd.FullName}</p>
                            )}
                            <div className="w-2 h-2 bg-white rounded-full absolute -bottom-1 left-1/2 -translate-x-1/2" />
                        </div>
                        <div className="absolute top-full left-1/2 w-px h-5 bg-gray-300 -translate-x-1/2" />
                    </div>

                    {/* Level 2: Phó GĐ + Kế toán trưởng */}
                    <div className="relative z-10 mb-6 w-full flex justify-center gap-6">
                        {leadership.pgds.map((pgd, idx) => (
                            <div key={idx} className="bg-white border border-gray-200 px-6 py-2 rounded-lg shadow-sm text-center relative z-10 hover:shadow-md transition-all cursor-pointer"
                                onClick={() => navigate(`/employees/${pgd.EmployeeID}`)}>
                                <h4 className="font-bold text-xs uppercase" style={{ color: '#B8860B' }}>Phó Giám đốc Ban</h4>
                                <p className="text-[10px] text-gray-500">{pgd.FullName}</p>
                            </div>
                        ))}
                        {leadership.kt && (
                            <div className="bg-white border border-gray-200 px-6 py-2 rounded-lg shadow-sm text-center relative z-10 hover:shadow-md transition-all cursor-pointer"
                                onClick={() => navigate(`/employees/${leadership.kt!.EmployeeID}`)}>
                                <h4 className="font-bold text-xs uppercase text-blue-700">Kế toán trưởng</h4>
                                <p className="text-[10px] text-gray-500">{leadership.kt.FullName}</p>
                            </div>
                        )}
                    </div>

                    {/* Connector line */}
                    <div className="relative w-full flex justify-center mb-4">
                        <div className="absolute top-0 left-[8%] right-[8%] h-px bg-gray-300" />
                    </div>

                    {/* Level 3: Phòng chức năng (5 phòng) */}
                    <div className="w-full mb-6">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-3">
                            Các phòng chức năng
                        </h3>
                        <div className="grid grid-cols-5 gap-3">
                            {departments.slice(0, 5).map((dept) => {
                                const color = DEPT_COLORS[dept] || defaultColor;
                                const count = deptGroups[dept]?.length || 0;
                                return (
                                    <div key={dept} className={`${color.bg} border ${color.border} p-3 rounded-xl text-center hover:shadow-md transition-all cursor-default`}>
                                        <p className={`text-[11px] font-bold leading-tight uppercase ${color.text}`}>{dept}</p>
                                        <p className="text-[10px] text-gray-500 mt-1">{count} người</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Level 4: Ban ĐH DA + TT DV Tư vấn */}
                    <div className="w-full">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-3">
                            Các Ban Điều hành dự án & Trung tâm
                        </h3>
                        <div className="grid grid-cols-6 gap-3">
                            {departments.slice(5).map((dept) => {
                                const color = DEPT_COLORS[dept] || defaultColor;
                                const count = deptGroups[dept]?.length || 0;
                                return (
                                    <div key={dept} className={`${color.bg} border ${color.border} p-3 rounded-xl text-center hover:shadow-md transition-all cursor-default`}>
                                        <p className={`text-[11px] font-bold leading-tight uppercase ${color.text}`}>{dept}</p>
                                        <p className="text-[10px] text-gray-500 mt-1">{count} người</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-8 flex gap-4">
                        <div className="rounded-lg px-5 py-2 text-center border" style={{ background: '#FEFCE8', borderColor: '#F0D68A' }}>
                            <p className="text-lg font-black" style={{ color: '#B8860B' }}>01</p>
                            <p className="text-[9px] font-bold uppercase" style={{ color: '#D4A017' }}>Giám đốc Ban</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg px-5 py-2 text-center">
                            <p className="text-lg font-black text-blue-700">{leadership.pgds.length}</p>
                            <p className="text-[9px] text-blue-600 font-bold uppercase">Phó Giám đốc</p>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-5 py-2 text-center">
                            <p className="text-lg font-black text-emerald-700">01</p>
                            <p className="text-[9px] text-emerald-600 font-bold uppercase">Kế toán trưởng</p>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg px-5 py-2 text-center">
                            <p className="text-lg font-black text-purple-700">11</p>
                            <p className="text-[9px] text-purple-600 font-bold uppercase">Phòng/Ban/Đơn vị</p>
                        </div>
                        <div className="bg-slate-100 border border-slate-200 rounded-lg px-5 py-2 text-center">
                            <p className="text-lg font-black text-slate-700">{employees.length}</p>
                            <p className="text-[9px] text-slate-600 font-bold uppercase">Tổng nhân sự</p>
                        </div>
                    </div>

                    <div className="mt-4 text-[10px] text-gray-400 italic text-center max-w-lg">
                        * Theo Quyết định số 571/QĐ-UBND của UBND TP.HCM về thành lập Ban QLDA ĐTXD các công trình Dân dụng & Công nghiệp
                    </div>
                </div>
            </div>

            {/* ══════ DEPARTMENT DETAIL GRID ══════ */}
            <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5" style={{ color: '#D4A017' }} />
                    Nhân sự theo phòng ban
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {departments.map(dept => {
                        const members = deptGroups[dept] || [];
                        const color = DEPT_COLORS[dept] || defaultColor;
                        const leader = members.find(m =>
                            m.Position.includes('Trưởng') || m.Position.includes('Chánh') || m.Position.includes('Giám đốc')
                        );

                        return (
                            <div key={dept} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all">
                                {/* Dept Header */}
                                <div className="px-5 py-3 text-white" style={{ background: color.gradientStyle }}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-sm">{dept}</h3>
                                            {leader && <p className="text-[10px] opacity-80 mt-0.5">Phụ trách: {leader.FullName}</p>}
                                        </div>
                                        <div className="bg-white/20 px-2 py-1 rounded-lg">
                                            <span className="text-xs font-black">{members.length}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Members List */}
                                <div className="divide-y divide-slate-50 dark:divide-slate-700">
                                    {members.map(emp => (
                                        <div
                                            key={emp.EmployeeID}
                                            onClick={() => navigate(`/employees/${emp.EmployeeID}`)}
                                            className="px-5 py-2.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer group transition-colors"
                                        >
                                            <img
                                                src={emp.AvatarUrl}
                                                alt={emp.FullName}
                                                className="w-8 h-8 rounded-full ring-2 ring-white shadow-sm object-cover"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate group-hover:text-blue-600 transition-colors">
                                                    {emp.FullName}
                                                </p>
                                                <p className="text-[10px] text-slate-400">{emp.Position}</p>
                                            </div>
                                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))}
                                    {members.length === 0 && (
                                        <div className="px-5 py-4 text-center text-xs text-slate-400 italic">
                                            Chưa có nhân sự
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default OrgChartPage;
