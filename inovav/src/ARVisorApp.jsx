import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { OrbitControls } from '@react-three/drei';
import { HumanObservatoryModel } from './HumanObservatoryModel';

// Configure WebXR store with DOM Overlay for the Visor HUD & hit testing
export const xrStore = createXRStore({
  domOverlay: true,
  hitTest: true,
});

export default function ARVisorApp({ activeOrgan: propActiveOrgan = 'heart', vitals, onSelectOrgan, onClose }) {
  const overlayRef = useRef(null);
  const [activeOrgan, setActiveOrgan] = useState(propActiveOrgan);
  const [arStatus, setArStatus] = useState('STANDBY // 2D SIMULATION');
  const [arError, setArError] = useState(null);

  // Sync internal organ state if prop changes
  useEffect(() => {
    if (propActiveOrgan) {
      setActiveOrgan(propActiveOrgan);
    }
  }, [propActiveOrgan]);

  const handleSelectOrgan = (organ) => {
    setActiveOrgan(organ);
    onSelectOrgan?.(organ);
  };

  const handleEnterAR = async () => {
    try {
      setArError(null);
      setArStatus('REQUESTING IMMERSIVE AR PASSTHROUGH...');
      await xrStore.enterAR();
      setArStatus('IMMERSIVE AR ACTIVE // PASSTHROUGH ENGAGED');
    } catch (err) {
      console.warn('WebXR AR entry:', err);
      setArError('WebXR Immersive AR requires ARCore/ARKit or a WebXR headset (Quest 3, Vision Pro). 3D world simulation active.');
      setArStatus('SIMULATION MODE // ORBIT ENABLED');
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        backgroundColor: '#020409',
        overflow: 'hidden',
      }}
    >
      {/* ── 1. VISOR HUD OVERLAY (RENDERS OVER CAMERA PASSTHROUGH IN AR) ── */}
      <div
        ref={overlayRef}
        id="visor-hud"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px',
          border: '2px solid rgba(78, 168, 222, 0.35)',
          boxShadow: 'inset 0 0 60px rgba(78, 168, 222, 0.15)',
          fontFamily: 'monospace',
          color: '#90e0ef',
        }}
      >
        {/* Tactical Corner HUD Reticles */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', width: '16px', height: '16px', borderTop: '2px solid #00D8FF', borderLeft: '2px solid #00D8FF' }} />
        <div style={{ position: 'absolute', top: '12px', right: '12px', width: '16px', height: '16px', borderTop: '2px solid #00D8FF', borderRight: '2px solid #00D8FF' }} />
        <div style={{ position: 'absolute', bottom: '12px', left: '12px', width: '16px', height: '16px', borderBottom: '2px solid #00D8FF', borderLeft: '2px solid #00D8FF' }} />
        <div style={{ position: 'absolute', bottom: '12px', right: '12px', width: '16px', height: '16px', borderBottom: '2px solid #00D8FF', borderRight: '2px solid #00D8FF' }} />

        {/* Top Visor Telemetry Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00D8FF', boxShadow: '0 0 10px #00D8FF', animation: 'pulse 1.5s infinite' }} />
              <div style={{ fontWeight: 700, letterSpacing: '0.15em' }}>SYS // BIOMETRIC VISOR ACTIVE</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ letterSpacing: '0.12em' }}>
                HR: <span style={{ color: '#ffffff', fontWeight: 700 }}>{vitals?.hr ?? 72}</span> BPM | O2: <span style={{ color: '#ffffff', fontWeight: 700 }}>{vitals?.o2 ?? 99}</span>% | BP: <span style={{ color: '#ffffff' }}>118/76</span>
              </div>

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    pointerEvents: 'auto',
                    background: 'rgba(255, 60, 60, 0.15)',
                    border: '1px solid rgba(255, 60, 60, 0.4)',
                    color: '#ff6b6b',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  ✕ EXIT VISOR
                </button>
              )}
            </div>
          </div>

          {/* Sub-bar Telemetry Status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', opacity: 0.8 }}>
            <div>STATUS: {arStatus}</div>
            <div>ACTIVE ORGAN TARGET: <span style={{ color: '#00D8FF', textTransform: 'uppercase', fontWeight: 700 }}>{activeOrgan || 'NONE'}</span></div>
          </div>

          {arError && (
            <div style={{ marginTop: '8px', padding: '6px 12px', background: 'rgba(0, 216, 255, 0.1)', border: '1px solid rgba(0, 216, 255, 0.3)', borderRadius: '4px', fontSize: '0.7rem', color: '#38BDF8' }}>
              ℹ {arError}
            </div>
          )}
        </div>

        {/* Center Target Crosshair / Spatial Guidance */}
        <div style={{ alignSelf: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.45 }}>
          <div style={{ width: '40px', height: '1px', background: '#00D8FF', marginBottom: '8px' }} />
          <div style={{ width: '1px', height: '40px', background: '#00D8FF', position: 'absolute' }} />
          <div style={{ fontSize: '0.62rem', letterSpacing: '0.2em', marginTop: '12px' }}>[ 1.5M WORLD ANCHOR LOCK ]</div>
        </div>

        {/* Bottom Visor Controls (Re-enable pointerEvents on buttons) */}
        <div>
          <div style={{ textAlign: 'center', fontSize: '0.68rem', marginBottom: '8px', opacity: 0.7, letterSpacing: '0.1em' }}>
            SELECT ANATOMICAL ORGAN SCAN OR WALK AROUND 3D HOLOGRAM
          </div>
          <div style={{ pointerEvents: 'auto', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleEnterAR}
              style={{
                background: 'linear-gradient(135deg, rgba(0, 216, 255, 0.35), rgba(0, 100, 200, 0.45))',
                border: '1.5px solid #00D8FF',
                color: '#ffffff',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(0, 216, 255, 0.4)',
                transition: 'all 0.2s ease',
              }}
            >
              ⚡ ENTER AR VISOR
            </button>

            <button
              type="button"
              onClick={() => handleSelectOrgan('heart')}
              style={{
                background: activeOrgan === 'heart' ? 'rgba(255, 34, 85, 0.35)' : 'rgba(10, 25, 45, 0.7)',
                border: `1px solid ${activeOrgan === 'heart' ? '#ff2255' : 'rgba(78, 168, 222, 0.4)'}`,
                color: activeOrgan === 'heart' ? '#ffffff' : '#90e0ef',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Scan Heart
            </button>

            <button
              type="button"
              onClick={() => handleSelectOrgan('liver')}
              style={{
                background: activeOrgan === 'liver' ? 'rgba(56, 189, 248, 0.35)' : 'rgba(10, 25, 45, 0.7)',
                border: `1px solid ${activeOrgan === 'liver' ? '#38BDF8' : 'rgba(78, 168, 222, 0.4)'}`,
                color: activeOrgan === 'liver' ? '#ffffff' : '#90e0ef',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Scan Liver
            </button>

            <button
              type="button"
              onClick={() => handleSelectOrgan('pancreas')}
              style={{
                background: activeOrgan === 'pancreas' ? 'rgba(56, 189, 248, 0.35)' : 'rgba(10, 25, 45, 0.7)',
                border: `1px solid ${activeOrgan === 'pancreas' ? '#38BDF8' : 'rgba(78, 168, 222, 0.4)'}`,
                color: activeOrgan === 'pancreas' ? '#ffffff' : '#90e0ef',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Scan Pancreas
            </button>

            <button
              type="button"
              onClick={() => handleSelectOrgan('brain')}
              style={{
                background: activeOrgan === 'brain' ? 'rgba(168, 85, 247, 0.35)' : 'rgba(10, 25, 45, 0.7)',
                border: `1px solid ${activeOrgan === 'brain' ? '#a855f7' : 'rgba(78, 168, 222, 0.4)'}`,
                color: activeOrgan === 'brain' ? '#ffffff' : '#90e0ef',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Scan Cranium
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. 3D CANVAS WITH TRANSPARENT BACKGROUND FOR CAMERA PASSTHROUGH ── */}
      <Canvas
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 0.1], fov: 65 }}
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 5 }}
      >
        <XR store={xrStore}>
          <ambientLight intensity={0.85} />
          <directionalLight position={[0, 4, 2]} intensity={1.2} />
          <pointLight position={[2, 3, 2]} intensity={1.5} color="#00D8FF" />
          <pointLight position={[-2, -1, -1]} intensity={0.8} color="#38BDF8" />

          {/* World-Anchored 3D Model: Placed 1.5m directly in front of the user/visor */}
          <group position={[0, -0.4, -1.5]} scale={0.85}>
            <HumanObservatoryModel
              activeOrgan={activeOrgan}
              onSelectOrgan={handleSelectOrgan}
            />
          </group>

          {/* Mouse / touch orbit navigation when inspecting in standard desktop/mobile browser */}
          <OrbitControls
            enableDamping
            dampingFactor={0.06}
            target={[0, -0.4, -1.5]}
            maxDistance={4.0}
            minDistance={0.5}
          />
        </XR>
      </Canvas>
    </div>
  );
}

