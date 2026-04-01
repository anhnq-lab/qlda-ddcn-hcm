import React, { useState } from 'react';
import { FileText, Download, BarChart2, PieChart, RefreshCw, Database, CheckCircle2, AlertTriangle, ExternalLink, Calendar, Loader2, FileSpreadsheet } from 'lucide-react';
import {
    generateMonitoringReport,
    generateDisbursementReport,
    generateIssuesReport,
    downloadReport,
    generateMonitoringReport as generateProjectReport
} from '../../utils/reportGenerator';
import { useProjects } from '../../hooks/useProjects';
import { usePayments } from '../../hooks/usePayments';
import { useTasks } from '../../hooks/useTasks';

const ReportCenter: React.FC = () => {
    const { projects } = useProjects();
    const { payments } = usePayments();
    const { data: tasks = [] } = useTasks();
    const reportSource = { projects, payments, tasks };

    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'success'>('idle');
    const [exportingReport, setExportingReport] = useState<string | null>(null);
    const [exportSuccess, setExportSuccess] = useState<string | null>(null);

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            setSyncStatus('success');
        }, 2000);
    };

    const handleExportReport = async (reportType: 'monitoring' | 'disbursement' | 'issues') => {
        setExportingReport(reportType);
        setExportSuccess(null);

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            let report;
            switch (reportType) {
                case 'monitoring':
                    report = generateMonitoringReport(reportSource);
                    break;
                case 'disbursement':
                    report = generateDisbursementReport(reportSource);
                    break;
                case 'issues':
                    report = generateIssuesReport(reportSource);
                    break;
            }

            downloadReport(report);
            setExportSuccess(reportType);

            // Clear success state after 3 seconds
            setTimeout(() => setExportSuccess(null), 3000);
        } catch (error) {
            console.error('Export error:', error);
            alert('Có lỗi xảy ra khi xuất báo cáo');
        } finally {
            setExportingReport(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Trung tâm Báo cáo & Điều hành</h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Tổng hợp báo cáo giám sát đầu tư và đồng bộ dữ liệu quốc gia</p>
                </div>
            </div>

            {/* BC-03: Đồng bộ CSDL Quốc gia */}
            <div className="rounded-2xl shadow-sm p-4 overflow-hidden relative border bg-[#FCF9F2] dark:bg-slate-800 dark:border-slate-700 border-gray-200">
                <div className="absolute right-0 top-0 h-full w-1/3 bg-blue-50/50 dark:bg-blue-900/10 skew-x-12 transform translate-x-10 pointer-events-none"></div>
                
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center relative z-10 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-slate-700 shrink-0">
                                <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Hệ thống Thông tin Quốc gia về Đầu tư công</h3>
                        </div>
                        <p className="text-gray-500 dark:text-slate-400 text-sm max-w-xl pl-16">
                            Tính năng tự động đồng bộ dữ liệu dự án, gói thầu về CSDL Quốc gia qua API theo chuẩn Nghị định 111/2025/NĐ-CP.
                        </p>

                        <div className="flex items-center gap-4 mt-5 pl-16">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Trạng thái kết nối</span>
                                <span className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    Đã kết nối (API v2.0)
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Lần đồng bộ cuối</span>
                                <span className="text-sm font-bold text-gray-700 dark:text-slate-300 px-3 py-1.5 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-100 dark:border-slate-600">
                                    Hôm nay, 08:30 AM
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-start lg:items-end w-full lg:w-auto">
                        <button
                            onClick={handleSync}
                            disabled={isSyncing || syncStatus === 'success'}
                            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all w-full sm:w-auto ${syncStatus === 'success'
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 cursor-default shadow-sm'
                                : 'bg-primary-600 hover:bg-primary-500 dark:bg-blue-500 dark:hover:bg-primary-600 text-white shadow-md shadow-primary-500/20 hover:shadow-lg hover:-translate-y-0.5'
                                } `}
                        >
                            {isSyncing ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : syncStatus === 'success' ? (
                                <CheckCircle2 className="w-5 h-5" />
                            ) : (
                                <RefreshCw className="w-5 h-5" />
                            )}
                            {isSyncing ? 'Đang đồng bộ...' : syncStatus === 'success' ? 'Đồng bộ thành công' : 'Đồng bộ ngay'}
                        </button>
                        {syncStatus === 'success' && (
                            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-3 animate-in fade-in flex items-center justify-center gap-1.5 w-full">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Đã gửi 15 gói dữ liệu JSON.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Reports Grid */}
            <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 mt-8 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Danh sách Báo cáo định kỳ
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* BC-01: Báo cáo giám sát đầu tư */}
                <div className="bg-[#FCF9F2] dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow group">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-300 mb-4 group-hover:scale-110 transition-transform">
                        <BarChart2 className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-gray-800 dark:text-slate-200 mb-2">Báo cáo Giám sát Đầu tư</h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 min-h-[40px]">
                        Báo cáo tình hình thực hiện dự án theo biểu mẫu quy định của Bộ KH&ĐT (BC-01).
                    </p>
                    <div className="pt-4 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-700 px-2 py-1 rounded">Định kỳ: Tháng/Quý</span>
                        <button
                            onClick={() => handleExportReport('monitoring')}
                            disabled={exportingReport === 'monitoring'}
                            className={`text - sm font - bold flex items - center gap - 1 transition - colors ${exportSuccess === 'monitoring'
                                ? 'text-emerald-600'
                                : 'text-slate-700 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white'
                                } `}
                        >
                            {exportingReport === 'monitoring' ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Đang xuất...
                                </>
                            ) : exportSuccess === 'monitoring' ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4" /> Đã tải xuống
                                </>
                            ) : (
                                <>
                                    <FileSpreadsheet className="w-4 h-4" /> Xuất CSV
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* BC-02: Giải ngân */}
                <div className="bg-[#FCF9F2] dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow group">
                    <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4 group-hover:scale-110 transition-transform">
                        <PieChart className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-gray-800 dark:text-slate-200 mb-2">Báo cáo Tình hình Giải ngân</h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 min-h-[40px]">
                        So sánh vốn giải ngân thực tế so với kế hoạch vốn được giao.
                    </p>
                    <div className="pt-4 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-700 px-2 py-1 rounded">Real-time</span>
                        <button
                            onClick={() => handleExportReport('disbursement')}
                            disabled={exportingReport === 'disbursement'}
                            className={`text - sm font - bold flex items - center gap - 1 transition - colors ${exportSuccess === 'disbursement'
                                ? 'text-emerald-600'
                                : 'text-primary-600 hover:text-primary-700'
                                } `}
                        >
                            {exportingReport === 'disbursement' ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Đang xuất...
                                </>
                            ) : exportSuccess === 'disbursement' ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4" /> Đã tải xuống
                                </>
                            ) : (
                                <>
                                    <FileSpreadsheet className="w-4 h-4" /> Xuất CSV
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Other Report */}
                <div className="bg-[#FCF9F2] dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow group">
                    <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center text-primary-600 dark:text-yellow-400 mb-4 group-hover:scale-110 transition-transform">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-gray-800 dark:text-slate-200 mb-2">Báo cáo Xử lý Vướng mắc</h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 min-h-[40px]">
                        Tổng hợp các vấn đề khó khăn, vướng mắc cần tháo gỡ trong quá trình thi công.
                    </p>
                    <div className="pt-4 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-700 px-2 py-1 rounded">Theo sự vụ</span>
                        <button
                            onClick={() => handleExportReport('issues')}
                            disabled={exportingReport === 'issues'}
                            className={`text - sm font - bold flex items - center gap - 1 transition - colors ${exportSuccess === 'issues'
                                ? 'text-emerald-600'
                                : 'text-primary-600 hover:text-primary-700'
                                } `}
                        >
                            {exportingReport === 'issues' ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Đang xuất...
                                </>
                            ) : exportSuccess === 'issues' ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4" /> Đã tải xuống
                                </>
                            ) : (
                                <>
                                    <FileSpreadsheet className="w-4 h-4" /> Xuất CSV
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportCenter;