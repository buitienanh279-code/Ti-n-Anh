import { updateAccountData } from './accounts';

export interface LoyaltyLog {
  id: string;
  points: number;
  reason: string;
  timestamp: string;
}

export interface LoyaltyInfo {
  points: number;
  tier: 'silver' | 'gold' | 'diamond';
  history: LoyaltyLog[];
}

export function getTierFromPoints(points: number): 'silver' | 'gold' | 'diamond' {
  if (points < 500) return 'silver';
  if (points < 2000) return 'gold';
  return 'diamond';
}

export function getLoyaltyRate(): number {
  try {
    const saved = localStorage.getItem('remix_loyalty_rate');
    return saved ? parseInt(saved, 10) : 1; // Default rate: 1 point per 10,000đ
  } catch {
    return 1;
  }
}

export function setLoyaltyRate(rate: number): void {
  try {
    localStorage.setItem('remix_loyalty_rate', rate.toString());
    window.dispatchEvent(new Event('remix_loyalty_rate_changed'));
  } catch (err) {
    console.error('Error setting loyalty rate:', err);
  }
}

export function calculateEarnedPoints(amount: number): number {
  const rate = getLoyaltyRate();
  return Math.floor(amount / 10000) * rate;
}

// Global registry of all users' loyalty
export function getAllLoyaltyData(): Record<string, LoyaltyInfo> {
  try {
    const saved = localStorage.getItem('remix_all_loyalty');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Error fetching all loyalty data:', err);
  }
  return {};
}

export function getLoyaltyInfo(username: string): LoyaltyInfo {
  // If no username, return basic silver info
  if (!username) {
    return { points: 0, tier: 'silver', history: [] };
  }
  
  try {
    const allLoyalty = getAllLoyaltyData();
    if (allLoyalty[username]) {
      const data = allLoyalty[username];
      const points = typeof data.points === 'number' ? data.points : 0;
      return {
        points,
        tier: getTierFromPoints(points),
        history: data.history || []
      };
    }

    // Fallback to legacy single-user 'remix_loyalty' key for matching username
    const legacySaved = localStorage.getItem('remix_loyalty');
    if (legacySaved) {
      const parsedLegacy = JSON.parse(legacySaved);
      const points = typeof parsedLegacy.points === 'number' ? parsedLegacy.points : 0;
      const legacyInfo: LoyaltyInfo = {
        points,
        tier: getTierFromPoints(points),
        history: parsedLegacy.history || []
      };
      
      // Save to multi-user registry
      allLoyalty[username] = legacyInfo;
      localStorage.setItem('remix_all_loyalty', JSON.stringify(allLoyalty));
      return legacyInfo;
    }
  } catch (err) {
    console.error('Error fetching loyalty info:', err);
  }

  // Load from general user store as base default
  let initialPoints = 50;
  try {
    const usersStr = localStorage.getItem('users');
    if (usersStr) {
      const users = JSON.parse(usersStr);
      // If user exists, provide them initial register awards if they don't have loyalty yet
      const userExists = users.some((u: any) => u.username === username);
      if (!userExists) {
        initialPoints = 0; // Guest or non-registered
      }
    }
  } catch {}

  // Default initial award
  const defaultInfo: LoyaltyInfo = {
    points: initialPoints,
    tier: 'silver',
    history: initialPoints > 0 ? [
      {
        id: 'L-INIT',
        points: initialPoints,
        reason: 'Đăng ký tài khoản mới thành công',
        timestamp: new Date().toISOString()
      }
    ] : []
  };

  try {
    const allLoyalty = getAllLoyaltyData();
    allLoyalty[username] = defaultInfo;
    localStorage.setItem('remix_all_loyalty', JSON.stringify(allLoyalty));
  } catch (err) {
    console.error('Error saving default loyalty info:', err);
  }

  return defaultInfo;
}

export function addLoyaltyPoints(username: string, pointsToAdd: number, reason: string): LoyaltyInfo {
  if (!username) {
    return { points: 0, tier: 'silver', history: [] };
  }

  const current = getLoyaltyInfo(username);
  const newLog: LoyaltyLog = {
    id: `L-${Math.floor(100000 + Math.random() * 900000)}`,
    points: pointsToAdd,
    reason,
    timestamp: new Date().toISOString()
  };

  const newPoints = Math.max(0, current.points + pointsToAdd);
  const newTier = getTierFromPoints(newPoints);

  const updatedInfo: LoyaltyInfo = {
    points: newPoints,
    tier: newTier,
    history: [newLog, ...current.history]
  };

  try {
    const allLoyalty = getAllLoyaltyData();
    allLoyalty[username] = updatedInfo;
    localStorage.setItem('remix_all_loyalty', JSON.stringify(allLoyalty));
    
    // Core Multi-account Sync
    try {
      updateAccountData(username, { loyalty: updatedInfo });
    } catch (e) {
      console.error('Error syncing loyalty points to account:', e);
    }

    // Fallback sync to legacy for compatibility
    localStorage.setItem('remix_loyalty', JSON.stringify(updatedInfo));

    // Dispatch custom event to notify other components to re-render loyalty points
    window.dispatchEvent(new CustomEvent('remix_loyalty_changed', { detail: { username, updatedInfo } }));
  } catch (err) {
    console.error('Error adding loyalty points:', err);
  }

  return updatedInfo;
}

export function getUserTier(points: number): { name: string; color: string; bg: string; border: string; icon: string; tierKey: 'silver' | 'gold' | 'diamond' } {
  if (points < 500) {
    return { 
      name: 'Bạc (Silver)', 
      color: 'text-slate-500', 
      bg: 'bg-slate-50', 
      border: 'border-slate-200', 
      icon: '🥈',
      tierKey: 'silver'
    };
  }
  if (points < 2000) {
    return { 
      name: 'Vàng (Gold)', 
      color: 'text-yellow-600', 
      bg: 'bg-amber-50', 
      border: 'border-amber-200', 
      icon: '🥇',
      tierKey: 'gold'
    };
  }
  return { 
    name: 'Kim Cương (Diamond)', 
    color: 'text-blue-900', 
    bg: 'bg-blue-50', 
    border: 'border-blue-200', 
    icon: '💎',
    tierKey: 'diamond'
  };
}
