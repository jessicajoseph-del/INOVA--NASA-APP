import React from 'react';
import { Menu, ChevronDown, Sparkles, X } from 'lucide-react';

export default function TopNavigation({
  activeSystem,
  onResetToOverview,
  onClose,
  astronaut,
  isDemoActive,
  onToggleDemo,
  onOpenMissionHUD,
  palmActive = false,
  onTogglePalm,
  globalArEnabled = false,
}) {
  const isZoomed = activeSystem !== null;

  return (
    <header
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '62px',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 50,
        pointerEvents: 'auto',
        background: 'linear-gradient(to bottom, rgba(6, 19, 43, 0.96), rgba(6, 19, 43, 0.45) 80%, transparent)',
        borderBottom: '1px solid rgba(246, 238, 219, 0.14)',
      }}
    >
      {/* ── LEFT: RIDGE LOGO & SYSTEM TITLE ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {isZoomed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              onClick={onResetToOverview}
              title="Return to Full Body Overview"
              style={{
                background: 'none',
                border: 'none',
                color: '#9fb6da',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#f6eedb')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#9fb6da')}
            >
              <Menu size={20} />
            </button>
            <div
              style={{
                fontFamily: 'Orbitron, Cinzel, Georgia, serif',
                fontSize: '1.05rem',
                color: '#f6eedb',
                letterSpacing: '0.12em',
                fontWeight: 600,
              }}
            >
              RIDGE <span style={{ color: '#9fb6da', margin: '0 4px' }}>—</span>{' '}
              <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '0.85rem', color: '#ead9b2', letterSpacing: '0.05em', fontWeight: 400 }}>
                Human Systems Observatory
              </span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span
              style={{
                fontFamily: 'Orbitron, Cinzel, Georgia, serif',
                fontSize: '1.35rem',
                fontWeight: 700,
                color: '#f6eedb',
                letterSpacing: '0.18em',
              }}
            >
              RIDGE
            </span>
            <span style={{ width: '1px', height: '18px', backgroundColor: 'rgba(246, 238, 219, 0.35)' }} />
            <span
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: '0.66rem',
                color: '#ead9b2',
                letterSpacing: '0.24em',
                fontWeight: 500,
                textTransform: 'uppercase',
              }}
            >
              HUMAN SYSTEMS OBSERVATORY
            </span>
          </div>
        )}
      </div>

      {/* ── RIGHT: TELEMETRY & CONTROLS ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {isZoomed ? (
          <>
            {/* Technical telemetry string */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                fontSize: '0.72rem',
                color: '#9fb6da',
                fontFamily: 'monospace',
                letterSpacing: '0.08em',
              }}
            >
              <span>
                Utility stats <span style={{ color: 'rgba(246, 238, 219, 0.35)' }}>|</span> 10088 7%
              </span>

              {/* System status toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>System status</span>
                <div
                  style={{
                    width: '28px',
                    height: '14px',
                    borderRadius: '9999px',
                    background: 'rgba(246, 238, 219, 0.2)',
                    border: '1px solid #f6eedb',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      right: '2px',
                      top: '2px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#f6eedb',
                      boxShadow: '0 0 6px #f6eedb',
                    }}
                  />
                </div>
              </div>

              {/* Timestamp & Node ID */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#f6eedb' }}>20:55 / 29:50</span>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ead9b2' }} />
                <span>009</span>
                <span style={{ color: '#ead9b2', border: '1px solid rgba(246, 238, 219, 0.3)', padding: '1px 5px', borderRadius: '3px', fontSize: '0.62rem' }}>
                  ID 189
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Demo button */}
            <button
              type="button"
              onClick={onToggleDemo}
              style={{
                background: isDemoActive ? '#f6eedb' : 'rgba(10, 28, 63, 0.72)',
                border: `1px solid ${isDemoActive ? '#f6eedb' : 'rgba(246, 238, 219, 0.28)'}`,
                color: isDemoActive ? '#06132b' : '#f6eedb',
                padding: '4px 14px',
                borderRadius: '4px',
                fontSize: '0.68rem',
                fontFamily: 'monospace',
                fontWeight: isDemoActive ? 700 : 500,
                letterSpacing: '0.14em',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              DEMO
            </button>

            {/* Mission HUD 5-Step Briefing Button */}
            {onOpenMissionHUD && (
              <button
                type="button"
                onClick={onOpenMissionHUD}
                style={{
                  background: 'rgba(246, 238, 219, 0.14)',
                  border: '1px solid rgba(246, 238, 219, 0.5)',
                  color: '#f6eedb',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontSize: '0.68rem',
                  fontFamily: 'monospace',
                  letterSpacing: '0.14em',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 0 10px rgba(246, 238, 219, 0.2)',
                }}
              >
                MISSION HUD
              </button>
            )}

            {/* AR Palm Sensor Toggle */}
            {onTogglePalm && (
              <button
                type="button"
                onClick={onTogglePalm}
                disabled={globalArEnabled}
                title={globalArEnabled ? 'Global hand controls are active' : 'Toggle local palm controls'}
                style={{
                  background: palmActive ? '#f6eedb' : 'rgba(10, 28, 63, 0.72)',
                  border: `1px solid ${palmActive ? '#f6eedb' : 'rgba(246, 238, 219, 0.28)'}`,
                  color: palmActive ? '#06132b' : '#f6eedb',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.68rem',
                  fontFamily: 'monospace',
                  fontWeight: palmActive ? 700 : 500,
                  letterSpacing: '0.12em',
                  cursor: globalArEnabled ? 'not-allowed' : 'pointer',
                  opacity: globalArEnabled ? 0.65 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>🖐️</span>
                <span>AR PALM: {globalArEnabled ? 'GLOBAL' : palmActive ? 'ONLINE' : 'OFF'}</span>
              </button>
            )}

            {/* Subject Selector */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(10, 28, 63, 0.72)',
                border: '1px solid rgba(246, 238, 219, 0.28)',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '0.68rem',
                fontFamily: 'monospace',
                letterSpacing: '0.14em',
                color: '#f6eedb',
              }}
            >
              <span>{astronaut?.id || 'SUBJECT 01'}</span>
              <div style={{ display: 'flex', gap: '3px', marginLeft: '4px' }}>
                <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#f6eedb' }} />
                <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#9fb6da' }} />
                <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#9fb6da' }} />
              </div>
            </div>
          </>
        )}

        {/* Exit button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            title="Exit Observatory"
            style={{
              background: 'rgba(10, 28, 63, 0.72)',
              border: '1px solid rgba(246, 238, 219, 0.28)',
              color: '#ead9b2',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#06132b';
              e.currentTarget.style.background = '#f6eedb';
              e.currentTarget.style.borderColor = '#f6eedb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#ead9b2';
              e.currentTarget.style.background = 'rgba(10, 28, 63, 0.72)';
              e.currentTarget.style.borderColor = 'rgba(246, 238, 219, 0.28)';
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </header>
  );
}

