import React, { useState, useEffect, useRef } from 'react';
import TopNavigation from './TopNavigation';
import HealthMetricsPanel from './HealthMetricsPanel';
import HumanAnatomy3D from './HumanAnatomy3D';
import SystemLabels from './SystemLabels';
import SystemInformationPanel from './SystemInformationPanel';
import BottomNavigation from './BottomNavigation';
import PalmMouse from '../ar/PalmMouse';
import MissionHUD from '../experience/MissionHUD';

export default function VitalObservatoryApp({
  astronaut,
  onClose,
  isEmbedded = false,
  globalArEnabled = false,
}) {
  // activeSystem: null represents Initial Overview Screen (frame_0.5s.jpg)
  // 'cardiovascular' | 'skeletal' | 'immune' | 'nutrition' | 'sleep'
  const [activeSystem, setActiveSystem] = useState(null);
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [palmActive, setPalmActive] = useState(false);
  const [showMissionHUD, setShowMissionHUD] = useState(false);
  const demoTimerRef = useRef(null);

  const systems = ['cardiovascular', 'skeletal', 'immune', 'nutrition', 'sleep'];

  useEffect(() => {
    if (globalArEnabled) setPalmActive(false);
  }, [globalArEnabled]);

  const handleSwipeNext = () => {
    setActiveSystem((current) => {
      if (!current) return 'cardiovascular';
      const idx = systems.indexOf(current);
      return systems[(idx + 1) % systems.length];
    });
  };

  const handleSwipePrev = () => {
    setActiveSystem((current) => {
      if (!current) return 'sleep';
      const idx = systems.indexOf(current);
      return systems[(idx - 1 + systems.length) % systems.length];
    });
  };

  // Auto-demo mode sequence
  useEffect(() => {
    if (!isDemoActive) {
      if (demoTimerRef.current) clearInterval(demoTimerRef.current);
      return;
    }

    const sequence = [null, 'cardiovascular', 'skeletal', 'immune', 'nutrition', 'sleep'];
    let index = 0;

    demoTimerRef.current = setInterval(() => {
      index = (index + 1) % sequence.length;
      setActiveSystem(sequence[index]);
    }, 6000);

    return () => {
      if (demoTimerRef.current) clearInterval(demoTimerRef.current);
    };
  }, [isDemoActive]);

  const handleSelectSystem = (systemId) => {
    setIsDemoActive(false);
    setActiveSystem(systemId);
  };

  const handleResetToOverview = () => {
    setIsDemoActive(false);
    setActiveSystem(null);
  };

  const handleToggleDemo = () => {
    setIsDemoActive((prev) => !prev);
    if (!isDemoActive) {
      setActiveSystem('cardiovascular');
    }
  };

  return (
    <div
      id="monitor-health-section"
      style={{
        position: isEmbedded ? 'relative' : 'fixed',
        inset: isEmbedded ? 'auto' : 0,
        width: '100%',
        height: isEmbedded ? '980px' : '100%',
        minHeight: isEmbedded ? '850px' : '100vh',
        zIndex: isEmbedded ? 20 : 9999,
        backgroundColor: '#f6eedb',
        backgroundImage: `
          radial-gradient(circle at 50% 45%, rgba(246, 238, 219, 0.95) 0%, rgba(238, 226, 202, 0.98) 85%),
          linear-gradient(rgba(6, 19, 43, 0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(6, 19, 43, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 48px 48px, 48px 48px',
        color: '#06132b',
        overflow: 'hidden',
        userSelect: 'none',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* ── RETICLE CORNER TICKS AROUND MAIN ANATOMY VIEWPORT ── */}
      <div style={{ position: 'absolute', top: '72px', left: '24px', width: '16px', height: '16px', borderTop: '1px solid rgba(246, 238, 219, 0.35)', borderLeft: '1px solid rgba(246, 238, 219, 0.35)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '72px', right: '24px', width: '16px', height: '16px', borderTop: '1px solid rgba(246, 238, 219, 0.35)', borderRight: '1px solid rgba(246, 238, 219, 0.35)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '64px', left: '24px', width: '16px', height: '16px', borderBottom: '1px solid rgba(246, 238, 219, 0.35)', borderLeft: '1px solid rgba(246, 238, 219, 0.35)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '64px', right: '24px', width: '16px', height: '16px', borderBottom: '1px solid rgba(246, 238, 219, 0.35)', borderRight: '1px solid rgba(246, 238, 219, 0.35)', pointerEvents: 'none' }} />

      {/* ── 1. TOP NAVIGATION ── */}
      <TopNavigation
        activeSystem={activeSystem}
        onResetToOverview={handleResetToOverview}
        onClose={onClose}
        astronaut={astronaut}
        isDemoActive={isDemoActive}
        onToggleDemo={handleToggleDemo}
        onOpenMissionHUD={() => setShowMissionHUD(true)}
        palmActive={palmActive}
        onTogglePalm={() => setPalmActive((prev) => !prev)}
        globalArEnabled={globalArEnabled}
      />

      {/* ── 2. LEFT-SIDE HEALTH METRICS PANEL (SHOWN IN OVERVIEW) ── */}
      <HealthMetricsPanel isVisible={activeSystem === null} />

      {/* ── 3. BIOLOGICAL SYSTEM FLOATING LABELS (OVERVIEW MODE) ── */}
      <SystemLabels
        isVisible={activeSystem === null}
        onSelectSystem={handleSelectSystem}
        activeSystem={activeSystem}
      />

      {/* ── 4. CENTER 3D HUMAN ANATOMY & ENLARGED ORGAN STAGE ── */}
      <HumanAnatomy3D
        activeSystem={activeSystem}
        onSelectSystem={handleSelectSystem}
      />

      {/* ── 5. RIGHT-SIDE SCIENTIFIC SYSTEM INFORMATION PANEL (ZOOMED MODE) ── */}
      <SystemInformationPanel
        activeSystem={activeSystem}
        isVisible={activeSystem !== null}
      />

      {/* ── 6. BOTTOM NAVIGATION BAR ── */}
      <BottomNavigation
        activeSystem={activeSystem}
        onSelectSystem={handleSelectSystem}
        onResetToOverview={handleResetToOverview}
      />

      {/* ── 7. OFFLINE AR PALM SENSOR NAVIGATION ── */}
      <PalmMouse
        enabled={palmActive && !globalArEnabled}
        onSwipeNext={handleSwipeNext}
        onSwipePrev={handleSwipePrev}
      />

      {/* ── 8. 5-STEP MISSION HUD MODAL ── */}
      {showMissionHUD && (
        <MissionHUD
          astronaut={astronaut}
          globalArEnabled={globalArEnabled}
          onClose={() => setShowMissionHUD(false)}
        />
      )}
    </div>
  );
}

