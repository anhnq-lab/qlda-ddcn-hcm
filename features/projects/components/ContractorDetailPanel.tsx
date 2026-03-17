import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Building2, MapPin, Phone, Hash, Calendar, FileText, CircleDollarSign, User, Globe, Award, Briefcase } from 'lucide-react';
import { formatShortCurrency } from '@/utils/format';

interface ContractorDetailPanelProps {
    contractorId: string;
    /** Optional: filter contracts to this project only */
    projectId?: string;
}

interface ContractorData {
    contractor_id: string;
    full_name: string;
    tax_code: string | null;
    address: string | null;
    representative: string | null;
    contact_info: string | null;
    established_year: number | null;
    is_foreign: boolean;
    cap_cert_code: string | null;
    op_license_no: string | null;
}

interface ContractData {
    contract_id: string;
    contract_name: string;
    contract_type: string;
    value: number;
    sign_date: string | null;
    start_date: string | null;
    end_date: string | null;
    status: number;
    project_id: string;
    project_name: string;
}

const CONTRACT_STATUS_MAP: Record<number, { label: string; color: string }> = {
    0: { label: 'Đang soạn', color: 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700' },
    1: { label: 'Đang thực hiện', color: 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/30' },
    2: { label: 'Hoàn thành', color: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30' },
    3: { label: 'Đã nghiệm thu', color: 'text-teal-700 bg-teal-50 dark:text-teal-300 dark:bg-teal-900/30' },
    4: { label: 'Đã thanh lý', color: 'text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-900/30' },
};

export const ContractorDetailPanel: React.FC<ContractorDetailPanelProps> = ({ contractorId, projectId }) => {

    // Fetch contractor details
    const { data: contractor, isLoading: loadingContractor } = useQuery<ContractorData | null>({
        queryKey: ['contractor-detail', contractorId],
        queryFn: async () => {
            const { data } = await supabase
                .from('contractors')
                .select('*')
                .eq('contractor_id', contractorId)
                .single();
            return data;
        },
        enabled: !!contractorId,
    });

    // Fetch contracts for this contractor
    const { data: contracts = [], isLoading: loadingContracts } = useQuery<ContractData[]>({
        queryKey: ['contractor-contracts', contractorId, projectId],
        queryFn: async () => {
            let query = supabase
                .from('contracts')
                .select('contract_id, contract_name, contract_type, value, sign_date, start_date, end_date, status, project_id')
                .eq('contractor_id', contractorId)
                .order('sign_date', { ascending: false });

            if (projectId) {
                query = query.eq('project_id', projectId);
            }

            const { data: contractRows } = await query;
            if (!contractRows || contractRows.length === 0) return [];

            // Get project names
            const projectIds = [...new Set(contractRows.map((c: any) => c.project_id))];
            const { data: projects } = await supabase
                .from('projects')
                .select('project_id, project_name')
                .in('project_id', projectIds);

            const projectMap = new Map((projects || []).map((p: any) => [p.project_id, p.project_name]));

            return contractRows.map((c: any) => ({
                ...c,
                project_name: projectMap.get(c.project_id) || c.project_id,
            }));
        },
        enabled: !!contractorId,
    });

    const isLoading = loadingContractor || loadingContracts;

    if (isLoading) {
        return (
            <div className="p-6 space-y-4 animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-lg w-2/3" />
                <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-1/2" />
                <div className="space-y-3 mt-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-12 bg-gray-100 dark:bg-slate-700 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    if (!contractor) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-500 dark:text-slate-400">Không tìm thấy thông tin nhà thầu</p>
            </div>
        );
    }

    const totalContractValue = contracts.reduce((sum, c) => sum + (c.value || 0), 0);
    const statusInfo = (status: number) => CONTRACT_STATUS_MAP[status] || { label: `Trạng thái ${status}`, color: 'text-gray-500 bg-gray-100' };

    return (
        <div className="p-5 space-y-5">

            {/* ═══ HEADER ═══ */}
            <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                    <Building2 className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 leading-tight">
                        {contractor.full_name}
                    </h2>
                    {contractor.tax_code && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                            <Hash className="w-3 h-3" /> MST: {contractor.tax_code}
                        </p>
                    )}
                    {contractor.is_foreign && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded-full">
                            <Globe className="w-3 h-3" /> Nhà thầu nước ngoài
                        </span>
                    )}
                </div>
            </div>

            {/* ═══ THỐNG KÊ NHANH ═══ */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber-50/80 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-xl p-3">
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wide">Số hợp đồng</p>
                    <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-0.5">{contracts.length}</p>
                </div>
                <div className="bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl p-3">
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wide">Tổng giá trị</p>
                    <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">{formatShortCurrency(totalContractValue)}</p>
                </div>
            </div>

            {/* ═══ THÔNG TIN CHUNG ═══ */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="px-4 py-2.5 bg-gray-50 dark:bg-slate-750 border-b border-gray-200 dark:border-slate-700">
                    <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Thông tin tổ chức</h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
                    {contractor.representative && (
                        <InfoRow icon={User} label="Người đại diện" value={contractor.representative} />
                    )}
                    {contractor.address && (
                        <InfoRow icon={MapPin} label="Địa chỉ" value={contractor.address} />
                    )}
                    {contractor.contact_info && (
                        <InfoRow icon={Phone} label="Liên hệ" value={contractor.contact_info} />
                    )}
                    {contractor.established_year && (
                        <InfoRow icon={Calendar} label="Năm thành lập" value={String(contractor.established_year)} />
                    )}
                    {contractor.cap_cert_code && (
                        <InfoRow icon={Award} label="Mã chứng nhận năng lực" value={contractor.cap_cert_code} />
                    )}
                    {contractor.op_license_no && (
                        <InfoRow icon={FileText} label="Giấy phép hoạt động" value={contractor.op_license_no} />
                    )}
                </div>
            </div>

            {/* ═══ DANH SÁCH HỢP ĐỒNG ═══ */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="px-4 py-2.5 bg-gray-50 dark:bg-slate-750 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        Hợp đồng ({contracts.length})
                    </h3>
                </div>
                {contracts.length === 0 ? (
                    <div className="p-6 text-center">
                        <p className="text-sm text-gray-400 dark:text-slate-500">Chưa có hợp đồng</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
                        {contracts.map((ct) => {
                            const st = statusInfo(ct.status);
                            return (
                                <div key={ct.contract_id} className="p-3.5 hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 leading-tight">
                                                {ct.contract_name}
                                            </p>
                                            <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5 truncate">
                                                {ct.project_name}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                                                <CircleDollarSign className="w-3 h-3" />
                                                {formatShortCurrency(ct.value)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${st.color}`}>
                                            {st.label}
                                        </span>
                                        {ct.contract_type && (
                                            <span className="text-[9px] font-medium text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-600 px-1.5 py-0.5 rounded">
                                                {ct.contract_type}
                                            </span>
                                        )}
                                        {ct.sign_date && (
                                            <span className="text-[9px] text-gray-400 dark:text-slate-500 flex items-center gap-0.5">
                                                <Calendar className="w-2.5 h-2.5" />
                                                {new Date(ct.sign_date).toLocaleDateString('vi-VN')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Info Row ───
const InfoRow: React.FC<{ icon: React.ElementType; label: string; value: string }> = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
        <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
            <Icon className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wide font-medium">{label}</p>
            <p className="text-sm text-gray-800 dark:text-slate-200 font-medium truncate mt-0.5">{value}</p>
        </div>
    </div>
);

export default ContractorDetailPanel;
