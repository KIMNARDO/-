import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { path: '/', icon: 'home', label: '홈' },
  { path: '/attendance', icon: 'calendar_month', label: '출석' },
  { path: '/payments', icon: 'account_balance_wallet', label: '회비' },
  { path: '/team', icon: 'groups', label: '팀' },
  { path: '/admin', icon: 'settings', label: '관리', adminOnly: true },
];

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen pb-24 bg-bg-light">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-surface-light border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center border-2 border-primary/20">
            <span className="text-sm font-bold text-text-main">JR</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-text-main leading-none">JR GATORS</h1>
            <p className="text-xs text-text-secondary font-medium">제이알 게이토스</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user?.profile_image ? (
            <img src={user.profile_image} alt="" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-text-secondary">
              {user?.name?.[0] || '?'}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface-light border-t border-gray-100 pb-safe pt-2 px-2 z-50">
        <div className="flex justify-between items-end pb-3">
          {navItems
            .filter(item => !item.adminOnly || isAdmin)
            .map(item => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${
                    isActive ? 'text-text-main' : 'text-text-secondary hover:text-text-main'
                  }`}
                >
                  <div className="h-8 flex items-center justify-center rounded-full w-12">
                    <span className={`material-symbols-outlined text-[26px] ${isActive ? 'icon-filled' : ''}`}>
                      {item.icon}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </NavLink>
              );
            })}
        </div>
      </nav>
    </div>
  );
}
