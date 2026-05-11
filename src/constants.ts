import { Product } from './types';

export const STORE_POLICIES = [
  'Đổi trả trong 30 ngày nếu có lỗi từ nhà sản xuất.',
  'Bảo hành chính hãng 12 tháng cho tất cả các thiết bị điện tử.',
  'Miễn phí vận chuyển cho đơn hàng trên 2.000.000đ.',
  'Hỗ trợ trả góp 0% lãi suất qua thẻ tín dụng.',
  'Giao hàng nhanh trong 2h tại nội thành Hà Nội và TP.HCM.'
];

export const KNOWLEDGE_BASE: Product[] = [
  {
    id: 'p1',
    name: 'iPhone 15 Pro Max',
    price: 34990000,
    description: 'Thiết kế Titan bền bỉ, chip A17 Pro mạnh mẽ nhất từ trước đến nay.',
    imageUrl: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=400',
    category: 'Điện thoại',
    tags: ['apple', 'iphone', 'cao cấp', 'chụp ảnh'],
    link: 'https://ais.studio/iphone-15-pro-max'
  },
  {
    id: 'p2',
    name: 'Samsung Galaxy S24 Ultra',
    price: 31990000,
    description: 'Quyền năng AI trong tầm tay. Bút S Pen tích hợp, màn hình 120Hz siêu mượt.',
    imageUrl: 'https://images.unsplash.com/photo-1707246535172-88775466548a?auto=format&fit=crop&q=80&w=400',
    category: 'Điện thoại',
    tags: ['samsung', 'android', 'ai', 'màn hình lớn'],
    link: 'https://ais.studio/samsung-s24-ultra'
  },
  {
    id: 'p3',
    name: 'MacBook Air M3',
    price: 27990000,
    description: 'Siêu mỏng nhẹ, pin cả ngày dài. Hiệu năng vượt trội với chip M3 mới nhất.',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400',
    category: 'Laptop',
    tags: ['apple', 'macbook', 'văn phòng', 'nhẹ'],
    link: 'https://ais.studio/macbook-air-m3'
  },
  {
    id: 'p4',
    name: 'Sony WH-1000XM5',
    price: 8490000,
    description: 'Khử tiếng ồn đỉnh cao, chất âm trung thực. Thiết kế sang trọng, thoải mái.',
    imageUrl: 'https://images.unsplash.com/photo-1618366712277-13354f028886?auto=format&fit=crop&q=80&w=400',
    category: 'Tai nghe',
    tags: ['sony', 'noise cancelling', 'âm nhạc', 'không dây'],
    link: 'https://ais.studio/sony-wh-1000xm5'
  },
  {
    id: 'p5',
    name: 'Apple Watch Series 9',
    price: 10490000,
    description: 'Thông minh hơn, sáng hơn, mạnh mẽ hơn. Đồng hành cùng sức khỏe của bạn.',
    imageUrl: 'https://images.unsplash.com/photo-1434493907317-a46b5bc78344?auto=format&fit=crop&q=80&w=400',
    category: 'Đồng hồ',
    tags: ['apple', 'watch', 'sức khỏe', 'thời trang'],
    link: 'https://ais.studio/apple-watch-s9'
  },
  {
    id: 'p6',
    name: 'Ốp lưng iPhone 15 Silicone MagSafe',
    price: 1290000,
    description: 'Chống trầy xước, hỗ trợ sạc MagSafe tiện lợi.',
    imageUrl: 'https://images.unsplash.com/photo-1603313011101-31c7365a538a?auto=format&fit=crop&q=80&w=400',
    category: 'Phụ kiện',
    tags: ['apple', 'phụ kiện', 'iphone', 'ốp lưng'],
    link: 'https://ais.studio/iphone-case'
  },
  {
    id: 'p7',
    name: 'Sạc Samsung 25W USB-C',
    price: 490000,
    description: 'Công nghệ sạc nhanh, tương thích tốt với các dòng Galaxy.',
    imageUrl: 'https://images.unsplash.com/photo-1616606103915-cbc747d6e4bd?auto=format&fit=crop&q=80&w=400',
    category: 'Phụ kiện',
    tags: ['samsung', 'phụ kiện', 'sạc'],
    link: 'https://ais.studio/samsung-charger'
  }
];
