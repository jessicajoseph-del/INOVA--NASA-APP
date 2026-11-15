import React from 'react';
import { ShieldCheck, Clock, ScanFace, Trash2 } from 'lucide-react';

function formatLocalTimestamp(isoString) {
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return isoString;
  }
}

function formatUtcTimestamp(isoString) {
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return '';
    return `${date.toISOString().replace('T', ' ').slice(0, 19)} UTC`;
  } catch {
    return '';
  }
}

export default function FaceAuthLogView({
  logs = [],
  onClearLogs,
  onOpenFaceStudio,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Summary Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          padding: '12px 16px',
          background: 'rgba(10, 28, 63, 0.62)',
          border: '1px solid rgba(246, 238, 219, 0.22)',
          borderRadius: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={16} color="#f6eedb" />
          <div>
            <div
              className="font-mono"
              style={{
                fontSize: '0.72rem',
                color: '#f6eedb',
                letterSpacing: '0.16em',
                fontWeight: 700,
              }}
            >
              SUCCESSFUL FACE AUTHENTICATIONS
            </div>
            <div
              className="font-mono"
              style={{
                fontSize: '0.66rem',
                color: '#9fb6da',
                letterSpacing: '0.08em',
              }}
            >
              {logs.length} {logs.length === 1 ? 'verified event' : 'verified events'} recorded
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onOpenFaceStudio && (
            <button
              type="button"
              onClick={onOpenFaceStudio}
              className="font-mono"
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                background: '#f6eedb',
                color: '#06132b',
                border: 'none',
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ScanFace size={13} />
              VERIFY FACE
            </button>
          )}
          {logs.length > 0 && onClearLogs && (
            <button
              type="button"
              onClick={onClearLogs}
              className="font-mono"
              title="Clear authentication history"
              style={{
                padding: '6px 10px',
                borderRadius: '4px',
                background: 'rgba(6, 19, 43, 0.75)',
                color: '#ead9b2',
                border: '1px solid rgba(246, 238, 219, 0.25)',
                fontSize: '0.66rem',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Trash2 size={12} />
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Log Container */}
      <div
        className="custom-scroll"
        role="log"
        aria-label="Successful face authentication attempts"
        style={{
          maxHeight: '370px',
          minHeight: '240px',
          overflowY: 'auto',
          background: 'rgba(10, 28, 63, 0.45)',
          border: '1px solid rgba(246, 238, 219, 0.16)',
          borderRadius: '6px',
          padding: logs.length > 0 ? '10px 12px' : '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {logs.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '28px 16px',
              gap: '10px',
            }}
          >
            <ScanFace size={28} color="#ead9b2" style={{ opacity: 0.85 }} />
            <div
              className="font-mono"
              style={{
                fontSize: '0.78rem',
                color: '#f6eedb',
                letterSpacing: '0.14em',
              }}
            >
              NO FACE AUTHENTICATIONS LOGGED YET
            </div>
            <p
              style={{
                fontSize: '0.8rem',
                color: '#9fb6da',
                maxWidth: '380px',
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              Successful Face ID logins and live biometric scans in the Visor Studio are automatically recorded here with exact verification timestamps.
            </p>
            {onOpenFaceStudio && (
              <button
                type="button"
                onClick={onOpenFaceStudio}
                className="font-mono"
                style={{
                  marginTop: '6px',
                  padding: '9px 18px',
                  borderRadius: '4px',
                  background: '#f6eedb',
                  color: '#06132b',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  cursor: 'pointer',
                }}
              >
                RUN BIOMETRIC FACE VERIFICATION →
              </button>
            )}
          </div>
        ) : (
          logs.map((entry, idx) => (
            <div
              key={entry.id || `${entry.timestamp}-${idx}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '12px 14px',
                background: idx === 0 ? 'rgba(17, 41, 87, 0.72)' : 'rgba(6, 19, 43, 0.58)',
                border: idx === 0
                  ? '1px solid rgba(246, 238, 219, 0.35)'
                  : '1px solid rgba(246, 238, 219, 0.14)',
                borderRadius: '6px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: '#f6eedb',
                      boxShadow: '0 0 8px #ead9b2',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#f6eedb',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {entry.astronautName}
                  </span>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '0.68rem',
                      color: '#ead9b2',
                      letterSpacing: '0.12em',
                    }}
                  >
                    {entry.astronautId}
                  </span>
                </div>

                <div
                  className="font-mono"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.7rem',
                    color: '#9fb6da',
                    letterSpacing: '0.06em',
                  }}
                >
                  <Clock size={12} color="#ead9b2" />
                  <span>{formatLocalTimestamp(entry.timestamp)}</span>
                  <span style={{ opacity: 0.45 }}>•</span>
                  <span style={{ fontSize: '0.64rem', color: 'rgba(159, 182, 218, 0.78)' }}>
                    {formatUtcTimestamp(entry.timestamp)}
                  </span>
                </div>

                <div
                  className="font-mono"
                  style={{
                    fontSize: '0.64rem',
                    color: 'rgba(234, 217, 178, 0.85)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  {entry.source} • ANGLE: {entry.angle}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '4px',
                  flexShrink: 0,
                }}
              >
                <span
                  className="font-mono"
                  style={{
                    padding: '4px 9px',
                    borderRadius: '4px',
                    background: '#f6eedb',
                    color: '#06132b',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                  }}
                >
                  {entry.confidence}% MATCH
                </span>
                <span
                  className="font-mono"
                  style={{
                    fontSize: '0.6rem',
                    color: '#9fb6da',
                    letterSpacing: '0.1em',
                  }}
                >
                  VERIFIED
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
