import React, { useEffect, useState, useRef } from 'react';

export default function CustomTooltip() {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentTargetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      let target = e.target as HTMLElement | null;
      // Traverse up to find an element with title or data-tooltip
      while (target && target !== document.body) {
        if (target.hasAttribute('title') || target.hasAttribute('data-tooltip')) {
          break;
        }
        target = target.parentElement;
      }

      if (!target) {
        handleMouseOut();
        return;
      }

      // If we are already hovering this specific element, preserve it
      if (currentTargetRef.current === target) {
        return;
      }

      // Clear any pending triggers
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      currentTargetRef.current = target;

      // Extract text content
      const text = target.getAttribute('title') || target.getAttribute('data-tooltip') || '';
      
      // Temporarily swap or backup title inside data-tooltip to completely disable browser default tooltips
      if (target.hasAttribute('title')) {
        target.setAttribute('data-tooltip', text);
        target.removeAttribute('title');
      }

      if (!text.trim()) {
        setVisible(false);
        setTooltip(null);
        return;
      }

      // Calculate placement rectangle
      const rect = target.getBoundingClientRect();
      const initialX = rect.left + rect.width / 2;
      const initialY = rect.top - 8; // Anchor slightly above element

      // Wait 400ms before asserting visibility to prevent quick hovering flashes
      timerRef.current = setTimeout(() => {
        setTooltip({
          text,
          x: initialX,
          y: initialY,
        });
        setVisible(true);
      }, 400);
    };

    const handleMouseOut = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      currentTargetRef.current = null;
      setVisible(false);
      // Wait for exit transition
      setTimeout(() => {
        setTooltip(null);
      }, 150);
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!tooltip) return null;

  return (
    <TooltipOverlay 
      text={tooltip.text} 
      x={tooltip.x} 
      y={tooltip.y} 
      visible={visible} 
    />
  );
}

function TooltipOverlay({ text, x, y, visible }: { text: string; x: number; y: number; visible: boolean }) {
  const elRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ left: x, top: y });

  useEffect(() => {
    if (elRef.current) {
      const rect = elRef.current.getBoundingClientRect();
      const padding = 12;
      
      // Horizontal placement adjustment
      let left = x - rect.width / 2;
      if (left + rect.width > window.innerWidth - padding) {
        left = window.innerWidth - rect.width - padding;
      }
      if (left < padding) {
        left = padding;
      }

      // Vertical placement adjustment (falls back to underneath if top is crowded)
      let top = y - rect.height;
      if (top < padding) {
        top = y + 24; 
      }

      setCoords({ left, top });
    }
  }, [x, y, text]);

  return (
    <div
      ref={elRef}
      className="fixed z-[999999] pointer-events-none select-none font-sans text-[12px] leading-relaxed text-white max-w-[280px] transition-opacity duration-150 ease"
      style={{
        left: `${coords.left}px`,
        top: `${coords.top}px`,
        opacity: visible ? 1 : 0,
        backgroundColor: '#1A202C',
        padding: '6px 10px',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)',
        transform: 'translateY(0)',
        animation: 'fadeInTooltip 0.15s ease-out forwards',
      }}
    >
      <style>{`
        @keyframes fadeInTooltip {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(2px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
      <div className="whitespace-pre-line text-center font-medium">
        {text}
      </div>
    </div>
  );
}
