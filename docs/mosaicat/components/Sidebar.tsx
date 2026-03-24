import React from 'react';
import { Badge } from './Badge';

// ─── Types ───────────────────────────────────────────────────
export interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export interface SidebarProps {
  currentPath: string;
  collapsed?: boolean;
  onToggle: () => void;
  navItems: NavItem[];
}

// ─── Component ───────────────────────────────────────────────
export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  collapsed = false,
  onToggle,
  navItems,
}) => {
  return (
    <aside
      className={`flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo / Brand */}
      <div className="flex items-center h-16 px-4 border-b border-gray-200 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-sm shrink-0">
          M
        </div>
        {!collapsed && (
          <span className="ml-3 text-lg font-semibold text-gray-900 whitespace-nowrap">
            Mosaicat
          </span>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <a
              key={item.path}
              href={item.path}
              title={collapsed ? item.label : undefined}
              className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-slate-50 hover:text-gray-900'
              }`}
            >
              <span
                className={`shrink-0 w-5 h-5 ${
                  isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                }`}
              >
                {item.icon}
              </span>
              {!collapsed && (
                <>
                  <span className="ml-3 flex-1 whitespace-nowrap">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge count={item.badge} variant="danger" />
                  )}
                </>
              )}
              {collapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="absolute ml-3.5 -mt-5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-gray-200 p-2 shrink-0">
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-slate-50 hover:text-gray-900 transition-colors"
          aria-label={collapsed ? '展开侧边栏' : '折叠侧边栏'}
        >
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
              collapsed ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
          {!collapsed && <span className="ml-3 whitespace-nowrap">折叠菜单</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;