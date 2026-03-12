import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  CreditCard,
  FileBox,
  Settings,
  LogOut,
  UserCircle,
  CheckSquare,
  BarChart2,
  BookOpen,
  User,
  ChevronLeft,
  ChevronRight,
  Scale,
  FolderTree,
  ShieldCheck,

} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePermissionCheck } from '../hooks/usePermissionCheck';
import type { PermissionResource } from '../types/permission.types';

// ========================================
// SIDEBAR COMPONENT — Ban DDCN TP.HCM Theme
// ========================================

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onClose?: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
  /** Permission resource needed to see this item */
  resource?: PermissionResource;
}

const navItems: NavItem[] = [
  { name: 'Tổng quan', path: '/', icon: LayoutDashboard, resource: 'dashboard' },
  { name: 'Dashboard cá nhân', path: '/my-dashboard', icon: User },
  { name: 'Dự án đầu tư', path: '/projects', icon: Briefcase, resource: 'projects' },
  { name: 'Công việc', path: '/tasks', icon: CheckSquare, badge: 5, resource: 'tasks' },
  { name: 'Nhân sự', path: '/employees', icon: UserCircle, resource: 'employees' },
  { name: 'Nhà thầu', path: '/contractors', icon: Users, resource: 'contractors' },
  { name: 'Hợp đồng', path: '/contracts', icon: FileText, resource: 'contracts' },
  { name: 'Thanh toán', path: '/payments', icon: CreditCard, resource: 'payments' },
  { name: 'Hồ sơ tài liệu', path: '/documents', icon: FileBox, resource: 'documents' },
  { name: 'Môi trường dữ liệu chung', path: '/cde', icon: FolderTree, resource: 'cde' },
  { name: 'Văn bản pháp luật', path: '/legal-documents', icon: Scale, resource: 'legal_docs' },
  { name: 'Báo cáo', path: '/reports', icon: BarChart2, resource: 'reports' },
  { name: 'Quy chế làm việc', path: '/regulations', icon: BookOpen, resource: 'regulations' },
];

const adminItems: NavItem[] = [
  { name: 'Quản trị HT', path: '/admin', icon: ShieldCheck, resource: 'admin_accounts' },
];

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  onClose
}) => {
  const { currentUser, logout } = useAuth();
  const { can } = usePermissionCheck();

  // Filter nav items based on permissions
  const visibleNavItems = useMemo(() => {
    return navItems.filter(item => {
      if (!item.resource) return true; // No resource = always visible  
      return can(item.resource, 'view');
    });
  }, [can]);

  const visibleAdminItems = useMemo(() => {
    return adminItems.filter(item => {
      if (!item.resource) return true;
      return can(item.resource, 'view');
    });
  }, [can]);

  return (
    <div
      className={`
        h-full flex flex-col justify-between
        transition-all duration-300 ease-out
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
      style={{
        background: 'linear-gradient(180deg, #3D3D3D 0%, #2D2D2D 60%, #1F1F1F 100%)',
      }}
    >
      {/* ── Logo & Brand ── */}
      <div>
        <div
          className={`flex items-center gap-3 px-4 h-16 shrink-0 ${isCollapsed ? 'justify-center px-2' : ''}`}
          style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="w-14 h-14 bg-white rounded-md p-1 flex items-center justify-center shrink-0 shadow-[0_2px_10px_rgba(255,255,255,0.15)] overflow-hidden">
            <img src="/logo-ddcn-v3.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in overflow-hidden pl-1 flex flex-col justify-center">
              <h1 className="text-[13px] font-bold text-white leading-tight truncate">Ban QLDA ĐTXD ĐDCN</h1>
              <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.55)' }}>UBND TP.HCM</p>
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav className="mt-2 px-2 space-y-0.5 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 160px)' }}>
          {[...visibleNavItems, ...visibleAdminItems].map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              title={isCollapsed ? item.name : undefined}
              className={({ isActive }) => `
                flex items-center gap-2.5 px-3 py-2 rounded-lg
                transition-all duration-150 group relative text-[13px]
                ${isCollapsed ? 'justify-center' : ''}
                ${isActive
                  ? 'font-semibold'
                  : 'sidebar-nav-item'
                }
              `}
              style={({ isActive }) => isActive ? {
                background: 'rgba(255,255,255,0.18)',
                color: '#ffffff',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
              } : {
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              {({ isActive }) => (
                <>
                  {/* Active Indicator — golden left bar */}
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                      style={{ background: '#FFD700' }}
                    />
                  )}

                  <item.icon className={`
                    w-[18px] h-[18px] shrink-0 transition-transform
                    ${isActive ? '' : 'group-hover:scale-110'}
                  `} />

                  {!isCollapsed && (
                    <span className="flex-1 truncate">{item.name}</span>
                  )}

                  {/* Badge */}
                  {item.badge && !isCollapsed && (
                    <span
                      className="px-1.5 py-0.5 text-[10px] font-bold rounded-md leading-none"
                      style={{
                        background: '#FFD700',
                        color: '#2D2D2D',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.badge && isCollapsed && (
                    <span
                      className="absolute top-1 right-1 w-2 h-2 rounded-full"
                      style={{ background: '#FFD700' }}
                    />
                  )}

                  {/* Tooltip for collapsed */}
                  {isCollapsed && (
                    <span
                      className="
                        absolute left-full ml-2 px-2 py-1
                        text-white text-xs rounded-lg
                        opacity-0 group-hover:opacity-100 pointer-events-none
                        whitespace-nowrap z-50 shadow-lg
                        transition-opacity duration-200
                      "
                      style={{ background: '#2D2D2D' }}
                    >
                      {item.name}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* ── Footer ── */}
      <div
        className="px-2 py-3 space-y-0.5"
        style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
      >
        {/* Collapse Toggle */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={`
              w-full flex items-center gap-2.5 px-3 py-2 rounded-lg
              transition-all duration-150 text-[13px]
              ${isCollapsed ? 'justify-center' : ''}
            `}
            style={{ color: 'rgba(255,255,255,0.5)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
            }}
            aria-label={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-[18px] h-[18px]" />
            ) : (
              <>
                <ChevronLeft className="w-[18px] h-[18px]" />
                <span>Thu gọn</span>
              </>
            )}
          </button>
        )}

        {/* Settings */}
        <NavLink
          to="/settings"
          className={`
            flex items-center gap-2.5 px-3 py-2 rounded-lg
            transition-colors text-[13px]
            ${isCollapsed ? 'justify-center' : ''}
          `}
          style={{ color: 'rgba(255,255,255,0.5)' }}
          title={isCollapsed ? 'Cài đặt' : undefined}
        >
          <Settings className="w-[18px] h-[18px]" />
          {!isCollapsed && <span>Cài đặt</span>}
        </NavLink>

        {/* Logout */}
        <button
          onClick={() => { logout(); }}
          className={`
            w-full flex items-center gap-2.5 px-3 py-2 rounded-lg
            transition-all duration-150 text-[13px]
            ${isCollapsed ? 'justify-center' : ''}
          `}
          style={{ color: 'rgba(255,255,255,0.5)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.color = '#FFD700';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
          }}
          title={isCollapsed ? 'Đăng xuất' : undefined}
        >
          <LogOut className="w-[18px] h-[18px]" />
          {!isCollapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
