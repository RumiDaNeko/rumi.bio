"use client"
import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import './AIChatBox.css';

export const AIChatBox = ({
  position = 'right',
  primaryColor = '#ec8686',
  backgroundColor = 'rgba(255, 255, 255, 0.95)',
  textColor = '#111111',
  borderColor = 'rgba(0, 0, 0, 0.1)',
  accentColor = '#ec8686',
  isOpen: externalIsOpen,
  onToggle,
  className
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [textLines, setTextLines] = useState(['Chat', 'Close']);

  const containerRef = useRef(null);
  const panelRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const textInnerRef = useRef(null);
  const iconRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const openTlRef = useRef(null);
  const busyRef = useRef(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      if (!panel) return;

      const offscreen = position === 'left' ? -100 : 100;
      gsap.set(panel, { xPercent: offscreen });
      gsap.set(iconRef.current, { rotate: 0, transformOrigin: '50% 50%' });
      if (toggleBtnRef.current) gsap.set(toggleBtnRef.current, { color: textColor });
    });
    return () => ctx.revert();
  }, [textColor, position]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();

    const tl = gsap.timeline({ paused: true });
    const offscreen = position === 'left' ? -100 : 100;
    const panelStart = Number(gsap.getProperty(panel, 'xPercent'));

    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: 0.65, ease: 'power4.out' }
    );

    openTlRef.current = tl;
    return tl;
  }, [position]);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback('onComplete', () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    const panel = panelRef.current;
    if (!panel) return;

    const offscreen = position === 'left' ? -100 : 100;
    gsap.to(panel, {
      xPercent: offscreen,
      duration: 0.32,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: () => {
        busyRef.current = false;
      }
    });
  }, [position]);

  const animateIcon = useCallback(opening => {
    const icon = iconRef.current;
    if (!icon) return;
    if (opening) {
      gsap.to(icon, { rotate: 225, duration: 0.8, ease: 'power4.out', overwrite: 'auto' });
    } else {
      gsap.to(icon, { rotate: 0, duration: 0.35, ease: 'power3.inOut', overwrite: 'auto' });
    }
  }, []);

  const animateText = useCallback(opening => {
    const inner = textInnerRef.current;
    if (!inner) return;

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
    gsap.to(inner, {
      yPercent: -finalShift,
      duration: 0.5 + lineCount * 0.07,
      ease: 'power4.out'
    });
  }, []);

  const toggleChat = useCallback(() => {
    const target = !isOpen;
    if (onToggle !== undefined) {
      onToggle(target);
    } else {
      setInternalIsOpen(target);
    }
    if (target) {
      playOpen();
    } else {
      playClose();
    }
    animateIcon(target);
    animateText(target);
  }, [isOpen, onToggle, playOpen, playClose, animateIcon, animateText]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const query = inputValue.toLowerCase();
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    setTimeout(() => {
      let reply = "Query received. Connection stable. Ask me about Rumi, Cloudcode, or Stats.";
      if (query.includes("cloudcode")) {
        reply = "Cloudcode is Rumi's hosting brand in Vietnam, running clean, accessible VPS nodes and web services. Visit cloudcode.io.vn to check it out.";
      } else if (query.includes("rumi") || query.includes("haruka") || query.includes("who are you")) {
        reply = "Rumi (Haruka Kanemari) is a developer and cybersecurity student in Vietnam. Passionate about Linux hardening, network security, and VPS deployment.";
      } else if (query.includes("project")) {
        reply = "Current systems: 1) Cloudcode Hosting (main build), 2) Overlix (side quest infrastructure testbed), 3) Security Lab Notes (CTF practice and writeups).";
      } else if (query.includes("stat")) {
        reply = "Operator stats: 18 years online presence, $2000 invested in hardware & mistakes, 4 VPS nodes currently active.";
      }

      const aiMessage = {
        id: Date.now() + 1,
        text: reply,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 600);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      ref={containerRef}
      className={`ai-chat-wrapper ${position} ${isOpen ? 'open' : ''} ${className || ''}`}
      style={{ ['--chat-accent']: accentColor }}
    >
      <div className="chat-prelayers" aria-hidden="true">
        {(() => {
          const raw = [primaryColor, adjustBrightness(primaryColor, -15)];
          return raw.map((c, i) => <div key={i} className="chat-prelayer" style={{ background: c }} />);
        })()}
      </div>

      <aside ref={panelRef} className="chat-panel" aria-hidden={!isOpen}>
        <div className="chat-panel-inner">
          <div className="chat-panel-header">
            <h3>AI Assistant</h3>
            <button
              ref={toggleBtnRef}
              className="chat-close-btn"
              onClick={toggleChat}
              type="button"
            >
              <span ref={textInnerRef} className="chat-toggle-textInner">
                {textLines.map((l, i) => (
                  <span className="chat-toggle-line" key={i}>{l}</span>
                ))}
              </span>
              <span ref={iconRef} className="chat-icon" aria-hidden="true">
                <span className="chat-icon-line" />
                <span className="chat-icon-line chat-icon-line-v" />
              </span>
            </button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-empty">
                <p>System initialized. Connection stable. Ask me about Rumi, Cloudcode, or Stats.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`chat-message ${message.sender}`}>
                  <div className="chat-message-content">
                    <div className="chat-message-text">{message.text}</div>
                    <div className="chat-message-time">{formatTime(message.timestamp)}</div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="chat-input-form">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
            />
            <button type="submit" disabled={!inputValue.trim()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 13 11 13 18 22 13 18 2 15 13 11 13 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
};

function adjustBrightness(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
}