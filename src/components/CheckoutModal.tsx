import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Phone, MapPin, CreditCard, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, ChevronDown } from 'lucide-react';
import { CartItem, Coupon } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (info: { fullName: string; phoneNumber: string; address: string; discountCode?: string; discountAmount?: number }) => void;
  initialInfo: { fullName: string; phoneNumber: string; address: string };
  totalPrice: number;
  cartItems?: CartItem[];
  currentUser?: { username: string; email?: string; phone?: string } | null;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  onSubmit,
  initialInfo,
  totalPrice,
  cartItems = [],
  currentUser = null,
}: CheckoutModalProps) {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [fullName, setFullName] = useState(initialInfo.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(initialInfo.phoneNumber || '');
  const [address, setAddress] = useState(initialInfo.address || '');
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');

  const [errors, setErrors] = useState<{ fullName?: string; phoneNumber?: string; address?: string }>({});
  const [touched, setTouched] = useState<{ fullName?: boolean; phoneNumber?: boolean; address?: boolean }>({});

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; description: string } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccessMsg, setCouponSuccessMsg] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'transfer'>('cod');

  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;
    return appliedCoupon.discountAmount;
  };

  const handleApplyCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    const code = couponCodeInput.trim().toUpperCase();
    if (!code) {
      setCouponError('Vui lòng nhập mã giảm giá.');
      setCouponSuccessMsg(null);
      setAppliedCoupon(null);
      return;
    }

    let discount = 0;
    let promoDesc = '';

    // Check custom coupons/vouchers from localStorage 'remix_vouchers'
    let foundCoupon: Coupon | null = null;
    try {
      const savedVouchers = localStorage.getItem('remix_vouchers');
      let vouchersList: Coupon[] = [];
      if (savedVouchers) {
        vouchersList = JSON.parse(savedVouchers);
      } else {
        // Unify initialization
        vouchersList = [
          { id: '1', code: 'REMIX10', discountType: 'percentage', value: 10, minOrderValue: 500000, maxUses: 0, usedCount: 0, expiryDate: '2026-12-31', applicableBranches: ['All'] },
          { id: '2', code: 'NEWUSER', discountType: 'fixed', value: 50000, minOrderValue: 0, maxUses: 1, usedCount: 0, expiryDate: '2026-12-31', applicableBranches: ['All'] },
          { id: '3', code: 'SALE20', discountType: 'percentage', value: 20, minOrderValue: 0, maxUses: 0, usedCount: 0, expiryDate: '2026-12-31', applicableBranches: ['All'], applicableCategory: 'Laptop' }
        ] as any;
        localStorage.setItem('remix_vouchers', JSON.stringify(vouchersList));
      }
      foundCoupon = vouchersList.find((c: any) => c.code.trim().toUpperCase() === code) || null;
    } catch (err) {
      console.error('Error loading custom coupons during checkout:', err);
    }

    if (foundCoupon) {
      // Validate Coupon
      // 1. Expiration check
      const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      if (foundCoupon.expiryDate && foundCoupon.expiryDate < todayStr) {
        setCouponError('Mã giảm giá này đã hết hạn.');
        setCouponSuccessMsg(null);
        setAppliedCoupon(null);
        return;
      }

      // 2. Max uses check
      if (foundCoupon.maxUses > 0 && foundCoupon.usedCount >= foundCoupon.maxUses) {
        setCouponError('Mã giảm giá đã hết lượt sử dụng.');
        setCouponSuccessMsg(null);
        setAppliedCoupon(null);
        return;
      }

      // 2b. Special "dùng 1 lần/user" check for NEWUSER or any maxUses: 1 / user
      if (foundCoupon.code === 'NEWUSER') {
        let hasUsed = false;
        try {
          const savedOrdersStr = localStorage.getItem('remix_orders') || localStorage.getItem('remix_placed_orders');
          if (savedOrdersStr) {
            const ordersList = JSON.parse(savedOrdersStr);
            hasUsed = ordersList.some((order: any) => 
              (order.phone === phoneNumber || order.customerName === fullName) && 
              order.discountApplied === 'NEWUSER'
            );
          }
        } catch (err) {
          console.error('Error checking custom user usage:', err);
        }
        if (hasUsed) {
          setCouponError('Mã ưu đãi NEWUSER chỉ được sử dụng tối đa 1 lần mỗi khách hàng.');
          setCouponSuccessMsg(null);
          setAppliedCoupon(null);
          return;
        }
      }

      // 3. Minimum order threshold check
      if (totalPrice < foundCoupon.minOrderValue) {
        setCouponError(`Mã giảm giá yêu cầu đơn hàng tối thiểu từ ${foundCoupon.minOrderValue.toLocaleString('vi-VN')}đ.`);
        setCouponSuccessMsg(null);
        setAppliedCoupon(null);
        return;
      }

      // 4. Branch eligibility check
      const appBranches = foundCoupon.applicableBranches || ['All'];
      const isBranchValid = appBranches.includes('All') || appBranches.includes(selectedBranchId);
      if (!isBranchValid) {
        setCouponError('Mã này không áp dụng cho chi nhánh showroom bạn đã chọn.');
        setCouponSuccessMsg(null);
        setAppliedCoupon(null);
        return;
      }

      // Calculate discount
      // 5. Category-specific discount (e.g. SALE20 only applicable to Laptop)
      const appCategory = (foundCoupon as any).applicableCategory;
      if (appCategory) {
        const eligibleItems = cartItems.filter(item => item.product.category === appCategory);
        if (eligibleItems.length === 0) {
          setCouponError(`Mã giảm giá này chỉ áp dụng cho sản phẩm thuộc danh mục ${appCategory}.`);
          setCouponSuccessMsg(null);
          setAppliedCoupon(null);
          return;
        }
        const eligibleTotal = eligibleItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
        if (foundCoupon.discountType === 'percentage') {
          discount = Math.round(eligibleTotal * (foundCoupon.value / 100));
        } else {
          discount = foundCoupon.value;
        }
      } else {
        if (foundCoupon.discountType === 'percentage') {
          discount = Math.round(totalPrice * (foundCoupon.value / 100));
        } else {
          discount = foundCoupon.value;
        }
      }

      discount = Math.min(discount, totalPrice);
      promoDesc = foundCoupon.discountType === 'percentage' 
        ? `Giảm ${foundCoupon.value}%${appCategory ? ` danh mục ${appCategory}` : ''}` 
        : `Giảm ${foundCoupon.value.toLocaleString('vi-VN')}đ`;
    } else {
      setCouponError('Mã không hợp lệ hoặc đã hết hạn');
      setCouponSuccessMsg(null);
      setAppliedCoupon(null);
      return;
    }

    setCouponError(null);
    setAppliedCoupon({
      code,
      discountAmount: discount,
      description: promoDesc
    });
    setCouponSuccessMsg(`Áp dụng thành công! Giảm ${discount.toLocaleString('vi-VN')}đ`);
  };

  useEffect(() => {
    if (isOpen) {
      setFullName(initialInfo.fullName || '');
      setPhoneNumber(initialInfo.phoneNumber || '');
      setAddress(initialInfo.address || '');
      setErrors({});
      setTouched({});
      setCouponCodeInput('');
      setAppliedCoupon(null);
      setCouponError(null);
      setCouponSuccessMsg(null);
      setPaymentMethod('cod');

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
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [isOpen, initialInfo]);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!fullName.trim()) {
      newErrors.fullName = 'Vui lòng cung cấp Họ tên nhận hàng.';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Họ tên quá ngắn.';
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Vui lòng cung cấp Số điện thoại liên hệ.';
    } else {
      const cleanPhone = phoneNumber.replace(/\s+/g, '');
      const phoneRegex = /^(0|84)[3|5|7|8|9][0-9]{8}$/;
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.phoneNumber = 'Số điện thoại không hợp lệ (VD: 0987654321).';
      }
    }

    if (!address.trim()) {
      newErrors.address = 'Vui lòng cung cấp Địa chỉ nhận hàng chi tiết.';
    } else if (address.trim().length < 8) {
      newErrors.address = 'Địa chỉ nhận hàng cần cụ thể hơn (tối thiểu 8 ký tự).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: 'fullName' | 'phoneNumber' | 'address') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    // Quick validation for that field
    validate();
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ fullName: true, phoneNumber: true, address: true });
    if (validate()) {
      onSubmit({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim().replace(/\s+/g, ''),
        address: address.trim(),
        discountCode: appliedCoupon ? appliedCoupon.code : undefined,
        discountAmount: appliedCoupon ? getDiscountAmount() : undefined
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
            id="checkout-modal-backdrop"
          />

          {/* Modal Container */}
          <div className={`fixed inset-0 z-[160] flex justify-center overflow-hidden pointer-events-none ${
            isMobile ? 'items-end p-0' : 'items-center p-4'
          }`}>
            <motion.div
              initial={isMobile ? { y: '100%', opacity: 1 } : { scale: 0.95, opacity: 0, y: 30 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={isMobile ? { y: '100%', opacity: 1 } : { scale: 0.95, opacity: 0, y: 30 }}
              transition={
                isMobile 
                  ? { duration: 0.3, ease: [0.32, 0.72, 0, 1] } 
                  : { type: 'spring', duration: 0.5, bounce: 0.15 }
              }
              className={`bg-white w-full max-w-lg shadow-2xl relative flex flex-col pointer-events-auto ${
                isMobile 
                  ? 'rounded-t-[2.5rem] rounded-b-none p-6 pt-2 border-t border-x border-gray-100 max-h-[92vh]' 
                  : 'rounded-[2.5rem] p-6 md:p-8 border border-gray-100 max-h-[90vh]'
              }`}
              id="checkout-modal-panel"
            >
              {isMobile && (
                <div className="w-full flex justify-center py-3 shrink-0">
                  <div className="w-[36px] h-[4px] bg-gray-300 rounded-full" />
                </div>
              )}
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all z-10"
                title="Hủy bỏ"
              >
                <X size={20} />
              </button>

              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Thanh toán & Giao hàng</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Hệ thống Remix.AI</p>
                  </div>
                </div>
                <div className="bg-[#0C447C]/5 border border-[#0C447C]/10 rounded-2xl p-3 flex items-start gap-2.5 mt-4">
                  <AlertTriangle className="text-primary shrink-0 mt-0.5" size={16} />
                  <p className="text-[12px] font-medium text-[#0C447C] leading-snug">
                    Để tiếp tục thanh toán đơn hàng, quý khách vui lòng xác minh thông tin giao nhận dưới đây theo đúng quy định.
                  </p>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleConfirm} className="space-y-4 flex-grow overflow-y-auto pr-1 custom-scrollbar">
                {/* 1. Họ và tên */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">
                    1. Họ và tên khách hàng <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group/input">
                    <User className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.fullName && touched.fullName ? 'text-red-400' : 'text-gray-300 group-focus-within/input:text-primary'}`} size={18} />
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) validate();
                      }}
                      onBlur={() => handleBlur('fullName')}
                      className={`w-full bg-gray-50/50 border rounded-2xl py-3.5 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:ring-4 transition-all font-medium ${
                        errors.fullName && touched.fullName
                          ? 'border-red-300 focus:ring-red-500/5 focus:bg-white'
                          : 'border-gray-200 focus:ring-primary/5 focus:bg-white focus:border-primary/30'
                      }`}
                    />
                    {touched.fullName && !errors.fullName && fullName.trim().length >= 2 && (
                      <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={16} />
                    )}
                  </div>
                  {errors.fullName && touched.fullName && (
                    <p className="text-red-500 text-xs font-semibold pl-1 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* 2. Số điện thoại */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">
                    2. Số điện thoại nhận hàng <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group/input">
                    <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.phoneNumber && touched.phoneNumber ? 'text-red-400' : 'text-gray-300 group-focus-within/input:text-primary'}`} size={18} />
                    <input
                      type="tel"
                      placeholder="0987654321"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        if (errors.phoneNumber) validate();
                      }}
                      onBlur={() => handleBlur('phoneNumber')}
                      className={`w-full bg-gray-50/50 border rounded-2xl py-3.5 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:ring-4 transition-all font-medium ${
                        errors.phoneNumber && touched.phoneNumber
                          ? 'border-red-300 focus:ring-red-500/5 focus:bg-white'
                          : 'border-gray-200 focus:ring-primary/5 focus:bg-white focus:border-primary/30'
                      }`}
                    />
                    {touched.phoneNumber && !errors.phoneNumber && phoneNumber.trim().length >= 9 && (
                      <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={16} />
                    )}
                  </div>
                  {errors.phoneNumber && touched.phoneNumber && (
                    <p className="text-red-500 text-xs font-semibold pl-1 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* 3. Địa chỉ nhận hàng */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">
                    3. Địa chỉ nhận hàng <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group/input">
                    <MapPin className={`absolute left-4 top-4 transition-colors ${errors.address && touched.address ? 'text-red-400' : 'text-gray-300 group-focus-within/input:text-primary'}`} size={18} />
                    <textarea
                      placeholder="Số 1 Đại Cồ Việt, Phường Bách Khoa, Quận Hai Bà Trưng, Hà Nội"
                      rows={2}
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (errors.address) validate();
                      }}
                      onBlur={() => handleBlur('address')}
                      className={`w-full bg-gray-50/50 border rounded-2xl py-3.5 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:ring-4 transition-all font-medium resize-none ${
                        errors.address && touched.address
                          ? 'border-red-300 focus:ring-red-500/5 focus:bg-white'
                          : 'border-gray-200 focus:ring-primary/5 focus:bg-white focus:border-primary/30'
                      }`}
                    />
                    {touched.address && !errors.address && address.trim().length >= 8 && (
                      <CheckCircle2 className="absolute right-4 top-4 text-green-500" size={16} />
                    )}
                  </div>
                  {errors.address && touched.address && (
                    <p className="text-red-500 text-xs font-semibold pl-1 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* 4. Chi nhánh mua hàng */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">
                    4. Chi nhánh showroom xử lý <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedBranchId}
                      onChange={(e) => {
                        setSelectedBranchId(e.target.value);
                        localStorage.setItem('remix_selected_branch_id', e.target.value);
                        window.dispatchEvent(new Event('remix_branch_changed'));
                      }}
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3.5 pl-4 pr-10 text-sm text-gray-900 outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary/30 transition-all font-semibold appearance-none cursor-pointer"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.address})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium pl-1">
                    Đơn hàng sẽ được kiểm tra kho hàng và vận chuyển trực tiếp từ chi nhánh showroom này.
                  </p>
                </div>

                {/* 5. Mã giảm giá */}
                <div className="space-y-1.5 pt-1 font-sans">
                  <label className="text-[13px] font-bold text-gray-700 block ml-0.5">
                    Mã giảm giá
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nhập mã VD: REMIX10"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      className="flex-grow bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2 h-[40px] text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary/30 transition-all font-semibold uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="bg-[#185FA5] hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-5 rounded-xl transition-all shadow-md shrink-0 h-[40px] flex items-center justify-center cursor-pointer"
                    >
                      Áp dụng
                    </button>
                  </div>
                  
                  {couponError && (
                    <p className="text-red-500 text-xs font-semibold pl-0.5">
                      {couponError}
                    </p>
                  )}
                  {couponSuccessMsg && (
                    <p className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 font-bold text-xs px-3 py-1.5 rounded-xl border border-green-200/50 mt-1">
                      <CheckCircle2 size={13} className="text-green-600 shrink-0" />
                      <span>{couponSuccessMsg}</span>
                    </p>
                  )}
                </div>

                {/* 6. Chọn phương thức thanh toán */}
                <div className="space-y-1.5 pt-1 font-sans">
                  <label className="text-[13px] font-bold text-gray-700 block ml-0.5">
                    Phương thức thanh toán
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`border rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all select-none ${paymentMethod === 'cod' ? 'border-[#185FA5] bg-[#185FA5]/5 text-[#185FA5]' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-extrabold">Giao hàng COD</span>
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="sr-only"
                        />
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${paymentMethod === 'cod' ? 'border-[#185FA5]' : 'border-gray-300'}`}>
                          {paymentMethod === 'cod' && <div className="w-1.5 h-1.5 rounded-full bg-[#185FA5]" />}
                        </div>
                      </div>
                      <span className="text-[10px] opacity-80 mt-1 font-medium text-left">Thanh toán khi nhận hàng</span>
                    </label>

                    <label className={`border rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all select-none ${paymentMethod === 'transfer' ? 'border-[#185FA5] bg-[#185FA5]/5 text-[#185FA5]' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-extrabold">Chuyển khoản QR</span>
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'transfer'}
                          onChange={() => setPaymentMethod('transfer')}
                          className="sr-only"
                        />
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${paymentMethod === 'transfer' ? 'border-[#185FA5]' : 'border-gray-300'}`}>
                          {paymentMethod === 'transfer' && <div className="w-1.5 h-1.5 rounded-full bg-[#185FA5]" />}
                        </div>
                      </div>
                      <span className="text-[10px] opacity-80 mt-1 font-medium text-left font-sans">Quét mã QR qua ngân hàng</span>
                    </label>
                  </div>
                </div>

                {/* Pricing Summary Table */}
                <div className="bg-gray-50 rounded-2xl p-4 mt-6 border border-gray-100 space-y-2.5 text-sm shrink-0 font-sans">
                  <div className="flex justify-between text-xs text-gray-500 font-semibold">
                    <span>Tạm tính:</span>
                    <span className="text-gray-800">{totalPrice.toLocaleString('vi-VN')}đ</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-xs text-emerald-600 font-bold bg-emerald-50/60 p-2 rounded-xl border border-emerald-100/60">
                      <span>Giảm giá ({appliedCoupon.code}):</span>
                      <span>-{getDiscountAmount().toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-gray-500 font-semibold">
                    <span>Phí vận chuyển:</span>
                    <span className="text-gray-800 font-medium">30.000đ</span>
                  </div>
                  <div className="h-px bg-gray-200/60 my-1" />
                  <div className="flex items-center justify-between font-black pt-1">
                    <span className="text-gray-900 text-xs tracking-wider uppercase">TỔNG CỘNG:</span>
                    <span className="text-primary text-xl font-black tracking-tight shrink-0 font-sans">
                      {Math.max(0, totalPrice - getDiscountAmount() + 30000).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </form>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-gray-100 mt-6 flex flex-col sm:flex-row gap-3 bg-white shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 border border-gray-200 rounded-[1.5rem] text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all font-black text-xs uppercase tracking-wider text-center"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-wider shadow-md shadow-primary/10 hover:shadow-lg transition-all text-center flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} />
                  Xác nhận đặt hàng
                </button>
              </div>

              {/* Secure footer badge */}
              <div className="mt-4 flex justify-center items-center gap-1.5 text-gray-400 opacity-80 text-[10px] font-bold uppercase tracking-widest shrink-0">
                <ShieldCheck size={12} className="text-green-500" />
                <span>Thanh toán an toàn bảo mật mã hóa SSL</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
