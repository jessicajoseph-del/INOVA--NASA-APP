import React from 'react';
import { Menu } from 'lucide-react';

export const SYSTEM_TABS = [
  { id: 'cardiovascular', label: 'Cardiovascular' },
  { id: 'skeletal', label: 'Skeletal' },
  { id: 'immune', label: 'Immune' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'sleep', label: 'Sleep & mood' },
];

export default function BottomNavigation({ activeSystem, onSelectSystem, onResetToOverview }) {
  return (
    <footer
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '56px',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 50,
        pointerEvents: 'auto',
        background: 'linear-gradient(to top, rgba(6, 19, 43, 0.96), rgba(6, 19, 43, 0.45) 80%, transparent)',
        borderTop: '1px solid rgba(246, 238, 219, 0.14)',
      }}
    >
      {/* ── LEFT: OVERVIEW TOGGLE ── */}
      <button
        type="button"
        onClick={onResetToOverview}
        title="Full Body Overview"
        style={{
          background: 'none',
          border: 'none',
          color: activeSystem === null ? '#f6eedb' : '#9fb6da',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.75rem',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          outline: 'none',
          transition: 'color 0.2s',
          padding: '6px 10px',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#f6eedb')}
        onMouseLeave={(e) => (e.currentTarget.style.color = activeSystem === null ? '#f6eedb' : '#9fb6da')}
      >
        <Menu size={18} />
        <span style={{ letterSpacing: '0.04em' }}>Overview</span>
      </button>

      {/* ── CENTER: BIOLOGICAL SYSTEM TABS ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '38px' }}>
        {SYSTEM_TABS.map((tab) => {
          const isActive = activeSystem === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectSystem(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '16px 4px',
                cursor: 'pointer',
                fontSize: '0.88rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#f6eedb' : '#9fb6da',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                position: 'relative',
                outline: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = '#ead9b2';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = '#9fb6da';
              }}
            >
              {tab.label}

              {/* Oat Yellow Underline Indicator Bar */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: '#f6eedb',
                    boxShadow: '0 0 10px rgba(246, 238, 219, 0.8), 0 0 4px #ead9b2',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── RIGHT SPACER FOR BALANCE ── */}
      <div style={{ width: '80px' }} />
    </footer>
  );
}

