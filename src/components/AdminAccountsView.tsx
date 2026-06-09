import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, User, Mail, Phone, Shield, Coins, Lock, Unlock, 
  MessageSquare, ShoppingBag, Heart, Search, Plus, Trash2, 
  Eye, Check, X, ShieldAlert, Key, PlusCircle, Power, UserCheck,
  Calendar, Clock
} from 'lucide-react';
import { getAccounts, saveAccounts, updateAccountData, Account, formatDateTime } from '../utils/accounts';

function getAccountLoginStatus(lastLogin: string | undefined): 'active' | 'low_activity' | 'inactive' {
  if (!lastLogin) return 'inactive';
  try {
    const parts = lastLogin.split(' ');
    const dateParts = parts[0].split('/');
    if (dateParts.length < 3) return 'inactive';
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const year = parseInt(dateParts[2], 10);
    
    let hour = 0;
    let minute = 0;
    if (parts[1]) {
      const timeParts = parts[1].split(':');
      hour = parseInt(timeParts[0], 10) || 0;
      minute = parseInt(timeParts[1], 10) || 0;
    }
    
    const loginDate = new Date(year, month, day, hour, minute);
    const diffTime = Math.abs(new Date().getTime() - loginDate.getTime());
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    if (diffDays <= 7) {
      return 'active';
    } else if (diffDays <= 30) {
      return 'low_activity';
    } else {
      return 'inactive';
    }
  } catch (e) {
    return 'inactive';
  }
}

export default function AdminAccountsView() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Selected account for deep-dive detail modal
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'chats' | 'orders' | 'activities'>('chats');
  
  // Modal for creating/adding a new account
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccEmail, setNewAccEmail] = useState('');
  const [newAccPassword, setNewAccPassword] = useState('');
  const [newAccName, setNewAccName] = useState('');
  const [newAccPhone, setNewAccPhone] = useState('');
  const [newAccRole, setNewAccRole] = useState<'user' | 'admin'>('user');
  const [addError, setAddError] = useState('');

  // Manual loyalty points adjustment form states
  const [pointsAdjustment, setPointsAdjustment] = useState('');
  const [pointsReason, setPointsReason] = useState('Điểm cộng khuyến nghị bởi Admin');

  // Selected chat session view
  const [selectedChatSession, setSelectedChatSession] = useState<any | null>(null);

  // Load accounts on mount
  useEffect(() => {
    setAccounts(getAccounts());
  }, []);

  const refreshAccounts = () => {
    setAccounts(getAccounts());
  };

  // Toggle lock of an account (isActive flag)
  const handleToggleActive = (account: Account) => {
    if (account.id === 'admin_001') {
      alert('Không thể khóa tài khoản Super Admin mặc định!');
      return;
    }
    const updatedStatus = !account.isActive;
    const descStr = updatedStatus ? 'mở khóa' : 'khóa';
    if (window.confirm(`Bạn có chắc chắn muốn ${descStr} tài khoản ${account.name || account.email}?`)) {
      updateAccountData(account.id, { isActive: updatedStatus });
      refreshAccounts();
      if (selectedAccount && selectedAccount.id === account.id) {
        setSelectedAccount(prev => prev ? { ...prev, isActive: updatedStatus } : null);
      }
    }
  };

  // Delete an account
  const handleDeleteAccount = (account: Account) => {
    if (account.id === 'admin_001') {
      alert('Không thể xóa tài khoản Super Admin mặc định!');
      return;
    }
    if (window.confirm(`XÁC NHẬN: Bạn thực sự muốn xóa tài khoản ${account.name}? Tất cả lịch sử đơn hàng, chat và giỏ hàng của người dùng này sẽ không thể khôi phục!`)) {
      const allAccs = getAccounts();
      const filtered = allAccs.filter(acc => acc.id !== account.id);
      saveAccounts(filtered);
      refreshAccounts();
      setSelectedAccount(null);
    }
  };

  // Quick reset password to default "123456" or random
  const handleResetPassword = (account: Account) => {
    const newPass = prompt(`Nhập mật khẩu mới cho tài khoản ${account.name || account.email}:`, '123456');
    if (newPass !== null) {
      if (newPass.length < 6) {
        alert('Mật khẩu tối thiểu phải từ 6 ký tự!');
        return;
      }
      updateAccountData(account.id, { password: btoa(newPass) });
      alert(`Đã đổi mật khẩu thành công sang: "${newPass}"`);
      refreshAccounts();
    }
  };

  // Adjust points
  const handleAdjustPoints = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    const pointsNum = parseInt(pointsAdjustment, 10);
    if (isNaN(pointsNum) || pointsNum === 0) {
      alert('Vui lòng nhập điểm số hợp lệ (số dương hoặc âm)!');
      return;
    }

    const currentLoyalty = selectedAccount.loyalty || { points: 0, tier: 'silver', history: [] };
    const newPoints = Math.max(0, (currentLoyalty.points || 0) + pointsNum);
    
    // Determine tier
    let newTier = 'silver';
    if (newPoints >= 2000) newTier = 'diamond';
    else if (newPoints >= 500) newTier = 'gold';

    const newHistoryLog = {
      id: `L-${Date.now()}`,
      points: pointsNum,
      reason: pointsReason,
      timestamp: new Date().toISOString()
    };

    const updatedLoyalty = {
      points: newPoints,
      tier: newTier,
      history: [newHistoryLog, ...(currentLoyalty.history || [])]
    };

    updateAccountData(selectedAccount.id, { loyalty: updatedLoyalty });
    alert(`Đã điều chỉnh thành công! Điểm mới: ${newPoints} (${newTier.toUpperCase()})`);
    
    // Update local modal states
    setSelectedAccount(prev => prev ? { ...prev, loyalty: updatedLoyalty } : null);
    setPointsAdjustment('');
    setPointsReason('Điểm cộng khuyến nghị bởi Admin');
    refreshAccounts();
  };

  // Create account manually
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');

    const emailVal = newAccEmail.trim().toLowerCase();
    const phoneVal = newAccPhone.trim().replace(/\s+/g, '');
    const nameVal = newAccName.trim();
    
    if (!emailVal) {
      setAddError('Gmail/Email bắt buộc!');
      return;
    }
    if (newAccPassword.length < 6) {
      setAddError('Mật khẩu phải tối thiểu 6 ký tự!');
      return;
    }

    const allAccs = getAccounts();
    const duplicate = allAccs.find(acc => 
      acc.email.toLowerCase().trim() === emailVal || 
      (phoneVal && acc.phone === phoneVal)
    );

    if (duplicate) {
      setAddError('Email hoặc số điện thoại này đã tồn tại!');
      return;
    }

    const nowStr = formatDateTime(new Date());
    const newAcc: Account = {
      id: (newAccRole === 'admin' ? "admin_" : "user_") + Date.now(),
      email: emailVal,
      password: btoa(newAccPassword),
      name: nameVal || (newAccRole === 'admin' ? 'Admin phụ' : 'Khách hàng mới'),
      phone: phoneVal,
      role: newAccRole,
      createdAt: nowStr,
      lastLogin: '',
      isActive: true,
      orders: [],
      favorites: [],
      chatHistory: [],
      cartItems: [],
      loyalty: {
        points: 50,
        tier: 'silver',
        history: [{ id: 'L-INIT', points: 50, reason: 'Quà thành viên mới từ Admin', timestamp: new Date().toISOString() }]
      }
    };

    const updated = [...allAccs, newAcc];
    saveAccounts(updated);
    
    // Also sync to legacy storage to keep compatible
    try {
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      storedUsers.push({
        username: emailVal,
        email: emailVal,
        phone: phoneVal,
        password: newAccPassword,
        linkedGmail: emailVal
      });
      localStorage.setItem('users', JSON.stringify(storedUsers));
    } catch {}

    refreshAccounts();
    setShowAddModal(false);
    setNewAccEmail('');
    setNewAccPassword('');
    setNewAccName('');
    setNewAccPhone('');
    setNewAccRole('user');
    alert('Thêm tài khoản mới thành công!');
  };

  // Filter accounts
  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = 
      (acc.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesRole = roleFilter === 'all' ? true : acc.role === roleFilter;
    
    const loginStatus = getAccountLoginStatus(acc.lastLogin);
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? loginStatus === 'active' :
      loginStatus === 'inactive';

    return matchesSearch && matchesRole && matchesStatus;
  });

  // KPI Calculations
  const pad = (num: number) => num.toString().padStart(2, '0');
  const todayDate = new Date();
  const todayPrefix = `${pad(todayDate.getDate())}/${pad(todayDate.getMonth() + 1)}/${todayDate.getFullYear()}`;
  const todayRegCount = accounts.filter(acc => acc.createdAt && acc.createdAt.trim().startsWith(todayPrefix)).length;

  const activeAccountCount = accounts.filter(acc => {
    if (!acc.lastLogin) return false;
    try {
      const parts = acc.lastLogin.split(' ');
      const dateParts = parts[0].split('/');
      if (dateParts.length < 3) return false;
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const year = parseInt(dateParts[2], 10);
      
      let hour = 0;
      let minute = 0;
      if (parts[1]) {
        const timeParts = parts[1].split(':');
        hour = parseInt(timeParts[0], 10) || 0;
        minute = parseInt(timeParts[1], 10) || 0;
      }
      
      const loginDate = new Date(year, month, day, hour, minute);
      const diffTime = Math.abs(new Date().getTime() - loginDate.getTime());
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    } catch (e) {
      return false;
    }
  }).length;

  const totalOrdersCount = accounts.reduce((sum, acc) => sum + (acc.orders?.length || 0), 0);

  const totalRevenue = accounts.reduce((sum, acc) => {
    const userSum = (acc.orders || []).reduce((accSum: number, order: any) => accSum + (order.price || 0), 0);
    return sum + userSum;
  }, 0);

  return (
    <div className="flex-grow flex flex-col h-full bg-[#fcfdfe] relative overflow-hidden font-sans">
      {/* Header and Controls */}
      <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white shadow-sm shrink-0">
        <div>
          <h1 className="text-xl font-extrabold text-[#0C447C] uppercase tracking-wide flex items-center gap-2">
            <Users size={22} />
            Hệ thống đa tài khoản REMIX.AI
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Tổng cộng <span className="font-extrabold text-primary">{accounts.length}</span> tài khoản đã ghi nhận trong cơ sở dữ liệu `remix_all_accounts`.
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-black uppercase tracking-wider rounded-xl border-none shadow-md cursor-pointer transition-transform active:scale-95 shrink-0"
        >
          <PlusCircle size={15} />
          Thêm tài khoản mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white border-b border-gray-100 flex flex-col md:flex-row items-center gap-4 shrink-0">
        <div className="relative w-full md:w-80 group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Tìm theo Tên, Email, SĐT, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-150 rounded-2xl py-3 pl-11 pr-4 text-xs font-medium text-gray-800 placeholder:text-gray-400 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mr-1">Chức vụ:</span>
            <select
              value={roleFilter}
              onChange={(e: any) => setRoleFilter(e.target.value)}
              className="bg-gray-50 border border-gray-150 text-xs font-semibold text-gray-700 py-2 px-3 rounded-xl outline-none align-middle"
            >
              <option value="all">Tất cả chức vụ</option>
              <option value="user">Khách hàng (User)</option>
              <option value="admin">Quản lý (Admin)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mr-1">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="bg-gray-50 border border-gray-150 text-xs font-semibold text-gray-700 py-2 px-3 rounded-xl outline-none align-middle"
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Accounts Table / KPI Cards */}
      <div className="flex-grow overflow-auto p-4 md:p-6 bg-gray-50/50 space-y-6">
        {/* Simple elegant dashboard overview KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Tổng tài khoản */}
          <div className="bg-white p-5 rounded-2xl border border-gray-150/80 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Tổng tài khoản</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">{accounts.length}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#0C447C]/5 flex items-center justify-center text-[#0C447C]">
                <Users size={20} className="ti-users" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
              <span>Mới đăng ký hôm nay:</span>
              <span className="font-extrabold text-emerald-600">+{todayRegCount}</span>
            </div>
          </div>

          {/* Card 2: Đang hoạt động */}
          <div className="bg-white p-5 rounded-2xl border border-gray-150/80 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Đang hoạt động (7 ngày)</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">{activeAccountCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <UserCheck size={20} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
              <span>Tỷ lệ hoạt động tốt:</span>
              <span className="font-extrabold text-[#0C447C]">
                {accounts.length ? Math.round((activeAccountCount / accounts.length) * 100) : 0}%
              </span>
            </div>
          </div>

          {/* Card 3: Tổng đơn hàng */}
          <div className="bg-white p-5 rounded-2xl border border-gray-150/80 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Tổng đơn hàng</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">{totalOrdersCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <ShoppingBag size={20} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
              <span>Bình quân/tài khoản:</span>
              <span className="font-extrabold text-amber-600">
                {accounts.length ? (totalOrdersCount / accounts.length).toFixed(1) : 0} đơn
              </span>
            </div>
          </div>

          {/* Card 4: Tổng doanh thu */}
          <div className="bg-white p-5 rounded-2xl border border-gray-150/80 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Tổng doanh thu</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">{totalRevenue.toLocaleString()}đ</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Coins size={20} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
              <span>Bình quân mỗi đơn:</span>
              <span className="font-extrabold text-purple-600">
                {totalOrdersCount ? Math.round(totalRevenue / totalOrdersCount).toLocaleString() : 0}đ
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden max-w-full">
          <table className="w-full border-collapse text-left text-xs font-medium text-gray-700 font-sans">
            <thead className="bg-gray-50/70 border-b border-gray-100 text-[10px] uppercase font-black text-gray-400 tracking-wider">
              <tr>
                <th className="px-4 py-4 text-center">Avatar</th>
                <th className="px-4 py-4">Tên</th>
                <th className="px-4 py-4">Email</th>
                <th className="px-4 py-4">SĐT</th>
                <th className="px-4 py-4">Đăng ký lúc</th>
                <th className="px-4 py-4">Lần cuối đăng nhập</th>
                <th className="px-4 py-4 text-center">Số đơn</th>
                <th className="px-4 py-4 text-right">Tổng chi</th>
                <th className="px-4 py-4 text-center">Trạng thái</th>
                <th className="px-4 py-4 text-center">Cảnh báo</th>
                <th className="px-4 py-4 text-center">Xem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-5 py-8 text-center text-gray-400 font-semibold ">
                    Không tìm thấy tài khoản nào khớp với bộ lọc dữ liệu!
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => {
                  const loginStatus = getAccountLoginStatus(account.lastLogin);
                  
                  let statusBadgeClass = '';
                  let statusText = '';
                  if (loginStatus === 'active') {
                    statusBadgeClass = 'bg-emerald-50 text-emerald-600 border-emerald-100';
                    statusText = 'Hoạt động';
                  } else if (loginStatus === 'low_activity') {
                    statusBadgeClass = 'bg-amber-50 text-amber-600 border-amber-100';
                    statusText = 'Ít hoạt động';
                  } else {
                    statusBadgeClass = 'bg-gray-50 text-gray-500 border-gray-150';
                    statusText = 'Không hoạt động';
                  }

                  const totalSpend = (account.orders || []).reduce((sum: number, o: any) => sum + (o.price || 0), 0);

                  return (
                    <tr 
                      key={account.id} 
                      className="hover:bg-gray-50/40 transition-colors"
                    >
                      {/* 1. Avatar */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs select-none shadow-xs ${
                            account.role === 'admin' 
                              ? 'bg-amber-100 text-amber-700' 
                              : 'bg-primary/10 text-primary'
                          }`}>
                            {(account.name || account.email || '?').charAt(0).toUpperCase()}
                          </div>
                        </div>
                      </td>

                      {/* 2. Tên */}
                      <td className="px-4 py-4">
                        <div className="font-extrabold text-gray-900 flex items-center gap-1.5 flex-wrap">
                          {account.name || 'Khách hàng'}
                          {account.id === 'admin_001' && (
                            <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-black uppercase">Root</span>
                          )}
                          {account.isLocked && (
                            <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-xs">Đã khóa</span>
                          )}
                        </div>
                        {account.role === 'admin' && account.id !== 'admin_001' && (
                          <span className="text-[8px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-black uppercase mt-0.5 inline-block">Admin</span>
                        )}
                      </td>

                      {/* 3. Email */}
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-700 break-all">{account.email}</div>
                      </td>

                      {/* 4. SĐT */}
                      <td className="px-4 py-4 text-gray-600 font-medium">
                        {account.phone || '—'}
                      </td>

                      {/* 5. Đăng ký lúc */}
                      <td className="px-4 py-4 text-gray-500 font-medium">
                        {account.createdAt || '—'}
                      </td>

                      {/* 6. Lần cuối đăng nhập */}
                      <td className="px-4 py-4 text-gray-500 font-medium font-mono">
                        {account.lastLogin || <span className="text-gray-300">Chưa ghi nhận</span>}
                      </td>

                      {/* 7. Số đơn */}
                      <td className="px-4 py-4 text-center font-extrabold text-gray-800">
                        {account.orders?.length || 0}
                      </td>

                      {/* 8. Tổng chi */}
                      <td className="px-4 py-4 text-right font-black text-[#0C447C]">
                        {totalSpend.toLocaleString()}đ
                      </td>

                      {/* 9. Trạng thái */}
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusBadgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            loginStatus === 'active' ? 'bg-emerald-500 animate-pulse' :
                            loginStatus === 'low_activity' ? 'bg-amber-500' : 'bg-gray-400'
                          }`} />
                          {statusText}
                        </span>
                      </td>

                      {/* 9b. Cảnh báo */}
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          (account.warnings || 0) >= 4 ? 'bg-red-50 text-red-600 border-red-150 font-extrabold' :
                          (account.warnings || 0) > 0 ? 'bg-amber-50 text-amber-600 border-amber-100 font-extrabold' :
                          'bg-gray-50 text-gray-400 border-gray-150'
                        }`}>
                          {account.warnings || 0}/5 lần
                        </span>
                      </td>

                      {/* 10. Xem */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedAccount(account)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-primary/5 hover:bg-primary/10 text-primary text-[11px] font-bold rounded-lg border-none cursor-pointer transition-colors"
                            title="Xem chi tiết tệp dữ liệu"
                          >
                            <Eye size={13} />
                            <span>Xem</span>
                          </button>
                          
                          <button
                            onClick={() => handleResetPassword(account)}
                            className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-lg border-none bg-transparent cursor-pointer transition-colors"
                            title="Đổi mật mã bảo mật"
                          >
                            <Key size={14} />
                          </button>

                          <button
                            onClick={() => handleDeleteAccount(account)}
                            disabled={account.id === 'admin_001'}
                            className={`p-1.5 rounded-lg border-none bg-transparent cursor-pointer transition-colors ${
                              account.id === 'admin_001'
                                ? 'text-gray-200 cursor-not-allowed'
                                : 'hover:bg-red-50 text-red-400 hover:text-red-500'
                            }`}
                            title="Xóa tài khoản vĩnh viễn"
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

      {/* Account Details Slide-Over Panel */}
      <AnimatePresence>
        {selectedAccount && (
          <div className="fixed inset-0 z-[100] flex justify-end font-sans">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedAccount(null); setSelectedChatSession(null); }}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col overflow-hidden z-10"
            >
              {/* Header */}
              <div className="p-5 md:p-6 border-b border-gray-100 bg-gray-50/30 flex justify-between items-start shrink-0">
                <div className="flex items-start gap-4">
                  {/* Avatar lớn 56px */}
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-xl shadow-sm border shrink-0 ${
                    selectedAccount.role === 'admin' 
                      ? 'bg-amber-100 border-amber-200 text-amber-700' 
                      : 'bg-primary/10 border-primary/20 text-primary'
                  }`}>
                    {(selectedAccount.name || selectedAccount.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-gray-900 leading-tight">
                        {selectedAccount.name || 'Khách hàng'}
                      </h2>
                      {selectedAccount.id === 'admin_001' && (
                        <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-black uppercase">Root</span>
                      )}
                      {selectedAccount.role === 'admin' && selectedAccount.id !== 'admin_001' && (
                        <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-black uppercase">Admin</span>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-600 font-medium break-all mt-0.5">{selectedAccount.email}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedAccount.phone || 'Chưa liên kết SĐT'}</p>
                    
                    {/* Ngày đăng ký | Lần cuối đăng nhập */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-gray-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-gray-400" />
                        Đăng ký: <strong className="text-gray-600">{selectedAccount.createdAt || '01/01/2026'}</strong>
                      </span>
                      <span className="text-gray-200">|</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-gray-400" />
                        Lần cuối: <strong className="text-gray-600">{selectedAccount.lastLogin || 'Chưa ghi nhận'}</strong>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(selectedAccount)}
                    disabled={selectedAccount.id === 'admin_001'}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border cursor-pointer select-none transition-all ${
                      selectedAccount.isActive 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100' 
                        : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100'
                    }`}
                    title={selectedAccount.id === 'admin_001' ? 'Không thể khóa Root Admin' : 'Đổi trạng thái khóa/mở'}
                  >
                    {selectedAccount.isActive ? 'Bình thường' : 'Đã khóa'}
                  </button>

                  <button
                    onClick={() => { setSelectedAccount(null); setSelectedChatSession(null); }}
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 border-none bg-transparent cursor-pointer transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Account Quick Stats Card */}
              <div className="mx-6 mt-6 p-4 rounded-2xl bg-gray-50 border border-gray-100 grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                <div className="text-center p-2.5 bg-white rounded-xl shadow-xs border border-gray-100/50">
                  <span className="text-[10px] text-gray-400 block font-black uppercase tracking-wider">Tổng đơn hàng</span>
                  <span className="text-sm font-extrabold text-[#0C447C] flex items-center justify-center gap-1 mt-1 font-mono">
                    <ShoppingBag size={14} />
                    {selectedAccount.orders?.length || 0}
                  </span>
                </div>
                
                <div className="text-center p-2.5 bg-white rounded-xl shadow-xs border border-gray-100/50">
                  <span className="text-[10px] text-gray-400 block font-black uppercase tracking-wider">Tổng chi tiêu</span>
                  <span className="text-sm font-extrabold text-[#0C447C] flex items-center justify-center gap-1 mt-1 font-mono">
                    {((selectedAccount.orders || []).reduce((sum: number, o: any) => sum + (o.price || 0), 0)).toLocaleString()}đ
                  </span>
                </div>

                <div className="text-center p-2.5 bg-white rounded-xl shadow-xs border border-gray-100/50">
                  <span className="text-[10px] text-gray-400 block font-black uppercase tracking-wider">Điểm Loyalty</span>
                  <span className="text-sm font-extrabold text-amber-600 flex items-center justify-center gap-1 mt-1 font-mono">
                    <Coins size={14} className="text-amber-500" />
                    {selectedAccount.loyalty?.points || 0}
                  </span>
                </div>

                <div className="text-center p-2.5 bg-white rounded-xl shadow-xs border border-gray-100/50 font-sans">
                  <span className="text-[10px] text-gray-400 block font-black uppercase tracking-wider">Hạng thẻ</span>
                  <span className="text-xs font-black uppercase inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20">
                    {(selectedAccount.loyalty?.tier || 'silver').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Warning and Lock Management Area */}
              <div className="mx-6 mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 font-sans">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 block font-bold tracking-wider uppercase font-mono">Quản lý vi phạm & Khóa</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-gray-700">Cảnh báo:</span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono shadow-xs ${
                      (selectedAccount.warnings || 0) >= 4 ? 'bg-red-100 text-red-700 border border-red-200' :
                      (selectedAccount.warnings || 0) > 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}>
                      {selectedAccount.warnings || 0}/5 lần
                    </span>

                    {selectedAccount.isLocked ? (
                      <span className="text-xs px-2.5 py-1 bg-red-600 text-white rounded-lg font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                        <Lock size={12} /> Đã khóa
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold uppercase tracking-wider flex items-center gap-1">
                        <Unlock size={12} /> Bình thường
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedAccount.isLocked && (
                    <button
                      onClick={() => {
                        updateAccountData(selectedAccount.id, { isLocked: false, warnings: 0 });
                        window.dispatchEvent(new CustomEvent('remix_show_toast', { detail: `Đã mở khóa tài khoản ${selectedAccount.name || selectedAccount.email} 🎉` }));
                        refreshAccounts();
                        setSelectedAccount(prev => prev ? { ...prev, isLocked: false, warnings: 0 } : null);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl cursor-pointer shadow-md select-none transition-all active:scale-95"
                    >
                      Mở khóa
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      updateAccountData(selectedAccount.id, { warnings: 0 });
                      window.dispatchEvent(new CustomEvent('remix_show_toast', { detail: `Đã đặt lại cảnh báo cho tài khoản ${selectedAccount.name || selectedAccount.email} ⚡` }));
                      refreshAccounts();
                      setSelectedAccount(prev => prev ? { ...prev, warnings: 0 } : null);
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-extrabold uppercase tracking-wider rounded-xl cursor-pointer select-none transition-all active:scale-95"
                  >
                    Đặt lại cảnh báo
                  </button>
                </div>
              </div>

              {/* Details Navigation Sub-tabs */}
              <div className="px-6 mt-4 border-b border-gray-100 flex gap-4 shrink-0">
                {(['chats', 'orders', 'activities'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => { setActiveDetailTab(tab); setSelectedChatSession(null); }}
                    className={`pb-3 text-xs font-black uppercase tracking-wider border-0 cursor-pointer bg-transparent relative transition-colors ${
                      activeDetailTab === tab 
                        ? 'text-primary' 
                        : 'text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'chats' && '💬 Lịch sử chat AI'}
                    {tab === 'orders' && '📦 Đơn hàng'}
                    {tab === 'activities' && '⏱️ Hoạt động'}
                    
                    {activeDetailTab === tab && (
                      <motion.div 
                        layoutId="activeDetailIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Detail Tabs Contents container */}
              <div className="flex-grow overflow-y-auto p-6 bg-gray-50/30">
                {/* TAB 1: CHATS HISTORY */}
                {activeDetailTab === 'chats' && (() => {
                  const chatLogs = (selectedAccount.chatHistory || []).filter((log: any) => log.type === 'chat');
                  const numQuestions = chatLogs.length;
                  
                  const getMostFrequentTopic = (logs: any[]) => {
                    if (logs.length === 0) return 'Chưa có';
                    const words: { [key: string]: number } = {};
                    logs.forEach(log => {
                      const text = (log.data?.msg || log.data?.promptText || '').toLowerCase();
                      const matches = text.match(/[a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+/g);
                      if (!matches) return;
                      const stops = new Set(['và', 'của', 'cho', 'tôi', 'em', 'admin', 'bạn', 'remi', 'remix', 'ai', 'cửa', 'hàng', 'shop', 'có', 'không', 'gì', 'là', 'muốn', 'hỏi', 'mua', 'bán', 'giá', 'ở', 'đâu', 'nào', 'sao', 'thế', 'với', 'nhà', 'mình', 'được', 'gửi', 'xin', 'chào', 'hello']);
                      matches.forEach((w: string) => {
                        if (w.length > 2 && !stops.has(w)) {
                          words[w] = (words[w] || 0) + 1;
                        }
                      });
                    });
                    
                    const entries = Object.entries(words);
                    if (entries.length === 0) return 'Tư vấn chung';
                    entries.sort((a, b) => b[1] - a[1]);
                    return entries[0][0].charAt(0).toUpperCase() + entries[0][0].slice(1);
                  };

                  const topTopic = getMostFrequentTopic(chatLogs);

                  return (
                    <div className="space-y-4">
                      {/* Summary Statistics */}
                      <div className="bg-blue-50/60 border border-blue-100 p-3 rounded-2xl flex items-center justify-between text-xs font-bold text-[#0C447C]">
                        <span className="flex items-center gap-1">
                          <MessageSquare size={14} className="text-blue-600" />
                          Lượt hỏi: <strong className="text-sm font-black text-gray-900 ml-1">{numQuestions}</strong>
                        </span>
                        <span className="text-gray-200">|</span>
                        <span className="flex items-center gap-1">
                          <Coins size={14} className="text-amber-500" />
                          Chủ đề hay hỏi: <strong className="text-sm font-black text-amber-700 ml-1">{topTopic}</strong>
                        </span>
                      </div>

                      {chatLogs.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 font-semibold bg-white rounded-xl border border-gray-100">
                          Chưa tìm thấy cuộc hội thoại nào của người dùng này với đối tác Remi AI.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {chatLogs.map((log: any, idxIndex: number) => {
                            const userMsg = log.data?.msg || log.data?.promptText || '';
                            const aiMsg = log.data?.reply || log.data?.response || '';
                            const timeStr = log.time || log.timestamp || '';

                            return (
                              <div key={idxIndex} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-3xs space-y-4">
                                {userMsg && (
                                  <div className="flex flex-col items-end">
                                    <span className="text-[9px] text-gray-400 mb-0.5 font-bold uppercase tracking-wider">Khách hàng</span>
                                    <div className="max-w-[85%] rounded-2xl px-4 py-2 bg-[#0C447C] text-white text-xs font-medium self-end break-words">
                                      {userMsg}
                                    </div>
                                    {timeStr && <span className="text-[11px] text-gray-400 mt-1 font-mono">{timeStr}</span>}
                                  </div>
                                )}

                                {aiMsg && (
                                  <div className="flex flex-col items-start pt-1 border-t border-dashed border-gray-100">
                                    <span className="text-[9px] text-gray-400 mb-0.5 font-bold uppercase tracking-wider">Trợ lý AI (Remi)</span>
                                    <div className="max-w-[85%] rounded-2xl px-4 py-2 bg-gray-100 text-gray-800 text-xs font-medium self-start break-words whitespace-pre-wrap">
                                      {aiMsg}
                                    </div>
                                    {timeStr && <span className="text-[11px] text-gray-400 mt-1 font-mono">{timeStr}</span>}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* TAB 2: ORDERS LIST */}
                {activeDetailTab === 'orders' && (
                  <div className="space-y-4">
                    {(!selectedAccount.orders || selectedAccount.orders.length === 0) ? (
                      <div className="text-center py-12 text-gray-400 font-semibold bg-white rounded-xl border border-gray-100">
                        Chưa đặt hàng nào
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-3xs overflow-hidden overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs font-semibold text-gray-700 min-w-[500px]">
                          <thead className="bg-gray-50 border-b border-gray-100 text-[9px] uppercase font-black text-gray-400 tracking-wider">
                            <tr>
                              <th className="px-4 py-3">Mã đơn</th>
                              <th className="px-4 py-3">Ngày</th>
                              <th className="px-4 py-3">Sản phẩm</th>
                              <th className="px-4 py-3 text-right">Tổng tiền</th>
                              <th className="px-4 py-3">Chi nhánh</th>
                              <th className="px-4 py-3 text-center">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 font-medium">
                            {selectedAccount.orders.map((order: any, idxIndex: number) => (
                              <tr key={order.id || idxIndex} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 py-3 font-mono font-extrabold text-gray-950">
                                  {order.id}
                                </td>
                                <td className="px-4 py-3 text-gray-400 text-[11px] font-mono whitespace-nowrap">
                                  {order.date}
                                </td>
                                <td className="px-4 py-3 font-extrabold text-gray-900">
                                  {order.productName}
                                </td>
                                <td className="px-4 py-3 text-right font-black text-[#0C447C] font-mono">
                                  {order.price?.toLocaleString()}đ
                                </td>
                                <td className="px-4 py-3 text-gray-500 max-w-[120px] truncate">
                                  {order.branch || 'Chi nhánh Quận 1'}
                                </td>
                                <td className="px-4 py-3 text-center whitespace-nowrap">
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

                {/* TAB 3: ACTIVITIES TIMELINE */}
                {activeDetailTab === 'activities' && (() => {
                  const activities = [...(selectedAccount.chatHistory || [])].reverse();

                  return (
                    <div className="space-y-4">
                      {activities.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 font-semibold bg-white rounded-xl border border-gray-100">
                          Chưa có lịch sử hoạt động nào.
                        </div>
                      ) : (
                        <div className="relative border-l border-gray-150 ml-4 pl-6 space-y-5 text-left">
                          {activities.map((log: any, idxIndex: number) => {
                            let icon = '🔵';
                            let description = '';
                            const timeVal = log.time || log.timestamp || 'Chưa rõ thời gian';

                            switch(log.type) {
                              case 'login':
                                icon = '🔵';
                                description = `Đăng nhập lúc ${timeVal}`;
                                break;
                              case 'add_cart':
                                icon = '🛒';
                                description = `Thêm ${log.data?.productName || 'sản phẩm'} vào giỏ`;
                                break;
                              case 'order':
                                icon = '📦';
                                description = `Đặt đơn hàng #${log.data?.orderId || ''} - ${(log.data?.total || log.data?.price || 0).toLocaleString()}đ`;
                                break;
                              case 'chat':
                                icon = '💬';
                                const query = log.data?.msg || log.data?.promptText || '';
                                description = `Hỏi AI: ${query.slice(0, 10)}${query.length > 10 ? '...' : ''}`;
                                break;
                              case 'view_product':
                                icon = '👁';
                                description = `Xem sản phẩm ${log.data?.productName || 'sản phẩm'}`;
                                break;
                              case 'logout':
                                icon = '🔴';
                                description = `Đăng xuất lúc ${timeVal}`;
                                break;
                              case 'register':
                                icon = '✨';
                                description = `Đăng ký tài khoản mới`;
                                break;
                              default:
                                icon = '⚙️';
                                description = `Hoạt động khác: ${log.type || 'Hành động'}`;
                            }

                            return (
                              <div key={idxIndex} className="relative">
                                {/* Dot Icon marker and glow */}
                                <div className="absolute -left-[35px] top-0.5 bg-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-xs border border-gray-100 z-10 select-none">
                                  {icon}
                                </div>
                                <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-3xs hover:border-gray-200 transition-colors">
                                  <p className="text-xs font-bold text-gray-800">
                                    {description}
                                  </p>
                                  <p className="text-[10px] text-gray-400 font-mono mt-1 flex items-center gap-1 font-medium">
                                    <Clock size={10} />
                                    {timeVal}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Bottom Actions Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex gap-2">
                  {selectedAccount.isActive ? (
                    <button
                      onClick={() => handleToggleActive(selectedAccount)}
                      disabled={selectedAccount.id === 'admin_001'}
                      className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl border transition-all ${
                        selectedAccount.id === 'admin_001'
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                          : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 cursor-pointer active:scale-95'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Lock size={14} />
                        Khóa tài khoản
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleActive(selectedAccount)}
                      className="px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 cursor-pointer active:scale-95 transition-all"
                    >
                      <span className="flex items-center gap-1.5">
                        <Unlock size={14} />
                        Mở khóa
                      </span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteAccount(selectedAccount)}
                    disabled={selectedAccount.id === 'admin_001'}
                    className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl border transition-all ${
                      selectedAccount.id === 'admin_001'
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                        : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 cursor-pointer active:scale-95'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Trash2 size={14} />
                      Xóa tài khoản
                    </span>
                  </button>
                </div>

                <button
                  onClick={() => { setSelectedAccount(null); setSelectedChatSession(null); }}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual User Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white max-w-md w-full p-6 rounded-3xl shadow-2xl border flex flex-col font-sans text-gray-900"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
              <h3 className="font-extrabold text-[#0C447C] text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Users size={18} />
                Thêm tài khoản thủ công
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 font-semibold cursor-pointer border-0 bg-transparent text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4 text-left mt-4">
              {addError && (
                <div className="bg-red-50 text-red-600 text-xs py-2 px-3 rounded-xl border border-red-100 font-semibold">
                  ⚠️ {addError}
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Email / Gmail người dùng *</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="email"
                    placeholder="VD: user@remix.ai"
                    required
                    value={newAccEmail}
                    onChange={(e) => setNewAccEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-150 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold text-gray-800 placeholder:text-gray-300 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Mật mã bảo mật *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="password"
                    placeholder="Tối thiểu từ 6 ký tự"
                    required
                    value={newAccPassword}
                    onChange={(e) => setNewAccPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-150 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold text-gray-800 placeholder:text-gray-300 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Họ tên đầy đủ *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="VD: Nguyễn Văn A"
                    required
                    value={newAccName}
                    onChange={(e) => setNewAccName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-150 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold text-gray-800 placeholder:text-gray-300 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Số điện thoại</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="VD: 0901234567"
                    value={newAccPhone}
                    onChange={(e) => setNewAccPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-150 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold text-gray-800 placeholder:text-gray-300 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Phân quyền vai trò *</label>
                <select 
                  value={newAccRole}
                  onChange={(e: any) => setNewAccRole(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-150 rounded-2xl py-3 px-3 text-xs font-bold text-gray-800 outline-none"
                >
                  <option value="user">Khách hàng (User)</option>
                  <option value="admin">Quản lý (Admin phụ)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white rounded-2xl py-4.5 border-none shadow-md text-xs font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all mt-4"
              >
                Tạo lập tài khoản mới
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
