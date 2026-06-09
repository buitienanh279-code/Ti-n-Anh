import { ChatSession, CartItem } from '../types';

export interface AccountLoyalty {
  points: number;
  tier: string;
  history: any[];
}

export interface Account {
  id: string;
  email: string;
  password: string; // base64 encoded using btoa
  name: string;
  phone: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastLogin: string;
  isActive: boolean;
  orders: any[];
  favorites: any[];
  chatHistory: any[];
  cartItems: CartItem[];
  loyalty: AccountLoyalty;
  contact?: string;
  warnings?: number;
  isLocked?: boolean;
  profile?: {
    name: string;
    avatar: string;
    background: string;
  };
}

export const DEFAULT_ADMIN: Account = {
  id: "admin_001",
  email: "admin@remix.ai",
  password: btoa("admin123"),
  name: "Super Admin",
  phone: "",
  role: "admin",
  createdAt: "01/01/2026",
  lastLogin: "",
  isActive: true,
  orders: [],
  favorites: [],
  chatHistory: [],
  cartItems: [],
  loyalty: {
    points: 0,
    tier: "silver",
    history: []
  }
};

export function formatDateTime(date: Date): string {
  const pad = (num: number) => num.toString().padStart(2, '0');
  const d = pad(date.getDate());
  const m = pad(date.getMonth() + 1);
  const y = date.getFullYear();
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${d}/${m}/${y} ${h}:${min}`;
}

export function initializeAccounts(): Account[] {
  try {
    let accounts: Account[] = [];
    const saved = localStorage.getItem('remix_all_accounts');
    if (saved) {
      accounts = JSON.parse(saved);
    } else {
      accounts = [DEFAULT_ADMIN];
      
      // Migrate legacy users
      const legacyUsersStr = localStorage.getItem('users');
      if (legacyUsersStr) {
        try {
          const legacyUsers = JSON.parse(legacyUsersStr);
          legacyUsers.forEach((u: any, idx: number) => {
            if (u.username === 'admin' || u.email === 'admin@remix.ai' || u.username === 'admin@remix.ai') return;
            
            const passwordPlain = u.password || '123456';
            const emailVal = u.email || (u.username && u.username.includes('@') ? u.username : `${u.username || 'user' + idx}@gmail.com`);
            const phoneVal = u.phone || (!u.username?.includes('@') ? u.username : '') || '';
            const nameVal = u.name || u.username?.split('@')[0] || 'Khách hàng';
            
            let userLoyalty = { points: 50, tier: 'silver', history: [] };
            try {
              const allLoyaltyStr = localStorage.getItem('remix_all_loyalty');
              if (allLoyaltyStr) {
                const allLoyalty = JSON.parse(allLoyaltyStr);
                const uLoy = allLoyalty[u.username];
                if (uLoy) {
                  userLoyalty = {
                    points: typeof uLoy.points === 'number' ? uLoy.points : 50,
                    tier: uLoy.tier || 'silver',
                    history: uLoy.history || []
                  };
                }
              }
            } catch {}

            let userOrders: any[] = [];
            try {
              const savedOrders = localStorage.getItem('remix_orders') || localStorage.getItem('remix_placed_orders');
              if (savedOrders) {
                const parsedOrders = JSON.parse(savedOrders);
                userOrders = parsedOrders.filter((ord: any) => ord.username === u.username);
              }
            } catch {}

            let userChat: any[] = [];
            try {
              const savedSessions = localStorage.getItem(`remix_sessions_${u.username}`);
              if (savedSessions) {
                userChat = JSON.parse(savedSessions);
              }
            } catch {}

            accounts.push({
              id: "user_" + (Date.now() + idx),
              email: emailVal,
              password: btoa(passwordPlain),
              name: nameVal,
              phone: phoneVal,
              role: "user",
              createdAt: "20/05/2026 14:30",
              lastLogin: "",
              isActive: true,
              orders: userOrders,
              favorites: [],
              chatHistory: userChat,
              cartItems: [],
              loyalty: userLoyalty
            });
          });
        } catch (err) {
          console.error("Failed to migrate legacy users", err);
        }
      }
      localStorage.setItem('remix_all_accounts', JSON.stringify(accounts));
    }
    
    if (!accounts.some(acc => acc.role === 'admin' || acc.email === 'admin@remix.ai')) {
      accounts.unshift(DEFAULT_ADMIN);
      localStorage.setItem('remix_all_accounts', JSON.stringify(accounts));
    }
    
    return accounts;
  } catch (e) {
    console.error("Failed to initialize accounts:", e);
    return [];
  }
}

export function getAccounts(): Account[] {
  const list = localStorage.getItem('remix_all_accounts');
  if (list) {
    try {
      return JSON.parse(list);
    } catch {
      return [];
    }
  }
  return initializeAccounts();
}

export function saveAccounts(accounts: Account[]): void {
  try {
    localStorage.setItem('remix_all_accounts', JSON.stringify(accounts));
  } catch (err) {
    console.error("Error saving accounts", err);
  }
}

export function updateAccountData(
  usernameOrEmailOrPhone: string,
  updatedFields: Partial<Account>
): void {
  const accounts = getAccounts();
  const ident = usernameOrEmailOrPhone.toLowerCase().trim();
  const idx = accounts.findIndex(
    acc => acc.email.toLowerCase().trim() === ident ||
           acc.phone.trim() === ident ||
           acc.id === usernameOrEmailOrPhone
  );
  if (idx !== -1) {
    accounts[idx] = { ...accounts[idx], ...updatedFields };
    saveAccounts(accounts);
  }
}

export function initAccounts(): void {
  try {
    const saved = localStorage.getItem('remix_all_accounts');
    const accounts: Account[] = saved ? JSON.parse(saved) : [];
    if (!accounts.some(a => a.role === 'admin')) {
      accounts.push(DEFAULT_ADMIN);
      localStorage.setItem('remix_all_accounts', JSON.stringify(accounts));
    }
  } catch (e) {
    console.error("Failed to initAccounts:", e);
  }
}

export function getCurrentUser(): Account | null {
  const stored = localStorage.getItem('remix_current_user');
  if (!stored) return null;
  
  let targetEmail = stored;
  try {
    if (stored.trim().startsWith('{')) {
      const parsed = JSON.parse(stored);
      targetEmail = parsed.email || parsed.username || stored;
    }
  } catch (e) {
    // If it's not JSON, treat raw string as email
  }
  
  try {
    const saved = localStorage.getItem('remix_all_accounts');
    const accounts: Account[] = saved ? JSON.parse(saved) : [];
    const ident = targetEmail.toLowerCase().trim();
    return accounts.find(a => 
      a.email.toLowerCase().trim() === ident || 
      a.phone.trim() === ident ||
      a.id === targetEmail
    ) || null;
  } catch (e) {
    console.error("Failed to getCurrentUser:", e);
    return null;
  }
}

export function updateCurrentUser(updates: Partial<Account>): void {
  try {
    const stored = localStorage.getItem('remix_current_user');
    if (!stored) return;
    
    let targetEmail = stored;
    try {
      if (stored.trim().startsWith('{')) {
        const parsed = JSON.parse(stored);
        targetEmail = parsed.email || parsed.username || stored;
      }
    } catch (e) {}

    const accounts = getAccounts();
    const ident = targetEmail.toLowerCase().trim();
    const idx = accounts.findIndex(a => 
      a.email.toLowerCase().trim() === ident || 
      a.phone.trim() === ident ||
      a.id === targetEmail
    );
    if (idx !== -1) {
      accounts[idx] = { ...accounts[idx], ...updates };
      saveAccounts(accounts);
      window.dispatchEvent(new CustomEvent('remix_user_updated', { detail: accounts[idx] }));
    }
  } catch (e) {
    console.error("Failed to updateCurrentUser:", e);
  }
}

export function logActivity(type: string, data: any): void {
  const user = getCurrentUser();
  if (!user) return;
  const log = {
    type,         // 'chat'|'order'|'add_cart'|'view_product'
                  // |'login'|'logout'|'register'
    data,         // object chứa chi tiết
    time: new Date().toLocaleString('vi-VN')
  };
  const history = user.chatHistory || [];
  history.push(log);
  // Giới hạn 200 log gần nhất
  if (history.length > 200) history.shift();
  updateCurrentUser({ chatHistory: history });
}


