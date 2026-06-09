import React, { useState, useEffect } from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export default function PhoneFrame({ children }: PhoneFrameProps) {
  const [phoneTime, setPhoneTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setPhoneTime(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="phone-frame">
      {/* Volume buttons (mockup) - hidden on mobile, visible on desktop */}
      <div className="phone-frame-vols hidden md:flex">
        <div className="vol-btn" />
        <div className="vol-btn" />
      </div>

      {/* Status Bar */}
      <header className="status-bar">
        {/* Left: Time */}
        <div className="pl-2.5 font-sans leading-none">{phoneTime}</div>
        
        {/* Right: Icons (Signal, Wifi, Battery) */}
        <div className="flex items-center gap-2 pr-2.5">
          {/* Signal */}
          <svg className="w-3 h-3 text-[#1A202C]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 19h3v-3H2v3zm5 0h3v-7H7v7zm5 0h3V9h-3v10zm5 0h3V5h-3v14z" />
          </svg>
          
          {/* WiFi */}
          <svg className="w-3 h-3 text-[#1A202C] stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.55a11 11 0 0 1 14 0" />
            <path d="M8.5 16a5.5 5.5 0 0 1 7 0" />
            <line x1="12" y1="19" x2="12" y2="19" strokeWidth="3" />
          </svg>
          
          {/* Battery */}
          <svg className="w-3.5 h-3 text-[#1A202C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="15" height="10" rx="2" ry="2" />
            <line x1="21" y1="11" x2="21" y2="13" />
            <rect x="4" y="9" width="11" height="6" rx="0.5" fill="currentColor" stroke="none" />
          </svg>
        </div>
      </header>

      {/* Render core screen content */}
      <div className="phone-content-container flex-grow flex flex-col min-h-0 relative h-full pt-[44px]">
        {children}
      </div>
    </div>
  );
}
