import React, { useState, useEffect } from 'react';
import { Bolt, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface FlashSale {
  isActive: boolean;
  title: string;
  description: string;
  endDate: string;
  discountCode?: string;
  discountPercent?: number;
}

export default function FlashSaleBanner() {
  const [flashSale, setFlashSale] = useState<FlashSale | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ hours: string; minutes: string; seconds: string } | null>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('remix_flash_sale_dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const [isLessThanOneHour, setIsLessThanOneHour] = useState(false);

  // Initialize and check localStorage
  useEffect(() => {
    const checkFlashSale = () => {
      try {
        if (localStorage.getItem('remix_flash_sale_dismissed') === 'true') {
          setIsDismissed(true);
          return;
        }

        const saved = localStorage.getItem('remix_flash_sale');
        if (saved) {
          const parsed: FlashSale = JSON.parse(saved);
          const end = new Date(parsed.endDate).getTime();
          const now = Date.now();
          if (parsed.isActive && end > now) {
            setFlashSale(parsed);
          } else {
            setFlashSale(null);
            setTimeLeft(null);
          }
        } else {
          // Default flash sale for the headphones discount of 15%
          const defaultSale: FlashSale = {
            isActive: true,
            title: "Giảm 15% tất cả tai nghe",
            description: "Chương trình siêu sale tai nghe độc quyền chỉ có tại Remix.AI",
            endDate: new Date(Date.now() + 2 * 60 * 60 * 1000 + 45 * 60 * 1000 + 30 * 1000).toISOString(), // 2h 45m 30s
            discountCode: "TAINGHE15",
            discountPercent: 15
          };
          localStorage.setItem('remix_flash_sale', JSON.stringify(defaultSale));
          setFlashSale(defaultSale);
        }
      } catch (err) {
        console.error("Error checking flash sale banner info", err);
      }
    };

    checkFlashSale();

    const interval = setInterval(checkFlashSale, 2000);
    return () => clearInterval(interval);
  }, []);

  // Timer countdown logic
  useEffect(() => {
    if (!flashSale || isDismissed) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const end = new Date(flashSale.endDate).getTime();
      const difference = end - now;

      if (difference <= 0) {
        clearInterval(timer);
        setTimeLeft(null);
        setFlashSale(null);
      } else {
        const totalSeconds = Math.floor(difference / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        setIsLessThanOneHour(totalSeconds < 3600);

        setTimeLeft({
          hours: String(hours).padStart(2, '0'),
          minutes: String(minutes).padStart(2, '0'),
          seconds: String(seconds).padStart(2, '0')
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [flashSale, isDismissed]);

  const handleDismiss = () => {
    try {
      localStorage.setItem('remix_flash_sale_dismissed', 'true');
      setIsDismissed(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleActionClick = () => {
    // Switch to search tab and pre-fill search with "Tai nghe"
    try {
      // Dispatch custom events to switch activeTab to 'search' and set search input
      window.dispatchEvent(new CustomEvent('remix_switch_tab', { detail: 'search' }));
      
      // Give the screen tab transition a tiny delay then trigger keyword select
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('remix_trigger_banner_search', { 
          detail: { category: 'Tai nghe', query: 'tai nghe' } 
        }));
      }, 50);
    } catch (err) {
      console.error(err);
    }
  };

  if (isDismissed || !flashSale || !timeLeft) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full bg-[#185FA5] text-white shadow-sm z-50 overflow-hidden relative"
        style={{ padding: '10px 18px' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-sans selection:bg-white selection:text-[#185FA5]">
          
          {/* Left Side: Bolt icon + FLASH SALE + Program Title */}
          <div className="flex items-center gap-2">
            <Bolt size={14} className="text-yellow-400 fill-yellow-400 shrink-0" />
            <span className="text-[12px] font-bold uppercase tracking-wider text-yellow-400">
              FLASH SALE
            </span>
            <span className="text-white text-xs opacity-40 select-none">|</span>
            <span className="text-xs md:text-[13px] font-medium text-white tracking-tight">
              {flashSale.title}
            </span>
          </div>

          {/* Middle Side: Countdown display - eg. Còn: 02:45:30 */}
          <div className="flex items-center text-xs font-semibold select-none">
            <span className={`transition-all duration-300 ${isLessThanOneHour ? 'text-yellow-300 animate-pulse font-bold' : 'text-slate-100'}`}>
              Còn: {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
            </span>
          </div>

          {/* Right Side: Action Button + Close icon */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={handleActionClick}
              className="bg-white text-[#185FA5] text-[12px] font-bold rounded-[6px] tracking-tight hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
              style={{ padding: '4px 12px' }}
            >
              Xem ngay →
            </button>
            
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white transition-colors cursor-pointer p-0.5"
              aria-label="Đóng banner"
            >
              <X size={15} />
            </button>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
