import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, Users, Shield, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Lazy load the sub-modules
const UserAccountManager = React.lazy(() => import('./UserAccountManager'));
const PermissionManager = React.lazy(() => import('../settings/PermissionManager'));
const ContractorAccountManager = React.lazy(() => import('./ContractorAccountManager'));

// ============================================================
// ADMIN USER MANAGEMENT — Unified Tab Page
// ============================================================

type TabKey = 'accounts' | 'permissions' | 'contractors';

interface TabDef {
    key: TabKey;
    label: string;
    icon: React.ElementType;
}

const TABS: TabDef[] = [
    { key: 'accounts', label: 'Tài khoản', icon: Users },
    { key: 'permissions', label: 'Phân quyền', icon: Shield },
    { key: 'contractors', label: 'Nhà thầu', icon: Building2 },
];

const AdminUserManagement: React.FC = () => {
    const { currentUser } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const isAdmin = currentUser?.Role === 'Admin';

    // Read tab from URL, default to 'accounts'
    const tabFromUrl = searchParams.get('tab') as TabKey | null;
    const [activeTab, setActiveTab] = useState<TabKey>(
        tabFromUrl && TABS.some(t => t.key === tabFromUrl) ? tabFromUrl : 'accounts'
    );

    // Sync tab → URL
    useEffect(() => {
        const current = searchParams.get('tab');
        if (current !== activeTab) {
            setSearchParams({ tab: activeTab }, { replace: true });
        }
    }, [activeTab, searchParams, setSearchParams]);

    const switchTab = (key: TabKey) => {
        setActiveTab(key);
    };

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-slate-400">
                <ShieldCheck className="w-16 h-16 mb-4 text-gray-300 dark:text-slate-600" />
                <h2 className="text-xl font-semibold mb-2">Không có quyền truy cập</h2>
                <p>Chỉ Admin mới có thể truy cập trang quản trị hệ thống.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 pt-5 pb-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl shadow-lg shadow-amber-500/20">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        Quản trị Hệ thống
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                        Quản lý tài khoản người dùng và phân quyền truy cập
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-6 mt-4 border-b border-gray-200 dark:border-slate-700">
                <div className="flex gap-1">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.key;
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => switchTab(tab.key)}
                                className={`
                                    flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                                    rounded-t-lg transition-all duration-200 relative
                                    ${isActive
                                        ? 'text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/10'
                                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                                    }
                                `}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                                {/* Active underline */}
                                {isActive && (
                                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto">
                <React.Suspense
                    fallback={
                        <div className="flex items-center justify-center h-64">
                            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    }
                >
                    {activeTab === 'accounts' && (
                        <div className="p-6">
                            <UserAccountManager />
                        </div>
                    )}
                    {activeTab === 'permissions' && (
                        <PermissionManager />
                    )}
                    {activeTab === 'contractors' && (
                        <div className="p-6">
                            <ContractorAccountManager />
                        </div>
                    )}
                </React.Suspense>
            </div>
        </div>
    );
};

export default AdminUserManagement;
