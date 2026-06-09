import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, Sparkles, Trophy, Gift, UserPlus, MessageSquare, 
  ChevronRight, Copy, Check, Share2, Send, Clock, HelpCircle, 
  User, CheckCircle2, ShoppingBag, ArrowLeftRight, Heart, Star, Medal, Diamond
} from 'lucide-react';
import { getLoyaltyInfo, addLoyaltyPoints, getUserTier, LoyaltyInfo } from '../utils/loyalty';

const VOUCHER_OPTIONS = [
  {
    id: 'reward-20k',
    points: 100,
    value: 20000,
    title: 'Voucher 20.000đ',
    description: 'Áp dụng cho mọi đơn hàng tại REMIX.AI',
    color: 'from-blue-50 to-indigo-50 border-blue-200 text-blue-900',
    btnColor: 'bg-blue-600 hover:bg-blue-700'
  },
  {
    id: 'reward-50k',
    points: 200,
    value: 50000,
    title: 'Voucher 50.000đ',
    description: 'Áp dụng cho mọi đơn hàng tại REMIX.AI',
    color: 'from-amber-50 to-yellow-50 border-amber-200 text-amber-950',
    btnColor: 'bg-amber-600 hover:bg-amber-700'
  },
  {
    id: 'reward-150k',
    points: 500,
    value: 150000,
    title: 'Voucher 150.000đ',
    subtitle: 'Miễn phí ship',
    description: 'Giảm ngay 150.000đ + Miễn phí vận chuyển toàn quốc',
    color: 'from-emerald-50 to-teal-50 border-emerald-200 text-emerald-950',
    btnColor: 'bg-emerald-600 hover:bg-emerald-700'
  }
];

interface LoyaltyProgramProps {
  currentUser?: { username: string; email?: string; phone?: string } | null;
  onNavigateTab: (tab: string) => void;
  onNavigateProduct?: (product: any) => void;
}

export default function LoyaltyProgram({ currentUser, onNavigateTab, onNavigateProduct }: LoyaltyProgramProps) {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyInfo>({ points: 0, tier: 'silver', history: [] });
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  
  // Redeem states
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null);
  const [redeemedValue, setRedeemedValue] = useState<string>('');
  const [copiedRedeemed, setCopiedRedeemed] = useState(false);

  // Referral input states
  const [friendName, setFriendName] = useState('');
  const [friendContact, setFriendContact] = useState('');
  const [referralStatus, setReferralStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [referralMsg, setReferralMsg] = useState('');
  
  const currentUsername = currentUser?.username || '';
  const refCode = `REMIX-${currentUsername.toUpperCase().replace(/[^A-Z0-9]/g, '') || 'GUEST'}`;
  const refLink = `https://remix.ai/register?ref=${currentUsername || 'guest'}`;

  const loadLoyalty = () => {
    if (currentUsername) {
      setLoyaltyData(getLoyaltyInfo(currentUsername));
    }
  };

  const handleRedeemVoucher = (option: typeof VOUCHER_OPTIONS[0]) => {
    if (!currentUsername) return;
    const points = loyaltyData.points;
    if (points < option.points) return;

    // Generate random code REWARD-XXXX
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codeSuffix = '';
    for (let i = 0; i < 4; i++) {
      codeSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const code = `REWARD-${codeSuffix}`;

    // Minus points
    const textDesc = `Đổi quà: ${option.title}${option.subtitle ? ` (${option.subtitle})` : ''}`;
    const updated = addLoyaltyPoints(currentUsername, -option.points, textDesc);
    setLoyaltyData(updated);

    // Save to remix_vouchers in localStorage
    try {
      const savedVouchers = localStorage.getItem('remix_vouchers');
      let vouchersList = [];
      if (savedVouchers) {
        vouchersList = JSON.parse(savedVouchers);
      } else {
        vouchersList = [
          { id: '1', code: 'REMIX10', discountType: 'percentage', value: 10, minOrderValue: 500000, maxUses: 0, usedCount: 0, expiryDate: '2026-12-31', applicableBranches: ['All'] },
          { id: '2', code: 'NEWUSER', discountType: 'fixed', value: 50000, minOrderValue: 0, maxUses: 1, usedCount: 0, expiryDate: '2026-12-31', applicableBranches: ['All'] },
          { id: '3', code: 'SALE25', discountType: 'percentage', value: 25, minOrderValue: 0, maxUses: 0, usedCount: 0, expiryDate: '2026-12-31', applicableBranches: ['All'] }
        ];
      }

      vouchersList.push({
        id: `R-${Date.now()}`,
        code: code,
        discountType: 'fixed',
        value: option.value,
        minOrderValue: 0,
        maxUses: 1,
        usedCount: 0,
        expiryDate: '2026-12-31',
        applicableBranches: ['All']
      });

      localStorage.setItem('remix_vouchers', JSON.stringify(vouchersList));
      window.dispatchEvent(new Event('remix_vouchers_changed'));
    } catch (err) {
      console.error('Error saving voucher to localStorage:', err);
    }

    // Save to remix_loyalty_users.redeemHistory
    try {
      const storedLoyalty = localStorage.getItem('remix_loyalty_users');
      if (storedLoyalty) {
        const obj = JSON.parse(storedLoyalty);
        if (!obj.redeemHistory) obj.redeemHistory = [];
        const fullUser = obj.users?.find((u: any) => u.username === currentUsername);
        const displayName = fullUser?.name || currentUsername;
        const uId = fullUser?.id || `U-${Math.floor(Date.now() / 1000)}`;
        
        const now = new Date();
        const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
        
        obj.redeemHistory.unshift({
          userId: uId,
          userName: displayName,
          reward: option.title,
          pointsUsed: option.points,
          date: dateStr,
          code: code
        });
        localStorage.setItem('remix_loyalty_users', JSON.stringify(obj));
        window.dispatchEvent(new Event('remix_loyalty_rate_changed'));
      }
    } catch (e) {
      console.error('Error saving to remix_loyalty_users.redeemHistory:', e);
    }

    setRedeemedCode(code);
    setRedeemedValue(`${option.title}${option.subtitle ? ` + ${option.subtitle}` : ''}`);
    setCopiedRedeemed(false);
  };

  useEffect(() => {
    if (!localStorage.getItem('remix_loyalty_users')) {
      const defaultLoyaltyData = {
        settings: {
          pointsPerAmount: 1,      // 10.000đ = 1 điểm
          silverMin: 0,
          goldMin: 500,
          diamondMin: 2000,
          rewards: [
            {id:'R1', points:100, value:'Voucher 20.000đ', code:'REWARD20K'},
            {id:'R2', points:200, value:'Voucher 50.000đ', code:'REWARD50K'},
            {id:'R3', points:500, value:'Voucher 150.000đ + Free ship', code:'REWARD150K'}
          ]
        },
        users: [
          {id:'U001', name:'Nguyễn Văn A', email:'a@gmail.com', phone:'0901234567', points:1250, tier:'diamond', totalSpent:12500000, totalOrders:8, joinDate:'15/01/2026', username:'nguyenvana'},
          {id:'U002', name:'Trần Thị B', email:'b@gmail.com', phone:'0912345678', points:680, tier:'gold', totalSpent:6800000, totalOrders:5, joinDate:'20/02/2026', username:'tranthib'},
          {id:'U003', name:'Lê Minh C', email:'c@gmail.com', phone:'0923456789', points:320, tier:'silver', totalSpent:3200000, totalOrders:3, joinDate:'10/03/2026', username:'leminhc'},
          {id:'U004', name:'Phạm Thu D', email:'d@gmail.com', phone:'0934567890', points:890, tier:'gold', totalSpent:8900000, totalOrders:6, joinDate:'05/02/2026', username:'phamthud'},
          {id:'U005', name:'Hoàng Văn E', email:'e@gmail.com', phone:'0945678901', points:2100, tier:'diamond', totalSpent:21000000, totalOrders:12, joinDate:'01/01/2026', username:'hoangvane'}
        ],
        redeemHistory: [
          {userId:'U001', userName:'Nguyễn Văn A',
           reward:'Voucher 50.000đ', pointsUsed:200,
           date:'20/05/2026', code:'REWARD50K-001'},
          {userId:'U002', userName:'Trần Thị B',
           reward:'Voucher 20.000đ', pointsUsed:100,
           date:'18/05/2026', code:'REWARD20K-002'}
        ]
      };
      localStorage.setItem('remix_loyalty_users', JSON.stringify(defaultLoyaltyData));
    }
    loadLoyalty();

    // Event listener for updates (e.g. from purchases or reviews)
    const handleLoyaltyChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.username === currentUsername) {
        setLoyaltyData(customEvent.detail.updatedInfo);
      }
    };

    window.addEventListener('remix_loyalty_changed', handleLoyaltyChange);
    return () => {
      window.removeEventListener('remix_loyalty_changed', handleLoyaltyChange);
    };
  }, [currentUsername]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(refLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(refCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendName.trim() || !friendContact.trim()) {
      setReferralStatus('error');
      setReferralMsg('Vui lòng điền đầy đủ Họ tên và Liên hệ của bạn bè.');
      return;
    }

    if (!currentUsername) {
      setReferralStatus('error');
      setReferralMsg('Vui lòng đăng nhập để giới thiệu bạn bè.');
      return;
    }

    // Award +100 points
    const rewardPoints = 100;
    const desc = `Giới thiệu thành viên: ${friendName.trim()} (${friendContact.trim()})`;
    const updated = addLoyaltyPoints(currentUsername, rewardPoints, desc);
    setLoyaltyData(updated);

    setReferralStatus('success');
    setReferralMsg(`Gửi lời mời thành công! Bạn được cộng +${rewardPoints} điểm Loyalty thưởng.`);
    setFriendName('');
    setFriendContact('');
    
    setTimeout(() => {
      setReferralStatus('idle');
      setReferralMsg('');
    }, 4500);
  };

  if (!currentUser) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-8 bg-gray-50/50 min-h-[70vh] font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white border border-gray-100 rounded-[2.5rem] p-8 text-center shadow-xl shadow-gray-250/20"
        >
          <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6 border border-primary/10">
            <Award size={42} className="animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-3">Tích điểm Loyalty & Quà tặng</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Trở thành hội viên thân thiết của REMIX.AI để tích điểm từ mọi giao dịch, nhận hoàn tiền, voucher đặc quyền cùng quà tặng công nghệ miễn phí cực khủng!
          </p>
          
          <div className="space-y-4 mb-8 text-left bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">QUY TẮC CỘNG ĐIỂM TIÊU BIỂU:</h4>
            <div className="space-y-2 text-xs font-medium text-gray-600">
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span>🎁 Đăng ký tài khoản mới:</span>
                <span className="font-extrabold text-emerald-600">+50 điểm</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span>🛒 Mỗi 10.000đ mua sắm:</span>
                <span className="font-extrabold text-emerald-600">+1 điểm</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span>⭐ Viết đánh giá sản phẩm:</span>
                <span className="font-extrabold text-emerald-600">+5 điểm</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>👥 Giới thiệu thêm bạn bè:</span>
                <span className="font-extrabold text-emerald-600">+100 điểm/người</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => onNavigateTab('consult')}
            className="w-full py-4 bg-green-600 text-white font-black rounded-2xl shadow-lg shadow-green-600/25 hover:bg-green-700 transition-all uppercase text-xs tracking-widest"
          >
            Đăng nhập / Đăng ký ngay
          </button>
        </motion.div>
      </div>
    );
  }

  const points = loyaltyData.points;
  const tier = getUserTier(points);

  // Calculate points progress to next tier
  let nextTierPoints = 500;
  let prevTierPoints = 0;
  let nextTierName = 'Vàng';
  if (points >= 500 && points < 2000) {
    prevTierPoints = 500;
    nextTierPoints = 2000;
    nextTierName = 'Kim Cương';
  } else if (points >= 2000) {
    prevTierPoints = 2000;
    nextTierPoints = 999999;
    nextTierName = 'Tối Đa';
  }

  const currentTierProgress = nextTierPoints === 999999 
    ? 100 
    : Math.min(100, Math.max(0, ((points - prevTierPoints) / (nextTierPoints - prevTierPoints)) * 100));

  return (
    <div className="flex-grow bg-gray-50/50 p-4 md:p-8 overflow-y-auto leading-relaxed font-sans text-left">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-[#185FA5]/10 text-primary-dark text-xs font-black tracking-wider uppercase">Chương trình Khách hàng Thân thiết</span>
              <span className="animate-pulse flex h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-1">Câu Lạc Bộ Điểm Thưởng REMIX</h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
            <span className="px-3 py-1.5 bg-gray-100 rounded-full flex items-center gap-1">
              <User size={13} className="text-[#185FA5]" />
              {currentUsername}
            </span>
          </div>
        </div>

        {/* PHẦN GIỮA — ĐỔI ĐIỂM LẤY VOUCHER */}
        <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm space-y-4" id="loyalty-voucher-redemption shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-[#185FA5]/10 rounded-2xl text-[#185FA5] shrink-0">
                <Gift className="w-5.5 h-5.5" />
              </div>
              <div className="text-left">
                <h2 className="text-base font-black tracking-tight text-gray-900">Đổi Điểm Lấy Voucher Đặc Quyền</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Một chạm đổi quà, tha hồ mua sắm không lo về giá</p>
              </div>
            </div>
            <div className="text-xs font-extrabold text-[#185FA5] bg-[#185FA5]/10 px-4 py-2 rounded-full select-none shrink-0 border border-[#185FA5]/10">
              Ví điểm Loyalty: <span className="font-black text-sm text-[#185FA5]">{points.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
            {VOUCHER_OPTIONS.map((opt) => {
              const hasEnough = points >= opt.points;
              const needed = opt.points - points;

              return (
                <div 
                  key={opt.id} 
                  className={`relative overflow-hidden p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between min-h-[185px] bg-gradient-to-br ${opt.color} ${
                    hasEnough ? 'hover:shadow-md hover:-translate-y-1' : 'opacity-80'
                  }`}
                >
                  {/* Decorative faint background element */}
                  <div className="absolute -top-6 -right-6 text-slate-900/[0.04] font-black select-none text-[8.5rem] leading-none pointer-events-none">
                    %
                  </div>

                  {/* Header content styling */}
                  <div className="relative z-10 text-left space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black tracking-widest uppercase bg-white/70 px-2.5 py-1 rounded-full text-slate-800 shadow-sm border border-slate-100/50">
                        {opt.points} điểm
                      </span>
                      {opt.subtitle && (
                        <span className="text-[9px] font-extrabold uppercase bg-emerald-500 text-white px-2 py-0.5 rounded-md animate-pulse shadow-sm">
                          {opt.subtitle}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 tracking-tight">{opt.title}</h3>
                      <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-1">{opt.description}</p>
                    </div>
                  </div>

                  {/* Redeem Button structure */}
                  <div className="relative z-10 mt-4 group">
                    <button
                      onClick={() => handleRedeemVoucher(opt)}
                      disabled={!hasEnough}
                      className={`w-full py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all duration-200 shadow-sm ${
                        hasEnough 
                          ? `${opt.btnColor} text-white hover:shadow-md hover:scale-[1.01] active:scale-[0.99]`
                          : 'bg-slate-100 text-slate-400 border border-slate-200/50 cursor-not-allowed'
                      }`}
                    >
                      Đổi ngay
                    </button>

                    {/* Accurate hover tooltip if user is points deficient */}
                    {!hasEnough && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] bg-slate-950 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-xl opacity-0 scale-95 origin-bottom group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none z-30 select-none text-center">
                        Cần thêm {needed} điểm
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-950" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dashboard Grid Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Loyalty Card - 5 cols */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Membership Platinum Card visual style */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="relative overflow-hidden bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E293B] rounded-[2.5rem] p-6 text-white shadow-xl shadow-slate-900/10 border border-slate-800"
            >
              {/* Overlay abstract art pattern */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-tr from-cyan-500/20 to-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-gradient-to-tr from-[#185FA5]/20 to-lime-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex justify-between items-start relative z-10 mb-8">
                <div className="flex gap-2.5 items-center">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                    <Trophy className="text-yellow-400 w-5.5 h-5.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-[#94A3B8] uppercase block">REMIX MEMBERSHIP</span>
                    <span className="text-xs font-bold text-gray-200">Hội viên thân thiết</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {tier.tierKey === 'silver' ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 border border-slate-600 rounded-full text-slate-300 font-extrabold text-[11px] uppercase tracking-wider" id="loyalty-badge">
                      <Medal className="w-3.5 h-3.5 text-slate-400" />
                      <span>Bạc</span>
                    </div>
                  ) : tier.tierKey === 'gold' ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/50 border border-amber-600 rounded-full text-amber-300 font-extrabold text-[11px] uppercase tracking-wider" id="loyalty-badge">
                      <Medal className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Vàng</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-950/50 border border-blue-600 rounded-full text-sky-200 font-extrabold text-[11px] uppercase tracking-wider" id="loyalty-badge">
                      <Diamond className="w-3.5 h-3.5 text-sky-300 fill-sky-500" />
                      <span>Kim Cương</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative z-10 mb-6">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">TÀI KHOẢN TÍCH ĐIỂM</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-4xl font-extrabold tracking-tight text-white font-sans">{points.toLocaleString('vi-VN')}</span>
                  <span className="text-xs text-emerald-400 font-black">điểm</span>
                </div>
              </div>

              <div className="relative z-10 space-y-4 pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">HẠNG THẺ HIỆN TẠI</span>
                    <span className={`text-xs ml-0.5 font-black uppercase mt-0.5 tracking-tight ${tier.color}`.replace('text-', 'text-indigo-400')}>
                      {tier.name}
                    </span>
                  </div>
                  {nextTierPoints !== 999999 && (
                    <span className="text-[9px] bg-slate-800 text-slate-300 font-extrabold px-2 py-1 rounded-full uppercase tracking-wider">
                      +{nextTierPoints - points}đ đến hạng kế
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                {nextTierPoints !== 999999 && (
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-700"
                        style={{ width: `${currentTierProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-[#94A3B8] font-bold">
                      <span>{prevTierPoints}đ</span>
                      <span>Hiện tại: {points}đ</span>
                      <span>{nextTierPoints}đ ({nextTierName})</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Refer Friend Form Card */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                  <UserPlus size={16} />
                </div>
                <div>
                  <h3 className="text-[13px] font-black text-gray-900 tracking-tight">Hộp thư Giới thiệu Bạn bè</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Mỗi lượt thành công nhận ngay +100 điểm</p>
                </div>
              </div>

              <form onSubmit={handleSendReferral} className="space-y-3 font-sans mt-2">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Họ và tên bạn bè</label>
                  <input 
                    type="text" 
                    placeholder="Nhập tên người được giới thiệu" 
                    value={friendName}
                    onChange={(e) => setFriendName(e.target.value)}
                    className="w-full bg-gray-50/70 border border-gray-250/50 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-850 placeholder:text-gray-300 focus:ring-2 focus:ring-[#185FA5]/10 outline-none transition-all mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Email hoặc Số điện thoại bạn bè</label>
                  <input 
                    type="text" 
                    placeholder="VD: banthan@gmail.com hoặc SĐT" 
                    value={friendContact}
                    onChange={(e) => setFriendContact(e.target.value)}
                    className="w-full bg-gray-50/70 border border-gray-250/50 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-850 placeholder:text-gray-300 focus:ring-2 focus:ring-[#185FA5]/10 outline-none transition-all mt-1"
                  />
                </div>

                <AnimatePresence mode="wait">
                  {referralStatus !== 'idle' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`text-[10px] font-bold p-3 rounded-xl border flex items-center gap-1.5 leading-relaxed ${
                        referralStatus === 'success' 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}
                    >
                      {referralStatus === 'success' ? <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" /> : <HelpCircle size={13} className="text-red-500 flex-shrink-0" />}
                      <span>{referralMsg}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button 
                  type="submit"
                  className="w-full py-3 bg-[#185FA5] text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-[#134D82] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send size={12} />
                  Gửi lời mời & Nhận 100đ
                </button>
              </form>
            </div>

            {/* Quick Share Code */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-gray-900 tracking-tight">Mã Giới Thiệu Cá Nhân</h3>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={refCode} 
                  className="bg-gray-50 border border-gray-200 text-center text-xs font-mono font-bold text-gray-800 rounded-xl px-3 py-2 flex-grow outline-none"
                />
                <button 
                  onClick={handleCopyCode} 
                  className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all"
                  title="Copy mã giới thiệu"
                >
                  {copiedCode ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={refLink} 
                  className="bg-gray-50 border border-gray-200 text-xs font-mono text-gray-400 rounded-xl px-3 py-2 flex-grow outline-none truncate"
                />
                <button 
                  onClick={handleCopyLink} 
                  className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all"
                  title="Copy link giới thiệu"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Rule lists & History table - 7 cols */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Direct Rewards Rules Breakdown (Hệ thống điểm thưởng) */}
            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm space-y-4">
              <h2 className="text-[15px] font-black tracking-tight text-gray-900">Quy Tắc Tích Lũy Điểm Thưởng</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                
                {/* Rule 1 */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col justify-between gap-3 text-left">
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-extrabold text-xs">
                      1đ
                    </div>
                    <h4 className="text-xs font-extrabold text-gray-850">Mỗi 10.000đ mua hàng</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">Hệ thống tự động quy đổi và cộng thẳng vào ví Loyalty khi đơn hàng được đặt.</p>
                  </div>
                  <button 
                    onClick={() => onNavigateTab('search')}
                    className="flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-600 hover:underline mt-1 border-0 bg-transparent cursor-pointer p-0"
                  >
                    Mua sắm ngay
                    <ChevronRight size={12} />
                  </button>
                </div>

                {/* Rule 2 */}
                <div className="p-4 rounded-2xl bg-[#185FA5]/5 border border-[#185FA5]/10 flex flex-col justify-between gap-3 text-left">
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-[#185FA5]/10 text-[#185FA5] flex items-center justify-center font-extrabold text-xs">
                      +5đ
                    </div>
                    <h4 className="text-xs font-extrabold text-gray-850">Đánh giá sản phẩm</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">Viết phản hồi khách quan sau khi trải nghiệm sản phẩm để được tích điểm.</p>
                  </div>
                  <button 
                    onClick={() => onNavigateTab('search')}
                    className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#185FA5] hover:underline mt-1 border-0 bg-transparent cursor-pointer p-0"
                  >
                    Viết đánh giá
                    <ChevronRight size={12} />
                  </button>
                </div>

                {/* Rule 3 */}
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex flex-col justify-between gap-3 text-left">
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-extrabold text-xs">
                      +50đ
                    </div>
                    <h4 className="text-xs font-extrabold text-gray-850">Đăng ký tài khoản</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">Nhận ngay món quà khởi hành hấp dẫn trị giá 50 điểm Loyalty tức thì.</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-amber-600 font-extrabold">
                    <Check size={11} className="stroke-[3]" /> Được ghi nhận
                  </div>
                </div>

                {/* Rule 4 */}
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col justify-between gap-3 text-left">
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-extrabold text-xs">
                      +100đ
                    </div>
                    <h4 className="text-xs font-extrabold text-gray-850">Giới thiệu bạn bè</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">Không giới hạn số người thân giới thiệu nhận quà tích điểm cực chất.</p>
                  </div>
                  <div className="text-[10px] text-indigo-500 font-bold">100 điểm / người</div>
                </div>

              </div>
            </div>

            {/* Loyalty Ledger (Lịch sử tích lũy điểm) */}
            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm flex-grow flex flex-col min-h-[320px]">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <h3 className="text-[14px] font-black text-gray-900 tracking-tight">Nhật Ký Tích Điểm Loyalty</h3>
                </div>
                <span className="text-[10px] bg-gray-50 px-2 py-1 rounded border border-gray-200/50 font-モノ text-gray-400">
                  {loyaltyData.history.length} giao dịch
                </span>
              </div>

              {loyaltyData.history.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center py-10 text-gray-400 text-xs text-center border-2 border-dashed border-gray-100 rounded-2xl">
                  <ArrowLeftRight size={24} className="mb-2 text-gray-300" />
                  <p className="font-bold text-gray-500">Chưa ghi nhận hoạt động tích lũy</p>
                  <p className="text-[10px] mt-0.5">Mọi điểm thưởng cộng trừ sẽ xuất hiện tại tab này</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-[#A0AEC0] font-bold text-[10px] uppercase tracking-wider">
                        <th className="py-2.5 pb-2">Ngày</th>
                        <th className="py-2.5 pb-2">Hoạt động</th>
                        <th className="py-2.5 pb-2 text-center">Điểm nhận/trừ</th>
                        <th className="py-2.5 pb-2 text-right">Số dư</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                      {(() => {
                        // Calculate running balances chronologically before rendering
                        const reversed = [...loyaltyData.history].reverse();
                        let tempBal = 0;
                        const withBalances = reversed.map((log) => {
                          tempBal += log.points;
                          return { ...log, runningBalance: tempBal };
                        });
                        // Back to newest matches
                        const finalHistory = withBalances.reverse();

                        return finalHistory.map((log) => {
                          const isAdd = log.points >= 0;
                          const dateObj = new Date(log.timestamp);
                          const displayDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;

                          return (
                            <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-3 font-mono text-[10px] text-gray-400 whitespace-nowrap">
                                {displayDate}
                              </td>
                              <td className="py-3 font-semibold text-gray-800 pr-2">
                                {log.reason}
                              </td>
                              <td className="py-3 text-center font-bold font-mono">
                                <span className={isAdd ? 'text-emerald-600 font-extrabold' : 'text-red-500 font-extrabold'}>
                                  {isAdd ? `+${log.points}` : log.points} điểm
                                </span>
                              </td>
                              <td className="py-3 text-right font-bold text-slate-800 font-mono whitespace-nowrap">
                                {log.runningBalance} điểm
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Success Modal for redeemed voucher */}
      <AnimatePresence>
        {redeemedCode && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-gray-100 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative text-center font-sans overflow-hidden"
            >
              {/* Visual success banner art */}
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-5 border border-emerald-100 shadow-sm shadow-emerald-500/5">
                <Check className="w-8 h-8 stroke-[2.5]" />
              </div>

              <h2 className="text-xl font-black text-gray-900 tracking-tight">Đổi thành công!</h2>
              <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                Bạn đã đổi điểm lấy thành công quà tặng:<br />
                <span className="font-extrabold text-slate-800">{redeemedValue}</span>
              </p>

              {/* Voucher ticket visualization */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mt-5 mb-6 relative">
                {/* Left and right ticket cutouts */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-r border-slate-250/60" />
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-l border-slate-250/60" />

                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">MÃ KHUYẾN MÃI CỦA BẠN</span>
                <div className="flex items-center justify-center gap-3 mt-1.5">
                  <span className="text-lg font-mono font-black text-slate-800 tracking-wide">
                    {redeemedCode}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(redeemedCode);
                      setCopiedRedeemed(true);
                      setTimeout(() => setCopiedRedeemed(false), 2000);
                    }}
                    className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 active:scale-95 transition-all shadow-sm shrink-0"
                    title="Copy mã voucher"
                  >
                    {copiedRedeemed ? <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-emerald-600 font-extrabold mb-5 leading-normal bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-100 inline-block">
                Mã của bạn: {redeemedCode}
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => setRedeemedCode(null)}
                  className="w-full py-3 bg-[#185FA5] text-white font-extrabold rounded-2xl shadow-md hover:bg-[#134D82] transition-all uppercase text-xs tracking-widest"
                >
                  Đóng &amp; Tiếp Tục
                </button>
                <p className="text-[9px] text-slate-400 font-semibold leading-normal">
                  Mã voucher này đã được lưu vào ví Voucher của bạn. Áp dụng ngay tại khung thanh toán của REMIX.AI
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
