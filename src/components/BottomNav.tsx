import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ClipboardList, LayoutGrid, User } from 'lucide-react';
import { useAuth } from '../App';

const allNavItems = [
  { path: '/', label: '首页', Icon: Home },
  { path: '/cases-hub', label: '案例', Icon: ClipboardList },
  { path: '/library', label: '素材', Icon: LayoutGrid },
  { path: '/profile', label: '我的', Icon: User },
];

const installerNavItems = [
  { path: '/', label: '任务', Icon: ClipboardList },
  { path: '/profile', label: '我的', Icon: User },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = user?.role === 'installer' ? installerNavItems : allNavItems;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white/90 backdrop-blur border-t border-gray-100 z-50 safe-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ path, label, Icon }) => {
          const active = location.pathname === path || (path === '/' && location.pathname === '/');
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1"
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.2 : 1.6}
                className={active ? 'text-navy-800' : 'text-gray-400'}
              />
              <span className={`text-[10px] font-medium ${active ? 'text-navy-800' : 'text-gray-400'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
