import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import type { User } from './mock/data';
import { testUsers } from './mock/data';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import Home from './pages/Home';
import InstallerHome from './pages/InstallerHome';
import MaterialList from './pages/MaterialList';
import MaterialDetail from './pages/MaterialDetail';
import ProductKnowledgeDetail from './pages/ProductKnowledgeDetail';
import ImageSave from './pages/ImageSave';
import Submit from './pages/Submit';
import MySubmissions from './pages/MySubmissions';
import MyPoints from './pages/MyPoints';
import Profile from './pages/Profile';
import DeliveryCreate from './pages/DeliveryCreate';
import DeliveryTasks from './pages/DeliveryTasks';
import DeliveryUpload from './pages/DeliveryUpload';
import DeliveryStory from './pages/DeliveryStory';
import DeliveryDetail from './pages/DeliveryDetail';
import AdminDelivery from './pages/AdminDelivery';
import AiGenerate from './pages/AiGenerate';
import Cases from './pages/Cases';
import CaseDetail from './pages/CaseDetail';
import LeadForm from './pages/LeadForm';
import AdminLeads from './pages/AdminLeads';
import AdminProducts from './pages/AdminProducts';
import AdminProductEdit from './pages/AdminProductEdit';
import CasesHub from './pages/CasesHub';
import CustomerCaseShare from './pages/CustomerCaseShare';
import CaseCollectionShare from './pages/CaseCollectionShare';
import DealReportSubmit from './pages/DealReportSubmit';

// ========== Auth Context ==========
interface AuthContextType {
  user: User | null;
  authReady: boolean;
  login: (phone: string, password: string) => boolean;
  logout: () => void;
}
export const AuthContext = createContext<AuthContextType>({
  user: null, authReady: false, login: () => false, logout: () => {},
});
export const useAuth = () => useContext(AuthContext);

// ========== Toast Context ==========
interface ToastContextType { showToast: (msg: string) => void; }
export const ToastContext = createContext<ToastContextType>({ showToast: () => {} });
export const useToast = () => useContext(ToastContext);

// ========== Favorites Context ==========
interface FavoritesContextType {
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  isFavorited: (id: string) => boolean;
}
export const FavoritesContext = createContext<FavoritesContextType>({
  favorites: new Set(), toggleFavorite: () => {}, isFavorited: () => false,
});
export const useFavorites = () => useContext(FavoritesContext);

// 安装师傅路由守卫 — 禁止进入导购专属页面
function InstallerGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role === 'installer') return <Navigate to="/delivery/tasks" replace />;
  return <>{children}</>;
}

// 管理员路由守卫 — 仅 admin 可进入
function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, authReady } = useAuth();
  if (!authReady) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to={user.role === 'installer' ? '/delivery/tasks' : '/'} replace />;
  return <>{children}</>;
}

// 隐藏底部导航的路径
const hideNavPaths = ['/login', '/cases', '/admin/delivery', '/admin/leads', '/admin/products'];
const hideNavPrefixes = ['/save-images/', '/delivery/upload/', '/delivery/story/', '/delivery/detail/', '/delivery/create', '/cases/', '/lead-form/', '/share/', '/deal-report/', '/admin/products/'];

function shouldHideNav(pathname: string) {
  if (hideNavPaths.includes(pathname)) return true;
  if (hideNavPrefixes.some(p => pathname.startsWith(p))) return true;
  return false;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem('sct-user');
    if (stored) {
      try { const u = JSON.parse(stored); setUser(u); }
      catch { localStorage.removeItem('sct-user'); }
    }
    setAuthReady(true);
  }, []);

  useEffect(() => {
    if (!authReady) return;
    const publicPaths = ['/login', '/cases'];
    const publicPrefixes = ['/cases/', '/lead-form/', '/share/'];
    const isPublic = publicPaths.includes(location.pathname) || publicPrefixes.some(p => location.pathname.startsWith(p));
    if (!user && !isPublic) {
      navigate('/login', { replace: true });
    }
  }, [authReady, user, location.pathname, navigate]);

  const login = useCallback((phone: string, password: string): boolean => {
    const found = testUsers.find(u => u.phone === phone && u.password === password);
    if (found) {
      setUser(found);
      localStorage.setItem('sct-user', JSON.stringify(found));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('sct-user');
    navigate('/login', { replace: true });
  }, [navigate]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const isFavorited = useCallback((id: string) => favorites.has(id), [favorites]);

  const requireAuth = (element: React.ReactNode) => {
    if (!authReady) return null;
    return user ? element : <Navigate to="/login" replace />;
  };

  const showNav = authReady && !shouldHideNav(location.pathname) && !!user;

  return (
    <AuthContext.Provider value={{ user, authReady, login, logout }}>
      <ToastContext.Provider value={{ showToast }}>
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorited }}>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className={`flex-1 ${showNav ? 'pb-20' : ''}`}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={requireAuth(user?.role === 'installer' ? <InstallerHome /> : <Home />)} />
                {/* 案例工作台（内部） — 安装师傅自动跳转 /delivery/tasks */}
                <Route path="/cases-hub" element={requireAuth(<InstallerGuard><CasesHub /></InstallerGuard>)} />
                {/* 素材库 */}
                <Route path="/library" element={requireAuth(<InstallerGuard><MaterialList /></InstallerGuard>)} />
                <Route path="/material/:id" element={requireAuth(<InstallerGuard><MaterialDetail /></InstallerGuard>)} />
                <Route path="/product-knowledge/:id" element={requireAuth(<InstallerGuard><ProductKnowledgeDetail /></InstallerGuard>)} />
                <Route path="/save-images/:id" element={requireAuth(<InstallerGuard><ImageSave /></InstallerGuard>)} />
                <Route path="/submit" element={requireAuth(<InstallerGuard><Submit /></InstallerGuard>)} />
                <Route path="/my-submissions" element={requireAuth(<InstallerGuard><MySubmissions /></InstallerGuard>)} />
                <Route path="/my-points" element={requireAuth(<MyPoints />)} />
                <Route path="/profile" element={requireAuth(<Profile />)} />
                {/* 交付系统（保留原路由，入口从案例工作台进入） */}
                <Route path="/delivery" element={requireAuth(<InstallerGuard><CasesHub /></InstallerGuard>)} />
                <Route path="/delivery/create" element={requireAuth(<InstallerGuard><DeliveryCreate /></InstallerGuard>)} />
                <Route path="/delivery/tasks" element={requireAuth(<DeliveryTasks />)} />
                <Route path="/delivery/upload/:taskId" element={requireAuth(<DeliveryUpload />)} />
                <Route path="/delivery/story/:taskId" element={requireAuth(<InstallerGuard><DeliveryStory /></InstallerGuard>)} />
                <Route path="/delivery/detail/:taskId" element={requireAuth(<DeliveryDetail />)} />
                <Route path="/admin/delivery" element={<AdminGuard><AdminDelivery /></AdminGuard>} />
                {/* AI 生成 */}
                <Route path="/ai-generate/:sourceType/:id" element={requireAuth(<InstallerGuard><AiGenerate /></InstallerGuard>)} />
                {/* 公开案例（无需登录） */}
                <Route path="/cases" element={<Cases />} />
                <Route path="/cases/:caseId" element={<CaseDetail />} />
                <Route path="/share/:caseId" element={<CustomerCaseShare />} />
                <Route path="/share/collection" element={<CaseCollectionShare />} />
                <Route path="/lead-form/:caseId" element={<LeadForm />} />
                {/* 客户线索管理 */}
                <Route path="/admin/leads" element={<AdminGuard><AdminLeads /></AdminGuard>} />
                <Route path="/admin/products" element={<AdminGuard><AdminProducts /></AdminGuard>} />
                <Route path="/admin/products/:id" element={<AdminGuard><AdminProductEdit /></AdminGuard>} />
                <Route path="/deal-report/submit" element={requireAuth(<InstallerGuard><DealReportSubmit /></InstallerGuard>)} />
                <Route path="*" element={authReady ? <Navigate to="/" replace /> : null} />
              </Routes>
            </div>
            {showNav && <BottomNav />}
            {toast && (
              <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] toast-enter">
                <div className="bg-gray-900 text-white text-sm px-5 py-2.5 rounded-full shadow-lg">
                  {toast}
                </div>
              </div>
            )}
          </div>
        </FavoritesContext.Provider>
      </ToastContext.Provider>
    </AuthContext.Provider>
  );
}
