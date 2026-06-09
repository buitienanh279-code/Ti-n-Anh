import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, ShoppingBag, Clock, Truck, CheckCircle2, XCircle, ChevronRight, MessageSquare, 
  Search, Tag, Calendar, ChevronDown, ChevronUp, MapPin, User, Phone, Building, 
  Package, ShieldAlert, FileText, Check 
} from 'lucide-react';
import LiveTrackingMap from './LiveTrackingMap';

interface OrderItem {
  id: string; // Order code
  date: string; // Order date
  productName: string;
  price: number;
  status: 'processing' | 'shipping' | 'delivered' | 'cancelled';
  imageUrl?: string;
  branch?: string;
  customerName?: string;
  phone?: string;
  address?: string;
  discountApplied?: string;
}

const DEFAULT_ORDERS: OrderItem[] = [
  {
    id: 'REMIX-9582',
    date: '18/05/2026',
    productName: 'Sony WH-CH520',
    price: 1290000,
    status: 'shipping',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&q=80',
    branch: 'Showroom REMIX - Quận 1',
    customerName: 'Nguyễn Văn Minh',
    phone: '0912345678',
    address: '120 Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh'
  },
  {
    id: 'REMIX-7421',
    date: '15/05/2026',
    productName: 'Laptop ASUS Vivobook',
    price: 12500000,
    status: 'delivered',
    imageUrl: 'https://images.unsplash.com/photo-1496181130204-755241524eab?w=150&q=80',
    branch: 'Showroom REMIX - Ba Đình',
    customerName: 'Trần Thị Thảo',
    phone: '0987654321',
    address: '45 Kim Mã, Phường Kim Mã, Quận Ba Đình, Hà Nội'
  },
  {
    id: 'REMIX-2391',
    date: '19/05/2026',
    productName: 'Samsung Galaxy A55',
    price: 8990000,
    status: 'processing',
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=150&q=80',
    branch: 'Showroom REMIX - Quận 1',
    customerName: 'Lê Hoàng Hải',
    phone: '0903334445',
    address: '78-80 Đông Du, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'
  }
];

interface MyOrdersProps {
  currentUser?: { username: string; email?: string; phone?: string } | null;
  onGoToConsult: () => void;
}

type FilterStatus = 'all' | 'processing' | 'shipping' | 'delivered' | 'cancelled';

interface StepperStep {
  label: string;
  desc: string;
  state: 'completed' | 'active' | 'pending' | 'failed';
}

const getHorizontalSteps = (status: 'processing' | 'shipping' | 'delivered' | 'cancelled'): StepperStep[] => {
  const stepsList = [
    { label: 'Đặt hàng', desc: 'Đã tạo đơn' },
    { label: 'Xác nhận', desc: 'Đã duyệt đơn' },
    { label: 'Đang giao', desc: 'Đang vận chuyển' },
    { label: 'Nhận hàng', desc: 'Đang phát hàng' },
    { label: 'Hoàn thành', desc: 'Giao thành công' },
  ];

  if (status === 'cancelled') {
    return [
      { label: 'Đặt hàng', desc: 'Đã tạo đơn', state: 'completed' },
      { label: 'Hủy đơn', desc: 'Đã hủy đơn hàng', state: 'failed' },
      { label: 'Đang giao', desc: 'Đã dừng', state: 'pending' },
      { label: 'Nhận hàng', desc: 'Đã dừng', state: 'pending' },
      { label: 'Hoàn thành', desc: 'Đã dừng', state: 'pending' },
    ];
  }

  return stepsList.map((step, idx) => {
    let state: 'completed' | 'active' | 'pending' | 'failed' = 'pending';
    if (status === 'processing') {
      if (idx < 1) state = 'completed';
      else if (idx === 1) state = 'active';
      else state = 'pending';
    } else if (status === 'shipping') {
      if (idx < 2) state = 'completed';
      else if (idx === 2) state = 'active';
      else state = 'pending';
    } else if (status === 'delivered') {
      state = 'completed';
    }
    return { ...step, state };
  });
};

const getProgressBarWidth = (status: 'processing' | 'shipping' | 'delivered' | 'cancelled'): string => {
  if (status === 'processing') return '25%';
  if (status === 'shipping') return '50%';
  if (status === 'delivered') return '100%';
  return '0%'; // cancelled
};

export default function MyOrders({ currentUser, onGoToConsult }: MyOrdersProps) {
  const [orders, setOrders ] = React.useState<OrderItem[]>([]);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('remix_orders') || localStorage.getItem('remix_placed_orders');
      let parsed: OrderItem[] = [];
      if (saved) {
        parsed = JSON.parse(saved);
      } else {
        parsed = DEFAULT_ORDERS;
      }
      
      if (currentUser) {
        // Only show orders belonging to the logged-in user
        setOrders(parsed.filter((o: any) => o.username === currentUser.username));
      } else {
        // Gast user sees orders belonging to guest or with no username
        setOrders(parsed.filter((o: any) => !o.username || o.username === 'guest'));
      }
    } catch (e) {
      console.error(e);
      setOrders([]);
    }
  }, [currentUser]);

  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const filterTabs = [
    { id: 'all', label: 'Tất cả', count: orders.length },
    { id: 'processing', label: 'Đang xử lý', count: orders.filter(o => o.status === 'processing').length },
    { id: 'shipping', label: 'Đang giao', count: orders.filter(o => o.status === 'shipping').length },
    { id: 'delivered', label: 'Đã giao', count: orders.filter(o => o.status === 'delivered').length },
    { id: 'cancelled', label: 'Đã hủy', count: orders.filter(o => o.status === 'cancelled').length },
  ];

  const getStatusDetails = (status: OrderItem['status']) => {
    switch (status) {
      case 'processing':
        return {
          label: 'Đang xử lý',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          badgeBg: 'bg-amber-500',
          icon: Clock,
        };
      case 'shipping':
        return {
          label: 'Đang giao',
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          badgeBg: 'bg-indigo-600',
          icon: Truck,
        };
      case 'delivered':
        return {
          label: 'Đã giao',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          badgeBg: 'bg-emerald-600',
          icon: CheckCircle2,
        };
      case 'cancelled':
        return {
          label: 'Đã hủy',
          bg: 'bg-red-50 text-red-700 border-red-200',
          badgeBg: 'bg-red-600',
          icon: XCircle,
        };
    }
  };

  const getTimelineSteps = (order: OrderItem) => {
    const isCancelled = order.status === 'cancelled';
    
    if (isCancelled) {
      return [
        {
          title: 'Đăng ký đơn hàng',
          description: `Yêu cầu đặt mua sản phẩm được gửi lên hệ thống showroom.`,
          date: order.date,
          status: 'completed',
        },
        {
          title: 'Đã hủy đơn hàng',
          description: 'Đơn hàng đã dừng tiến trình hoặc hủy bỏ bởi quản trị/khách hàng.',
          date: order.date,
          status: 'failed',
        }
      ];
    }

    return [
      {
        title: 'Ghi nhận đơn hàng',
        description: `Đơn hàng #${order.id} tạo thành công, chờ tiếp nhận xử lý.`,
        date: order.date,
        status: 'completed',
      },
      {
        title: 'Đang chuẩn bị hàng',
        description: order.status === 'processing'
          ? `Nhân viên showroom đang sắp xếp, chuẩn bị hàng hóa tại chi nhánh.`
          : `Đóng gói sản phẩm thành công tại chi nhánh đại diện.`,
        date: order.date,
        status: order.status === 'processing' ? 'active' : 'completed',
      },
      {
        title: 'Đang giao hàng',
        description: order.status === 'shipping'
          ? `Sản phẩm đã bàn giao cho ĐVVC và đang trên lộ trình đi phát.`
          : order.status === 'delivered'
          ? `Đã hoàn tất bàn giao cho đơn vị vận chuyển.`
          : `Chờ đóng gói xong bàn giao đơn vị vận chuyển đối tác.`,
        date: order.status === 'processing' ? 'Dự kiến hôm nay' : order.date,
        status: order.status === 'delivered' ? 'completed' : order.status === 'shipping' ? 'active' : 'pending',
      },
      {
        title: 'Giao hàng thành công',
        description: order.status === 'delivered'
          ? `Khách hàng đã nhận bưu kiện, kiểm thử thiết bị & ký xác nhận thanh toán (COD).`
          : `Đơn vị vận chuyển sẽ bàn giao thiết bị tận tay khách hàng.`,
        date: order.status === 'delivered' ? order.date : 'Dự kiến',
        status: order.status === 'delivered' ? 'completed' : 'pending',
      }
    ];
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = activeFilter === 'all' ? true : order.status === activeFilter;
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex-grow flex flex-col h-full bg-slate-50 overflow-hidden font-sans">
      {/* Upper header action bar */}
      <div className="bg-white px-6 py-6 border-b border-gray-100 shrink-0">
        <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-950 tracking-tight flex items-center gap-2">
              <ShoppingBag className="text-[#185FA5]" size={24} />
              Đơn hàng của tôi
            </h1>
            <p className="text-xs text-slate-500 mt-1">Theo dõi, kiểm tra lộ trình và quản lý các đơn hàng của Bạn tinh tế tại REMIX.AI</p>
          </div>

          {/* Quick search block */}
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm mã đơn hoặc tên sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-semibold text-gray-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#185FA5]/10 focus:border-[#185FA5] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Navigation and state filters tab bar */}
      <div className="bg-white border-b border-gray-100 shrink-0 overflow-x-auto scrollbar-hide">
        <div className="max-w-5xl mx-auto w-full px-6 flex gap-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as FilterStatus)}
              className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all relative flex items-center gap-2 whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'border-[#185FA5] text-[#185FA5]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeFilter === tab.id
                  ? 'bg-[#185FA5]/10 text-[#185FA5]'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main matching content */}
      <div className="flex-grow overflow-y-auto p-4 md:p-6">
        <div className="max-w-5xl mx-auto w-full h-full">
          <AnimatePresence mode="popLayout animate-none">
            {filteredOrders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-xs flex flex-col items-center justify-center min-h-[350px]"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
                  <ShoppingBag size={28} />
                </div>
                <h4 className="font-bold text-gray-900 text-base mb-1">Không có đơn hàng tương thích</h4>
                <p className="text-gray-500 text-xs max-w-sm mb-6 leading-relaxed">
                  {searchQuery 
                    ? `Không tìm thấy đơn hàng chứa "${searchQuery}" phù hợp với bộ lọc hiện tại.` 
                    : 'Lịch sử mua hàng trống hoặc không có đơn hàng nào ở bộ lọc này.'}
                </p>
                <button
                  onClick={onGoToConsult}
                  className="px-6 py-2.5 bg-[#185FA5] hover:bg-[#124b83] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-900/10 active:scale-95 flex items-center gap-2"
                >
                  <MessageSquare size={14} />
                  Tư vấn và mua hàng ngay
                </button>
              </motion.div>
            ) : (
              <div className="space-y-4 pb-12">
                {filteredOrders.map((order) => {
                  const status = getStatusDetails(order.status);
                  const StatusIcon = status.icon;
                  const isExpanded = expandedOrderId === order.id;
                  const steps = getTimelineSteps(order);

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      key={order.id}
                      className={`bg-white border rounded-2xl overflow-hidden transition-all ${
                        isExpanded 
                          ? 'border-[#185FA5] shadow-[0_4px_20px_rgba(24,95,165,0.08)]' 
                          : 'border-slate-100 hover:shadow-md hover:border-slate-200/60'
                      }`}
                    >
                      {/* Card Header Row summary */}
                      <div className="p-4 md:p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        {/* Left: Product brief info */}
                        <div className="flex gap-4 items-center flex-grow min-w-0">
                          <div className="w-14 h-14 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-center p-1 md:p-2 shrink-0">
                            {order.imageUrl ? (
                              <img
                                src={order.imageUrl}
                                alt={order.productName}
                                className="max-w-full max-h-full object-contain"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <ShoppingBag className="text-slate-300" size={24} />
                            )}
                          </div>

                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#185FA5] bg-[#185FA5]/5 px-2 py-0.5 rounded-md">
                                {order.id}
                              </span>
                              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                                <Calendar size={11} />
                                {order.date}
                              </span>
                            </div>
                            
                            <h3 className="font-bold text-sm md:text-base text-gray-900 truncate">
                              {order.productName}
                            </h3>

                            <p className="text-slate-900 font-black text-xs md:text-sm tracking-tight">
                              {order.price.toLocaleString('vi-VN')}đ
                            </p>
                          </div>
                        </div>

                        {/* Right: Badge Status & Action Details */}
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 w-full md:w-auto shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                          {/* Status Badge */}
                          <div className={`flex items-center gap-1.5 px-3 py-1 border-[0.5px] rounded-full text-xs font-bold ${status.bg} shrink-0`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.badgeBg}`} />
                            <StatusIcon size={12} />
                            <span>{status.label}</span>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onGoToConsult();
                              }}
                              className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                            >
                              Hỏi trợ lý
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedOrderId(isExpanded ? null : order.id);
                              }}
                              className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                                isExpanded 
                                  ? 'bg-[#185FA5] hover:bg-[#124b83] text-white shadow-sm' 
                                  : 'bg-[#1a202c] hover:bg-slate-800 text-white'
                              }`}
                            >
                              <span>{isExpanded ? 'Đóng lại' : 'Chi tiết'}</span>
                              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Animated Collapsible Timeline Panel */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="bg-slate-50/70 border-t border-slate-100 overflow-hidden text-left"
                          >
                            {/* Horizontal 5-Step Stepper */}
                            <div className="w-full bg-[#F8FAFC] border-b border-slate-200/60 px-4 md:px-8 py-6 font-sans">
                              <div className="max-w-3xl mx-auto">
                                <span className="text-[10px] font-black tracking-widest uppercase text-slate-400 block mb-5 text-center">
                                  TIẾN TRÌNH TRẠNG THÁI ĐƠN HÀNG TRỰC QUAN
                                </span>
                                <div className="relative flex items-center justify-between w-full">
                                  {/* Line Background */}
                                  <div className="absolute top-5 left-[10%] right-[10%] h-[3px] bg-slate-250 -translate-y-1/2 rounded-full overflow-hidden">
                                    {/* Line Active Progress */}
                                    <div 
                                      className="h-full bg-emerald-500 transition-all duration-500 ease-out" 
                                      style={{ width: getProgressBarWidth(order.status) }}
                                    />
                                  </div>

                                  {/* Steps List */}
                                  {getHorizontalSteps(order.status).map((step, idx) => {
                                    const isCompleted = step.state === 'completed';
                                    const isActive = step.state === 'active';
                                    const isFailed = step.state === 'failed';

                                    return (
                                      <div key={idx} className="flex flex-col items-center relative z-10 w-[20%]">
                                        {/* Circle node Badge */}
                                        <div className="relative">
                                          {isCompleted ? (
                                            <div className="w-10 h-10 rounded-full bg-emerald-500 border-2 border-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/10 transition-all">
                                              <Check className="w-5 h-5 stroke-[3.5]" />
                                            </div>
                                          ) : isActive ? (
                                            <div className="w-10 h-10 rounded-full bg-white border-2 border-[#185FA5] flex items-center justify-center text-[#185FA5] shadow-md shadow-blue-500/15 relative">
                                              <span className="absolute inset-0 rounded-full bg-[#185FA5]/20 animate-ping" />
                                              <div className="w-3.5 h-3.5 rounded-full bg-[#185FA5]" />
                                            </div>
                                          ) : isFailed ? (
                                            <div className="w-10 h-10 rounded-full bg-red-500 border-2 border-red-500 flex items-center justify-center text-white shadow-md shadow-red-500/10">
                                              <span className="text-sm font-black text-white">!</span>
                                            </div>
                                          ) : (
                                            <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-400 font-extrabold text-xs select-none">
                                              {idx + 1}
                                            </div>
                                          )}
                                        </div>

                                        {/* Step Info label */}
                                        <div className="text-center mt-2.5 space-y-0.5">
                                          <p className={`text-[11px] font-black tracking-tight ${
                                            isCompleted 
                                              ? 'text-emerald-600' 
                                              : isActive 
                                              ? 'text-[#185FA5] font-black' 
                                              : isFailed 
                                              ? 'text-red-500' 
                                              : 'text-slate-400 font-bold'
                                          }`}>
                                            {step.label}
                                          </p>
                                          <p className="text-[9px] text-slate-400 font-semibold max-sm:hidden">
                                            {step.desc}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 leading-relaxed">
                              {/* Left: Graphic Stepper Timeline details */}
                              <div className="lg:col-span-7 space-y-4">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                  <Package size={13} className="text-[#185FA5]" />
                                  Hành Trình Vận Chuyển Đơn Hàng
                                </h4>

                                <div className="pl-2 relative border-l border-slate-200 space-y-6 py-2 ml-4">
                                  {steps.map((step, idx) => {
                                    const isStepCompleted = step.status === 'completed';
                                    const isStepActive = step.status === 'active';
                                    const isStepFailed = step.status === 'failed';

                                    return (
                                      <div key={idx} className="relative pl-7 group">
                                        {/* Colored badge marker */}
                                        <div className={`absolute -left-[35px] top-0 w-6 h-6 rounded-full flex items-center justify-center border font-sans text-[10px] font-bold transition-all ${
                                          isStepCompleted
                                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                                            : isStepActive
                                            ? 'bg-[#185FA5] border-[#185FA5] text-white animate-pulse'
                                            : isStepFailed
                                            ? 'bg-red-500 border-red-500 text-white'
                                            : 'bg-white border-slate-300 text-slate-400'
                                        }`}>
                                          {isStepCompleted ? (
                                            <Check size={11} className="stroke-[3.5]" />
                                          ) : isStepActive ? (
                                            idx + 1
                                          ) : isStepFailed ? (
                                            '!'
                                          ) : (
                                            idx + 1
                                          )}
                                        </div>

                                        {/* Connect line highlight under active/completed */}
                                        {idx < steps.length - 1 && (
                                          <div className={`absolute -left-[24px] top-6 w-[2px] h-[calc(100%+12px)] ${
                                            isStepCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                                          }`} />
                                        )}

                                        <div className="space-y-0.5">
                                          <div className="flex items-center gap-2">
                                            <span className={`text-xs font-extrabold ${
                                              isStepCompleted
                                                ? 'text-gray-900'
                                                : isStepActive
                                                ? 'text-[#185FA5] font-black'
                                                : isStepFailed
                                                ? 'text-red-600'
                                                : 'text-gray-400'
                                            }`}>
                                              {step.title}
                                            </span>
                                            <span className="text-[10px] font-mono text-gray-400 font-semibold bg-gray-100 px-1.5 py-0.2 rounded">
                                              {step.date}
                                            </span>
                                          </div>
                                          <p className={`text-[11px] leading-relaxed ${
                                            isStepActive ? 'text-gray-700 font-medium' : 'text-gray-500'
                                          }`}>
                                            {step.description}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Right: Personal Delivery Metadata details */}
                              <div className="lg:col-span-5 space-y-4 border-t lg:border-t-0 lg:border-l border-slate-200/60 pt-4 lg:pt-0 lg:pl-6 text-xs text-gray-650">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                  <FileText size={13} className="text-[#185FA5]" />
                                  Thông Tin Giao Nhận & Xử Lý
                                </h4>

                                <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-2.5 font-semibold text-gray-700 leading-normal">
                                  <div className="flex justify-between py-1 border-b border-gray-100">
                                    <span className="text-gray-400 flex items-center gap-1 font-medium">
                                      <User size={12} />
                                      Họ tên:
                                    </span>
                                    <span className="text-gray-950 font-bold">{order.customerName || 'Khách hàng REMIX'}</span>
                                  </div>

                                  <div className="flex justify-between py-1 border-b border-gray-100">
                                    <span className="text-gray-400 flex items-center gap-1 font-medium">
                                      <Phone size={12} />
                                      SĐT nhận:
                                    </span>
                                    <span className="text-gray-950 font-mono font-bold">{order.phone || '090*******'}</span>
                                  </div>

                                  <div className="flex justify-between py-1 border-b border-gray-100">
                                    <span className="text-gray-400 flex items-center gap-1 font-medium">
                                      <Building size={12} />
                                      Chi nhánh xử lý:
                                    </span>
                                    <span className="text-gray-900 font-bold">{order.branch || 'Showroom REMIX - Ba Đình'}</span>
                                  </div>

                                  <div className="flex flex-col py-1 border-b border-gray-100 gap-0.5">
                                    <span className="text-gray-400 flex items-center gap-1 font-medium">
                                      <MapPin size={12} />
                                      Địa chỉ phát hàng:
                                    </span>
                                    <span className="text-gray-800 text-left font-normal mt-0.5">{order.address || 'Hỗ trợ giao tận tay theo Hotline liên hệ'}</span>
                                  </div>

                                  <div className="flex justify-between py-1">
                                    <span className="text-gray-400 font-medium">Thanh toán:</span>
                                    <span className="text-gray-900 font-bold">Thu COD khi nhận hàng</span>
                                  </div>
                                </div>

                                {/* Tracking Indicator label */}
                                <div className="bg-amber-50/50 border border-amber-100 text-amber-800 p-3 rounded-xl flex items-center gap-2">
                                  <ShieldAlert size={14} className="shrink-0 text-amber-600" />
                                  <span className="text-[10px] font-bold">
                                    Mã vận đơn (Viettel Post/GHN): Sẽ cập nhật ngay sau khi duyệt cuộc gọi xác nhận.
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Interactive Tracking Map View of Courier */}
                            {order.status === 'shipping' && (
                              <LiveTrackingMap order={order} />
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

