import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, HelpCircle } from 'lucide-react';

interface TourStep {
  targetId?: string;
  title: string;
  content: string;
  position: 'below' | 'above' | 'right' | 'left' | 'center';
  tab?: string;
}

interface OnboardingTourProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onCloseTour: () => void;
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (open: boolean) => void;
}

export default function OnboardingTour({
  activeTab,
  setActiveTab,
  onCloseTour,
  isSidebarOpen,
  setIsSidebarOpen
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const steps: TourStep[] = [
    {
      targetId: 'tour-logo',
      title: 'Chào mừng đến REMIX.AI! 👋',
      content: 'Hệ thống tư vấn bán hàng điện tử thông minh, được hỗ trợ bởi Gemini AI.',
      position: 'right',
    },
    {
      targetId: 'tour-sidebar-nav',
      title: 'Menu điều hướng',
      content: 'Tại đây bạn có thể chuyển giữa Tư vấn AI, Báo cáo, Tìm sản phẩm, Yêu thích và Giỏ hàng.',
      position: 'right',
    },
    {
      targetId: 'tour-branch-selector',
      title: 'Chọn chi nhánh của bạn',
      content: 'Chọn chi nhánh gần nhất để AI tư vấn đúng sản phẩm còn hàng tại đó.',
      position: 'below',
    },
    {
      targetId: 'tour-messages-container',
      title: 'Trò chuyện với AI Tư Vấn',
      content: "Nhập yêu cầu bằng tiếng Việt tự nhiên.\nVD: 'Tìm tai nghe chống ồn tầm 1.5 triệu'",
      position: 'left',
    },
    {
      targetId: 'tour-quick-chips',
      title: 'Gợi ý nhanh',
      content: 'Nhấn vào các chip này để bắt đầu tư vấn theo danh mục hoặc khoảng giá ngay lập tức.',
      position: 'above',
    },
    {
      targetId: 'tour-chat-textarea',
      title: 'Ô nhập tin nhắn',
      content: 'Gõ câu hỏi vào đây. Nhấn Enter hoặc icon gửi để AI trả lời. Có thể đính kèm ảnh sản phẩm.',
      position: 'above',
    },
    {
      targetId: 'tour-nav-cart',
      title: 'Giỏ hàng & Đặt hàng',
      content: 'Thêm sản phẩm từ gợi ý AI vào giỏ và đặt hàng online ngay trong app!',
      position: 'below',
    }
  ];

  const activeStep = steps[currentStep];

  // Dynamically update coordinates of highlighted target
  const updateTargetRect = () => {
    if (!activeStep.targetId) {
      setRect(null);
      return;
    }
    const element = document.getElementById(activeStep.targetId);
    if (element) {
      setRect(element.getBoundingClientRect());
    } else {
      setRect(null);
    }
  };

  useEffect(() => {
    // If targeted step requires Sidebar to be open (on mobile) or specific tab
    if (activeStep.targetId === 'tour-sidebar-container' || activeStep.targetId === 'tour-sidebar-nav') {
      if (setIsSidebarOpen && window.innerWidth < 768) {
        setIsSidebarOpen(true);
      }
    } else {
      if (setIsSidebarOpen && window.innerWidth < 768 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    }

    // Force activeTab to consult during chat interface highlighting
    if (activeStep.targetId === 'tour-chat-textarea' || activeStep.targetId === 'tour-quick-chips' || activeStep.targetId === 'tour-messages-container') {
      setActiveTab('consult');
    }

    // Small delay to allow tab/sidebar animations to settle before computing rect
    const timer = setTimeout(() => {
      updateTargetRect();
    }, 205);

    return () => clearTimeout(timer);
  }, [currentStep, activeTab]);

  useEffect(() => {
    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, { capture: true });
    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, { capture: true });
    };
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('remix_onboarding_completed', 'true');
    localStorage.setItem('remix_tour_done', 'true');
    if (setIsSidebarOpen && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
    onCloseTour();
  };

  const padding = 6;
  const cutout = rect ? {
    x: rect.left - padding,
    y: rect.top - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2
  } : null;

  // Compute position of the guidance tooltip card
  const getTooltipStyle = () => {
    if (!cutout) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'fixed' as const,
        width: '280px',
      };
    }

    const margin = 14;
    const tooltipWidth = 280;
    const tooltipHeight = 190; // estimate

    let top = 0;
    let left = 0;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    if (activeStep.position === 'below') {
      top = cutout.y + cutout.height + margin;
      left = cutout.x + cutout.width / 2 - tooltipWidth / 2;
    } else if (activeStep.position === 'above') {
      top = cutout.y - tooltipHeight - margin;
      left = cutout.x + cutout.width / 2 - tooltipWidth / 2;
    } else if (activeStep.position === 'right') {
      top = cutout.y + cutout.height / 2 - tooltipHeight / 2;
      left = cutout.x + cutout.width + margin;
    } else if (activeStep.position === 'left') {
      top = cutout.y + cutout.height / 2 - tooltipHeight / 2;
      left = cutout.x - tooltipWidth - margin;
    }

    // Fit inside viewport boundaries (sanity check)
    if (left < margin) left = margin;
    if (left + tooltipWidth > screenWidth - margin) {
      left = screenWidth - tooltipWidth - margin;
    }

    if (top < margin) {
      top = cutout.y + cutout.height + margin; // fallback
    }
    if (top + tooltipHeight > screenHeight - margin) {
      top = cutout.y - tooltipHeight - margin; // fallback
    }

    return {
      top: `${Math.max(margin, Math.min(top, screenHeight - tooltipHeight - margin))}px`,
      left: `${left}px`,
      position: 'fixed' as const,
      width: '280px'
    };
  };

  const getArrowClass = () => {
    if (!cutout) return 'hidden';
    switch (activeStep.position) {
      case 'below':
        return 'absolute top-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-l border-t border-gray-200 bg-white';
      case 'above':
        return 'absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-r border-b border-gray-200 bg-white';
      case 'right':
        return 'absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 border-l border-b border-gray-200 bg-white';
      case 'left':
        return 'absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 border-r border-t border-gray-200 bg-white';
      default:
        return 'hidden';
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] overflow-hidden select-none font-sans">
      {/* Background dark overlay blocker / spotlight generator */}
      {cutout ? (
        <div
          style={{
            position: 'fixed',
            left: `${cutout.x}px`,
            top: `${cutout.y}px`,
            width: `${cutout.width}px`,
            height: `${cutout.height}px`,
          }}
          className="rounded-xl pointer-events-none z-[99998] shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] border border-white/20"
        />
      ) : (
        <div className="fixed inset-0 bg-black/50 pointer-events-auto z-[99998]" />
      )}

      {/* Guide dialog tooltip card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -8 }}
          transition={{ duration: 0.18 }}
          style={getTooltipStyle()}
          className="bg-white border border-gray-200 rounded-[12px] shadow-xl p-[16px] w-[280px] flex flex-col justify-between gap-4 text-gray-800 z-[99999] pointer-events-auto font-sans relative"
        >
          {/* Arrow pointing at the element */}
          <div className={getArrowClass()} />

          {/* Title and content */}
          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">
                Bước {currentStep + 1} / {steps.length}
              </span>
              <div className="flex items-center gap-1 text-[#185FA5]/80">
                <Sparkles size={11} className="animate-pulse" />
                <span className="text-[9px] font-extrabold uppercase tracking-widest">REMIX.AI</span>
              </div>
            </div>

            <h3 className="text-[13px] font-black text-gray-900 tracking-tight leading-tight uppercase font-sans">
              {activeStep.title}
            </h3>

            <p className="text-[11px] text-gray-500 font-medium leading-relaxed font-sans">
              {activeStep.content}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-1 shrink-0 font-sans">
            <button
              onClick={handleComplete}
              className="text-[11px] font-bold text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-1 transition-colors font-sans"
            >
              Bỏ qua
            </button>

            <button
              onClick={handleNext}
              className="px-3.5 py-1.5 text-xs font-black bg-[#185FA5] hover:bg-[#0c447c] text-white border-none rounded-lg shadow-sm cursor-pointer transition-all active:scale-95 flex items-center gap-1 font-sans"
            >
              {currentStep === steps.length - 1 ? (
                'Bắt đầu!'
              ) : (
                <>
                  Tiếp theo →
                </>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
