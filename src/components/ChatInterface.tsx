import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Loader2, Sparkles, RefreshCcw, Search, Settings, LogOut, Paperclip, ChevronLeft, MoreVertical, Mic, MessageSquare, Heart, Brain, Laptop, Headphones, Camera, Smartphone, Watch, Tag, ShieldCheck, GitCompare, CalendarRange, TrendingUp, ChevronRight, SearchX, AlertCircle, Clock, Shield, WifiOff, ShoppingCart, Download } from 'lucide-react';
import { Message, ChatSession, Product } from '../types';
import { KNOWLEDGE_BASE } from '../constants';
import { getAssistantResponse, generateChatTitle } from '../services/geminiService';
import { getCurrentUser, logActivity, updateCurrentUser } from '../utils/accounts';
import ProductCard from './ProductCard';
import { useLanguage } from '../utils/lang';

// DANH SÁCH TỪ KHÓA VI PHẠM CỘNG ĐỒNG
const VIOLATION_KEYWORDS = [
  // Bạo lực
  'giết','chém','ngu','dốt','mẹ mày','địt','má mày','cặc','cu','lồn','bắn','đâm','tra tấn',
  'khủng bố','bạo lực','tấn công',
  // Tranh dung / chất cấm
  'ma túy','cần sa','heroin','cocaine',
  'mua thuốc','bán thuốc','chất cấm',
  // Lừa đảo
  'lừa đảo','hack','phá mật khẩu','trộm',
  'giả','giả mạo',
  // Ngôn từ thù hận
  'chửi xử lý','xúc phạm','phân biệt',
  // Nội dung không liên quan gây hại
  'cách tạo bom','chế độ vũ khí'
];

function removeVietnameseTones(str: string): string {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Y|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  
  // Some combined accent chars
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Accent tones
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ă, Ơ, Ư
  return str;
}

function detectViolation(text: string): { detected: boolean; keyword: string } {
  const normalizedText = text.toLowerCase().replace(/\s+/g, ' ').trim();
  const unaccentedText = removeVietnameseTones(normalizedText);

  for (const keyword of VIOLATION_KEYWORDS) {
    const kw = keyword.trim().toLowerCase();
    if (!kw) continue;
    
    const unaccentedKw = removeVietnameseTones(kw);

    const vietnameseWordChars = "a-zA-Z0-9_àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ";
    const regexSrc = `(?:[^${vietnameseWordChars}]|^)${kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}(?:[^${vietnameseWordChars}]|$)`;
    const regexUnaccentedSrc = `(?:[^a-zA-Z0-9_]|^)${unaccentedKw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}(?:[^a-zA-Z0-9_]|$)`;

    const regex = new RegExp(regexSrc, 'i');
    const unaccentedRegex = new RegExp(regexUnaccentedSrc, 'i');

    if (regex.test(normalizedText) || unaccentedRegex.test(unaccentedText)) {
      return { detected: true, keyword: keyword.trim() };
    }
  }

  return { detected: false, keyword: '' };
}

function checkViolation(message: string): boolean {
  const lower = message.toLowerCase();
  return VIOLATION_KEYWORDS.some(kw => lower.includes(kw));
}

interface ChatInterfaceProps {
  messages: Message[];
  sessionTitle: string;
  onLogout?: () => void;
  onMessagesChange: (messages: Message[]) => void;
  onTitleGenerated: (title: string) => void;
  onTabChange?: (tab: string) => void;
  onAddToCart?: (product: Product) => void;
  onCheckout?: (userText?: string) => void;
  onViewDetail?: (product: Product) => void;
}

export default function ChatInterface({ 
  messages, 
  sessionTitle,
  onLogout, 
  onMessagesChange,
  onTitleGenerated,
  onTabChange,
  onAddToCart,
  onCheckout,
  onViewDetail
}: ChatInterfaceProps) {
  const { lang, t } = useLanguage();
  const [input, setInput] = useState('');

  // Autocomplete prediction search states
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);

  // Load products
  useEffect(() => {
    try {
      const saved = localStorage.getItem('remix_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAvailableProducts(parsed);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setAvailableProducts(KNOWLEDGE_BASE);
  }, []);

  // When input changes, trigger autocomplete logic
  useEffect(() => {
    const trimmed = input.trim();
    if (trimmed.length >= 2) {
      setAutocompleteOpen(true);
      setActiveSuggestionIndex(0);
    } else {
      setAutocompleteOpen(false);
    }
  }, [input]);

  // Click outside listener for autocompete
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteContainerRef.current && !autocompleteContainerRef.current.contains(event.target as Node)) {
        setAutocompleteOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getSuggestions = () => {
    if (!input.trim() || input.trim().length < 2) return [];
    
    const query = input.toLowerCase().trim();
    const queryUnaccented = removeVietnameseTones(query);
    
    return availableProducts.filter(p => {
      const nameLower = p.name.toLowerCase();
      const nameUnaccented = removeVietnameseTones(nameLower);
      const descLower = p.description.toLowerCase();
      const descUnaccented = removeVietnameseTones(descLower);
      const categoryLower = p.category.toLowerCase();
      const categoryUnaccented = removeVietnameseTones(categoryLower);
      const tagsMatch = p.tags ? p.tags.some(t => t.toLowerCase().includes(query) || removeVietnameseTones(t.toLowerCase()).includes(queryUnaccented)) : false;
      
      return nameLower.includes(query) || 
             nameUnaccented.includes(queryUnaccented) || 
             categoryLower.includes(query) || 
             categoryUnaccented.includes(queryUnaccented) ||
             descLower.includes(query) ||
             descUnaccented.includes(queryUnaccented) ||
             tagsMatch;
    }).slice(0, 5); // Limit to 5
  };

  const getProductClassIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('tai nghe') || cat.includes('âm thanh')) return <Headphones size={15} className="text-blue-500 shrink-0" />;
    if (cat.includes('laptop') || cat.includes('màn hình')) return <Laptop size={15} className="text-indigo-500 shrink-0" />;
    if (cat.includes('điện thoại') || cat.includes('smartphone')) return <Smartphone size={15} className="text-emerald-500 shrink-0" />;
    if (cat.includes('đồng hồ') || cat.includes('smartwatch') || cat.includes('watch')) return <Watch size={15} className="text-purple-500 shrink-0" />;
    return <Tag size={15} className="text-amber-500 shrink-0" />;
  };

  const selectSuggestion = (product: Product) => {
    setInput(product.name);
    setAutocompleteOpen(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  const [violationWarning, setViolationWarning] = useState<{ detected: boolean; keyword: string; text: string; warnings?: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return document.documentElement.classList.contains('dark') || localStorage.getItem('remix_theme_mode') === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleThemeSync = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark') || localStorage.getItem('remix_theme_mode') === 'dark');
    };
    window.addEventListener('remix_theme_changed', handleThemeSync);
    // Initial sync
    handleThemeSync();
    return () => {
      window.removeEventListener('remix_theme_changed', handleThemeSync);
    };
  }, []);

  // Auto-dismiss warning banner after 5 seconds
  useEffect(() => {
    if (violationWarning) {
      const timer = setTimeout(() => {
        setViolationWarning(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [violationWarning]);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      setIsSpeechSupported(true);
      const rec = new SpeechRecognitionAPI();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'vi-VN';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(prev => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${transcript}` : transcript;
          });
        }
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Failed to stop speech recognition:', e);
      }
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Failed to start speech recognition:', e);
      }
    }
  };

  // Pull-to-refresh states
  const [startY, setStartY] = useState(0);
  const [pullOffset, setPullOffset] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0 && !isRefreshing) {
      setStartY(e.touches[0].pageY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY && containerRef.current && containerRef.current.scrollTop === 0 && !isRefreshing) {
      const currentY = e.touches[0].pageY;
      const diff = currentY - startY;
      if (diff > 0) {
        const resistance = Math.min(diff * 0.4, 120);
        setPullOffset(resistance);
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullOffset > 60) {
      setIsRefreshing(true);
      setPullOffset(50);
      setTimeout(() => {
        onMessagesChange([]); // Reset key chat histories
        setIsRefreshing(false);
        setPullOffset(0);
        setStartY(0);
      }, 1000);
    } else {
      setPullOffset(0);
      setStartY(0);
    }
  };

  const [aiNameState, setAiNameState] = useState('REMIX AI');
  const [aiGreetingState, setAiGreetingState] = useState('');

  const loadAISettings = () => {
    try {
      const settingsStr = localStorage.getItem('remix_settings');
      let name = 'REMIX AI';
      let greeting = '';

      if (settingsStr) {
        const settings = JSON.parse(settingsStr);
        if (settings.aiName) name = settings.aiName;
        if (settings.aiGreeting) greeting = settings.aiGreeting;
      } else {
        const savedName = localStorage.getItem('remix_ai_name');
        if (savedName) name = savedName;
        
        const savedGreeting = localStorage.getItem('remix_ai_greeting');
        if (savedGreeting) greeting = savedGreeting;
      }
      setAiNameState(name);

      if (!greeting) {
        greeting = lang === 'en'
          ? 'Hello there! What kind of consumer tech devices are you looking for today? 😊'
          : 'Chào bạn, bạn đang tìm kiếm sản phẩm công nghệ nào để Shop tư vấn cho mình nhé? 😊';
      }
      setAiGreetingState(greeting);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAISettings();
    // listening to storage to sync settings panel
    window.addEventListener('storage', loadAISettings);
    return () => {
      window.removeEventListener('storage', loadAISettings);
    };
  }, [lang]);

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachedFiles(prev => [...prev, ...files]);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() && attachedFiles.length === 0 || isLoading) return;

    const userText = input.trim();

    // Check community violation keywords
    const lower = userText.toLowerCase();
    if (checkViolation(userText)) {
      const user = getCurrentUser();
      const currentWarnings = user ? (user.warnings || 0) : 0;
      const warnings = currentWarnings + 1;
      
      if (user) {
        updateCurrentUser({ warnings });
      }

      if (warnings >= 5) {
        if (user) {
          updateCurrentUser({ isLocked: true, warnings });
        }
        window.dispatchEvent(new CustomEvent('remix_log_activity', { 
          detail: { type: 'violation_suspended', data: { username: user?.email || user?.phone || 'unknown', text: userText } } 
        }));
        window.dispatchEvent(new CustomEvent('remix_user_updated'));
        return; // không gửi message
      } else {
        const matchedKeyword = VIOLATION_KEYWORDS.find(kw => lower.includes(kw)) || '';
        setViolationWarning({
          detected: true,
          keyword: matchedKeyword,
          text: userText,
          warnings: warnings
        });
        window.dispatchEvent(new CustomEvent('remix_user_updated'));
        return; // không gửi message vi phạm
      }
    }

    const normalizedInput = userText.toLowerCase();
    const attachmentInfo = attachedFiles.length > 0 
      ? `\n\n[Đã đính kèm: ${attachedFiles.map(f => f.name).join(', ')}]` 
      : '';

    // Check if user is signaling they want to pay ("phát tín hiệu muốn thanh toán")
    const isCheckoutSignal = [
      'thanh toán', 'thanh toan', 'thanh toán nhé', 'mua hàng', 'mua hang', 
      'đặt hàng', 'dat hang', 'checkout', 'pay now', 'thanh toan di', 'thanh toán đi'
    ].some(keyword => {
      return normalizedInput === keyword || 
             normalizedInput.includes(' ' + keyword + ' ') || 
             normalizedInput.startsWith(keyword + ' ') || 
             normalizedInput.endsWith(' ' + keyword);
    });

    if (isCheckoutSignal && onCheckout) {
      const newUserMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: userText + attachmentInfo,
        timestamp: Date.now()
      };

      setInput('');
      setAttachedFiles([]);
      setIsLoading(false);

      // Add the user's triggering checkout message to the list
      const updatedMessagesWithUser = [...messages, newUserMessage];
      onMessagesChange(updatedMessagesWithUser);

      // Invoke the central checkout processor in App, passing userText
      setTimeout(() => {
        onCheckout(userText);
      }, 100);
      return;
    }

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText + attachmentInfo,
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, newUserMessage];
    onMessagesChange(updatedMessages);
    setInput('');
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      // If this is the first message (or if title is generic), generate a summary title
      if (updatedMessages.filter(m => m.role === 'user').length === 1 && (sessionTitle === "Cuộc hội thoại mới" || !sessionTitle)) {
        generateChatTitle([newUserMessage]).then(title => onTitleGenerated(title));
      }

      // Pass last 5 messages for context
      const history = messages.slice(-5).map(m => ({ role: m.role, content: m.content }));
      const response = await getAssistantResponse(userText, history);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
        suggestions: response.suggestions,
        status: response.status as any
      };

      onMessagesChange([...updatedMessages, assistantMessage]);

      try {
        logActivity('chat', { msg: userText, reply: response.content });
      } catch (e) {
        console.error('Error logging chat activity:', e);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    alert('Bản ghi hội thoại đã được xuất thành công!');
    setIsSettingsOpen(false);
  };

  const loggedInUser = getCurrentUser();
  const userBg = loggedInUser?.profile?.background;

  return (
    <div className={`flex flex-col h-full relative overflow-hidden font-sans ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white'}`} id="chat-container">
      {/* File Previews Overlay (if mobile or as a floating element) */}
      {/* Offline Banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-50 border-b border-red-100 px-4 py-2 flex items-center justify-center gap-3 z-50 shrink-0"
          >
            <div className="relative">
              <WifiOff size={16} className="text-red-500" />
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-red-400 rounded-full"
              />
            </div>
            <span className="text-[12px] font-bold text-red-700 tracking-tight">Mất kết nối. Đang kết nối lại...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER TAB (trong .content) */}
      <div className="flex border-b-[0.5px] border-[#E2E8F0] p-[12px_16px_8px] items-center justify-between bg-white z-[15] shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase text-[#94A3B8] tracking-widest truncate max-w-[170px]">
            {sessionTitle === "Cuộc hội thoại mới" || !sessionTitle ? "CUỘC HỘI THOẠI MỚI" : sessionTitle.toUpperCase()}
          </span>
          <span className="text-gray-200 text-xs">|</span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-black text-[#276749] uppercase tracking-wider">TRỰC TUYẾN</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Settings icon */}
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-1 text-gray-400 hover:text-[#185FA5] transition-colors border-0 bg-transparent cursor-pointer"
            title="Cài đặt cuộc hội thoại"
          >
             <Settings size={16} />
          </button>
          
          {/* Delete icon (Xóa) */}
          <button 
            onClick={() => onMessagesChange([])}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors border-0 bg-transparent cursor-pointer"
            title="Xóa toàn bộ cuộc hội thoại này"
          >
             <RefreshCcw size={14} />
          </button>
        </div>
      </div>

      {/* Mobile Headers and Navigation are now handled by the top Navbar */}

      {/* Messages */}
      <div 
        id="tour-messages-container" 
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`flex-grow overflow-y-auto relative transition-colors ${isDarkMode ? 'bg-slate-900' : userBg ? '' : 'bg-white'}`}
        style={{ 
          transform: pullOffset > 0 ? `translateY(${pullOffset}px)` : 'none', 
          transition: pullOffset === 0 || pullOffset === 50 ? 'transform 0.2s ease-out' : 'none',
          ...(userBg && !isDarkMode ? (
            userBg.startsWith('linear-gradient') ? { backgroundImage: userBg } :
            userBg.startsWith('http') || userBg.startsWith('data:') ? { backgroundImage: `url(${userBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'local' } :
            { backgroundColor: userBg }
          ) : {})
        }}
      >
        {/* Pull-to-refresh spinner */}
        {pullOffset > 0 && (
          <div 
            className="absolute left-0 right-0 flex items-center justify-center pointer-events-none z-[9999]"
            style={{ 
              top: `-${Math.max(pullOffset - 8, 15)}px`,
              opacity: pullOffset > 10 ? 1 : 0,
            }}
          >
            <div className="bg-white/95 border border-gray-200/85 p-2 px-3 rounded-full shadow-xl flex items-center gap-1.5 backdrop-blur-md">
              <Loader2 size={14} className={`text-[#185FA5] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider">
                {isRefreshing 
                  ? (lang === 'en' ? 'Refreshing...' : 'Đang làm mới...') 
                  : (lang === 'en' ? 'Release to refresh' : 'Thả ra để làm mới')}
              </span>
            </div>
          </div>
        )}
        <div className={`max-w-5xl mx-auto p-1.5 py-4 md:px-8 md:py-10 ${messages.length === 0 ? 'min-h-full flex flex-col' : ''}`}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-[32px_20px] max-w-sm mx-auto w-full my-auto">
              <div className="w-[72px] h-[72px] rounded-[20px] bg-[#E6F1FB] flex items-center justify-center text-[#185FA5] mb-4">
                <Bot size={36} />
              </div>
              <h2 className="text-[18px] font-bold text-gray-900 max-w-[280px] leading-[1.4] mb-2">
                {aiGreetingState}
              </h2>
              <p className="text-[13px] text-[#64748B] max-w-[260px] leading-relaxed mb-4">
                {lang === 'en' 
                  ? 'I can help you compare products, specify budget estimates, or inspect store stock.' 
                  : 'Tôi có thể giúp bạn so sánh, tư vấn theo ngân sách hoặc tìm hàng chính hãng.'}
              </p>
              <div className="inline-flex items-center gap-1 bg-[#F1F5F9] border border-gray-200/50 rounded-full px-2.5 py-1 mb-8 select-none">
                <Sparkles size={10} className="text-[#185FA5]" />
                <span className="text-[11px] uppercase text-[#94A3B8] font-bold tracking-wider">Powered by Gemini AI</span>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full max-w-full overflow-hidden">
                {[
                  { 
                    text: lang === 'en' ? 'Find head devices' : 'Tìm tai nghe phù hợp', 
                    icon: Headphones, 
                    query: lang === 'en' ? 'Help find the best active noise cancelling bluetooth headphones' : 'Tôi muốn tìm tai nghe bluetooth chống ồn tốt nhất' 
                  },
                  { 
                    text: lang === 'en' ? 'Compare laptops' : 'So sánh laptop', 
                    icon: GitCompare, 
                    query: lang === 'en' ? 'Compare MacBook Air M3 and Dell XPS 13 Plus' : 'So sánh MacBook Air M3 và Dell XPS 13 Plus' 
                  },
                  { 
                    text: lang === 'en' ? 'Budget advice' : 'Tư vấn ngân sách', 
                    icon: Tag, 
                    query: lang === 'en' ? 'Advise technology products for a $1,000 budget' : 'Tư vấn sản phẩm công nghệ tầm giá 20 triệu' 
                  },
                  { 
                    text: lang === 'en' ? 'Best Sellers' : 'Sản phẩm bán chạy', 
                    icon: TrendingUp, 
                    query: lang === 'en' ? 'Show me popular tech gadgets of the week' : 'Cho tôi xem top sản phẩm bán chạy nhất tuần này' 
                  }
                ].map((item, idx) => (
                  <button
                    key={item.text}
                    onClick={() => {
                      setInput(item.query);
                      setTimeout(() => handleSend(), 50);
                    }}
                    className="flex flex-col items-start text-left p-3 border border-[#E2E8F0] rounded-[12px] bg-white group hover:border-[#185FA5] hover:bg-gray-50/50 transition-all duration-150 relative cursor-pointer active:scale-95"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#E6F1FB]/60 text-[#185FA5] flex items-center justify-center mb-2 shrink-0">
                      <item.icon size={15} />
                    </div>
                    <span className="text-[13px] font-bold text-black leading-tight group-hover:text-black line-clamp-2 w-full">
                      {item.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8 md:space-y-10">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 md:gap-5 max-w-[85%] md:max-w-[60%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center border-subtle shadow-sm transition-transform hover:rotate-6 ${
                        message.role === 'user' 
                          ? isDarkMode ? 'bg-slate-800 border-slate-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600' 
                          : 'bg-primary border-primary text-white'
                      }`}>
                        {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                      </div>
                      <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2 mb-2 px-1">
                          <span className={`text-[12px] font-black uppercase tracking-widest transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {message.role === 'user' ? (lang === 'en' ? 'Customer' : 'Khách hàng') : aiNameState}
                          </span>
                          <span className={`text-[12px] font-medium transition-colors ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className={`p-4 rounded-xl md:rounded-2xl text-[14px] leading-relaxed transition-all ${
                          message.role === 'user' 
                            ? 'bg-[#E6F1FB] text-gray-900 border border-[#185FA5]/10 rounded-2xl rounded-tr-none shadow-none font-medium' 
                            : message.status === 'no-results'
                              ? 'bg-amber-50 text-amber-900 rounded-bl-none border-amber-200 shadow-sm shadow-amber-900/5'
                              : message.status === 'error'
                                ? 'bg-red-50 text-red-900 rounded-bl-none border-red-200 shadow-sm shadow-red-900/5'
                                : message.status === 'busy'
                                  ? isDarkMode ? 'bg-slate-800 text-gray-300 border-slate-700 rounded-bl-none' : 'bg-gray-50 text-gray-700 rounded-bl-none border-gray-100 shadow-sm'
                                  : message.status === 'out-of-scope'
                                  ? isDarkMode ? 'bg-slate-800 text-gray-300 border-slate-700 rounded-bl-none border shadow-sm' : 'bg-white text-gray-800 rounded-bl-none border-gray-200 border shadow-sm'
                                  : isDarkMode ? 'bg-transparent text-gray-100 font-semibold border-none shadow-none p-0' : 'bg-transparent text-black font-semibold border-none shadow-none px-0 py-1'
                        }`}>
                          {message.status === 'no-results' && (
                            <div className="flex items-center gap-2 mb-2 text-amber-600">
                              <SearchX size={18} />
                              <span className="font-bold text-[11px] uppercase tracking-wider">Thông báo</span>
                            </div>
                          )}
                          {message.status === 'error' && (
                            <div className="flex items-center gap-2 mb-2 text-red-600">
                              <AlertCircle size={18} />
                              <span className="font-bold text-[11px] uppercase tracking-wider">Lỗi hệ thống</span>
                            </div>
                          )}
                          {message.status === 'busy' && (
                            <div className="flex items-center gap-2 mb-2 text-gray-400">
                              <Clock size={16} />
                              <span className="font-bold text-[11px] uppercase tracking-wider">Hệ thống bận</span>
                            </div>
                          )}
                          {message.status === 'out-of-scope' && (
                            <div className="flex items-center gap-2 mb-2 text-gray-400">
                              <Shield size={18} />
                              <span className="font-bold text-[11px] uppercase tracking-wider">Phạm vi tư vấn</span>
                            </div>
                          )}
                          
                          <div className={message.status === 'busy' ? "flex items-start justify-between gap-4" : ""}>
                            <p className="flex-grow">{message.content}</p>
                            {message.status === 'busy' && (
                              <button 
                                onClick={handleSend}
                                className="flex-shrink-0 p-1.5 bg-white border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
                                title="Thử lại"
                              >
                                <RefreshCcw size={14} />
                              </button>
                            )}
                          </div>
                          
                          {message.status === 'no-results' && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              <button 
                                onClick={() => setInput('Thay đổi khoảng giá')}
                                className="px-3 py-1.5 bg-white border border-amber-200 text-amber-700 rounded-lg text-[11px] font-bold hover:bg-amber-100 transition-colors shadow-sm"
                              >
                                Thay đổi khoảng giá
                              </button>
                              <button 
                                onClick={() => setInput('Xem tất cả danh mục')}
                                className="px-3 py-1.5 bg-white border border-amber-200 text-amber-700 rounded-lg text-[11px] font-bold hover:bg-amber-100 transition-colors shadow-sm"
                              >
                                Xem tất cả danh mục
                              </button>
                            </div>
                          )}

                          {message.status === 'error' && (
                            <div className="mt-4">
                              <button 
                                onClick={handleSend}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-red-200 text-red-700 rounded-lg text-[11px] font-bold hover:bg-red-100 transition-colors shadow-sm"
                              >
                                <RefreshCcw size={12} />
                                Thử lại ngay
                              </button>
                            </div>
                          )}

                          {message.status === 'out-of-scope' && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              <button 
                                onClick={() => setInput('Xem Laptop nổi bật')}
                                className="px-3 py-1.5 bg-white border border-gray-200 text-black rounded-lg text-[11px] font-bold hover:bg-gray-50 transition-colors shadow-sm"
                              >
                                Xem Laptop nổi bật
                              </button>
                              <button 
                                onClick={() => setInput('Các chương trình khuyến mãi')}
                                className="px-3 py-1.5 bg-white border border-gray-200 text-black rounded-lg text-[11px] font-bold hover:bg-gray-50 transition-colors shadow-sm"
                              >
                                Các chương trình khuyến mãi
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div 
                            className={`mt-4 w-full flex ${
                              message.suggestions.length > 2 
                                ? 'flex-row overflow-x-auto whitespace-nowrap pb-2 gap-3 scrollbar-none' 
                                : 'flex-col gap-3'
                            } md:flex-col md:overflow-x-visible md:whitespace-normal md:pb-0`}
                            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
                          >
                            {message.suggestions.slice(0, 3).map((product, index) => (
                              <div 
                                key={product.id} 
                                className={`${
                                  message.suggestions!.length > 2 
                                    ? 'min-w-[200px] w-[200px] inline-block shrink-0 whitespace-normal' 
                                    : 'w-full'
                                } md:min-w-0 md:w-full`}
                              >
                                <ProductCard 
                                  product={product} 
                                  isInline={true} 
                                  isBestMatch={index === 0} 
                                  onAddToCart={onAddToCart}
                                  onViewDetail={onViewDetail}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-2"
                >
                  {/* TRẠNG THÁI 2 — Thinking chip */}
                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 border-[0.5px] border-gray-200 rounded-full w-fit ml-[48px] md:ml-[60px]">
                    <Brain size={12} className="text-gray-400" />
                    <span className="text-[11px] font-medium text-gray-500">Đang phân tích yêu cầu...</span>
                  </div>
                  
                  <div className="flex justify-start">
                    <div className="flex gap-3 md:gap-5 max-w-[85%] md:max-w-[60%]">
                      <div className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-primary text-white flex items-center justify-center shadow-sm">
                        <Bot size={18} />
                      </div>
                      
                      {/* Bubble containing TRẠNG THÁI 1 & 3 */}
                      <div className="px-4 py-3 bg-gray-100 rounded-2xl flex flex-col gap-3 self-start shadow-sm relative overflow-hidden min-w-[160px]">
                        {/* TRẠNG THÁI 1 — Typing indicator */}
                        <div className="flex items-center gap-1.5 h-4">
                          <div 
                            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-jump" 
                            style={{ animationDelay: '0s' }}
                          />
                          <div 
                            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-jump" 
                            style={{ animationDelay: '0.15s' }}
                          />
                          <div 
                            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-jump" 
                            style={{ animationDelay: '0.3s' }}
                          />
                        </div>
                        
                        {/* TRẠNG THÁI 3 — Processing bar */}
                        <div className="flex flex-col gap-2 mt-1">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Đang tìm sản phẩm phù hợp...</span>
                          <div className="w-full h-[2px] bg-gray-200 rounded-full overflow-hidden">
                            <div className="w-full h-full bg-[#185FA5] animate-pulse" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Quick Chips Row */}
      <div 
        className="flex overflow-x-auto scrollbar-none gap-2 p-[8px_16px] whitespace-nowrap bg-white border-t border-b border-gray-100 shrink-0"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {[
          { query: lang === 'en' ? 'Headphones' : 'Tai nghe', icon: Headphones }, 
          { query: lang === 'en' ? 'Laptop' : 'Laptop', icon: Laptop }, 
          { query: lang === 'en' ? 'Phone' : 'Điện thoại', icon: Smartphone }, 
          { query: lang === 'en' ? 'Smartwatch' : 'Smartwatch', icon: Watch },
          { query: lang === 'en' ? 'Under $50' : 'Dưới 1 triệu', icon: Tag },
          { query: lang === 'en' ? '$50–$150' : '1–3 triệu', icon: Tag },
          { query: lang === 'en' ? 'Over $250' : 'Trên 5 triệu', icon: Tag }
        ].map(({ query, icon: Icon }) => (
          <button
            key={query}
            disabled={isLoading}
            onClick={() => {
              if (isLoading) return;
              setInput(query);
              setTimeout(() => handleSend(), 50);
            }}
            className="flex-shrink-0 flex items-center gap-1 bg-white hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-full px-3 py-1.5 text-[12px] font-bold text-black transition-all select-none"
          >
            <Icon size={12} className="text-[#185FA5]" />
            <span>{query}</span>
          </button>
        ))}
      </div>

      {/* Input bar */}
      <footer className="bg-[#FFFFFF] border-t-[0.5px] border-[#E2E8F0] p-[10px_12px] pb-[10px] relative shrink-0 dark:bg-slate-900 dark:border-slate-800">
        
        {/* Banner cảnh báo nằm ngay trên input bar */}
        <AnimatePresence>
          {violationWarning && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -6 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="max-w-lg mx-auto overflow-hidden font-sans"
            >
              <div 
                className="mb-2 p-3 rounded-xl border text-[11px] leading-normal flex items-start justify-between gap-3 shadow-xs"
                style={{
                  backgroundColor: violationWarning.warnings === 4 ? '#FCEBEB' : '#FFF9E6',
                  borderColor: violationWarning.warnings === 4 ? '#F7C1C1' : '#FAC775',
                  color: violationWarning.warnings === 4 ? '#7F1D1D' : '#633806'
                }}
              >
                <div className="space-y-0.5 flex-grow pr-1">
                  <div className="font-extrabold uppercase tracking-widest text-[10px] flex items-center gap-1">
                    {violationWarning.warnings === 4 ? (
                      <span>🚨 CẢNH BÁO CUỐI</span>
                    ) : (
                      <span>⚠️ CẢNH BÁO VI PHẠM CỘNG ĐỒNG</span>
                    )}
                  </div>
                  <div className="font-semibold text-[11px] leading-relaxed">
                    {violationWarning.warnings === 4 ? (
                      <span>⚠️ CẢNH BÁO CUỐI: Đây là lần cảnh báo thứ 4/5. Lần tiếp theo tài khoản sẽ bị KHÓA VĨNH VIỄN.</span>
                    ) : (
                      <span>Tin nhắn của bạn vi phạm tiêu chuẩn cộng đồng. Lần {violationWarning.warnings}/5. Quá 5 lần tài khoản sẽ bị khóa tự động.</span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViolationWarning(null)}
                  className="px-2.5 py-1 rounded-lg hover:bg-black/5 text-[10px] font-black uppercase tracking-wider select-none border-none transition-all active:scale-95 cursor-pointer shrink-0"
                  style={{
                    color: violationWarning.warnings === 4 ? '#7F1D1D' : '#633806'
                  }}
                >
                  Đã hiểu
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative flex items-center max-w-lg mx-auto gap-2">
          {isSpeechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all cursor-pointer border shrink-0 ${
                isListening 
                  ? 'bg-rose-500 hover:bg-rose-600 border-rose-500 hover:border-rose-600 text-white shadow-lg shadow-rose-500/20 scale-105' 
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-[#185FA5] hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:text-[#185FA5] dark:hover:bg-slate-700 active:scale-95'
              }`}
              title={isListening ? (lang === 'en' ? "Stop recording (Listening...)" : "Dừng ghi âm (Đang nghe...)") : (lang === 'en' ? "Voice search input" : "Ghi âm bằng giọng nói")}
            >
              {isListening ? (
                <span className="relative flex h-5 w-5 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <Mic size={18} className="relative z-10" />
                </span>
              ) : (
                <Mic size={18} />
              )}
            </button>
          )}

          <div className="relative flex-grow" ref={autocompleteContainerRef}>
            <AnimatePresence>
              {autocompleteOpen && getSuggestions().length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full mb-2 left-0 right-0 max-h-72 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-[9999] overflow-hidden flex flex-col divide-y divide-slate-100 dark:divide-slate-700"
                >
                  <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-900/40 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest flex items-center justify-between">
                    <span>Gợi ý sản phẩm ({getSuggestions().length})</span>
                    <span className="text-[9px] font-medium font-mono text-gray-400 dark:text-slate-500 lowercase">↑↓ để chọn · enter để hoàn tất</span>
                  </div>
                  {getSuggestions().map((p, idx) => {
                    const isActive = idx === activeSuggestionIndex;
                    return (
                      <div
                        key={p.id}
                        onClick={() => selectSuggestion(p)}
                        onMouseEnter={() => setActiveSuggestionIndex(idx)}
                        className={`px-3.5 py-3 flex items-center justify-between cursor-pointer transition-colors ${
                          isActive 
                            ? 'bg-[#185FA5]/5 dark:bg-[#185FA5]/20 text-[#185FA5] dark:text-blue-400' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-gray-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pointer-events-none">
                          {getProductClassIcon(p.category)}
                          <div className="flex flex-col text-left min-w-0">
                            <span className="text-xs font-bold truncate pr-2">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold mt-0.5">
                              {p.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 pointer-events-none">
                          <span className="text-xs font-bold text-[#185FA5] dark:text-blue-400 font-sans">
                            {p.price.toLocaleString('vi-VN')}đ
                          </span>
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-gray-400 dark:text-slate-400 font-bold uppercase scale-90">
                            Chọn
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            <textarea
              id="tour-chat-textarea"
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                const suggestions = getSuggestions();
                if (autocompleteOpen && suggestions.length > 0) {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setActiveSuggestionIndex(prev => (prev + 1) % suggestions.length);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setActiveSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    selectSuggestion(suggestions[activeSuggestionIndex]);
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    setAutocompleteOpen(false);
                  }
                } else if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={isListening ? (lang === 'en' ? "Listening... speak now! 🎙️" : "Đang nghe... Hãy nói đi bạn ơi! 🎙️") : (lang === 'en' ? "How can I help you today?..." : "Tôi có thể làm gì để giúp Bạn?...")}
              className="w-full text-[16px] h-[44px] leading-[42px] rounded-[22px] border border-[#E2E8F0] pl-4 pr-[44px] py-0 bg-white focus:border-[#185FA5] focus:outline-none transition-all placeholder:text-gray-400 font-semibold resize-none overflow-hidden dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 placeholder:dark:text-slate-500"
              style={{ boxSizing: 'border-box' }}
            />
            <button
              id="chat-send-btn"
              onClick={handleSend}
              disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
              className={`absolute right-[4px] w-[36px] h-[36px] rounded-full flex items-center justify-center transition-all ${
                (input.trim() || attachedFiles.length > 0) && !isLoading 
                  ? 'bg-[#185FA5] text-white hover:bg-opacity-90 shadow-md' 
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
              }`}
              style={{ top: '4px' }}
              title={lang === 'en' ? "Send message" : "Gửi tin nhắn"}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

