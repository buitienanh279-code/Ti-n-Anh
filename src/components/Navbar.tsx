import React, { useState, useEffect } from 'react';
import { Bot, ShoppingCart, CalendarRange, User, Search, Bell, Menu, X, MapPin, ChevronDown, Award, LogOut, Sun, Moon } from 'lucide-react';
import { useLanguage } from '../utils/lang';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
  isScrolled?: boolean;
  onMenuClick?: () => void;
  onCartClick?: () => void;
  cartCount?: number;
}

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onLogout, 
  isScrolled = false,
  onMenuClick,
  onCartClick,
  cartCount = 0
}: NavbarProps) {
  const { lang, setLang } = useLanguage();
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [isOpenBranchDropdown, setIsOpenBranchDropdown] = useState(false);

  const [storeNameState, setStoreNameState] = useState('TechShop REMIX');
  const [storeLogoState, setStoreLogoState] = useState('');

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

  const loadStoreSettings = () => {
    try {
      const settingsStr = localStorage.getItem('remix_settings');
      if (settingsStr) {
        const settings = JSON.parse(settingsStr);
        if (settings.storeName) setStoreNameState(settings.storeName);
        if (settings.storeLogo) setStoreLogoState(settings.storeLogo);
      } else {
        const savedName = localStorage.getItem('remix_store_name');
        if (savedName) setStoreNameState(savedName);
        
        const savedLogo = localStorage.getItem('remix_store_logo');
        if (savedLogo) setStoreLogoState(savedLogo);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadBranches = () => {
    try {
      const saved = localStorage.getItem('remix_branches');
      const list = saved ? JSON.parse(saved) : [
        { id: 'Q1', name: 'Showroom REMIX - Quận 1', address: '85 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh', phone: '028.3838.9999', hours: '08:00 - 22:00', status: 'active', manager: 'Nguyễn Anh Tuấn', managerPhone: '0901234567', email: 'q1@remix.vn', hasDelivery: true, deliveryFee: 20000, deliveryArea: 'Quận 1, Quận 3, Quận 4, Quận 5, Quận 10' },
        { id: 'Q3', name: 'Showroom REMIX - Quận 3', address: '12 Tràng Thi, Hoàn Kiếm, Hà Nội', phone: '024.3939.8888', hours: '08:30 - 21:30', status: 'active', manager: 'Trần Quốc Bảo', managerPhone: '0912345678', email: 'q3@remix.vn', hasDelivery: true, deliveryFee: 15000, deliveryArea: 'Hoàn Kiếm, Ba Đình, Đống Đa, Hai Bà Trưng' },
        { id: 'Q7', name: 'Showroom REMIX - Quận 7', address: '145 Nguyễn Văn Linh, Hải Châu, Đà Nẵng', phone: '0236.366.7777', hours: '08:30 - 21:30', status: 'active', manager: 'Phan Minh Trí', managerPhone: '0923456789', email: 'q7@remix.vn', hasDelivery: false, deliveryFee: 0, deliveryArea: 'Hải Châu, Thanh Khê' }
      ];
      const activeList = list.filter((b: any) => b.status === 'active');
      setBranches(activeList);

      const savedSelectedId = localStorage.getItem('remix_selected_branch_id');
      if (savedSelectedId && activeList.some((b: any) => b.id === savedSelectedId)) {
        setSelectedBranchId(savedSelectedId);
      } else if (activeList.length > 0) {
        setSelectedBranchId(activeList[0].id);
        localStorage.setItem('remix_selected_branch_id', activeList[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadBranches();
    loadStoreSettings();
    
    // Listen for branch change events or focus to keep synced
    window.addEventListener('focus', loadBranches);
    window.addEventListener('storage', loadBranches);
    window.addEventListener('storage', loadStoreSettings);
    window.addEventListener('remix_branch_changed', loadBranches);
    return () => {
      window.removeEventListener('focus', loadBranches);
      window.removeEventListener('storage', loadBranches);
      window.removeEventListener('storage', loadStoreSettings);
      window.removeEventListener('remix_branch_changed', loadBranches);
    };
  }, []);

  return (
    <nav className="top-bar w-full">
      {/* Unified TOP BAR Layout */}
      <div className="flex items-center justify-between w-full h-full">
        {/* Left: Menu Burger + Logo */}
        <div className="flex items-center gap-1">
          <button
            onClick={onMenuClick}
            className="p-1.5 text-[#64748B] hover:text-[#185FA5] dark:text-slate-400 dark:hover:text-amber-400 rounded-xl active:scale-95 transition-all cursor-pointer mr-0.5"
            title="Menu Lịch sử & Cấu hình"
          >
            <Menu size={20} className="shrink-0" />
          </button>
          <div 
            className="flex items-center gap-1.5 cursor-pointer select-none active:scale-95 transition-all"
            onClick={onMenuClick}
            title="Bấm để mở Lịch sử & Cấu hình"
          >
            {storeLogoState ? (
              <div className="w-[24px] h-[24px] rounded-[6px] overflow-hidden border border-gray-100 flex items-center justify-center bg-gray-50 shrink-0">
                <img src={storeLogoState} alt={storeNameState} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
            ) : (
              <div className="w-[24px] h-[24px] bg-[#185FA5] rounded-[6px] flex items-center justify-center text-white shrink-0 shadow-sm">
                <span className="text-[10px] font-black leading-none">AI</span>
              </div>
            )}
            <span className="font-black text-[13px] md:text-[15px] tracking-tight text-[#1A202C] dark:text-white leading-none uppercase select-none">
              REMIX.AI
            </span>
          </div>
        </div>

        {/* Middle: badge chi nhánh pill 12px xanh nhạt (truncate 12 ký tự) */}
        <div className="relative">
          <button
            onClick={() => setIsOpenBranchDropdown(!isOpenBranchDropdown)}
            className="flex items-center gap-1.5 px-3 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-100/60 rounded-full text-[12px] font-bold text-[#185FA5] transition-all cursor-pointer select-none max-w-[150px]"
            title="Đổi chi nhánh"
          >
            <MapPin size={11} className="text-[#185FA5] shrink-0" />
            <span className="truncate">
              {(() => {
                const bName = branches.find(b => b.id === selectedBranchId)?.name.replace('Showroom REMIX - ', '') || 'Chi nhánh';
                return bName.length > 12 ? bName.substring(0, 11) + '…' : bName;
              })()}
            </span>
            <ChevronDown size={11} className="text-[#185FA5]/70 shrink-0" />
          </button>

          {isOpenBranchDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsOpenBranchDropdown(false)} 
              />
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-white border border-gray-150 rounded-2xl shadow-xl py-1.5 z-50">
                <div className="px-3 py-1 border-b border-gray-150">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Chọn showroom</span>
                </div>
                {branches.map((b) => {
                  const isSelected = b.id === selectedBranchId;
                  return (
                    <button
                      key={b.id}
                      onClick={() => {
                        setSelectedBranchId(b.id);
                        localStorage.setItem('remix_selected_branch_id', b.id);
                        setIsOpenBranchDropdown(false);
                        window.dispatchEvent(new Event('remix_branch_changed'));
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex flex-col gap-0.5 border-0 bg-transparent cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                    >
                      <span className={`text-[12.5px] font-bold ${isSelected ? 'text-[#185FA5]' : 'text-gray-800'}`}>
                        {b.name}
                      </span>
                      <span className="text-[9.5px] text-gray-400 font-medium truncate w-[220px]">
                        📍 {b.address}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Right: icon bell 20px #64748B & theme toggle & language switcher */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onLogout && (
            <button 
              onClick={onLogout}
              className="flex md:hidden items-center gap-1 py-1.5 px-3 bg-[#FCEBEB] border border-[#F7C1C1] rounded-full text-xs font-medium text-[#791F1F] active:scale-90 transition-all cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut size={13} className="shrink-0" />
              <span>Đăng xuất</span>
            </button>
          )}

          {/* Language Switcher */}
          <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-full p-0.5 border border-gray-200 dark:border-slate-700 select-none">
            <button
              onClick={() => setLang('vi')}
              className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide transition-all cursor-pointer border-0 outline-none ${
                lang === 'vi'
                  ? 'bg-white dark:bg-slate-700 text-[#185FA5] dark:text-amber-400 shadow-xs ring-1 ring-black/5'
                  : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-400'
              }`}
              title="Tiếng Việt"
            >
              VI
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide transition-all cursor-pointer border-0 outline-none ${
                lang === 'en'
                  ? 'bg-white dark:bg-slate-700 text-[#185FA5] dark:text-amber-400 shadow-xs ring-1 ring-black/5'
                  : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-400'
              }`}
              title="English"
            >
              EN
            </button>
          </div>

          <button 
            className="p-1.5 text-[#64748B] hover:text-[#185FA5] rounded-xl relative cursor-pointer active:scale-95 transition-all"
            title="Thông báo"
          >
            <Bell size={20} className="shrink-0" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button 
            onClick={toggleTheme}
            className="p-1.5 text-[#64748B] hover:text-[#185FA5] dark:text-slate-400 dark:hover:text-amber-400 rounded-xl relative cursor-pointer active:scale-95 transition-all"
            title="Chuyển đổi giao diện Sáng/Tối"
          >
            {isDark ? (
              <Sun size={20} className="shrink-0 text-amber-500" />
            ) : (
              <Moon size={20} className="shrink-0 text-indigo-600" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
