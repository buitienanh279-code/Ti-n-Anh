import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, User, Mail, Phone, Lock, Unlock, Search, Trash2, 
  Eye, Check, X, ShieldAlert, MessageSquare, ShoppingBag, 
  Coins, Download, AlertTriangle, HelpCircle, EyeOff, Tag, Calendar, Clock
} from 'lucide-react';
import { getAccounts, saveAccounts, updateAccountData, Account, formatDateTime } from '../utils/accounts';

interface AdminCustomersViewProps {
  onSwitchToOverview?: () => void;
}

export default function AdminCustomersView({ onSwitchToOverview }: AdminCustomersViewProps) {
  const [customers, setCustomers] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'locked' | 'warned'>('all');
  
  // Selected customer for modal
  const [selectedCustomer, setSelectedCustomer] = useState<Account | null>(null);
  const [modalActiveTab, setModalActiveTab] = useState<'orders' | 'chats' | 'violations'>('orders');

  // Toggle visible passwords (stores account IDs)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Load and filter user-only accounts
  const loadCustomers = () => {
    const allAccounts = getAccounts();
    const usersOnly = allAccounts.filter(acc => acc.role === 'user');
    setCustomers(usersOnly);
  };

  useEffect(() => {
    loadCustomers();
    // Support listening to changes in other panels
    const handleStorage = () => loadCustomers();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const togglePasswordVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Quick action: Unlock Account
  const handleUnlockAccount = (id: string, name: string) => {
    if (window.confirm(`Xác nhận mở khóa cho tài khoản ${name}?`)) {
      updateAccountData(id, { isLocked: false, warnings: 0 });
      loadCustomers();
      // Update selected customer state in modal if active
      if (selectedCustomer && selectedCustomer.id === id) {
        setSelectedCustomer(prev => prev ? { ...prev, isLocked: false, warnings: 0 } : null);
      }
    }
  };

  // Quick action: Reset Warnings
  const handleResetWarnings = (id: string, name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Đặt lại số lần cảnh báo về 0 cho tài khoản ${name}?`)) {
      updateAccountData(id, { warnings: 0 });
      loadCustomers();
      if (selectedCustomer && selectedCustomer.id === id) {
        setSelectedCustomer(prev => prev ? { ...prev, warnings: 0 } : null);
      }
    }
  };

  // Quick action: Lock Account
  const handleLockAccount = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn KHÓA tài khoản ${name}? Người dùng sẽ không thể đăng nhập hoặc chat.`)) {
      updateAccountData(id, { isLocked: true });
      loadCustomers();
      if (selectedCustomer && selectedCustomer.id === id) {
        setSelectedCustomer(prev => prev ? { ...prev, isLocked: true } : null);
      }
    }
  };

  // Quick action: Delete Account (Confirm and delete)
  const handleDeleteAccount = (id: string, name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm(`HÀNH ĐỘNG KHÔNG THỂ KHÔI PHỤC: Bạn có thực sự muốn XÓA VĨNH VIỄN tài khoản ${name}?`)) {
      const allAccounts = getAccounts();
      const updated = allAccounts.filter(acc => acc.id !== id);
      saveAccounts(updated);
      loadCustomers();
      if (selectedCustomer && selectedCustomer.id === id) {
        setSelectedCustomer(null);
      }
    }
  };

  // CSV Export trigger
  const exportCustomersCSV = () => {
    const accounts = getAccounts().filter(a => a.role === 'user');

    const headers = [
      'ID', 'Contact', 'Tên', 'Mật khẩu(base64)',
      'Ngày tạo', 'Lần cuối login', 'Số đơn', 'Tổng chi(VND)',
      'Trạng thái', 'Cảnh báo'
    ];

    const rows = accounts.map(a => [
      a.id, 
      a.contact || a.phone || a.email,
      a.name || a.profile?.name || '',
      a.password || '',
      a.createdAt || '',
      a.lastLogin || 'Chưa đăng nhập',
      (a.orders || []).length,
      (a.orders || []).reduce((s, o) => s + (o.price || o.total || 0), 0),
      a.isLocked ? 'Bị khóa' : 'Hoạt động',
      `${a.warnings || 0}/5`
    ]);

    const csv = [headers, ...rows]
      .map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers_${Date.now()}.csv`;
    a.click();
  };

  // Processed values for table and stats
  const totalUsers = customers.length;
  const lockedUsers = customers.filter(c => c.isLocked || (c.warnings || 0) >= 5).length;
  const activeUsers = totalUsers - lockedUsers;

  // Registered Today count
  const todayStr = formatDateTime(new Date()).split(' ')[0]; // "DD/MM/YYYY"
  const registeredToday = customers.filter(c => c.createdAt && c.createdAt.startsWith(todayStr)).length;

  // Total Revenue across all user accounts
  const totalRevenue = customers.reduce((sum, c) => {
    return sum + (c.orders || []).reduce((s, o) => s + (o.price || o.total || 0), 0);
  }, 0);

  // Warned accounts count
  const warnedUsers = customers.filter(c => (c.warnings || 0) > 0 && !c.isLocked).length;

  // Filter clients-side based on search term and filters
  const filteredCustomers = customers.filter(c => {
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      c.id.toLowerCase().includes(query) ||
      (c.name || '').toLowerCase().includes(query) ||
      (c.email || '').toLowerCase().includes(query) ||
      (c.phone || '').toLowerCase().includes(query) ||
      (c.contact || '').toLowerCase().includes(query);

    const isLocked = c.isLocked || (c.warnings || 0) >= 5;
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'locked' ? isLocked :
      statusFilter === 'active' ? !isLocked :
      statusFilter === 'warned' ? ((c.warnings || 0) > 0 && !isLocked) : true;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-grow flex flex-col h-full bg-[#FCFDFE] relative overflow-hidden font-sans text-gray-800">
      
      {/* Header section */}
      <div className="p-4 md:p-6 border-b border-gray-150/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white shadow-xs shrink-0">
        <div>
          <h1 className="text-lg font-black text-[#0C447C] uppercase tracking-wider flex items-center gap-2">
            <Users size={20} className="text-[#185FA5]" />
            Giao diện Quản lý Khách hàng
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-1">
            Đọc dữ liệu tài khoản khách hàng thực tế trực tiếp từ kho lưu trữ <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">remix_all_accounts</code>.
          </p>
        </div>
        
        <button
          onClick={exportCustomersCSV}
          className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-750 text-white text-[11px] font-black uppercase tracking-wider rounded-xl border-none shadow-md cursor-pointer transition-transform active:scale-95 shrink-0"
        >
          <Download size={14} />
          Xuất danh sách khách hàng (CSV)
        </button>
      </div>

      {/* QUICK STATS (4 cards) */}
      <div className="p-4 md:px-6 md:pt-6 pb-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 bg-gray-50/30">
        
        {/* Card 1: Tổng tài khoản */}
        <div className="bg-white p-4 rounded-2xl border border-gray-150/70 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Tổng tài khoản</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{totalUsers}</h3>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-semibold">
            <span>Chi tiết:</span>
            <span className="text-gray-700">
              Hoạt động <strong className="text-emerald-600">{activeUsers}</strong> · Bị khóa <strong className="text-rose-600">{lockedUsers}</strong>
            </span>
          </div>
        </div>

        {/* Card 2: Đăng ký hôm nay */}
        <div className="bg-white p-4 rounded-2xl border border-gray-150/70 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Đăng ký hôm nay</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">+{registeredToday}</h3>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-semibold">
            <span>Ngày kiểm tra:</span>
            <span className="font-bold text-gray-700 font-mono">{todayStr}</span>
          </div>
        </div>

        {/* Card 3: Tổng doanh thu từ khách */}
        <div className="bg-white p-4 rounded-2xl border border-gray-150/70 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Doanh thu từ khách</p>
            <h3 className="text-2xl font-black text-[#0c447c] mt-1">{totalRevenue.toLocaleString()}đ</h3>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-semibold">
            <span>Tích lũy từ tất cả đơn hàng</span>
          </div>
        </div>

        {/* Card 4: Tài khoản bị cảnh báo */}
        <div className="bg-white p-4 rounded-2xl border border-gray-150/70 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Tài khoản bị cảnh báo</p>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-2xl font-black text-gray-950">{warnedUsers + (lockedUsers > 0 ? lockedUsers : 0)}</h3>
              {(warnedUsers > 0 || lockedUsers > 0) && (
                <span className="bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-black uppercase px-2 py-0.5 rounded-full animate-bounce">
                  Cần chú ý
                </span>
              )}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-semibold">
            <span> warnings &gt; 0 lần:</span>
            <span className="font-extrabold text-rose-600">{warnedUsers} người</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="p-4 md:px-6 bg-white border-b border-gray-150/60 flex flex-col sm:flex-row items-center gap-3 justify-between shrink-0">
        
        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo SĐT, email, tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-gray-800 placeholder:text-gray-450 outline-none focus:bg-white focus:border-[#185FA5] transition-all"
          />
        </div>

        {/* Filter select list */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto select-none">
          <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider shrink-0">Lọc dữ liệu:</span>
          <div className="flex bg-gray-100 p-0.5 rounded-xl border border-gray-200 shrink-0">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'active', label: 'Hoạt động' },
              { id: 'locked', label: 'Bị khóa' },
              { id: 'warned', label: 'Có cảnh báo' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border-none transition-all cursor-pointer ${
                  statusFilter === tab.id 
                    ? 'bg-white text-gray-900 shadow-xs' 
                    : 'text-gray-500 hover:text-gray-800 bg-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CUSTOMER DIRECTORY TABLE */}
      <div className="flex-grow overflow-auto p-4 md:p-6 bg-gray-50/50">
        <div className="bg-white rounded-2xl border border-gray-150/75 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-semibold text-gray-700 min-w-[900px]">
              <thead className="bg-slate-50 border-b border-gray-150/60 text-[9px] uppercase font-black text-gray-400 tracking-wider">
                <tr>
                  <th className="px-4 py-3.5 text-center w-14">STT</th>
                  <th className="px-4 py-3.5">Tài khoản</th>
                  <th className="px-4 py-3.5 max-w-[150px]">Mật khẩu (mã hóa)</th>
                  <th className="px-4 py-3.5 w-36">Ngày tạo</th>
                  <th className="px-4 py-3.5 w-40">Lần cuối login</th>
                  <th className="px-4 py-3.5 text-center w-28">Cảnh báo</th>
                  <th className="px-4 py-3.5 text-center w-32">Trạng thái</th>
                  <th className="px-4 py-3.5 text-center w-36">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-gray-400 italic">
                      Không tìm thấy khách hàng nào thỏa mãn điều kiện tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((user, idx) => {
                    const isLocked = user.isLocked || (user.warnings || 0) >= 5;
                    const isPassVisible = !!visiblePasswords[user.id];
                    const numOrders = (user.orders || []).length;
                    const totalSpend = (user.orders || []).reduce((s, o) => s + (o.price || o.total || 0), 0);

                    // Warning conditions
                    const warnCount = user.warnings || 0;
                    let warningBadge = (
                      <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100">
                        {warnCount}/5
                      </span>
                    );
                    if (isLocked) {
                      warningBadge = (
                        <span className="px-2.5 py-0.5 rounded-[6px] text-[10px] font-black bg-red-850 text-white border border-red-950 uppercase tracking-tight">
                          KHÓA
                        </span>
                      );
                    } else if (warnCount >= 4) {
                      warningBadge = (
                        <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-150">
                          {warnCount}/5
                        </span>
                      );
                    } else if (warnCount > 0) {
                      warningBadge = (
                        <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-150">
                          {warnCount}/5
                        </span>
                      );
                    }

                    return (
                      <tr key={user.id} className="hover:bg-gray-50/40 transition-all">
                        
                        {/* STT */}
                        <td className="px-4 py-4 text-center text-gray-400 font-mono font-bold">
                          {idx + 1}
                        </td>

                        {/* Tài khoản */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black uppercase text-xs shrink-0 select-none border border-primary/20">
                              {(user.name || user.email || 'K').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[13px] font-extrabold text-gray-900 truncate">
                                {user.contact || user.phone || user.email}
                              </span>
                              {(user.name || user.profile?.name) && (
                                <span className="text-[11px] text-gray-400 mt-0.5 truncate font-semibold">
                                  {user.name || user.profile?.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Mật khẩu (mã hóa) */}
                        <td className="px-4 py-4 max-w-[150px]">
                          <div className="flex items-center gap-1.5 justify-start">
                            {isPassVisible ? (
                              <span className="font-mono text-[11px] text-gray-500 break-all select-all leading-tight max-w-[100px]" style={{ fontFamily: 'Courier New, monospace' }}>
                                {user.password || '—'}
                              </span>
                            ) : (
                              <span className="text-gray-400 tracking-widest text-[8px] font-mono select-none">
                                ••••••••
                              </span>
                            )}
                            <button
                              onClick={(e) => togglePasswordVisibility(user.id, e)}
                              className="p-1 hover:bg-gray-150 rounded text-gray-400 hover:text-gray-700 bg-transparent border-none cursor-pointer transition-colors shrink-0"
                              title="Toggle mã hóa base64"
                            >
                              {isPassVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                          </div>
                        </td>

                        {/* Ngày tạo */}
                        <td className="px-4 py-4 text-gray-500 text-[11px] font-semibold whitespace-nowrap">
                          {user.createdAt || '20/05/2026 14:30'}
                        </td>

                        {/* Lần cuối login */}
                        <td className="px-4 py-4 text-[11px] font-semibold whitespace-nowrap">
                          {user.lastLogin ? (
                            <span className="text-gray-550 font-mono">{user.lastLogin}</span>
                          ) : (
                            <span className="text-gray-300 italic font-medium">Chưa đăng nhập</span>
                          )}
                        </td>

                        {/* Cảnh báo badge */}
                        <td className="px-4 py-4 text-center">
                          {warningBadge}
                        </td>

                        {/* Trạng thái badge */}
                        <td className="px-4 py-4 text-center">
                          {isLocked ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-red-50 text-red-600 border border-red-150 tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                              Bị khóa
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-150 tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Hoạt động
                            </span>
                          )}
                        </td>

                        {/* Hành động */}
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-1 select-none">
                            <button
                              onClick={() => {
                                setSelectedCustomer(user);
                                setModalActiveTab('orders');
                              }}
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 text-gray-600 hover:text-black rounded-lg border-none cursor-pointer transition-all"
                              title="Xem chi tiết khách hàng"
                            >
                              <Eye size={14} />
                            </button>
                            
                            {isLocked && (
                              <button
                                onClick={() => handleUnlockAccount(user.id, user.name || user.email)}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 rounded-lg border-none cursor-pointer transition-all"
                                title="Mở khóa tài khoản"
                              >
                                <Unlock size={14} />
                              </button>
                            )}

                            <button
                              onClick={(e) => handleResetWarnings(user.id, user.name || user.email, e)}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 hover:text-amber-700 rounded-lg border-none cursor-pointer transition-all"
                              title="Đặt lại cảnh báo"
                            >
                              <AlertTriangle size={14} />
                            </button>

                            <button
                              onClick={(e) => handleDeleteAccount(user.id, user.name || user.email, e)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-700 rounded-lg border-none cursor-pointer transition-all"
                              title="Xóa tài khoản"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CUSTOMER DETAIL MODAL */}
      <AnimatePresence>
        {selectedCustomer && (() => {
          const isLocked = selectedCustomer.isLocked || (selectedCustomer.warnings || 0) >= 5;
          const totalSpent = (selectedCustomer.orders || []).reduce((s, o) => s + (o.price || o.total || 0), 0);
          const currentLoyalty = selectedCustomer.loyalty || { points: 0, tier: 'silver', history: [] };
          const warnCount = selectedCustomer.warnings || 0;

          // Format details view password toggle
          const isDetailPassVisible = !!visiblePasswords[`modal_${selectedCustomer.id}`];

          // Set display badges for Loyalty Tiers
          let loyaltyBadge = '🥈 Bạc';
          if (currentLoyalty.tier === 'gold') loyaltyBadge = '🥇 Vàng';
          else if (currentLoyalty.tier === 'diamond') loyaltyBadge = '💎 Kim cương';
          else if (currentLoyalty.tier === 'platinum') loyaltyBadge = '🏆 Bạch kim';
          else if (currentLoyalty.tier === 'bronze') loyaltyBadge = '🥉 Đồng';

          return (
            <div className="fixed inset-0 z-[100] flex justify-end font-sans text-gray-800">
              
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedCustomer(null)}
                className="absolute inset-0 bg-black/40 backdrop-blur-xs"
              />

              {/* Slider Modal Panel */}
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col overflow-hidden z-10 border-l border-gray-200"
              >
                {/* Modal Title / Top header */}
                <div className="p-5 md:p-6 border-b border-gray-150 flex justify-between items-center bg-[#F8FAFC]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-700 flex items-center justify-center font-black text-sm uppercase">
                      {(selectedCustomer.name || selectedCustomer.email || 'U').charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase text-gray-900 tracking-wider">
                        Thông tin chi tiết Khách hàng
                      </h3>
                      <span className="text-[11px] font-semibold text-gray-400 mt-0.5 block">
                        ID: {selectedCustomer.id}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="p-1.5 hover:bg-gray-200/80 rounded-full text-gray-400 hover:text-gray-700 border-none bg-transparent cursor-pointer transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* MODAL MAIN CONTENT */}
                <div className="flex-grow overflow-y-auto p-5 md:p-6 space-y-6">

                  {/* PHẦN 1 — THÔNG TIN CƠ BẢN TABLE */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#185FA5] flex items-center gap-1">
                      <User size={13} />
                      Thông tin cơ bản tài khoản
                    </h4>
                    
                    <div className="border border-gray-150 rounded-xl overflow-hidden shadow-2xs">
                      <table className="w-full text-xs text-left border-collapse bg-white">
                        <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                          
                          <tr>
                            <td className="px-4 py-2.5 bg-[#F8FAFC] text-gray-400 w-1/3">ID tài khoản</td>
                            <td className="px-4 py-2.5 font-mono text-gray-800 font-bold">{selectedCustomer.id}</td>
                          </tr>

                          <tr>
                            <td className="px-4 py-2.5 bg-[#F8FAFC] text-gray-400">SĐT / Email</td>
                            <td className="px-4 py-2.5 text-gray-900 font-extrabold">{selectedCustomer.contact || selectedCustomer.phone || selectedCustomer.email}</td>
                          </tr>

                          <tr>
                            <td className="px-4 py-2.5 bg-[#F8FAFC] text-gray-400">Tên hiển thị</td>
                            <td className="px-4 py-2.5 text-gray-800">{selectedCustomer.name || selectedCustomer.profile?.name || <span className="text-gray-300 italic">Chưa điền</span>}</td>
                          </tr>

                          <tr>
                            <td className="px-4 py-2.5 bg-[#F8FAFC] text-gray-400">Mật khẩu</td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <span className={isDetailPassVisible ? 'font-mono text-gray-600' : 'text-gray-300 tracking-widest text-[8px]'}>
                                  {isDetailPassVisible ? (selectedCustomer.password || '') : '••••••••'}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => togglePasswordVisibility(`modal_${selectedCustomer.id}`, e)}
                                  className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700 bg-transparent border-none cursor-pointer"
                                >
                                  {isDetailPassVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                                </button>
                                <span className="text-[10px] text-gray-400 italic font-mono font-medium">(Base64)</span>
                              </div>
                            </td>
                          </tr>

                          <tr>
                            <td className="px-4 py-2.5 bg-[#F8FAFC] text-gray-400">Ngày tạo TK</td>
                            <td className="px-4 py-2.5 text-gray-600">{selectedCustomer.createdAt || '20/05/2026 14:30'}</td>
                          </tr>

                          <tr>
                            <td className="px-4 py-2.5 bg-[#F8FAFC] text-gray-400">Lần cuối login</td>
                            <td className="px-4 py-2.5 text-gray-600 font-mono">
                              {selectedCustomer.lastLogin || <span className="text-gray-300 italic font-medium">Chưa đăng nhập</span>}
                            </td>
                          </tr>

                          <tr>
                            <td className="px-4 py-2.5 bg-[#F8FAFC] text-gray-400">Số cảnh báo</td>
                            <td className="px-4 py-2.5">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                                warnCount >= 4 ? 'bg-red-50 text-red-650 font-bold border border-red-150' :
                                warnCount > 0 ? 'bg-amber-50 text-amber-600 font-bold border border-amber-100' :
                                'bg-emerald-50 text-emerald-600 font-bold border border-emerald-100'
                              }`}>
                                {warnCount}/5 lần
                              </span>
                            </td>
                          </tr>

                          <tr>
                            <td className="px-4 py-2.5 bg-[#F8FAFC] text-gray-400">Trạng thái</td>
                            <td className="px-4 py-2.5">
                              {isLocked ? (
                                <span className="text-red-600 font-black flex items-center gap-1">
                                  ● Bị khóa
                                </span>
                              ) : (
                                <span className="text-emerald-600 font-black flex items-center gap-1">
                                  ● Hoạt động
                                </span>
                              )}
                            </td>
                          </tr>

                          <tr>
                            <td className="px-4 py-2.5 bg-[#F8FAFC] text-gray-400">Hạng loyalty</td>
                            <td className="px-4 py-2.5 font-extrabold text-[#185FA5]">
                              {loyaltyBadge} - {currentLoyalty.points || 0} điểm
                            </td>
                          </tr>

                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* PHẦN 2 — INTERNAL ACCORDION TABS */}
                  <div className="space-y-2">
                    {/* Tab triggers */}
                    <div className="flex border-b border-gray-150 gap-2 select-none shrink-0">
                      {[
                        { id: 'orders', label: `Đơn hàng (${(selectedCustomer.orders || []).length})` },
                        { id: 'chats', label: `Lịch sử chat` },
                        { id: 'violations', label: `Vi phạm (${warnCount})` }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setModalActiveTab(tab.id as any)}
                          className={`pb-2.5 text-xs font-black uppercase tracking-wider relative border-none bg-transparent cursor-pointer transition-all ${
                            modalActiveTab === tab.id 
                              ? 'text-[#185FA5] font-black' 
                              : 'text-gray-400 hover:text-gray-700 font-semibold'
                          }`}
                        >
                          {tab.label}
                          {modalActiveTab === tab.id && (
                            <motion.div 
                              layoutId="modalActiveTabLine"
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#185FA5] rounded-full"
                            />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Tab Panel contents */}
                    <div className="pt-2 min-h-[220px]">
                      
                      {/* Subtab "Đơn hàng" */}
                      {modalActiveTab === 'orders' && (() => {
                        const ordersList = selectedCustomer.orders || [];
                        return (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] text-gray-450 font-bold uppercase tracking-wider">Lịch sử đặt hàng</span>
                              <span className="text-xs text-gray-900 font-extrabold">
                                Tổng chi tiêu: <strong className="text-sm font-black text-[#0c447c] ml-1">{totalSpent.toLocaleString()}đ</strong>
                              </span>
                            </div>

                            {ordersList.length === 0 ? (
                              <div className="text-center py-8 text-gray-400 font-semibold italic bg-slate-50/50 border border-dashed border-gray-200 rounded-xl">
                                Khách hàng chưa phát sinh đơn hàng nào.
                              </div>
                            ) : (
                              <div className="border border-gray-100 rounded-xl overflow-hidden shadow-3xs max-w-full">
                                <table className="w-full text-xs text-left border-collapse bg-white">
                                  <thead className="bg-[#F8FAFC] border-b border-gray-150/60 text-[9px] uppercase font-black text-gray-400 tracking-wider">
                                    <tr>
                                      <th className="px-3 py-2 w-28">Mã đơn</th>
                                      <th className="px-3 py-2 w-28">Ngày</th>
                                      <th className="px-3 py-2">Sản phẩm</th>
                                      <th className="px-3 py-2 text-right w-28">Tổng tiền</th>
                                      <th className="px-3 py-2 text-center w-28">Trạng thái</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100 text-gray-600 font-semibold">
                                    {ordersList.map((ord: any) => {
                                      const ordTotal = ord.price || ord.total || 0;
                                      const pName = ord.productName || (ord.items && ord.items.map((it: any) => it.name).join(', ')) || 'Sản phẩm công nghệ';
                                      
                                      // Status styling
                                      let statusStyle = 'bg-gray-50 text-gray-500 border border-gray-150';
                                      let statusLabel = ord.status || 'Chờ';
                                      if (ord.status === 'delivered') {
                                        statusStyle = 'bg-emerald-50 text-emerald-600 border border-emerald-100';
                                        statusLabel = 'Đã giao';
                                      } else if (ord.status === 'cancelled') {
                                        statusStyle = 'bg-rose-50 text-rose-600 border border-rose-150';
                                        statusLabel = 'Đã hủy';
                                      } else if (ord.status === 'shipping') {
                                        statusStyle = 'bg-indigo-50 text-indigo-650 border border-indigo-100';
                                        statusLabel = 'Đang giao';
                                      } else if (ord.status === 'confirmed') {
                                        statusStyle = 'bg-blue-50 text-blue-600 border border-blue-100';
                                        statusLabel = 'Đã duyệt';
                                      } else if (ord.status === 'processing') {
                                        statusStyle = 'bg-amber-50 text-amber-600 border border-amber-100';
                                        statusLabel = 'Chờ xử lý';
                                      }

                                      return (
                                        <tr key={ord.id} className="hover:bg-slate-50/50">
                                          <td className="px-3 py-2.5 font-mono text-gray-950 font-bold">{ord.id}</td>
                                          <td className="px-3 py-2.5 text-gray-500 font-mono text-[11px]">{ord.date || '—'}</td>
                                          <td className="px-3 py-2.5 text-gray-800 truncate max-w-[150px]" title={pName}>{pName}</td>
                                          <td className="px-3 py-2.5 text-right font-black text-[#0c447c]">{ordTotal.toLocaleString()}đ</td>
                                          <td className="px-3 py-2.5 text-center">
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${statusStyle}`}>
                                              {statusLabel}
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Subtab "Lịch sử chat" */}
                      {modalActiveTab === 'chats' && (() => {
                        const chatData = selectedCustomer.chatHistory || [];
                        const onlyChats = chatData.filter((log: any) => log.type === 'chat' || log.type === 'query');

                        return (
                          <div className="space-y-3">
                            <span className="text-[11px] text-gray-450 font-bold uppercase tracking-wider block">Dòng thời gian hội thoại (Trợ lý AI)</span>
                            
                            {onlyChats.length === 0 ? (
                              <div className="text-center py-8 text-gray-400 font-semibold italic bg-slate-50/50 border border-dashed border-gray-200 rounded-xl">
                                Chưa lưu trữ cuộc hội thoại nào rực rỡ với Trợ lý AI.
                              </div>
                            ) : (
                              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                                {onlyChats.map((sess: any, sIdx: number) => {
                                  const promptText = sess.data?.msg || sess.data?.promptText || sess.msg || '';
                                  const responseText = sess.data?.reply || sess.data?.response || sess.reply || '';
                                  const time = sess.time || sess.timestamp || '';
                                  const violates = sess.data?.violation || sess.violation || false;

                                  return (
                                    <div key={sIdx} className={`p-3 rounded-xl border leading-relaxed space-y-2 bg-white transition-all ${
                                      violates 
                                        ? 'border-red-200 bg-red-50/10 shadow-xs ring-1 ring-red-200/50' 
                                        : 'border-gray-150'
                                    }`}>
                                      <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold font-mono">
                                        <span>Cuộc chat #{sIdx + 1}</span>
                                        <span>{time}</span>
                                      </div>

                                      <div className="space-y-1.5 text-xs text-slate-800">
                                        <div className="flex gap-2">
                                          <span className="font-extrabold text-[#185FA5] uppercase shrink-0">Hỏi:</span>
                                          <p className="font-semibold break-words flex-grow">{promptText}</p>
                                          {violates && (
                                            <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider h-fit shrink-0 select-none">
                                              VI PHẠM
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex gap-2 pt-1 border-t border-dashed border-gray-100">
                                          <span className="font-extrabold text-teal-600 uppercase shrink-0">AI:</span>
                                          <p className="text-gray-600 leading-relaxed break-words flex-grow">{responseText || <span className="text-gray-300 italic">AI không phản hồi</span>}</p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Subtab "Vi phạm" */}
                      {modalActiveTab === 'violations' && (() => {
                        // Gather violation instances from logs if any, or general mock based on warnings index.
                        // Let's inspect chat logs to see how many were flagged, and let the list render logically
                        const chatData = selectedCustomer.chatHistory || [];
                        const violationLogs = chatData.filter((log: any) => log.data?.violation || log.violation);

                        return (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] text-gray-425 font-bold uppercase tracking-wider">Danh sách các lần cảnh báo vi phạm</span>
                              {warnCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleResetWarnings(selectedCustomer.id, selectedCustomer.name || selectedCustomer.email)}
                                  className="text-xs bg-red-100 hover:bg-red-200 text-red-700 font-extrabold px-2.5 py-1.5 border-none rounded-lg cursor-pointer transition-colors"
                                >
                                  Xóa lịch sử vi phạm
                                </button>
                              )}
                            </div>

                            {warnCount === 0 ? (
                              <div className="text-center py-8 text-emerald-600 font-bold bg-emerald-50/30 border border-emerald-100 rounded-xl">
                                🎉 Khách hàng có lý lịch trong sạch, chưa ghi nhận hành vi vi phạm nào!
                              </div>
                            ) : (
                              <div className="space-y-2.5">
                                <div className="border border-gray-150 rounded-xl overflow-hidden max-w-full">
                                  <table className="w-full text-xs text-left border-collapse bg-white font-semibold text-gray-700">
                                    <thead className="bg-[#FFF8F8] border-b border-red-100 text-[9px] uppercase font-black text-red-650 tracking-wider">
                                      <tr>
                                        <th className="px-3 py-2 w-16 text-center">STT</th>
                                        <th className="px-3 py-2">Thời gian</th>
                                        <th className="px-3 py-2">Nội dung câu nói vi phạm</th>
                                        <th className="px-3 py-2 text-center w-24">Lần thứ</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-gray-600">
                                      {violationLogs.length > 0 ? (
                                        violationLogs.map((log: any, index: number) => {
                                          const text = log.data?.msg || log.data?.promptText || log.msg || 'Sử dụng ngôn từ không chuẩn mực';
                                          const time = log.time || log.timestamp || 'Mới đây';
                                          return (
                                            <tr key={index} className="hover:bg-red-50/10">
                                              <td className="px-3 py-2 text-center text-red-700 font-black">{index + 1}</td>
                                              <td className="px-3 py-2 text-gray-500 font-mono text-[11px] whitespace-nowrap">{time}</td>
                                              <td className="px-3 py-2 font-mono text-xs text-red-800 break-words">{text}</td>
                                              <td className="px-3 py-2 text-center font-bold text-gray-900">{index + 1}/5</td>
                                            </tr>
                                          );
                                        })
                                      ) : (
                                        // Fallback standard log lines based on warnCount value (in case user has warnings but detailed log doesn't exist yet)
                                        Array.from({ length: warnCount }).map((_, vIdx) => (
                                          <tr key={vIdx} className="hover:bg-red-50/10">
                                            <td className="px-3 py-2 text-center text-red-700 font-semibold">{vIdx + 1}</td>
                                            <td className="px-3 py-2 text-gray-400 italic">Hệ thống ghi nhận</td>
                                            <td className="px-3 py-2 text-red-650 font-medium">Tin nhắn chứa ngôn từ chưa phù hợp chuẩn mực</td>
                                            <td className="px-3 py-2 text-center font-bold text-gray-900">{vIdx + 1}/5</td>
                                          </tr>
                                        ))
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                    </div>
                  </div>

                </div>

                {/* PHẦN 3 — HÀNH ĐỘNG ADMIN FOOTER */}
                <div className="p-4 md:p-6 border-t border-gray-150 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
                  
                  {/* Left side actions (Unlock or lock/reset warning) */}
                  <div className="flex gap-2">
                    {isLocked ? (
                      <button
                        type="button"
                        onClick={() => handleUnlockAccount(selectedCustomer.id, selectedCustomer.name || selectedCustomer.email)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl cursor-pointer border-none shadow-xs transition-all active:scale-95"
                      >
                        Mở khóa TK
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleLockAccount(selectedCustomer.id, selectedCustomer.name || selectedCustomer.email)}
                        className="px-3.5 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-extrabold uppercase tracking-wider rounded-xl cursor-pointer border-none shadow-xs transition-all active:scale-95"
                      >
                        Khóa tài khoản
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleResetWarnings(selectedCustomer.id, selectedCustomer.name || selectedCustomer.email)}
                      className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-extrabold uppercase tracking-wider rounded-xl cursor-pointer border-none transition-all active:scale-95"
                    >
                      Đặt lại cảnh báo
                    </button>
                  </div>

                  {/* Delete account */}
                  <button
                    type="button"
                    onClick={() => handleDeleteAccount(selectedCustomer.id, selectedCustomer.name || selectedCustomer.email)}
                    className="px-3.5 py-2 bg-red-900 hover:bg-red-950 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl cursor-pointer border-none shadow-md transition-all active:scale-95"
                  >
                    Xóa tài khoản vĩnh viễn
                  </button>

                </div>

              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}
