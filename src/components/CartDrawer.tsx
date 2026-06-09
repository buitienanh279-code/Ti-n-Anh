import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onGoToConsult: () => void;
  onCheckout?: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onGoToConsult,
  onCheckout
}: CartDrawerProps) {
  const [isMobile, setIsMobile] = React.useState(typeof window !== 'undefined' ? window.innerWidth < 768 : true);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      alert(`Cảm ơn quý khách! Đơn hàng trị giá ${totalPrice.toLocaleString('vi-VN')}đ đang được hệ thống xử lý. REMIX.AI đã ghi nhận thông tin.`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop screen */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[90]"
          />

          {/* Slding Cartesian panel */}
          <motion.div
            initial={isMobile ? { y: '100%', x: 0 } : { x: '100%', y: 0 }}
            animate={{ x: 0, y: 0 }}
            exit={isMobile ? { y: '100%', x: 0 } : { x: '100%', y: 0 }}
            transition={
              isMobile 
                ? { duration: 0.3, ease: [0.32, 0.72, 0, 1] }
                : { type: 'spring', damping: 25, stiffness: 200 }
            }
            className={`fixed bg-white shadow-2xl z-[100] flex flex-col font-sans text-gray-900 border-gray-100 ${
              isMobile 
                ? 'bottom-0 left-0 right-0 top-auto w-full max-w-none h-[82dvh] rounded-t-[2.5rem] border-t border-x' 
                : 'right-0 top-0 bottom-0 w-full max-w-[360px] h-full border-l'
            }`}
          >
            {isMobile && (
              <div className="w-full flex justify-center py-3 shrink-0">
                <div className="w-[36px] h-[4px] bg-gray-300 rounded-full" />
              </div>
            )}
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-[#0C447C]" />
                <h3 className="font-bold text-base text-gray-900">Giỏ hàng</h3>
                {totalItemCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {totalItemCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-16 h-16 bg-blue-50 text-[#0C447C] rounded-full flex items-center justify-center">
                    <ShoppingCart size={32} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-base mb-1">Giỏ hàng trống</h4>
                    <p className="text-gray-500 text-xs leading-relaxed max-w-[200px] mx-auto">
                      Hãy tìm kiếm sản phẩm công nghệ hoàn hảo qua trợ lý ảo của chúng tôi!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onGoToConsult();
                    }}
                    className="px-5 py-2 bg-[#0C447C] hover:bg-[#185FA5] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-900/10 active:scale-95"
                  >
                    Tư vấn ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100/50 transition-colors relative group"
                    >
                      <div className="w-12 h-12 bg-white rounded-lg border border-gray-100 flex items-center justify-center p-1 shrink-0">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="max-w-full max-h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="flex-grow min-w-0 pr-6">
                        <h4 className="font-bold text-xs text-gray-900 truncate mb-0.5">
                          {item.product.name}
                        </h4>
                        <p className="text-[#0C447C] font-black text-xs tracking-tight mb-2">
                          {item.product.price.toLocaleString('vi-VN')}đ
                        </p>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, -1)}
                            className="w-5 h-5 bg-white border border-gray-200 text-gray-500 rounded flex items-center justify-center hover:bg-gray-100 active:scale-90 transition-all"
                            title="Giảm số lượng"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, 1)}
                            className="w-5 h-5 bg-white border border-gray-200 text-gray-500 rounded flex items-center justify-center hover:bg-gray-100 active:scale-90 transition-all"
                            title="Tăng số lượng"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="absolute right-2.5 top-2.5 text-gray-400 hover:text-red-500 p-1 rounded-md transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 space-y-3">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-gray-500 font-medium">Tổng tiền:</span>
                  <span className="text-[#0C447C] text-lg font-black tracking-tight">
                    {totalPrice.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full h-11 bg-[#0C447C] hover:bg-[#185FA5] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-900/15 flex items-center justify-center gap-2"
                  title="Đặt hàng ngay sản phẩm này"
                >
                  Thanh toán
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
