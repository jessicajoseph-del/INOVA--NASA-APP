import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Activity,
  Heart,
  Shield,
  Zap,
  Compass,
  Cpu,
  Radio,
  Sparkles,
  Maximize2,
  RefreshCw,
  X,
  Layers,
  MousePointer2,
  Hand,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

const WS_URL = 'ws://localhost:8765';

export default function JarvisTouchlessHud({ onClose, onLaunchObservatory }) {
  // WebSocket and Hand Tracker State
  const [wsStatus, setWsStatus] = useState('CONNECTING'); // 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING'
  const [trackingData, setTrackingData] = useState({
    x: 0.5,
    y: 0.5,
    gesture: 'IDLE',
    is_tracking: false,
    pinch_distance: 1.0,
    fps: 0,
  });

  // Simulation mode allows using mouse to test gestures without webcam
  const [simMode, setSimMode] = useState(false);
  const [radialMenuOpen, setRadialMenuOpen] = useState(false);
  const [activeRadialIndex, setActiveRadialIndex] = useState(null);
  const [actionMessage, setActionMessage] = useState('SYSTEM NOMINAL // STANDBY');

  // Floating draggable cards
  const [cards, setCards] = useState([
    {
      id: 'flight',
      title: 'ORBITAL FLIGHT VECTOR',
      category: 'NAVIGATION // T-MINUS 04:22',
      x: 80,
      y: 120,
      width: 340,
      height: 240,
      accent: '#f6eedb',
      icon: Compass,
      stats: [
        { label: 'ORBIT VELOCITY', val: '7.82 km/s' },
        { label: 'APOGEE ALT', val: '418.5 km' },
        { label: 'TRAJECTORY LOCK', val: 'SYNCHRONIZED' },
      ],
    },
    {
      id: 'biometrics',
      title: 'SUIT BIOMETRICS CORE',
      category: 'EVA-04 TELEMETRY',
      x: 460,
      y: 140,
      width: 340,
      height: 240,
      accent: '#ead9b2',
      icon: Heart,
      stats: [
        { label: 'HEART RATE', val: '72 BPM' },
        { label: 'O2 RESERVE', val: '99.4 %' },
        { label: 'CORE TEMP', val: '36.8 °C' },
      ],
    },
    {
      id: 'reactor',
      title: 'QUANTUM CORE REACTOR',
      category: 'POWER GRID // AUX-01',
      x: 840,
      y: 120,
      width: 340,
      height: 240,
      accent: '#f6eedb',
      icon: Zap,
      stats: [
        { label: 'OUTPUT LEVEL', val: '94.2 GW' },
        { label: 'FIELD STABILITY', val: '99.98 %' },
        { label: 'COOLANT FLOW', val: '4.8 L/s' },
      ],
    },
  ]);

  // Dragging state
  const [draggingCardId, setDraggingCardId] = useState(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const prevGestureRef = useRef('IDLE');
  const wsRef = useRef(null);

  // Screen-space cursor coordinates
  const cursorScreenX = trackingData.x * (typeof window !== 'undefined' ? window.innerWidth : 1200);
  const cursorScreenY = trackingData.y * (typeof window !== 'undefined' ? window.innerHeight : 800);

  // ── 1. WEBSOCKET CONNECTION TO TRACKER.PY ──────────────────────────────────
  useEffect(() => {
    const isLocalHost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (!isLocalHost) {
      setWsStatus('DISCONNECTED');
      setSimMode(true);
      setActionMessage('SIMULATOR ACTIVE // USE MOUSE TO TEST GESTURES');
      return;
    }

    let reconnectTimer = null;
    let isMounted = true;
    let attempts = 0;

    const connectWebSocket = () => {
      if (attempts >= 2) {
        setWsStatus('DISCONNECTED');
        setSimMode(true);
        setActionMessage('SIMULATOR ACTIVE // LOCAL TRACKER OFFLINE');
        return;
      }
      attempts += 1;
      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return;
          attempts = 0;
          setWsStatus('CONNECTED');
          setActionMessage('RIDGE WEBSOCKET ONLINE // TRACKING ACTIVE');
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            setTrackingData((prev) => ({
              ...prev,
              ...data,
            }));
          } catch (e) {
            console.error('Failed to parse tracker payload:', e);
          }
        };

        ws.onclose = () => {
          if (!isMounted) return;
          setWsStatus('DISCONNECTED');
          reconnectTimer = setTimeout(connectWebSocket, 2000);
        };

        ws.onerror = () => {
          if (!isMounted) return;
          setWsStatus('DISCONNECTED');
          ws.close();
        };
      } catch (e) {
        setWsStatus('DISCONNECTED');
        reconnectTimer = setTimeout(connectWebSocket, 2500);
      }
    };

    connectWebSocket();

    return () => {
      isMounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // ── 2. GESTURE EVENT DISPATCHER ───────────────────────────────────────────
  useEffect(() => {
    const currentGesture = trackingData.gesture;
    const prevGesture = prevGestureRef.current;
    prevGestureRef.current = currentGesture;

    // A. OPEN_PALM Gesture: Toggle Radial Quick-Action Menu
    if (currentGesture === 'OPEN_PALM') {
      setRadialMenuOpen(true);
      setActionMessage('GESTURE: OPEN_PALM → RADIAL MENU OPENED');
    } else if (prevGesture === 'OPEN_PALM' && currentGesture === 'POINT') {
      // Keep menu open while pointing at items, or let user pick an action
    }

    // B. PINCH Gesture: Click or Drag initiation
    if (currentGesture === 'PINCH') {
      if (!draggingCardId) {
        // Find which card the cursor is hovering over
        const hoveredCard = cards.find((card) => {
          return (
            cursorScreenX >= card.x &&
            cursorScreenX <= card.x + card.width &&
            cursorScreenY >= card.y &&
            cursorScreenY <= card.y + card.height
          );
        });

        if (hoveredCard) {
          setDraggingCardId(hoveredCard.id);
          dragOffsetRef.current = {
            x: cursorScreenX - hoveredCard.x,
            y: cursorScreenY - hoveredCard.y,
          };
          setActionMessage(`GESTURE: PINCH → DRAGGING [${hoveredCard.title}]`);
        }
      }
    } else {
      // Release drag if gesture is not PINCH
      if (draggingCardId) {
        setDraggingCardId(null);
        setActionMessage('GESTURE RELEASED → CARD ANCHORED');
      }
    }
  }, [trackingData.gesture, cursorScreenX, cursorScreenY, cards, draggingCardId]);

  // ── 3. UPDATE POSITION OF DRAGGED CARD ────────────────────────────────────
  useEffect(() => {
    if (!draggingCardId) return;

    setCards((prevCards) =>
      prevCards.map((card) => {
        if (card.id !== draggingCardId) return card;
        const newX = Math.max(10, Math.min(window.innerWidth - card.width - 10, cursorScreenX - dragOffsetRef.current.x));
        const newY = Math.max(70, Math.min(window.innerHeight - card.height - 10, cursorScreenY - dragOffsetRef.current.y));
        return {
          ...card,
          x: newX,
          y: newY,
        };
      })
    );
  }, [cursorScreenX, cursorScreenY, draggingCardId]);

  // ── 4. RADIAL QUICK-ACTION MENU ACTIONS ──────────────────────────────────
  const radialActions = [
    { label: 'VITAL SCAN', icon: Activity, action: () => onLaunchObservatory?.() },
    { label: 'ORBIT WARP', icon: Compass, action: () => setActionMessage('ORBITAL WARP VECTOR ENGAGED') },
    { label: 'REACTOR BOOST', icon: Zap, action: () => setActionMessage('QUANTUM REACTOR BOOSTED TO 120%') },
    { label: 'SECURITY LOCK', icon: Shield, action: () => setActionMessage('SUIT SECURITY ENCRYPTION LOCKED') },
    { label: 'LIFE SUPPORT', icon: Heart, action: () => setActionMessage('LIFE SUPPORT FLOW RE-BALANCED') },
    { label: 'DISMISS', icon: X, action: () => setRadialMenuOpen(false) },
  ];

  const handleSelectRadialItem = (item) => {
    item.action();
    setRadialMenuOpen(false);
  };

  // ── 5. MOUSE SIMULATION FALLBACK (WHEN WEBCAM IS OFF) ────────────────────
  const handleMouseMove = (e) => {
    if (!simMode && wsStatus === 'CONNECTED') return;
    const nx = e.clientX / window.innerWidth;
    const ny = e.clientY / window.innerHeight;
    setTrackingData((prev) => ({
      ...prev,
      x: nx,
      y: ny,
      is_tracking: true,
    }));
  };

  const handleMouseDown = () => {
    if (!simMode && wsStatus === 'CONNECTED') return;
    setTrackingData((prev) => ({
      ...prev,
      gesture: 'PINCH',
      pinch_distance: 0.02,
    }));
  };

  const handleMouseUp = () => {
    if (!simMode && wsStatus === 'CONNECTED') return;
    setTrackingData((prev) => ({
      ...prev,
      gesture: 'POINT',
      pinch_distance: 0.12,
    }));
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#06132b',
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(14, 40, 89, 0.55) 0%, rgba(6, 19, 43, 0.96) 100%),
          linear-gradient(rgba(246, 238, 219, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(246, 238, 219, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 40px 40px, 40px 40px',
        color: '#f6eedb',
        fontFamily: 'monospace',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* ── TOP SCI-FI TELEMETRY HEADER ───────────────────────────────── */}
      <header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          borderBottom: '1px solid rgba(246, 238, 219, 0.18)',
          background: 'rgba(6, 19, 43, 0.86)',
          backdropFilter: 'blur(20px)',
          zIndex: 50,
        }}
      >
        {/* Left: Branding & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: wsStatus === 'CONNECTED' ? '#f6eedb' : '#ead9b2',
              boxShadow: wsStatus === 'CONNECTED' ? '0 0 14px #f6eedb' : '0 0 14px #ead9b2',
            }}
          />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.22em', color: '#f6eedb' }}>
              RIDGE // TOUCHLESS DESKTOP HUD
            </div>
            <div style={{ fontSize: '0.68rem', color: '#9fb6da', letterSpacing: '0.12em' }}>
              WS PORT: 8765 • STATUS:{' '}
              <span style={{ color: '#ead9b2', fontWeight: 600 }}>
                {wsStatus === 'CONNECTED' ? 'ONLINE (TRACKING)' : 'AWAITING TRACKER.PY'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Action Banner */}
        <div
          style={{
            padding: '6px 18px',
            borderRadius: '9999px',
            background: 'rgba(246, 238, 219, 0.08)',
            border: '1px solid rgba(246, 238, 219, 0.3)',
            fontSize: '0.72rem',
            color: '#f6eedb',
            letterSpacing: '0.15em',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Sparkles size={13} />
          <span>{actionMessage}</span>
        </div>

        {/* Right: Controls & Diagnostics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Simulation Mode Toggle Button */}
          <button
            type="button"
            onClick={() => setSimMode(!simMode)}
            style={{
              background: simMode ? '#f6eedb' : 'rgba(10, 28, 63, 0.72)',
              border: `1px solid ${simMode ? '#f6eedb' : 'rgba(246, 238, 219, 0.24)'}`,
              color: simMode ? '#06132b' : '#f6eedb',
              fontWeight: simMode ? 700 : 500,
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.7rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <MousePointer2 size={13} />
            <span>{simMode ? 'SIMULATOR ON' : 'SIMULATOR OFF'}</span>
          </button>

          {/* Open Palm Toggle Button */}
          <button
            type="button"
            onClick={() => setRadialMenuOpen(!radialMenuOpen)}
            style={{
              background: radialMenuOpen ? '#f6eedb' : 'rgba(10, 28, 63, 0.72)',
              border: `1px solid ${radialMenuOpen ? '#f6eedb' : 'rgba(246, 238, 219, 0.24)'}`,
              color: radialMenuOpen ? '#06132b' : '#f6eedb',
              fontWeight: radialMenuOpen ? 700 : 500,
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.7rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Hand size={13} />
            <span>RADIAL MENU</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(246, 238, 219, 0.12)',
                border: '1px solid rgba(246, 238, 219, 0.35)',
                color: '#f6eedb',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.7rem',
                cursor: 'pointer',
              }}
            >
              ✕ EXIT
            </button>
          )}
        </div>
      </header>

      {/* ── CORNER RETICLES ───────────────────────────────────────────── */}
      <div style={{ position: 'absolute', top: '74px', left: '16px', width: '20px', height: '20px', borderTop: '2px solid #ead9b2', borderLeft: '2px solid #ead9b2' }} />
      <div style={{ position: 'absolute', top: '74px', right: '16px', width: '20px', height: '20px', borderTop: '2px solid #ead9b2', borderRight: '2px solid #ead9b2' }} />
      <div style={{ position: 'absolute', bottom: '16px', left: '16px', width: '20px', height: '20px', borderBottom: '2px solid #ead9b2', borderLeft: '2px solid #ead9b2' }} />
      <div style={{ position: 'absolute', bottom: '16px', right: '16px', width: '20px', height: '20px', borderBottom: '2px solid #ead9b2', borderRight: '2px solid #ead9b2' }} />

      {/* ── FLOATING DRAGGABLE CARDS ─────────────────────────────────── */}
      {cards.map((card) => {
        const isHovered =
          cursorScreenX >= card.x &&
          cursorScreenX <= card.x + card.width &&
          cursorScreenY >= card.y &&
          cursorScreenY <= card.y + card.height;

        const isBeingDragged = draggingCardId === card.id;
        const IconComponent = card.icon;

        return (
          <div
            key={card.id}
            style={{
              position: 'absolute',
              left: `${card.x}px`,
              top: `${card.y}px`,
              width: `${card.width}px`,
              height: `${card.height}px`,
              borderRadius: '16px',
              backgroundColor: isBeingDragged
                ? 'rgba(14, 40, 89, 0.9)'
                : isHovered
                ? 'rgba(10, 28, 63, 0.88)'
                : 'rgba(10, 28, 63, 0.78)',
              backdropFilter: 'blur(16px)',
              border: isBeingDragged
                ? '2px solid #f6eedb'
                : isHovered
                ? '1.5px solid #ead9b2'
                : '1px solid rgba(246, 238, 219, 0.2)',
              boxShadow: isBeingDragged
                ? '0 0 35px rgba(246, 238, 219, 0.35), 0 20px 40px rgba(3, 10, 24, 0.8)'
                : isHovered
                ? '0 0 25px rgba(246, 238, 219, 0.22), 0 15px 30px rgba(3, 10, 24, 0.7)'
                : '0 10px 25px rgba(3, 10, 24, 0.5)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: isBeingDragged ? 'none' : 'transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s',
              transform: isBeingDragged ? 'scale(1.04)' : isHovered ? 'scale(1.02)' : 'scale(1.0)',
              cursor: isBeingDragged ? 'grabbing' : 'grab',
              zIndex: isBeingDragged ? 40 : isHovered ? 30 : 20,
            }}
          >
            {/* Header */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.65rem', color: card.accent, letterSpacing: '0.18em' }}>
                  {card.category}
                </span>
                <IconComponent size={18} color={card.accent} />
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f6eedb', margin: 0, letterSpacing: '0.08em' }}>
                {card.title}
              </h3>
            </div>

            {/* Metrics List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '14px 0' }}>
              {card.stats.map((st, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(246,238,219,0.1)', paddingBottom: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#9fb6da', letterSpacing: '0.1em' }}>{st.label}</span>
                  <span style={{ fontSize: '0.78rem', color: '#f6eedb', fontWeight: 600 }}>{st.val}</span>
                </div>
              ))}
            </div>

            {/* Bottom Status / Pinch Drag Prompt */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.64rem', color: isBeingDragged ? '#f6eedb' : isHovered ? '#ead9b2' : '#9fb6da' }}>
              <span>{isBeingDragged ? '● DRAGGING WITH PINCH' : isHovered ? 'PINCH FINGERS TO DRAG' : 'HOVER TO ENGAGE'}</span>
              <span>GRID-SNAP: ON</span>
            </div>
          </div>
        );
      })}

      {/* ── BOTTOM TERMINAL / TRACKER INSTRUCTIONS PANEL ─────────────── */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '32px',
          width: '440px',
          background: 'rgba(10, 28, 63, 0.88)',
          border: '1px solid rgba(246, 238, 219, 0.22)',
          backdropFilter: 'blur(20px)',
          borderRadius: '12px',
          padding: '16px 20px',
          zIndex: 35,
        }}
      >
        <div style={{ fontSize: '0.72rem', color: '#f6eedb', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '8px' }}>
          TRACKER TELEMETRY // PYTHON OPENCV
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.68rem', marginBottom: '12px' }}>
          <div>GESTURE: <span style={{ color: '#f6eedb', fontWeight: 700 }}>{trackingData.gesture}</span></div>
          <div>HAND LOCKED: <span style={{ color: trackingData.is_tracking ? '#f6eedb' : '#ead9b2' }}>{trackingData.is_tracking ? 'YES' : 'NO'}</span></div>
          <div>PINCH DIST: <span style={{ color: '#ead9b2' }}>{trackingData.pinch_distance}</span></div>
          <div>FPS: <span style={{ color: '#f6eedb' }}>{trackingData.fps}</span></div>
          <div>X COORD: <span style={{ color: '#f6eedb' }}>{(trackingData.x * 100).toFixed(1)}%</span></div>
          <div>Y COORD: <span style={{ color: '#f6eedb' }}>{(trackingData.y * 100).toFixed(1)}%</span></div>
        </div>

        <div style={{ fontSize: '0.62rem', color: '#9fb6da', lineHeight: 1.5, borderTop: '1px solid rgba(246,238,219,0.12)', paddingTop: '8px' }}>
          Run backend in terminal: <code style={{ color: '#f6eedb' }}>python tracker.py</code>
          <br />
          👉 <strong>POINT</strong>: Move Cursor &nbsp;|&nbsp; 🤏 <strong>PINCH</strong>: Drag Card &nbsp;|&nbsp; 🖐️ <strong>OPEN PALM</strong>: Menu
        </div>
      </div>

      {/* ── RADIAL QUICK-ACTION MENU (OPENS ON OPEN_PALM) ─────────────── */}
      {radialMenuOpen && (
        <div
          style={{
            position: 'absolute',
            left: `${cursorScreenX}px`,
            top: `${cursorScreenY}px`,
            transform: 'translate(-50%, -50%)',
            width: '320px',
            height: '320px',
            pointerEvents: 'auto',
            zIndex: 60,
          }}
        >
          {/* Outer Holographic Energy Ring */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px dashed rgba(246, 238, 219, 0.45)',
              animation: 'spin 20s linear infinite',
              boxShadow: '0 0 50px rgba(246, 238, 219, 0.2)',
            }}
          />

          {/* Center Holographic Core */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(246, 238, 219, 0.22) 0%, rgba(6, 19, 43, 0.96) 100%)',
              border: '1.5px solid #f6eedb',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.62rem',
              color: '#f6eedb',
              fontWeight: 700,
              textAlign: 'center',
              boxShadow: '0 0 20px rgba(246, 238, 219, 0.35)',
            }}
          >
            <span>RIDGE</span>
            <span style={{ fontSize: '0.5rem', color: '#ead9b2' }}>RADIAL</span>
          </div>

          {/* Radial Action Buttons */}
          {radialActions.map((item, idx) => {
            const angle = (idx / radialActions.length) * (2 * Math.PI) - Math.PI / 2;
            const radius = 115;
            const itemX = 160 + radius * Math.cos(angle);
            const itemY = 160 + radius * Math.sin(angle);
            const ItemIcon = item.icon;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectRadialItem(item)}
                onMouseEnter={() => setActiveRadialIndex(idx)}
                onMouseLeave={() => setActiveRadialIndex(null)}
                style={{
                  position: 'absolute',
                  left: `${itemX}px`,
                  top: `${itemY}px`,
                  transform: 'translate(-50%, -50%)',
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: activeRadialIndex === idx ? '#f6eedb' : 'rgba(10, 28, 63, 0.88)',
                  border: `1.5px solid ${activeRadialIndex === idx ? '#f6eedb' : 'rgba(246, 238, 219, 0.3)'}`,
                  color: activeRadialIndex === idx ? '#06132b' : '#f6eedb',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  boxShadow: activeRadialIndex === idx ? '0 0 25px rgba(246, 238, 219, 0.5)' : 'none',
                  transition: 'all 0.15s ease',
                  outline: 'none',
                }}
              >
                <ItemIcon size={16} color={activeRadialIndex === idx ? '#06132b' : '#ead9b2'} />
                <span style={{ fontSize: '0.52rem', fontWeight: 600, letterSpacing: '0.05em', textAlign: 'center', lineHeight: 1.1 }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── 6. CUSTOM GLOWING VIRTUAL CURSOR (HAND POSITION) ──────────── */}
      <div
        style={{
          position: 'absolute',
          left: `${cursorScreenX}px`,
          top: `${cursorScreenY}px`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 9999,
          transition: 'transform 0.04s ease-out',
        }}
      >
        {/* Reticle Ring */}
        <div
          style={{
            width: trackingData.gesture === 'PINCH' ? '28px' : trackingData.gesture === 'OPEN_PALM' ? '54px' : '40px',
            height: trackingData.gesture === 'PINCH' ? '28px' : trackingData.gesture === 'OPEN_PALM' ? '54px' : '40px',
            borderRadius: '50%',
            border: `2px solid ${trackingData.gesture === 'PINCH' ? '#f6eedb' : '#ead9b2'}`,
            boxShadow: `0 0 20px ${trackingData.gesture === 'PINCH' ? '#f6eedb' : '#ead9b2'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.12s ease',
            position: 'relative',
          }}
        >
          {/* Center Target Dot */}
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#f6eedb',
            }}
          />

          {/* Crosshair Ticks */}
          <div style={{ position: 'absolute', top: '-6px', width: '2px', height: '6px', backgroundColor: '#f6eedb' }} />
          <div style={{ position: 'absolute', bottom: '-6px', width: '2px', height: '6px', backgroundColor: '#f6eedb' }} />
          <div style={{ position: 'absolute', left: '-6px', width: '6px', height: '2px', backgroundColor: '#f6eedb' }} />
          <div style={{ position: 'absolute', right: '-6px', width: '6px', height: '2px', backgroundColor: '#f6eedb' }} />
        </div>

        {/* Floating Gesture Tag */}
        <div
          style={{
            position: 'absolute',
            top: '44px',
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            fontSize: '0.62rem',
            padding: '2px 8px',
            borderRadius: '4px',
            background: 'rgba(6, 19, 43, 0.9)',
            border: '1px solid rgba(246, 238, 219, 0.4)',
            color: '#f6eedb',
            letterSpacing: '0.12em',
            boxShadow: '0 0 10px rgba(3, 10, 24, 0.8)',
          }}
        >
          {trackingData.gesture}
        </div>
      </div>
    </div>
  );
}

