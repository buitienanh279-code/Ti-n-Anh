import { useState, useEffect } from 'react';

// Translation dictionary for Vietnamese and English locales
export type LocaleType = 'vi' | 'en';

export const TRANSLATIONS = {
  vi: {
    // Navbar & Common
    appName: "REMIX.AI",
    branch: "Chi nhánh",
    selectBranch: "CHỌN SHOWROOM",
    avatarTitle: "Hồ sơ của bạn",
    notifications: "Thông báo",
    themeToggle: "Chuyển giao diện",
    logout: "Đăng xuất",
    save: "Lưu",
    cancel: "Hủy",
    copied: "Đã sao chép!",
    copy: "Sao chép",
    success: "Thành công",
    error: "Lỗi",
    loading: "Đang tải...",
    noResults: "Không tìm thấy kết quả",

    // Sidebar Tabs
    tabConsult: "Tư vấn",
    tabSearch: "Tìm kiếm",
    tabProducts: "Sản phẩm",
    tabOrders: "Lịch sử mua hàng",
    tabLoyalty: "Hội viên (Thẻ & Điểm)",
    tabBranches: "Cửa hàng",
    tabMap: "Trực quan map chi nhánh",
    tabGuide: "Sử dụng app & FAQ",
    tabAdmin: "Hệ thống Quản trị",

    // Chat Interface
    chatWelcomeTitle: "Xin chào! 👋 Tôi là trợ lý AI TechShop REMIX",
    chatWelcomeDesc: "Tôi có thể giúp bạn chọn Laptop, Smartphones, tư vấn specs, chính sách bảo hành, hoặc các chi nhánh còn hàng của showroom.",
    chatPlaceholderAll: "Hỏi AI về Laptop, Iphone, AirPods, chính sách đổi trả...",
    chatClearBtn: "Xóa cuộc trò chuyện",
    chatHumanNotice: "🔴 CẦN NHÂN VIÊN THỰC TẾ HỖ TRỢ? Hãy gõ yêu cầu gặp nhân viên hoặc nhập thông tin cá nhân.",
    chatSuggestedPrompt1: "Xem các mẫu Laptop dưới 20 triệu bán chạy nhất?",
    chatSuggestedPrompt2: "Chi nhánh nào tại Hà Nội còn iPhone 15 Pro Max?",
    chatSuggestedPrompt3: "Chính sách đổi trả 1:1 trong 30 ngày như thế nào?",
    chatSuggestedPrompt4: "Gợi ý điện thoại pin trâu tầm giá 10 triệu?",
    chatStatusBusy: "Hệ thống bận. Vui lòng thử lại sau.",
    chatStatusNoResults: "Không tìm thấy sản phẩm phù hợp. Bạn có thể mô tả thêm không?",
    chatSendBtn: "Gửi",

    // Landing Page
    landingTitle: "Trải Nghiệm Mua Sắm AI Đột Phá",
    landingSubtitle: "Tư vấn cấu hình chuyên nghiệp, tìm cửa hàng gần nhất, cá nhân hóa ưu đãi và tích lũy điểm thưởng không giới hạn.",
    landingStartChat: "BẬT CHAT TƯ VẤN AI NGAY",
    landingScrollExplore: "Khám phá danh mục nổi bật",
    landingFeatureAiTitle: "Tư Vấn AI 24/7",
    landingFeatureAiDesc: "Phân tích nhu cầu kỹ lưỡng, gợi ý Laptop/Điện thoại tối ưu nhất theo tầm giá và mục đích sử dụng.",
    landingFeatureMapTitle: "Chi Nhánh Gần Nhất",
    landingFeatureMapDesc: "Kho hàng cập nhật real-time tại 3 showroom lớn toàn quốc giúp giao hàng siêu tốc trong 2 giờ.",
    landingFeatureLoyaltyTitle: "Hội Viên Đặc Quyền",
    landingFeatureLoyaltyDesc: "Tích điểm tự động, hoàn tiền 1.5% mọi đơn hàng, đổi mã voucher giảm giá khủng ngay trong ứng dụng.",

    // Cart and Checkout
    cartTitle: "Giỏ hàng của bạn",
    cartEmpty: "Giỏ hàng còn trống. Hãy trò chuyện với AI để chọn mẫu phù hợp nhất!",
    cartTotal: "Tạm tính:",
    cartCheckout: "Tiến hành thanh toán",
    cartPromoCode: "Mã giảm giá/Voucher",
    cartApplyPromo: "Áp dụng",
    cartCheckoutDetails: "Thông tin nhận hàng",
    cartNamePlaceholder: "Họ và tên người nhận",
    cartPhonePlaceholder: "Số điện thoại liên hệ",
    cartAddressPlaceholder: "Địa chỉ nhận hàng chi tiết",
    cartShippingMethod: "Phương thức vận chuyển",
    cartShippingInstant: "Giao hàng siêu tốc 2H",
    cartShippingStandard: "Giao hàng tiêu chuẩn",
    cartPaymentMethod: "Phương thức thanh toán",
    cartPaymentCod: "Thanh toán khi nhận hàng (COD)",
    cartPaymentBanking: "Chuyển khoản QR ngân hàng",
    cartPlaceOrder: "Xác nhận đặt hàng",
    cartRequiredField: "Vui lòng nhập đầy đủ thông tin",

    // Product Card / Details
    productReviews: "lượt đánh giá",
    productAddToCart: "Thêm vào giỏ",
    productAddedToCart: "Đã thêm giỏ hàng",
    productDetailTitle: "Chi tiết sản phẩm",
    productCompareTitle: "So sánh sản phẩm",
    productSpecs: "Thông số kỹ thuật",
    productBuyNow: "Mua ngay",

    // Loyalty and Accounts
    loyaltyCardName: "HỘI VIÊN THÂN THIẾT",
    loyaltyPoints: "Điểm tích lũy:",
    loyaltyRank: "Hạng thẻ:",
    loyaltyRankBronze: "Đồng",
    loyaltyRankSilver: "Bạc",
    loyaltyRankGold: "Vàng",
    loyaltyRankPlatinum: "Kim Cương",
    loyaltyRedeemTitle: "Đổi điểm nhận Voucher",
    loyaltyMyVouchers: "Ví Voucher của bạn",
    loyaltyHistory: "Lịch sử quy đổi",
    loyaltyPointsNeeded: "yêu cầu",

    // New Voucher Notify Toast
    voucherNewTitle: "Có Voucher Mới Trên Hệ Thống!",
    voucherNewSub: "Đừng bỏ lỡ mã giảm giá vừa mới cập nhật cho cộng đồng REMIX.AI",
    voucherCopied: "ĐÃ CHÉP",
    voucherCopy: "SAO CHÉP",
    voucherExpiry: "HSD",
    voucherMinOrder: "đơn từ",
    voucherBadge: "ƯU ĐÃI CHƯA SỬ DỤNG",
  },
  en: {
    // Navbar & Common
    appName: "REMIX.AI",
    branch: "Branch",
    selectBranch: "SELECT SHOWROOM",
    avatarTitle: "Your Profile",
    notifications: "Notifications",
    themeToggle: "Toggle Theme",
    logout: "Log Out",
    save: "Save",
    cancel: "Cancel",
    copied: "Copied!",
    copy: "Copy",
    success: "Success",
    error: "Error",
    loading: "Loading...",
    noResults: "No results found",

    // Sidebar Tabs
    tabConsult: "AI Consult",
    tabSearch: "Search",
    tabProducts: "Products",
    tabOrders: "My Orders",
    tabLoyalty: "Loyalty Program",
    tabBranches: "Branches",
    tabMap: "Locations Map",
    tabGuide: "User Guide & FAQ",
    tabAdmin: "Admin Dashboard",

    // Chat Interface
    chatWelcomeTitle: "Hello there! 👋 I am the TechShop REMIX AI Assistant",
    chatWelcomeDesc: "I can help you select laptops, smartphones, consult specs, store policies, or find available showroom stocks.",
    chatPlaceholderAll: "Ask AI about laptops, iPhones, AirPods, refund policies...",
    chatClearBtn: "Clear conversation",
    chatHumanNotice: "🔴 NEED REAL ASSISTANCE? Type real staff request or submit your contact info.",
    chatSuggestedPrompt1: "What are the best-selling smartphones under $500?",
    chatSuggestedPrompt2: "Which Hanoi branch has iPhone 15 Pro Max in stock?",
    chatSuggestedPrompt3: "Are there 30-day 1-to-1 refund warranty policies?",
    chatSuggestedPrompt4: "Recommend robust gaming laptops with a balanced price?",
    chatStatusBusy: "The system is busy. Please try again in a few seconds.",
    chatStatusNoResults: "No matching products found. Could you specify further details?",
    chatSendBtn: "Send",

    // Landing Page
    landingTitle: "Revolutionary AI Shopping Experience",
    landingSubtitle: "Receive professional specification advice, locate the closest branch, personalize promotions, and accumulate unlimited loyalty rewards.",
    landingStartChat: "START DYNAMIC AI CONSULTING NOW",
    landingScrollExplore: "Explore our trending categories",
    landingFeatureAiTitle: "24/7 AI Sales Advisor",
    landingFeatureAiDesc: "Deeply analyzes your needs to suggest optimized laptops or phones matching your usage and budget constraints.",
    landingFeatureMapTitle: "Closest Showrooms",
    landingFeatureMapDesc: "Real-time stock across 3 major tech locations with hyper-speed 2-hour shipment fulfillment.",
    landingFeatureLoyaltyTitle: "Exclusive Loyalty Membership",
    landingFeatureLoyaltyDesc: "Auto-rewards points, grants 1.5% cashback on all order transactions, and lets you redeem super values directly on the app.",

    // Cart and Checkout
    cartTitle: "Your Shopping Cart",
    cartEmpty: "Your cart is empty. Try speaking with the AI to find the perfect fit!",
    cartTotal: "Subtotal:",
    cartCheckout: "Proceed to Checkout",
    cartPromoCode: "Promo / Voucher Code",
    cartApplyPromo: "Apply",
    cartCheckoutDetails: "Shipping details",
    cartNamePlaceholder: "Full Name",
    cartPhonePlaceholder: "Phone Number",
    cartAddressPlaceholder: "Detailed Street Address",
    cartShippingMethod: "Shipping Method",
    cartShippingInstant: "Instant Express 2H",
    cartShippingStandard: "Standard Shipping",
    cartPaymentMethod: "Payment Method",
    cartPaymentCod: "Cash on Delivery (COD)",
    cartPaymentBanking: "Bank QR Transfer",
    cartPlaceOrder: "Confirm Order Delivery",
    cartRequiredField: "Please fill in all details",

    // Product Card / Details
    productReviews: "reviews",
    productAddToCart: "Add to cart",
    productAddedToCart: "Added to cart",
    productDetailTitle: "Product Details",
    productCompareTitle: "Compare Products",
    productSpecs: "Technical Specifications",
    productBuyNow: "Buy Now",

    // Loyalty and Accounts
    loyaltyCardName: "MEMBERSHIP CARD",
    loyaltyPoints: "Accumulated status points:",
    loyaltyRank: "Membership level:",
    loyaltyRankBronze: "Bronze",
    loyaltyRankSilver: "Silver",
    loyaltyRankGold: "Gold",
    loyaltyRankPlatinum: "Platinum",
    loyaltyRedeemTitle: "Redeem points for coupons",
    loyaltyMyVouchers: "My Voucher Wallet",
    loyaltyHistory: "Exchange History List",
    loyaltyPointsNeeded: "points needed",

    // New Voucher Notify Toast
    voucherNewTitle: "New Voucher Released!",
    voucherNewSub: "Do not miss out on our newly updated discount coupon for the REMIX.AI community",
    voucherCopied: "COPIED",
    voucherCopy: "COPY CODE",
    voucherExpiry: "EXPIRY",
    voucherMinOrder: "orders from",
    voucherBadge: "UNUSED OFFERS",
  }
} as const;

// Read the current language from localStorage safely
export function getActiveLanguage(): LocaleType {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('remix_lang');
    if (saved === 'en' || saved === 'vi') {
      return saved;
    }
  }
  return 'vi';
}

// Change the active language and notify across components
export function setActiveLanguage(lang: LocaleType) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('remix_lang', lang);
    window.dispatchEvent(new Event('remix_lang_changed'));
  }
}

// Translate utility helper function
export function getTranslation<K extends keyof typeof TRANSLATIONS['vi']>(key: K): string {
  const lang = getActiveLanguage();
  return TRANSLATIONS[lang][key] || TRANSLATIONS['vi'][key];
}

export function useLanguage() {
  const [lang, setLang] = useState<LocaleType>(getActiveLanguage);

  useEffect(() => {
    const handleLangChange = () => {
      setLang(getActiveLanguage());
    };
    window.addEventListener('remix_lang_changed', handleLangChange);
    return () => {
      window.removeEventListener('remix_lang_changed', handleLangChange);
    };
  }, []);

  const t = <K extends keyof typeof TRANSLATIONS['vi']>(key: K): string => {
    return TRANSLATIONS[lang][key] || TRANSLATIONS['vi'][key];
  };

  return { lang, setLang: setActiveLanguage, t };
}
