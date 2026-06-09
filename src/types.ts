export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  tags: string[];
  link: string;
  reviews?: number;
  rating?: number;
  specs?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  suggestions?: Product[];
  status?: 'normal' | 'no-results' | 'error' | 'busy' | 'out-of-scope';
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  isPinned?: boolean;
  updatedAt: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  maxUses: number;
  usedCount: number;
  expiryDate: string;
  applicableBranches: string[];
  applicableCategory?: string;
}


