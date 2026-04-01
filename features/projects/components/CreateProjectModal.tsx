import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Building2, Calendar, DollarSign, MapPin, User, Clock, FileText, HardHat, Search, Shield, Users, Check, ChevronDown, Sparkles, ImagePlus, Loader2, CheckCircle2, Ruler, Layers } from 'lucide-react';
import { ProjectGroup, InvestmentType, Project, Employee, MANAGEMENT_BOARDS } from '../../../types';
import { generateProjectCode, ConstructionType, PermitType } from '../../../utils/projectCodeGenerator';
import EmployeeService from '../../../services/EmployeeService';
import { extractProjectFromImage, fileToBase64, ExtractedProjectData } from '../../../services/ai/aiImageExtractor';
import { supabase } from '../../../lib/supabase';

export interface SelectedMember {
    employeeId: string;
    role: string;
}

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Project> & { StartDate: Date }, members: SelectedMember[]) => Promise<void>;
    editProject?: Project | null;
}

const CONSTRUCTION_TYPES = [
    { value: ConstructionType.Civil, label: 'Dân dụng' },
    { value: ConstructionType.Industrial, label: 'Công nghiệp' },
    { value: ConstructionType.Transport, label: 'Giao thông' },
    { value: ConstructionType.Agriculture, label: 'Nông nghiệp & PTNT' },
    { value: ConstructionType.Infrastructure, label: 'Hạ tầng kỹ thuật' },
    { value: ConstructionType.Defense, label: 'Quốc phòng, an ninh' },
];

const CONSTRUCTION_GRADES = [
    { value: 'ĐB', label: 'Đặc biệt' },
    { value: 'I', label: 'Cấp I' },
    { value: 'II', label: 'Cấp II' },
    { value: 'III', label: 'Cấp III' },
    { value: 'IV', label: 'Cấp IV' },
];

/** Danh sách 34 tỉnh thành theo QĐ 19/2025/QĐ-TTg (từ 01/07/2025) */
const PROVINCES = [
    { code: '01', name: 'TP. Hà Nội' },
    { code: '04', name: 'Cao Bằng' },
    { code: '08', name: 'Tuyên Quang' },
    { code: '11', name: 'Điện Biên' },
    { code: '12', name: 'Lai Châu' },
    { code: '14', name: 'Sơn La' },
    { code: '15', name: 'Lào Cai' },
    { code: '19', name: 'Thái Nguyên' },
    { code: '20', name: 'Lạng Sơn' },
    { code: '22', name: 'Quảng Ninh' },
    { code: '24', name: 'Bắc Ninh' },
    { code: '25', name: 'Phú Thọ' },
    { code: '31', name: 'TP. Hải Phòng' },
    { code: '33', name: 'Hưng Yên' },
    { code: '37', name: 'Ninh Bình' },
    { code: '38', name: 'Thanh Hóa' },
    { code: '40', name: 'Nghệ An' },
    { code: '42', name: 'Hà Tĩnh' },
    { code: '44', name: 'Quảng Trị' },
    { code: '46', name: 'TP. Huế' },
    { code: '48', name: 'TP. Đà Nẵng' },
    { code: '51', name: 'Quảng Ngãi' },
    { code: '52', name: 'Gia Lai' },
    { code: '56', name: 'Khánh Hòa' },
    { code: '66', name: 'Đắk Lắk' },
    { code: '68', name: 'Lâm Đồng' },
    { code: '75', name: 'Đồng Nai' },
    { code: '79', name: 'TP. Hồ Chí Minh' },
    { code: '80', name: 'Tây Ninh' },
    { code: '82', name: 'Đồng Tháp' },
    { code: '86', name: 'Vĩnh Long' },
    { code: '91', name: 'An Giang' },
    { code: '92', name: 'TP. Cần Thơ' },
    { code: '96', name: 'Cà Mau' },
];

const PROJ_TABS = [
    { id: 'general', label: 'Thông tin chung', icon: Building2 },
    { id: 'investment', label: 'Đầu tư & Phê duyệt', icon: DollarSign },
    { id: 'scale', label: 'Quy mô xây dựng', icon: Ruler },
    { id: 'contractors', label: 'Nhà thầu & Tiêu chuẩn', icon: HardHat },
];

const FormattedInput = ({ value, onChange, placeholder, className, isDecimal = false, icon: Icon }: any) => {
    const [localVal, setLocalVal] = useState(() => {
        if (value == null || value === '' || value === 0) return '';
        return new Intl.NumberFormat('vi-VN', isDecimal ? { maximumFractionDigits: 2 } : {}).format(value);
    });
    
    useEffect(() => {
        if (value == null || value === '' || value === 0) {
            setLocalVal('');
        } else {
            // Check if the external value fundamentally changes (e.g. initial load)
            const currentParsed = isDecimal 
                ? parseFloat(localVal.replace(/\./g, '').replace(/,/g, '.'))
                : parseInt(localVal.replace(/\D/g, ''), 10);
                
            if (value !== currentParsed && !isNaN(value)) {
                setLocalVal(new Intl.NumberFormat('vi-VN', isDecimal ? { maximumFractionDigits: 2 } : {}).format(value));
            }
        }
    }, [value, isDecimal]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;
        if (!/^[0-9.,]*$/.test(val)) return;
        
        if (val === '') {
            setLocalVal('');
            onChange('');
            return;
        }

        let parsed: number;
        let formattedStr = '';

        if (isDecimal) {
            let clean = val.replace(/[^\d,]/g, '');
            const parts = clean.split(',');
            if (parts.length > 2) {
                clean = parts[0] + ',' + parts.slice(1).join('');
            }
            if (parts[0]) {
                parts[0] = parseInt(parts[0], 10).toLocaleString('vi-VN');
            }
            formattedStr = parts.join(',');
            parsed = parseFloat(clean.replace(/,/g, '.'));
        } else {
            const clean = val.replace(/\D/g, '');
            if (!clean) {
                setLocalVal('');
                onChange('');
                return;
            }
            parsed = parseInt(clean, 10);
            formattedStr = parsed.toLocaleString('vi-VN');
        }
        
        setLocalVal(formattedStr);
        if (!isNaN(parsed)) onChange(parsed);
    };

    const handleBlur = () => {
        if (value != null && value !== '' && value !== 0) {
            setLocalVal(new Intl.NumberFormat('vi-VN', isDecimal ? { maximumFractionDigits: 2 } : {}).format(value));
        }
    };

    return (
        <div className={Icon ? "relative" : ""}>
            <input
                type="text"
                placeholder={placeholder}
                className={className}
                value={localVal}
                onChange={handleChange}
                onBlur={handleBlur}
            />
            {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />}
        </div>
    );
};

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onSave, editProject }) => {
    const isEditMode = !!editProject;
    const [isLoading, setIsLoading] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<SelectedMember[]>([]);
    const [memberSearch, setMemberSearch] = useState('');
    const [showMemberDropdown, setShowMemberDropdown] = useState(false);
    const [showCapitalDropdown, setShowCapitalDropdown] = useState(false);

    // ── AI Image Extraction ──
    const [aiStatus, setAiStatus] = useState<'idle' | 'extracting' | 'done' | 'error'>('idle');
    const [aiPreviewUrl, setAiPreviewUrl] = useState<string | null>(null);
    const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set());
    const [aiError, setAiError] = useState('');
    const aiFileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState<'general' | 'investment' | 'scale' | 'contractors' | 'members'>('general');
    const [formData, setFormData] = useState({
        // Section 1 - Thông tin cơ bản
        ProjectID: '',
        ProjectName: '',
        GroupCode: ProjectGroup.C,
        InvestmentType: InvestmentType.Public,
        StartDate: new Date().toISOString().split('T')[0],
        // Section 2 - Thông tin đầu tư
        TotalInvestment: 0,
        CapitalSource: 'Ngân sách Địa phương',
        ProvinceCode: '79', // TP. Hồ Chí Minh default
        LocationCode: '',
        ConstructionType: '',
        ConstructionGrade: '',
        CompetentAuthority: 'UBND TP.HCM',
        InvestorName: 'Ban QLDA ĐTXD CN',
        Duration: '',
        ManagementBoard: 1,
        ApprovalDate: '',
        DecisionNumber: '',
        // Section 3 - Nhà thầu & Tiêu chuẩn
        ApplicableStandards: '',
        FeasibilityContractor: '',
        SurveyContractor: '',
        ReviewContractor: '',
        // Mục tiêu & Quy mô đầu tư
        Objective: '',
        InvestmentScale: '',
        // Section 2.5 - Quy mô công trình
        TotalEstimate: 0,
        SiteArea: 0,
        ConstructionArea: 0,
        FloorArea: 0,
        BuildingHeight: 0,
        BuildingDensity: 0,
        LandUseCoefficient: 0,
        AboveGroundFloors: 0,
        BasementFloors: 0,
    });

    // Populate form data in edit mode
    useEffect(() => {
        if (isOpen && editProject) {
            setFormData({
                ProjectID: editProject.ProjectID || '',
                ProjectName: editProject.ProjectName || '',
                GroupCode: editProject.GroupCode || ProjectGroup.C,
                InvestmentType: editProject.InvestmentType || InvestmentType.Public,
                StartDate: editProject.StartDate ? new Date(editProject.StartDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                TotalInvestment: editProject.TotalInvestment || 0,
                CapitalSource: editProject.CapitalSource || 'Ngân sách Địa phương',
                ProvinceCode: editProject.ProvinceCode || '79',
                LocationCode: editProject.LocationCode || '',
                ConstructionType: editProject.ConstructionType || '',
                ConstructionGrade: editProject.ConstructionGrade || '',
                CompetentAuthority: editProject.CompetentAuthority || 'UBND TP.HCM',
                InvestorName: editProject.InvestorName || 'Ban QLDA ĐTXD CN',
                Duration: editProject.Duration || '',
                ManagementBoard: editProject.ManagementBoard || 1,
                ApprovalDate: editProject.ApprovalDate ? new Date(editProject.ApprovalDate).toISOString().split('T')[0] : '',
                DecisionNumber: editProject.DecisionNumber || '',
                ApplicableStandards: editProject.ApplicableStandards || '',
                FeasibilityContractor: editProject.FeasibilityContractor || '',
                SurveyContractor: editProject.SurveyContractor || '',
                ReviewContractor: editProject.ReviewContractor || '',
                Objective: editProject.Objective || '',
                InvestmentScale: editProject.InvestmentScale || '',
                TotalEstimate: editProject.TotalEstimate || 0,
                SiteArea: editProject.SiteArea || 0,
                ConstructionArea: editProject.ConstructionArea || 0,
                FloorArea: editProject.FloorArea || 0,
                BuildingHeight: editProject.BuildingHeight || 0,
                BuildingDensity: editProject.BuildingDensity || 0,
                LandUseCoefficient: editProject.LandUseCoefficient || 0,
                AboveGroundFloors: editProject.AboveGroundFloors || 0,
                BasementFloors: editProject.BasementFloors || 0,
            });
        }
    }, [isOpen, editProject]);

    // Fetch employees when modal opens + load existing members in edit mode
    useEffect(() => {
        if (isOpen) {
            EmployeeService.getAll().then(setEmployees).catch(console.error);
            // Load existing members when editing
            if (editProject?.ProjectID) {
                supabase
                    .from('project_members')
                    .select('employee_id, role')
                    .eq('project_id', editProject.ProjectID)
                    .then(({ data, error }) => {
                        if (!error && data && data.length > 0) {
                            setSelectedMembers(data.map((m: any) => ({
                                employeeId: m.employee_id,
                                role: m.role || 'Thành viên',
                            })));
                        }
                    });
            }
        } else {
            setSelectedMembers([]);
            setMemberSearch('');
            // Reset AI state
            setAiStatus('idle');
            setAiPreviewUrl(null);
            setAiFilledFields(new Set());
            setAiError('');
        }
    }, [isOpen, editProject]);

    // ── AI: Listen for paste events ──
    useEffect(() => {
        if (!isOpen || isEditMode) return;
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;
            for (const item of Array.from(items)) {
                if (item.type.startsWith('image/')) {
                    e.preventDefault();
                    const file = item.getAsFile();
                    if (file) handleAiImageExtract(file);
                    return;
                }
            }
        };
        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [isOpen, isEditMode]);

    // ── AI: Process image extraction ──
    const handleAiImageExtract = useCallback(async (file: File) => {
        setAiStatus('extracting');
        setAiError('');
        setAiFilledFields(new Set());

        // Show preview
        const previewUrl = URL.createObjectURL(file);
        setAiPreviewUrl(previewUrl);

        try {
            const base64 = await fileToBase64(file);
            const extracted = await extractProjectFromImage(base64, file.type || 'image/png');
            applyExtractedData(extracted);
            setAiStatus('done');
        } catch (err) {
            console.error('AI extraction error:', err);
            setAiError((err as Error)?.message || 'Lỗi trích xuất AI');
            setAiStatus('error');
        }
    }, []);

    // ── AI: Apply extracted data to form ──
    const applyExtractedData = (data: ExtractedProjectData) => {
        const filled = new Set<string>();

        setFormData(prev => {
            const next = { ...prev };

            if (data.ProjectName) { next.ProjectName = data.ProjectName; filled.add('ProjectName'); }
            if (data.Duration) { next.Duration = data.Duration; filled.add('Duration'); }
            if (data.CompetentAuthority) { next.CompetentAuthority = data.CompetentAuthority; filled.add('CompetentAuthority'); }
            if (data.InvestorName) { next.InvestorName = data.InvestorName; filled.add('InvestorName'); }
            if (data.CapitalSource) { next.CapitalSource = data.CapitalSource; filled.add('CapitalSource'); }
            if (data.LocationCode) { next.LocationCode = data.LocationCode; filled.add('LocationCode'); }
            if (data.ApplicableStandards) { next.ApplicableStandards = data.ApplicableStandards; filled.add('ApplicableStandards'); }
            if (data.FeasibilityContractor) { next.FeasibilityContractor = data.FeasibilityContractor; filled.add('FeasibilityContractor'); }
            if (data.SurveyContractor) { next.SurveyContractor = data.SurveyContractor; filled.add('SurveyContractor'); }
            if (data.ReviewContractor) { next.ReviewContractor = data.ReviewContractor; filled.add('ReviewContractor'); }

            // TotalInvestment
            if (data.TotalInvestment && data.TotalInvestment > 0) {
                next.TotalInvestment = data.TotalInvestment;
                filled.add('TotalInvestment');
            }

            // StartDate (YYYY-MM-DD)
            if (data.StartDate && /^\d{4}-\d{2}-\d{2}$/.test(data.StartDate)) {
                next.StartDate = data.StartDate;
                filled.add('StartDate');
            }

            // GroupCode mapping
            if (data.GroupCode) {
                const gMap: Record<string, ProjectGroup> = {
                    'A': ProjectGroup.A, 'B': ProjectGroup.B, 'C': ProjectGroup.C, 'QN': ProjectGroup.QN,
                    'Nhóm A': ProjectGroup.A, 'Nhóm B': ProjectGroup.B, 'Nhóm C': ProjectGroup.C,
                };
                const mapped = gMap[data.GroupCode];
                if (mapped) { next.GroupCode = mapped; filled.add('GroupCode'); }
            }

            // ConstructionType mapping
            if (data.ConstructionType) {
                const validTypes = CONSTRUCTION_TYPES.map(t => t.label);
                const match = validTypes.find(t => data.ConstructionType!.includes(t));
                if (match) { next.ConstructionType = match; filled.add('ConstructionType'); }
            }

            // ConstructionGrade mapping
            if (data.ConstructionGrade) {
                const validGrades = CONSTRUCTION_GRADES.map(g => g.value);
                const match = validGrades.find(g => data.ConstructionGrade!.includes(g));
                if (match) { next.ConstructionGrade = match; filled.add('ConstructionGrade'); }
            }

            // Province mapping (match name → code)
            if (data.ProvinceName) {
                const pMatch = PROVINCES.find(p =>
                    data.ProvinceName!.includes(p.name) || p.name.includes(data.ProvinceName!)
                );
                if (pMatch) { next.ProvinceCode = pMatch.code; filled.add('ProvinceCode'); }
            }

            return next;
        });

        setAiFilledFields(filled);
        // Auto-clear highlights after 6 seconds
        setTimeout(() => setAiFilledFields(new Set()), 6000);
    };

    // Auto-generate Project Code theo TT 24/2025/TT-BXD (only in create mode)
    useEffect(() => {
        if (isOpen && !isEditMode) {
            const year = new Date(formData.StartDate).getFullYear();
            // Map ConstructionType string to enum, default to Civil
            const ctMap: Record<string, ConstructionType> = {
                'Dân dụng': ConstructionType.Civil,
                'Công nghiệp': ConstructionType.Industrial,
                'Giao thông': ConstructionType.Transport,
                'Nông nghiệp & PTNT': ConstructionType.Agriculture,
                'Hạ tầng kỹ thuật': ConstructionType.Infrastructure,
                'Quốc phòng, an ninh': ConstructionType.Defense,
            };
            const ct = ctMap[formData.ConstructionType] || ConstructionType.Civil;
            const code = generateProjectCode(
                formData.ProvinceCode,
                formData.GroupCode,
                formData.InvestmentType,
                year,
                undefined, // random sequence
                ct,
                PermitType.Standard // default to standard permit
            );
            setFormData(prev => ({ ...prev, ProjectID: code }));
        }
    }, [isOpen, isEditMode, formData.GroupCode, formData.InvestmentType, formData.StartDate, formData.ProvinceCode, formData.ConstructionType]);

    if (!isOpen) return null;

    const toggleMember = (empId: string) => {
        setSelectedMembers(prev => {
            const exists = prev.find(m => m.employeeId === empId);
            if (exists) return prev.filter(m => m.employeeId !== empId);
            return [...prev, { employeeId: empId, role: 'Thành viên' }];
        });
    };

    const updateMemberRole = (empId: string, role: string) => {
        setSelectedMembers(prev => prev.map(m => m.employeeId === empId ? { ...m, role } : m));
    };

    const filteredEmployees = employees.filter(e => {
        const dept = e.Department || 'Khác';
        const isSearchMatch = e.FullName.toLowerCase().includes(memberSearch.toLowerCase()) ||
                              dept.toLowerCase().includes(memberSearch.toLowerCase());
        const matchOtherBan = dept.match(/Ban.*([1-7])/i);
        const currentBan = String(formData.ManagementBoard);
        const isOtherBan = matchOtherBan && currentBan !== '0' && matchOtherBan[1] !== currentBan;
        return isSearchMatch && !isOtherBan;
    });

    const groupedEmployees = filteredEmployees.reduce((acc, emp) => {
        const dept = emp.Department || 'Khác';
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(emp);
        return acc;
    }, {} as Record<string, Employee[]>);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await onSave({
                ...formData,
                Progress: 0,
                StartDate: new Date(formData.StartDate) as unknown as string & Date
            } as Partial<Project> & { StartDate: Date }, selectedMembers);
            onClose();
        } catch (error) {
            console.error('Failed to create project:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateField = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) => (
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-slate-700">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-slate-100">{title}</h3>
                <p className="text-[11px] text-gray-400 dark:text-slate-500">{subtitle}</p>
            </div>
        </div>
    );

    // ── AI highlight helper ──
    const aiHighlight = (field: string) => aiFilledFields.has(field) ? ' ring-2 ring-emerald-400 dark:ring-emerald-500 border-emerald-400 dark:border-emerald-500 animate-pulse' : '';

    // Reusable class strings for dark mode
    const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all shadow-[0_2px_4px_rgba(0,0,0,0.02)]";
    const inputWithIconClass = "w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all shadow-[0_2px_4px_rgba(0,0,0,0.02)]";
    const selectClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 outline-none appearance-none transition-all shadow-[0_2px_4px_rgba(0,0,0,0.02)]";
    const selectWithIconClass = "w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 outline-none appearance-none transition-all shadow-[0_2px_4px_rgba(0,0,0,0.02)]";
    const labelClass = "block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2";
    const iconClass = "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500";

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className="bg-[#FCF9F2] dark:bg-slate-800 shadow-sm w-full max-w-6xl h-full overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-gradient-to-r from-primary-50 to-yellow-50 dark:from-slate-800 dark:to-slate-800">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            {isEditMode ? 'Chỉnh sửa dự án' : 'Thêm mới dự án'}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                            {isEditMode ? 'Cập nhật thông tin dự án' : 'Theo mẫu Phụ lục I (NĐ 175/2024) • Hệ thống tự động tạo mã dự án'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/80 dark:hover:bg-slate-700 rounded-full text-gray-400 dark:text-slate-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ── AI Image Import Zone (only in create mode) ── */}
                {!isEditMode && (
                    <div className="px-6 py-3 border-b border-gray-200 dark:border-slate-700">
                        <div
                            className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer
                                ${aiStatus === 'extracting' ? 'border-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : ''}
                                ${aiStatus === 'done' ? 'border-emerald-400 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20' : ''}
                                ${aiStatus === 'error' ? 'border-red-400 dark:border-red-400 bg-red-50/50 dark:bg-red-900/20' : ''}
                                ${aiStatus === 'idle' ? 'border-gray-300 dark:border-slate-600 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50/30 dark:hover:bg-violet-900/10' : ''}
                            `}
                            onClick={() => aiStatus !== 'extracting' && aiFileInputRef.current?.click()}
                        >
                            <input
                                ref={aiFileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => {
                                    const f = e.target.files?.[0];
                                    if (f) handleAiImageExtract(f);
                                    e.target.value = '';
                                }}
                            />

                            <div className="flex items-center gap-4 p-3">
                                {/* Preview or Icon */}
                                {aiPreviewUrl ? (
                                    <div className="w-16 h-12 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-600 flex-shrink-0">
                                        <img src={aiPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                                        ${aiStatus === 'idle' ? 'bg-gradient-to-br from-primary-500 to-primary-600' : 'bg-primary-500'}
                                    `}>
                                        {aiStatus === 'extracting' ? (
                                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                                        ) : (
                                            <Sparkles className="w-5 h-5 text-white" />
                                        )}
                                    </div>
                                )}

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    {aiStatus === 'idle' && (
                                        <>
                                            <p className="text-sm font-bold text-gray-700 dark:text-slate-200 flex items-center gap-1.5">
                                                <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                                                Nhập liệu bằng AI
                                            </p>
                                            <p className="text-[11px] text-gray-400 dark:text-slate-500">
                                                Dán ảnh chụp màn hình (Ctrl+V) hoặc click để chọn ảnh — AI sẽ tự điền thông tin
                                            </p>
                                        </>
                                    )}
                                    {aiStatus === 'extracting' && (
                                        <>
                                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                Đang trích xuất bằng AI...
                                            </p>
                                            <p className="text-[11px] text-blue-500/70 dark:text-blue-400/60">
                                                Gemini đang phân tích ảnh và trích xuất thông tin dự án
                                            </p>
                                        </>
                                    )}
                                    {aiStatus === 'done' && (
                                        <>
                                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Đã trích xuất thành công!
                                            </p>
                                            <p className="text-[11px] text-emerald-500/70 dark:text-emerald-400/60">
                                                {aiFilledFields.size > 0 ? `${aiFilledFields.size} trường đã được AI điền — ` : ''}
                                                Click hoặc dán ảnh mới để trích xuất lại
                                            </p>
                                        </>
                                    )}
                                    {aiStatus === 'error' && (
                                        <>
                                            <p className="text-sm font-bold text-red-600 dark:text-red-400">
                                                Lỗi trích xuất
                                            </p>
                                            <p className="text-[11px] text-red-500/70 dark:text-red-400/60">
                                                {aiError || 'Vui lòng thử lại'} — Click hoặc dán ảnh mới
                                            </p>
                                        </>
                                    )}
                                </div>

                                {/* Action icon */}
                                {aiStatus !== 'extracting' && (
                                    <div className="flex-shrink-0">
                                        <ImagePlus className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs Navigation */}
                <div className="flex flex-wrap px-6 pt-3 pb-1 border-b border-gray-200 dark:border-slate-700 bg-[#F0ECE1] dark:bg-slate-900 dark:bg-slate-800 gap-y-2 gap-x-1">
                    {PROJ_TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                                    isActive 
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-600'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-[50vh]">
                    <div className="p-4 overflow-y-auto flex-1">

                    {/* ═══ SECTION 1: Thông tin cơ bản ═══ */}
                    {activeTab === 'general' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <SectionHeader icon={Building2} title="Thông tin cơ bản" subtitle="Định danh và phân loại dự án" />

                        {/* Project Code (Auto) */}
                        <div className="mb-4">
                            <label className={labelClass}>
                                Mã dự án <span className="text-blue-500 dark:text-blue-400 text-xs font-normal">(Tự động theo TT24/2025)</span>
                            </label>
                            <input
                                type="text"
                                readOnly
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-[#F0ECE1] dark:bg-slate-900 dark:bg-slate-700 text-gray-500 dark:text-slate-400 font-mono outline-none cursor-not-allowed"
                                value={formData.ProjectID}
                            />
                        </div>

                        {/* Project Name */}
                        <div className="mb-4">
                            <label className={labelClass}>Tên dự án <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                required
                                placeholder="VD: Xây dựng Đường Cao tốc Bắc Nam..."
                                className={inputClass + aiHighlight('ProjectName')}
                                value={formData.ProjectName}
                                onChange={e => updateField('ProjectName', e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Group Selection */}
                            <div>
                                <label className={labelClass}>Nhóm dự án <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select
                                        className={`w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 outline-none appearance-none bg-[#FCF9F2] dark:bg-slate-700`}
                                        value={formData.GroupCode}
                                        onChange={e => updateField('GroupCode', e.target.value)}
                                    >
                                        <option value={ProjectGroup.C}>Nhóm C</option>
                                        <option value={ProjectGroup.B}>Nhóm B</option>
                                        <option value={ProjectGroup.A}>Nhóm A</option>
                                        <option value={ProjectGroup.QN}>Quan trọng Quốc gia</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                        <Building2 className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Construction Type */}
                            <div>
                                <label className={labelClass}>Loại công trình</label>
                                <select
                                    className={selectClass}
                                    value={formData.ConstructionType}
                                    onChange={e => updateField('ConstructionType', e.target.value)}
                                >
                                    <option value="">-- Chọn loại --</option>
                                    {CONSTRUCTION_TYPES.map(t => (
                                        <option key={t.value} value={t.label}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Construction Grade */}
                            <div>
                                <label className={labelClass}>Cấp công trình</label>
                                <select
                                    className={selectClass}
                                    value={formData.ConstructionGrade}
                                    onChange={e => updateField('ConstructionGrade', e.target.value)}
                                >
                                    <option value="">-- Chọn cấp --</option>
                                    {CONSTRUCTION_GRADES.map(g => (
                                        <option key={g.value} value={g.value}>{g.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Mục tiêu đầu tư */}
                        <div className="mt-4">
                            <label className={labelClass}>Mục tiêu đầu tư</label>
                            <textarea
                                placeholder="VD: Đáp ứng yêu cầu tổ chức các giải đấu quốc tế, góp phần tạo cơ sở vật chất hoàn chỉnh..."
                                className={inputClass + ' min-h-[72px] resize-none' + aiHighlight('Objective')}
                                value={formData.Objective}
                                onChange={e => updateField('Objective', e.target.value)}
                                rows={2}
                                onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }}
                            />
                        </div>

                        {/* Tóm tắt quy mô đầu tư */}
                        <div className="mt-4">
                            <label className={labelClass}>Tóm tắt quy mô đầu tư</label>
                            <textarea
                                placeholder="VD: Cải tạo, sửa chữa hiện trạng công trình gồm: trệt + mái tôn; dài khoảng 135,65m..."
                                className={inputClass + ' min-h-[72px] resize-none' + aiHighlight('InvestmentScale')}
                                value={formData.InvestmentScale}
                                onChange={e => updateField('InvestmentScale', e.target.value)}
                                rows={2}
                                onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }}
                            />
                        </div>

                        {/* Ban QLDA */}
                        <div className="mt-4">
                            <label className={labelClass}>Ban Quản Lý Dự Án</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                                {MANAGEMENT_BOARDS.map(board => (
                                    <button
                                        key={board.value}
                                        type="button"
                                        onClick={() => updateField('ManagementBoard', board.value)}
                                        className={`py-2 px-3 rounded-xl text-sm font-semibold transition-all border-2 whitespace-nowrap flex items-center justify-center ${
                                            formData.ManagementBoard === board.value
                                                ? `${board.color} text-white border-transparent shadow-md scale-[1.02]`
                                                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-gray-50 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        Ban {board.value}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full"></span>
                            Nhóm dự án tự động áp dụng thời gian chuẩn theo Luật ĐTC
                        </p>
                        {/* Thành viên dự án */}
                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700/50">
                            <div className="flex items-center gap-2 mb-4">
                                <Users className="w-5 h-5 text-blue-500" />
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-100">Thành viên dự án</h4>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">Chọn nhân sự tham gia quản lý dự án</p>
                                </div>
                            </div>

                        {/* Selected Members Chips */}
                        {selectedMembers.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {selectedMembers.map(sm => {
                                    const emp = employees.find(e => e.EmployeeID === sm.employeeId);
                                    if (!emp) return null;
                                    return (
                                        <div key={sm.employeeId} className="flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl px-3 py-1.5 group">
                                            <img
                                                src={emp.AvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.FullName)}&background=random&color=fff&size=24`}
                                                alt={emp.FullName}
                                                className="w-5 h-5 rounded-full object-cover"
                                            />
                                            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">{emp.FullName}</span>
                                            <select
                                                value={sm.role}
                                                onChange={e => updateMemberRole(sm.employeeId, e.target.value)}
                                                className="text-[10px] bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 rounded-md px-1 py-0.5 border-none outline-none cursor-pointer font-semibold"
                                            >
                                                <option value="Giám đốc dự án">Giám đốc DA</option>
                                                <option value="Phó Giám đốc dự án">Phó GĐ DA</option>
                                                <option value="Trưởng phòng phụ trách">TP phụ trách</option>
                                                <option value="Kỹ sư giám sát">KS giám sát</option>
                                                <option value="Cán bộ kỹ thuật">CB kỹ thuật</option>
                                                <option value="Kế toán dự án">Kế toán DA</option>
                                                <option value="Thành viên">Thành viên</option>
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => toggleMember(sm.employeeId)}
                                                className="w-4 h-4 rounded-full flex items-center justify-center text-blue-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Search & Dropdown */}
                        <div className="relative">
                            <div
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-700 flex items-center gap-2 cursor-pointer hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors"
                                onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                            >
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                                <input
                                    type="text"
                                    placeholder={`Tìm nhân sự... (${selectedMembers.length} đã chọn)`}
                                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                                    value={memberSearch}
                                    onChange={e => { setMemberSearch(e.target.value); setShowMemberDropdown(true); }}
                                    onFocus={() => setShowMemberDropdown(true)}
                                />
                                <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-slate-500 transition-transform ${showMemberDropdown ? 'rotate-180' : ''}`} />
                            </div>

                            {showMemberDropdown && (
                                <div className="absolute z-20 mt-1 w-full bg-[#FCF9F2] dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-sm max-h-56 overflow-y-auto">
                                    {Object.keys(groupedEmployees).length === 0 ? (
                                        <div className="p-4 text-center text-sm text-gray-400 dark:text-slate-500">Không tìm thấy nhân sự</div>
                                    ) : (
                                        Object.entries(groupedEmployees).map(([dept, emps]: [string, Employee[]]) => (
                                            <div key={dept}>
                                                <div className="px-3 py-1.5 bg-[#F0ECE1] dark:bg-slate-900 dark:bg-slate-700 text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider sticky top-0">
                                                    {dept}
                                                </div>
                                                {emps.map(emp => {
                                                    const isSelected = selectedMembers.some(m => m.employeeId === emp.EmployeeID);
                                                    return (
                                                        <button
                                                            key={emp.EmployeeID}
                                                            type="button"
                                                            onClick={() => toggleMember(emp.EmployeeID)}
                                                            className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors ${isSelected ? 'bg-blue-50/50 dark:bg-blue-500/15' : ''}`}
                                                        >
                                                            <img
                                                                src={emp.AvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.FullName)}&background=random&color=fff&size=28`}
                                                                alt={emp.FullName}
                                                                className="w-7 h-7 rounded-full object-cover ring-2 ring-white dark:ring-slate-700 shadow-sm"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-800 dark:text-slate-100 truncate">{emp.FullName}</p>
                                                                <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate">{emp.Position}</p>
                                                            </div>
                                                            {isSelected && (
                                                                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                                                                    <Check className="w-3 h-3 text-white" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {selectedMembers.length === 0 && (
                            <p className="text-[11px] text-primary-600 dark:text-primary-400 mt-2 flex items-center gap-1">
                                <span className="inline-block w-1.5 h-1.5 bg-primary-500 dark:bg-primary-400 rounded-full"></span>
                                Có thể bổ sung thành viên sau khi tạo dự án
                            </p>
                        )}
                    </div>
                    </div>
                    )}

                    {/* ═══ SECTION 2: Thông tin đầu tư ═══ */}
                    {activeTab === 'investment' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <SectionHeader icon={DollarSign} title="Thông tin đầu tư" subtitle="Vốn, địa điểm và thời gian thực hiện" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Total Investment */}
                            <div>
                                <label className={labelClass}>Tổng mức đầu tư (VNĐ)</label>
                                <FormattedInput
                                    placeholder="0"
                                    className={inputWithIconClass + aiHighlight('TotalInvestment')}
                                    value={formData.TotalInvestment}
                                    onChange={(v: number) => updateField('TotalInvestment', v)}
                                    icon={DollarSign}
                                    isDecimal={false}
                                />
                            </div>

                            {/* Start Date */}
                            <div>
                                <label className={labelClass}>Ngày bắt đầu dự kiến</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className={inputWithIconClass + aiHighlight('StartDate')}
                                        value={formData.StartDate}
                                        onChange={e => updateField('StartDate', e.target.value)}
                                    />
                                    <Calendar className={iconClass} />
                                </div>
                            </div>

                            {/* Capital Source */}
                            <div className="relative z-20">
                                <label className={labelClass}>Nguồn vốn đầu tư</label>
                                <div 
                                    className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 cursor-pointer flex justify-between items-center transition-all ${showCapitalDropdown ? 'ring-2 ring-blue-500/20 border-blue-500 dark:border-blue-400' : ''}`}
                                    onClick={() => setShowCapitalDropdown(!showCapitalDropdown)}
                                >
                                    <span className={formData.CapitalSource ? 'text-gray-800 dark:text-slate-100 line-clamp-1' : 'text-gray-500 dark:text-slate-500'}>
                                        {formData.CapitalSource || 'Chọn nguồn vốn...'}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-slate-500 transition-transform ${showCapitalDropdown ? 'rotate-180' : ''}`} />
                                </div>

                                {showCapitalDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowCapitalDropdown(false)} />
                                        <div className="absolute z-20 mt-1 w-full bg-[#FCF9F2] dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-sm overflow-hidden py-1">
                                            {['Ngân sách Trung ương', 'Ngân sách Địa phương', 'Vốn ODA', 'Vốn tư nhân', 'Khác'].map(source => {
                                                const currentSources = formData.CapitalSource ? formData.CapitalSource.split(',').map(s => s.trim()).filter(Boolean) : [];
                                                const isSelected = currentSources.includes(source);
                                                return (
                                                    <div 
                                                        key={source}
                                                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F0ECE1] dark:bg-slate-900 dark:hover:bg-slate-700 cursor-pointer"
                                                        onClick={() => {
                                                            const newSources = isSelected 
                                                                ? currentSources.filter(s => s !== source)
                                                                : [...currentSources, source];
                                                            updateField('CapitalSource', newSources.join(', '));
                                                        }}
                                                    >
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-slate-500'}`}>
                                                            {isSelected && <Check className="w-3 h-3 text-white" />}
                                                        </div>
                                                        <span className="text-sm text-gray-700 dark:text-slate-200">{source}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Province */}
                            <div>
                                <label className={labelClass}>Tỉnh/Thành phố <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select
                                        className={selectWithIconClass}
                                        value={formData.ProvinceCode}
                                        onChange={e => updateField('ProvinceCode', e.target.value)}
                                    >
                                        {PROVINCES.map(p => (
                                            <option key={p.code} value={p.code}>{p.name} ({p.code})</option>
                                        ))}
                                    </select>
                                    <MapPin className={iconClass} />
                                </div>
                                <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                                    <span className="inline-block w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full"></span>
                                    Mã tỉnh dùng cho mã dự án tự động
                                </p>
                            </div>

                            {/* Location (free text) */}
                            <div>
                                <label className={labelClass}>Địa điểm xây dựng</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="VD: Xã Thạch Hạ, TP. Hà Tĩnh"
                                        className={inputWithIconClass + aiHighlight('LocationCode')}
                                        value={formData.LocationCode}
                                        onChange={e => updateField('LocationCode', e.target.value)}
                                    />
                                    <MapPin className={iconClass} />
                                </div>
                            </div>

                            {/* Duration */}
                            <div>
                                <label className={labelClass}>Thời gian thực hiện</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="VD: 36 tháng (2025-2028)"
                                        className={inputWithIconClass + aiHighlight('Duration')}
                                        value={formData.Duration}
                                        onChange={e => updateField('Duration', e.target.value)}
                                    />
                                    <Clock className={iconClass} />
                                </div>
                            </div>

                            {/* Competent Authority */}
                            <div>
                                <label className={labelClass}>Người quyết định đầu tư</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="VD: UBND TP.HCM"
                                        className={inputWithIconClass + aiHighlight('CompetentAuthority')}
                                        value={formData.CompetentAuthority}
                                        onChange={e => updateField('CompetentAuthority', e.target.value)}
                                    />
                                    <Shield className={iconClass} />
                                </div>
                            </div>
                        </div>

                        {/* Investor Name - full width */}
                        <div className="mt-4">
                            <label className={labelClass}>Tên chủ đầu tư</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="VD: Ban QLDA Đầu tư xây dựng khu vực..."
                                    className={inputWithIconClass + aiHighlight('InvestorName')}
                                    value={formData.InvestorName}
                                    onChange={e => updateField('InvestorName', e.target.value)}
                                />
                                <User className={iconClass} />
                            </div>
                        </div>

                        {/* Quyết định phê duyệt */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className={labelClass}>Số quyết định phê duyệt dự án</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Số QĐ phê duyệt..."
                                        className={inputWithIconClass + aiHighlight('DecisionNumber')}
                                        value={formData.DecisionNumber}
                                        onChange={e => updateField('DecisionNumber', e.target.value)}
                                    />
                                    <FileText className={iconClass} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Ngày phê duyệt dự án</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className={inputWithIconClass + aiHighlight('ApprovalDate')}
                                        value={formData.ApprovalDate}
                                        onChange={e => updateField('ApprovalDate', e.target.value)}
                                    />
                                    <Calendar className={iconClass} />
                                </div>
                            </div>
                        </div>
                    </div>
                    )}

                    {/* ═══ SECTION 2.5: Quy mô công trình ═══ */}
                    {activeTab === 'scale' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <SectionHeader icon={Ruler} title="Quy mô công trình" subtitle="Thông tin kỹ thuật: diện tích, tầng, chiều cao" />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Tổng dự toán */}
                            <div>
                                <label className={labelClass}>Tổng dự toán (VNĐ)</label>
                                <FormattedInput
                                    placeholder="0"
                                    className={inputWithIconClass}
                                    value={formData.TotalEstimate}
                                    onChange={(v: number) => updateField('TotalEstimate', v)}
                                    icon={DollarSign}
                                    isDecimal={false}
                                />
                            </div>

                            {/* Diện tích (m²) */}
                            <div>
                                <label className={labelClass}>Diện tích khu đất (m²)</label>
                                <FormattedInput
                                    placeholder="0"
                                    className={inputClass}
                                    value={formData.SiteArea}
                                    onChange={(v: number) => updateField('SiteArea', v)}
                                    isDecimal={true}
                                />
                            </div>

                            {/* DT xây dựng (m²) */}
                            <div>
                                <label className={labelClass}>DT xây dựng (m²)</label>
                                <FormattedInput
                                    placeholder="0"
                                    className={inputClass}
                                    value={formData.ConstructionArea}
                                    onChange={(v: number) => updateField('ConstructionArea', v)}
                                    isDecimal={true}
                                />
                            </div>

                            {/* DT sàn SD (m²) */}
                            <div>
                                <label className={labelClass}>DT sàn sử dụng (m²)</label>
                                <FormattedInput
                                    placeholder="0"
                                    className={inputClass}
                                    value={formData.FloorArea}
                                    onChange={(v: number) => updateField('FloorArea', v)}
                                    isDecimal={true}
                                />
                            </div>

                            {/* Chiều cao (m) */}
                            <div>
                                <label className={labelClass}>Chiều cao (m)</label>
                                <FormattedInput
                                    placeholder="0"
                                    className={inputClass}
                                    value={formData.BuildingHeight}
                                    onChange={(v: number) => updateField('BuildingHeight', v)}
                                    isDecimal={true}
                                />
                            </div>

                            {/* Mật độ XD (%) */}
                            <div>
                                <label className={labelClass}>Mật độ xây dựng (%)</label>
                                <FormattedInput
                                    placeholder="0"
                                    className={inputClass}
                                    value={formData.BuildingDensity}
                                    onChange={(v: number) => updateField('BuildingDensity', v)}
                                    isDecimal={true}
                                />
                            </div>

                            {/* Hệ số SDĐ */}
                            <div>
                                <label className={labelClass}>Hệ số sử dụng đất</label>
                                <FormattedInput
                                    placeholder="0"
                                    className={inputClass}
                                    value={formData.LandUseCoefficient}
                                    onChange={(v: number) => updateField('LandUseCoefficient', v)}
                                    isDecimal={true}
                                />
                            </div>

                            {/* Số tầng nổi */}
                            <div>
                                <label className={labelClass}>Số tầng nổi</label>
                                <div className="relative">
                                    <input
                                        type="number" min="0" step="1" placeholder="0"
                                        className={inputWithIconClass}
                                        value={formData.AboveGroundFloors || ''}
                                        onChange={e => updateField('AboveGroundFloors', Number(e.target.value))}
                                    />
                                    <Layers className={iconClass} />
                                </div>
                            </div>

                            {/* Số tầng hầm */}
                            <div>
                                <label className={labelClass}>Số tầng hầm</label>
                                <div className="relative">
                                    <input
                                        type="number" min="0" step="1" placeholder="0"
                                        className={inputWithIconClass}
                                        value={formData.BasementFloors || ''}
                                        onChange={e => updateField('BasementFloors', Number(e.target.value))}
                                    />
                                    <Layers className={iconClass} />
                                </div>
                            </div>
                        </div>
                    </div>
                    )}

                    {/* ═══ SECTION 3: Nhà thầu & Tiêu chuẩn ═══ */}
                    {activeTab === 'contractors' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <SectionHeader icon={HardHat} title="Nhà thầu & Tiêu chuẩn" subtitle="Theo mục I.10-13 Mẫu 05 Phụ lục I" />

                        {/* Applicable Standards - full width */}
                        <div className="mb-4">
                            <label className={labelClass}>
                                Tiêu chuẩn, quy chuẩn áp dụng
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="VD: TCVN 5574:2018, QCVN 03:2022/BXD..."
                                    className={inputWithIconClass + aiHighlight('ApplicableStandards')}
                                    value={formData.ApplicableStandards}
                                    onChange={e => updateField('ApplicableStandards', e.target.value)}
                                />
                                <FileText className={iconClass} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Feasibility Contractor */}
                            <div>
                                <label className={labelClass}>NT lập BCNCKT</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Tên nhà thầu..."
                                        className={inputWithIconClass}
                                        value={formData.FeasibilityContractor}
                                        onChange={e => updateField('FeasibilityContractor', e.target.value)}
                                    />
                                    <HardHat className={iconClass} />
                                </div>
                            </div>

                            {/* Survey Contractor */}
                            <div>
                                <label className={labelClass}>NT khảo sát XD</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Tên nhà thầu..."
                                        className={inputWithIconClass}
                                        value={formData.SurveyContractor}
                                        onChange={e => updateField('SurveyContractor', e.target.value)}
                                    />
                                    <Search className={iconClass} />
                                </div>
                            </div>

                            {/* Review Contractor */}
                            <div>
                                <label className={labelClass}>NT thẩm tra</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Tên nhà thầu..."
                                        className={inputWithIconClass}
                                        value={formData.ReviewContractor}
                                        onChange={e => updateField('ReviewContractor', e.target.value)}
                                    />
                                    <Shield className={iconClass} />
                                </div>
                            </div>
                        </div>                    </div>
                    )}



                    </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-[#F0ECE1] dark:bg-slate-900 dark:bg-slate-800 flex justify-between items-center rounded-b-2xl">
                    <p className="text-[11px] text-gray-400 dark:text-slate-500">
                        Các trường không bắt buộc có thể bổ sung sau
                    </p>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-gray-600 dark:text-slate-300 font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                            disabled={isLoading}
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 rounded-lg bg-primary-600 text-white font-bold shadow-sm shadow-primary-200 dark:shadow-primary-900/30 hover:bg-primary-500 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Đang xử lý...
                                </>
                            ) : (
                                isEditMode ? 'Lưu thay đổi' : 'Tạo dự án'
                            )}
                        </button>
                    </div>
                </div>
                </form>
            </div>
        </div>
    );
};
