import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  ShieldCheck, 
  Zap, 
  MessageSquare, 
  TrendingUp, 
  CheckCircle2, 
  Check, 
  ArrowRight,
  Brain,
  Globe,
  Clock,
  Star,
  Users,
  Layout,
  MousePointer2,
  Lock,
  Headphones,
  Menu,
  X,
  Sparkles,
  UserPlus,
  Play,
  Search,
  Send,
  Package,
  Target,
  Heart,
  Scale,
  Quote,
  Facebook,
  Youtube,
  Instagram,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../utils/lang';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onAdminLogin?: () => void;
}

function StatItem({ icon: Icon, value, label, shouldCountUp, borderClasses, colorClass }: any) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
        observer.unobserve(domRef.current!);
      }
    }, { threshold: 0.1 });

    if (domRef.current) {
      observer.observe(domRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !shouldCountUp) return;

    const numericValue = parseInt(value.replace(/\./g, '').replace(/[^0-9]/g, ''));
    let startTimestamp: number | null = null;
    const duration = 1800;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // easeOut (quadratic)
      const easedProgress = 1 - (1 - progress) * (1 - progress);
      
      setCount(Math.floor(easedProgress * numericValue));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [isVisible, shouldCountUp, value]);

  const displayValue = shouldCountUp 
    ? count.toLocaleString('vi-VN') + (value.includes('+') ? '+' : '')
    : value;

  return (
    <motion.div 
      ref={domRef}
      initial={{ opacity: 0, y: 15 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`flex flex-col items-center justify-center p-[20px] text-center ${borderClasses}`}
    >
      <div className="text-[#185FA5] mb-[8px]">
        <Icon size={20} />
      </div>
      <span className={`text-[40px] font-bold leading-none ${colorClass}`}>
        {displayValue}
      </span>
      <span className="text-[13px] text-[#64748B] mt-[6px] font-medium">{label}</span>
    </motion.div>
  );
}

export default function LandingPage({ onGetStarted, onLogin, onAdminLogin }: LandingPageProps) {
  const { lang, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { label: "Khách hàng tin dùng", value: "500+", icon: <Users size={16} /> },
    { label: "Tỷ lệ phản hồi đúng", value: "99.2%", icon: <CheckCircle2 size={16} /> },
    { label: "Doanh thu tăng trưởng", value: "40%", icon: <TrendingUp size={16} /> },
    { label: "Thời gian phản hồi", value: "< 2s", icon: <Clock size={16} /> },
  ];

  const features = [
    {
      icon: <ShieldCheck size={24} />,
      title: "Thông tin 100% thực tế",
      description: "REMIX.AI không bao giờ bịa thông tin. Mọi câu trả lời đều dựa trên dữ liệu sản phẩm thực tế từ hệ thống của bạn."
    },
    {
      icon: <Heart size={24} />,
      title: "Tư vấn theo đúng bạn",
      description: "Hệ thống học thói quen, sở thích và ngân sách để đưa ra những gợi ý cá nhân hóa nhất cho từng khách hàng."
    },
    {
      icon: <Scale size={24} />,
      title: "So sánh 2-3 sản phẩm",
      description: "So sánh chi tiết các thông số, giá cả và ưu nhược điểm để bạn đưa ra lựa chọn mua sắm tốt nhất."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Kết nối dữ liệu",
      description: "Tải lên danh mục sản phẩm và kịch bản CSKH của bạn lên hệ thống."
    },
    {
      number: "02",
      title: "Huấn luyện AI",
      description: "Hệ thống tự động học kiến thức sản phẩm và phong cách tư vấn của thương hiệu."
    },
    {
      number: "03",
      title: "Triển khai đa kênh",
      description: "Gắn AI vào Website, Zalo, Facebook để bắt đầu hỗ trợ khách hàng 24/7."
    }
  ];

  const testimonials = [
    {
      name: "Trần Minh Đức",
      role: "CTO @ TechWorld",
      content: "Giải pháp giúp chúng tôi giảm 70% khối lượng công việc cho bộ phận CSKH mà vẫn giữ được doanh số ổn định.",
      avatar: "https://i.pravatar.cc/150?u=1"
    },
    {
      name: "Nguyễn Thu Thủy",
      role: "Giám đốc vận hành @ VinMart",
      content: "Tốc độ phản hồi của AI thực sự làm khách hàng bất ngờ, tỷ lệ khách quay lại mua sắm tăng rõ rệt.",
      avatar: "https://i.pravatar.cc/150?u=2"
    },
    {
      name: "Lê Hoàng Nam",
      role: "Founder @ FashionPro",
      content: "Dễ dàng triển khai, giao diện quản lý trực quan. Đây là khoản đầu tư xứng đáng nhất năm nay của tôi.",
      avatar: "https://i.pravatar.cc/150?u=3"
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-[#1A202C] selection:bg-[#185FA5]/10 selection:text-[#185FA5] overflow-x-hidden">
      {/* 1. NAVBAR */}
      <nav 
        className={`fixed top-0 left-0 right-0 h-16 bg-white z-50 border-b border-[#E2E8F0] px-6 transition-all duration-300 ${
          isScrolled ? 'shadow-[0_1px_8px_rgba(0,0,0,0.08)]' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-[28px] h-[28px] bg-[#185FA5] rounded-[8px] flex items-center justify-center text-white shrink-0">
              <span className="text-[12px] font-bold leading-none">AI</span>
            </div>
            <span className="font-bold text-[17px] tracking-tight text-[#1A202C] leading-none">
              REMIX<span className="text-[#185FA5]">.</span>AI
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 mr-auto ml-12">
            <a href="#features" className="text-sm font-bold text-[#64748B] hover:text-[#185FA5]">{lang === 'en' ? 'Features' : 'Tính năng'}</a>
            <a href="#how-it-works" className="text-sm font-bold text-[#64748B] hover:text-[#185FA5]">{lang === 'en' ? 'Process' : 'Quy trình'}</a>
            <div className="flex items-center gap-2">
              <a href="#pricing" className="text-sm font-bold text-[#64748B] hover:text-[#185FA5]">{lang === 'en' ? 'Pricing' : 'Báo giá'}</a>
              <button 
                onClick={toggleTheme}
                className="p-1.5 ml-1 text-[#64748B] hover:text-[#185FA5] dark:text-slate-400 dark:hover:text-amber-400 rounded-xl relative cursor-pointer active:scale-95 transition-all flex items-center justify-center border-0 bg-transparent"
                title={lang === 'en' ? 'Toggle light/dark theme' : 'Chuyển đổi giao diện Sáng/Tối'}
              >
                {isDark ? (
                  <Sun size={18} className="shrink-0 text-amber-500 animate-pulse" />
                ) : (
                  <Moon size={18} className="shrink-0 text-[#185FA5]" />
                )}
              </button>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button 
              onClick={onAdminLogin}
              className="px-3 py-2 text-gray-400 hover:text-gray-600 rounded-[8px] text-[12px] font-medium transition-all mr-1"
            >
              {lang === 'en' ? 'Admin Panel' : 'Quản trị'}
            </button>
            <button 
              onClick={onLogin}
              className="px-4 py-2 border border-amber-500/20 text-[#EA580C] bg-transparent rounded-[8px] text-[14px] font-bold hover:border-amber-500 hover:text-[#D97706] transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              {lang === 'en' ? 'Sign In' : 'Đăng nhập'}
            </button>
            <button 
              onClick={onGetStarted}
              className="group px-[18px] py-[8px] bg-[#185FA5] text-[#FFFFFF] rounded-[8px] text-[14px] font-medium hover:bg-[#0C447C] transition-all flex items-center gap-1"
            >
              <span>{lang === 'en' ? 'Register Free' : 'Đăng ký miễn phí'}</span>
              <ArrowRight size={14} className="opacity-0 w-0 group-hover:opacity-100 group-hover:w-3.5 transition-all duration-300" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-[#4A5568] hover:text-[#185FA5] transition-colors"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] md:hidden"
            />
            {/* Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-[70] md:hidden shadow-2xl flex flex-col"
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <div className="w-[24px] h-[24px] bg-[#185FA5] rounded-[6px] flex items-center justify-center text-white shrink-0">
                    <span className="text-[10px] font-bold leading-none">AI</span>
                  </div>
                  <span className="font-bold text-[15px] tracking-tight text-[#1A202C] leading-none">
                    REMIX<span className="text-[#185FA5]">.</span>AI
                  </span>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-[#4A5568] hover:text-[#185FA5] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-col p-6 gap-6">
                <div className="flex flex-col gap-4">
                  <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-base font-bold text-[#4A5568] hover:text-[#185FA5]">Tính năng</a>
                  <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="text-base font-bold text-[#4A5568] hover:text-[#185FA5]">Quy trình</a>
                  <div className="flex items-center justify-between">
                    <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-base font-bold text-[#4A5568] hover:text-[#185FA5]">Báo giá</a>
                    <button 
                      onClick={toggleTheme}
                      className="p-1.5 bg-gray-50 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-gray-200 dark:border-slate-700 active:scale-95 transition-all text-[#64748B]"
                      title="Chuyển đổi giao diện Sáng/Tối"
                    >
                      {isDark ? (
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Sun size={15} className="shrink-0" />
                          <span>Sáng</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs font-bold text-indigo-600">
                          <Moon size={15} className="shrink-0" />
                          <span>Tối</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
                <div className="h-px bg-[#E2E8F0] w-full" />
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => { onLogin(); setIsMenuOpen(false); }}
                    className="w-full px-4 py-3 border border-amber-500/20 text-[#EA580C] bg-transparent rounded-[8px] text-[15px] font-bold hover:border-amber-500 hover:text-[#D97706] transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    Đăng nhập
                  </button>
                  <button 
                    onClick={() => { onAdminLogin?.(); setIsMenuOpen(false); }}
                    className="w-full py-2 text-gray-400 hover:text-gray-600 text-xs font-bold transition-all text-center"
                  >
                    Quản trị
                  </button>
                  <button 
                    onClick={() => { onGetStarted(); setIsMenuOpen(false); }}
                    className="w-full px-4 py-3 bg-[#185FA5] text-[#FFFFFF] rounded-[8px] text-[15px] font-bold hover:bg-[#0C447C] transition-all flex items-center justify-center gap-2"
                  >
                    <span>Đăng ký miễn phí</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 2. HERO SECTION */}
      <section className="min-h-[calc(100vh-64px)] flex items-center pt-20 pb-16 px-6 bg-white border-b border-[#F1F5F9]">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20 items-center">
          {/* Left Column (55%) */}
          <div className="flex flex-col items-start text-left">
            <div 
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#E6F1FB] border-[0.5px] border-[#B5D4F4] rounded-[20px] mb-6"
              title={lang === 'en' ? "Consultation workspace backed by Google Gemini AI" : "Tư vấn được hỗ trợ bởi Google Gemini AI"}
            >
              <Sparkles size={13} className="text-[#185FA5]" />
              <span className="text-[13px] font-medium text-[#0C447C]">
                {lang === 'en' ? 'Powered by Gemini AI · Free' : 'Powered by Gemini AI · Miễn phí'}
              </span>
            </div>
            
            <h1 className="text-[34px] md:text-[52px] font-bold text-[#1A202C] leading-[1.15] tracking-tight mb-4">
              {lang === 'en' ? (
                <>Find perfect gadgets via <span className="text-[#185FA5]">AI Assist</span></>
              ) : (
                <>Tìm sản phẩm điện tử hoàn hảo với <span className="text-[#185FA5]">AI Tư Vấn</span></>
              )}
            </h1>
            
            <p className="text-[17px] text-[#64748B] mb-8 max-w-[500px] leading-[1.65]">
              {lang === 'en' 
                ? 'No need to master tech specifications. State your request — AI finds the exact match in seconds.' 
                : 'Không cần biết thông số kỹ thuật. Chỉ cần nói nhu cầu — AI sẽ tìm đúng sản phẩm, đúng giá, đúng chất lượng trong vài giây.'}
            </p>
            
            <div className="flex flex-wrap gap-5 mb-10">
              <div className="flex items-center gap-1.5">
                <Check size={14} className="text-[#639922]" />
                <span className="text-[13px] text-[#4A5568]">
                  {lang === 'en' ? '50,000+ Available Options' : 'Hơn 50.000 sản phẩm'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={14} className="text-[#639922]" />
                <span className="text-[13px] text-[#4A5568]">
                  {lang === 'en' ? 'Response under 2s' : 'Phản hồi dưới 2 giây'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={14} className="text-[#639922]" />
                <span className="text-[13px] text-[#4A5568]">
                  {lang === 'en' ? 'Free forever' : 'Miễn phí mãi mãi'}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-[10px] mb-[28px] w-full sm:w-auto">
              <button 
                onClick={onGetStarted}
                className="w-full sm:w-auto h-[50px] px-[28px] bg-[#185FA5] text-white text-[15px] font-medium rounded-[10px] flex items-center justify-center gap-2 hover:bg-[#0C447C] transition-all"
              >
                <UserPlus size={16} />
                {lang === 'en' ? 'Get Started' : 'Đăng ký miễn phí'}
              </button>
              <button 
                onClick={onLogin}
                className="w-full sm:w-auto h-[50px] px-[24px] bg-white text-[#1A202C] text-[15px] font-medium rounded-[10px] border border-[#E2E8F0] flex items-center justify-center gap-2 hover:bg-[#F8F9FA] hover:border-[#185FA5] transition-all"
              >
                <Play size={16} className="text-[#185FA5]" />
                {lang === 'en' ? 'Watch demo' : 'Xem demo'}
              </button>
            </div>

            <div className="flex items-center gap-[10px]">
              <div className="flex -space-x-[6px]">
                <div className="w-[26px] h-[26px] rounded-full bg-[#E6F1FB] border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">A</div>
                <div className="w-[26px] h-[26px] rounded-full bg-[#185FA5] border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">B</div>
                <div className="w-[26px] h-[26px] rounded-full bg-[#0C447C] border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">C</div>
              </div>
              <span className="text-[13px] text-[#64748B]">Đã có 5.000+ người dùng tuần này</span>
            </div>

            <div className="mt-12 pt-10 border-t border-[#F1F5F9] flex flex-wrap items-center gap-x-10 gap-y-6">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-[#1A202C]">500+</span>
                <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Doanh nghiệp</span>
              </div>
              <div className="flex flex-col border-l border-[#E2E8F0] pl-10">
                <span className="text-2xl font-bold text-[#1A202C]">99.2%</span>
                <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Hài lòng</span>
              </div>
              <div className="flex flex-col border-l border-[#E2E8F0] pl-10">
                <span className="text-2xl font-bold text-[#1A202C]">&lt; 2s</span>
                <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Phản hồi</span>
              </div>
            </div>
          </div>

          {/* Right Column (45%) */}
          <div className="relative order-first lg:order-last">
            <div className="max-w-[400px] border-[0.5px] border-[#E2E8F0] rounded-[16px] overflow-hidden ml-auto bg-white shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)]">
              {/* Chat Header */}
              <div className="bg-[#185FA5] p-[12px_16px] flex items-center gap-[10px]">
                <div className="w-[32px] h-[32px] rounded-full bg-[#0C447C] flex items-center justify-center text-white">
                  <Bot size={16} />
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-bold text-white">AI Tư Vấn</div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-[6px] h-[6px] rounded-full bg-[#639922]"></div>
                    <span className="text-[11px] text-[#C0DD97]">Online</span>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-[14px] flex flex-col gap-[10px] min-h-[360px] bg-[#F8F9FA] relative overflow-hidden">
                {/* AI Message 1 */}
                <div className="flex flex-col items-start gap-2">
                  <div className="bg-[#FFFFFF] border-[0.5px] border-[#E2E8F0] rounded-[10px] rounded-tl-[3px] p-[10px_12px] text-[13px] text-[#1A202C] max-w-[90%] shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                    Xin chào! Bạn đang tìm sản phẩm gì hôm nay?
                  </div>
                  <span className="text-[10px] text-[#94A3B8] ml-1">10:24 AM</span>
                </div>

                {/* User Message */}
                <div className="flex flex-col items-end gap-2">
                  <div className="bg-[#185FA5] text-white p-[10px_12px] rounded-[10px] rounded-tr-[3px] text-[13px] max-w-[85%] leading-[1.6]">
                    Tai nghe không dây tầm 1.5 triệu
                  </div>
                  <span className="text-[10px] text-[#94A3B8]">10:24 AM</span>
                </div>

                {/* AI Thinking Chip */}
                <div className="flex items-start">
                  <div className="inline-flex items-center gap-[4px] bg-[#FFFFFF] border-[0.5px] border-[#E2E8F0] rounded-[20px] p-[4px_10px]">
                    <Brain size={12} className="text-[#94A3B8]" />
                    <span className="text-[11px] text-[#94A3B8] font-medium">Đang phân tích...</span>
                  </div>
                </div>

                {/* AI Message 4 - Product Search Results */}
                <div className="flex flex-col items-start gap-2">
                  <div className="bg-[#FFFFFF] border-[0.5px] border-[#E2E8F0] rounded-[10px] p-[10px_12px] text-[13px] text-[#1A202C] max-w-[95%] shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                    <div className="mb-[8px]">Tôi tìm được 2 lựa chọn phù hợp:</div>
                    
                    <div className="flex flex-col gap-[6px]">
                      {/* Product Card 1 */}
                      <div className="border-[0.5px] border-[#E2E8F0] rounded-[8px] p-[8px_10px] flex gap-[8px] items-center bg-white">
                        <div className="w-[32px] h-[32px] bg-[#E6F1FB] rounded-[6px] flex items-center justify-center text-[#185FA5] shrink-0">
                          <Headphones size={16} />
                        </div>
                        <div className="flex-1">
                          <div className="text-[12px] font-bold text-[#1A202C] leading-none mb-1">Sony WH-CH520</div>
                          <div className="text-[12px] text-[#185FA5] font-medium leading-none">1.290.000 ₫</div>
                        </div>
                        <div className="text-[11px] text-[#185FA5] font-bold ml-auto cursor-pointer hover:underline" title="Xem chi tiết sản phẩm">Xem →</div>
                      </div>

                      {/* Product Card 2 */}
                      <div className="border-[0.5px] border-[#E2E8F0] rounded-[8px] p-[8px_10px] flex gap-[8px] items-center bg-white">
                        <div className="w-[32px] h-[32px] bg-[#E6F1FB] rounded-[6px] flex items-center justify-center text-[#185FA5] shrink-0">
                          <Headphones size={16} />
                        </div>
                        <div className="flex-1">
                          <div className="text-[12px] font-bold text-[#1A202C] leading-none mb-1">JBL Tune 520BT</div>
                          <div className="text-[12px] text-[#185FA5] font-medium leading-none">1.490.000 ₫</div>
                        </div>
                        <div className="text-[11px] text-[#185FA5] font-bold ml-auto cursor-pointer hover:underline" title="Xem chi tiết sản phẩm">Xem →</div>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#94A3B8] ml-1">10:25 AM</span>
                </div>

                {/* Blur Overlay & CTA */}
                <div className="absolute bottom-0 left-0 w-full h-[80px] bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA]/80 to-transparent flex items-end justify-center pb-4 px-4 pointer-events-none">
                  <div className="text-[12px] text-[#185FA5] font-bold text-center pointer-events-auto cursor-pointer hover:underline transition-all">
                    Đăng ký để tư vấn không giới hạn →
                  </div>
                </div>
              </div>

              {/* Quick Chips */}
              <div className="p-[10px_14px] bg-[#FFFFFF] border-t-[0.5px] border-[#E2E8F0] flex gap-[6px] flex-wrap">
                <div className="border-[0.5px] border-[#E2E8F0] rounded-[20px] p-[4px_10px] text-[11px] text-[#64748B] cursor-pointer hover:bg-[#F8FAFC]">🎧 Tai nghe</div>
                <div className="border-[0.5px] border-[#E2E8F0] rounded-[20px] p-[4px_10px] text-[11px] text-[#64748B] cursor-pointer hover:bg-[#F8FAFC]">💻 Laptop</div>
                <div className="border-[0.5px] border-[#E2E8F0] rounded-[20px] p-[4px_10px] text-[11px] text-[#64748B] cursor-pointer hover:bg-[#F8FAFC]">📱 Điện thoại</div>
              </div>

              {/* Chat Input Bar */}
              <div className="p-[10px_14px] bg-[#FFFFFF] border-t-[0.5px] border-[#E2E8F0] flex gap-[8px] items-center">
                <div className="bg-[#F8F9FA] border-[0.5px] border-[#E2E8F0] rounded-[20px] p-[6px_12px] flex-1 text-[12px] text-[#94A3B8]">
                  Hỏi gì đó...
                </div>
                <div className="w-[28px] h-[28px] bg-[#185FA5] rounded-full flex items-center justify-center text-white shrink-0 cursor-pointer">
                  <Send size={13} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STATS SECTION */}
      <section className="w-full bg-[#F8F9FA] border-y-[0.5px] border-[#E2E8F0] py-0">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
            {/* Stat 1 */}
            <StatItem 
              icon={Package} 
              value="50.000+" 
              label="Sản phẩm trong hệ thống" 
              shouldCountUp={true}
              colorClass="text-[#1A202C]"
              borderClasses="border-r-[0.5px] border-b-[0.5px] lg:border-b-0 border-[#E2E8F0]"
            />
            {/* Stat 2 */}
            <StatItem 
              icon={Target} 
              value="98%" 
              label="Tỷ lệ tư vấn chính xác" 
              shouldCountUp={false}
              colorClass="text-[#185FA5]"
              borderClasses="border-b-[0.5px] lg:border-b-0 lg:border-r-[0.5px] border-[#E2E8F0]"
            />
            {/* Stat 3 */}
            <StatItem 
              icon={Zap} 
              value="< 2s" 
              label="Thời gian phản hồi AI" 
              shouldCountUp={false}
              colorClass="text-[#1A202C]"
              borderClasses="border-r-[0.5px] border-[#E2E8F0]"
            />
            {/* Stat 4 */}
            <StatItem 
              icon={Users} 
              value="5.000+" 
              label="Người dùng tuần này" 
              shouldCountUp={true}
              colorClass="text-[#185FA5]"
              borderClasses=""
            />
          </div>
        </div>
      </section>

      {/* 4. FEATURES (3 tính năng) */}
      <section id="features" className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-[48px]">
            <div className="text-[11px] uppercase text-[#185FA5] font-bold tracking-[0.1em] mb-[10px]">TẠI SAO CHỌN REMIX.AI</div>
            <h2 className="text-[36px] font-bold text-[#1A202C] leading-none mb-4">AI hiểu bạn, không chỉ tìm kiếm</h2>
            <p className="text-[16px] text-[#64748B] max-w-[540px] mx-auto leading-relaxed">
              Khác với Google, REMIX.AI hiểu ngữ cảnh, ngân sách và nhu cầu thực sự của bạn
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx} 
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className={`bg-white p-[28px] rounded-[14px] shadow-sm hover:shadow-md transition-shadow group cursor-default relative border-[0.5px] flex flex-col ${
                  idx === 1 ? 'border-[#185FA5] border-[2px]' : 'border-[#E2E8F0]'
                }`}
              >
                {idx === 1 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-[12px] py-[4px] bg-[#185FA5] text-white rounded-[20px] text-[11px] font-bold whitespace-nowrap">
                    Được dùng nhiều nhất
                  </div>
                )}
                <div className={`w-[48px] h-[48px] rounded-[10px] flex items-center justify-center mb-6 shrink-0 ${
                  idx === 1 ? 'bg-[#185FA5] text-white' : 'bg-[#E6F1FB] text-[#185FA5]'
                }`}>
                  {feature.icon}
                </div>
                <h3 className="font-bold text-[18px] text-[#1A202C] mb-[12px] tracking-tight">{feature.title}</h3>
                <p className="text-[14px] text-[#64748B] leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-8 text-[13px] font-bold text-[#185FA5] cursor-pointer hover:underline flex items-center gap-1">
                  Tìm hiểu thêm <ArrowRight size={14} />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            <button 
              onClick={onGetStarted}
              className="px-[36px] py-[14px] bg-[#185FA5] text-[#FFFFFF] rounded-[10px] text-[16px] font-bold hover:bg-[#0C447C] transition-all flex items-center gap-2 shadow-[0_4px_14px_rgba(24,95,165,0.3)]"
            >
              Bắt đầu miễn phí
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (3 bước) */}
      <section id="how-it-works" className="py-20 px-6 bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-[64px]">
            <div className="text-[11px] uppercase text-[#185FA5] font-bold tracking-[0.1em] mb-[10px]">QUY TRÌNH SỬ DỤNG</div>
            <h2 className="text-[36px] font-bold text-[#1A202C] leading-none mb-4">Tư vấn trong 3 bước đơn giản</h2>
            <p className="text-[16px] text-[#64748B] max-w-[540px] mx-auto leading-relaxed">
              Không cần tài khoản để xem demo. Đăng ký để lưu lịch sử và tư vấn không giới hạn.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            {[
              {
                number: "1",
                title: "Tạo tài khoản",
                description: "Đăng ký trong 30 giây. Chỉ cần email. Không cần thẻ tín dụng.",
                chip: "Miễn phí mãi mãi"
              },
              {
                number: "2",
                title: "Nhập nhu cầu",
                description: "Nói nhu cầu bằng tiếng Việt. VD: 'Tai nghe chống ồn tầm 1.5 triệu, dùng khi làm việc'",
                example: "VD: 'Tai nghe chống ồn tầm 1.5 triệu...'"
              },
              {
                number: "3",
                title: "Nhận top 3 gợi ý tốt nhất",
                description: "Kèm so sánh chi tiết và link đặt hàng ngay",
                chip: "Chính xác 98%"
              }
            ].map((step, idx) => (
              <div key={idx} className="relative flex flex-col items-center text-center">
                <div className={`w-[60px] h-[60px] rounded-full flex items-center justify-center mb-6 relative z-10 border-[2px] ${
                  idx >= 1 
                    ? 'bg-[#185FA5] border-[#185FA5] text-white shadow-[0_4px_14px_rgba(24,95,165,0.4)]' 
                    : 'bg-[#E6F1FB] border-[#185FA5] text-[#185FA5]'
                }`}>
                  <span className="text-[22px] font-bold">{step.number}</span>
                </div>
                <h3 className="font-bold text-[17px] text-[#1A202C] mb-3 tracking-tight">{step.title}</h3>
                <p className="text-[14px] text-[#64748B] leading-relaxed max-w-[280px]">
                  {step.description}
                </p>
                {step.chip && (
                  <div className="mt-3 px-[12px] py-[4px] bg-[#EAF3DE] text-[#276749] rounded-[20px] text-[11px] font-bold inline-block">
                    {step.chip}
                  </div>
                )}
                {idx === 1 && (
                  <div className="mt-3 px-[12px] py-[4px] bg-[#F1F5F9] text-[#185FA5] rounded-[20px] text-[12px] font-medium inline-block italic">
                    "Tai nghe chống ồn..."
                  </div>
                )}
                {/* Connector line for desktop */}
                {idx < 2 && (
                  <div className="hidden md:block absolute top-[30px] left-[calc(50%+40px)] w-[calc(100%-80px)] border-t-[1px] border-dashed border-[#B5D4F4] -z-0">
                    <div className="absolute right-[-2px] top-1/2 -translate-y-1/2 border-l-[6px] border-l-[#B5D4F4] border-y-[4px] border-y-transparent"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <button 
              onClick={onLogin}
              className="h-[50px] px-[32px] bg-[#185FA5] text-white rounded-[10px] text-[15px] font-bold hover:bg-[#0C447C] transition-all flex items-center gap-2 shadow-[0_4px_14px_rgba(24,95,165,0.3)]"
            >
              <UserPlus size={16} />
              Bắt đầu ngay — hoàn toàn miễn phí
            </button>
          </div>
        </div>
      </section>

      {/* 6. PREVIEW DEMO (chat mockup tĩnh) */}
      <section className="py-32 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1">
            <div className="bg-[#1A202C] rounded-2xl shadow-xl overflow-hidden border border-[#2D3748] flex h-[500px]">
              {/* Mock Sidebar */}
              <div className="w-16 sm:w-20 bg-[#111827] border-r border-[#2D3748] flex flex-col items-center py-6 gap-6">
                <div className="w-10 h-10 bg-[#185FA5] rounded-xl flex items-center justify-center text-white font-bold text-xs">AI</div>
                <div className="w-8 h-8 bg-[#2D3748] rounded-lg" />
                <div className="w-8 h-8 bg-[#2D3748] rounded-lg" />
                <div className="mt-auto w-8 h-8 bg-[#2D3748] rounded-full" />
              </div>
              
              {/* Mock Chat Area */}
              <div className="flex-1 flex flex-col">
                <div className="h-16 border-b border-[#2D3748] px-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm font-bold text-gray-200">AI Consultant v2</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-16 h-2 bg-[#2D3748] rounded" />
                  </div>
                </div>
                
                <div className="flex-1 p-6 space-y-6">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded bg-[#185FA5]/20 border border-[#185FA5]/30 flex items-center justify-center shrink-0">
                      <Bot size={16} className="text-[#185FA5]" />
                    </div>
                    <div className="bg-[#2D3748] px-4 py-3 rounded-xl rounded-tl-none text-sm text-gray-200 max-w-[80%] leading-relaxed">
                      Xin chào! Tôi thấy bạn đang quan tâm đến dòng laptop Dell XPS. Bạn cần tư vấn về cấu hình đồ họa hay văn phòng ạ?
                    </div>
                  </div>
                  
                  <div className="flex gap-3 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-gray-600 shrink-0 border border-gray-500" />
                    <div className="bg-[#185FA5] px-4 py-3 rounded-xl rounded-tr-none text-sm text-white max-w-[80%] leading-relaxed font-medium">
                      Mình cần bản 16GB RAM để chạy AutoCAD. Cho mình xin giá tốt nhất nhé.
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded bg-[#185FA5]/20 border border-[#185FA5]/30 flex items-center justify-center shrink-0">
                      <Bot size={16} className="text-[#185FA5]" />
                    </div>
                    <div className="bg-[#2D3748] px-4 py-3 rounded-xl rounded-tl-none text-sm text-gray-200 max-w-[80%] leading-relaxed">
                      Dạ hiện Dell XPS 15 (16GB RAM) đang có ưu đãi giảm 2,000,000đ tại chi nhánh Hà Nội. Bạn có muốn tôi giữ hàng giúp không?
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t border-[#2D3748]">
                  <div className="bg-[#2D3748] h-10 rounded-lg w-full flex items-center px-4">
                    <span className="text-xs text-gray-500 font-medium">Nhập phản hồi...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl font-bold text-[#1A202C] tracking-tight mb-8">
              Trải nghiệm thực tế <br /> như tư vấn viên chuyên nghiệp
            </h2>
            <p className="text-lg text-[#64748B] font-medium mb-10 leading-relaxed">
              Hệ thống AI không chỉ trả lời theo kịch bản, nó hiểu sâu về thuộc tính sản phẩm, tồn kho và các chương trình khuyến mãi đang diễn ra để đưa ra tư vấn thuyết phục nhất.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-[#185FA5]/10 flex items-center justify-center shrink-0 mt-1">
                  <CheckCircle2 size={14} className="text-[#185FA5]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1A202C]">Chủ động chốt đơn</h4>
                  <p className="text-sm text-[#64748B] font-medium">Tự động phát hiện ý định mua hàng và hướng dẫn thanh toán.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-[#185FA5]/10 flex items-center justify-center shrink-0 mt-1">
                  <CheckCircle2 size={14} className="text-[#185FA5]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1A202C]">Xử lý đa kênh</h4>
                  <p className="text-sm text-[#64748B] font-medium">Đồng nhất trải nghiệm trên Website, Messenger và Zalo.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS (3 đánh giá) */}
      <section id="testimonials" className="py-20 px-6 bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[32px] md:text-[36px] font-bold text-[#1A202C] leading-tight mb-4">Họ đã mua đúng sản phẩm nhờ REMIX.AI</h2>
            <div className="w-12 h-1 bg-[#185FA5] mx-auto mb-6"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-[20px]">
            {[
              {
                name: "Nguyễn Lan",
                role: "28t, Nhân viên VP",
                content: "Tôi nói 'tai nghe chống ồn cho văn phòng' và ngay lập tức nhận được đúng sản phẩm tôi cần. Không phải lướt hàng giờ nữa.",
                avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
                result: "Tiết kiệm 2 tiếng tìm kiếm"
              },
              {
                name: "Trần Minh",
                role: "24t, Sinh viên",
                content: "So sánh 3 laptop cùng lúc, rõ ràng từng điểm. Mình là dân không rành kỹ thuật nhưng hiểu ngay.",
                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
                result: "Mua đúng máy ngay lần đầu"
              },
              {
                name: "Lê Hương",
                role: "32t, Nhiếp ảnh gia",
                content: "Hỏi 'điện thoại chụp ảnh đẹp tầm 8 triệu' — AI đưa ra 3 lựa chọn kèm so sánh camera rất chi tiết.",
                avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
                result: "Tiết kiệm 500.000đ so với dự định"
              }
            ].map((t, idx) => (
              <div key={idx} className="p-[24px] bg-[#FFFFFF] rounded-[16px] border-[0.5px] border-[#E2E8F0] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(24,95,165,0.08)]">
                <div className="flex gap-[2px] mb-[14px]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} className="fill-[#EF9F27] text-[#EF9F27]" />
                  ))}
                </div>
                <div className="mb-[16px] overflow-hidden">
                  <Quote size={20} className="text-[#E6F1FB] float-left mr-[8px] fill-[#E6F1FB]" />
                  <p className="text-[14px] text-[#1A202C] italic leading-[1.65]">
                    "{t.content}"
                  </p>
                </div>

                <div className="mb-[20px]">
                  <span className="inline-block bg-[#EAF3DE] text-[#276749] text-[11px] font-bold rounded-[20px] px-[10px] py-[4px]">
                    {t.result}
                  </span>
                </div>

                <div className="flex gap-[10px] items-center mt-[16px] border-t-[0.5px] border-[#F1F5F9] pt-[16px]">
                  <div className="w-[38px] h-[38px] rounded-full bg-[#185FA5] flex items-center justify-center text-white text-[13px] font-bold overflow-hidden shrink-0">
                    <img 
                      referrerPolicy="no-referrer" 
                      src={t.avatar} 
                      alt={t.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1A202C] text-[14px] leading-tight">{t.name}</h4>
                    <p className="text-[#94A3B8] text-[12px]">{t.role}</p>
                  </div>
                  <ShieldCheck size={15} className="text-[#639922] ml-auto shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. PRICING (3 gói) */}
      <section id="pricing" className="py-20 px-6 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-[64px]">
            <div className="text-[11px] uppercase text-[#185FA5] font-bold tracking-[0.1em] mb-[10px]">BẢNG GIÁ DỊCH VỤ</div>
            <h2 className="text-[36px] font-bold text-[#1A202C] leading-none mb-4">Miễn phí để bắt đầu, nâng cấp khi cần</h2>
            <p className="text-[16px] text-[#64748B] max-w-[540px] mx-auto leading-relaxed">
              Không có chi phí ẩn. Hủy bất cứ lúc nào.
            </p>
          </div>

          <div className="flex justify-center items-center mb-10">
            <div className="flex p-1 bg-white border-[0.5px] border-[#E2E8F0] rounded-[20px] shadow-sm">
              <button 
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-[20px] text-[14px] font-bold transition-all ${
                  billingCycle === 'monthly' ? 'bg-[#185FA5] text-white shadow-md' : 'text-[#64748B] hover:text-[#1A202C]'
                }`}
              >
                Hàng tháng
              </button>
              <button 
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-[20px] text-[14px] font-bold transition-all ${
                  billingCycle === 'yearly' ? 'bg-[#185FA5] text-white shadow-md' : 'text-[#64748B] hover:text-[#1A202C]'
                }`}
              >
                Hàng năm
              </button>
            </div>
            <div className="ml-[8px] px-[10px] py-[3px] bg-[#EAF3DE] text-[#276749] text-[11px] font-bold rounded-[20px]">
              Tiết kiệm 20%
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="p-[28px] bg-white border-[0.5px] border-[#E2E8F0] rounded-[16px] flex flex-col shadow-sm">
              <h4 className="font-bold text-[18px] text-[#1A202C] mb-[12px]">Miễn phí</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-[36px] font-bold text-[#1A202C]">0đ</span>
                <span className="text-[14px] text-[#64748B]">/ tháng</span>
              </div>
              <p className="text-[13px] text-[#94A3B8] mb-[24px]">Dùng mãi mãi</p>
              
              <div className="border-t-[0.5px] border-[#E2E8F0]"></div>
              
              <ul className="flex flex-col gap-[8px] mt-[16px] mb-[32px] flex-1">
                <li className="flex items-center gap-[10px] text-[13px] text-[#1A202C]">
                  <Check size={14} className="text-[#639922] shrink-0" />
                  10 lượt tư vấn / ngày
                </li>
                <li className="flex items-center gap-[10px] text-[13px] text-[#1A202C]">
                  <Check size={14} className="text-[#639922] shrink-0" />
                  Gợi ý tối đa 3 sản phẩm
                </li>
                <li className="flex items-center gap-[10px] text-[13px] text-[#1A202C]">
                  <Check size={14} className="text-[#639922] shrink-0" />
                  Lịch sử 7 ngày
                </li>
                <li className="flex items-center gap-[10px] text-[13px] text-[#1A202C]">
                  <Check size={14} className="text-[#639922] shrink-0" />
                  Không lưu yêu thích
                </li>
              </ul>
              
              <button 
                onClick={onLogin}
                className="w-full h-[44px] border border-[#E2E8F0] text-[#1A202C] text-[14px] font-bold rounded-[8px] hover:border-[#185FA5] hover:text-[#185FA5] transition-all"
              >
                Đăng ký miễn phí
              </button>
            </div>
            
            {/* Pro (FEATURED) */}
            <div className="p-[28px] bg-[#185FA5] border-[2px] border-[#185FA5] rounded-[16px] flex flex-col relative shadow-xl">
              <div className="absolute -top-[12px] left-1/2 -translate-x-1/2 bg-[#0C447C] text-[#B5D4F4] px-[14px] py-[4px] rounded-[20px] text-[11px] font-bold whitespace-nowrap">
                Phổ biến nhất
              </div>
              
              <h4 className="font-bold text-[18px] text-[#FFFFFF] mb-[12px]">Pro</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-[36px] font-bold text-[#FFFFFF]">
                  {billingCycle === 'monthly' ? '99.000đ' : '79.000đ'}
                </span>
                <span className="text-[14px] text-[#B5D4F4]">/ tháng</span>
              </div>
              <p className="text-[13px] text-[#B5D4F4] mb-[24px]">Được thanh toán hàng năm</p>
              
              <div className="border-t-[0.5px] border-white/20"></div>
              
              <ul className="flex flex-col gap-[8px] mt-[16px] mb-[32px] flex-1">
                <li className="flex items-center gap-[10px] text-[13px] text-[#FFFFFF]">
                  <Check size={14} className="text-[#C0DD97] shrink-0" />
                  Không giới hạn lượt tư vấn
                </li>
                <li className="flex items-center gap-[10px] text-[13px] text-[#FFFFFF]">
                  <Check size={14} className="text-[#C0DD97] shrink-0" />
                  Gợi ý tối đa 10 sản phẩm
                </li>
                <li className="flex items-center gap-[10px] text-[13px] text-[#FFFFFF]">
                  <Check size={14} className="text-[#C0DD97] shrink-0" />
                  Lịch sử không giới hạn
                </li>
                <li className="flex items-center gap-[10px] text-[13px] text-[#FFFFFF]">
                  <Check size={14} className="text-[#C0DD97] shrink-0" />
                  Lưu yêu thích & so sánh
                </li>
                <li className="flex items-center gap-[10px] text-[13px] text-[#FFFFFF]">
                  <Check size={14} className="text-[#C0DD97] shrink-0" />
                  Ưu tiên phản hồi
                </li>
              </ul>
              
              <button 
                onClick={onGetStarted}
                className="w-full h-[44px] bg-[#FFFFFF] text-[#185FA5] text-[15px] font-medium rounded-[8px] hover:bg-[#E6F1FB] transition-all"
              >
                Dùng thử 14 ngày miễn phí
              </button>
            </div>
            
            {/* Enterprise */}
            <div className="p-[28px] bg-white border-[0.5px] border-[#E2E8F0] rounded-[16px] flex flex-col shadow-sm">
              <h4 className="font-bold text-[18px] text-[#1A202C] mb-[12px]">Doanh nghiệp</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-[36px] font-bold text-[#1A202C]">Liên hệ</span>
              </div>
              <p className="text-[13px] text-[#94A3B8] mb-[24px]">Tùy chỉnh theo nhu cầu</p>
              
              <div className="border-t-[0.5px] border-[#E2E8F0]"></div>
              
              <ul className="flex flex-col gap-[10px] mt-[16px] mb-[32px] flex-1">
                <li className="flex items-center gap-[10px] text-[13px] text-[#1A202C]">
                  <Check size={14} className="text-[#639922] shrink-0" />
                  Tất cả tính năng Pro
                </li>
                <li className="flex items-center gap-[10px] text-[13px] text-[#1A202C]">
                  <Check size={14} className="text-[#639922] shrink-0" />
                  Tích hợp API riêng
                </li>
                <li className="flex items-center gap-[10px] text-[13px] text-[#1A202C]">
                  <Check size={14} className="text-[#639922] shrink-0" />
                  Dashboard admin
                </li>
                <li className="flex items-center gap-[10px] text-[13px] text-[#1A202C]">
                  <Check size={14} className="text-[#639922] shrink-0" />
                  Hỗ trợ ưu tiên 24/7
                </li>
                <li className="flex items-center gap-[10px] text-[13px] text-[#1A202C]">
                  <Check size={14} className="text-[#639922] shrink-0" />
                  White-label (tùy chọn)
                </li>
              </ul>
              
              <button className="w-full h-[44px] border border-[#E2E8F0] text-[#1A202C] text-[14px] font-bold rounded-[8px] hover:border-[#185FA5] hover:text-[#185FA5] transition-all">
                Liên hệ tư vấn
              </button>
            </div>
          </div>

          <div className="mt-12 flex items-center justify-center gap-2 text-[#94A3B8]">
            <Lock size={12} />
            <span className="text-[12px]">Tất cả gói đều có bảo mật SSL · Dữ liệu không bao giờ được bán</span>
          </div>
        </div>
      </section>

      {/* 9. CTA FINAL SECTION */}
      <section className="py-20 px-6 bg-[#185FA5] text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-[20px]">
            <Bot size={44} className="text-white opacity-90" />
          </div>
          <h2 className="text-[32px] md:text-[40px] font-bold text-white leading-tight mb-4">
            Sẵn sàng mua sắm thông minh hơn?
          </h2>
          <p className="text-[17px] text-white opacity-85 mb-[40px] max-w-2xl mx-auto leading-relaxed">
            Đăng ký miễn phí ngay — không cần thẻ tín dụng, không cam kết.
          </p>
          <div className="flex flex-col sm:flex-row gap-[12px] justify-center items-center">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto h-[52px] px-[32px] bg-[#FFFFFF] text-[#185FA5] text-[16px] font-bold rounded-[10px] hover:bg-[#E6F1FB] transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <UserPlus size={16} />
              Đăng ký miễn phí ngay
            </button>
            <button 
              onClick={onLogin}
              className="w-full sm:w-auto h-[52px] px-[24px] bg-transparent text-white border border-white/40 text-[16px] font-bold rounded-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Play size={16} />
              Xem demo trước
            </button>
          </div>

          <div className="mt-[24px] flex items-center justify-center gap-2 text-white/60 text-[12px]">
            <Lock size={12} />
            <span>Bảo mật SSL · Không spam · Hủy bất cứ lúc nào</span>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-[#0C447C] pt-[56px] pb-[28px] px-6">
        <div className="max-w-7xl mx-auto border-b-[0.5px] border-white/10 pb-[40px] mb-[28px]">
          <div className="grid md:grid-cols-4 gap-[40px]">
            <div>
              <div className="flex items-center gap-2 mb-[12px]">
                <div className="w-[32px] h-[32px] bg-[#FFFFFF] rounded-[8px] flex items-center justify-center text-[#0C447C] shrink-0">
                  <span className="text-[14px] font-bold leading-none">AI</span>
                </div>
                <span className="font-bold text-[18px] text-white leading-none">
                  REMIX.AI
                </span>
              </div>
              <p className="text-[13px] text-white/60 leading-[1.6] max-w-xs mb-8">
                AI tư vấn bán hàng điện tử. Hỗ trợ bởi Gemini AI.
              </p>
              <div className="flex gap-4">
                <div className="w-[36px] h-[36px] rounded-[8px] bg-white/5 border-[0.5px] border-white/20 flex items-center justify-center text-white/50 hover:border-white hover:text-white transition-all cursor-pointer"><Facebook size={16} /></div>
                <div className="w-[36px] h-[36px] rounded-[8px] bg-white/5 border-[0.5px] border-white/20 flex items-center justify-center text-white/50 hover:border-white hover:text-white transition-all cursor-pointer"><Youtube size={16} /></div>
                <div className="w-[36px] h-[36px] rounded-[8px] bg-white/5 border-[0.5px] border-white/20 flex items-center justify-center text-white/50 hover:border-white hover:text-white transition-all cursor-pointer"><Instagram size={16} /></div>
              </div>
            </div>
            
            <div>
              <h5 className="text-[11px] uppercase text-white/40 tracking-[0.1em] mb-[14px] font-bold">DANH MỤC</h5>
              <ul className="space-y-[8px] text-[13px] text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">Tai nghe</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Laptop</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Điện thoại</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Smartwatch</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Phụ kiện</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="text-[11px] uppercase text-white/40 tracking-[0.1em] mb-[14px] font-bold">CÔNG TY</h5>
              <ul className="space-y-[8px] text-[13px] text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">Giới thiệu</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Tính năng</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Bảng giá</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Liên hệ</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="text-[11px] uppercase text-white/40 tracking-[0.1em] mb-[14px] font-bold">HỖ TRỢ</h5>
              <ul className="space-y-[8px] text-[13px] text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">Câu hỏi thường gặp</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Điều khoản</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tuyển dụng</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-[24px] flex flex-col md:flex-row justify-between items-center gap-4 text-[12px]">
          <div className="text-white/40 cursor-help" title="Tư vấn được hỗ trợ bởi Google Gemini AI">
            © 2026 REMIX.AI · Powered by Gemini AI
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onAdminLogin}
              className="text-white/30 hover:text-white/60 transition-colors cursor-pointer"
            >
              Quản trị (Admin)
            </button>
            <span className="text-white/10">|</span>
            <div className="text-white/30">
              Thiết kế bởi Bùi Tiến Anh
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

