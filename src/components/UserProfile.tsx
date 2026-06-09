import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Calendar, Award, Coins, 
  MessageSquare, Heart, ShoppingCart, LogOut, 
  Clock, Sparkles, ChevronRight, Eye, Trash2,
  Sun, Moon, Check, X, Key, Lock, Shield, Image, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getCurrentUser, updateCurrentUser, logActivity, Account } from '../utils/accounts';
import { Product } from '../types';

interface UserProfileProps {
  onLogout: () => void;
  onGoToConsult: () => void;
  onAddToCart?: (product: Product) => void;
  onViewProductDetail?: (product: Product) => void;
  initialTab?: 'orders' | 'favorites' | 'chats' | 'profile';
}

export default function UserProfile({ 
  onLogout, 
  onGoToConsult, 
  onAddToCart,
  onViewProductDetail,
  initialTab
}: UserProfileProps) {
  const [user, setUser] = useState<Account | null>(null);
  const [activeTab, setActiveTab ] = useState<'orders' | 'favorites' | 'chats' | 'profile'>(initialTab || 'orders');

  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return document.documentElement.classList.contains('dark') || localStorage.getItem('remix_theme_mode') === 'dark';
    } catch {
      return false;
    }
  });

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('remix_theme_mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('remix_theme_mode', 'light');
    }
    window.dispatchEvent(new Event('remix_theme_changed'));
  };

  useEffect(() => {
    const handleThemeSync = () => {
      setIsDark(document.documentElement.classList.contains('dark') || localStorage.getItem('remix_theme_mode') === 'dark');
    };
    window.addEventListener('remix_theme_changed', handleThemeSync);
    return () => window.removeEventListener('remix_theme_changed', handleThemeSync);
  }, []);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [profileName, setProfileName] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [profileBackground, setProfileBackground] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Settings Sub-tab and verification states
  const [settingsSubTab, setSettingsSubTab] = useState<'info' | 'password' | 'logout'>('info');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  // Password change form states
  const [changeOldPassword, setChangeOldPassword] = useState('');
  const [changeNewPassword, setChangeNewPassword] = useState('');
  const [changeConfirmPassword, setChangeConfirmPassword] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('');

  // File input refs
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const backgroundInputRef = React.useRef<HTMLInputElement>(null);

  // Load latest user account data
  const loadUserData = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      setProfileName(currentUser.profile?.name || currentUser.name || '');
      setProfileAvatar(currentUser.profile?.avatar || '');
      setProfileBackground(currentUser.profile?.background || '');
      setProfilePhone(currentUser.phone || '');
      setProfileEmail(currentUser.email || '');
    }
  };

  // File readers & custom settings functions
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMsg('Ảnh tải lên không được vượt quá 8MB!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProfileAvatar(reader.result);
        }
      };
      reader.onerror = () => {
        setErrorMsg('Không thể đọc file ảnh. Vui lòng thử lại!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMsg('Ảnh nền không được vượt quá 8MB!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProfileBackground(reader.result);
        }
      };
      reader.onerror = () => {
        setErrorMsg('Không thể đọc file ảnh. Vui lòng thử lại!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerifyPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');
    if (!verifyPassword) {
      setVerifyError('Vui lòng nhập mật khẩu!');
      return;
    }
    const currentEncoded = btoa(verifyPassword);
    if (currentEncoded === user.password) {
      setVerifyPassword('');
      setIsVerifying(false);
      setIsEditing(true);
    } else {
      setVerifyError('Mật khẩu không đúng!');
    }
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError('');
    setChangePasswordSuccess('');

    if (!changeOldPassword || !changeNewPassword || !changeConfirmPassword) {
      setChangePasswordError('Vui lòng điền đầy đủ tất cả các trường!');
      return;
    }

    if (btoa(changeOldPassword) !== user.password) {
      setChangePasswordError('Mật khẩu hiện tại không chính xác!');
      return;
    }

    if (changeNewPassword !== changeConfirmPassword) {
      setChangePasswordError('Mật khẩu xác nhận không trùng khớp!');
      return;
    }

    if (changeNewPassword.length < 6) {
      setChangePasswordError('Mật khẩu mới phải từ 6 ký tự trở lên!');
      return;
    }

    try {
      updateCurrentUser({
        password: btoa(changeNewPassword)
      });
      setChangePasswordSuccess('Cập nhật mật khẩu mới thành công! 🎉');
      setChangeOldPassword('');
      setChangeNewPassword('');
      setChangeConfirmPassword('');
      
      window.dispatchEvent(new CustomEvent('remix_show_toast', { detail: 'Đổi mật khẩu thành công! 🔐' }));
    } catch (err) {
      setChangePasswordError('Có lỗi xảy ra khi đổi mật khẩu.');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSaving(true);

    if (!profileName.trim()) {
      setErrorMsg('Họ và Tên không được để trống!');
      setIsSaving(false);
      return;
    }

    try {
      updateCurrentUser({
        name: profileName.trim(),
        email: profileEmail.trim(),
        phone: profilePhone.trim(),
        profile: {
          name: profileName.trim(),
          avatar: profileAvatar,
          background: profileBackground
        }
      });
      setSuccessMsg('Đã cập nhật thông tin thành công!');
      setIsEditing(false);
      loadUserData();
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('remix_loyalty_changed'));
      window.dispatchEvent(new CustomEvent('remix_show_toast', { detail: 'Đã cập nhật thông tin thành công! 🎉' }));
    } catch (err) {
      setErrorMsg('Đã có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại!');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    loadUserData();
    
    // Listen for storage changes to keep synced
    window.addEventListener('storage', loadUserData);
    window.addEventListener('remix_loyalty_changed', loadUserData);
    
    return () => {
      window.removeEventListener('storage', loadUserData);
      window.removeEventListener('remix_loyalty_changed', loadUserData);
    };
  }, []);

  if (!user) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-8 bg-gray-50/50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="text-gray-500 font-bold mt-4">Đang tải thông tin tài khoản...</p>
      </div>
    );
  }

  // Determine loyalty level metrics
  const points = user.loyalty?.points || 0;
  let tierName = 'Bạc';
  let tierColor = 'from-slate-400 to-slate-500';
  let tierBadge = 'bg-slate-500/10 text-slate-700 border-slate-500/20';
  let tierProgress = 0;
  let neededPoints = 0;
  let nextTier = '';

  if (points < 500) {
    tierName = 'Bạc';
    tierColor = 'from-slate-400 to-slate-500';
    tierBadge = 'bg-slate-500/10 text-slate-700 border-slate-500/20';
    tierProgress = (points / 500) * 100;
    neededPoints = 500 - points;
    nextTier = 'Vàng';
  } else if (points < 2000) {
    tierName = 'Vàng';
    tierColor = 'from-amber-400 to-amber-500';
    tierBadge = 'bg-amber-500/10 text-amber-700 border-amber-500/20';
    tierProgress = ((points - 500) / 1500) * 100;
    neededPoints = 2000 - points;
    nextTier = 'Kim Cương';
  } else {
    tierName = 'Kim Cương';
    tierColor = 'from-blue-600 to-blue-800';
    tierBadge = 'bg-blue-600/10 text-blue-700 border-blue-600/20';
    tierProgress = 100;
    neededPoints = 0;
    nextTier = '';
  }

  // Filter only chat-related activities from chat history
  const chatLogs = (user.chatHistory || []).filter(
    (log: any) => log.type === 'chat'
  );

  const handleRemoveFavorite = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentFavs = user.favorites || [];
    const updatedFavs = currentFavs.filter((p: any) => p.id !== productId);
    updateCurrentUser({ favorites: updatedFavs });
    loadUserData();
  };

  const handleLogoutClick = () => {
    try {
      logActivity('logout', {});
    } catch (e) {
      console.error(e);
    }
    // Logout routine
    onLogout();
  };

  return (
    <div className="flex-grow overflow-y-auto bg-[#FCFDFE]">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-10 font-sans">
        
        {/* Profile Card Header Grid */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-3xs flex flex-col md:flex-row gap-8 justify-between items-stretch relative">
          
          {/* Theme Mode Toggle Button */}
          <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-200 transition-all cursor-pointer active:scale-95 shadow-3xs"
              title="Chuyển đổi giao diện Sáng/Tối"
            >
              {isDark ? (
                <>
                  <Sun size={13} className="text-amber-400 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Chế độ tối (Bật)</span>
                </>
              ) : (
                <>
                  <Moon size={13} className="text-indigo-600 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">Chế độ sáng</span>
                </>
              )}
            </button>
          </div>

          {/* User Basic Profile Info */}
          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left flex-grow">
            <div 
              style={{ 
                backgroundColor: (user.profile?.background && !user.profile.background.startsWith('http') && !user.profile.background.startsWith('data:')) ? user.profile.background : undefined,
                backgroundImage: (user.profile?.background && (user.profile.background.startsWith('http') || user.profile.background.startsWith('data:'))) ? `url(${user.profile.background})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              className="w-20 h-20 rounded-full bg-[#185FA5]/10 text-[#185FA5] flex items-center justify-center font-black uppercase text-3xl border border-[#185FA5]/20 shrink-0 overflow-hidden relative"
            >
              {user.profile?.avatar ? (
                user.profile.avatar.startsWith('http') || user.profile.avatar.startsWith('data:') ? (
                  <img src={user.profile.avatar} alt="Avatar" className="w-full h-full object-cover animate-fade-in" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-4xl">{user.profile.avatar}</span>
                )
              ) : (
                user.name ? user.name[0] : (user.email ? user.email[0] : (user.contact ? user.contact[0] : 'U'))
              )}
            </div>
            
            <div className="space-y-3.5 min-w-0">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight flex items-center justify-center sm:justify-start gap-2.5">
                  {user.profile?.name || user.name || user.contact || 'Khách hàng'}
                  <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border tracking-wider ${tierBadge}`}>
                    {tierName}
                  </span>
                </h1>
                <p className="text-[11px] font-mono text-gray-400 mt-1 flex items-center justify-center sm:justify-start gap-1 font-bold">
                  <Clock size={11} />
                  Tham gia từ: {user.createdAt || 'Mới đăng ký'}
                </p>
              </div>

              <div className="flex flex-col gap-1.5 text-xs text-gray-600 font-semibold">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-500">
                  <Mail size={14} className="text-gray-400 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-500">
                    <Phone size={14} className="text-gray-400 shrink-0" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Loyalty Status Visa */}
          <div className="md:w-80 bg-linear-to-tr from-gray-900 to-slate-800 rounded-2xl p-5 text-white flex flex-col justify-between shadow-lg relative overflow-hidden shrink-0 border border-slate-700/50">
            {/* Absolute ambient lights inside block */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[9px] uppercase tracking-widest font-black text-sky-300">THẺ HỘI VIÊN</p>
                  <p className="text-lg font-black tracking-tight">{tierName} Member</p>
                </div>
                <Award size={24} className="text-yellow-400" />
              </div>
              
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-2xl font-black font-mono tracking-tight">{points.toLocaleString()}</span>
                <span className="text-[10px] uppercase font-black text-slate-400">điểm loyalty</span>
              </div>
            </div>

            <div className="mt-6 relative z-10 space-y-2">
              <div className="w-full bg-slate-700 rounded-full overflow-hidden" style={{ height: '5px' }}>
                <div 
                  className="bg-sky-400 transition-all duration-500 ease-out" 
                  style={{ width: `${Math.min(100, Math.max(5, tierProgress))}%`, height: '5px' }}
                />
              </div>
              
              {neededPoints > 0 ? (
                <p className="text-[9px] text-slate-300 font-bold block text-left">
                  Tích lũy thêm <strong className="text-sky-300 font-mono text-[10px]">{neededPoints} điểm</strong> để nâng hạng <strong className="text-white">{nextTier}</strong>.
                </p>
              ) : (
                <p className="text-[9px] text-sky-400 font-bold block text-left">
                  ⭐ Bạn đang ở hạng thành viên vinh dự cao nhất!
                </p>
              )}
            </div>
          </div>

        </div>

        {/* Tab Interface Area */}
        <div className="bg-white border border-gray-100 rounded-3xl shadow-3xs overflow-hidden flex flex-col min-h-[450px]">
          
          {/* Main Navigation Sub-tabs */}
          <div className="px-6 border-b border-gray-100 flex gap-6 overflow-x-auto">
            {(['orders', 'favorites', 'chats', 'profile'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-xs font-black uppercase tracking-wider relative shrink-0 transition-all cursor-pointer ${
                  activeTab === tab 
                    ? 'text-[#185FA5]' 
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {tab === 'orders' && '📦 Đơn hàng của tôi'}
                  {tab === 'favorites' && '❤️ Danh sách yêu thích'}
                  {tab === 'chats' && '💬 Lịch sử tư vấn'}
                  {tab === 'profile' && '⚙️ Thiết lập Hồ sơ'}
                </span>
                
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeUserTabIndicator" 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#185FA5] rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Details Content Container */}
          <div className="p-6 bg-gray-50/20 flex-grow">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                
                {/* TAB 1: ORDERS HISTORY */}
                {activeTab === 'orders' && (
                  <div className="space-y-4">
                    {(!user.orders || user.orders.length === 0) ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center bg-white border border-dashed border-gray-200 rounded-2xl p-6">
                        <ShoppingCart size={36} className="text-gray-300 mb-3" />
                        <h4 className="text-xs font-black text-gray-900 uppercase">Chưa có đơn hàng nào</h4>
                        <p className="text-[11px] text-gray-400 font-semibold max-w-xs mt-1">Đơn hàng của bạn sẽ được hiển thị đầy đủ tại đây ngay sau khi bạn đặt mua.</p>
                        <button 
                          onClick={onGoToConsult}
                          className="mt-4 px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-all"
                        >
                          Khám phá tư vấn AI
                        </button>
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-3xs overflow-hidden overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs font-semibold text-gray-700 min-w-[500px]">
                          <thead className="bg-gray-50 border-b border-gray-100 text-[9px] uppercase font-black text-gray-400 tracking-wider">
                            <tr>
                              <th className="px-4 py-3">Mã đơn</th>
                              <th className="px-4 py-3">Ngày mua</th>
                              <th className="px-4 py-3">Sản phẩm</th>
                              <th className="px-4 py-3 text-right">Tổng thanh toán</th>
                              <th className="px-4 py-3">Chi nhánh</th>
                              <th className="px-4 py-3 text-center">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 font-medium">
                            {user.orders.map((order: any, idx: number) => (
                              <tr key={order.id || idx} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 py-3 font-mono font-extrabold text-gray-950">
                                  #{order.id}
                                </td>
                                <td className="px-4 py-3 text-gray-400 text-[11px] font-mono">
                                  {order.date}
                                </td>
                                <td className="px-4 py-3 font-extrabold text-gray-900 max-w-[200px] truncate">
                                  {order.productName}
                                </td>
                                <td className="px-4 py-3 text-right font-black text-[#0C447C] font-mono">
                                  {order.price?.toLocaleString()}đ
                                </td>
                                <td className="px-4 py-3 text-gray-500 max-w-[120px] truncate">
                                  {order.branch || 'Chi nhánh Quận 1'}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`inline-block text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider ${
                                    order.status === 'success' || order.status === 'completed' || order.status === 'delivered'
                                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                                  }`}>
                                    {order.status === 'processing' ? 'Chờ xử lý' : 
                                     order.status === 'shipping' ? 'Đang giao' : 'Hoàn thành'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: FAVORITES */}
                {activeTab === 'favorites' && (
                  <div className="space-y-4">
                    {(!user.favorites || user.favorites.length === 0) ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center bg-white border border-dashed border-gray-200 rounded-2xl p-6">
                        <Heart size={36} className="text-gray-300 mb-3" />
                        <h4 className="text-xs font-black text-gray-900 uppercase">Danh sách trống</h4>
                        <p className="text-[11px] text-gray-400 font-semibold max-w-xs mt-1">Đánh dấu những sản phẩm công nghệ bạn yêu thích trong cuộc trò chuyện cùng Trợ lý AI để lưu tại đây.</p>
                        <button 
                          onClick={onGoToConsult}
                          className="mt-4 px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-all"
                        >
                          Bắt đầu trò chuyện
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {user.favorites.map((product: any) => (
                          <div 
                            key={product.id}
                            className="bg-white border border-gray-100 rounded-2xl p-4 shadow-3xs flex flex-col justify-between hover:border-gray-255 transition-all"
                          >
                            <div className="flex gap-3">
                              {product.imageUrl && (
                                <img 
                                  src={product.imageUrl} 
                                  alt={product.name} 
                                  className="w-12 h-12 rounded-lg object-cover border shrink-0 bg-gray-50"
                                  referrerPolicy="no-referrer"
                                />
                              )}
                              <div className="text-left min-w-0">
                                <span className="text-[8px] bg-[#185FA5]/10 text-[#185FA5] px-1.5 py-0.5 rounded font-black font-semibold uppercase tracking-wider">
                                  {product.category || 'Công nghệ'}
                                </span>
                                <h4 className="text-xs font-extrabold text-gray-800 mt-1 truncate" title={product.name}>
                                  {product.name}
                                </h4>
                                <span className="text-xs font-black text-[#185FA5] block mt-1 font-mono">
                                  {product.price?.toLocaleString()}đ
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 mt-4 pt-3 border-t border-dashed border-gray-100">
                              <button
                                onClick={() => onViewProductDetail?.(product)}
                                className="flex-grow flex items-center justify-center gap-1 bg-gray-50 hover:bg-gray-100 text-gray-600 text-[10px] font-bold py-2 rounded-xl transition-colors cursor-pointer"
                                title="Xem chi tiết"
                              >
                                <Eye size={12} />
                                Chi tiết
                              </button>
                              
                              {onAddToCart && (
                                <button
                                  onClick={() => onAddToCart(product)}
                                  className="flex-grow flex items-center justify-center gap-1 bg-[#185FA5]/10 hover:bg-[#185FA5]/15 text-[#185FA5] text-[10px] font-bold py-2 rounded-xl transition-colors cursor-pointer"
                                  title="Thêm vào giỏ"
                                >
                                  <ShoppingCart size={12} />
                                  Mua ngay
                                </button>
                              )}

                              <button
                                onClick={(e) => handleRemoveFavorite(product.id, e)}
                                className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors cursor-pointer"
                                title="Xóa khỏi yêu thích"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: CHAT HISTORY */}
                {activeTab === 'chats' && (
                  <div className="space-y-4">
                    {chatLogs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center bg-white border border-dashed border-gray-200 rounded-2xl p-6">
                        <MessageSquare size={36} className="text-gray-300 mb-3" />
                        <h4 className="text-xs font-black text-gray-900 uppercase">Lịch sử tư vấn trống</h4>
                        <p className="text-[11px] text-gray-400 font-semibold max-w-xs mt-1">Các đoạn hội thoại trao đổi thông tin tư vấn kỹ thuật cùng Remi AI sẽ được hệ thống lưu trữ tại đây.</p>
                        <button 
                          onClick={onGoToConsult}
                          className="mt-4 px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-all"
                        >
                          Khởi tạo phiên tư vấn mới
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {chatLogs.map((log: any, idxIndex: number) => {
                          const userMsg = log.data?.msg || log.data?.promptText || '';
                          const aiMsg = log.data?.reply || log.data?.response || '';
                          const timeStr = log.time || log.timestamp || '';

                          return (
                            <div key={idxIndex} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-3xs space-y-4 text-left">
                              {userMsg && (
                                <div className="flex flex-col items-end">
                                  <span className="text-[9px] text-gray-400 mb-0.5 font-bold uppercase tracking-wider">Khách hàng</span>
                                  <div className="max-w-[85%] rounded-2xl px-4 py-2 bg-[#0C447C] text-white text-xs font-medium self-end break-words">
                                    {userMsg}
                                  </div>
                                  {timeStr && <span className="text-[10px] text-gray-400 mt-1 font-mono">{timeStr}</span>}
                                </div>
                              )}

                              {aiMsg && (
                                <div className="flex flex-col items-start pt-1.5 border-t border-dashed border-gray-100">
                                  <span className="text-[9px] text-gray-400 mb-0.5 font-bold uppercase tracking-wider">Trợ lý AI (Remi)</span>
                                  <div className="max-w-[85%] rounded-2xl px-4 py-2 bg-gray-100 text-gray-800 text-xs font-medium self-start break-words whitespace-pre-wrap">
                                    {aiMsg}
                                  </div>
                                  {timeStr && <span className="text-[10px] text-gray-400 mt-1 font-mono">{timeStr}</span>}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: SETUP PROFILE / CAI DAT */}
                {activeTab === 'profile' && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-3xs text-left">
                    <div className="border-b border-gray-100 pb-5 mb-6">
                      <h3 className="text-base font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Shield className="text-[#185FA5]" size={18} />
                        ⚙️ Cài đặt hệ thống
                      </h3>
                      <p className="text-[11px] text-gray-400 font-semibold mt-1">Cấu hình hồ sơ, đổi mật khẩu bảo mật và quản lý phiên đăng nhập tại Remix AI.</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">
                      {/* SIDEBAR CAI DAT */}
                      <div className="w-full md:w-56 shrink-0 flex flex-col gap-1 border-r border-slate-100 md:pr-4">
                        <button
                          type="button"
                          onClick={() => {
                            setSettingsSubTab('info');
                            setIsVerifying(false);
                            setIsEditing(false);
                            setErrorMsg('');
                            setSuccessMsg('');
                          }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-black uppercase tracking-wider transition-all select-none cursor-pointer ${
                            settingsSubTab === 'info'
                              ? 'bg-[#185FA5]/10 text-[#185FA5]'
                              : 'text-gray-500 hover:bg-slate-50'
                          }`}
                        >
                          <User size={16} />
                          Thông tin cá nhân
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSettingsSubTab('password');
                            setChangePasswordError('');
                            setChangePasswordSuccess('');
                          }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-black uppercase tracking-wider transition-all select-none cursor-pointer ${
                            settingsSubTab === 'password'
                              ? 'bg-[#185FA5]/10 text-[#185FA5]'
                              : 'text-gray-500 hover:bg-slate-50'
                          }`}
                        >
                          <Lock size={16} />
                          Đổi mật khẩu
                        </button>

                        <button
                          type="button"
                          onClick={() => setSettingsSubTab('logout')}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-black uppercase tracking-wider transition-all select-none cursor-pointer ${
                            settingsSubTab === 'logout'
                              ? 'bg-rose-50 text-rose-600'
                              : 'text-gray-500 hover:bg-slate-50 hover:text-rose-500'
                          }`}
                        >
                          <LogOut size={16} />
                          Đăng xuất
                        </button>
                      </div>

                      {/* MAIN CONTENT AREA */}
                      <div className="flex-grow min-w-0">
                        
                        {/* TAB 1: THONG TIN CA NHAN */}
                        {settingsSubTab === 'info' && (
                          <div className="space-y-6">
                            
                            {/* Read-only / Default Profile Info view */}
                            {!isVerifying && !isEditing && (
                              <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-gray-100">
                                  <div 
                                    style={{ 
                                      backgroundColor: (profileBackground && !profileBackground.startsWith('http') && !profileBackground.startsWith('data:')) ? profileBackground : undefined,
                                      backgroundImage: (profileBackground && (profileBackground.startsWith('http') || profileBackground.startsWith('data:'))) ? `url(${profileBackground})` : undefined,
                                      backgroundSize: 'cover',
                                      backgroundPosition: 'center'
                                    }}
                                    className="w-[72px] h-[72px] rounded-full bg-[#185FA5]/10 text-[#185FA5] flex items-center justify-center font-black uppercase text-3xl border-2 border-[#185FA5]/20 shrink-0 overflow-hidden relative"
                                  >
                                    {profileAvatar ? (
                                      profileAvatar.startsWith('http') || profileAvatar.startsWith('data:') ? (
                                        <img src={profileAvatar} alt="Avatar" className="w-full h-full object-cover" />
                                      ) : (
                                        <span className="text-4xl">{profileAvatar}</span>
                                      )
                                    ) : (
                                      profileName ? profileName[0] : 'U'
                                    )}
                                  </div>
                                  <div className="text-center sm:text-left">
                                    <h4 className="text-base font-black text-gray-800 tracking-tight">{profileName || user.name || 'Người dùng'}</h4>
                                    <p className="text-xs text-gray-400 font-bold mt-1 tracking-wider">{profileEmail || user.email || 'Chưa thiết lập'}</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Tên hiển thị</span>
                                    <span className="text-xs font-bold text-gray-800">{profileName || user.name || 'Người dùng'}</span>
                                  </div>

                                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Email / Số điện thoại</span>
                                    <span className="text-xs font-bold text-gray-800">
                                      {profileEmail || user.email || '—'} {profilePhone ? `· ${profilePhone}` : ''}
                                    </span>
                                  </div>

                                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 md:col-span-2 flex items-center justify-between">
                                    <div>
                                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Hình nền chat</span>
                                      <span className="text-xs font-semibold text-gray-800">
                                        {profileBackground ? 'Đã thiết lập ảnh / màu nền tùy chọn' : 'Màu trắng sạch mặc định'}
                                      </span>
                                    </div>
                                    {profileBackground && (
                                      <div 
                                        style={{ 
                                          backgroundColor: !profileBackground.startsWith('data:') && !profileBackground.startsWith('http') ? profileBackground : undefined,
                                          backgroundImage: profileBackground.startsWith('data:') || profileBackground.startsWith('http') ? `url(${profileBackground})` : undefined,
                                          backgroundSize: 'cover'
                                        }}
                                        className="w-12 h-8 rounded border border-slate-200"
                                      />
                                    )}
                                  </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsVerifying(true);
                                      setVerifyPassword('');
                                      setVerifyError('');
                                    }}
                                    className="px-5 py-2.5 bg-[#185FA5] hover:bg-[#0C447C] text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all hover:shadow-md"
                                  >
                                    Chỉnh sửa thông tin
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Password Verification Dialog */}
                            {isVerifying && (
                              <form onSubmit={handleVerifyPasswordSubmit} className="max-w-md mx-auto bg-slate-50 border border-slate-200/60 p-6 rounded-2xl space-y-4">
                                <div className="flex items-center gap-2 mb-1">
                                  <Lock className="text-slate-600" size={16} />
                                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Xác minh danh tính</h4>
                                </div>
                                <p className="text-[11px] text-gray-400 font-semibold leading-relaxed">
                                  Nhập mật khẩu hiện tại để tiếp tục chỉnh sửa thông tin hồ sơ của bạn:
                                </p>
                                
                                <div className="space-y-1.5">
                                  <input
                                    type="password"
                                    placeholder="Nhập mật khẩu tài khoản..."
                                    value={verifyPassword}
                                    onChange={(e) => {
                                      setVerifyPassword(e.target.value);
                                      setVerifyError('');
                                    }}
                                    required
                                    className="w-full bg-white border border-slate-200 focus:border-[#185FA5] rounded-xl py-2.5 px-3 text-xs font-semibold text-gray-950 outline-none transition-all"
                                  />
                                  {verifyError && (
                                    <p className="text-xs font-bold text-rose-500 mt-1 flex items-center gap-1">
                                      ⚠️ {verifyError}
                                    </p>
                                  )}
                                </div>

                                <div className="flex gap-2 pt-2 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsVerifying(false);
                                      setVerifyPassword('');
                                      setVerifyError('');
                                    }}
                                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                  >
                                    Hủy
                                  </button>
                                  <button
                                    type="submit"
                                    className="px-5 py-2 bg-[#185FA5] hover:bg-[#0C447C] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                  >
                                    Xác nhận
                                  </button>
                                </div>
                              </form>
                            )}

                            {/* Editable Profile Form */}
                            {isEditing && (
                              <form onSubmit={handleSaveProfile} className="space-y-5">
                                {successMsg && (
                                  <div className="bg-emerald-50 text-emerald-700 p-3.5 rounded-xl text-xs font-bold border border-emerald-100">
                                    ✨ {successMsg}
                                  </div>
                                )}
                                {errorMsg && (
                                  <div className="bg-rose-50 text-rose-700 p-3.5 rounded-xl text-xs font-bold border border-rose-100">
                                    ❌ {errorMsg}
                                  </div>
                                )}

                                <div className="grid grid-cols-1 gap-5">
                                  {/* Field: Display Name */}
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên hiển thị (Bắt buộc)</label>
                                    <input
                                      type="text"
                                      value={profileName}
                                      onChange={(e) => setProfileName(e.target.value)}
                                      required
                                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#185FA5] rounded-xl py-2.5 px-3 text-xs font-semibold text-gray-900 outline-none"
                                    />
                                  </div>

                                  {/* Field: Email & SĐT */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email liên hệ</label>
                                      <input
                                        type="email"
                                        value={profileEmail}
                                        onChange={(e) => setProfileEmail(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#185FA5] rounded-xl py-2.5 px-3 text-xs font-semibold text-gray-900 outline-none"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Số điện thoại</label>
                                      <input
                                        type="tel"
                                        value={profilePhone}
                                        onChange={(e) => setProfilePhone(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#185FA5] rounded-xl py-2.5 px-3 text-xs font-semibold text-gray-900 outline-none"
                                      />
                                    </div>
                                  </div>

                                  {/* Field: Avatar Selector & File Upload */}
                                  <div className="space-y-3 pt-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chọn ảnh đại diện (Avatar)</label>
                                    
                                    {/* Grid of Default Emojis with pastel backgrounds */}
                                    <div className="grid grid-cols-6 gap-2 max-w-sm">
                                      {[
                                        { char: '🤖', bg: '#E0F2FE' },
                                        { char: '👤', bg: '#F1F5F9' },
                                        { char: '🦊', bg: '#FFEDD5' },
                                        { char: '🐱', bg: '#FEF3C7' },
                                        { char: '🐶', bg: '#F3E8FF' },
                                        { char: '🦁', bg: '#FEF9C3' },
                                        { char: '🐯', bg: '#FFE4E6' },
                                        { char: '🦅', bg: '#E0F2FE' },
                                        { char: '🌟', bg: '#FEF9C3' },
                                        { char: '💎', bg: '#ECFDF5' },
                                        { char: '🔥', bg: '#FEE2E2' },
                                        { char: '⚡', bg: '#FFF7ED' }
                                      ].map((item, idX) => (
                                        <button
                                          key={idX}
                                          type="button"
                                          onClick={() => setProfileAvatar(item.char)}
                                          style={{ backgroundColor: item.bg }}
                                          className={`w-[56px] h-[56px] rounded-full text-2xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 border-2 ${
                                            profileAvatar === item.char ? 'border-[#0C447C] shadow-md' : 'border-transparent'
                                          }`}
                                        >
                                          {item.char}
                                        </button>
                                      ))}
                                    </div>

                                    {/* Upload custom avatar file */}
                                    <div className="space-y-2">
                                      <button
                                        type="button"
                                        onClick={() => avatarInputRef.current?.click()}
                                        className="w-full max-w-md border-dashed border-2 border-slate-200 hover:border-slate-350 py-4 px-4 rounded-xl text-center text-xs font-bold text-slate-500 cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-colors bg-white hover:bg-slate-50"
                                      >
                                        <Upload size={16} />
                                        <span>📁 Chọn ảnh từ máy / điện thoại</span>
                                      </button>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        capture="user"
                                        ref={avatarInputRef}
                                        onChange={handleAvatarFileChange}
                                        className="hidden"
                                      />
                                      {profileAvatar && (profileAvatar.startsWith('data:') || profileAvatar.startsWith('http')) && (
                                        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl block max-w-sm border border-slate-100">
                                          <img src={profileAvatar} className="w-16 h-16 rounded-full object-cover border border-slate-200 shrink-0" alt="Uploaded Avatar" />
                                          <div className="flex-grow">
                                            <span className="text-[10px] text-gray-400 font-bold block">Hình ảnh tùy chỉnh</span>
                                            <button
                                              type="button"
                                              onClick={() => setProfileAvatar('👤')}
                                              className="text-[10px] font-bold text-red-500 hover:text-red-700 mt-1 border-0 bg-transparent flex items-center gap-0.5 cursor-pointer leading-none"
                                            >
                                              <X size={10} /> Xóa ảnh
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Field: Chat Background */}
                                  <div className="space-y-3 pt-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chọn hình nền Chat</label>
                                    
                                    {/* 6 default wallpapers */}
                                    <div className="grid grid-cols-3 gap-2.5 max-w-md">
                                      {[
                                        { name: 'Trắng sạch', value: '' },
                                        { name: 'Navy Gradient', value: 'linear-gradient(135deg, #0f172a, #1e3a8a)' },
                                        { name: 'Xám nhạt', value: '#F8FAFC' },
                                        { name: 'Xanh mint', value: '#F0FDF4' },
                                        { name: 'Hồng nhạt', value: '#FDF2F8' },
                                        { name: 'Tím nhạt', value: '#FAF5FF' }
                                      ].map((option, idxOpt) => (
                                        <button
                                          key={idxOpt}
                                          type="button"
                                          onClick={() => setProfileBackground(option.value)}
                                          style={{ 
                                            background: option.value ? option.value : '#ffffff',
                                            border: option.value ? 'none' : '1px solid #e2e8f0' 
                                          }}
                                          className={`w-[100px] h-[70px] rounded-[10px] hover:shadow transition-all relative cursor-pointer active:scale-95 ${
                                            profileBackground === option.value ? 'ring-2 ring-sky-500 ring-offset-1 scale-102' : ''
                                          }`}
                                        >
                                          <span className="absolute bottom-1 right-2 text-[9px] font-bold text-gray-400 bg-white/70 px-1 py-0.5 rounded backdrop-blur-[1px]">
                                            {option.name}
                                          </span>
                                        </button>
                                      ))}
                                    </div>

                                    {/* Custom file background upload */}
                                    <div className="space-y-2">
                                      <button
                                        type="button"
                                        onClick={() => backgroundInputRef.current?.click()}
                                        className="w-full max-w-md border-dashed border-2 border-slate-200 hover:border-slate-350 py-3 rounded-xl text-center text-xs font-bold text-slate-500 cursor-pointer flex items-center justify-center gap-1 bg-white hover:bg-slate-50"
                                      >
                                        📁 Chọn hình nền từ máy
                                      </button>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        ref={backgroundInputRef}
                                        onChange={handleBackgroundFileChange}
                                        className="hidden"
                                      />
                                      {profileBackground && (profileBackground.startsWith('data:') || profileBackground.startsWith('http')) && (
                                        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl block max-w-sm border border-slate-100">
                                          <div 
                                            style={{ backgroundImage: `url(${profileBackground})`, backgroundSize: 'cover' }}
                                            className="w-[100px] h-[70px] rounded-[10px] border border-slate-205 shadow-3xs shrink-0" 
                                          />
                                          <button
                                            type="button"
                                            onClick={() => setProfileBackground('')}
                                            className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer border-0 bg-transparent flex items-center gap-0.5"
                                          >
                                            <X size={10} /> Xóa nền
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                </div>

                                <div className="border-t border-slate-100 pt-4 flex justify-end gap-3">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsEditing(false);
                                      loadUserData();
                                      setErrorMsg('');
                                      setSuccessMsg('');
                                    }}
                                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
                                  >
                                    Hủy
                                  </button>
                                  <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2.5 bg-[#185FA5] hover:bg-[#0C447C] text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer disabled:opacity-50 transition-colors"
                                  >
                                    {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                                  </button>
                                </div>
                              </form>
                            )}

                          </div>
                        )}

                        {/* TAB 2: DOI MAT KHAU */}
                        {settingsSubTab === 'password' && (
                          <form onSubmit={handleChangePasswordSubmit} className="space-y-4 max-w-lg">
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100">
                              Đổi mật khẩu tài khoản
                            </h4>
                            
                            {changePasswordSuccess && (
                              <div className="bg-emerald-50 text-emerald-700 p-3.5 rounded-xl text-xs font-semibold border border-emerald-100">
                                {changePasswordSuccess}
                              </div>
                            )}

                            {changePasswordError && (
                              <div className="bg-rose-50 text-rose-700 p-3.5 rounded-xl text-xs font-semibold border border-rose-100">
                                ⚠️ {changePasswordError}
                              </div>
                            )}

                            <div className="space-y-3">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Mật khẩu hiện tại</label>
                                <input
                                  type="password"
                                  value={changeOldPassword}
                                  onChange={(e) => setChangeOldPassword(e.target.value)}
                                  placeholder="Nhập mật khẩu hiện tại..."
                                  required
                                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#185FA5] rounded-xl py-2.5 px-3 text-xs font-semibold text-gray-900 outline-none"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Mật khẩu mới</label>
                                <input
                                  type="password"
                                  value={changeNewPassword}
                                  onChange={(e) => setChangeNewPassword(e.target.value)}
                                  placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)..."
                                  required
                                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#185FA5] rounded-xl py-2.5 px-3 text-xs font-semibold text-gray-900 outline-none"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Nhập lại mật khẩu mới</label>
                                <input
                                  type="password"
                                  value={changeConfirmPassword}
                                  onChange={(e) => setChangeConfirmPassword(e.target.value)}
                                  placeholder="Nhập lại mật khẩu mới..."
                                  required
                                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#185FA5] rounded-xl py-2.5 px-3 text-xs font-semibold text-gray-900 outline-none"
                                />
                              </div>
                            </div>

                            <div className="pt-3 flex justify-end">
                              <button
                                type="submit"
                                className="px-6 py-2.5 bg-[#185FA5] hover:bg-[#0C447C] text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
                              >
                                Cập nhật mật khẩu
                              </button>
                            </div>
                          </form>
                        )}

                        {/* TAB 3: DANG XUAT */}
                        {settingsSubTab === 'logout' && (
                          <div className="space-y-4 max-w-md">
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100">
                              Đăng xuất tài khoản
                            </h4>
                            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                              Khi đăng xuất, Bạn sẽ phải nhập lại thông tin định danh và tài khoản ở lần truy cập tiếp theo. Bạn có chắc chắn muốn đăng xuất không?
                            </p>
                            <div className="pt-2 flex gap-3 text-xs font-bold">
                              <button
                                type="button"
                                onClick={() => setSettingsSubTab('info')}
                                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer transition-colors"
                              >
                                Quay lại
                              </button>
                              <button
                                type="button"
                                onClick={handleLogoutClick}
                                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl cursor-pointer transition-colors"
                              >
                                Xác nhận đăng xuất
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* User Account Quick Operations */}
          <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                onClick={toggleTheme}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-3xs active:scale-95 border border-slate-200 dark:border-slate-700"
              >
                {isDark ? (
                  <>
                    <Sun size={14} className="text-amber-400" />
                    <span>Giao diện: Tối (Bật)</span>
                  </>
                ) : (
                  <>
                    <Moon size={14} className="text-indigo-600" />
                    <span>Giao diện: Sáng (Bật)</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-gray-400 font-semibold tracking-tight text-center sm:text-left">
                Bảo mật tài khoản và tùy chọn giao diện tối luôn được ưu tiên tại Remix AI.
              </p>
            </div>
            <button
              onClick={handleLogoutClick}
              className="w-full sm:w-auto px-5 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200/50 hover:border-red-200 text-red-600 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-3xs active:scale-95"
            >
              <LogOut size={14} />
              Đăng xuất tài khoản
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
