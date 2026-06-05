import { useState, FormEvent } from 'react';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import { Store, Briefcase, Truck, UserPlus, LogIn } from 'lucide-react';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!phone.trim() || !password.trim()) { setError('请输入账号和密码'); return; }
    setLoading(true);
    window.setTimeout(async () => {
      const ok = await login(phone.trim(), password);
      setLoading(false);
      if (ok) navigate('/', { replace: true });
      else setError('账号或密码错误');
    }, 500);
  };

  return (
    <div className="min-h-screen hero-gradient soft-glow flex flex-col relative overflow-x-hidden">
      {/* Ambient light orbs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-0 w-48 h-48 bg-amber-400/6 rounded-full blur-3xl pointer-events-none" />

      {/* Brand area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        <div className="mb-6">
          <img src="https://www.tempurchina.com/uploadfiles/2022/06/20220617115332280.png" alt="TEMPUR" className="h-12 mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1 tracking-wide">门店案例宝</h1>
        <p className="text-blue-200/60 text-sm">TEMPUR 经销商案例营销工具</p>
      </div>

      {/* Login form card */}
      <div className="bg-white rounded-t-3xl px-6 pt-8 pb-10 relative z-10 shadow-premium">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">登录</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-500 mb-1.5">账号</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入账号" autoComplete="username"
              className="w-full h-12 px-4 bg-surface-50 border border-surface-200 rounded-xl text-gray-900 placeholder-surface-400 focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 transition-all text-base" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-500 mb-1.5">密码</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码" autoComplete="current-password"
              className="w-full h-12 px-4 bg-surface-50 border border-surface-200 rounded-xl text-gray-900 placeholder-surface-400 focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 transition-all text-base" />
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 border border-red-100">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading}
            className="w-full h-12 bg-navy-800 text-white font-semibold rounded-xl active:bg-navy-900 disabled:opacity-50 transition-colors text-base shadow-lg shadow-navy-200 flex items-center justify-center gap-2">
            <LogIn size={18} />
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-surface-50 rounded-xl border border-surface-200">
          <p className="text-xs text-surface-400 mb-2.5 font-medium">测试账号（密码均为 123456）</p>
          <div className="space-y-0.5">
            <button onClick={() => { setPhone('dealer001'); setPassword('123456'); }}
              className="w-full text-left text-xs text-surface-500 hover:text-navy-700 transition-colors py-1 rounded-lg px-2 hover:bg-surface-100">
              <Store size={12} className="inline mr-1.5" />门店老板：dealer001 / 123456
            </button>
            <button onClick={() => { setPhone('sales001'); setPassword('123456'); }}
              className="w-full text-left text-xs text-surface-500 hover:text-navy-700 transition-colors py-1 rounded-lg px-2 hover:bg-surface-100">
              <Briefcase size={12} className="inline mr-1.5" />销售：sales001 / 123456
            </button>
            <button onClick={() => { setPhone('sales003'); setPassword('123456'); }}
              className="w-full text-left text-xs text-surface-500 hover:text-navy-700 transition-colors py-1 rounded-lg px-2 hover:bg-surface-100">
              <UserPlus size={12} className="inline mr-1.5" />空白导购：sales003 / 123456
            </button>
            <button onClick={() => { setPhone('installer001'); setPassword('123456'); }}
              className="w-full text-left text-xs text-surface-500 hover:text-navy-700 transition-colors py-1 rounded-lg px-2 hover:bg-surface-100">
              <Truck size={12} className="inline mr-1.5" />安装师傅：installer001 / 123456
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
