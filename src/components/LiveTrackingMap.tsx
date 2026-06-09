import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, RefreshCw, Phone, Navigation, Compass, 
  MapPin, Check, Shield, AlertTriangle, Info, Truck, Bike
} from 'lucide-react';

interface OrderItem {
  id: string;
  date: string;
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

interface LiveTrackingMapProps {
  order: OrderItem;
}

interface Checkpoint {
  id: number;
  name: string;
  desc: string;
  progress: number;
  time: string;
  x: number;
  y: number;
}

export default function LiveTrackingMap({ order }: LiveTrackingMapProps) {
  const [progress, setProgress] = useState(45); // Start at 45% progress
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // 1x, 2x, 4x speed
  const [activeTab, setActiveTab] = useState<'info' | 'logs'>('info');
  const [simulatedCallState, setSimulatedCallState] = useState<'idle' | 'calling' | 'connected'>('idle');
  const [showCallModal, setShowCallModal] = useState(false);
  const [liveLog, setLiveLog] = useState<string[]>([]);
  
  const pathRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [courierCoords, setCourierCoords] = useState({ x: 300, y: 160 });

  // Map representation points
  const checkpoints: Checkpoint[] = [
    { 
      id: 1, 
      name: 'Kho REMIX', 
      desc: 'Bàn giao thiết bị và ký đơn vận.', 
      progress: 0, 
      time: '08:15',
      x: 120,
      y: 240
    },
    { 
      id: 2, 
      name: 'Trạm trung chuyển chính', 
      desc: 'Xếp lịch trình phân phối bưu kiện.', 
      progress: 35, 
      time: '09:30', 
      x: 290,
      y: 110
    },
    { 
      id: 3, 
      name: 'Bưu cục Quận phát', 
      desc: 'Phân công shipper giao hàng tận nơi.', 
      progress: 70, 
      time: '10:45',
      x: 480,
      y: 210
    },
    { 
      id: 4, 
      name: 'Địa chỉ của bạn', 
      desc: 'Giao hàng tận tay & kiểm thử.', 
      progress: 100, 
      time: 'Dự kiến',
      x: 680,
      y: 130
    }
  ];

  // Dynamic status updates based on progress
  const getStatusMessage = (p: number) => {
    if (p <= 5) return 'Chuẩn bị rời showroom';
    if (p > 5 && p < 35) return 'Đang đi qua trục đường chính hướng Trạm trung chuyển';
    if (p >= 35 && p < 70) return 'Shipper đang lấy hàng từ Trạm tiếp nhận';
    if (p >= 70 && p < 95) return 'Shipper đang đi chuyển vào ngõ, sắp tới địa chỉ của bạn!';
    return 'Shipper đang đứng ngoài cổng. Hãy chuẩn bị nhận hàng!';
  };

  const getETA = (p: number) => {
    const totalMinutes = 25;
    const remainingNormalized = (100 - p) / 100;
    return Math.max(1, Math.round(totalMinutes * remainingNormalized));
  };

  const getDistance = (p: number) => {
    const totalDistance = 5.8; // km
    const remainingNormalized = (100 - p) / 100;
    return Math.max(0.1, parseFloat((totalDistance * remainingNormalized).toFixed(1)));
  };

  // Effect to automatically update courier coordinates along the SVG path
  useEffect(() => {
    const updateCoords = () => {
      if (pathRef.current) {
        try {
          const pathLength = pathRef.current.getTotalLength();
          const targetLength = pathLength * (progress / 100);
          const point = pathRef.current.getPointAtLength(targetLength);
          if (point) {
            setCourierCoords({ x: point.x, y: point.y });
          }
        } catch (e) {
          // Fallback if SVG getPointAtLength fails
          const startX = 120, endX = 680;
          const startY = 240, endY = 130;
          const ratio = progress / 100;
          setCourierCoords({
            x: startX + (endX - startX) * ratio,
            y: startY + (endY - startY) * ratio + Math.sin(ratio * Math.PI) * -50
          });
        }
      }
    };

    updateCoords();
    // Re-run on layout or resize
    window.addEventListener('resize', updateCoords);
    return () => window.removeEventListener('resize', updateCoords);
  }, [progress]);

  // Simulation timer logic
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        let step = 0.8 * speedMultiplier;
        let next = prev + step;
        if (next >= 100) {
          next = 0; // Seamless loop for visualization
          setLiveLog(l => [`[${new Date().toLocaleTimeString('vi-VN')}] 🔄 Bắt đầu lại hành trình mô phỏng.`, ...l]);
        }
        return parseFloat(next.toFixed(1));
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier]);

  // Handle manual coordinate slider
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setProgress(val);
    setLiveLog(l => [`[${new Date().toLocaleTimeString('vi-VN')}] 📍 Người dùng điều chỉnh thủ công vị trí shipper: ${val}%`, ...l.slice(0, 50)]);
  };

  // Custom log push when checkpoint crossed
  useEffect(() => {
    const rounded = Math.round(progress);
    if (rounded === 0) {
      setLiveLog(l => [`[08:15] 📦 Bưu cục REMIX: Đơn hàng hoàn tất đóng gói, bàn giao shipper Trần Anh Tuấn.`, ...l]);
    } else if (rounded === 35) {
      setLiveLog(l => [`[09:30] 🚚 Shipper đã đến trạm phân loại Quận trung tâm, chuẩn bị lộ trình phát lẻ.`, ...l]);
    } else if (rounded === 70) {
      setLiveLog(l => [`[10:45] 🛵 Shipper báo cáo đã nhận giỏ bưu phẩm phát và đang nổ máy hướng về địa chỉ của bạn.`, ...l]);
    } else if (rounded === 98) {
      setLiveLog(l => [`[Đang tới] 👋 Shipper đang ở cách địa chỉ nhận hàng của bạn dưới 100m.`, ...l]);
    }
  }, [Math.round(progress)]);

  const handleSimulateCall = () => {
    setSimulatedCallState('calling');
    setTimeout(() => {
      setSimulatedCallState('connected');
    }, 1500);
  };

  const handleEndCall = () => {
    setSimulatedCallState('idle');
    setShowCallModal(false);
  };

  return (
    <div className="border-t border-slate-200 bg-slate-50/50 p-4 md:p-6 space-y-6 font-sans text-left">
      {/* Dynamic Navigation Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600 border border-rose-100">
              <Compass size={18} className="animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-slate-950 tracking-tight">BẢN ĐỒ THEO DÕI LOGISTICS TRỰC QUAN RE-TIME</h4>
              <span className="text-[9px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wide">MÔ PHỎNG LIVE</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Định vị bưu phẩm cơ điện tử tinh tế của Showroom REMIX tại nội thành</p>
          </div>
        </div>

        {/* Speed and controls bar */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs self-start sm:self-center">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 px-2.5 bg-[#185FA5] hover:bg-[#124b83] text-white font-extrabold text-[10px] rounded-lg tracking-wide flex items-center gap-1 cursor-pointer transition-colors border-none"
          >
            {isPlaying ? (
              <>
                <Pause size={10} className="fill-white" /> TẠM DỪNG
              </>
            ) : (
              <>
                <Play size={10} className="fill-white" /> TIẾP TỤC
              </>
            )}
          </button>

          <button
            onClick={() => setSpeedMultiplier(prev => prev === 1 ? 2 : prev === 2 ? 4 : 1)}
            className="p-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[10px] rounded-lg cursor-pointer transition-colors border-none"
          >
            TỐC ĐỘ: {speedMultiplier}x
          </button>

          <button
            onClick={() => {
              setProgress(0);
              setIsPlaying(true);
              setLiveLog(l => [`[${new Date().toLocaleTimeString('vi-VN')}] 🔄 Khởi động lại GPS & Lộ trình mô phỏng.`, ...l]);
            }}
            title="Sắp xếp lại bưu tá"
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer transition-colors border-none"
          >
            <RefreshCw size={10} />
          </button>
        </div>
      </div>

      {/* Main Grid: Left is map, Right is statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Map Frame Component */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          <div 
            ref={containerRef}
            className="relative h-72 md:h-80 w-full rounded-2xl border border-slate-200/80 shadow-lg overflow-hidden bg-slate-100"
          >
            {/* Background cartographic tile image placeholder */}
            <img 
              src="https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?w=1000&q=80"
              alt="City Map Background"
              className="absolute inset-0 w-full h-full object-cover opacity-85 select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
            {/* Dark tinted glass over map for premium contrast */}
            <div className="absolute inset-0 bg-white/20 backdrop-blur-[0.5px] pointer-events-none" />

            {/* Grid styling to look like coordinates */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f01a_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f01a_1px,transparent_1px)] bg-[size:32px_32px]" />

            {/* SVG Roads Path and Overlays */}
            <svg 
              className="absolute inset-0 w-full h-full" 
              viewBox="0 0 800 350" 
              preserveAspectRatio="none"
            >
              {/* Main delivery route shadow */}
              <path 
                ref={pathRef}
                d="M 120,240 C 180,110 320,60 480,210 S 580,210 680,130" 
                fill="none" 
                stroke="#185FA5" 
                strokeWidth="6" 
                strokeLinecap="round"
                className="opacity-15"
              />
              {/* Dynamic route completion highlight */}
              <path 
                d="M 120,240 C 180,110 320,60 480,210 S 580,210 680,130" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="5" 
                strokeLinecap="round"
                strokeDasharray="700"
                strokeDashoffset={700 - (700 * progress) / 100}
                className="opacity-80 transition-all duration-150 ease-out"
              />
              <path 
                d="M 120,240 C 180,110 320,60 480,210 S 580,210 680,130" 
                fill="none" 
                stroke="#185FA5" 
                strokeWidth="4" 
                strokeDasharray="6 8"
                strokeLinecap="round"
                className="opacity-50"
              />

              {/* Waypoint circles that user can click to fast-forward */}
              {checkpoints.map((cp) => {
                const isActive = Math.abs(progress - cp.progress) < 8;
                const isPassed = progress >= cp.progress;
                return (
                  <g 
                    key={cp.id} 
                    className="cursor-pointer group"
                    onClick={() => {
                      setProgress(cp.progress);
                      setLiveLog(l => [`[${new Date().toLocaleTimeString('vi-VN')}] 🔎 Nhảy nhanh tới checkpoint: ${cp.name}`, ...l]);
                    }}
                  >
                    <circle 
                      cx={cp.x} 
                      cy={cp.y} 
                      r={isActive ? "10" : "6"} 
                      className={`transition-all duration-300 ${
                        isActive 
                          ? 'fill-emerald-400 stroke-white stroke-[2.5px] shadow-lg shadow-emerald-500/20' 
                          : isPassed 
                          ? 'fill-emerald-500 stroke-emerald-100 stroke-1' 
                          : 'fill-slate-400 stroke-white stroke-1 group-hover:fill-slate-600'
                      }`} 
                    />
                    <circle 
                      cx={cp.x} 
                      cy={cp.y} 
                      r={isActive ? "18" : "1"} 
                      className="fill-none stroke-emerald-400/30 stroke-1 animate-pulse" 
                    />
                  </g>
                );
              })}
            </svg>

            {/* Floating Labels on HTML Overlays for Points */}
            <div 
              style={{ left: '120px', top: '240px' }} 
              className="-translate-x-1/2 -translate-y-9 absolute flex flex-col items-center pointer-events-none"
            >
              <span className="bg-white/95 text-slate-800 font-sans text-[9px] font-black px-2 py-0.5 rounded-lg border border-slate-200/80 shadow-xs uppercase tracking-tight whitespace-nowrap">
                🏦 KHO REMIX
              </span>
            </div>

            <div 
              style={{ left: '680px', top: '130px' }} 
              className="-translate-x-1/2 -translate-y-9 absolute flex flex-col items-center pointer-events-none"
            >
              <span className="bg-[#185FA5] text-white font-sans text-[9px] font-black px-2 py-0.5 rounded-lg border border-[#185FA5]/20 shadow-sm uppercase tracking-tight whitespace-nowrap flex items-center gap-1 animate-bounce">
                🎉 KHÁCH HÀNG (BẠN)
              </span>
            </div>

            {/* Courier Micro-pin Widget representing live delivery agent location */}
            <div 
              style={{ 
                left: `${courierCoords.x}px`, 
                top: `${courierCoords.y}px`,
                transform: 'translate(-50%, -50%)',
                transition: 'left 150ms ease-out, top 150ms ease-out'
              }}
              className="absolute z-20"
            >
              {/* Radiant pulse circle */}
              <div className="absolute -inset-4 bg-emerald-500/20 rounded-full animate-ping pointer-events-none" />
              
              <div className="relative flex items-center justify-center w-11 h-11 bg-white border-2 border-emerald-500 rounded-full shadow-lg shadow-emerald-500/20 text-emerald-600 font-black cursor-grab active:cursor-grabbing hover:scale-110 transition-all">
                {/* Shipper Micro avatar or Cargo Scooter Icon */}
                <div className="absolute -top-6 bg-emerald-500 text-white font-sans text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm flex items-center gap-0.5 whitespace-nowrap">
                  <Bike size={8} /> TUẤN (REMIX)
                </div>
                <Truck size={18} className="text-emerald-600 animate-pulse" />
              </div>
            </div>

            {/* Live speed / position text overlay */}
            <div className="absolute bottom-3 left-4 bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 font-mono text-[9px] font-bold shadow-md flex items-center gap-2 transition-all">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Vị trí bưu bưu kiện: {progress}%</span>
              <span className="text-slate-400">|</span>
              <span>Tốc độ phát: ~45 km/h</span>
            </div>
            
            {/* Active alert indicator on map */}
            {progress > 95 && (
              <div className="absolute top-3 right-3 bg-red-500 text-white font-black text-[9px] px-2.5 py-1.5 rounded-xl shadow-md uppercase tracking-wider flex items-center gap-1 animate-pulse">
                <AlertTriangle size={11} /> Shipper đang đứng ngoài nhà!
              </div>
            )}
          </div>

          {/* Slider input for manual control */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
            <span className="text-[10px] font-black hover:text-[#185FA5] text-slate-400 uppercase tracking-wider font-mono shrink-0">
              Kéo để chỉnh thử vị trí:
            </span>
            <input 
              type="range"
              min="0"
              max="100"
              step="0.5"
              value={progress}
              onChange={handleProgressChange}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#185FA5] focus:outline-none focus:ring-1 focus:ring-[#185FA5]/30"
            />
            <span className="font-mono text-xs text-[#0c447c] font-black shrink-0 w-8 text-right">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Right Columns: Telemetry, Shipper statistics card */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* Navigation/Telemetry Cards summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-xs text-left">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Thời gian dự kiến</span>
              <p className="text-xl font-black text-slate-900 tracking-tight mt-1 font-mono">
                {progress >= 100 ? 'Đã đến' : `${getETA(progress)} phút`}
              </p>
              <p className="text-[9px] text-emerald-600 font-bold mt-1 uppercase tracking-wider flex items-center gap-0.5">
                <Check size={9} /> Trễ tối đa: 5p
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-xs text-left">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Khoảng cách</span>
              <p className="text-xl font-black text-indigo-700 tracking-tight mt-1 font-mono">
                {progress >= 100 ? '0.0 km' : `${getDistance(progress)} km`}
              </p>
              <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                Tổng tuyến: 5.8 km
              </p>
            </div>
          </div>

          {/* Shipper Details Info Card */}
          <div className="bg-white rounded-2xl border border-slate-150 shadow-sm p-4 text-left flex flex-col space-y-3">
            <div className="flex items-center gap-3">
              {/* Shipper Photo placeholder */}
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80" 
                  alt="Shipper Avatar"
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 border-2 border-white w-4.5 h-4.5 rounded-full flex items-center justify-center text-[8px] text-white">
                  ✓
                </span>
              </div>

              <div className="flex-grow">
                <span className="text-[9px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded font-black tracking-widest uppercase">
                  NHÂN VIÊN GIAO VẬN SĂN HÀNG
                </span>
                <h5 className="text-xs font-black text-slate-900 mt-1">Trần Anh Tuấn</h5>
                <span className="text-[10px] text-amber-500 font-bold block">★ 4.9 · Đội REMIX Premium</span>
              </div>
            </div>

            {/* Quick delivery parameters specs info */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] font-semibold text-slate-600 space-y-1.5 leading-normal">
              <div className="flex justify-between">
                <span>Phương tiện:</span>
                <span className="text-slate-900 font-bold font-mono">VinFast Feliz S (Xe điện)</span>
              </div>
              <div className="flex justify-between">
                <span>Biển kiểm soát:</span>
                <span className="text-slate-900 font-bold font-mono">29-AA 123.45</span>
              </div>
              <div className="flex justify-between">
                <span>Số điện thoại:</span>
                <span className="text-slate-900 font-bold font-mono">0968.123.456</span>
              </div>
            </div>

            {/* Call action button */}
            <button
              onClick={() => setShowCallModal(true)}
              className="w-full py-2.5 bg-[#185FA5] hover:bg-[#124b83] text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 border-none cursor-pointer"
            >
              <Phone size={13} className="fill-white" />
              Khẩn cấp: Gọi liên hệ Shipper
            </button>
          </div>

          {/* Quick Logs Tab or Waypoint Status Accordion */}
          <div className="border border-slate-150 rounded-2xl bg-white shadow-xs overflow-hidden flex flex-col flex-grow">
            <div className="flex bg-slate-50 border-b border-slate-150">
              <button 
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-2 text-center text-[10px] font-black uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'info' 
                    ? 'border-[#185FA5] text-[#185FA5]' 
                    : 'border-transparent text-slate-400 hover:text-slate-650'
                }`}
              >
                Nhật ký bưu tá
              </button>
              <button 
                onClick={() => setActiveTab('logs')}
                className={`flex-1 py-2 text-center text-[10px] font-black uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'logs' 
                    ? 'border-[#185FA5] text-[#185FA5]' 
                    : 'border-transparent text-slate-400 hover:text-slate-650'
                }`}
              >
                Lịch sử hành trình ({liveLog.length})
              </button>
            </div>

            <div className="p-3 text-[11px] font-semibold text-slate-600 max-h-36 overflow-y-auto scrollbar-thin">
              {activeTab === 'info' ? (
                <div className="space-y-2 text-left">
                  <div className="flex items-start gap-1.5 text-slate-700">
                    <Info size={12} className="text-[#185FA5] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-slate-800">Trạng thái bưu kiện:</p>
                      <p className="font-sans font-medium text-[11px] text-slate-500 mt-0.5">
                        {getStatusMessage(progress)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5 border-t border-slate-100 pt-2 text-slate-705">
                    <Shield size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-emerald-700">Chính sách ký mở bưu phẩm:</p>
                      <p className="text-[10px] text-slate-400 font-medium leading-normal">
                        REMIX.AI đặc quyền cho phép đồng kiểm thử thiết bị kĩ lưỡng trước khi hoàn COD.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 text-[10px] font-mono leading-relaxed divide-y divide-slate-50 max-h-36 overflow-y-auto">
                  {liveLog.length === 0 ? (
                    <p className="text-slate-400 italic text-center py-4 select-none">Nhật ký đang chờ bưu tá khởi hành...</p>
                  ) : (
                    liveLog.map((log, idx) => (
                      <p key={idx} className="text-slate-500 pt-1 font-medium text-[10px] leading-snug">{log}</p>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Shipper Simulation Call Modal */}
      <AnimatePresence>
        {showCallModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-slate-950 text-white rounded-[2rem] p-6 max-w-xs w-full text-center shadow-2xl relative border border-white/10"
            >
              {/* Call indicator visualizer */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className={`absolute -inset-3 bg-rose-500/10 rounded-full ${simulatedCallState === 'calling' ? 'animate-ping' : ''}`} />
                  <img 
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80" 
                    alt="Shipper portrait call"
                    className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px]">
                    📞
                  </div>
                </div>

                <div>
                  <h6 className="font-black text-sm tracking-tight text-white mb-0.5">Trần Anh Tuấn</h6>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">REMIX Premium Courier</p>
                  <p className="text-xs text-emerald-400 font-mono font-bold mt-1.5">
                    {simulatedCallState === 'idle' && 'Đang chuẩn bị...'}
                    {simulatedCallState === 'calling' && 'ĐANG KẾT NỐI HOTLINE...'}
                    {simulatedCallState === 'connected' && '☎️ ĐÃ KẾT NỐI (MÔ PHỎNG)'}
                  </p>
                </div>

                {simulatedCallState === 'connected' && (
                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-white/5 text-slate-300 text-[11px] leading-relaxed text-left">
                    <p className="font-extrabold text-emerald-400 text-center mb-1">Mô phỏng tin nhắn thoại bưu tá:</p>
                    "Dạ em chào anh/chị ạ! Em Tuấn giao hàng REMIX đây ạ, em đang nổ máy đi qua trục đường chính sắp tới chỗ anh/chị rồi. Anh/chị chuẩn bị nhận thiết bị nhé ạ!"
                  </div>
                )}

                <div className="flex items-center gap-3 w-full justify-center pt-2">
                  {simulatedCallState === 'idle' && (
                    <button
                      onClick={handleSimulateCall}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold w-full transition-all border-none cursor-pointer"
                    >
                      Gọi Shipper
                    </button>
                  )}
                  {simulatedCallState === 'calling' && (
                    <button
                      onClick={handleSimulateCall}
                      disabled
                      className="px-6 py-2.5 bg-slate-800 text-slate-400 rounded-xl text-xs font-bold w-full cursor-not-allowed border-none"
                    >
                      Đóng...
                    </button>
                  )}
                  {simulatedCallState === 'connected' && (
                    <button
                      onClick={handleEndCall}
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold w-full transition-all border-none cursor-pointer"
                    >
                      Gác máy
                    </button>
                  )}
                  <button
                    onClick={() => setShowCallModal(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium cursor-pointer border-none"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
