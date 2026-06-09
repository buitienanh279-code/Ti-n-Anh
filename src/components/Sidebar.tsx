import { 
  MessageSquare, 
  Search, 
  Heart, 
  ShoppingCart, 
  LayoutDashboard, 
  Settings, 
  History,
  Bot,
  Circle,
  LogOut,
  Pin,
  Edit2,
  Trash2,
  X,
  CalendarRange,
  HelpCircle,
  Award,
  Medal,
  Diamond
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { ChatSession } from '../types';
import { getLoyaltyInfo, LoyaltyInfo } from '../utils/loyalty';
import { useLanguage } from '../utils/lang';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sessions: ChatSession[];
  currentSessionId?: string;
  onSelectSession: (id: string) => void;
  onPinSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onEditSession: (id: string, newTitle: string) => void;
  onLogout?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  onCartClick?: () => void;
  cartCount?: number;
  currentUser?: { username: string; email?: string; phone?: string } | null;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  sessions, 
  currentSessionId,
  onSelectSession,
  onPinSession,
  onDeleteSession,
  onEditSession,
  onLogout,
  isOpen,
  onClose,
  onCartClick,
  cartCount = 0,
  currentUser = null
}: SidebarProps) {
  const { lang, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const [loyaltyData, setLoyaltyData] = useState<LoyaltyInfo>(() => {
    return getLoyaltyInfo(currentUser?.username || '');
  });

  useEffect(() => {
    if (currentUser?.username) {
      setLoyaltyData(getLoyaltyInfo(currentUser.username));
    } else {
      setLoyaltyData({ points: 0, tier: 'silver', history: [] });
    }
  }, [currentUser]);

  useEffect(() => {
    const handleLoyaltyChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.username === currentUser?.username) {
        setLoyaltyData(customEvent.detail.updatedInfo);
      }
    };
    window.addEventListener('remix_loyalty_changed', handleLoyaltyChange);
    return () => {
      window.removeEventListener('remix_loyalty_changed', handleLoyaltyChange);
    };
  }, [currentUser]);

  const menuItems = [
    { id: 'consult', label: t('tabConsult'), icon: MessageSquare, tooltip: lang === 'en' ? 'Chat with AI for immediate shopping assistance' : 'Chat với AI để được tư vấn sản phẩm' },
    { id: 'orders', label: t('tabOrders'), icon: CalendarRange, tooltip: lang === 'en' ? 'Track order schedules' : 'Xem lịch trình và đặt lịch hẹn nhận hàng' },
    { id: 'loyalty', label: t('tabLoyalty'), icon: Award, tooltip: lang === 'en' ? 'Check loyalty points and coupons' : 'Hệ thống tích lũy điểm thưởng và quà tặng hội viên' },
    { id: 'dashboard', label: lang === 'en' ? 'Analytics Board' : 'Báo cáo', icon: LayoutDashboard, tooltip: lang === 'en' ? 'View your purchase dashboard stats' : 'Xem thống kê mua hàng của bạn' },
    { id: 'search', label: t('tabSearch'), icon: Search, tooltip: lang === 'en' ? 'Browse tech product lists' : 'Duyệt qua danh mục sản phẩm' },
    { id: 'favorites', label: lang === 'en' ? 'Favorites' : 'Yêu thích', icon: Heart, tooltip: lang === 'en' ? 'Check items saved in favorites' : 'Sản phẩm bạn đã lưu yêu thích' },
    { id: 'cart', label: lang === 'en' ? 'Giỏ hàng' : 'Giỏ hàng', icon: ShoppingCart, tooltip: lang === 'en' ? 'Review and checkout orders' : 'Xem sản phẩm trong giỏ & đặt hàng' },
  ];

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  const handleStartEdit = (session: ChatSession) => {
    setEditingId(session.id);
    setEditValue(session.title);
  };

  const handleSaveEdit = (id: string) => {
    if (editValue.trim()) {
      onEditSession(id, editValue.trim());
    }
    setEditingId(null);
  };

  const points = loyaltyData.points;
  let tierName = 'Bạc';
  let tierColorClass = 'text-slate-500';
  let progressText = '';
  let progressPercent = 0;
  let iconComponent = <Medal className="w-3.5 h-3.5 text-slate-400 shrink-0" />;

  if (points < 500) {
    tierName = 'Bạc';
    tierColorClass = 'text-slate-400';
    const needed = 500 - points;
    progressText = `Còn ${needed} điểm nữa lên Vàng`;
    progressPercent = Math.min(100, (points / 500) * 100);
    iconComponent = <Medal className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  } else if (points < 2000) {
    tierName = 'Vàng';
    tierColorClass = 'text-yellow-500';
    const needed = 2000 - points;
    progressText = `Còn ${needed} điểm nữa lên Kim Cương`;
    progressPercent = Math.min(100, ((points - 500) / 1500) * 100);
    iconComponent = <Medal className="w-3.5 h-3.5 text-yellow-500 shrink-0" />;
  } else {
    tierName = 'Kim Cương';
    tierColorClass = 'text-[#185FA5]'; // navy
    progressText = 'Hạng tối đa';
    progressPercent = 100;
    iconComponent = <Diamond className="w-3.5 h-3.5 text-[#185FA5] shrink-0 fill-[#185FA5]/10" />;
  }

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
        )}
      </AnimatePresence>

      <aside id="tour-sidebar-container" className={`fixed inset-y-0 left-0 w-[280px] shrink-0 bg-white border-r border-[#E2E8F0] z-[70] flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand Logo - Simplified or Hidden if Navbar exists */}
        <div className="p-6 md:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { setActiveTab('consult'); onClose?.(); }} title="Trở về trang trò chuyện chính">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Bot size={20} />
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-900 leading-none">Menu Hỗ Trợ</span>
          </div>
          <button onClick={onClose} className="md:hidden p-2 text-gray-400 hover:text-gray-900" title="Đóng thanh điều hướng">
            <X size={20} />
          </button>
        </div>

        {/* User Card with Loyalty Info */}
        {currentUser && (
          <div className="px-5 pb-5 pt-1 border-b border-[#E2E8F0] mb-4">
            {/* Avatar block */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#185FA5]/10 text-[#185FA5] flex items-center justify-center font-black uppercase text-sm select-none border border-[#185FA5]/20 hover:scale-105 transition-transform shrink-0">
                {currentUser.username ? currentUser.username[0] : 'U'}
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-sm text-gray-900 truncate tracking-tight">{currentUser.username}</p>
                <p className="text-[10px] text-gray-400 font-bold truncate tracking-wide">{currentUser.email || 'Hội viên thân thiết'}</p>
              </div>
            </div>

            {/* Loyalty tier row: font 12px, color by tier */}
            <div className={`flex items-center gap-1.5 text-xs font-bold ${tierColorClass} mb-2`}>
              {iconComponent}
              <span className="truncate">Thành viên {tierName} · {points} điểm</span>
            </div>

            {/* Progress bar and description */}
            <div className="space-y-1">
              <div className="w-full bg-[#E2E8F0] rounded-full overflow-hidden" style={{ height: '4px' }}>
                <div 
                  className="bg-[#185FA5] transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercent}%`, height: '4px' }}
                />
              </div>
              {points < 2000 && (
                <p className="text-[10px] text-gray-400 font-bold tracking-tight">
                  {progressText}
                </p>
              )}
            </div>
          </div>
        )}

      {/* Navigation Menu */}
      <nav className="flex-grow px-3 space-y-1 overflow-y-auto scrollbar-hide">
        <div id="tour-sidebar-nav" className="mb-4">
          <p className="px-3 text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Điều hướng</p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              title={item.tooltip}
              onClick={() => {
                if (item.id === 'cart' && onCartClick) {
                  onCartClick();
                  onClose?.();
                } else {
                  setActiveTab(item.id);
                  onClose?.();
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                activeTab === item.id && item.id !== 'cart'
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.id === 'cart' && cartCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {cartCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* History Section */}
        <div className="mt-6">
          <div className="px-3 mb-3">
            <p 
              onClick={() => { setActiveTab('consult'); onClose?.(); }}
              className="text-[10px] uppercase font-bold text-gray-400 hover:text-primary tracking-wider mb-3 flex items-center gap-2 cursor-pointer transition-colors"
              title={lang === 'en' ? 'Back to AI consult workspace' : 'Quay lại khung tư vấn AI'}
            >
              <History size={12} />
              {lang === 'en' ? 'CONVERSATION HISTORY' : 'Lịch sử hội thoại'}
            </p>
            
            {/* Live Search Bar */}
            <div className="relative group">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'en' ? 'Search conversations...' : 'Tìm nội dung...'}
                className="w-full bg-gray-50 border border-gray-100 rounded-lg py-1.5 pl-8 pr-3 text-[11px] font-medium outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/20 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-0.5 max-h-[300px] overflow-y-auto px-1 custom-scrollbar">
            {filteredSessions.map((session) => (
              <div 
                key={session.id}
                className={`group relative w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all cursor-pointer ${
                  currentSessionId === session.id 
                    ? 'bg-gray-100 text-gray-900 border-l-2 border-primary' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
                onClick={() => onSelectSession(session.id)}
              >
                {editingId === session.id ? (
                  <input 
                    autoFocus
                    className="flex-grow bg-white border border-primary/20 rounded px-1 outline-none font-bold"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleSaveEdit(session.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(session.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <div className="flex-grow truncate flex items-center gap-1.5">
                      {session.isPinned && <Pin size={10} className="text-primary rotate-45 shrink-0" />}
                      <span className={session.isPinned || currentSessionId === session.id ? "font-bold" : "font-medium"}>
                        {session.title}
                      </span>
                    </div>

                    {/* Quick Action Icons */}
                    <div className="hidden group-hover:flex items-center gap-1 shrink-0 animate-in fade-in slide-in-from-right-2 duration-200">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onPinSession(session.id); }}
                        className={`p-1 rounded hover:bg-gray-200 transition-colors ${session.isPinned ? 'text-primary' : 'text-gray-400'}`}
                        title={session.isPinned ? (lang === 'en' ? 'Unpin' : 'Bỏ ghim') : (lang === 'en' ? 'Pin conversation' : 'Ghim hội thoại')}
                      >
                        <Pin size={12} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleStartEdit(session); }}
                        className="p-1 rounded text-gray-400 hover:text-primary hover:bg-gray-200 transition-colors"
                        title={lang === 'en' ? 'Rename' : 'Đổi tên'}
                      >
                        <Edit2 size={12} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                        className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title={lang === 'en' ? 'Delete' : 'Xóa'}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {filteredSessions.length === 0 && searchQuery && (
              <div className="px-3 py-4 text-center">
                <p className="text-[10px] text-gray-400 italic">{lang === 'en' ? 'No conversations matching filters' : 'Không tìm thấy hội thoại nào'}</p>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* AI Status & Bottom Menu */}
      <div className="p-4 border-t-subtle italic">
        <div className="bg-primary/5 rounded-xl p-3 border-subtle mb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative">
              <Bot size={16} className="text-primary" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <span className="text-xs font-bold text-primary leading-none uppercase tracking-tighter">AI Assistant</span>
          </div>
          <p className="text-[10px] text-primary/70 font-medium leading-relaxed tracking-tight">
            {lang === 'en' ? 'Online and ready to advise you 24/7.' : 'Sẵn sàng phản hồi mọi thắc mắc của Bạn 24/7.'}
          </p>
        </div>

        <button 
          onClick={() => {
            setActiveTab('guide');
            onClose?.();
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all mb-2 ${
            activeTab === 'guide'
              ? 'bg-[#185FA5] text-white shadow-md'
              : 'bg-[#185FA5]/5 hover:bg-[#185FA5]/10 text-[#185FA5]'
          }`}
          title={lang === 'en' ? 'Read user application guide & documentation' : 'Xem lại hướng dẫn sử dụng'}
        >
          <HelpCircle size={15} className="ti-help-circle shrink-0" />
          <span>{lang === 'en' ? 'User Manual' : 'Hướng dẫn'}</span>
        </button>

         <button 
          onClick={() => {
            setActiveTab('profile');
            onClose?.();
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
            activeTab === 'profile' ? 'bg-[#185FA5]/10 text-[#185FA5] font-semibold' : 'text-gray-500 hover:bg-gray-100'
          }`}
          title={lang === 'en' ? 'System settings & layout choices' : 'Tùy chỉnh tài khoản và thông báo'}
        >
          <Settings size={18} />
          <span className="font-medium">{lang === 'en' ? 'Settings' : 'Cài đặt'}</span>
        </button>

        {onLogout && (
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors mt-1"
            title={lang === 'en' ? 'Sign out from this current profile session' : 'Đăng xuất khỏi phiên làm việc hiện tại'}
          >
            <LogOut size={18} />
            <span className="font-medium">{lang === 'en' ? 'Sign Out' : 'Đăng xuất'}</span>
          </button>
        )}

        {activeTab !== 'consult' && (
          <button 
            onClick={() => {
              setActiveTab('admin-login');
              onClose?.();
            }}
            className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors mt-1 select-none"
            style={{ fontSize: '12px' }}
            title={lang === 'en' ? 'Login into the Administrative store panel' : 'Đăng nhập trang quản lý cấu hình và kiểm soát hệ thống'}
          >
            <Settings size={12} className="ti-settings shrink-0 text-gray-400" />
            <span className="font-medium">{lang === 'en' ? 'Admin Panel' : 'Quản trị'}</span>
          </button>
        )}
      </div>
    </aside>
    </>
  );
}
