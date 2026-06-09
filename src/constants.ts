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
    link: 'https://ais.studio/iphone-15-pro-max',
    reviews: 1250,
    rating: 4.9
  },
  {
    id: 'p2',
    name: 'Samsung Galaxy S24 Ultra',
    price: 31990000,
    description: 'Quyền năng AI trong tầm tay. Bút S Pen tích hợp, màn hình 120Hz siêu mượt.',
    imageUrl: 'https://images.unsplash.com/photo-1707246535172-88775466548a?auto=format&fit=crop&q=80&w=400',
    category: 'Điện thoại',
    tags: ['samsung', 'android', 'ai', 'màn hình lớn'],
    link: 'https://ais.studio/samsung-s24-ultra',
    reviews: 980,
    rating: 4.8
  },
  {
    id: 'p3',
    name: 'MacBook Air M3',
    price: 27990000,
    description: 'Siêu mỏng nhẹ, pin cả ngày dài. Hiệu năng vượt trội với chip M3 mới nhất.',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400',
    category: 'Laptop',
    tags: ['apple', 'macbook', 'văn phòng', 'nhẹ'],
    link: 'https://ais.studio/macbook-air-m3',
    reviews: 2100,
    rating: 4.9
  },
  {
    id: 'p16',
    name: 'Dell XPS 13 Plus',
    price: 35990000,
    description: 'Tuyệt tác thiết kế, màn hình OLED vô cực, hiệu năng xử lý tác vụ nặng mượt mà.',
    imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=400',
    category: 'Laptop',
    tags: ['dell', 'xps', 'văn phòng', 'cao cấp'],
    link: 'https://ais.studio/dell-xps-13',
    reviews: 850,
    rating: 4.7
  },
  {
    id: 'p17',
    name: 'ASUS ROG Zephyrus G14',
    price: 32490000,
    description: 'Laptop gaming 14 inch mạnh mẽ nhất, màn hình 120Hz, thiết kế cá tính.',
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=400',
    category: 'Laptop',
    tags: ['asus', 'gaming', 'mạnh mẽ', 'đồ họa'],
    link: 'https://ais.studio/asus-rog-g14',
    reviews: 1100,
    rating: 4.8
  },
  {
    id: 'p4',
    name: 'Sony WH-1000XM5',
    price: 8490000,
    description: 'Khử tiếng ồn đỉnh cao, chất âm trung thực. Thiết kế sang trọng, thoải mái.',
    imageUrl: 'https://images.unsplash.com/photo-1618366712277-13354f028886?auto=format&fit=crop&q=80&w=400',
    category: 'Tai nghe',
    tags: ['sony', 'noise cancelling', 'âm nhạc', 'không dây'],
    link: 'https://ais.studio/sony-wh-1000xm5',
    reviews: 3200,
    rating: 4.9
  },
  {
    id: 'p5',
    name: 'Apple Watch Series 9',
    price: 10490000,
    description: 'Thông minh hơn, sáng hơn, mạnh mẽ hơn. Đồng hành cùng sức khỏe của bạn.',
    imageUrl: 'https://images.unsplash.com/photo-1434493907317-a46b5bc78344?auto=format&fit=crop&q=80&w=400',
    category: 'Đồng hồ',
    tags: ['apple', 'watch', 'sức khỏe', 'thời trang'],
    link: 'https://ais.studio/apple-watch-s9',
    reviews: 1500,
    rating: 4.8
  },
  {
    id: 'p6',
    name: 'Ốp lưng iPhone 15 Silicone MagSafe',
    price: 1290000,
    description: 'Chống trầy xước, hỗ trợ sạc MagSafe tiện lợi.',
    imageUrl: 'https://images.unsplash.com/photo-1603313011101-31c7365a538a?auto=format&fit=crop&q=80&w=400',
    category: 'Phụ kiện',
    tags: ['apple', 'phụ kiện', 'iphone', 'ốp lưng'],
    link: 'https://ais.studio/iphone-case',
    reviews: 450,
    rating: 4.6
  },
  {
    id: 'p7',
    name: 'Sạc Samsung 25W USB-C',
    price: 490000,
    description: 'Công nghệ sạc nhanh, tương thích tốt với các dòng Galaxy.',
    imageUrl: 'https://images.unsplash.com/photo-1616606103915-cbc747d6e4bd?auto=format&fit=crop&q=80&w=400',
    category: 'Phụ kiện',
    tags: ['samsung', 'phụ kiện', 'sạc'],
    link: 'https://ais.studio/samsung-charger',
    reviews: 1200,
    rating: 4.7
  },
  {
    id: 'p8',
    name: 'Dyson V15 Detect',
    price: 18900000,
    description: 'Máy hút bụi không dây mạnh mẽ nhất, tích hợp tia laser phát hiện bụi bẩn.',
    imageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=400',
    category: 'Gia dụng',
    tags: ['dyson', 'hút bụi', 'cao cấp', 'gia đình'],
    link: 'https://ais.studio/dyson-v15',
    reviews: 670,
    rating: 4.8
  },
  {
    id: 'p9',
    name: 'Canon EOS R5',
    price: 89000000,
    description: 'Máy ảnh Mirrorless full-frame chuyên nghiệp, quay phim 8K, lấy nét cực nhanh.',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400',
    category: 'Máy ảnh',
    tags: ['canon', 'mirrorless', 'chuyên nghiệp', 'quay phim'],
    link: 'https://ais.studio/canon-r5',
    reviews: 230,
    rating: 4.9
  },
  {
    id: 'p10',
    name: 'Sony PlayStation 5 Slim',
    price: 12490000,
    description: 'Trải nghiệm chơi game đỉnh cao với ổ cứng SSD siêu tốc và đồ họa 41K chân thực.',
    imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86ebb9474ad?auto=format&fit=crop&q=80&w=400',
    category: 'Gaming',
    tags: ['sony', 'ps5', 'gaming', 'giải trí'],
    link: 'https://ais.studio/ps5-slim',
    reviews: 5600,
    rating: 4.9
  },
  {
    id: 'p11',
    name: 'Nintendo Switch OLED',
    price: 7990000,
    description: 'Màn hình OLED rực rỡ, chơi game mọi lúc mọi nơi cùng bạn bè.',
    imageUrl: 'https://images.unsplash.com/photo-1578303321116-b7be04935406?auto=format&fit=crop&q=80&w=400',
    category: 'Gaming',
    tags: ['nintendo', 'switch', 'gaming', 'di động'],
    link: 'https://ais.studio/nintendo-switch',
    reviews: 8400,
    rating: 4.8
  },
  {
    id: 'p12',
    name: 'Marshall Emberton II',
    price: 3990000,
    description: 'Loa di động biểu tượng, âm thanh 360 độ mạnh mẽ, thời lượng pin lên đến 30h.',
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=400',
    category: 'Âm thanh',
    tags: ['marshall', 'loa', 'vintage', 'di động'],
    link: 'https://ais.studio/marshall-emberton',
    reviews: 1900,
    rating: 4.7
  },
  {
    id: 'p13',
    name: 'Keychron K2V2',
    price: 1850000,
    description: 'Bàn phím cơ không dây layout 75%, đèn LED RGB, gõ phím cực đã cho dân lập trình.',
    imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=400',
    category: 'Phụ kiện',
    tags: ['keychron', 'bàn phím cơ', 'gaming', 'văn phòng'],
    link: 'https://ais.studio/keychron-k2',
    reviews: 3200,
    rating: 4.8
  },
  {
    id: 'p14',
    name: 'Dell UltraSharp U2723QE',
    price: 15490000,
    description: 'Màn hình 4K 27 inch tuyệt phẩm cho đồ họa, độ phủ màu 100% sRGB và Rec709.',
    imageUrl: 'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?auto=format&fit=crop&q=80&w=400',
    category: 'Màn hình',
    tags: ['dell', 'ultrasharp', 'đồ họa', '4k'],
    link: 'https://ais.studio/dell-u2723qe',
    reviews: 580,
    rating: 4.9
  },
  {
    id: 'p15',
    name: 'AirPods Pro Gen 2 (USB-C)',
    price: 5490000,
    description: 'Chống ồn chủ động hiệu quả gấp đôi, tích hợp chip H2 thông minh.',
    imageUrl: 'https://images.unsplash.com/photo-1588423770619-810854bd1f56?auto=format&fit=crop&q=80&w=400',
    category: 'Tai nghe',
    tags: ['apple', 'airpods', 'không dây', 'chống ồn'],
    link: 'https://ais.studio/airpods-pro-2',
    reviews: 4200,
    rating: 4.9
  }
];
