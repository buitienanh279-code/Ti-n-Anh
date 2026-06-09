import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Lock, User, ArrowRight, Eye, EyeOff, Bot, ArrowLeft } from 'lucide-react';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onBackToCustomer: () => void;
}

export default function AdminLoginPage({ onLoginSuccess, onBackToCustomer }: AdminLoginPageProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu.');
      return;
    }

    setIsLoading(true);

    // Simulate secure verification
    setTimeout(() => {
      let customUsername = 'admin';
      let customPassword = 'admin123';
      try {
        const settingsStr = localStorage.getItem('remix_settings');
        if (settingsStr) {
          const settings = JSON.parse(settingsStr);
          if (settings.adminUsername) customUsername = settings.adminUsername;
          if (settings.adminPassword) customPassword = settings.adminPassword;
        } else {
          const savedUser = localStorage.getItem('remix_admin_username');
          if (savedUser) customUsername = savedUser;
          const savedPass = localStorage.getItem('remix_admin_password');
          if (savedPass) customPassword = savedPass;
        }
      } catch (e) {
        console.error("Failed to read admin login credentials", e);
      }

      // Allow 'admin' / 'admin123' as default secure credential back-door OR custom values
      if (
        (username.trim() === 'admin' && password === 'admin123') ||
        (username.trim() === customUsername && password === customPassword)
      ) {
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setError('Tài khoản quản trị hoặc mật khẩu không chính xác!');
      }
    }, 1200);
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 shadow-inner relative overflow-y-auto">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#00214705_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[440px] bg-white border border-gray-100 rounded-3xl p-8 shadow-xl"
      >
        {/* Back control */}
        <button
          onClick={onBackToCustomer}
          className="absolute top-6 left-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all z-20 flex items-center gap-1.5 text-xs font-semibold"
          title="Quay lại giao diện khách hàng"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>

        <div className="flex flex-col items-center text-center mb-8 mt-4">
          <div className="w-16 h-16 bg-[#002147]/5 rounded-2xl flex items-center justify-center text-[#002147] mb-4 border border-[#002147]/10 relative">
            <ShieldAlert size={28} />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Hệ thống Quản trị</h2>
          <p className="text-xs text-gray-500 max-w-[280px] mx-auto leading-relaxed mt-1">
            Văn phòng quản lý & cấu hình hệ thống AI tư vấn.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Tài khoản Admin
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tên đăng nhập Admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Mật mã Bảo mật
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu bảo mật"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-12 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#002147] hover:bg-[#001733] text-white py-4 rounded-2xl font-black text-xs tracking-wider uppercase transition-all shadow-lg shadow-[#002147]/10 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? 'ĐANG XÁC THỰC...' : 'ĐĂNG NHẬP hệ thống'}
              {!isLoading && <ArrowRight size={16} />}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-5 border-t border-gray-50 flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <Bot size={12} className="text-primary animate-bounce" />
            Remix Secure Gateways
          </div>
          <p className="text-[10px] text-gray-400 text-center">
            * Nhập tài khoản <code className="bg-gray-100 text-gray-700 px-1 py-0.5 rounded font-mono font-bold">admin</code> và mật khẩu <code className="bg-gray-100 text-gray-700 px-1 py-0.5 rounded font-mono font-bold">admin123</code> để đăng nhập kiểm định nhanh.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
