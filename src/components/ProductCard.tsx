import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Tag, Heart, ArrowRight, Star } from 'lucide-react';
import { Product } from '../types';
import { getCurrentUser, updateCurrentUser } from '../utils/accounts';

interface ProductCardProps {
  product: Product;
  isInline?: boolean;
  isBestMatch?: boolean;
  onAddToCart?: (product: Product) => void;
  onViewDetail?: (product: Product) => void;
}

export default function ProductCard({ 
  product, 
  isInline = false, 
  isBestMatch = false,
  onAddToCart,
  onViewDetail
}: ProductCardProps) {
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

  if (isInline) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-white border-subtle rounded-2xl p-3 hover:border-[#002147] transition-all flex items-center gap-3 group w-full relative ${
          isBestMatch ? 'border-l-[2px] border-l-[#002147]' : ''
        }`}
      >
        {isBestMatch && (
          <div className="absolute -top-2 -right-2 bg-[#E6F1FB] text-primary text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-primary/20 z-10">
            Gợi ý tốt nhất
          </div>
        )}
        <div className="w-10 h-10 bg-gray-50/50 rounded-[6px] flex-shrink-0 flex items-center justify-center p-1">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="max-w-full max-h-full object-contain transition-transform group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="font-bold text-[12px] text-black line-clamp-1 leading-tight mb-0.5">{product.name}</h3>
          <p className="text-[11px] text-black line-clamp-1 mb-1 font-semibold">{product.description}</p>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-black text-[#002147] tracking-tight">
              {product.price.toLocaleString('vi-VN')}
              <span className="text-[12px] ml-0.5 opacity-60 uppercase font-black">đ</span>
            </span>
            {product.rating && (
              <div className="flex items-center gap-1 ml-auto bg-amber-50 border border-amber-100/50 px-1.5 py-0.5 rounded-md select-none shrink-0">
                 <Star size={10} className="fill-amber-400 text-amber-500 shrink-0" />
                 <span className="text-[9px] font-bold text-amber-800 leading-none">{product.rating.toFixed(1)}</span>
                 {product.reviews && (
                   <span className="text-[8px] text-gray-400 font-medium leading-none">({product.reviews})</span>
                 )}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-1 shrink-0 items-center">
          <button 
            type="button"
            onClick={handleHeartClick}
            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border transition-all active:scale-90 ${
              isFavorite 
                ? 'bg-rose-50 border-rose-100 text-rose-500' 
                : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100'
            }`}
            title={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
          >
            <Heart size={14} className={isFavorite ? 'fill-current text-rose-500' : ''} />
          </button>

          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.(product);
            }}
            className="flex-shrink-0 flex items-center justify-center px-2 py-1 bg-[#185FA5] text-white rounded-lg text-[10px] sm:text-[11px] font-bold uppercase transition-all active:scale-95 whitespace-nowrap"
            title="Thêm sản phẩm này vào giỏ hàng"
          >
            Thêm vào giỏ
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onViewDetail) {
                onViewDetail(product);
              }
            }}
            className="flex-shrink-0 flex items-center justify-center px-2 py-1 bg-[#E6F1FB] text-primary border-[0.5px] border-primary/30 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-primary/10 transition-all active:scale-95 whitespace-nowrap text-center cursor-pointer"
            title="Xem chi tiết sản phẩm"
          >
            Chi tiết
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border-subtle rounded-3xl overflow-hidden hover:border-[#002147] transition-all flex flex-col h-full group"
      id={`product-${product.id}`}
    >
      <div className="relative h-48 overflow-hidden bg-gray-50/50">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4">
          <div className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-xl text-[12px] font-black text-gray-500 border-subtle uppercase tracking-[0.2em]">
            {product.category}
          </div>
        </div>
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <div className="mb-3">
          <h3 className="font-bold text-[14px] text-gray-900 leading-snug group-hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
          <div className="flex items-center justify-between mt-2">
             <p className="text-[12px] text-gray-400 font-bold uppercase tracking-widest italic leading-none">ID: {product.id}</p>
             <div className="flex items-center gap-1.5 bg-amber-50/60 border border-amber-100/40 px-2.5 py-1 rounded-xl select-none shrink-0">
               <div className="flex gap-0.5">
                 {[1, 2, 3, 4, 5].map(i => (
                   <Star 
                     key={i} 
                     size={11} 
                     className={`${i <= Math.round(product.rating || 5) ? 'fill-amber-400 text-amber-500' : 'text-gray-200'} shrink-0`} 
                   />
                 ))}
               </div>
               <span className="text-[11px] font-black text-amber-800 leading-none">{(product.rating || 5.0).toFixed(1)}</span>
               {product.reviews && (
                 <span className="text-[10px] text-gray-400 font-semibold leading-none">
                   ({product.reviews.toLocaleString()})
                 </span>
               )}
             </div>
          </div>
        </div>
        <p className="text-[14px] text-black font-semibold line-clamp-2 leading-relaxed mb-6 flex-grow">{product.description}</p>
        
        <div className="flex items-center justify-between pt-5 border-t border-gray-50 mt-auto">
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] text-black font-black uppercase tracking-widest">Premium Price</span>
            <span className="text-lg font-black text-gray-900 tracking-tighter">
              {product.price.toLocaleString('vi-VN')}
              <span className="text-[12px] ml-1 text-gray-400 uppercase font-black">vnd</span>
            </span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleHeartClick}
              className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all border-subtle group/heart ${
                isFavorite 
                  ? 'bg-red-50 text-red-500 border-red-100' 
                  : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500'
              }`}
              title={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
            >
              <Heart size={18} className={isFavorite ? 'fill-current text-red-500' : 'group-hover/heart:fill-current'} />
            </button>
            <button 
              onClick={() => onAddToCart?.(product)}
              className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-2xl hover:bg-primary-dark transition-all active:scale-90"
              title="Thêm vào giỏ hàng"
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
