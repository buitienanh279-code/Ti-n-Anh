import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, Mail, Lock, ArrowRight, Chrome, Sparkles, 
  User, Building2, ShieldCheck, Fingerprint, Eye, EyeOff,
  CheckCircle2, XCircle, Phone, Copy, Key
} from 'lucide-react';
import { getAccounts, saveAccounts, formatDateTime, logActivity } from '../utils/accounts';

interface LoginPageProps {
  onLogin: (currentUser: { username: string; email?: string; phone?: string; showWelcome?: boolean; welcomeName?: string; role?: 'admin' | 'user'; isNewRegister?: boolean }) => void;
  onBack?: () => void;
}

export default function LoginPage({ onLogin, onBack }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleStep, setGoogleStep] = useState(1); // 1: Email, 2: Password
  const [googleEmail, setGoogleEmail] = useState('');
  const [googlePassword, setGooglePassword] = useState('');
  const [email, setEmail] = useState('');
  const [linkedGmail, setLinkedGmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [strength, setStrength] = useState(0);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotError, setForgotError] = useState('');
  
  // States for Password Reset with OTP Flow:
  const [forgotStep, setForgotStep] = useState(1); // 1: Input email/phone, 2: Input OTP, 3: Set new password, 4: Success
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userEnteredOtp, setUserEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newConfirmPassword, setNewConfirmPassword] = useState('');
  const [otpNotification, setOtpNotification] = useState<string | null>(null);
  const [matchedUserIndex, setMatchedUserIndex] = useState<number | null>(null);

  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [agreeBox, setAgreeBox] = useState(false);

  const handleRetrievePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setOtpNotification(null);

    const query = forgotInput.trim().replace(/\s+/g, '');
    if (!query) {
      setForgotError('Vui lòng nhập Email hoặc Số điện thoại.');
      return;
    }

    const accounts = getAccounts();
    const matchedIndex = accounts.findIndex((acc: any) => {
      const accEmail = (acc.email || '').toLowerCase().trim();
      const accPhone = (acc.phone || '').trim();
      return accEmail === query.toLowerCase() || accPhone === query || acc.id === query;
    });

    if (matchedIndex !== -1) {
      const matchedUser = accounts[matchedIndex];
      // Generate a clean 6-digit random code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setMatchedUserIndex(matchedIndex);
      
      const targetGmail = (matchedUser as any).linkedGmail || matchedUser.email || '';
      const isEmail = query.includes('@') || !matchedUser.phone;
      const targetMsg = isEmail 
        ? `hộp thư Gmail (${targetGmail || query})` 
        : `tin nhắn điện thoại (Sim SĐT: ${matchedUser.phone || query})`;
      
      // Log carefully for developer testing
      console.log(`%c🔑 [Remix AI Systems] MÃ OTP CỦA BẠN LÀ: ${code}`, "color: #f59e0b; font-size: 16px; font-weight: bold; background: #fffbeb; padding: 4px 8px; border-radius: 4px; border: 1px solid #fef3c7;");
      console.log(`Mã này đã được điều hướng tự động về hệ thống ${isEmail ? "Google Gmail Service" : "SMS Network Gateways"}.`);
      
      setOtpNotification(`Mã OTP 6 số bảo mật đã được gửi thành công về ${targetMsg}.`);
      setForgotStep(2); // Go to verification step
      setUserEnteredOtp('');
    } else {
      setForgotError('Không tìm thấy tài khoản hợp lệ khớp với Email hoặc Số điện thoại này!');
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (userEnteredOtp.trim() === generatedOtp) {
      setForgotStep(3); // Type new password step
    } else {
      setForgotError('Mã OTP không chính xác. Vui lòng kiểm tra và nhập lại!');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (newPassword.length < 6) {
      setForgotError('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    if (newPassword !== newConfirmPassword) {
      setForgotError('Mật mã xách nhận không trùng khớp!');
      return;
    }

    if (matchedUserIndex !== null) {
      const accounts = getAccounts();
      if (accounts[matchedUserIndex]) {
        accounts[matchedUserIndex].password = btoa(newPassword);
        saveAccounts(accounts);
        
        // Sync to legacy users
        try {
          const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
          const idx = storedUsers.findIndex((u: any) => 
            u.email === accounts[matchedUserIndex].email || 
            u.username === accounts[matchedUserIndex].email ||
            u.phone === accounts[matchedUserIndex].phone
          );
          if (idx !== -1) {
            storedUsers[idx].password = newPassword;
            localStorage.setItem('users', JSON.stringify(storedUsers));
          }
        } catch {}

        setForgotStep(4); // Reset success
      } else {
        setForgotError('Có lỗi xảy ra, vui lòng thử lại.');
      }
    } else {
      setForgotError('Có lỗi xảy ra. Vui lòng bắt đầu lại.');
      setForgotStep(1);
    }
  };

  // Simple password strength calculator
  useEffect(() => {
    let s = 0;
    if (password.length > 8) s += 25;
    if (/[A-Z]/.test(password)) s += 25;
    if (/[0-9]/.test(password)) s += 25;
    if (/[^A-Za-z0-9]/.test(password)) s += 25;
    setStrength(s);
  }, [password]);

  const isEmailValid = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isPhoneValid = (val: string) => /^(0|84)[3|5|7|8|9][0-9]{8}$/.test(val.replace(/\s+/g, ''));

  // Sync email input with linkedGmail dynamically when the user types an email in the main field
  useEffect(() => {
    if (isRegister && isEmailValid(email)) {
      setLinkedGmail(email);
    }
  }, [email, isRegister]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const inputVal = email.trim();
    if (!inputVal) {
      setError('Vui lòng cung cấp Email hoặc Số điện thoại.');
      return;
    }

    const isEmail = inputVal.includes('@');
    const normalizedInput = inputVal.replace(/\s+/g, '');
    const isPhone = /^\d+$/.test(normalizedInput);

    let cleanEmail = '';
    let cleanPhone = '';

    if (isRegister) {
      if (isEmail) {
        if (!isEmailValid(inputVal)) {
          setError('Email phải chứa ký tự @ và tên miền hợp lệ (Ví dụ: name@gmail.com)!');
          return;
        }
        cleanEmail = inputVal.toLowerCase().trim();
      } else if (isPhone) {
        if (!/^0\d{9}$/.test(normalizedInput)) {
          setError('Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0 (Ví dụ: 0901234567)!');
          return;
        }
        cleanPhone = normalizedInput;
      } else {
        setError('Vui lòng nhập định dạng Email hợp lệ hoặc Số điện thoại 10 chữ số bắt đầu bằng số 0!');
        return;
      }

      if (password.length < 6) {
        setError('Mật mã phải có tối thiểu 6 ký tự!');
        return;
      }

      if (password !== confirmPassword) {
        setError('Mật mã và xác nhận mật mã không khớp!');
        return;
      }

      if (!agreeBox) {
        setError('Bạn phải đồng ý với điều khoản và điều kiện dịch vụ để đăng ký!');
        return;
      }
    }

    setIsLoading(true);
    
    // Simulate auth verification with localStorage persistence
    setTimeout(() => {
      const accounts = getAccounts();

      if (isRegister) {
        // Check duplication of Email
        if (cleanEmail) {
          const existingEmailUser = accounts.find((acc: any) => 
            (acc.email || '').toLowerCase().trim() === cleanEmail
          );

          if (existingEmailUser) {
            setError('Email đăng ký này đã tồn tại trước đó!');
            setIsLoading(false);
            return;
          }
        }

        // Check duplication of Phone
        if (cleanPhone) {
          const existingPhoneUser = accounts.find((acc: any) => 
            (acc.phone || '').trim() === cleanPhone
          );
          if (existingPhoneUser) {
            setError('Số điện thoại đăng ký này đã được sử dụng bởi tài khoản khác!');
            setIsLoading(false);
            return;
          }
        }

        const nowStr = formatDateTime(new Date());

        const newAccount: any = {
          id: "user_" + Date.now(),
          contact: cleanEmail || cleanPhone,
          email: cleanEmail,
          phone: cleanPhone,
          password: btoa(password),
          role: "user",
          createdAt: nowStr,
          isActive: true,
          warnings: 0,
          isLocked: false,
          profile: {
            name: '',
            avatar: '',
            background: ''
          },
          orders: [],
          chatHistory: [],
          favorites: [],
          cartItems: [],
          loyalty: {
            points: 0,
            tier: 'silver'
          }
        };

        const updatedAccounts = [...accounts, newAccount];
        localStorage.setItem('remix_all_accounts', JSON.stringify(updatedAccounts));
        saveAccounts(updatedAccounts);

        // Keep legacy sync
        try {
          const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
          const newUserLegacy = {
            username: cleanEmail || cleanPhone,
            email: cleanEmail,
            phone: cleanPhone,
            password: password,
            linkedGmail: cleanEmail
          };
          localStorage.setItem('users', JSON.stringify([...storedUsers, newUserLegacy]));
        } catch {}

        // Save remix_current_user to localStorage
        localStorage.setItem('remix_current_user', cleanEmail || cleanPhone);

        try {
          logActivity('register', { email: cleanEmail || cleanPhone });
          logActivity('login', { email: cleanEmail || cleanPhone });
        } catch (e) {
          console.error('Error logging register activity:', e);
        }

        setIsLoading(false);
        setIsRegister(false);
        setPassword('');
        setConfirmPassword('');
        setLinkedGmail('');
        setRegisterName('');
        setRegisterPhone('');
        setAgreeBox(false);

        // Call onLogin to enter main profile setup view immediately
        onLogin({
          username: cleanEmail || cleanPhone,
          email: cleanEmail,
          phone: cleanPhone,
          showWelcome: true,
          welcomeName: '',
          isNewRegister: true
        });
      } else {
        // Login Logic
        const cleanInputVal = inputVal.toLowerCase().trim();
        const b64Password = btoa(password);
        
        const matchedAccount = accounts.find((acc: any) => 
          (acc.email || '').toLowerCase().trim() === cleanInputVal ||
          (acc.phone || '').trim() === cleanInputVal
        );
        
        if (matchedAccount && matchedAccount.password === b64Password) {
          if (!matchedAccount.isActive) {
            setIsLoading(false);
            setError('Tài khoản của Bạn hiện đã bị khóa bởi Admin!');
            return;
          }

          // Save remix_current_user = email
          localStorage.setItem('remix_current_user', matchedAccount.email);

          try {
            logActivity('login', { email: matchedAccount.email });
          } catch (e) {
            console.error('Error logging login activity:', e);
          }

          // Update lastLogin = thời gian hiện tại
          const now = formatDateTime(new Date());
          matchedAccount.lastLogin = now;

          // GHI LOG vào chatHistory: { type:'login', time: now }
          if (!matchedAccount.chatHistory) {
            matchedAccount.chatHistory = [];
          }
          matchedAccount.chatHistory.push({
            type: 'login',
            time: now,
            id: `login_${Date.now()}`,
            title: "Đăng nhập hệ thống",
            messages: [],
            updatedAt: Date.now()
          } as any);

          saveAccounts(accounts);

          setIsLoading(false);
          onLogin({
            username: matchedAccount.email,
            email: matchedAccount.email,
            phone: matchedAccount.phone,
            role: matchedAccount.role
          });
        } else {
          setIsLoading(false);
          setError('Email hoặc mật khẩu không đúng');
        }
      }
    }, 2000);
  };

  const handleGoogleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (googleStep === 1) {
      if (!googleEmail.includes('@') && !/^\d+$/.test(googleEmail.replace(/[\s+.-]/g, ''))) return;
      setGoogleStep(2);
      return;
    }

    setIsLoading(true);
    setShowGoogleModal(false);
    
    setTimeout(() => {
      const accounts = getAccounts();
      const cleanGoogleEmail = googleEmail.toLowerCase().trim();
      const b64Password = btoa(googlePassword);
      
      const matchedAccount = accounts.find((acc: any) => {
        const accEmail = (acc.email || '').toLowerCase().trim();
        const accPhone = (acc.phone || '').trim();
        return (accEmail === cleanGoogleEmail || accPhone === cleanGoogleEmail) && acc.password === b64Password;
      });

      if (matchedAccount) {
        if (!matchedAccount.isActive) {
          setIsLoading(false);
          alert('Tài khoản này đã bị khóa bởi Admin!');
          return;
        }

        // Update last login
        matchedAccount.lastLogin = formatDateTime(new Date());
        saveAccounts(accounts);

        setIsLoading(false);
        onLogin({
          username: matchedAccount.email || matchedAccount.phone || 'GUEST',
          email: matchedAccount.email,
          phone: matchedAccount.phone
        });
      } else {
        setIsLoading(false);
        alert('Tài khoản Google hoặc mật khẩu không chính xác!');
        setGoogleStep(1);
        setGooglePassword('');
      }
    }, 1500);
  };

  const getStrengthColor = () => {
    if (strength <= 25) return 'bg-red-500';
    if (strength <= 50) return 'bg-orange-500';
    if (strength <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (strength === 0) return '';
    if (strength <= 25) return 'Yếu';
    if (strength <= 50) return 'Trung bình';
    if (strength <= 75) return 'Khá';
    return 'Mạnh - Đã được mã hóa';
  };

  const isPhoneInput = /^\d+$/.test(email.trim().replace(/[\s+.-]/g, ''));

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-y-auto bg-gray-50 py-8 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#00000005_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[480px] px-6"
      >
        <div className="relative group">
          {/* Active Security Aura */}
          <div className="absolute -inset-1 bg-green-500/10 rounded-[2.5rem] blur-xl opacity-50 transition-opacity duration-1000 group-focus-within:opacity-100" />
          
          <div className="relative bg-white border-subtle rounded-[2.5rem] p-6 md:p-10 shadow-lg overflow-hidden w-full max-w-md">
            {/* Back Button */}
            {onBack && (
              <button 
                onClick={onBack}
                className="absolute top-6 left-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all z-20"
                title="Quay lại trang chủ"
              >
                <XCircle size={24} strokeWidth={1.5} />
              </button>
            )}

            {/* Header with State Transition */}
            <div className="flex flex-col items-center text-center mb-8 md:mb-12 relative">
              <motion.div 
                layoutId="logo"
                whileHover={{ scale: 1.05 }}
                className="w-20 h-20 bg-green-600 flex items-center justify-center rounded-3xl shadow-md mb-8 border-subtle relative"
              >
                <Bot size={40} className="text-white" />
                <motion.div 
                   animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-4 border-white"
                />
              </motion.div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={isRegister ? 'reg' : 'login'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter mb-3 leading-tight px-4">
                    {isRegister ? 'Đăng ký Tài khoản' : 'AI tư vấn mua bán hàng'}
                  </h1>
                  <p className="text-sm font-medium text-gray-500 max-w-[280px] mx-auto leading-relaxed">
                    {isRegister 
                      ? 'Nâng tầm mua sắm của Bạn với trợ lý bán hàng AI hàng đầu thế giới.' 
                      : 'Hệ thống bảo mật sinh trắc học và AI đã sẵn sàng xác thực danh tính của Bạn.'}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isRegister ? (
                <>
                  {/* LOGIN MODE FIELDS */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-1">
                      Định danh (Email hoặc Số điện thoại)
                    </label>
                    <div className="relative group/input">
                      {isPhoneInput ? (
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within/input:text-green-600" size={20} />
                      ) : (
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within/input:text-green-600" size={20} />
                      )}
                      <input 
                        type="text" 
                        placeholder="name@remix.ai hoặc Số điện thoại" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-gray-50/50 border-subtle rounded-2xl py-5 pl-14 pr-5 text-gray-900 placeholder:text-gray-300 outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/30 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Mật mã Bảo mật</label>
                      <button 
                        type="button" 
                        onClick={() => {
                          setShowForgotModal(true);
                          setForgotInput('');
                          setForgotError('');
                          setForgotStep(1);
                          setGeneratedOtp('');
                          setUserEnteredOtp('');
                          setNewPassword('');
                          setNewConfirmPassword('');
                          setOtpNotification(null);
                          setMatchedUserIndex(null);
                        }}
                        className="text-[10px] font-black text-green-600 hover:text-green-700 uppercase tracking-tighter flex items-center gap-1 bg-transparent border-none cursor-pointer"
                      >
                         <Fingerprint size={12} />
                         Quên mật mã?
                      </button>
                    </div>
                    <div className="relative group/input">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within/input:text-green-600" size={20} />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" 
                        required
                        className="w-full bg-gray-50/50 border-subtle rounded-2xl py-5 pl-14 pr-14 text-gray-900 placeholder:text-gray-300 outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/30 transition-all font-medium"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-green-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* REGISTRATION MODE FIELDS (NEW FLOW) */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-1">
                      Số điện thoại hoặc Email (Bắt buộc)
                    </label>
                    <div className="relative group/input">
                      {email.includes('@') ? (
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within/input:text-green-600" size={20} />
                      ) : (
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within/input:text-green-600" size={20} />
                      )}
                      <input 
                        type="text" 
                        placeholder="Số điện thoại hoặc Email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-gray-50/50 border-subtle rounded-2xl py-5 pl-14 pr-5 text-gray-900 placeholder:text-gray-300 outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/30 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-1">Mật khẩu (Tối thiểu 6 ký tự)</label>
                    <div className="relative group/input">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within/input:text-green-600" size={20} />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" 
                        required
                        className="w-full bg-gray-50/50 border-subtle rounded-2xl py-5 pl-14 pr-14 text-gray-900 placeholder:text-gray-300 outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/30 transition-all font-medium"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-green-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-1">Xác nhận mật khẩu</label>
                    <div className="relative group/input">
                      <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within/input:text-green-600" size={20} />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••" 
                        required
                        className="w-full bg-gray-50/50 border-subtle rounded-2xl py-5 pl-14 pr-14 text-gray-900 placeholder:text-gray-300 outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/30 transition-all font-medium"
                      />
                      {confirmPassword.length > 0 && (
                        <div className="absolute right-5 top-1/2 -translate-y-1/2">
                          {password === confirmPassword ? (
                            <CheckCircle2 size={18} className="text-green-500" />
                          ) : (
                            <XCircle size={18} className="text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {confirmPassword.length > 0 && password !== confirmPassword && (
                      <p className="text-red-500 text-[10px] font-solid mt-1.5 ml-1 flex items-center gap-1">
                        <XCircle size={12} className="shrink-0" />
                        Mật khẩu xác nhận không trùng khớp!
                      </p>
                    )}
                  </div>

                  {/* Agree to terms and conditions Checkbox */}
                  <div className="flex items-start gap-3 pt-2">
                    <input 
                      type="checkbox" 
                      id="agree_terms"
                      checked={agreeBox}
                      onChange={(e) => setAgreeBox(e.target.checked)}
                      required
                      className="mt-1 w-4 h-4 text-green-600 bg-gray-50 border-gray-300 rounded focus:ring-green-500/20 focus:ring-2 cursor-pointer"
                    />
                    <label htmlFor="agree_terms" className="text-xs text-gray-500 font-semibold cursor-pointer select-none leading-relaxed">
                      Tôi đồng ý với các <span className="text-green-600 hover:underline">Điều khoản Dịch vụ</span> của REMIX.AI (Bắt buộc)
                    </label>
                  </div>
                </>
              )}

              <div className="space-y-2">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-[10px] font-black uppercase tracking-wider"
                  >
                    <XCircle size={14} />
                    {error}
                  </motion.div>
                )}

                {/* Real-time Strength Monitor */}
                {isRegister && password.length > 0 && (
                  <div className="pt-2 px-1">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Độ mạnh mật khẩu</span>
                       <span className={`text-[10px] font-black uppercase ${strength > 50 ? 'text-green-500' : 'text-gray-400'}`}>{getStrengthLabel()}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex gap-1">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${strength}%` }}
                        className={`h-full ${getStrengthColor()} rounded-full transition-colors duration-500 shadow-sm`}
                        style={{ width: `${strength}%` }}
                      />
                    </div>
                    <div className="mt-3 flex gap-4">
                       <div className="flex items-center gap-1.5">
                          {password.length >= 8 ? <CheckCircle2 size={12} className="text-green-500" /> : <XCircle size={12} className="text-gray-300" />}
                          <span className="text-[9px] font-bold text-gray-400">8+ ký tự</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                          {/[A-Z]/.test(password) ? <CheckCircle2 size={12} className="text-green-500" /> : <XCircle size={12} className="text-gray-300" />}
                          <span className="text-[9px] font-bold text-gray-400">Viết hoa</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                          {/[^A-Za-z0-9]/.test(password) ? <CheckCircle2 size={12} className="text-green-500" /> : <XCircle size={12} className="text-gray-300" />}
                          <span className="text-[9px] font-bold text-gray-400">Ký tự đặc biệt</span>
                       </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 space-y-4">
                <button 
                  type="submit"
                  disabled={isLoading || (isRegister && !agreeBox)}
                  className="w-full group relative flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white py-5 rounded-[1.5rem] font-black text-sm tracking-tight overflow-hidden transition-all active:scale-[0.97] shadow-md shadow-green-600/10 disabled:opacity-50"
                >
                  <span className="relative z-10 uppercase">
                    {isLoading 
                      ? 'XÁC THỰC MÃ HÓA...' 
                      : (isRegister ? 'ĐĂNG KÝ NGAY' : 'ĐĂNG NHẬP HỆ THỐNG')
                    }
                  </span>
                  {!isLoading && <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" /> }
                </button>

                {isRegister && !isLoading && (
                  <button 
                    type="button"
                    onClick={() => setIsRegister(false)}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-[1.5rem] border-subtle text-gray-500 hover:text-green-600 hover:bg-green-50/50 transition-all text-xs font-black uppercase tracking-widest"
                  >
                    Quay lại đăng nhập
                  </button>
                )}

                {!isRegister && !isLoading && (
                  <button 
                    type="button"
                    onClick={() => setIsRegister(true)}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-[1.5rem] border-subtle text-gray-500 hover:text-green-600 hover:bg-green-50/50 transition-all text-xs font-black uppercase tracking-widest"
                  >
                    Tạo tài khoản mới
                  </button>
                )}

                {onBack && !isLoading && (
                  <button 
                    type="button"
                    onClick={onBack}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-[1.5rem] border border-gray-100 hover:border-gray-300 hover:bg-gray-50/50 text-gray-400 hover:text-gray-700 transition-all text-xs font-black uppercase tracking-widest"
                  >
                    Quay lại hệ thống
                  </button>
                )}
              </div>
            </form>

            <div className="mt-10 flex items-center gap-5">
              <div className="h-[0.5px] flex-grow bg-gray-100" />
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em]">Đăng nhập bằng Google</span>
              <div className="h-[0.5px] flex-grow bg-gray-100" />
            </div>

            <div className="mt-8">
              <button 
                onClick={() => setShowGoogleModal(true)}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-5 bg-gray-50 border-subtle rounded-2xl text-gray-400 text-xs font-bold hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all group shadow-sm disabled:opacity-50"
              >
                <Chrome size={20} className="group-hover:scale-110 transition-transform" />
                {isLoading ? 'Đang kết nối...' : 'Tiếp tục với Google'}
              </button>
            </div>


            {/* Simulated Google Auth Modal */}
            <AnimatePresence>
              {showGoogleModal && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                >
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white w-full max-w-md rounded-lg p-8 shadow-2xl text-black"
                  >
                    <div className="flex flex-col items-center mb-8">
                      <svg viewBox="0 0 24 24" width="24" height="24" className="mb-4">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <h2 className="text-2xl font-bold mb-2 text-[#EA580C]">Đăng nhập bằng Google</h2>
                      <p className="text-gray-600 text-sm">Tiếp tục đến Remix.AI</p>
                    </div>

                    <form onSubmit={handleGoogleLogin} className="space-y-6">
                      <AnimatePresence mode="wait">
                        {googleStep === 1 ? (
                          <motion.div 
                            key="google-email"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-1"
                          >
                            <input 
                              type="email" 
                              required
                              value={googleEmail}
                              onChange={(e) => setGoogleEmail(e.target.value)}
                              placeholder="Email hoặc số điện thoại"
                              className="w-full border border-gray-300 rounded px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-base transition-all"
                            />
                            <button type="button" className="text-blue-600 text-sm font-bold hover:text-blue-700">Bạn quên địa chỉ email?</button>
                          </motion.div>
                        ) : (
                          <motion.div 
                            key="google-pass"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-1"
                          >
                            <div className="mb-4 flex items-center gap-3 p-2 border border-gray-200 rounded-full w-fit max-w-full">
                              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                                <User size={12} className="text-gray-600" />
                              </div>
                              <span className="text-sm font-medium truncate">{googleEmail}</span>
                            </div>
                            <input 
                              type="password" 
                              required
                              autoFocus
                              value={googlePassword}
                              onChange={(e) => setGooglePassword(e.target.value)}
                              placeholder="Nhập mật khẩu của bạn"
                              className="w-full border border-gray-300 rounded px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-base transition-all"
                            />
                            <div className="flex items-center gap-2 mt-2">
                              <input type="checkbox" id="show-pass" className="rounded" />
                              <label htmlFor="show-pass" className="text-sm text-gray-600">Hiện mật khẩu</label>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="text-sm text-gray-600 leading-relaxed">
                        Đây không phải máy tính của bạn? Hãy sử dụng chế độ Khách để đăng nhập riêng tư. <a href="#" className="text-blue-600 font-bold">Tìm hiểu thêm</a>
                      </div>

                      <div className="flex justify-between items-center pt-8">
                        <button 
                          type="button" 
                          onClick={() => {
                            if (googleStep === 2) {
                              setGoogleStep(1);
                            } else {
                              setShowGoogleModal(false);
                            }
                          }}
                          className="text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded transition-colors"
                        >
                          {googleStep === 2 ? 'Quay lại' : 'Hủy bỏ'}
                        </button>
                        <button 
                          type="submit"
                          className="bg-blue-600 text-white font-bold px-8 py-2 rounded hover:bg-blue-700 shadow-sm transition-all"
                        >
                          {googleStep === 1 ? 'Tiếp theo' : 'Đăng nhập'}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forgot Password Modal */}
            <AnimatePresence>
              {showForgotModal && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                >
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl text-gray-900 border border-gray-100"
                  >
                    <div className="flex flex-col items-center mb-6">
                      <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 text-amber-500 border border-amber-100/50">
                        <Key size={32} />
                      </div>
                      <h2 className="text-xl md:text-2xl font-black tracking-tight text-gray-900 text-center">
                        {forgotStep === 1 && 'Khôi phục mật mật mã'}
                        {forgotStep === 2 && 'Xác thực OTP'}
                        {forgotStep === 3 && 'Đặt mật mã mới'}
                        {forgotStep === 4 && 'Hoàn tất khôi phục'}
                      </h2>
                      <p className="text-gray-500 text-xs text-center font-medium mt-1">
                        {forgotStep === 1 && 'Cung cấp Email hoặc Số điện thoại để gửi mã'}
                        {forgotStep === 2 && 'Vui lòng nhập mã OTP 6 số để xác nhận'}
                        {forgotStep === 3 && 'Thiết lập mật mã bảo mật mới cho tài khoản'}
                        {forgotStep === 4 && 'Mật mã của bạn đã được thay đổi thành công'}
                      </p>
                    </div>

                    {forgotStep === 1 && (
                      <form onSubmit={handleRetrievePassword} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Email hoặc Số điện thoại</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              required
                              value={forgotInput}
                              onChange={(e) => setForgotInput(e.target.value)}
                              placeholder="VD: name@remix.ai hoặc 0987654321"
                              className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-4 px-4 text-gray-900 placeholder:text-gray-300 outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500/30 transition-all text-sm font-medium"
                            />
                          </div>
                        </div>

                        {forgotError && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-[10px] font-black uppercase tracking-wider"
                          >
                            <XCircle size={14} />
                            {forgotError}
                          </motion.div>
                        )}

                        <div className="flex gap-3 pt-4">
                          <button 
                            type="button" 
                            onClick={() => setShowForgotModal(false)}
                            className="flex-1 py-4 border border-gray-200 rounded-2xl text-gray-500 font-bold hover:bg-gray-50 hover:text-gray-900 transition-all text-xs uppercase tracking-wider"
                          >
                            Hủy bỏ
                          </button>
                          <button 
                            type="submit"
                            className="flex-1 bg-amber-500 text-white font-bold py-4 rounded-2xl hover:bg-amber-600 shadow-md shadow-amber-500/10 active:scale-[0.98] transition-all text-xs uppercase tracking-wider"
                          >
                            Gửi mã OTP
                          </button>
                        </div>
                      </form>
                    )}

                    {forgotStep === 2 && (
                      <form onSubmit={handleVerifyOtp} className="space-y-4">
                        {otpNotification && (
                          <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl text-xs text-emerald-800 font-medium leading-relaxed mb-2">
                            <p className="font-bold flex items-center gap-1.5 text-emerald-900 uppercase tracking-wider text-[10px] mb-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                              Đã phát tín hiệu OTP:
                            </p>
                            {otpNotification}
                            <p className="mt-2 text-[10px] text-gray-500 font-normal leading-relaxed">
                              * Để tăng tính chân thực và bảo mật, hệ thống <strong className="text-gray-700">không hiển thị mã OTP trên màn hình này</strong>. Vui lòng kiểm tra ứng dụng Gmail hoặc SIM tin nhắn trên điện thoại của bạn.
                            </p>
                            <p className="mt-1 text-[10px] text-amber-600 font-normal">
                              (Dành cho Tester: Mã OTP 6 số đã được in ra trong <strong className="underline">F12 Console Trình duyệt</strong> của bạn để tiện thực hành bảo mật).
                            </p>
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Mã xác minh OTP (6 số)</label>
                          <input 
                            type="text" 
                            required
                            maxLength={6}
                            value={userEnteredOtp}
                            onChange={(e) => setUserEnteredOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="Nhập 6 số"
                            className="w-full text-center font-mono tracking-[0.5em] text-lg bg-gray-50/50 border border-gray-200 rounded-2xl py-4 px-4 text-gray-900 placeholder:text-gray-300 outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500/30 transition-all font-bold"
                          />
                        </div>

                        {forgotError && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-[10px] font-black uppercase tracking-wider"
                          >
                            <XCircle size={14} />
                            {forgotError}
                          </motion.div>
                        )}

                        <div className="flex gap-3 pt-4">
                          <button 
                            type="button" 
                            onClick={() => {
                              setForgotStep(1);
                              setForgotError('');
                              setOtpNotification(null);
                            }}
                            className="flex-1 py-4 border border-gray-200 rounded-xl text-gray-500 font-bold hover:bg-gray-50 hover:text-gray-900 transition-all text-xs uppercase tracking-wider"
                          >
                            Quay lại
                          </button>
                          <button 
                            type="submit"
                            className="flex-1 bg-amber-500 text-white font-bold py-4 rounded-2xl hover:bg-amber-600 shadow-md shadow-amber-500/10 active:scale-[0.98] transition-all text-xs uppercase tracking-wider"
                          >
                            Xác thực
                          </button>
                        </div>
                      </form>
                    )}

                    {forgotStep === 3 && (
                      <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Mật khẩu mới (Tối thiểu 6 ký tự)</label>
                            <input 
                              type="password" 
                              required
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Mật khẩu tối thiểu 6 chữ số/chữ"
                              className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-4 px-4 text-gray-900 placeholder:text-gray-300 outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500/30 transition-all text-sm font-medium"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Xác nhận mật khẩu mới chính xác</label>
                            <input 
                              type="password" 
                              required
                              value={newConfirmPassword}
                              onChange={(e) => setNewConfirmPassword(e.target.value)}
                              placeholder="Nhập lại mật khẩu mới"
                              className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-4 px-4 text-gray-900 placeholder:text-gray-300 outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500/30 transition-all text-sm font-medium"
                            />
                          </div>
                        </div>

                        {forgotError && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-[10px] font-black uppercase tracking-wider"
                          >
                            <XCircle size={14} />
                            {forgotError}
                          </motion.div>
                        )}

                        <div className="flex gap-3 pt-4">
                          <button 
                            type="button" 
                            onClick={() => {
                              setForgotStep(2);
                              setForgotError('');
                            }}
                            className="flex-1 py-4 border border-gray-200 rounded-2xl text-gray-500 font-bold hover:bg-gray-50 hover:text-gray-900 transition-all text-xs uppercase tracking-wider"
                          >
                            Quay lại
                          </button>
                          <button 
                            type="submit"
                            className="flex-1 bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary-dark shadow-md shadow-primary/10 active:scale-[0.98] transition-all text-xs uppercase tracking-wider"
                          >
                            Cập nhật
                          </button>
                        </div>
                      </form>
                    )}

                    {forgotStep === 4 && (
                      <div className="space-y-6">
                        <div className="bg-green-50/50 border border-green-200/50 rounded-2xl p-5 text-center">
                          <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Đổi mật khẩu thành công!</p>
                          <p className="text-xs text-gray-500 leading-relaxed">Tài khoản của bạn đã được cập nhật mật khẩu mới thành công.</p>
                        </div>

                        <div className="space-y-3">
                          <button 
                            type="button" 
                            onClick={() => {
                              setEmail(forgotInput);
                              setPassword(newPassword);
                              setShowForgotModal(false);
                            }}
                            className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary-dark shadow-md shadow-primary/10 active:scale-[0.98] transition-all text-xs uppercase tracking-wider"
                          >
                            Tự động điền & Đăng nhập
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

             {/* Smart Footer Transition */}
             <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-600 via-emerald-400 to-green-600 opacity-20" />
           </div>
         </div>
 
         <div className="mt-10 text-center">
           <p className="text-xs text-gray-500 font-medium tracking-tight">
             {isRegister ? 'Bạn đã là đối tác?' : 'Chưa có quyền truy cập?'}
             <button 
               onClick={() => setIsRegister(!isRegister)}
              className="ml-2 text-[#EA580C] hover:text-[#D97706] font-black uppercase tracking-tighter transition-colors"
             >
               {isRegister ? 'Đăng nhập ngay' : 'Đăng ký trải nghiệm'}
             </button>
           </p>
         </div>
 
         {/* Security Compliance Badges */}
         <div className="mt-16 flex justify-center items-center gap-10 opacity-30">
            <div className="flex flex-col items-center gap-2 group cursor-help">
               <ShieldCheck size={20} className="text-gray-400 group-hover:text-green-600 transition-colors" />
               <span className="text-[9px] font-black text-gray-400 tracking-widest uppercase">AES-256</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-help">
               <Lock size={20} className="text-gray-400 group-hover:text-green-600 transition-colors" />
               <span className="text-[9px] font-black text-gray-400 tracking-widest uppercase">2FA READY</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-help">
               <Bot size={20} className="text-gray-400 group-hover:text-green-600 transition-colors" />
               <span className="text-[9px] font-black text-gray-400 tracking-widest uppercase">AI GUARD</span>
            </div>
         </div>
      </motion.div>
    </div>
  );
}
