import React, { useState } from 'react';

// ── PIXEL-PERFECT ICONSAX VECTOR ICONS (EXACT MATCH TO nav.jpg) ──────────────

export function RabbitsLogo({ size = 22, color = '#ffffff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Signature Iconsax Rabbit Head Silhouette */}
      <path
        d="M6.5 2.5C5.8 3.8 5.6 5.8 6.2 7.8L7.4 11.2C5.2 12.2 4 14.4 4 16.8C4 20.2 7.6 22.5 12 22.5C16.4 22.5 20 20.2 20 16.8C20 14.4 18.8 12.2 16.6 11.2L17.8 7.8C18.4 5.8 18.2 3.8 17.5 2.5C16.2 2.2 14.5 3.5 13.5 5.5L12 8.5L10.5 5.5C9.5 3.5 7.8 2.2 6.5 2.5Z"
        fill={color}
      />
      {/* Inner Ear Cutouts */}
      <path
        d="M7.8 4.2C7.4 5.2 7.5 6.6 8 8L8.6 9.6"
        stroke="#0d1117"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M16.2 4.2C16.6 5.2 16.5 6.6 16 8L15.4 9.6"
        stroke="#0d1117"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HomeSmileIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Rounded Squircle Head / Home Outline */}
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="5.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Friendly Smile Arc matching nav.jpg */}
      <path
        d="M8.5 13C9.8 15.2 14.2 15.2 15.5 13"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ProjectsBriefcaseIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Top Handle */}
      <path
        d="M8.5 7V4.5C8.5 3.7 9.2 3 10 3H14C14.8 3 15.5 3.7 15.5 4.5V7"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Briefcase Body with Rounded Corners */}
      <rect
        x="3"
        y="7"
        width="18"
        height="14"
        rx="4.5"
        stroke={color}
        strokeWidth="1.8"
      />
      {/* Front Divider & Lock */}
      <path
        d="M3 12H21"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <rect
        x="10.5"
        y="10.5"
        width="3"
        height="3"
        rx="0.8"
        fill={color}
      />
    </svg>
  );
}

export function MessagesChatIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Smooth Rounded Chat Bubble */}
      <path
        d="M19 4H5C3.3 4 2 5.3 2 7V14C2 15.7 3.3 17 5 17H7V20.5L11.5 17H19C20.7 17 22 15.7 22 14V7C22 5.3 20.7 4 19 4Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Chat Eye Dots */}
      <circle cx="8.5" cy="10.5" r="1.2" fill={color} />
      <circle cx="15.5" cy="10.5" r="1.2" fill={color} />
    </svg>
  );
}

export function CalendarIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Calendar Rounded Body */}
      <rect
        x="3"
        y="4.5"
        width="18"
        height="16.5"
        rx="4.5"
        stroke={color}
        strokeWidth="1.8"
      />
      {/* Binder Loops */}
      <path d="M8 2.5V5.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 2.5V5.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      {/* Divider */}
      <path d="M3 9.5H21" stroke={color} strokeWidth="1.4" />
      {/* 6 Grid Dots */}
      <circle cx="8" cy="13" r="1" fill={color} />
      <circle cx="12" cy="13" r="1" fill={color} />
      <circle cx="16" cy="13" r="1" fill={color} />
      <circle cx="8" cy="17" r="1" fill={color} />
      <circle cx="12" cy="17" r="1" fill={color} />
      <circle cx="16" cy="17" r="1" fill={color} />
    </svg>
  );
}

export function ArchiveFolderIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Folder Contour matching nav.jpg */}
      <path
        d="M3 7C3 5.3 4.3 4 6 4H9.5C10.5 4 11.4 4.5 12 5.3L13.2 7H18C19.7 7 21 8.3 21 10V17C21 18.7 19.7 20 18 20H6C4.3 20 3 18.7 3 17V7Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AnalyticsCircleIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Outer Circle */}
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
      {/* 3 Vertical Metric Bars */}
      <path d="M8.5 14V11.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 15.5V8.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15.5 14V10" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function AccountUserIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Outer Circle */}
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
      {/* User Head */}
      <circle cx="12" cy="9.5" r="3" stroke={color} strokeWidth="1.6" />
      {/* Shoulder Arch */}
      <path
        d="M6.8 17.5C7.6 15.2 9.6 14 12 14C14.4 14 16.4 15.2 17.2 17.5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SettingsFlowerIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Exact 8-Petal Rosette Cogwheel from nav.jpg */}
      <path
        d="M12 2C12.8 2 13.5 2.7 13.5 3.5C14.5 3.9 15.4 4.5 16.2 5.3C16.8 4.7 17.8 4.7 18.4 5.3C19 5.9 19 6.9 18.4 7.5C19.2 8.3 19.8 9.2 20.2 10.2C21 10.2 21.7 10.9 21.7 11.7V12.3C21.7 13.1 21 13.8 20.2 13.8C19.8 14.8 19.2 15.7 18.4 16.5C19 17.1 19 18.1 18.4 18.7C17.8 19.3 16.8 19.3 16.2 18.7C15.4 19.5 14.5 20.1 13.5 20.5C13.5 21.3 12.8 22 12 22H11.4C10.6 22 9.9 21.3 9.9 20.5C8.9 20.1 8 19.5 7.2 18.7C6.6 19.3 5.6 19.3 5 18.7C4.4 18.1 4.4 17.1 5 16.5C4.2 15.7 3.6 14.8 3.2 13.8C2.4 13.8 1.7 13.1 1.7 12.3V11.7C1.7 10.9 2.4 10.2 3.2 10.2C3.6 9.2 4.2 8.3 5 7.5C4.4 6.9 4.4 5.9 5 5.3C5.6 4.7 6.6 4.7 7.2 5.3C8 4.5 8.9 3.9 9.9 3.5C9.9 2.7 10.6 2 11.4 2H12Z"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.2" stroke={color} strokeWidth="1.7" />
    </svg>
  );
}

export function ObservatoryIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* 3D Anatomical Body Scan / Crosshair Reticle */}
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" strokeDasharray="3 3" />
      <circle cx="12" cy="8" r="2.5" stroke={color} strokeWidth="1.8" />
      <path d="M12 10.5V17" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 13H15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10 20L12 17L14 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function LogoutIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M8.9 7.56C9.21 3.96 11.06 2.49 15.11 2.49H15.24C19.71 2.49 21.5 4.28 21.5 8.75V15.27C21.5 19.74 19.71 21.53 15.24 21.53H15.11C11.09 21.53 9.24 20.08 8.91 16.54"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M15 12H3.62" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.85 8.65L2.5 12L5.85 15.35" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── MAIN ICONSAX FLOATING CAPSULE SIDEBAR COMPONENT ──────────────────────────

export default function IconsaxNav({
  activeTab = 'home',
  setActiveTab,
  onOpenObservatory,
  isObservatoryActive = false,
  onLogout,
  side = 'right',
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Exact items matching nav.jpg
  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: HomeSmileIcon,
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: ProjectsBriefcaseIcon,
    },
    {
      id: 'divider-1',
      isDivider: true,
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessagesChatIcon,
      badge: '3',
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: CalendarIcon,
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: ArchiveFolderIcon,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: AnalyticsCircleIcon,
    },
    {
      id: 'observatory',
      label: 'Observatory',
      icon: ObservatoryIcon,
      isSpecial: true,
    },
    {
      id: 'divider-2',
      isDivider: true,
    },
    {
      id: 'account',
      label: 'Account',
      icon: AccountUserIcon,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsFlowerIcon,
    },
  ];

  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      style={{
        position: 'fixed',
        right: side === 'right' ? '24px' : 'auto',
        left: side === 'left' ? '24px' : 'auto',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 50,
        width: isExpanded ? '236px' : '64px',
        padding: isExpanded ? '20px 14px' : '22px 8px',
        borderRadius: isExpanded ? '28px' : '40px',
        backgroundColor: 'rgba(14, 17, 24, 0.88)',
        backdropFilter: 'blur(36px) saturate(190%)',
        WebkitBackdropFilter: 'blur(36px) saturate(190%)',
        border: '1px solid rgba(255, 255, 255, 0.09)',
        boxShadow:
          '0 30px 80px rgba(0, 0, 0, 0.85), inset 0 1px 1px rgba(255, 255, 255, 0.22), 0 0 1px rgba(255, 255, 255, 0.15)',
        transition: 'width 0.32s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.32s ease, padding 0.32s ease',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* ── TOP LOGO / RABBITS BRAND MARK (EXACT MATCH TO nav.jpg) ──── */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isExpanded ? 'flex-start' : 'center',
          gap: '12px',
          padding: isExpanded ? '0 10px 14px 10px' : '0 0 14px 0',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.04)',
            flexShrink: 0,
          }}
        >
          <RabbitsLogo size={22} color="#ffffff" />
        </div>

        {isExpanded && (
          <span
            style={{
              fontSize: '1.05rem',
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: '-0.01em',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              whiteSpace: 'nowrap',
            }}
          >
            Rabbits
          </span>
        )}
      </div>

      {/* ── NAV ITEMS LIST (EXACT MATCH TO nav.jpg) ─────────────────── */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
        }}
      >
        {navItems.map((item) => {
          if (item.isDivider) {
            return (
              <div
                key={item.id}
                style={{
                  width: '100%',
                  height: '1px',
                  backgroundColor: 'rgba(255, 255, 255, 0.07)',
                  margin: '4px 0',
                }}
              />
            );
          }

          const isActive =
            (item.id === 'observatory' && isObservatoryActive) ||
            (activeTab === item.id && !isObservatoryActive);

          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === 'observatory') {
                  onOpenObservatory();
                } else {
                  setActiveTab(item.id);
                }
              }}
              style={{
                position: 'relative',
                width: '100%',
                height: '42px',
                padding: isExpanded ? '0 12px' : '0',
                borderRadius: '9999px', // Fully rounded capsule matching nav.jpg
                display: 'flex',
                alignItems: 'center',
                justifyContent: isExpanded ? 'flex-start' : 'center',
                gap: '12px',
                cursor: 'pointer',
                border: isActive
                  ? '1px solid rgba(217, 70, 239, 0.42)' // Signature nav.jpg glowing violet border
                  : '1px solid transparent',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(217, 70, 239, 0.25) 0%, rgba(168, 85, 247, 0.08) 60%, transparent 100%)' // nav.jpg violet capsule glow
                  : 'transparent',
                boxShadow: isActive
                  ? 'inset 0 1px 1px rgba(255, 255, 255, 0.22), 0 0 18px rgba(217, 70, 239, 0.22)'
                  : 'none',
                color: isActive ? '#ffffff' : '#94a3b8',
                transition: 'all 0.2s ease',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#94a3b8';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {/* Active Neon Bar on Left Edge (Exact nav.jpg signature) */}
              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    left: '-2px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '3.5px',
                    height: '18px',
                    borderRadius: '2px',
                    backgroundColor: '#d946ef',
                    boxShadow: '0 0 10px #d946ef, 0 0 20px rgba(217, 70, 239, 0.95)',
                  }}
                />
              )}

              {/* Icon */}
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  filter: isActive ? 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.35))' : 'none',
                }}
              >
                <IconComponent
                  size={19}
                  color={isActive ? '#ffffff' : '#94a3b8'}
                />
              </div>

              {/* Text Label in Expanded Mode */}
              {isExpanded && (
                <span
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? '#ffffff' : '#cbd5e1',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.01em',
                  }}
                >
                  {item.label}
                </span>
              )}

              {/* Badge Pill for Messages (e.g. "3" in nav.jpg) */}
              {item.badge && isExpanded && (
                <span
                  style={{
                    marginLeft: 'auto',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#cbd5e1',
                    fontSize: '11px',
                    fontWeight: 500,
                    padding: '1px 7px',
                    borderRadius: '9999px',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── LOGOUT OPTION AT BOTTOM ──────────────────────────────────── */}
      {onLogout && (
        <div style={{ width: '100%', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <button
            type="button"
            onClick={onLogout}
            style={{
              position: 'relative',
              width: '100%',
              height: '38px',
              padding: isExpanded ? '0 12px' : '0',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isExpanded ? 'flex-start' : 'center',
              gap: '12px',
              cursor: 'pointer',
              border: '1px solid transparent',
              background: 'transparent',
              color: '#f43f5e',
              transition: 'all 0.2s ease',
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(244, 63, 94, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <div style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <LogoutIcon size={18} color="#f43f5e" />
            </div>
            {isExpanded && (
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#f43f5e', whiteSpace: 'nowrap' }}>
                Log Out
              </span>
            )}
          </button>
        </div>
      )}
    </aside>
  );
}
