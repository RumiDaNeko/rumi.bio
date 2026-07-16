"use client"
import React, { useRef, useLayoutEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import './ChatToggleButton.css';

export const ChatToggleButton = ({
  position = 'left',
  color = '#e9e9ef',
  activeColor = '#5a7a8a',
  onClick,
  isOpen = false,
  className
}) => {
  const buttonRef = useRef(null);
  const textInnerRef = useRef(null);
  const iconRef = useRef(null);
  const plusHRef = useRef(null);
  const plusVRef = useRef(null);
  const [textLines, setTextLines] = useState(['Chat', 'Close']);
  const spinTweenRef = useRef(null);
  const textCycleAnimRef = useRef(null);
  const colorTweenRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const btn = buttonRef.current;
      const icon = iconRef.current;
      const textInner = textInnerRef.current;
      if (!btn || !icon || !textInner) return;

      gsap.set(btn, { color: isOpen ? activeColor : color });
      gsap.set(icon, { rotate: isOpen ? 225 : 0, transformOrigin: '50% 50%' });
      gsap.set(textInner, { yPercent: 0 });
    });
    return () => ctx.revert();
  }, [isOpen, color, activeColor]);

  const animateIcon = useCallback(opening => {
    const icon = iconRef.current;
    if (!icon) return;
    spinTweenRef.current?.kill();
    if (opening) {
      spinTweenRef.current = gsap.to(icon, { rotate: 225, duration: 0.8, ease: 'power4.out', overwrite: 'auto' });
    } else {
      spinTweenRef.current = gsap.to(icon, { rotate: 0, duration: 0.35, ease: 'power3.inOut', overwrite: 'auto' });
    }
  }, []);

  const animateColor = useCallback(opening => {
    const btn = buttonRef.current;
    if (!btn) return;
    colorTweenRef.current?.kill();
    colorTweenRef.current = gsap.to(btn, {
      color: opening ? activeColor : color,
      delay: 0.18,
      duration: 0.3,
      ease: 'power2.out'
    });
  }, [activeColor, color]);

  const animateText = useCallback(opening => {
    const inner = textInnerRef.current;
    if (!inner) return;
    textCycleAnimRef.current?.kill();

    const currentLabel = opening ? 'Chat' : 'Close';
    const targetLabel = opening ? 'Close' : 'Chat';
    const cycles = 3;
    const seq = [currentLabel];
    let last = currentLabel;
    for (let i = 0; i < cycles; i++) {
      last = last === 'Chat' ? 'Close' : 'Chat';
      seq.push(last);
    }
    if (last !== targetLabel) seq.push(targetLabel);
    seq.push(targetLabel);
    setTextLines(seq);

    gsap.set(inner, { yPercent: 0 });
    const lineCount = seq.length;
    const finalShift = ((lineCount - 1) / lineCount) * 100;
    textCycleAnimRef.current = gsap.to(inner, {
      yPercent: -finalShift,
      duration: 0.5 + lineCount * 0.07,
      ease: 'power4.out'
    });
  }, []);

  const handleClick = useCallback(() => {
    const target = !isOpen;
    onClick?.(target);
    animateIcon(target);
    animateColor(target);
    animateText(target);
  }, [isOpen, onClick, animateIcon, animateColor, animateText]);

  return (
    <button
      ref={buttonRef}
      className={`chat-toggle-btn ${position} ${isOpen ? 'open' : ''} ${className || ''}`}
      onClick={handleClick}
      type="button"
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
      aria-expanded={isOpen}
    >
      <span className="chat-toggle-textWrap" aria-hidden="true">
        <span ref={textInnerRef} className="chat-toggle-textInner">
          {textLines.map((l, i) => (
            <span className="chat-toggle-line" key={i}>{l}</span>
          ))}
        </span>
      </span>
      <span ref={iconRef} className="chat-toggle-icon" aria-hidden="true">
        <span ref={plusHRef} className="chat-toggle-icon-line" />
        <span ref={plusVRef} className="chat-toggle-icon-line chat-toggle-icon-line-v" />
      </span>
    </button>
  );
};

export default ChatToggleButton;