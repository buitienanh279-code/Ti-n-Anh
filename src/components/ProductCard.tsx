import { motion } from 'motion/react';
import { ShoppingCart, Tag } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  key?: string | number;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
      id={`product-${product.id}`}
    >
      <div className="relative h-32 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-[10px] font-bold text-gray-800 border border-gray-100 uppercase tracking-wider">
          {product.category}
        </div>
      </div>
      <div className="p-3 flex-grow flex flex-col">
        <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-2 flex-grow">{product.description}</p>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
          <span className="text-sm font-bold text-blue-600 italic">
            {product.price.toLocaleString('vi-VN')}đ
          </span>
          <div className="flex gap-2">
            <a 
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Mua ngay"
            >
              <Tag size={14} />
            </a>
            <button 
              className="p-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              title="Thêm vào giỏ hàng"
            >
              <ShoppingCart size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
