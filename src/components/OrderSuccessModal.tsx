import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X, Mail, ShoppingBag, ArrowRight, ClipboardCheck, Phone, MapPin, Building, Calendar, Info, Globe, ShieldCheck } from 'lucide-react';
import { CartItem } from '../types';
import { getLoyaltyInfo, calculateEarnedPoints } from '../utils/loyalty';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails: {
    orderId: string;
    fullName: string;
    phoneNumber: string;
    address: string;
    totalAmount: number;
    items: CartItem[];
    branchName: string;
    discountCode?: string;
    discountAmount?: number;
  } | null;
  currentUserEmail?: string;
  currentUser?: { username: string; email?: string; phone?: string } | null;
  onViewLoyalty?: () => void;
}

export default function OrderSuccessModal({
  isOpen,
  onClose,
  orderDetails,
  currentUserEmail = 'khachhang@gmail.com',
  currentUser = null,
  onViewLoyalty,
}: OrderSuccessModalProps) {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !orderDetails) return null;

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(`#ORD-${orderDetails.orderId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date().toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const subtotal = orderDetails.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingFee = 30000;
  const finalPrice = Math.max(0, subtotal - (orderDetails.discountAmount || 0) + shippingFee);

  const earnedPoints = calculateEarnedPoints(finalPrice);
  const loyaltyInfo = currentUser ? getLoyaltyInfo(currentUser.username) : null;
  const tierName = loyaltyInfo ? (loyaltyInfo.points < 500 ? 'Bạc' : loyaltyInfo.points < 2000 ? 'Vàng' : 'Kim Cương') : '';

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-[9999] flex justify-center ${
        isMobile ? 'items-end p-0' : 'items-center p-4'
      }`}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0c1a30]/60 backdrop-blur-sm"
        />

        {/* Success Dialog */}
        {!showEmailPreview ? (
          <motion.div
            initial={isMobile ? { y: '100%', opacity: 1 } : { scale: 0.95, opacity: 0, y: 20 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={isMobile ? { y: '100%', opacity: 1 } : { scale: 0.95, opacity: 0, y: 20 }}
            transition={
              isMobile 
                ? { duration: 0.3, ease: [0.32, 0.72, 0, 1] } 
                : { type: 'spring', damping: 25, stiffness: 350 }
            }
            className={`relative w-full max-w-lg bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden font-sans ${
              isMobile 
                ? 'rounded-t-[2.5rem] rounded-b-none border-t border-x border-gray-100 max-h-[92vh] pb-8' 
                : 'rounded-3xl border border-gray-100'
            }`}
          >
            {isMobile && (
              <div className="w-full flex justify-center py-3 shrink-0">
                <div className="w-[36px] h-[4px] bg-gray-300 rounded-full" />
              </div>
            )}
            {/* Elegant Header Background */}
            <div className="bg-gradient-to-b from-[#0C447C]/5 to-transparent pt-8 pb-4 px-6 flex flex-col items-center">
              <div className="relative mb-3">
                {/* Micro animation rings */}
                <span className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100/60 flex items-center justify-center text-emerald-500 relative">
                  <CheckCircle2 size={36} className="stroke-[1.75]" />
                </div>
              </div>
              
              <h2 className="text-xl font-black text-gray-950 uppercase tracking-tight text-center">
                Đặt hàng thành công!
              </h2>
              <p className="text-xs text-gray-500 font-semibold mt-1 text-center max-w-[340px]">
                Cảm ơn bạn đã tin tưởng lựa chọn showroom công nghệ thông minh REMIX.AI
              </p>
            </div>

            {/* Content info */}
            <div className="px-6 py-2 overflow-y-auto max-h-[350px] space-y-4 custom-scrollbar">
              {/* Green Loyalty Points card: 🎉 Bạn vừa nhận được +129 điểm! */}
              {currentUser && loyaltyInfo && earnedPoints > 0 && (
                <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left shadow-sm">
                  <div className="space-y-0.5">
                    <p className="text-emerald-800 font-extrabold text-[13px] tracking-tight">
                      🎉 Bạn vừa nhận được +{earnedPoints} điểm!
                    </p>
                    <p className="text-emerald-700/90 font-bold text-[11px]">
                      Tổng điểm hiện tại: {loyaltyInfo.points} điểm · Hạng {tierName}
                    </p>
                  </div>
                  {onViewLoyalty && (
                    <button
                      type="button"
                      onClick={onViewLoyalty}
                      className="text-[11px] font-black text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-white hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 shrink-0 self-end sm:self-center transition-all duration-250 hover:shadow-sm active:scale-95 cursor-pointer select-none"
                    >
                      <span>Xem điểm thưởng →</span>
                    </button>
                  )}
                </div>
              )}

              {/* Order code block */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Mã đơn hàng của bạn</span>
                  <span className="text-sm font-mono font-black text-gray-900 tracking-wide">
                    #ORD-{orderDetails.orderId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  className="px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-[10px] font-bold rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  <ClipboardCheck size={12} className="text-gray-500" />
                  <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>
              </div>

              {/* Delivery Details */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Thông tin giao nhận</span>
                
                <div className="border border-gray-100 rounded-2xl p-4 space-y-3 bg-white text-xs text-gray-700 font-semibold leading-relaxed">
                  <div className="flex gap-2.5 items-start">
                    <Building size={14} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-gray-400 font-medium">Chi nhánh xử lý: </span>
                      <span className="text-gray-900 font-bold">{orderDetails.branchName}</span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-gray-400 font-medium">Địa chỉ giao hàng: </span>
                      <span className="text-gray-800">{orderDetails.address}</span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-center">
                    <Phone size={14} className="text-gray-400 shrink-0" />
                    <div>
                      <span className="text-gray-400 font-medium font-sans">Người nhận: </span>
                      <span className="text-gray-950 font-bold">{orderDetails.fullName}</span>
                      <span className="text-gray-400 mx-1.5">•</span>
                      <span className="font-mono text-gray-800 font-bold">{orderDetails.phoneNumber}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Table summary */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Chi tiết hóa đơn</span>
                <div className="border border-gray-100 rounded-2xl divide-y divide-gray-100 overflow-hidden bg-white">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="p-3 flex gap-3 items-center text-xs">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-10 h-10 object-contain rounded-lg bg-gray-50 border border-gray-100/80 shrink-0"
                      />
                      <div className="flex-grow min-w-0">
                        <div className="font-bold text-gray-800 truncate" title={item.product.name}>
                          {item.product.name}
                        </div>
                        <div className="text-[10px] text-gray-400 font-semibold mt-0.5">
                          Số lượng: <span className="text-gray-700 font-bold">{item.quantity}</span>
                        </div>
                      </div>
                      <div className="font-bold text-gray-950 shrink-0 font-sans">
                        {(item.product.price * item.quantity).toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                  ))}

                  {/* Summary math */}
                  <div className="p-3 bg-gray-50/50 space-y-1.5 text-[11px] text-gray-500 font-semibold">
                    <div className="flex justify-between">
                      <span>Tạm tính các sản phẩm:</span>
                      <span className="text-gray-800 font-bold">{subtotal.toLocaleString('vi-VN')}đ</span>
                    </div>
                    {orderDetails.discountAmount ? (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Giảm giá áp dụng ({orderDetails.discountCode}):</span>
                        <span>-{orderDetails.discountAmount.toLocaleString('vi-VN')}đ</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between">
                      <span>Phí giao hàng:</span>
                      <span className="text-gray-800 font-medium">30.000đ</span>
                    </div>
                    <div className="h-px bg-gray-200/50 my-1" />
                    <div className="flex justify-between text-xs font-black pt-0.5 text-gray-950">
                      <span>THÀNH TIỀN:</span>
                      <span className="text-base text-[#0C447C] font-black font-sans shrink-0">
                        {finalPrice.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer triggers */}
            <div className="p-6 border-t border-gray-100 bg-white flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowEmailPreview(true)}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-600/10 active:scale-[0.98]"
              >
                <Mail size={14} className="stroke-[2.5]" />
                Xem email xác nhận
              </button>
              
              <button
                type="button"
                onClick={onClose}
                className="flex-grow py-3.5 bg-gray-950 hover:bg-gray-900 border border-transparent text-white rounded-2xl font-black text-xs uppercase tracking-wider text-center transition-all cursor-pointer shadow-md active:scale-[0.98]"
              >
                Đóng & Quay lại
              </button>
            </div>
          </motion.div>
        ) : (
          /* Email Client simulator */
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative w-[560px] max-w-full bg-gray-100 rounded-[12px] shadow-[0_25px_60px_rgba(0,0,0,0.45)] overflow-hidden font-sans border border-gray-200/60"
          >
            {/* Simulated Email App Top Control Bar */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500 shrink-0"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-500 shrink-0"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-green-500 shrink-0"></div>
                <span className="text-xs text-slate-400 font-bold font-mono ml-2">RemixMail v1.2</span>
              </div>
              <button
                onClick={() => setShowEmailPreview(false)}
                className="text-slate-400 hover:text-white transition-colors border-none bg-transparent cursor-pointer p-1"
                title="Quay lại"
              >
                <X size={18} />
              </button>
            </div>

            {/* Email Metadata Form Header */}
            <div className="bg-white border-b border-gray-200 p-5 space-y-3 leading-normal">
              <div className="flex text-xs leading-normal">
                <span className="w-16 text-gray-400 font-black">Từ:</span>
                <span className="text-gray-800 font-extrabold flex items-center gap-1.5">
                  REMIX.AI Store <span className="text-gray-400 font-bold">&lt;no-reply@remix.ai&gt;</span>
                  <span className="bg-[#0068FF]/10 text-[#0068FF] text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tight flex items-center">Verified</span>
                </span>
              </div>
              <div className="flex text-xs leading-normal">
                <span className="w-16 text-gray-400 font-black">Đến:</span>
                <span className="text-gray-800 font-extrabold">
                  {orderDetails.fullName} <span className="text-gray-400 font-semibold font-mono">&lt;{currentUserEmail}&gt;</span>
                </span>
              </div>
              <div className="flex text-xs leading-normal">
                <span className="w-16 text-gray-400 font-black">Tiêu đề:</span>
                <span className="text-gray-950 font-black text-sm text-left">
                  [REMIX.AI] Xác nhận đặt hàng thành công đơn hàng #ORD-{orderDetails.orderId}
                </span>
              </div>
              <div className="flex text-xs leading-normal">
                <span className="w-16 text-gray-400 font-black">Gửi lúc:</span>
                <span className="text-gray-600 font-bold flex items-center gap-1">
                  <Calendar size={12} className="text-gray-400" />
                  <span>{formattedDate}</span>
                </span>
              </div>
            </div>

            {/* Simulated Email Body Content (Designed as HTML Letter) */}
            <div className="bg-[#F8FAFC] p-6 overflow-y-auto max-h-[420px] custom-scrollbar text-left text-gray-800 leading-relaxed font-sans">
              <div className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Brand Banner */}
                <div className="bg-[#185FA5] p-6 text-white text-center">
                  <h1 className="text-2xl font-black tracking-tight tracking-wide mb-1">REMIX.AI</h1>
                  <p className="text-xs text-blue-50/90 font-bold">Xác nhận đơn hàng #ORD-{orderDetails.orderId}</p>
                </div>

                {/* Email Body Message */}
                <div className="p-6 space-y-5">
                  <p className="text-sm">
                    Kính gửi anh/chị <strong className="text-gray-900">{orderDetails.fullName}</strong>,
                  </p>
                  
                  <p className="text-xs text-gray-650 font-medium leading-relaxed">
                    Cảm ơn quý khách hàng đã đặt mua sắm tại hệ thống bán lẻ công nghệ REMIX.AI. Yêu cầu đặt hàng của quý khách đã được lưu nhận thành công vào hệ thống.
                  </p>

                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 text-xs text-[#0C447C] font-semibold space-y-1">
                    <p className="font-extrabold flex items-center gap-1.5 mb-1 text-[13px]">
                      <Info size={14} className="shrink-0" />
                      Trạng thái xử lý: Chờ Xác Nhận
                    </p>
                    <p>Nhân viên tổng đài sẽ chủ động gọi điện liên hệ trực tiếp cho anh/chị để xác nhận thông tin giao hàng trong vòng 15 phút tới.</p>
                  </div>

                  {/* Summary of invoice table inside email */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-black text-gray-950 uppercase tracking-widest border-b border-gray-100 pb-1.5 flex justify-between">
                      <span>Thông tin đơn hàng</span>
                      <span className="font-mono text-[#0068FF]">#ORD-{orderDetails.orderId}</span>
                    </h3>

                    <table className="w-full text-left text-xs text-gray-700">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400 font-black uppercase text-[10px]/normal tracking-wider">
                          <th className="py-2">Sản phẩm</th>
                          <th className="py-2 text-center">Số lượng</th>
                          <th className="py-2 text-right">Đơn giá</th>
                          <th className="py-2 text-right">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                        {orderDetails.items.map((item, id) => (
                          <tr key={id}>
                            <td className="py-2.5 pr-2">
                              <span className="font-bold block text-gray-950">{item.product.name}</span>
                              <span className="text-[10px] text-gray-400 font-semibold">{item.product.category}</span>
                            </td>
                            <td className="py-2.5 text-center font-bold text-gray-600">{item.quantity}</td>
                            <td className="py-2.5 text-right font-mono">{item.product.price.toLocaleString('vi-VN')}đ</td>
                            <td className="py-2.5 text-right font-bold text-gray-950 font-mono">{(item.product.price * item.quantity).toLocaleString('vi-VN')}đ</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Cost math breakdown in invoice */}
                    <div className="h-px bg-gray-200" />
                    <div className="space-y-1.5 text-xs text-gray-500 font-semibold pt-1">
                      <div className="flex justify-between">
                        <span>Tổng tiền:</span>
                        <span className="text-gray-800 font-bold">{subtotal.toLocaleString('vi-VN')}đ</span>
                      </div>
                      {orderDetails.discountAmount ? (
                        <div className="flex justify-between text-emerald-600 font-bold">
                          <span>Giảm giá voucher ({orderDetails.discountCode}):</span>
                          <span>-{orderDetails.discountAmount.toLocaleString('vi-VN')}đ</span>
                        </div>
                      ) : null}
                      <div className="flex justify-between">
                        <span>Phí ship:</span>
                        <span>30.000đ</span>
                      </div>
                      <div className="h-px bg-gray-250 my-1" />
                      <div className="flex justify-between font-black text-gray-950 text-sm">
                        <span>TỔNG CỘNG:</span>
                        <span className="text-base text-[#185FA5] font-black font-sans">
                          {finalPrice.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery address & general information section */}
                  <div className="space-y-2 pt-4 border-t border-gray-100 text-xs">
                    <h4 className="font-black text-gray-950 uppercase tracking-widest text-[10px] text-gray-400 mb-2">Thông tin giao hàng & Xử lý</h4>
                    
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2 font-semibold text-gray-700 leading-relaxed">
                      <div className="flex justify-between py-1 border-b border-gray-200/50">
                        <span className="text-gray-400 font-medium">Họ tên:</span>
                        <span className="text-gray-950 font-bold">{orderDetails.fullName}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-200/50">
                        <span className="text-gray-400 font-medium">SĐT:</span>
                        <span className="text-gray-950 font-mono font-bold">{orderDetails.phoneNumber}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-200/50">
                        <span className="text-gray-400 font-medium shrink-0">Địa chỉ:</span>
                        <span className="text-gray-800 text-right max-w-[300px] truncate" title={orderDetails.address}>{orderDetails.address}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-200/50">
                        <span className="text-gray-400 font-medium">Chi nhánh:</span>
                        <span className="text-gray-900 font-bold">{orderDetails.branchName}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-400 font-medium">Phương thức TT:</span>
                        <span className="text-gray-900 font-bold">Thanh toán khi nhận hàng (COD)</span>
                      </div>
                    </div>

                    {/* Tracking Info Block */}
                    <div className="bg-amber-50/40 border border-amber-100/60 rounded-xl p-3 text-center">
                      <p className="text-[11px] text-amber-800 font-bold font-sans">
                        📦 Mã vận đơn: Sẽ cập nhật sau khi xác nhận
                      </p>
                    </div>
                  </div>

                  {/* Footer links of email */}
                  <div className="pt-6 border-t border-gray-100 text-center space-y-2.5 bg-white">
                    <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">
                      Yêu cầu của bạn đang được duyệt tự động. Vui lòng giữ liên lạc để nhân viên showroom hỗ trợ nhanh nhất.
                    </p>

                    <div className="flex justify-center items-center gap-1.5 text-[10px] font-black tracking-wider text-[#185FA5] bg-blue-50/50 py-2 px-4 rounded-lg select-all">
                      <span>Liên hệ: 1800-xxxx | support@remix.ai</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Email app Bottom Action Buttons */}
            <div className="p-4 bg-slate-50 border-t border-gray-200/80 flex justify-between items-center shrink-0">
              <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 bg-white border border-gray-200 px-2.5 py-1 rounded-full shadow-sm font-sans uppercase">
                <ShieldCheck size={11} className="text-green-500" />
                Mã hóa bảo mật Email SSL 256-bit
              </span>
              <button
                type="button"
                onClick={() => setShowEmailPreview(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Trở lại Đơn hàng
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}
