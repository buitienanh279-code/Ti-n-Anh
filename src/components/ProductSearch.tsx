import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, SlidersHorizontal, ArrowUpDown, ChevronDown, RefreshCw, AlertCircle, Sparkles,
  Headphones, Laptop, Smartphone, Watch, Usb, Package, ShoppingCart, Star, X, Heart
} from 'lucide-react';
import { Product } from '../types';
import { KNOWLEDGE_BASE } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { getCurrentUser, updateCurrentUser } from '../utils/accounts';

// Get matching visual icon for category
const getProductIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('tai nghe') || cat.includes('âm thanh')) return <Headphones size={40} className="text-[#94A3B8]" />;
  if (cat.includes('laptop') || cat.includes('màn hình')) return <Laptop size={40} className="text-[#94A3B8]" />;
  if (cat.includes('điện thoại') || cat.includes('smartphone')) return <Smartphone size={40} className="text-[#94A3B8]" />;
  if (cat.includes('đồng hồ') || cat.includes('smartwatch') || cat.includes('watch')) return <Watch size={40} className="text-[#94A3B8]" />;
  if (cat.includes('phụ kiện') || cat.includes('sạc') || cat.includes('usb')) return <Usb size={40} className="text-[#94A3B8]" />;
  return <Package size={40} className="text-[#94A3B8]" />;
};

interface ProductSearchProps {
  onAddToCart: (product: Product) => void;
  onGoToConsult: () => void;
  onViewDetail: (product: Product) => void;
}

export default function ProductSearch({ onAddToCart, onGoToConsult, onViewDetail }: ProductSearchProps) {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Helper helper to filter tones
  const removeVietnameseTones = (str: string): string => {
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
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");
    str = str.replace(/\u02C6|\u0306|\u031B/g, "");
    return str;
  };

  // Predictive search states
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);

  // Auto-trigger open/close
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length >= 2) {
      setAutocompleteOpen(true);
      setActiveSuggestionIndex(0);
    } else {
      setAutocompleteOpen(false);
    }
  }, [searchQuery]);

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
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return [];
    
    const query = searchQuery.toLowerCase().trim();
    const queryUnaccented = removeVietnameseTones(query);
    
    return products.filter(p => {
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
    }).slice(0, 5); // Limit limit to 5
  };

  const getProductClassIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('tai nghe') || cat.includes('âm thanh')) return <Headphones size={15} className="text-blue-500 shrink-0" />;
    if (cat.includes('laptop') || cat.includes('màn hình')) return <Laptop size={15} className="text-indigo-500 shrink-0" />;
    if (cat.includes('điện thoại') || cat.includes('smartphone')) return <Smartphone size={15} className="text-emerald-500 shrink-0" />;
    if (cat.includes('đồng hồ') || cat.includes('smartwatch') || cat.includes('watch')) return <Watch size={15} className="text-purple-500 shrink-0" />;
    return <Package size={15} className="text-amber-500 shrink-0" />;
  };

  const selectSuggestion = (product: Product) => {
    setSearchQuery(product.name);
    setAutocompleteOpen(false);
  };
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under1m' | '1to3m' | '3to5m' | 'over5m'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'instock' | 'discounted'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'bestseller'>('newest');
  const [branchName, setBranchName] = useState('Chi nhánh Quận 1');
  const [detailedProduct, setDetailedProduct] = useState<Product | null>(null);

  const [favoritesList, setFavoritesList] = useState<string[]>([]);

  const loadFavorites = () => {
    const user = getCurrentUser();
    const list = user?.favorites?.map((p: any) => p.id) || [];
    setFavoritesList(list);
  };

  useEffect(() => {
    loadFavorites();
    window.addEventListener('storage', loadFavorites);
    return () => window.removeEventListener('storage', loadFavorites);
  }, []);

  const handleToggleFavorite = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    const currentFavs = currentUser.favorites || [];
    const isFav = currentFavs.some((f: any) => f.id === product.id);
    let updated;
    if (isFav) {
      updated = currentFavs.filter((f: any) => f.id !== product.id);
    } else {
      updated = [...currentFavs, product];
    }
    updateCurrentUser({ favorites: updated });
    loadFavorites();
    window.dispatchEvent(new Event('storage'));
  };

  // Load products from localStorage or fallback to KNOWLEDGE_BASE
  useEffect(() => {
    const loadProducts = () => {
      try {
        const saved = localStorage.getItem('remix_products');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(parsed);
            return;
          }
        }
      } catch (e) {
        console.error('Failed to parse remix_products', e);
      }
      setProducts(KNOWLEDGE_BASE);
    };

    loadProducts();

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

  useEffect(() => {
    const handleSetSearch = (e: Event) => {
      const customEvent = e as CustomEvent<{ category: string; query: string }>;
      if (customEvent.detail) {
        if (customEvent.detail.category !== undefined) {
          setSelectedCategory(customEvent.detail.category);
        }
        if (customEvent.detail.query !== undefined) {
          setSearchQuery(customEvent.detail.query);
        }
      }
    };
    window.addEventListener('remix_trigger_banner_search', handleSetSearch);
    return () => window.removeEventListener('remix_trigger_banner_search', handleSetSearch);
  }, []);

  const categoryOptions = ['Tất cả', 'Tai nghe', 'Laptop', 'Điện thoại', 'Smartwatch', 'Phụ kiện'];

  // Filter and Sort logic
  const filteredProducts = products
    .filter(product => {
      // Search query match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.id.toLowerCase().includes(query) ||
        (product.tags && product.tags.some(t => t.toLowerCase().includes(query)));

      // Category filter matching
      let matchesCategory = true;
      if (selectedCategory !== 'Tất cả') {
        if (selectedCategory === 'Tai nghe') {
          matchesCategory = product.category === 'Tai nghe' || product.category === 'Âm thanh';
        } else if (selectedCategory === 'Laptop') {
          matchesCategory = product.category === 'Laptop' || product.category === 'Màn hình';
        } else if (selectedCategory === 'Smartwatch') {
          matchesCategory = product.category === 'Đồng hồ' || product.category === 'Smartwatch';
        } else {
          matchesCategory = product.category === selectedCategory;
        }
      }

      // Price filter
      let matchesPrice = true;
      if (priceFilter === 'under1m') {
        matchesPrice = product.price < 1000000;
      } else if (priceFilter === '1to3m') {
        matchesPrice = product.price >= 1000000 && product.price <= 3000000;
      } else if (priceFilter === '3to5m') {
        matchesPrice = product.price >= 3000000 && product.price <= 5000000;
      } else if (priceFilter === 'over5m') {
        matchesPrice = product.price > 5000000;
      }

      // Status filter
      const inStock = product.id !== 'p5' && product.id !== 'p13';
      const isDiscounted = product.id === 'p1' || product.id === 'p4' || product.id === 'p12' || product.id === 'p15' || product.price < 2000000 || (product.tags && product.tags.includes('sạc'));
      
      let matchesStatus = true;
      if (statusFilter === 'instock') {
        matchesStatus = inStock;
      } else if (statusFilter === 'discounted') {
        matchesStatus = isDiscounted;
      }

      return matchesSearch && matchesCategory && matchesPrice && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'bestseller') return (b.reviews || 0) - (a.reviews || 0);
      
      // Default / Mới nhất (by ID extraction/descending tag)
      const getNum = (id: string) => parseInt(id.replace(/\D/g, '')) || 0;
      return getNum(b.id) - getNum(a.id);
    });

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Tất cả');
    setPriceFilter('all');
    setStatusFilter('all');
    setSortBy('newest');
  };

  return (
    <div className="flex-grow flex flex-col p-6 md:p-8 bg-gray-50/30 overflow-y-auto font-sans">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-1 rounded-full bg-[#E6F1FB] text-[#185FA5] text-[10px] font-black uppercase tracking-wider">
                Mua Sắm Khách Hàng
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-gray-400 font-mono">
                📍 {branchName}
              </span>
            </div>
            <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">
              Tìm sản phẩm
            </h1>
            <p className="text-xs font-semibold text-gray-400 mt-1">
              Tra cứu danh mục sản phẩm chính hãng, cập nhật giá và tồn kho thực tế.
            </p>
          </div>

          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-3.5 py-1.5 border border-gray-200 hover:border-blue-200 hover:text-[#185FA5] rounded-xl text-xs font-bold transition-all bg-white shadow-sm"
            title="Thiết lập lại bộ lọc tìm kiếm"
          >
            <RefreshCw size={13} />
            Đặt lại bộ lọc
          </button>
        </div>

        {/* Toolbar & Filter Controls */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
          <div className="flex flex-col gap-4">
            {/* Search Input */}
            <div className="relative w-full" ref={autocompleteContainerRef}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
              <input
                type="text"
                placeholder="Tìm tai nghe, laptop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                  }
                }}
                className="w-full h-[48px] pl-11 pr-4 bg-gray-50/50 rounded-[10px] border border-gray-100 text-xs font-semibold placeholder:text-gray-400 focus:outline-none focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-[#185FA5]/5 transition-all text-gray-800"
              />

              <AnimatePresence>
                {autocompleteOpen && getSuggestions().length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2 left-0 right-0 max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col divide-y divide-gray-100"
                  >
                    <div className="px-3.5 py-1.5 bg-gray-50/80 text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between">
                      <span>Gợi ý tìm kiếm nhanh ({getSuggestions().length})</span>
                      <span className="text-[9px] font-medium font-mono text-gray-400 lowercase">↑↓ để chọn · enter để hoàn tất</span>
                    </div>
                    {getSuggestions().map((p, idx) => {
                      const isActive = idx === activeSuggestionIndex;
                      return (
                        <div
                          key={p.id}
                          onClick={() => selectSuggestion(p)}
                          onMouseEnter={() => setActiveSuggestionIndex(idx)}
                          className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                            isActive 
                              ? 'bg-[#185FA5]/5 text-[#185FA5]' 
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pointer-events-none">
                            {getProductClassIcon(p.category)}
                            <div className="flex flex-col text-left min-w-0">
                              <span className="text-xs font-bold truncate pr-2">
                                {p.name}
                              </span>
                              <span className="text-[10px] text-gray-400 font-semibold mt-0.5">
                                {p.category}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 pointer-events-none">
                            <span className="text-xs font-bold text-[#185FA5] font-sans">
                              {p.price.toLocaleString('vi-VN')}đ
                            </span>
                            <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-400 font-bold uppercase scale-90">
                              Lọc
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Thẻ gợi ý lọc nhanh (Quick Suggestion Tags) */}
            <div className="flex flex-wrap items-center gap-2.5 py-1">
              <span className="text-[11px] text-gray-400 font-black uppercase tracking-wider select-none">Từ khóa gợi ý:</span>
              {[
                { name: 'Laptop', label: '💻 Laptop' },
                { name: 'Điện thoại', label: '📱 Điện thoại' },
                { name: 'Phụ kiện', label: '🔌 Phụ kiện' },
                { name: 'Tai nghe', label: '🎧 Tai nghe' },
                { name: 'Smartwatch', label: '⌚ Smartwatch' }
              ].map((tag) => {
                const isSelected = selectedCategory === tag.name;
                return (
                  <button
                    key={tag.name}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedCategory('Tất cả');
                      } else {
                        setSelectedCategory(tag.name);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95 flex items-center gap-1.5 border ${
                      isSelected 
                        ? 'bg-[#EA580C] text-white border-transparent shadow-sm'
                        : 'bg-amber-50/60 text-[#D97706] border-amber-500/20 hover:bg-amber-100/50 hover:border-amber-500/40'
                    }`}
                  >
                    <span>{tag.label}</span>
                  </button>
                );
              })}
            </div>

            {/* BỘ LỌC (filter bar, flex wrap, gap 8px) */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Category Buttons Toggle */}
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                        isActive
                          ? 'bg-[#185FA5] text-white border-transparent shadow-sm'
                          : 'border-[#E2E8F0] text-black bg-white hover:bg-gray-50'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Price Filter Dropdown */}
              <div className="relative min-w-[130px]">
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value as any)}
                  className="appearance-none w-full pl-3 pr-8 py-1.5 bg-white rounded-xl border border-[#E2E8F0] text-xs font-bold text-black focus:outline-none focus:border-blue-200 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <option value="all">Khoảng giá: Tất cả</option>
                  <option value="under1m">Dưới 1 triệu</option>
                  <option value="1to3m">1 – 3 triệu</option>
                  <option value="3to5m">3 – 5 triệu</option>
                  <option value="over5m">Trên 5 triệu</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
              </div>

              {/* Status Filter Dropdown */}
              <div className="relative min-w-[120px]">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="appearance-none w-full pl-3 pr-8 py-1.5 bg-white rounded-xl border border-[#E2E8F0] text-xs font-bold text-black focus:outline-none focus:border-blue-200 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <option value="all">Trạng thái: Tất cả</option>
                  <option value="instock">Còn hàng</option>
                  <option value="discounted">Đang giảm giá</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
              </div>

              {/* Sort Dropdown */}
              <div className="relative min-w-[130px]">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none w-full pl-3 pr-8 py-1.5 bg-white rounded-xl border border-[#E2E8F0] text-xs font-bold text-black focus:outline-none focus:border-blue-200 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <option value="newest">Sắp xếp: Mới nhất</option>
                  <option value="price-asc">Giá thấp → cao</option>
                  <option value="price-desc">Giá cao → thấp</option>
                  <option value="bestseller">Bán chạy nhất</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
              </div>
            </div>

          </div>
        </div>

        {/* Counter Results Label */}
        <div className="text-left">
          <p className="text-xs font-bold text-gray-500">
            Tìm thấy <span className="text-[#185FA5] font-black">{filteredProducts.length}</span> sản phẩm
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[14px]">
          <AnimatePresence>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => {
                const inStock = product.id !== 'p5' && product.id !== 'p13';
                const isDiscounted = product.id === 'p1' || product.id === 'p4' || product.id === 'p12' || product.id === 'p15' || product.price < 2000000 || (product.tags && product.tags.includes('sạc'));
                
                // Deterministic mock rating score in range 4.5 - 4.9
                const mockRating = (4.5 + (product.name.length % 5) * 0.1).toFixed(1);

                // Alternating promo badge
                const promoText = isDiscounted ? "-10%" : "HOT";
                const promoBadgeColor = isDiscounted ? "bg-[#22C55E]" : "bg-[#EF4444]";

                // Display original price if discounted
                const originalPrice = isDiscounted ? Math.round(product.price * 1.11) : null;
                const stockCount = (product.name.length % 8) + 2;

                return (
                  <div 
                    key={product.id} 
                    className="group border border-gray-100 hover:border-[#185FA5] hover:-translate-y-0.5 transition-all duration-300 bg-white rounded-xl p-3 relative flex flex-col justify-between h-full shadow-sm animate-card-in"
                    style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
                  >
                    {/* Badge góc trái */}
                    <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1">
                      <span className={`text-[9px] font-black tracking-wide uppercase px-1.5 py-0.5 rounded-md text-white ${promoBadgeColor}`}>
                        {promoText}
                      </span>
                    </div>

                    {/* Nút yêu thích góc phải */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(product, e)}
                      className={`absolute top-2.5 right-2.5 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-xs border transition-all active:scale-90 ${
                        favoritesList.includes(product.id)
                          ? 'border-rose-100 text-rose-500'
                          : 'border-gray-100 text-gray-400 hover:text-rose-500 hover:border-rose-100'
                      }`}
                      title={favoritesList.includes(product.id) ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                    >
                      <Heart size={14} className={favoritesList.includes(product.id) ? 'fill-current text-rose-500' : ''} />
                    </button>

                    {/* Image Placeholder */}
                    <div className="w-full aspect-[4/3] bg-[#F1F5F9] rounded-[10px] relative overflow-hidden flex items-center justify-center shrink-0 mb-3 border border-gray-100/30">
                      {getProductIcon(product.category)}

                      {/* Overly Hết Hàng */}
                      {!inStock && (
                        <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] flex items-center justify-center font-bold text-[#EF4444] uppercase tracking-wider text-[11px] z-10 font-sans">
                          Hết hàng
                        </div>
                      )}
                    </div>

                    {/* Content Body */}
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        {/* Title */}
                        <h3 className="text-[13px] font-bold text-[#1A202C] line-clamp-2 h-[38px] leading-tight text-left mb-1 overflow-hidden" title={product.name}>
                          {product.name}
                        </h3>

                        {/* Rating block */}
                        <div className="flex items-center gap-0.5 my-1 justify-start font-sans">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star 
                              key={s} 
                              size={11} 
                              className={`${s <= Math.round(product.rating || parseFloat(mockRating)) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} shrink-0`} 
                            />
                          ))}
                          <span className="text-[11px] font-bold text-gray-800 ml-1.5 leading-none">
                            {product.rating ? product.rating.toFixed(1) : mockRating}
                          </span>
                          <span className="text-[11px] text-[#94A3B8] font-bold leading-none ml-1">
                            ({(product.reviews || (124 + (product.name.length % 15) * 8)).toLocaleString()})
                          </span>
                        </div>

                        {/* Prices */}
                        <div className="flex items-baseline gap-1 mt-1 justify-start">
                          <span className="text-[14px] font-bold text-[#185FA5] font-sans">
                            {product.price.toLocaleString('vi-VN')}đ
                          </span>
                          {originalPrice && (
                            <span className="text-[11px] text-gray-400 line-through font-medium ml-1.5 font-sans">
                              {originalPrice.toLocaleString('vi-VN')}đ
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Warehouse and Branch Info */}
                      <div>
                        <p className="text-[11px] font-medium text-gray-400 text-left mt-2.5 flex items-center gap-1 flex-wrap">
                          <span className="truncate max-w-[110px]">📍 {branchName}</span>
                          <span className="text-gray-300">•</span>
                          {inStock ? (
                            <span className="text-[#22C55E] font-black font-sans">Còn {stockCount} cái</span>
                          ) : (
                            <span className="text-[#EF4444] font-black font-sans">Hết hàng</span>
                          )}
                        </p>

                        {/* 2 Buttons */}
                        <div className="flex gap-2.5 mt-3 pt-3 border-t border-gray-50/80">
                          <button 
                            onClick={() => onViewDetail(product)}
                            className="flex-grow py-1.5 border border-[#185FA5]/30 hover:border-[#185FA5] hover:bg-[#185FA5]/5 text-[#185FA5] text-xs font-bold rounded-lg transition-colors whitespace-nowrap active:scale-[0.98]"
                          >
                            Xem chi tiết
                          </button>
                          
                          <button 
                            onClick={() => inStock && onAddToCart(product)} 
                            disabled={!inStock} 
                            className="w-[40px] h-[36px] flex items-center justify-center bg-[#185FA5] hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-lg shrink-0 transition-all active:scale-90" 
                            title="Thêm sản phẩm này vào giỏ hàng"
                          >
                            <ShoppingCart size={15} />
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="col-span-full bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-4 shadow-sm">
                <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto">
                  <AlertCircle size={28} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">
                    Không tìm thấy sản phẩm phù hợp
                  </h3>
                  <p className="text-xs font-semibold text-gray-400 max-w-sm mx-auto leading-relaxed">
                    Vui lòng đổi từ khóa, chọn lại danh mục hoặc đặt lại bộ lọc nâng cao để tìm kiếm lại.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 bg-[#185FA5] text-white text-xs font-bold rounded-2xl shadow-md hover:bg-blue-700 active:scale-95 transition-all"
                >
                  Thiết lập lại tìm kiếm
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Detailed Product Modal Specification */}
        <AnimatePresence>
          {detailedProduct && (
            <div className={`fixed inset-0 z-50 flex justify-center bg-black/60 backdrop-blur-sm ${
              isMobile ? 'items-end p-0' : 'items-center p-4'
            }`}>
              <motion.div 
                initial={isMobile ? { y: '100%', opacity: 1 } : { opacity: 0, scale: 0.95, y: 10 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={isMobile ? { y: '100%', opacity: 1 } : { opacity: 0, scale: 0.95, y: 10 }}
                transition={
                  isMobile 
                    ? { duration: 0.3, ease: [0.32, 0.72, 0, 1] } 
                    : { duration: 0.2 }
                }
                className={`bg-white w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col font-sans ${
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
                {/* Header detail */}
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <div>
                    <span className="px-2 py-0.5 bg-[#E6F1FB] text-[#185FA5] text-[10px] font-black uppercase tracking-wider rounded-md">
                      {detailedProduct.category}
                    </span>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mt-1 font-mono">
                      PRODUCT ID: {detailedProduct.id}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setDetailedProduct(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 border border-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Body detail */}
                <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                  {/* Aspect Ratio Box Image */}
                  <div className="w-full aspect-[4/3] bg-[#F1F5F9] rounded-2xl border border-gray-100 flex items-center justify-center">
                    {getProductIcon(detailedProduct.category)}
                  </div>

                  <div className="space-y-2 text-left">
                    <h2 className="text-lg font-black text-gray-900 leading-snug">
                      {detailedProduct.name}
                    </h2>
                    
                    {/* Stock status detail */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-500">📍 Trưng bày tại: {branchName}</span>
                      <span className="text-gray-300">|</span>
                      {detailedProduct.id !== 'p5' && detailedProduct.id !== 'p13' ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-[#22C55E] text-[10px] font-black rounded border border-emerald-100 uppercase">Còn hàng ({ (detailedProduct.name.length % 8) + 2 } chiếc)</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-red-50 text-[#EF4444] text-[10px] font-black rounded border border-red-100 uppercase">Hết hàng</span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 text-left">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Mô tả chi tiết sản phẩm
                    </span>
                    <p className="text-xs font-medium text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100/50">
                      {detailedProduct.description}
                    </p>
                  </div>

                  {/* Rating scores */}
                  <div className="flex items-center gap-2 bg-amber-50/50 border border-amber-100/30 p-3 rounded-xl justify-between">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={13} className="fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-xs font-black text-gray-700 ml-1">{(4.5 + (detailedProduct.name.length % 5) * 0.1).toFixed(1)} / 5.0</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">{detailedProduct.reviews || 48} lượt đánh giá thực tế</span>
                  </div>

                  {/* Interactive specifications list if tags exist */}
                  {detailedProduct.tags && detailedProduct.tags.length > 0 && (
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Từ khóa sản phẩm</span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {detailedProduct.tags.map(t => (
                          <span key={t} className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer buttons */}
                <div className="p-6 border-t border-gray-100 flex gap-3 justify-end bg-gray-50/30">
                  <button 
                    onClick={() => setDetailedProduct(null)}
                    className="px-4 py-2 border border-gray-200 text-gray-500 hover:text-gray-700 bg-white text-xs font-bold rounded-xl active:scale-95 transition-all"
                  >
                    Đóng cửa sổ
                  </button>
                  <button 
                    disabled={detailedProduct.id === 'p5' || detailedProduct.id === 'p13'}
                    onClick={() => {
                      onAddToCart(detailedProduct);
                      setDetailedProduct(null);
                    }}
                    className="px-5 py-2 bg-[#185FA5] hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 text-white text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center gap-2"
                  >
                    <ShoppingCart size={13} />
                    <span>Thêm vào giỏ ({detailedProduct.price.toLocaleString('vi-VN')}đ)</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Ask AI Button */}
        <div className="flex justify-center pt-8 pb-4">
          <button
            onClick={onGoToConsult}
            className="px-6 py-3 bg-[#185FA5] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-[0.97] flex items-center gap-2"
          >
            <span>Hỏi AI về sản phẩm này →</span>
          </button>
        </div>

      </div>
    </div>
  );
}
