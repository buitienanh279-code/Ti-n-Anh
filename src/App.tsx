import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, ShoppingCart, CalendarRange, Sparkles, User, HelpCircle, X, Search, Heart, Award, MessageCircle, Package, UserCircle, ChevronUp, ChevronDown, Bell, Gift, Copy, Check } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import AdminLoginPage from './components/AdminLoginPage';
import AdminDashboard from './components/AdminDashboard';
import MyOrders from './components/MyOrders';
import UserGuide from './components/UserGuide';
import ProductSearch from './components/ProductSearch';
import ProductDetail from './components/ProductDetail';
import FlashSaleBanner from './components/FlashSaleBanner';
import { ChatSession, Message, Product, CartItem } from './types';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderSuccessModal from './components/OrderSuccessModal';
import OnboardingTour from './components/OnboardingTour';
import CustomTooltip from './components/CustomTooltip';
import { motion, AnimatePresence } from 'motion/react';
import LoyaltyProgram from './components/LoyaltyProgram';
import UserProfile from './components/UserProfile';
import SetupProfile from './components/SetupProfile';
import { addLoyaltyPoints, calculateEarnedPoints } from './utils/loyalty';
import { initializeAccounts, updateAccountData, logActivity, getCurrentUser } from './utils/accounts';
import { useLanguage, getActiveLanguage } from './utils/lang';

export default function App() {
  const { lang, t } = useLanguage();
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('remix_theme_mode');
      const isDark = (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches));
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('remix_theme_mode', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('remix_theme_mode', 'light');
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const [currentUser, setCurrentUser] = useState<{ username: string; email?: string; phone?: string } | null>(() => {
    try {
      const saved = localStorage.getItem('remix_current_user');
      if (!saved) return null;
      if (saved.trim().startsWith('{')) {
        return JSON.parse(saved);
      }
      return { username: saved, email: saved, phone: '' };
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('remix_current_user') !== null;
    } catch {
      return false;
    }
  });

  const [showLanding, setShowLanding] = useState(true);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [activeTab, setActiveTab ] = useState('consult');
  const [isNewRegisterUser, setIsNewRegisterUser] = useState(false);
  const [selectedDetailedProduct, setSelectedDetailedProduct] = useState<Product | null>(null);
  const [previousDetailTab, setPreviousDetailTab] = useState<string>('consult');

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('remix_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const handleAdminLoginSuccess = () => {
    localStorage.setItem('remix_admin_auth', 'true');
    setIsAdminAuthenticated(true);
    setIsAuthenticated(true);
    setShowLanding(false);
    setShowAdminLogin(false);
    setActiveTab('dashboard');
  };
  
  // Cart management State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [voucherNotification, setVoucherNotification] = useState<{
    id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    value: number;
    minOrderValue?: number;
    expiryDate?: string;
  } | null>(null);
  const [copiedVoucherCode, setCopiedVoucherCode] = useState(false);
  const knownVoucherCodesRef = useRef<Set<string>>(new Set());

  // Listen for newly added vouchers inside the system to show a beautiful interactive push toast
  useEffect(() => {
    // Populate already known vouchers from localStorage or use fallback default ones
    const saved = localStorage.getItem('remix_vouchers');
    if (saved) {
      try {
        const list = JSON.parse(saved);
        if (Array.isArray(list)) {
          list.forEach((c: any) => {
            if (c && c.code) {
              knownVoucherCodesRef.current.add(c.code.toUpperCase());
            }
          });
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // Fallback default codes
      knownVoucherCodesRef.current.add('REMIX10');
      knownVoucherCodesRef.current.add('NEWUSER');
      knownVoucherCodesRef.current.add('SALE20');
    }

    const checkNewVouchers = () => {
      const currentSaved = localStorage.getItem('remix_vouchers');
      if (!currentSaved) return;
      try {
        const list = JSON.parse(currentSaved);
        if (Array.isArray(list)) {
          // Identify any voucher code that is not currently inside knownVoucherCodesRef
          const newVoucher = list.find((c: any) => c && c.code && !knownVoucherCodesRef.current.has(c.code.toUpperCase()));
          
          if (newVoucher) {
            // Trigger beautiful push notification!
            setVoucherNotification({
              id: newVoucher.id || `v-${Date.now()}`,
              code: newVoucher.code,
              discountType: newVoucher.discountType,
              value: newVoucher.value,
              minOrderValue: newVoucher.minOrderValue,
              expiryDate: newVoucher.expiryDate
            });
            setCopiedVoucherCode(false);

            // Add directly to known ref
            knownVoucherCodesRef.current.add(newVoucher.code.toUpperCase());
          } else {
            // Update known codes in sync
            const currentCodes = new Set<string>();
            list.forEach((c: any) => {
              if (c && c.code) currentCodes.add(c.code.toUpperCase());
            });
            knownVoucherCodesRef.current = currentCodes;
          }
        }
      } catch (err) {
        console.error('Error synchronizing newly added vouchers:', err);
      }
    };

    window.addEventListener('remix_vouchers_changed', checkNewVouchers);
    return () => {
      window.removeEventListener('remix_vouchers_changed', checkNewVouchers);
    };
  }, []);

  // Voucher notification timer
  useEffect(() => {
    if (voucherNotification) {
      const timer = setTimeout(() => {
        setVoucherNotification(null);
      }, 8000); // 8 seconds display
      return () => clearTimeout(timer);
    }
  }, [voucherNotification]);
  
  // PWA states and events
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [deferredPromptState, setDeferredPromptState] = useState<any>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPromptState(e);
      (window as any).deferredPrompt = e; // Store globally as per spec

      const isDismissed = localStorage.getItem('remix_pwa_dismissed') === 'true';
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
      const isMobileSize = window.innerWidth < 768;

      if (!isDismissed && !isStandalone && isMobileSize) {
        setShowInstallBanner(true);
      }
    };

    const handleAppInstalled = () => {
      setShowInstallBanner(false);
      setToastMessage('🎉 Đã cài REMIX.AI thành công!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Initial check on mount for iOS/Safari where beforeinstallprompt is not fired
    const isDismissed = localStorage.getItem('remix_pwa_dismissed') === 'true';
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    const isMobileSize = window.innerWidth < 768;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    if (!isDismissed && !isStandalone && isMobileSize && isIOS) {
      setShowInstallBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPromptState) {
      deferredPromptState.prompt();
      const { outcome } = await deferredPromptState.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBanner(false);
      }
      setDeferredPromptState(null);
    } else if ((window as any).deferredPrompt) {
      (window as any).deferredPrompt.prompt();
      const { outcome } = await (window as any).deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBanner(false);
      }
      (window as any).deferredPrompt = null;
    } else {
      setShowIosGuide(true);
    }
  };

  const handleDismissBanner = () => {
    localStorage.setItem('remix_pwa_dismissed', 'true');
    setShowInstallBanner(false);
  };

  const [zaloNotification, setZaloNotification] = useState<{
    fullName: string;
    phoneNumber: string;
    totalAmount: number;
    orderId: string;
    productsStr: string;
    branchName: string;
  } | null>(null);

  // Checkout information state [Họ tên], [Số điện thoại], [Địa chỉ]
  const [checkoutInfo, setCheckoutInfo] = useState({ fullName: '', phoneNumber: '', address: '' });
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successOrderDetails, setSuccessOrderDetails] = useState<any | null>(null);

  // Onboarding Tour state
  const [showTour, setShowTour] = useState(() => {
    try {
      const completed = localStorage.getItem('remix_onboarding_completed') === 'true' || localStorage.getItem('remix_tour_done') === 'true';
      return !completed;
    } catch {
      return false;
    }
  });

  // Initialize Accounts database representation on mount
  useEffect(() => {
    initializeAccounts();
  }, []);

  // Load user specific cart and checkout info
  useEffect(() => {
    if (currentUser) {
      try {
        const savedCart = localStorage.getItem(`remix_cart_${currentUser.username}`);
        setCartItems(savedCart ? JSON.parse(savedCart) : []);

        const savedCheckout = localStorage.getItem(`remix_checkout_info_${currentUser.username}`);
        setCheckoutInfo(savedCheckout ? JSON.parse(savedCheckout) : { fullName: '', phoneNumber: '', address: '' });
      } catch (e) {
        setCartItems([]);
        setCheckoutInfo({ fullName: '', phoneNumber: '', address: '' });
      }
    } else {
      setCartItems([]);
      setCheckoutInfo({ fullName: '', phoneNumber: '', address: '' });
    }
  }, [currentUser]);

  // Sync checkoutInfo to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`remix_checkout_info_${currentUser.username}`, JSON.stringify(checkoutInfo));
    }
  }, [checkoutInfo, currentUser]);

  // Sync cart to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`remix_cart_${currentUser.username}`, JSON.stringify(cartItems));
      updateAccountData(currentUser.username, { cartItems });
    }
  }, [cartItems, currentUser]);

  // Toast Auto-hide timer
  useEffect(() => {
    const handleShowToast = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setToastMessage(customEvent.detail);
      }
    };
    window.addEventListener('remix_show_toast', handleShowToast);
    return () => {
      window.removeEventListener('remix_show_toast', handleShowToast);
    };
  }, []);

  // Listen for user updates to force reactive re-rendering (e.g., account lock, warning flags)
  const [userUpdateTick, setUserUpdateTick] = useState(0);

  useEffect(() => {
    const handleUserUpdate = () => {
      setUserUpdateTick(tick => tick + 1);
      
      const freshUser = getCurrentUser();
      if (freshUser) {
        setCurrentUser({
          username: freshUser.email || freshUser.phone,
          email: freshUser.email,
          phone: freshUser.phone
        });
      }
    };
    window.addEventListener('remix_user_updated', handleUserUpdate);
    return () => {
      window.removeEventListener('remix_user_updated', handleUserUpdate);
    };
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Zalo Notification Auto-dismiss timer
  useEffect(() => {
    if (zaloNotification) {
      const timer = setTimeout(() => {
        setZaloNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [zaloNotification]);

  // Listen for manual onboarding tour restarts
  useEffect(() => {
    const handleStartTour = () => {
      localStorage.removeItem('remix_onboarding_completed');
      localStorage.removeItem('remix_tour_done');
      setShowTour(true);
    };
    const handleSwitchTab = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setActiveTab(customEvent.detail);
      }
    };
    window.addEventListener('remix_start_tour', handleStartTour);
    window.addEventListener('remix_switch_tab', handleSwitchTab);
    return () => {
      window.removeEventListener('remix_start_tour', handleStartTour);
      window.removeEventListener('remix_switch_tab', handleSwitchTab);
    };
  }, []);

  // Register global switchTab helper for compatibility with mobile triggers
  useEffect(() => {
    (window as any).switchTab = (tab: string) => {
      const tabMap: Record<string, string> = {
        'chat': 'consult',
        'search': 'search',
        'cart': 'cart',
        'orders': 'orders',
        'account': 'dashboard',
      };
      const targetTab = tabMap[tab] || tab;
      setActiveTab(targetTab as any);
      if (tab === 'cart') {
        setIsCartOpen(true);
      }
    };
    return () => {
      try {
        delete (window as any).switchTab;
      } catch (e) {}
    };
  }, []);

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => item.product.id === product.id);
      if (existingIdx > -1) {
        return prev.map((item, idx) => 
          idx === existingIdx 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setToastMessage(lang === 'en' ? "Added to cart ✓" : "Đã thêm vào giỏ hàng ✓");
    try {
      logActivity('add_cart', { productName: product.name, price: product.price });
    } catch (e) {
      console.error(e);
    }
  };

  const handleViewProductDetail = (product: Product) => {
    setPreviousDetailTab(activeTab);
    setSelectedDetailedProduct(product);
    setActiveTab('product-detail');
    try {
      logActivity('view_product', { productName: product.name });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAskAIAboutProduct = async (productName: string) => {
    setActiveTab('consult');
    
    // Find or create current session
    let targetSessionId = currentSessionId;
    let currentSess = sessions.find(s => s.id === targetSessionId);
    if (!targetSessionId || !currentSess) {
      if (!currentUser) return;
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: `Hỏi về ${productName}`,
        messages: [],
        updatedAt: Date.now()
      };
      const updated = [newSession, ...sessions];
      setSessions(updated);
      setCurrentSessionId(newSession.id);
      targetSessionId = newSession.id;
      currentSess = newSession;
      localStorage.setItem(`remix_sessions_${currentUser.username}`, JSON.stringify(updated));
    }

    const promptText = `Tư vấn cho tôi các thông tin kỹ thuật, ưu/nhược điểm và lý do nên mua sản phẩm "${productName}" này nhé.`;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: promptText,
      timestamp: Date.now()
    };

    const updatedMessages = [...(currentSess.messages || []), newUserMessage];
    
    // Update user message first in sessions state
    const updatedSessions = sessions.map(s => 
      s.id === targetSessionId 
        ? { ...s, messages: updatedMessages, updatedAt: Date.now() } 
        : s
    );
    setSessions(updatedSessions);
    if (currentUser) {
      localStorage.setItem(`remix_sessions_${currentUser.username}`, JSON.stringify(updatedSessions));
    }

    try {
      const history = (currentSess.messages || []).slice(-5).map(m => ({ role: m.role, content: m.content }));
      const response = await import('./services/geminiService').then(m => m.getAssistantResponse(promptText, history));
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
        suggestions: response.suggestions,
        status: response.status as any
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      const finalSessions = sessions.map(s => 
        s.id === targetSessionId 
          ? { ...s, messages: finalMessages, updatedAt: Date.now() } 
          : s
      );
      setSessions(finalSessions);
      if (currentUser) {
        localStorage.setItem(`remix_sessions_${currentUser.username}`, JSON.stringify(finalSessions));
      }

      try {
        logActivity('chat', { msg: promptText, reply: response.content });
      } catch (e) {
        console.error('Error logging consultation activity:', e);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handlePlaceOrder = (providedInfo: { fullName: string; phoneNumber: string; address: string; discountCode?: string; discountAmount?: number }) => {
    if (cartItems.length === 0) return;

    try {
      const savedOrdersStr = localStorage.getItem('remix_orders') || localStorage.getItem('remix_placed_orders');
      const savedOrders = savedOrdersStr ? JSON.parse(savedOrdersStr) : [
        {
          id: 'REMIX-9582',
          date: '18/05/2026',
          productName: 'Sony WH-CH520',
          price: 1290000,
          status: 'shipping',
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&q=80',
        },
        {
          id: 'REMIX-7421',
          date: '15/05/2026',
          productName: 'Laptop ASUS Vivobook',
          price: 12500000,
          status: 'delivered',
          imageUrl: 'https://images.unsplash.com/photo-1496181130204-755241524eab?w=150&q=80',
        },
        {
          id: 'REMIX-2391',
          date: '19/05/2026',
          productName: 'Samsung Galaxy A55',
          price: 8990000,
          status: 'processing',
          imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=150&q=80',
        }
      ];

      const today = new Date();
      const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

      let branchName = 'Showroom REMIX - Quận 1';
      try {
        const savedBranches = localStorage.getItem('remix_branches');
        const parsedBranches = savedBranches ? JSON.parse(savedBranches) : [];
        const selectedId = localStorage.getItem('remix_selected_branch_id') || 'Q1';
        const selectedBranchObj = parsedBranches.find((b: any) => b.id === selectedId) || parsedBranches[0];
        if (selectedBranchObj) {
          branchName = selectedBranchObj.name;
        }
      } catch (err) {
        console.error(err);
      }

      const totalCartValue = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
      const discountRatio = totalCartValue > 0 ? (totalCartValue - (providedInfo.discountAmount || 0)) / totalCartValue : 1;

      const newOrders = cartItems.map(item => ({
        id: `REMIX-${Math.floor(1000 + Math.random() * 9000)}`,
        date: formattedDate,
        productName: item.product.name,
        price: Math.max(0, Math.round(item.product.price * item.quantity * discountRatio)),
        status: 'processing' as const,
        imageUrl: item.product.imageUrl,
        branch: branchName,
        customerName: providedInfo.fullName,
        phone: providedInfo.phoneNumber,
        address: providedInfo.address,
        discountApplied: providedInfo.discountCode || undefined,
        username: currentUser?.username || 'guest'
      }));

      const updatedOrders = [...newOrders, ...savedOrders];
      localStorage.setItem('remix_orders', JSON.stringify(updatedOrders));
      localStorage.setItem('remix_placed_orders', JSON.stringify(updatedOrders));

      if (currentUser && currentUser.username) {
        const userOrders = updatedOrders.filter((ord: any) => ord.username === currentUser.username || ord.phone === currentUser.phone || ord.email === currentUser.email);
        updateAccountData(currentUser.username, { orders: userOrders });
      }

      // Increment coupon used count if applicable
      if (providedInfo.discountCode) {
        try {
          const savedCoupons = localStorage.getItem('remix_vouchers');
          if (savedCoupons) {
            const list = JSON.parse(savedCoupons);
            const updated = list.map((c: any) => {
              if (c.code.trim().toUpperCase() === providedInfo.discountCode?.trim().toUpperCase()) {
                return { ...c, usedCount: (c.usedCount || 0) + 1 };
              }
              return c;
            });
            localStorage.setItem('remix_vouchers', JSON.stringify(updated));
            window.dispatchEvent(new Event('remix_vouchers_changed'));
          }
        } catch (err) {
          console.error('Error incrementing coupon used count:', err);
        }
      }

      const totalAmount = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
      const finalAmount = totalAmount - (providedInfo.discountAmount || 0);
      const mockOrderId = newOrders[0]?.id || `REMIX-${Math.floor(1000 + Math.random() * 9000)}`;
      const orderNum = mockOrderId.replace('REMIX-', '');
      const productsJoined = cartItems.map(item => `${item.product.name} x${item.quantity}`).join(', ');

      setZaloNotification({
        fullName: providedInfo.fullName,
        phoneNumber: providedInfo.phoneNumber,
        totalAmount: finalAmount,
        orderId: orderNum,
        productsStr: productsJoined,
        branchName: branchName
      });

      // Populate success order state for dialog
      setSuccessOrderDetails({
        orderId: orderNum,
        fullName: providedInfo.fullName,
        phoneNumber: providedInfo.phoneNumber,
        address: providedInfo.address,
        totalAmount: finalAmount,
        items: [...cartItems],
        branchName: branchName,
        discountCode: providedInfo.discountCode,
        discountAmount: providedInfo.discountAmount
      });

      if (currentUser && currentUser.username) {
        const earnedPoints = calculateEarnedPoints(finalAmount);
        if (earnedPoints > 0) {
          addLoyaltyPoints(currentUser.username, earnedPoints, `Mua hàng: Đơn nhận #${mockOrderId}`);
        }
      }

      try {
        logActivity('order', { orderId: mockOrderId, products: productsJoined, total: finalAmount, branch: branchName });
      } catch (e) {
        console.error('Error logging order activity:', e);
      }

      setIsSuccessModalOpen(true);

      setCartItems([]);
      setIsCartOpen(false);
      setIsCheckoutOpen(false);
      setActiveTab('orders');
    } catch (e) {
      console.error(e);
    }
  };


  
  // Session Management
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Load user-specific sessions on login or user switch
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const storageKey = `remix_sessions_${currentUser.username}`;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          setSessions(parsed);
          if (parsed.length > 0) {
            setCurrentSessionId(parsed[0].id);
          } else {
            // Seed a fresh session if user has an empty array
            const newSession: ChatSession = {
              id: Date.now().toString(),
              title: 'Cuộc hội thoại mới',
              messages: [],
              updatedAt: Date.now()
            };
            setSessions([newSession]);
            setCurrentSessionId(newSession.id);
            localStorage.setItem(storageKey, JSON.stringify([newSession]));
          }
        } else {
          // No history at all, save a start session
          const newSession: ChatSession = {
            id: Date.now().toString(),
            title: 'Cuộc hội thoại mới',
            messages: [],
            updatedAt: Date.now()
          };
          setSessions([newSession]);
          setCurrentSessionId(newSession.id);
          localStorage.setItem(storageKey, JSON.stringify([newSession]));
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      setSessions([]);
      setCurrentSessionId(null);
    }
  }, [currentUser, isAuthenticated]);

  // Synchronize chat sessions history to remix_all_accounts
  useEffect(() => {
    if (currentUser && sessions.length > 0) {
      updateAccountData(currentUser.username, { chatHistory: sessions });
    }
  }, [sessions, currentUser]);

  const createNewSession = () => {
    if (!currentUser) return;
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Cuộc hội thoại mới',
      messages: [],
      updatedAt: Date.now()
    };
    const updated = [newSession, ...sessions];
    setSessions(updated);
    setCurrentSessionId(newSession.id);
    setActiveTab('consult');
    localStorage.setItem(`remix_sessions_${currentUser.username}`, JSON.stringify(updated));
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const updateChatLogs = (sessionId: string, username: string, messages: Message[], forceLedToOrder?: boolean) => {
    try {
      const logsStr = localStorage.getItem('remix_chat_logs');
      let logs: any[] = [];
      if (logsStr) {
        try {
          logs = JSON.parse(logsStr);
        } catch (e) {
          logs = [];
        }
      }

      const existingIndex = logs.findIndex((x: any) => x.id === sessionId);

      const hasOrderSignal = forceLedToOrder || messages.some(msg => 
        msg.content && (
          msg.content.includes('[SYSTEM_ACTION: CONFIRMED_ORDER') || 
          msg.content.includes('CONFIRMED_ORDER') ||
          msg.content.includes('Đặt hàng thành công!')
        )
      );

      const productsStr = localStorage.getItem('remix_products');
      let productsList: any[] = [];
      if (productsStr) {
        try {
          productsList = JSON.parse(productsStr);
        } catch (e) {
          productsList = [];
        }
      }
      
      const askedProducts: string[] = [];
      messages.forEach(msg => {
        const text = (msg.content || '').toLowerCase();
        productsList.forEach((p: any) => {
          if (text.includes(p.name.toLowerCase()) || (p.id && text.includes(p.id.toLowerCase()))) {
            if (!askedProducts.includes(p.name)) {
              askedProducts.push(p.name);
            }
          }
        });
      });

      const lastMsg = messages.length > 0 ? messages[messages.length - 1].content : '';

      const logEntry = {
        id: sessionId,
        user: username,
        startTime: new Date().toISOString(),
        messagesCount: messages.length,
        askedProducts: askedProducts,
        ledToOrder: hasOrderSignal,
        lastMessage: lastMsg.length > 100 ? lastMsg.substring(0, 100) + '...' : lastMsg
      };

      if (existingIndex >= 0) {
        logEntry.startTime = logs[existingIndex].startTime || logEntry.startTime;
        logEntry.ledToOrder = logs[existingIndex].ledToOrder || logEntry.ledToOrder || hasOrderSignal;
        logs[existingIndex] = logEntry;
      } else if (messages.length > 0) {
        logs.unshift(logEntry);
      }

      localStorage.setItem('remix_chat_logs', JSON.stringify(logs));
    } catch (err) {
      console.error('Error updating chat logs:', err);
    }
  };

  const handleMessagesChange = (newMessages: Message[]) => {
    if (!currentSessionId || !currentUser) return;
    const updated = sessions.map(s => 
      s.id === currentSessionId 
        ? { ...s, messages: newMessages, updatedAt: Date.now() } 
        : s
    );
    setSessions(updated);
    localStorage.setItem(`remix_sessions_${currentUser.username}`, JSON.stringify(updated));
    updateChatLogs(currentSessionId, currentUser.username, newMessages);
  };

  const addAssistantMessage = (content: string, forceLedToOrder?: boolean) => {
    if (!currentSessionId || !currentUser) return;
    const updated = sessions.map(s => {
      if (s.id === currentSessionId) {
        const assistantMessage: Message = {
          id: (Date.now() + Math.random()).toString(),
          role: 'assistant',
          content: content,
          timestamp: Date.now()
        };
        const newMsgs = [...s.messages, assistantMessage];
        updateChatLogs(currentSessionId, currentUser.username, newMsgs, forceLedToOrder);
        return {
          ...s,
          messages: newMsgs,
          updatedAt: Date.now()
        };
      }
      return s;
    });
    setSessions(updated);
    localStorage.setItem(`remix_sessions_${currentUser.username}`, JSON.stringify(updated));
  };

  const handleConfirmAndPlace = (providedInfo: { fullName: string; phoneNumber: string; address: string; discountCode?: string; discountAmount?: number }) => {
    const finalAmount = totalPrice - (providedInfo.discountAmount || 0);
    const codeText = providedInfo.discountCode ? ` (áp dụng mã ${providedInfo.discountCode} giảm ${providedInfo.discountAmount?.toLocaleString('vi-VN')}đ, tổng thanh toán: ${finalAmount.toLocaleString('vi-VN')}đ)` : ` với tổng tiền: ${totalPrice.toLocaleString('vi-VN')}đ`;
    const confirmMessage = `Cảm ơn bạn, tôi đã ghi nhận đơn hàng cho ${providedInfo.fullName} tại ${providedInfo.address} với SĐT ${providedInfo.phoneNumber}${codeText}. Bạn có muốn thay đổi gì không?\n\n[SYSTEM_ACTION: CONFIRMED_ORDER - READY_FOR_PACKAGING]`;
    addAssistantMessage(confirmMessage, true);
    handlePlaceOrder(providedInfo);
  };

  const handleCheckoutSubmit = (userText?: string) => {
    if (cartItems.length === 0) {
      alert("Giỏ hàng của Bạn đang trống. Vui lòng thêm sản phẩm vào giỏ!");
      return;
    }

    let updatedInfo = { ...checkoutInfo };
    if (userText) {
      const cleanText = userText.replace(/[\s.-]/g, '');
      const phoneMatch = cleanText.match(/(0\d{9}|84\d{9})/);
      if (phoneMatch) {
        updatedInfo.phoneNumber = phoneMatch[0];
      }

      const nameMatch = userText.match(/(?:tên tôi là|tên là|tên em là|tên mình là|họ tên là|họ tên|tên|họ và tên)\s*:?\s*([^,.\n!]+)/i);
      if (nameMatch && nameMatch[1]) {
        const parsedName = nameMatch[1].trim();
        if (parsedName.length >= 2 && parsedName.length <= 40) {
          updatedInfo.fullName = parsedName;
        }
      }

      const addressMatch = userText.match(/(?:địa chỉ là|địa chỉ nhận hàng|địa chỉ|điểm giao|giao đến|giao ở|giao tại|ship đến|nhận ở|nhận tại|ở)\s*:?\s*([^.\n!]+)/i);
      if (addressMatch && addressMatch[1]) {
        const parsedAddress = addressMatch[1].trim();
        if (parsedAddress.length >= 8) {
          updatedInfo.address = parsedAddress;
        }
      }

      setCheckoutInfo(updatedInfo);
      localStorage.setItem('remix_checkout_info', JSON.stringify(updatedInfo));
    }

    const hasFullName = updatedInfo.fullName && updatedInfo.fullName.trim() !== '';
    const hasPhoneNumber = updatedInfo.phoneNumber && updatedInfo.phoneNumber.trim() !== '';
    const hasAddress = updatedInfo.address && updatedInfo.address.trim() !== '';

    if (!hasFullName || !hasPhoneNumber || !hasAddress) {
      const missingFields: string[] = [];
      if (!hasFullName) missingFields.push("Họ tên");
      if (!hasPhoneNumber) missingFields.push("Số điện thoại");
      if (!hasAddress) missingFields.push("Địa chỉ nhận hàng");

      let joinedFields = "";
      if (missingFields.length === 1) {
        joinedFields = missingFields[0];
      } else if (missingFields.length === 2) {
        joinedFields = `${missingFields[0]} và ${missingFields[1]}`;
      } else {
        joinedFields = `${missingFields[0]}, ${missingFields[1]} và ${missingFields[2]}`;
      }

      const politeRequest = `Dạ, để gửi hàng đến đúng nơi, bạn vui lòng cho tôi xin thêm ${joinedFields} nhé!`;
      addAssistantMessage(politeRequest);
      setActiveTab('consult');
      setIsCheckoutOpen(true);
      return;
    }

    handleConfirmAndPlace(updatedInfo);
  };

  const handleTitleGenerated = (newTitle: string) => {
    if (!currentSessionId || !currentUser) return;
    const updated = sessions.map(s => 
      s.id === currentSessionId 
        ? { ...s, title: newTitle } 
        : s
    );
    setSessions(updated);
    localStorage.setItem(`remix_sessions_${currentUser.username}`, JSON.stringify(updated));
  };

  const handlePinSession = (id: string) => {
    if (!currentUser) return;
    const updated = sessions.map(s => 
      s.id === id ? { ...s, isPinned: !s.isPinned } : s
    );
    setSessions(updated);
    localStorage.setItem(`remix_sessions_${currentUser.username}`, JSON.stringify(updated));
  };

  const handleDeleteSession = (id: string) => {
    if (!currentUser) return;
    if (confirm('Bạn có chắc chắn muốn xóa hội thoại này?')) {
      const updated = sessions.filter(s => s.id !== id);
      setSessions(updated);
      localStorage.setItem(`remix_sessions_${currentUser.username}`, JSON.stringify(updated));
      if (currentSessionId === id) {
        if (updated.length > 0) {
          setCurrentSessionId(updated[0].id);
        } else {
          setCurrentSessionId(null);
        }
      }
    }
  };

  const handleEditSession = (id: string, newTitle: string) => {
    if (!currentUser) return;
    const updated = sessions.map(s => 
      s.id === id ? { ...s, title: newTitle } : s
    );
    setSessions(updated);
    localStorage.setItem(`remix_sessions_${currentUser.username}`, JSON.stringify(updated));
  };

  const handleLoginSuccess = (user: { username: string; email?: string; phone?: string; showWelcome?: boolean; welcomeName?: string; role?: 'admin' | 'user'; isNewRegister?: boolean }) => {
    const rawEmail = user.email || user.username;
    localStorage.setItem('remix_current_user', rawEmail);
    setCurrentUser(user);
    setIsAuthenticated(true);
    setShowLanding(false);
    
    if (user.role === 'admin') {
      localStorage.setItem('remix_admin_auth', 'true');
      setIsAdminAuthenticated(true);
      setActiveTab('dashboard');
      setIsNewRegisterUser(false);
    } else {
      if (user.isNewRegister) {
        setIsNewRegisterUser(true);
        setActiveTab('dashboard');
      } else {
        setIsNewRegisterUser(false);
        setActiveTab('consult');
      }
    }

    if (user.showWelcome) {
      if (user.isNewRegister) {
        setToastMessage(`Đăng ký tài khoản mới thành công!`);
      } else {
        setToastMessage(`Chào mừng ${user.welcomeName || rawEmail}!`);
      }
    }
  };

  const handleLogout = () => {
    try {
      logActivity('logout', {});
    } catch (e) {
      console.error('Error logging logout activity:', e);
    }
    localStorage.removeItem('remix_current_user');
    localStorage.removeItem('remix_admin_auth');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsAdminAuthenticated(false);
    setShowAdminLogin(false);
    setShowLanding(true);
    setActiveTab('consult');
    setIsNewRegisterUser(false);
  };

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setIsScrolled(scrollTop > 10);
  };

  if (isAdminAuthenticated && (activeTab === 'dashboard' || activeTab === 'admin-login')) {
    return (
      <AdminDashboard 
        onLogout={() => {
          localStorage.removeItem('remix_admin_auth');
          localStorage.removeItem('remix_current_user');
          setIsAdminAuthenticated(false);
          setIsAuthenticated(false);
          setCurrentUser(null);
          setShowLanding(true);
          setActiveTab('consult');
        }}
      />
    );
  }

  if (showAdminLogin) {
    return (
      <AdminLoginPage 
        onLoginSuccess={handleAdminLoginSuccess}
        onBackToCustomer={() => {
          setShowAdminLogin(false);
          setShowLanding(true);
        }}
      />
    );
  }

  if (!isAuthenticated && showLanding) {
    return (
      <LandingPage 
        onGetStarted={() => setShowLanding(false)} 
        onLogin={() => setShowLanding(false)} 
        onAdminLogin={() => {
          setShowAdminLogin(true);
          setShowLanding(false);
        }}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginPage 
        onLogin={handleLoginSuccess} 
        onBack={() => setShowLanding(true)}
      />
    );
  }

  const loggedInUserObj = getCurrentUser();

  if (isAuthenticated && loggedInUserObj && loggedInUserObj.isLocked) {
    return (
      <div className="flex h-screen w-screen bg-rose-50/95 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans items-center justify-center p-4 relative overflow-hidden select-none z-[99999]">
        {/* Decorative background blur objects */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-rose-300 dark:bg-rose-950/30 rounded-full blur-3xl pointer-events-none opacity-40" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-amber-200 dark:bg-amber-950/20 rounded-full blur-3xl pointer-events-none opacity-40" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="max-w-md w-full bg-white dark:bg-slate-900 border border-rose-100 dark:border-slate-850 rounded-3xl p-6 md:p-8 text-center space-y-6 shadow-2xl relative z-10"
        >
          {/* Locked Icon */}
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-full flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400 shadow-sm">
            <Lock size={28} className="stroke-[2.5]" />
          </div>
          
          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-rose-700 dark:text-rose-450 uppercase tracking-widest leading-none">Tài khoản đã bị khóa</h2>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Hành vi vi phạm tiêu chuẩn cộng đồng</p>
          </div>
          
          <div className="bg-rose-50/30 dark:bg-slate-950/50 border border-rose-100/50 dark:border-slate-800 rounded-2xl p-5 text-left text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-sans space-y-4">
            <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
              Tài khoản của bạn đã bị khóa do vi phạm tiêu chuẩn cộng đồng 5 lần.
            </p>
            <p className="font-medium text-slate-500 dark:text-slate-400">
              Để mở khóa, vui lòng đến cửa hàng <span className="font-black text-primary">REMIX.AI</span> gần nhất.
            </p>
            
            <div className="pt-3 border-t border-rose-100/40 dark:border-slate-800 space-y-2 font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span>📞 Hotline:</span>
                <span className="text-rose-600 dark:text-rose-400 font-extrabold">1800-xxxx</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📍 Chi nhánh:</span>
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('remix_show_toast', { detail: 'Hệ thống bản đồ chi nhánh đang tải... 🗺️' }));
                  }}
                  className="text-primary hover:underline flex items-center gap-0.5 cursor-pointer text-[11px] font-sans font-black"
                >
                  Xem chi nhánh →
                </button>
              </div>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={handleLogout}
            className="w-full py-3.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-md select-none transition-all active:scale-[0.97]"
          >
            Đăng xuất tài khoản
          </button>
        </motion.div>
      </div>
    );
  }

  const deservesSetupProfile = isAuthenticated && 
                               loggedInUserObj && 
                               loggedInUserObj.role === 'user' && 
                               (!loggedInUserObj.profile?.name || loggedInUserObj.profile.name.trim() === '');

  if (deservesSetupProfile) {
    return (
      <SetupProfile 
        onComplete={() => {
          const freshUser = getCurrentUser();
          if (freshUser) {
            setCurrentUser({
              username: freshUser.email || freshUser.phone,
              email: freshUser.email,
              phone: freshUser.phone
            });
          }
          setIsNewRegisterUser(false);
          setActiveTab('consult');
        }}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        sessions={sessions}
        currentSessionId={currentSessionId || undefined}
        onSelectSession={(id) => {
          setCurrentSessionId(id);
          setActiveTab('consult');
          setIsSidebarOpen(false);
        }}
        onPinSession={handlePinSession}
        onDeleteSession={handleDeleteSession}
        onEditSession={handleEditSession}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onCartClick={() => setIsCartOpen(true)}
        cartCount={cartCount}
        currentUser={currentUser}
      />

      <div className="flex-grow flex flex-col min-h-0 overflow-hidden relative">

        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={handleLogout}
          isScrolled={isScrolled}
          onMenuClick={() => setIsSidebarOpen(true)}
          onCartClick={() => setIsCartOpen(true)}
          cartCount={cartCount}
        />
        
        <main 
          ref={mainRef}
          key={activeTab}
          onScroll={handleScroll}
          className="main-content animate-tab-in"
        >
          {((activeTab === 'consult' && currentSessionId) || activeTab === 'search') && (
            <FlashSaleBanner />
          )}
          {activeTab === 'consult' ? (
            currentSessionId ? (
              <ChatInterface 
                messages={currentSession?.messages || []}
                sessionTitle={currentSession?.title || ""}
                onLogout={handleLogout} 
                onMessagesChange={handleMessagesChange}
                onTitleGenerated={handleTitleGenerated}
                onTabChange={setActiveTab}
                onAddToCart={handleAddToCart}
                onCheckout={handleCheckoutSubmit}
                onViewDetail={handleViewProductDetail}
              />
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center p-8">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto text-primary animate-pulse">
                    <MessageSquare size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Bắt đầu trải nghiệm mới</h2>
                  <p className="text-gray-500 max-w-sm mx-auto">Chọn một hội thoại cũ từ lịch sử hoặc tạo mới để Shop có thể hỗ trợ Bạn tốt nhất.</p>
                  <button 
                    onClick={createNewSession}
                    className="px-8 py-3 bg-primary text-white rounded-full text-sm font-bold tracking-tight hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-95"
                  >
                    + Tạo hội thoại mới
                  </button>
                </div>
              </div>
            )
          ) : activeTab === 'product-detail' && selectedDetailedProduct ? (
            <ProductDetail 
              product={selectedDetailedProduct}
              onAddToCart={handleAddToCart}
              onBack={() => setActiveTab(previousDetailTab)}
              onAskAI={handleAskAIAboutProduct}
              onViewDetail={handleViewProductDetail}
            />
          ) : activeTab === 'dashboard' ? (
            isAdminAuthenticated ? (
              <AdminDashboard />
            ) : (
              <UserProfile 
                onLogout={handleLogout}
                onGoToConsult={() => setActiveTab('consult')}
                onAddToCart={handleAddToCart}
                onViewProductDetail={handleViewProductDetail}
                initialTab={isNewRegisterUser ? 'profile' : 'orders'}
              />
            )
          ) : activeTab === 'admin-login' ? (
            <AdminLoginPage 
              onLoginSuccess={handleAdminLoginSuccess}
              onBackToCustomer={() => setActiveTab('consult')}
            />
          ) : activeTab === 'orders' ? (
            <MyOrders currentUser={currentUser} onGoToConsult={() => setActiveTab('consult')} />
          ) : activeTab === 'loyalty' ? (
            <LoyaltyProgram 
              currentUser={currentUser} 
              onNavigateTab={(tab) => setActiveTab(tab)} 
            />
          ) : activeTab === 'favorites' ? (
            <UserProfile 
              onLogout={handleLogout}
              onGoToConsult={() => setActiveTab('consult')}
              onAddToCart={handleAddToCart}
              onViewProductDetail={handleViewProductDetail}
              initialTab="favorites"
            />
          ) : activeTab === 'cart' ? (
            <div className="flex-grow flex flex-col p-8 bg-white overflow-y-auto">
              <div className="max-w-4xl mx-auto w-full">
                 <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Giỏ hàng của Bạn</h2>
                </div>
                <div className="bg-white border-2 border-gray-50 rounded-3xl p-8 shadow-sm">
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary mb-6">
                      <ShoppingCart size={40} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Giỏ hàng đang trống</h3>
                    <p className="text-gray-500 mb-8 max-w-xs text-center">Hãy tham khảo ý kiến từ AI để tìm được sản phẩm ưng ý nhất trước khi thêm vào giỏ.</p>
                    <button 
                      onClick={() => setActiveTab('consult')}
                      className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                    >
                      Xem sản phẩm nổi bật
                    </button>
                  </div>
                  <div className="border-t border-gray-50 pt-8 mt-4">
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-3 rounded-2xl border border-amber-100">
                      <Sparkles size={16} />
                      <span className="text-xs font-bold uppercase tracking-tight">Mẹo tiết kiệm: Nhập mã "GEMINI" để được giảm ngay 500k cho đơn hàng đầu tiên!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'guide' ? (
            <UserGuide onGoToConsult={() => setActiveTab('consult')} />
          ) : activeTab === 'search' ? (
            <ProductSearch 
              onAddToCart={handleAddToCart} 
              onGoToConsult={() => setActiveTab('consult')} 
              onViewDetail={handleViewProductDetail}
            />
          ) : (
            <div className="flex-grow flex items-center justify-center p-8 bg-white">
              <h2 className="text-2xl font-bold text-gray-400">Đang cập nhật...</h2>
            </div>
          )}
        </main>

        {/* Mobile quick scroll controls */}
        <div className={`absolute right-4 z-50 flex flex-col gap-2 md:hidden transition-all duration-300 ${activeTab === 'consult' ? 'bottom-36' : 'bottom-20'}`}>
          <button
            onClick={() => {
              if (mainRef.current) {
                mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="w-10 h-10 bg-[#185FA5] text-white shadow-lg active:scale-90 transition-all flex items-center justify-center rounded-full border border-white/20 select-none cursor-pointer"
            title="Cuộn lên đầu"
          >
            <ChevronUp size={20} />
          </button>
          <button
            onClick={() => {
              if (mainRef.current) {
                mainRef.current.scrollTo({ top: mainRef.current.scrollHeight, behavior: 'smooth' });
              }
            }}
            className="w-10 h-10 bg-[#185FA5] text-white shadow-lg active:scale-90 transition-all flex items-center justify-center rounded-full border border-white/20 select-none cursor-pointer"
            title="Cuộn xuống cuối"
          >
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Styled Mobile bottom navigation bar layout */}
        <div className="bottom-nav">
          <button 
            className={`bottom-nav-tab ${activeTab === 'consult' ? 'active' : ''}`} 
            onClick={() => setActiveTab('consult')}
          >
            <i className="ti-message-circle flex items-center justify-center">
              <MessageCircle size={22} className="shrink-0" />
            </i>
            Tư vấn
          </button>
          
          <button 
            className={`bottom-nav-tab ${activeTab === 'search' ? 'active' : ''}`} 
            onClick={() => setActiveTab('search')}
          >
            <i className="ti-search flex items-center justify-center">
              <Search size={22} className="shrink-0" />
            </i>
            Tìm SP
          </button>
          
          <button 
            className={`bottom-nav-tab ${activeTab === 'cart' ? 'active' : ''}`} 
            onClick={() => {
              setActiveTab('cart');
              setIsCartOpen(true);
            }}
          >
            <i className="ti-shopping-cart relative flex items-center justify-center">
              <ShoppingCart size={22} className="shrink-0" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center pointer-events-none">
                  {cartCount}
                </span>
              )}
            </i>
            Giỏ
          </button>
          
          <button 
            className={`bottom-nav-tab ${activeTab === 'orders' ? 'active' : ''}`} 
            onClick={() => setActiveTab('orders')}
          >
            <i className="ti-package flex items-center justify-center">
              <Package size={22} className="shrink-0" />
            </i>
            Đơn hàng
          </button>
          
          <button 
            className={`bottom-nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`} 
            onClick={() => setActiveTab('dashboard')}
          >
            <i className="ti-user flex items-center justify-center">
              <UserCircle size={22} className="shrink-0" />
            </i>
            Tôi
          </button>
        </div>

      {/* Cart Navigation drawer panel */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onGoToConsult={() => setActiveTab('consult')}
        onCheckout={handleCheckoutSubmit}
      />

      {/* Checkout validation form modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        initialInfo={checkoutInfo}
        totalPrice={totalPrice}
        cartItems={cartItems}
        currentUser={currentUser}
        onSubmit={(info) => {
          setCheckoutInfo(info);
          handleConfirmAndPlace(info);
        }}
      />

      {/* Success Order and Email Simulated Modal */}
      <OrderSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        orderDetails={successOrderDetails}
        currentUserEmail={currentUser?.email || `${currentUser?.username || 'khachhang'}@gmail.com`}
        currentUser={currentUser}
        onViewLoyalty={() => {
          setActiveTab('loyalty');
          setIsSuccessModalOpen(false);
        }}
      />

      {/* Onboarding Tour overlay */}
      {isAuthenticated && showTour && (
        <OnboardingTour
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onCloseTour={() => setShowTour(false)}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      )}

      {/* Floating help button to restart guide */}
      {isAuthenticated && !showTour && (
        <div className="fixed bottom-4 right-4 z-[999] group flex flex-col items-end font-sans">
          {/* Tooltip */}
          <div className="absolute bottom-11 right-0 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 origin-bottom-right bg-slate-900 text-white text-[11px] font-semibold py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap pointer-events-none mb-1 border border-slate-800">
            Xem lại hướng dẫn
          </div>
          
          <button
            onClick={() => {
              localStorage.removeItem('remix_onboarding_completed');
              localStorage.removeItem('remix_tour_done');
              setShowTour(true);
            }}
            className="w-[36px] h-[36px] flex items-center justify-center bg-[#185FA5] hover:bg-[#124d86] text-white border-none rounded-full shadow-lg cursor-pointer transition-all active:scale-95 duration-150"
            title="Xem lại hướng dẫn"
          >
            <HelpCircle size={18} className="ti-question-mark text-white" />
          </button>
        </div>
      )}

      {/* Floating Success Notification Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[120] bg-slate-900 text-white font-semibold text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-800"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simulation Zalo Notification Popup */}
      <AnimatePresence>
        {zaloNotification && (
          <motion.div
            initial={{ opacity: 0, x: 200 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 200 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed top-[20px] right-[20px] z-[10000] w-[320px] bg-white border border-gray-100/80 rounded-[12px] shadow-[0_8px_24px_rgba(0,0,0,0.15)] overflow-hidden font-sans pointer-events-auto"
          >
            {/* Header with Zalo indicator */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#F0F4F8] border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <div className="bg-[#0068FF] px-1.5 py-0.5 rounded-[4px] text-[14px] font-black text-white italic tracking-tighter leading-none select-none">
                  Zalo
                </div>
                <span className="text-[11px] font-black tracking-tight text-gray-700">REMIX.AI Official</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 font-bold">vừa xong</span>
                <button 
                  onClick={() => setZaloNotification(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors border-none bg-transparent cursor-pointer p-0.5 flex items-center justify-center"
                  title="Đóng"
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            {/* Content of the Notification */}
            <div className="p-4 flex gap-3 text-left">
              <div className="w-10 h-10 shrink-0 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center relative overflow-hidden select-none">
                <div className="w-8 h-8 rounded-full bg-[#0068FF] flex items-center justify-center text-white text-[9px] font-black italic shadow-inner tracking-tighter">
                  REMIX
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center"></div>
              </div>
              
              <div className="flex-grow text-xs space-y-1.5">
                <div className="font-black text-emerald-600 flex items-center gap-1">
                  <span>✅ Đặt hàng thành công!</span>
                </div>
                
                <div className="text-gray-600 space-y-0.5 font-semibold leading-relaxed">
                  <div>
                    <span className="text-gray-400 font-medium">Mã đơn:</span>{' '}
                    <span className="font-mono font-bold text-gray-900">#ORD-{zaloNotification.orderId}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">Sản phẩm:</span>{' '}
                    <span className="text-gray-800">{zaloNotification.productsStr}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">Tổng tiền:</span>{' '}
                    <span className="text-[#0C447C] font-extrabold">{zaloNotification.totalAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">Chi nhánh:</span>{' '}
                    <span className="text-gray-800">{zaloNotification.branchName}</span>
                  </div>
                  {currentUser && (
                    <div className="text-[#DAA520] font-black text-[11px] pt-1 tracking-tight flex items-start gap-1">
                      <span>⭐</span>
                      <span>Bạn nhận được +{Math.max(1, calculateEarnedPoints(zaloNotification.totalAmount))} điểm thưởng từ đơn hàng này!</span>
                    </div>
                  )}
                </div>
                
                <p className="text-[11px] text-gray-500 leading-normal">
                  Nhân viên sẽ liên hệ xác nhận trong 15 phút.
                </p>
                
                <p className="text-[11px] text-gray-500 font-medium italic">
                  Cảm ơn bạn đã tin tưởng REMIX.AI! 🙏
                </p>

                <div className="pt-1.5">
                  <button
                    onClick={() => {
                      setActiveTab('orders');
                      setZaloNotification(null);
                    }}
                    className="px-3 py-1 bg-[#0068FF] hover:bg-[#0051C8] text-white rounded-[6px] text-[10px] font-bold transition-all border-none cursor-pointer shadow-sm active:scale-95"
                  >
                    Xem đơn hàng
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PWA Install Banner */}
      <AnimatePresence>
        {showInstallBanner && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="md:hidden fixed bottom-[70px] left-0 right-0 z-[110] flex items-center justify-between gap-3 text-left bg-[#0C447C] text-white"
            style={{
              width: 'calc(100% - 32px)',
              margin: '0 16px',
              borderRadius: '16px',
              padding: '14px 16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}
          >
            {/* Left: Icon App */}
            <div className="w-10 h-10 shrink-0 bg-[#185FA5] rounded-[10px] flex items-center justify-center font-extrabold text-white text-sm shadow-md">
              AI
            </div>

            {/* Middle: Text details */}
            <div className="flex-grow min-w-0 pr-1">
              <h4 className="text-[13px] font-bold text-white tracking-tight truncate leading-normal">
                Cài REMIX.AI lên điện thoại
              </h4>
              <p className="text-[11px] text-white/75 font-medium leading-none mt-1">
                Dùng nhanh hơn, như app thật!
              </p>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleInstallClick}
                className="bg-white hover:bg-gray-100 text-[#185FA5] text-[12px] font-bold py-1.5 px-3 border-0 rounded-[20px] shadow-sm transition-all active:scale-95 cursor-pointer leading-none"
              >
                Cài ngay
              </button>
              <button
                onClick={handleDismissBanner}
                className="w-5 h-5 flex items-center justify-center text-white bg-transparent border-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer p-0"
                title="Đóng"
              >
                <X size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS PWA Install Guide Modal */}
      <AnimatePresence>
        {showIosGuide && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIosGuide(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl p-6 text-center select-none font-sans border border-gray-100"
            >
              <button
                onClick={() => setShowIosGuide(false)}
                className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 border-none cursor-pointer"
                title="Đóng"
              >
                <X size={14} />
              </button>

              <div className="mx-auto w-12 h-12 rounded-xl bg-[#185FA5]/10 flex items-center justify-center mb-4">
                <Sparkles className="text-[#185FA5]" size={24} />
              </div>

              <h3 className="text-base font-extrabold text-gray-900 tracking-tight leading-normal">
                Cài đặt REMIX.AI trên iOS/Safari
              </h3>
              
              <p className="text-xs text-gray-500 leading-relaxed mt-2 px-1">
                Hãy làm theo các bước đơn giản sau để thêm ứng dụng trực tiếp vào màn hình chính của bạn:
              </p>

              <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-4 text-left text-xs font-semibold text-gray-700">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#185FA5] text-white font-extrabold text-[10px]">1</span>
                  <span>
                    Chạm vào nút <strong className="text-[#185FA5] font-extrabold">Chia sẻ (Share)</strong> <span className="inline-block px-1.5 py-0.5 rounded bg-gray-200/60 font-mono text-[10px]">↑</span> trên thanh menu của Safari.
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#185FA5] text-white font-extrabold text-[10px]">2</span>
                  <span>
                    Cuộn xuống và chọn <strong className="text-[#185FA5] font-extrabold">Thêm vào màn hình chính (Add to Home Screen)</strong> <span className="inline-[#185FA5] font-semibold tracking-wide">＋</span>.
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#185FA5] text-white font-extrabold text-[10px]">3</span>
                  <span>
                    Bấm <strong className="text-[#185FA5] font-extrabold">Thêm (Add)</strong> ở góc trên bên phải để xác nhận cấu hình.
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowIosGuide(false);
                  localStorage.setItem('remix_pwa_dismissed', 'true');
                  setShowInstallBanner(false);
                }}
                className="w-full bg-[#185FA5] hover:bg-[#124d86] text-white text-xs font-bold py-3 px-4 border-none rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer transition-all active:scale-95"
              >
                Tôi đã hiểu
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Exclusive Voucher Push Notification Toast */}
      <AnimatePresence>
        {voucherNotification && (
          <motion.div
            initial={{ opacity: 0, y: 70, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="fixed bottom-6 right-6 z-[1000] w-[350px] bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.4)] text-white overflow-hidden text-left font-sans"
          >
            {/* Background glowing flare */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Header: Icon, badge, close button */}
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-400 relative">
                  <span className="absolute inset-0 rounded-full bg-amber-500/10 animate-ping" />
                  <Bell size={14} className="animate-bounce" />
                </div>
                <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase">ƯU ĐÃI CHƯA SỬ DỤNG</span>
              </div>
              <button
                onClick={() => setVoucherNotification(null)}
                className="text-gray-500 hover:text-white transition-colors border-0 bg-transparent cursor-pointer p-1"
                title="Đóng thông báo"
              >
                <X size={14} />
              </button>
            </div>

            {/* Middle: Description & Value */}
            <div className="space-y-3">
              <div>
                <h4 className="text-[13px] font-bold text-gray-100 flex items-center gap-1.5 leading-snug">
                  🎉 Có Voucher Mới Trên Hệ Thống!
                </h4>
                <p className="text-[11px] text-gray-400 font-medium leading-relaxed mt-1">
                  Đừng bỏ lỡ mã giảm giá vừa mới cập nhật cho cộng đồng REMIX.AI
                </p>
              </div>

              {/* The "Ticket" look coupon box */}
              <div className="relative bg-slate-950/60 rounded-xl border border-dashed border-slate-800 p-3.5 flex items-center justify-between overflow-hidden">
                {/* Coupon Punch holes at left & right */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-slate-900 border-r border-[#E2E8F0]/5 rounded-r-full" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-slate-900 border-l border-[#E2E8F0]/5 rounded-l-full" />
                
                <div className="pl-2 pr-1 flex flex-col gap-0.5 max-w-[65%]">
                  <span className="font-mono text-[14px] font-black text-amber-300 tracking-wider">
                    {voucherNotification.code}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold leading-tight">
                    {voucherNotification.discountType === 'percentage' 
                      ? `Giảm ${voucherNotification.value}%` 
                      : `Giảm ${voucherNotification.value.toLocaleString('vi-VN')}đ`}
                    {voucherNotification.minOrderValue && voucherNotification.minOrderValue > 0 
                      ? ` (đơn từ ${Math.round(voucherNotification.minOrderValue / 1000)}k)` : ''}
                  </span>
                  {voucherNotification.expiryDate && (
                    <span className="text-[9px] text-gray-500 font-medium tracking-tight">HSD: {voucherNotification.expiryDate}</span>
                  )}
                </div>
                
                {/* Copy Button */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(voucherNotification.code);
                    setCopiedVoucherCode(true);
                    if (navigator.vibrate) navigator.vibrate(100);
                  }}
                  className={`relative overflow-hidden flex items-center gap-1 px-3 py-2 rounded-lg text-[10px] font-extrabold tracking-wide uppercase transition-all duration-300 ${
                    copiedVoucherCode 
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-md shadow-emerald-500/10' 
                      : 'bg-[#185FA5] hover:bg-blue-600 text-white border-none shadow-md shadow-blue-500/10 active:scale-95'
                  }`}
                >
                  {copiedVoucherCode ? (
                    <>
                      <Check size={11} className="text-white shrink-0" />
                      <span>ĐÃ CHÉP</span>
                    </>
                  ) : (
                    <>
                      <Copy size={11} className="text-white shrink-0" />
                      <span>SAO CHÉP</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Auto progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
              <motion.div 
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 8, ease: 'linear' }}
                className="h-full bg-amber-400"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styled custom tooltips */}
      <CustomTooltip />
    </div>
  </div>
);
}
