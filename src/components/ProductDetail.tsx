import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ShoppingCart, Star, Package, MapPin, BadgePercent, CheckCircle2,
  AlertTriangle, MessageSquareCode, Headphones, Laptop, Smartphone, Watch, Usb, Share2, HelpCircle,
  ThumbsUp, MessageSquare, Heart
} from 'lucide-react';
import { Product } from '../types';
import { KNOWLEDGE_BASE } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { addLoyaltyPoints } from '../utils/loyalty';
import { getCurrentUser, updateCurrentUser } from '../utils/accounts';

// Specs parser helper
const parseSpecs = (specsStr?: string, category?: string) => {
  const result: { key: string; value: string }[] = [];
  
  if (specsStr && specsStr.trim().length > 0) {
    const lines = specsStr.includes('|') ? specsStr.split('|') : specsStr.split('\n');
    lines.forEach(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        result.push({
          key: parts[0].trim(),
          value: parts.slice(1).join(':').trim()
        });
      } else if (line.trim()) {
        const spaceIdx = line.indexOf(' ');
        if (spaceIdx > 0) {
          result.push({
            key: line.substring(0, spaceIdx).trim(),
            value: line.substring(spaceIdx + 1).trim()
          });
        } else {
          result.push({
            key: 'Thông số',
            value: line.trim()
          });
        }
      }
    });
  }
  
  if (result.length === 0) {
    const cat = (category || '').toLowerCase();
    if (cat.includes('tai nghe') || cat.includes('âm thanh')) {
      return [
        { key: 'Kết nối', value: 'Bluetooth 5.2 | Khử ồn chủ động' },
        { key: 'Thời lượng Pin', value: '50 giờ nghe nhạc liên tục' },
        { key: 'Trọng lượng', value: '147g siêu mỏng nhẹ' },
        { key: 'Cổng sạc', value: 'USB Type-C hỗ trợ sạc siêu tốc' },
        { key: 'Màng loa', value: '30mm chất lượng âm trầm ấn tượng' }
      ];
    } else if (cat.includes('laptop') || cat.includes('màn hình')) {
      return [
        { key: 'Bộ vi xử lý (CPU)', value: 'Intel Core i7 / Apple Silicon thế hệ mới' },
        { key: 'Dung lượng RAM', value: '16GB LPDDR5 hiệu năng mượt mà' },
        { key: 'Màn hình hiển thị', value: 'Mini-LED / OLED rực sắc màu sRGB 100%' },
        { key: 'Ổ cứng lưu trữ', value: '512GB Ultra SSD tốc độ đọc 4000MB/s' },
        { key: 'Thời lượng Pin', value: 'Sử dụng liên tục lên đến 14-18 giờ' }
      ];
    } else if (cat.includes('điện thoại') || cat.includes('smartphone')) {
      return [
        { key: 'Vi xử lý chính', value: 'Chipset cao cấp hiệu năng tối thượng' },
        { key: 'Bộ nhớ RAM', value: '8GB / 12GB đa nhiệm tuyệt đỉnh' },
        { key: 'Hệ thống Camera', value: 'Độ phân giải 48MP siêu nét hỗ trợ quay 4K' },
        { key: 'Dung lượng Pin', value: 'Sạc đầy trong 45 phút, dùng cả ngày dài' },
        { key: 'Kháng nước', value: 'Tiêu chuẩn bảo vệ IP68 an tâm sử dụng' }
      ];
    } else if (cat.includes('đồng hồ') || cat.includes('watch')) {
      return [
        { key: 'Màn hình hiển thị', value: 'AMOLED Always-On rực rỡ dưới nắng' },
        { key: 'Tính năng sức khỏe', value: 'Theo dõi nhịp tim 24/7, SpO2, đo giấc ngủ' },
        { key: 'Kháng nước chống bụi', value: 'Kháng nước 5ATM bơi lội thoải mái' },
        { key: 'Thời lượng Pin', value: 'Từ 2 đến 7 ngày tùy tác vụ sử dụng' },
        { key: 'Kiểu dáng thiết kế', value: 'Thời trang, thể thao sang trọng hiện đại' }
      ];
    } else {
      return [
        { key: 'Loại thiết bị', value: category || 'Thiết bị thông minh chính hãng' },
        { key: 'Chế độ kết nối', value: 'Hai băng tần WiFi & Bluetooth 5.0' },
        { key: 'Bộ quà tặng', value: 'Cáp sạc đa năng + Hướng dẫn tiếng Việt' },
        { key: 'Bảo hành ủy quyền', value: '12 tháng chính hãng lỗi 1 đổi 1' }
      ];
    }
  }
  
  return result;
};

// Get matching visual icon for category
const getProductIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('tai nghe') || cat.includes('âm thanh')) return <Headphones size={80} className="text-[#94A3B8]" />;
  if (cat.includes('laptop') || cat.includes('màn hình')) return <Laptop size={80} className="text-[#94A3B8]" />;
  if (cat.includes('điện thoại') || cat.includes('smartphone')) return <Smartphone size={80} className="text-[#94A3B8]" />;
  if (cat.includes('đồng hồ') || cat.includes('smartwatch') || cat.includes('watch')) return <Watch size={80} className="text-[#94A3B8]" />;
  if (cat.includes('phụ kiện') || cat.includes('sạc') || cat.includes('usb')) return <Usb size={80} className="text-[#94A3B8]" />;
  return <Package size={80} className="text-[#94A3B8]" />;
};

interface ProductDetailProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onBack: () => void;
  onAskAI: (productName: string) => void;
  onViewDetail?: (product: Product) => void;
}

export default function ProductDetail({ product, onAddToCart, onBack, onAskAI, onViewDetail }: ProductDetailProps) {
  const [branchName, setBranchName] = useState('Chi nhánh Quận 1');
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews' | 'similar'>('specs');

  const [isFavorite, setIsFavorite] = useState(false);

  const checkFavorite = () => {
    const currentUser = getCurrentUser();
    const fav = currentUser?.favorites?.some((f: any) => f.id === product.id) || false;
    setIsFavorite(fav);
  };

  useEffect(() => {
    checkFavorite();
    window.addEventListener('storage', checkFavorite);
    return () => window.removeEventListener('storage', checkFavorite);
  }, [product.id]);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    const currentFavs = currentUser.favorites || [];
    let updated;
    if (isFavorite) {
      updated = currentFavs.filter((f: any) => f.id !== product.id);
    } else {
      updated = [...currentFavs, product];
    }
    updateCurrentUser({ favorites: updated });
    setIsFavorite(!isFavorite);
    window.dispatchEvent(new Event('storage'));
  };

  // Load reviews from localStorage
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewName, setNewReviewName] = useState('');

  // All product list for similar products lookup
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem('remix_current_user');
      if (savedUserStr) {
        const userObj = JSON.parse(savedUserStr);
        setIsLoggedIn(true);
        const name = userObj.username || userObj.email || 'Khách hàng';
        setCurrentUsername(name);
        setNewReviewName(name);

        // check purchase from remix_orders or remix_placed_orders
        const savedOrdersStr = localStorage.getItem('remix_orders') || localStorage.getItem('remix_placed_orders');
        const orders = savedOrdersStr ? JSON.parse(savedOrdersStr) : [];
        const bought = orders.some((ord: any) => 
          ord.productName?.toLowerCase().trim() === product.name?.toLowerCase().trim() &&
          ord.username === userObj.username
        );
        setHasPurchased(bought);
      } else {
        setIsLoggedIn(false);
        setHasPurchased(false);
        setCurrentUsername('');
      }
    } catch (e) {
      console.error(e);
    }
  }, [product.id, product.name]);

  useEffect(() => {
    try {
      const savedProds = localStorage.getItem('remix_products');
      if (savedProds) {
        const parsed = JSON.parse(savedProds);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAllProducts(parsed);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setAllProducts(KNOWLEDGE_BASE);
  }, []);

  useEffect(() => {
    try {
      const savedReviews = localStorage.getItem(`remix_reviews_${product.id}`);
      if (savedReviews) {
        setUserReviews(JSON.parse(savedReviews));
      } else {
        const isAudio = product.category.toLowerCase().includes('tai nghe') || product.category.toLowerCase().includes('âm thanh');
        const baseReviews = [
          {
            id: 'r1',
            name: 'Nguyễn Văn A',
            rating: 5,
            comment: isAudio 
              ? "Tai nghe nghe nhạc rất hay, pin trâu, đáng đồng tiền bát gạo. Mình dùng cả ngày làm việc không hết pin."
              : `${product.name} dùng rất tốt, pin trâu, cực kỳ đáng đồng tiền bát gạo. Mình sử dụng cả ngày làm việc không lo hết pin.`,
            createdAt: new Date('2026-04-20T10:00:00.000Z').toISOString(),
            isPurchased: true,
            helpfulCount: 45,
            unhelpfulCount: 2,
            images: [1, 2]
          },
          {
            id: 'r2',
            name: 'Trần Thị B',
            rating: 5,
            comment: "AI tư vấn chuẩn, mua đúng sản phẩm cần. Giao hàng nhanh, đóng gói cẩn thận.",
            createdAt: new Date('2026-04-15T14:30:00.000Z').toISOString(),
            isPurchased: true,
            helpfulCount: 18,
            unhelpfulCount: 1,
            images: [1, 2, 3]
          },
          {
            id: 'r3',
            name: 'Lê Minh C',
            rating: 4,
            comment: "Sản phẩm tốt, chỉ tiếc không có case đựng đi kèm. Âm thanh bass khá ổn.",
            createdAt: new Date('2026-04-10T09:15:00.000Z').toISOString(),
            isPurchased: true,
            helpfulCount: 32,
            unhelpfulCount: 0
          },
          {
            id: 'r4',
            name: 'Phạm Thu D',
            rating: 5,
            comment: "Mua lần 2 rồi, lần nào cũng ưng. Shop tư vấn nhiệt tình, ship nhanh.",
            createdAt: new Date('2026-04-05T16:45:00.000Z').toISOString(),
            isPurchased: true,
            helpfulCount: 15,
            unhelpfulCount: 0,
            images: [1]
          },
          {
            id: 'r5',
            name: 'Hoàng Văn E',
            rating: 4,
            comment: "Dùng được 2 tuần, chất lượng ổn so với giá. Kết nối Bluetooth mượt, không bị ngắt.",
            createdAt: new Date('2026-04-01T08:20:00.000Z').toISOString(),
            isPurchased: true,
            helpfulCount: 9,
            unhelpfulCount: 0
          }
        ];
        setUserReviews(baseReviews);
        localStorage.setItem(`remix_reviews_${product.id}`, JSON.stringify(baseReviews));
      }
    } catch (e) {
      console.error(e);
    }
  }, [product.id, product.category, product.name]);

  const handleHelpfulClick = (reviewId: string, action: 'helpful' | 'unhelpful') => {
    const updated = userReviews.map(rev => {
      if (rev.id === reviewId) {
        if (action === 'helpful') {
          return { ...rev, helpfulCount: (rev.helpfulCount || 0) + 1 };
        } else {
          return { ...rev, unhelpfulCount: (rev.unhelpfulCount || 0) + 1 };
        }
      }
      return rev;
    });
    setUserReviews(updated);
    try {
      localStorage.setItem(`remix_reviews_${product.id}`, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    
    const newRevObj = {
      id: Date.now().toString(),
      name: newReviewName.trim() || currentUsername || 'Khách hàng ẩn danh',
      rating: newReviewRating,
      comment: newReviewText.trim(),
      createdAt: new Date().toISOString(),
      isPurchased: true,
      helpfulCount: 0,
      unhelpfulCount: 0,
      images: Math.random() > 0.4 ? [1, 2, 3] : undefined // random image attachments
    };

    const updated = [newRevObj, ...userReviews];
    setUserReviews(updated);
    try {
      localStorage.setItem(`remix_reviews_${product.id}`, JSON.stringify(updated));
      localStorage.setItem('remix_reviews', JSON.stringify(updated));
      if (currentUsername) {
        addLoyaltyPoints(currentUsername, 5, `Đánh giá sản phẩm: ${product.name}`);
      }
    } catch (err) {
      console.error(err);
    }

    setNewReviewText('');
    setNewReviewRating(5);
  };

  useEffect(() => {
    // Load active branch for context
    try {
      const savedBranches = localStorage.getItem('remix_branches');
      const parsedBranches = savedBranches ? JSON.parse(savedBranches) : [];
      const selectedId = localStorage.getItem('remix_selected_branch_id') || 'Q1';
      const selectedBranchObj = parsedBranches.find((b: any) => b.id === selectedId) || parsedBranches[0];
      if (selectedBranchObj) {
        setBranchName(selectedBranchObj.name);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const inStock = product.id !== 'p5' && product.id !== 'p13';
  const isDiscounted = product.id === 'p1' || product.id === 'p4' || product.id === 'p12' || product.id === 'p15' || product.price < 2000000 || (product.tags && product.tags.includes('sạc'));
  
  // Deterministic mock rating score in range 4.5 - 4.9
  const mockRating = (4.5 + (product.name.length % 5) * 0.1).toFixed(1);
  const reviewsCount = product.reviews || (product.name.length * 7) % 150 + 12;

  // Display original price if discounted
  const originalPrice = isDiscounted ? Math.round(product.price * 1.11) : null;
  const stockCount = (product.name.length % 8) + 2;

  const handleShare = () => {
    setCopiedLink(true);
    navigator.clipboard.writeText(window.location.href);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex-grow flex flex-col p-6 md:p-8 bg-gray-50/30 overflow-y-auto font-sans">
      <div className="max-w-[900px] mx-auto w-full space-y-8">
        
        {/* Navigation back and path */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#185FA5] hover:bg-white px-3.5 py-2 rounded-xl border border-transparent hover:border-gray-100 transition-all shadow-sm bg-white"
          >
            <ArrowLeft size={14} />
            Quay lại danh sách
          </button>

          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium font-mono">
            <span>SẢN PHẨM</span>
            <span>/</span>
            <span className="text-gray-600 font-bold uppercase">{product.category}</span>
            <span>/</span>
            <span className="text-gray-400 font-normal">{product.id}</span>
          </div>
        </div>

        {/* Product detailed layout grid 45/55 columns pattern */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm grid grid-cols-1 md:grid-cols-[45fr_55fr] gap-8 md:gap-10">
          
          {/* Left Column: Product Visual container with Image Gallery and Thumbnails */}
          <div className="space-y-4">
            <div className="w-full aspect-square bg-[#F1F5F9] rounded-xl relative overflow-hidden flex items-center justify-center border border-gray-100/30 shadow-inner">
              <div className={`transition-all duration-300 ${
                activeImgIdx === 1 ? 'rotate-12 scale-[1.05]' : activeImgIdx === 2 ? '-rotate-[15deg] brightness-90' : 'rotate-0'
              }`}>
                {getProductIcon(product.category)}
              </div>

              {/* Promo Badge overlay - góc trên phải */}
              {isDiscounted && (
                <div className="absolute top-4 right-4 bg-[#22C55E] text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 z-20">
                  <BadgePercent size={13} />
                  <span>Đang giảm -10%</span>
                </div>
              )}

              {!isDiscounted && (
                <div className="absolute top-4 right-4 bg-[#EF4444] text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-sm z-20">
                  🔥 HOT
                </div>
              )}

              {/* Stock shortage display */}
              {!inStock && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2 z-10">
                  <AlertTriangle size={32} className="text-[#EF4444]" />
                  <span className="font-black text-[#EF4444] uppercase tracking-widest text-sm">
                    Tạm hết hàng
                  </span>
                </div>
              )}
            </div>

            {/* 3 Thumbnails 60x60px */}
            <div className="flex gap-2.5 justify-center mt-2">
              {[0, 1, 2].map((idx) => {
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImgIdx(idx)}
                    className={`w-[60px] h-[60px] rounded-lg border bg-[#F8FAFC] flex items-center justify-center transition-all ${
                      activeImgIdx === idx 
                        ? 'border-[#185FA5] ring-2 ring-[#185FA5]/10 scale-105 bg-white' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`scale-50 transition-all duration-300 ${
                      idx === 1 ? 'rotate-12' : idx === 2 ? '-rotate-[15deg]' : ''
                    }`}>
                      {getProductIcon(product.category)}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick specifications grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-50 text-left">
                <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 block mb-0.5">Mã thiết bị</span>
                <span className="text-xs font-bold text-gray-700 font-mono">{product.id}</span>
              </div>
              <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-50 text-left">
                <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 block mb-0.5">Danh mục</span>
                <span className="text-xs font-bold text-gray-700">{product.category}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed pricing description */}
          <div className="flex flex-col justify-between text-left space-y-5">
            <div className="space-y-4">
              {/* Breadcrumb */}
              <div className="text-[12px] text-[#94A3B8] font-medium font-sans">
                Trang chủ &gt; <span className="hover:underline cursor-pointer">{product.category}</span> &gt; <span className="text-gray-500 font-semibold">{product.name}</span>
              </div>

              {/* Tên SP */}
              <h1 className="text-[22px] font-bold text-[#1A202C] tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Rating row */}
              <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#64748B] font-medium">
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-100/50 px-2.5 py-1 rounded-xl select-none">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => {
                      const finalRating = product.rating || parseFloat(mockRating);
                      return (
                        <Star 
                          key={s} 
                          size={12} 
                          className={`${s <= Math.round(finalRating) ? 'fill-amber-400 text-amber-500' : 'text-gray-200'} shrink-0`} 
                        />
                      );
                    })}
                  </div>
                  <span className="text-amber-800 font-black ml-1">{(product.rating || parseFloat(mockRating)).toFixed(1)}/5.0</span>
                </div>
                <span>•</span>
                <span className="text-gray-600 font-black hover:underline cursor-pointer">({reviewsCount.toLocaleString()} đánh giá thực tế)</span>
                <span>•</span>
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg border border-blue-100 text-xs font-bold">Đã bán {340 + (product.name.length % 50)} cái</span>
              </div>

              {/* Pricing section with local discount savings badge */}
              <div className="flex flex-wrap items-center gap-3 py-1">
                <span className="text-[26px] font-bold text-[#185FA5] font-sans">
                  {product.price.toLocaleString('vi-VN')}đ
                </span>
                {originalPrice && (
                  <span className="text-[18px] text-[#94A3B8] line-through font-medium font-sans font-normal opacity-80">
                    {originalPrice.toLocaleString('vi-VN')}đ
                  </span>
                )}
                <span className="px-2.5 py-1 bg-[#EAF3DE] text-[#4D7C0F] text-xs font-black rounded-lg">
                  Tiết kiệm {originalPrice ? (originalPrice - product.price).toLocaleString('vi-VN') : (130000).toLocaleString('vi-VN')}đ
                </span>
              </div>

              {/* Tồn kho theo chi nhánh (3 rows nhỏ) */}
              <div className="border border-gray-100 rounded-2xl p-4 bg-[#F8FAFC]/55 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block pb-1 border-b border-gray-100/50">Tình trạng tồn kho theo chi nhánh</span>
                <div className="space-y-1.5 pt-1">
                  {[
                    { name: 'CN Quận 1', stock: inStock ? stockCount : 0 },
                    { name: 'CN Quận 3', stock: inStock ? Math.max(0, stockCount - 4) : 0 },
                    { name: 'CN Thủ Đức', stock: inStock ? Math.max(0, stockCount - 2) : 0 }
                  ].map((branch, index) => {
                    let dotColor = 'bg-red-500';
                    let label = 'Hết hàng';
                    if (branch.stock > 5) {
                      dotColor = 'bg-[#22C55E]';
                      label = `Còn ${branch.stock} cái`;
                    } else if (branch.stock >= 1) {
                      dotColor = 'bg-[#F59E0B]';
                      label = `Còn ${branch.stock} cái`;
                    }

                    return (
                      <div key={index} className="flex items-center gap-2 text-[12px] font-semibold text-gray-700">
                        <span className={`w-2.5 h-2.5 rounded-full inline-block shrink-0 ${dotColor}`} />
                        <span>{branch.name}:</span>
                        <span className={branch.stock > 5 ? 'text-[#22C55E] font-bold' : branch.stock >= 1 ? 'text-[#F59E0B] font-bold' : 'text-red-500 font-bold'}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mô tả ngắn */}
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#185FA5]">Giới thiệu tóm tắt</span>
                <p className="text-[14px] text-[#4A5568] leading-relaxed line-clamp-3">
                  {product.description}
                </p>
              </div>
            </div>

            {/* 2 CTA buttons and Ask AI text link */}
            <div className="space-y-3.5 pt-4 border-t border-gray-100">
              <div className="flex gap-3">
                {/* Yêu thích */}
                <button
                  type="button"
                  onClick={handleHeartClick}
                  className={`w-[48px] h-[48px] flex items-center justify-center rounded-xl border transition-all shrink-0 active:scale-95 ${
                    isFavorite 
                      ? 'bg-rose-50 border-rose-200 text-rose-500' 
                      : 'bg-gray-50 border-gray-150 text-gray-400 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200'
                  }`}
                  title={isFavorite ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
                >
                  <Heart size={20} className={isFavorite ? 'fill-current text-rose-500' : ''} />
                </button>

                {/* Thêm vào giỏ */}
                <button
                  disabled={!inStock}
                  onClick={() => onAddToCart(product)}
                  className="flex-1 h-[48px] border-2 border-[#185FA5] hover:bg-[#185FA5]/5 text-[#185FA5] text-xs font-black uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 disabled:bg-gray-50 disabled:border-gray-200 disabled:text-gray-400 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={14} />
                  <span>Thêm vào giỏ</span>
                </button>

                {/* Đặt ngay */}
                <button
                  disabled={!inStock}
                  onClick={() => {
                    onAddToCart(product);
                    // Open cart directly
                    try {
                      const cartBtn = document.querySelector('[title="Giỏ hàng"]');
                      if (cartBtn) (cartBtn as HTMLButtonElement).click();
                    } catch (e) {}
                  }}
                  className="flex-1 h-[48px] bg-[#185FA5] hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/10 disabled:bg-gray-100 disabled:text-gray-400 active:scale-[0.98]"
                >
                  Đặt ngay
                </button>
              </div>

              {/* Hỏi AI về sản phẩm này text link nhỏ */}
              <div className="text-center">
                <button
                  onClick={() => onAskAI(product.name)}
                  className="text-[12px] font-bold text-[#185FA5] hover:underline transition-all cursor-pointer inline-flex items-center gap-1 bg-transparent border-0 p-0"
                >
                  💬 Hỏi AI về sản phẩm này
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* TAB NAVIGATION COMPONENT FOR SPECS, REVIEWS, SIMILAR PRODUCTS */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6 text-left">
          
          {/* Tab headers panel */}
          <div className="flex border-b border-gray-100 gap-1 overflow-x-auto scrollbar-none pb-px">
            {[
              { id: 'specs', label: 'Thông số kỹ thuật' },
              { id: 'reviews', label: `Đánh giá (${userReviews.length})` },
              { id: 'similar', label: 'Sản phẩm tương tự' }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-3 text-xs uppercase font-extrabold tracking-wider border-b-2 transition-all shrink-0 cursor-pointer ${
                    isActive 
                      ? 'border-[#185FA5] text-[#185FA5]' 
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <AnimatePresence mode="wait">
              {activeTab === 'specs' && (
                <motion.div
                  key="specs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <p className="text-[13px] font-semibold text-gray-600 leading-relaxed bg-[#F8FAFC]/55 p-4 rounded-xl border border-gray-100/30">
                    {product.description}
                  </p>
                  
                  <div className="overflow-hidden border border-gray-100 rounded-2xl bg-white">
                    <table className="min-w-full divide-y divide-gray-100">
                      <tbody className="divide-y divide-gray-100">
                        {parseSpecs(product.specs, product.category).map((spec, i) => (
                          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'}>
                            <td className="px-5 py-3.5 text-xs font-bold text-[#185FA5]/95 w-[220px] bg-gray-50/50">{spec.key}</td>
                            <td className="px-5 py-3.5 text-xs font-semibold text-gray-755">{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    <div className="border border-gray-100/50 rounded-xl p-3 bg-white space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Chế độ bảo hành</span>
                      <span className="text-xs font-extrabold text-[#185FA5]">12 tháng chính hãng lỗi 1 đổi 1</span>
                    </div>
                    <div className="border border-gray-100/50 rounded-xl p-3 bg-white space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Quà tặng đi kèm</span>
                      <span className="text-xs font-extrabold text-[#185FA5]">Cáp sạc cao cấp & Voucher giảm giá 10%</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Reviews Dashboard */}
                  <div className="grid grid-cols-1 md:grid-cols-[1.5fr_2.5fr] gap-6 bg-[#F8FAFC]/55 p-6 rounded-3xl border border-gray-100 items-center">
                    {/* Left stats panel aligned left */}
                    <div className="flex items-center gap-5 p-2 md:border-r border-gray-100/85">
                      <div className="text-[48px] font-bold text-[#1A202C] leading-none tracking-tight">
                        4.8
                      </div>
                      <div className="flex flex-col items-start text-left">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={20} className="fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="text-[14px] text-[#64748B] font-medium mt-1">(124 đánh giá)</span>
                      </div>
                    </div>

                    {/* Breakdown 5 rows */}
                    <div className="space-y-2.5">
                      {[
                        { stars: 5, pct: 68 },
                        { stars: 4, pct: 22 },
                        { stars: 3, pct: 7 },
                        { stars: 2, pct: 2 },
                        { stars: 1, pct: 1 }
                      ].map((row) => (
                        <div key={row.stars} className="flex items-center gap-3 font-sans">
                          <span className="text-xs font-bold text-gray-500 w-9 text-left font-mono whitespace-nowrap">{row.stars} sao</span>
                          <div className="flex-grow h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                            <div 
                              className="h-full bg-[#185FA5] rounded-full transition-all duration-500"
                              style={{ width: `${row.pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-500 font-mono w-8 text-right">{row.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Review items mapping with flex-col gap-[16px] */}
                  <div className="flex flex-col gap-[16px]">
                    {userReviews.map((rev) => (
                      <div key={rev.id} className="bg-white hover:bg-gray-50/20 p-4 md:p-5 border border-gray-100 rounded-2xl shadow-sm transition-all flex flex-col gap-3">
                        {/* Header Container */}
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-center gap-3">
                            {/* Avatar 36px */}
                            <div className="w-[36px] h-[36px] rounded-full bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center font-bold text-sm uppercase shrink-0">
                              {rev.name.substring(0, 1)}
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[14px] font-bold text-[#1A202C]">{rev.name}</span>
                                {rev.isPurchased && (
                                  <span className="text-[10px] font-bold uppercase bg-[#DCFCE7] text-[#15803D] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                    <span>✓</span> Đã mua hàng
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-[#94A3B8] font-medium mt-0.5">
                                {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Rating row: 5 sao nhỏ tương ứng */}
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star 
                              key={s} 
                              size={12} 
                              className={s <= rev.rating ? "fill-yellow-400 text-yellow-400" : "fill-none text-gray-200"} 
                            />
                          ))}
                        </div>

                        {/* Nội dung review: 14px #1A202C, line-height 1.6 */}
                        <p className="text-[14px] text-[#1A202C] leading-[1.6] font-medium whitespace-pre-line">
                          {rev.comment}
                        </p>

                        {/* Ảnh đính kèm (nếu có): 3 thumbnail 60x60px */}
                        {rev.images && rev.images.length > 0 && (
                          <div className="flex gap-2.5 mt-1.5 pb-1">
                            {rev.images.map((_img: any, index: number) => {
                              return (
                                <div 
                                  key={index} 
                                  className="w-[60px] h-[60px] rounded-lg bg-[#F1F5F9] border border-gray-200 relative overflow-hidden flex items-center justify-center shadow-sm cursor-zoom-in hover:opacity-90 group transition-all"
                                >
                                  <div className="scale-50 opacity-50 group-hover:scale-55 transition-transform duration-300">
                                    {getProductIcon(product.category)}
                                  </div>
                                  <span className="absolute bottom-0.5 right-1 bg-black/60 text-white text-[8px] font-semibold px-1 rounded-md font-mono scale-90">
                                    Ảnh {index + 1}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Hữu ích: "Hữu ích không? 👍 12  👎 1" */}
                        <div className="flex items-center gap-2 text-xs text-[#64748B] font-bold border-t border-gray-50/70 pt-3 mt-1.5 font-sans">
                          <span>Hữu ích không?</span>
                          <button
                            type="button"
                            onClick={() => handleHelpfulClick(rev.id, 'helpful')}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 hover:bg-[#E0F2FE]/60 hover:text-[#0369A1] transition-all cursor-pointer font-bold shrink-0 outline-none active:scale-90"
                          >
                            <span>👍</span>
                            <span className="font-mono text-[11px] font-black text-gray-700">{rev.helpfulCount || 0}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleHelpfulClick(rev.id, 'unhelpful')}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer font-bold shrink-0 outline-none active:scale-90"
                          >
                            <span>👎</span>
                            <span className="font-mono text-[11px] font-black text-gray-700">{rev.unhelpfulCount || 0}</span>
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>

                  {/* Form to submit review */}
                  {isLoggedIn && hasPurchased ? (
                    <form onSubmit={handleAddReview} className="p-5 border border-gray-100 rounded-2xl bg-white space-y-4 shadow-sm mt-4 font-sans">
                      <div className="text-[16px] font-bold text-[#1A202C]">
                        Chia sẻ trải nghiệm của bạn
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-bold text-gray-500 block mb-1">Họ tên của bạn</label>
                          <input 
                            type="text" 
                            required
                            value={newReviewName}
                            onChange={(e) => setNewReviewName(e.target.value)}
                            placeholder="Nhập tên hiển thị..."
                            className="w-full text-xs px-3.5 py-2.5 border border-gray-200 focus:border-[#185FA5] outline-none rounded-xl bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-500 block mb-1">Đánh giá chung</label>
                          <div className="flex items-center gap-1.5 h-[38px]">
                            {[1, 2, 3, 4, 5].map((s) => {
                              const isHighlighted = hoverRating !== null ? s <= hoverRating : s <= newReviewRating;
                              return (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => setNewReviewRating(s)}
                                  onMouseEnter={() => setHoverRating(s)}
                                  onMouseLeave={() => setHoverRating(null)}
                                  className="focus:outline-none cursor-pointer scale-100 active:scale-95 transition-transform"
                                >
                                  <Star 
                                    size={22} 
                                    className={`transition-colors duration-150 ${isHighlighted ? "fill-yellow-400 text-yellow-400" : "fill-none text-gray-200"}`} 
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-500 block mb-1 font-sans">Ý kiến đánh giá</label>
                        <textarea 
                          rows={3}
                          required
                          value={newReviewText}
                          onChange={(e) => setNewReviewText(e.target.value)}
                          placeholder="Viết đánh giá của bạn..."
                          className="w-full text-xs px-3.5 py-2.5 border border-gray-200 focus:border-[#185FA5] outline-none rounded-xl bg-white resize-none font-medium min-h-[80px]"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-[#185FA5] hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                          Gửi đánh giá
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="p-5 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50 text-center font-sans mt-4">
                      <p className="text-xs text-gray-500 font-medium">
                        {!isLoggedIn ? (
                          <span>Vui lòng đăng nhập tài khoản của bạn để gửi đánh giá.</span>
                        ) : (
                          <span>Hệ thống chỉ cho phép khách hàng đã mua sản phẩm này gửi đánh giá.</span>
                        )}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'similar' && (
                <motion.div
                  key="similar"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {allProducts.filter(p => p.category === product.category && p.id !== product.id).length === 0 ? (
                    <div className="text-center py-6 text-xs font-semibold text-gray-400">
                      Chưa có sản phẩm cùng danh mục tương tự khác.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {allProducts
                        .filter(p => p.category === product.category && p.id !== product.id)
                        .map(p => {
                          const diff = Math.abs(p.price - product.price);
                          return { product: p, diff };
                        })
                        .sort((a, b) => a.diff - b.diff)
                        .slice(0, 4)
                        .map(x => x.product)
                        .map((p) => {
                          return (
                            <div 
                              key={p.id}
                              onClick={() => onViewDetail?.(p)}
                              className="group border border-gray-100 hover:border-[#185FA5]/70 transition-all duration-300 bg-white rounded-2xl p-3 shadow-sm hover:shadow-md cursor-pointer text-left flex flex-col justify-between h-full hover:-translate-y-0.5"
                            >
                              <div className="space-y-2">
                                <div className="w-full aspect-square bg-[#F1F5F9]/70 rounded-xl flex items-center justify-center p-2 relative overflow-hidden group-hover:bg-[#F1F5F9]">
                                  <div className="scale-75 transition-transform duration-300 group-hover:scale-80">
                                    {getProductIcon(p.category)}
                                  </div>
                                </div>
                                <h4 className="text-[12px] font-bold text-gray-800 line-clamp-2 leading-snug">
                                  {p.name}
                                </h4>
                              </div>
                              <div className="pt-2 border-t border-gray-50/50 mt-3 flex items-center justify-between">
                                <span className="text-[13px] font-black text-[#185FA5]">
                                  {p.price.toLocaleString('vi-VN')}đ
                                </span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase">{p.category}</span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Brand visual recommendation banner / ask AI */}
        <div className="bg-[#E6F1FB] border border-[#B5D4F4] rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div className="flex gap-4 items-start col-span-2">
            <div className="w-12 h-12 bg-[#185FA5] text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/10 mt-1">
              <MessageSquareCode size={22} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-[#0C447C] uppercase tracking-normal">
                Hỏi AI chuyên nghiệp về thiết bị này?
              </h4>
              <p className="text-xs font-medium text-[#185FA5]/85 max-w-xl leading-relaxed">
                Trợ lý AI tinh tường của chúng tôi nắm hoàn chỉnh thông số kỹ thuật, khả năng tương thích và ưu - nhược điểm của <strong>{product.name}</strong>. Chat ngay để được giải đáp tức thì!
              </p>
            </div>
          </div>

          <button
            onClick={() => onAskAI(product.name)}
            className="px-5 py-3 bg-[#185FA5] hover:bg-[#0C447C] text-white text-xs font-extrabold rounded-xl transition-all shadow-md active:scale-95 shrink-0 whitespace-nowrap flex items-center gap-2 group"
          >
            <span>Hỏi AI về sản phẩm này →</span>
          </button>
        </div>

      </div>
    </div>
  );
}
