"use client"
// Staggered Menu Component with Live2D and AI Chat integration
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './StaggeredMenu.css';

function parseMessageText(text) {
  const startTag = "<thinking>";
  const endTag = "</thinking>";

  if (!text.includes(startTag)) {
    return { thinking: "", content: text };
  }

  const startIndex = text.indexOf(startTag);
  const endIndex = text.indexOf(endTag);

  if (endIndex === -1) {
    return {
      thinking: text.substring(startIndex + startTag.length),
      content: text.substring(0, startIndex)
    };
  }

  return {
    thinking: text.substring(startIndex + startTag.length, endIndex),
    content: text.substring(0, startIndex) + text.substring(endIndex + endTag.length)
  };
}

function renderMessageText(text) {
  const regex = /!\[(.*?)\]\((.*?)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const startIndex = match.index;
    if (startIndex > lastIndex) {
      parts.push(text.substring(lastIndex, startIndex));
    }

    const alt = match[1];
    const url = match[2];
    parts.push(
      <img
        key={startIndex}
        src={url}
        alt={alt}
        className="sm-chat-inline-image"
        style={{ maxWidth: "100%", borderRadius: "8px", marginTop: "0.5rem", border: "1px solid rgba(0,0,0,0.1)", display: "block" }}
      />
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export const StaggeredMenu = ({
  position = 'right',
  colors = ['#B19EEF', '#5227FF'],
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
  className,
  logoUrl = '/src/assets/logos/reactbits-gh-white.svg',
  wordmarkUrl,
  wordmarkAlt = 'Harumi signature',
  menuButtonColor = '#fff',
  openMenuButtonColor = '#fff',
  accentColor = '#5227FF',
  changeMenuColorOnOpen = true,
  isFixed = false,
  onMenuOpen,
  onMenuClose
}) => {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const panelRef = useRef(null);
  const preLayersRef = useRef(null);
  const preLayerElsRef = useRef([]);
  const plusHRef = useRef(null);
  const plusVRef = useRef(null);
  const iconRef = useRef(null);
  const textInnerRef = useRef(null);
  const textWrapRef = useRef(null);
  const [textLines, setTextLines] = useState(['Menu', 'Close']);
  const [view, setView] = useState('menu');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const chatMessagesEndRef = useRef(null);
  const pixiAppRef = useRef(null);

  React.useEffect(() => {
    if (view !== 'chat') return;

    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          resolve(null);
          return;
        }
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.onload = () => resolve(null);
        s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.body.appendChild(s);
      });
    };

    const init = async () => {
      try {
        await loadScript("https://cubism.live2d.com/sdk-web/core/05/live2dcubismcore.min.js");
        await loadScript("https://cdn.jsdelivr.net/npm/pixi.js@6.5.10/dist/browser/pixi.min.js");
        await loadScript("https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/cubism4.min.js");
        initPIXI();
      } catch (e) {
        console.error(e);
      }
    };

    init();

    return () => {
      if (pixiAppRef.current) {
        try {
          pixiAppRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
        } catch {}
        pixiAppRef.current = null;
      }
    };
  }, [view]);

  const initPIXI = async () => {
    try {
      const PIXI = window.PIXI;
      if (!PIXI || !PIXI.live2d || !PIXI.live2d.Live2DModel) return;

      const canvas = document.getElementById("live2d4");
      if (!canvas) return;

      if (pixiAppRef.current) {
        try {
          pixiAppRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
        } catch {}
        pixiAppRef.current = null;
      }

      const app = new PIXI.Application({
        view: canvas,
        autoStart: true,
        backgroundAlpha: 0,
        width: 220,
        height: 700
      });
      pixiAppRef.current = app;

      const model = await PIXI.live2d.Live2DModel.from(
        encodeURI('/live2dmodels/阿库露_vts/阿库露_vts.model3.json'),
        { autoInteract: true }
      );
      app.stage.addChild(model);

      model.anchor.set(0.5, 0.5);
      model.x = app.screen.width / 2;

      const scaleX = app.screen.width / model.width;
      const scaleY = app.screen.height / model.height;
      const scale = Math.min(scaleX, scaleY) * 2;
      model.scale.set(scale);

      model.y = app.screen.height * 0.55;

      model.on('hit', (hitAreas) => {
        if (hitAreas.includes('body') || hitAreas.includes('Body')) {
          model.motion('tap_body');
        }
      });
    } catch (e) {
      console.error("PIXI initialization error:", e);
    }
  };

  const openTlRef = useRef(null);
  const closeTweenRef = useRef(null);
  const spinTweenRef = useRef(null);
  const textCycleAnimRef = useRef(null);
  const colorTweenRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const busyRef = useRef(false);
  const itemEntranceTweenRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      const plusH = plusHRef.current;
      const plusV = plusVRef.current;
      const icon = iconRef.current;
      const textInner = textInnerRef.current;
      if (!panel || !plusH || !plusV || !icon || !textInner) return;

      let preLayers = [];
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer'));
      }
      preLayerElsRef.current = preLayers;

      const offscreen = position === 'left' ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen });
      gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 });
      gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 });
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
      gsap.set(textInner, { yPercent: 0 });
      if (toggleBtnRef.current) gsap.set(toggleBtnRef.current, { color: menuButtonColor });
    });
    return () => ctx.revert();
  }, [menuButtonColor, position]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }
    itemEntranceTweenRef.current?.kill();

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
    const numberEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));
    const socialTitle = panel.querySelector('.sm-socials-title');
    const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link'));

    const layerStates = layers.map(el => ({ el, start: Number(gsap.getProperty(el, 'xPercent')) }));
    const panelStart = Number(gsap.getProperty(panel, 'xPercent'));

    if (itemEls.length) {
      gsap.set(itemEls, { yPercent: 140, rotate: 10 });
    }
    if (numberEls.length) {
      gsap.set(numberEls, { '--sm-num-opacity': 0 });
    }
    if (socialTitle) {
      gsap.set(socialTitle, { opacity: 0 });
    }
    if (socialLinks.length) {
      gsap.set(socialLinks, { y: 25, opacity: 0 });
    }

    const tl = gsap.timeline({ paused: true });

    layerStates.forEach((ls, i) => {
      tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07);
    });
    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
    const panelDuration = 0.65;
    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: 'power4.out' },
      panelInsertTime
    );

    if (itemEls.length) {
      const itemsStartRatio = 0.15;
      const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;
      tl.to(
        itemEls,
        {
          yPercent: 0,
          rotate: 0,
          duration: 1,
          ease: 'power4.out',
          stagger: { each: 0.1, from: 'start' }
        },
        itemsStart
      );
      if (numberEls.length) {
        tl.to(
          numberEls,
          {
            duration: 0.6,
            ease: 'power2.out',
            '--sm-num-opacity': 1,
            stagger: { each: 0.08, from: 'start' }
          },
          itemsStart + 0.1
        );
      }
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.4;
      if (socialTitle) {
        tl.to(
          socialTitle,
          {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out'
          },
          socialsStart
        );
      }
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: 'power3.out',
            stagger: { each: 0.08, from: 'start' },
            onComplete: () => {
              gsap.set(socialLinks, { clearProps: 'opacity' });
            }
          },
          socialsStart + 0.04
        );
      }
    }

    openTlRef.current = tl;
    return tl;
  }, []);

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
    openTlRef.current = null;
    itemEntranceTweenRef.current?.kill();

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all = [...layers, panel];
    closeTweenRef.current?.kill();
    const offscreen = position === 'left' ? -100 : 100;
    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.32,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: () => {
        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
        if (itemEls.length) {
          gsap.set(itemEls, { yPercent: 140, rotate: 10 });
        }
        const numberEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));
        if (numberEls.length) {
          gsap.set(numberEls, { '--sm-num-opacity': 0 });
        }
        const socialTitle = panel.querySelector('.sm-socials-title');
        const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link'));
        if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
        if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });
        busyRef.current = false;
      }
    });
  }, [position]);

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

  const animateColor = useCallback(
    opening => {
      const btn = toggleBtnRef.current;
      if (!btn) return;
      colorTweenRef.current?.kill();
      if (changeMenuColorOnOpen) {
        const targetColor = opening ? openMenuButtonColor : menuButtonColor;
        colorTweenRef.current = gsap.to(btn, {
          color: targetColor,
          delay: 0.18,
          duration: 0.3,
          ease: 'power2.out'
        });
      } else {
        gsap.set(btn, { color: menuButtonColor });
      }
    },
    [openMenuButtonColor, menuButtonColor, changeMenuColorOnOpen]
  );

  React.useEffect(() => {
    if (toggleBtnRef.current) {
      if (changeMenuColorOnOpen) {
        const targetColor = openRef.current ? openMenuButtonColor : menuButtonColor;
        gsap.set(toggleBtnRef.current, { color: targetColor });
      } else {
        gsap.set(toggleBtnRef.current, { color: menuButtonColor });
      }
    }
  }, [changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor]);

  const animateText = useCallback(opening => {
    const inner = textInnerRef.current;
    if (!inner) return;
    textCycleAnimRef.current?.kill();

    const currentLabel = opening ? 'Menu' : 'Close';
    const targetLabel = opening ? 'Close' : 'Menu';
    const cycles = 3;
    const seq = [currentLabel];
    let last = currentLabel;
    for (let i = 0; i < cycles; i++) {
      last = last === 'Menu' ? 'Close' : 'Menu';
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

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);
    if (!target) {
      setView('menu');
    }
    if (target) {
      onMenuOpen?.();
      playOpen();
    } else {
      onMenuClose?.();
      playClose();
    }
    animateIcon(target);
    animateColor(target);
    animateText(target);
  }, [playOpen, playClose, animateIcon, animateColor, animateText, onMenuOpen, onMenuClose]);

  const handleViewChange = (targetView) => {
    const inner = panelRef.current?.querySelector('.sm-panel-inner');
    if (!inner) {
      setView(targetView);
      return;
    }

    gsap.to(inner, {
      opacity: 0,
      x: targetView === 'chat' ? -15 : 15,
      duration: 0.18,
      ease: 'power2.out',
      onComplete: () => {
        setView(targetView);
        gsap.fromTo(inner,
          { opacity: 0, x: targetView === 'chat' ? 15 : -15 },
          { opacity: 1, x: 0, duration: 0.3, ease: 'power3.out' }
        );
      }
    });
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const userMessage = {
      id: Date.now(),
      text: userText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    const typingId = Date.now() + 1;
    setMessages(prev => [...prev, {
      id: typingId,
      text: "Thinking...",
      sender: 'ai',
      timestamp: new Date()
    }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text
            })),
            { role: "user", content: userText }
          ]
        })
      });

      if (!response.ok) throw new Error("API request failed");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let replyText = "";

      setMessages(prev => prev.map(m => m.id === typingId ? { ...m, text: "" } : m));

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            const cleanLine = line.trim();
            if (cleanLine.startsWith("data: ")) {
              const dataStr = cleanLine.substring(6);
              if (dataStr === "[DONE]") {
                done = true;
                break;
              }
              try {
                const parsed = JSON.parse(dataStr);
                const delta = parsed.choices?.[0]?.delta?.content || "";
                replyText += delta;
                setMessages(prev => prev.map(m => m.id === typingId ? { ...m, text: replyText } : m));
              } catch {
                // Ignore parse errors for partial chunks
              }
            }
          }
        }
      }
    } catch {
      setMessages(prev => prev.map(m => m.id === typingId ? { ...m, text: "Connection error. Reverting to local responder: Ask me about Rumi, Cloudcode, or Stats." } : m));
    }
  };

  return (
    <div
      className={(className ? className + ' ' : '') + 'staggered-menu-wrapper' + (isFixed ? ' fixed-wrapper' : '')}
      style={accentColor ? { ['--sm-accent']: accentColor } : undefined}
      data-position={position}
      data-open={open || undefined}
    >
      <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
        {(() => {
          const raw = colors && colors.length ? colors.slice(0, 4) : ['#1e1e22', '#35353c'];
          let arr = [...raw];
          if (arr.length >= 3) {
            const mid = Math.floor(arr.length / 2);
            arr.splice(mid, 1);
          }
          return arr.map((c, i) => <div key={i} className="sm-prelayer" style={{ background: c }} />);
        })()}
      </div>
      <header className="staggered-menu-header" aria-label="Main navigation header">
        <div className="sm-logo" aria-label="Logo">
          <span className="sm-logo-avatar">
            <img
              src={logoUrl || '/src/assets/logos/reactbits-gh-white.svg'}
              alt="Logo"
              className="sm-logo-img"
              draggable={false}
              width={38}
              height={38}
            />
          </span>
          {wordmarkUrl && (
            <img
              src={wordmarkUrl}
              alt={wordmarkAlt}
              className="sm-logo-wordmark"
              draggable={false}
              width={132}
              height={38}
            />
          )}
        </div>
        <button
          ref={toggleBtnRef}
          className="sm-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="staggered-menu-panel"
          onClick={toggleMenu}
          type="button"
        >
          <span ref={textWrapRef} className="sm-toggle-textWrap" aria-hidden="true">
            <span ref={textInnerRef} className="sm-toggle-textInner">
              {textLines.map((l, i) => (
                <span className="sm-toggle-line" key={i}>
                  {l}
                </span>
              ))}
            </span>
          </span>
          <span ref={iconRef} className="sm-icon" aria-hidden="true">
            <span ref={plusHRef} className="sm-icon-line" />
            <span ref={plusVRef} className="sm-icon-line sm-icon-line-v" />
          </span>
        </button>
      </header>

      <aside id="staggered-menu-panel" ref={panelRef} className="staggered-menu-panel" aria-hidden={!open}>
        <div className="sm-panel-inner">
          {view === 'menu' ? (
            <>
              <ul className="sm-panel-list" role="list" data-numbering={displayItemNumbering || undefined}>
                {items && items.length ? (
                  items.map((it, idx) => (
                    <li className="sm-panel-itemWrap" key={it.label + idx}>
                      <a className="sm-panel-item" href={it.link} aria-label={it.ariaLabel} data-index={idx + 1}>
                        <span className="sm-panel-itemLabel">{it.label}</span>
                      </a>
                    </li>
                  ))
                ) : null}
                <li className="sm-panel-itemWrap">
                  <button
                    className="sm-panel-item"
                    onClick={() => handleViewChange('chat')}
                    style={{ background: "transparent", border: "none", textAlign: "left", width: "100%", padding: 0 }}
                  >
                    <span className="sm-panel-itemLabel">Ask AI</span>
                  </button>
                </li>
              </ul>
              {displaySocials && socialItems && socialItems.length > 0 && (
                <div className="sm-socials" aria-label="Social links">
                  <h3 className="sm-socials-title">Socials</h3>
                  <ul className="sm-socials-list" role="list">
                    {socialItems.map((s, i) => (
                      <li key={s.label + i} className="sm-socials-item">
                        <a href={s.link} target="_blank" rel="noopener noreferrer" className="sm-socials-link">
                          {s.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="sm-chat-container">
              <div className="sm-chat-header">
                <button onClick={() => handleViewChange('menu')} className="sm-chat-back-btn">
                  &lt; Back to Menu
                </button>
                <span className="sm-chat-title">Habuki</span>
              </div>
              <div className="sm-chat-messages">
                {messages.length === 0 ? (
                  <div className="sm-chat-empty">
                    <div className="sm-console-line info">[INFO] Session initiated.</div>
                    <div className="sm-console-line sys">[SYS] Welcome, Any questions?</div>
                  </div>
                ) : (
                  messages.map((message) => {
                    const { thinking, content } = parseMessageText(message.text);
                    return (
                      <div key={message.id} className={`sm-chat-message ${message.sender}`}>
                        <div className="sm-chat-message-content">
                          {thinking && (
                            <details className="sm-chat-thinking" open={message.sender === 'ai' && !content}>
                              <summary>System Thoughts...</summary>
                              <div className="sm-chat-thinking-text">{thinking}</div>
                            </details>
                          )}
                          {content && (
                            <div className="sm-chat-message-text">{renderMessageText(content)}</div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatMessagesEndRef} />
              </div>
              <form onSubmit={handleChatSubmit} className="sm-chat-input-form">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask Habuki ..."
                />
                <button type="submit" disabled={!inputValue.trim()}>
                  Ask
                </button>
              </form>

              <div className="sm-chat-live2d-wrap">
                <canvas id="live2d4" width="220" height="220" />
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default StaggeredMenu;
