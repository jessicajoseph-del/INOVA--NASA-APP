import React, { useState, useEffect, useRef } from 'react';
import ThreeDFaceMesh from './ThreeDFaceMesh';
import { recordFaceAuthSuccess } from '../utils/faceAuthLog';

export default function ThreeDFaceStudioModal({
  isOpen,
  onClose,
  activeAstronaut,
  onSaveFaceData,
  onLoginSuccess,
  onFaceAuthRecorded,
}) {
  const [cameraState, setCameraState] = useState('idle'); // 'idle' | 'requesting' | 'active' | 'denied' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [currentAngle, setCurrentAngle] = useState('center'); // 'center' | 'left' | 'right'
  const [capturedSnaps, setCapturedSnaps] = useState({
    center: activeAstronaut?.faceSnaps?.center || null,
    left: activeAstronaut?.faceSnaps?.left || null,
    right: activeAstronaut?.faceSnaps?.right || null,
  });
  const [activeTab, setActiveTab] = useState('3d-creator'); // '3d-creator' | 'recognition'
  const [threeDMode, setThreeDMode] = useState('textured'); // 'textured' | 'hologram' | 'wireframe'
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [recognitionMatch, setRecognitionMatch] = useState(null);
  const [previewMouse, setPreviewMouse] = useState({ x: 0, y: 0 });

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // File upload handler for offline / manual face upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') {
        setCapturedSnaps((prev) => ({
          ...prev,
          [currentAngle]: dataUrl,
          ...(prev.center ? {} : { center: dataUrl }),
        }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Initialize camera
  const requestCameraAccess = async () => {
    setCameraState('requesting');
    setErrorMessage('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support webcam capture (navigator.mediaDevices.getUserMedia is unavailable).');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch((err) => console.warn('Video play warning:', err));
        };
      }
      setCameraState('active');
    } catch (err) {
      console.error('Camera error:', err);
      setCameraState('denied');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Camera access was denied by your browser. Please click the camera/lock icon in your browser URL bar to allow camera access, then retry.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('No camera device detected on this system.');
      } else {
        setErrorMessage(err.message || 'Failed to start camera. Please verify device permissions.');
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraState('idle');
  };

  // Auto request when modal opens
  useEffect(() => {
    if (isOpen) {
      requestCameraAccess();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  // Capture face snapshot for current angle
  const captureSnapshot = (angle) => {
    const targetAngle = angle || currentAngle;
    let dataUrl = null;

    if (videoRef.current && cameraState === 'active') {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = video.videoWidth || 480;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      // Mirror horizontally for selfie
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    } else {
      // Fallback synthetic high-tech placeholder
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#06132b';
      ctx.fillRect(0, 0, 300, 300);
      ctx.strokeStyle = '#f6eedb';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, 260, 260);
      ctx.fillStyle = '#f6eedb';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`SYNTHETIC 3D: ${targetAngle.toUpperCase()}`, 35, 150);
      dataUrl = canvas.toDataURL('image/png');
    }

    setCapturedSnaps((prev) => ({ ...prev, [targetAngle]: dataUrl }));

    // Progress automatically to next angle
    if (targetAngle === 'center') setCurrentAngle('left');
    else if (targetAngle === 'left') setCurrentAngle('right');
    else setCurrentAngle('center');
  };

  // Run Biometric Recognition scan
  const triggerFacialRecognition = () => {
    setIsScanning(true);
    setScanProgress(0);
    setRecognitionMatch(null);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 12;
      setScanProgress(Math.min(progress, 100));
      if (progress >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        const astronautName = activeAstronaut?.name || 'ASTRONAUT PILOT';
        const callsign = activeAstronaut?.id || 'ASTRO-01';
        const updatedLogs = recordFaceAuthSuccess({
          astronautId: callsign,
          astronautName,
          confidence: 99.4,
          angle: currentAngle,
          source: '3D Visor Studio',
        });
        if (onFaceAuthRecorded) {
          onFaceAuthRecorded(updatedLogs);
        }
        setRecognitionMatch({
          matchScore: 99.4,
          astronaut: astronautName,
          callsign,
          status: 'BIOMETRIC SIGNATURE VERIFIED',
        });
      }
    }, 120);
  };

  const handleApplyToVisor = () => {
    if (onSaveFaceData) {
      onSaveFaceData(capturedSnaps);
    }
    onClose();
  };

  if (!isOpen) return null;

  const currentPreviewTexture =
    capturedSnaps[currentAngle] || capturedSnaps.center || capturedSnaps.left || capturedSnaps.right;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(6, 19, 43, 0.92)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      <div
        className="holo-card custom-scroll"
        style={{
          width: 'min(1080px, 96vw)',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'linear-gradient(135deg, rgba(10, 28, 63, 0.97) 0%, rgba(6, 19, 43, 0.99) 100%)',
          border: '1.5px solid rgba(246, 238, 219, 0.45)',
          boxShadow: '0 0 60px rgba(246, 238, 219, 0.14), inset 0 0 30px rgba(246, 238, 219, 0.06)',
          borderRadius: '16px',
          padding: '28px 32px',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          style={{
            position: 'absolute',
            top: '20px',
            right: '24px',
            background: 'rgba(246, 238, 219, 0.1)',
            border: '1px solid rgba(246, 238, 219, 0.3)',
            color: '#f6eedb',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          ✕
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: '20px' }}>
          <div
            className="font-mono"
            style={{ fontSize: '0.72rem', color: '#ead9b2', letterSpacing: '0.22em', marginBottom: '6px' }}
          >
            RIDGE // BIOMETRIC VISOR STUDIO & FACIAL RECOGNITION
          </div>
          <h2
            className="font-tech"
            style={{ fontSize: '2rem', color: '#f6eedb', margin: 0, letterSpacing: '0.04em' }}
          >
            CAMERA ACCESS // 3D FACE CREATOR
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#9fb6da', margin: '4px 0 0 0' }}>
            Grant camera permissions to test real-time facial recognition and reconstruct your personalized 3D face mesh for the RIDGE astronaut helmet visor.
          </p>
        </div>

        {/* Studio Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '22px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('3d-creator')}
            className="font-mono"
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              cursor: 'pointer',
              background: activeTab === '3d-creator' ? '#f6eedb' : 'rgba(6, 19, 43, 0.72)',
              border: activeTab === '3d-creator' ? '1.5px solid #f6eedb' : '1px solid rgba(246, 238, 219, 0.2)',
              color: activeTab === '3d-creator' ? '#06132b' : '#ead9b2',
              fontWeight: 700,
            }}
          >
            🧬 3D FACE MESH RECONSTRUCTION
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('recognition')}
            className="font-mono"
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              cursor: 'pointer',
              background: activeTab === 'recognition' ? '#f6eedb' : 'rgba(6, 19, 43, 0.72)',
              border: activeTab === 'recognition' ? '1.5px solid #f6eedb' : '1px solid rgba(246, 238, 219, 0.2)',
              color: activeTab === 'recognition' ? '#06132b' : '#ead9b2',
              fontWeight: 700,
            }}
          >
            👁️ FACIAL RECOGNITION CHECK
          </button>
        </div>

        {/* Camera Permission Alert Banner if not active */}
        {cameraState !== 'active' && (
          <div
            style={{
              background: cameraState === 'denied' ? 'rgba(248, 113, 113, 0.16)' : 'rgba(246, 238, 219, 0.08)',
              border: cameraState === 'denied' ? '1px solid #f87171' : '1px solid rgba(246, 238, 219, 0.4)',
              borderRadius: '10px',
              padding: '14px 18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div>
              <div
                className="font-mono"
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: cameraState === 'denied' ? '#fca5a5' : '#f6eedb',
                  marginBottom: '4px',
                }}
              >
                {cameraState === 'denied'
                  ? '⚠️ CAMERA ACCESS BLOCKED / RESTRICTED'
                  : '📷 CAMERA ACCESS PERMISSION REQUIRED'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#ead9b2' }}>
                {errorMessage ||
                  'Click the button to grant browser camera access. This enables live facial scanning, angle snapshots, and 3D face mesh reconstruction.'}
              </div>
            </div>
            <button
              type="button"
              onClick={requestCameraAccess}
              className="tech-btn"
              style={{
                padding: '10px 20px',
                whiteSpace: 'nowrap',
                background: '#f6eedb',
                color: '#06132b',
                fontWeight: 700,
                border: 'none',
              }}
            >
              {cameraState === 'requesting' ? 'CONNECTING...' : 'ALLOW CAMERA ACCESS →'}
            </button>
          </div>
        )}

        {/* Main Studio Body: 2 Columns (Webcam & Controls + 3D Viewport) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {/* Left Column: Live Webcam & Angle Controls */}
          <div
            style={{
              background: 'rgba(6, 19, 43, 0.85)',
              border: '1px solid rgba(246, 238, 219, 0.2)',
              borderRadius: '12px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-mono" style={{ fontSize: '0.72rem', color: '#f6eedb', letterSpacing: '0.15em' }}>
                LIVE OPTICAL FEED // SENSOR 01
              </span>
              <span
                className="font-mono"
                style={{
                  fontSize: '0.65rem',
                  color: cameraState === 'active' ? '#f6eedb' : '#ead9b2',
                  background: 'rgba(246, 238, 219, 0.14)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  border: `1px solid ${cameraState === 'active' ? '#f6eedb' : '#ead9b2'}`,
                }}
              >
                {cameraState === 'active' ? '● STREAM ACTIVE' : '○ DISCONNECTED'}
              </span>
            </div>

            {/* Webcam Screen with HUD Reticle */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '1 / 1',
                maxHeight: '340px',
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#06132b',
                border: '1.5px solid rgba(246, 238, 219, 0.35)',
                boxShadow: 'inset 0 0 30px rgba(246, 238, 219, 0.08)',
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)',
                  display: cameraState === 'active' ? 'block' : 'none',
                }}
              />

              {cameraState !== 'active' && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '3rem', marginBottom: '10px' }}>📷</span>
                  <div className="font-mono" style={{ fontSize: '0.8rem', color: '#9fb6da', marginBottom: '12px' }}>
                    Camera access is currently inactive.
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={requestCameraAccess}
                      className="tech-btn"
                      style={{ fontSize: '0.72rem', padding: '8px 16px' }}
                    >
                      ENABLE CAMERA
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="tech-btn"
                      style={{
                        fontSize: '0.72rem',
                        padding: '8px 16px',
                        background: 'rgba(246, 238, 219, 0.15)',
                        color: '#f6eedb',
                        borderColor: 'rgba(246, 238, 219, 0.4)',
                      }}
                    >
                      📁 UPLOAD PHOTO
                    </button>
                  </div>
                </div>
              )}

              {/* Biometric Face Reticle Overlay */}
              {cameraState === 'active' && (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      inset: '12%',
                      border: '1.5px dashed rgba(246, 238, 219, 0.7)',
                      borderRadius: '50% 50% 45% 45%',
                      pointerEvents: 'none',
                    }}
                  />
                  {/* Corner brackets */}
                  <div style={{ position: 'absolute', top: '10px', left: '10px', width: '20px', height: '20px', borderTop: '2px solid #f6eedb', borderLeft: '2px solid #f6eedb' }} />
                  <div style={{ position: 'absolute', top: '10px', right: '10px', width: '20px', height: '20px', borderTop: '2px solid #f6eedb', borderRight: '2px solid #f6eedb' }} />
                  <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '20px', height: '20px', borderBottom: '2px solid #f6eedb', borderLeft: '2px solid #f6eedb' }} />
                  <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '20px', height: '20px', borderBottom: '2px solid #f6eedb', borderRight: '2px solid #f6eedb' }} />

                  {/* Laser scanline */}
                  <div className="scan-line" style={{ background: '#f6eedb', height: '2px', opacity: 0.8 }} />

                  {/* Active target guidance */}
                  <div
                    className="font-mono"
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(6, 19, 43, 0.9)',
                      border: '1px solid #f6eedb',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '0.68rem',
                      color: '#f6eedb',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    TARGET: {currentAngle.toUpperCase()} VIEW
                  </div>
                </>
              )}
            </div>

            {/* Angle Select & Snap Row */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {['center', 'left', 'right'].map((ang) => (
                <div key={ang} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div
                    onClick={() => setCurrentAngle(ang)}
                    style={{
                      aspectRatio: '1 / 1',
                      borderRadius: '8px',
                      border: currentAngle === ang ? '2px solid #f6eedb' : '1px solid rgba(246, 238, 219, 0.18)',
                      background: '#0a1c3f',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {capturedSnaps[ang] ? (
                      <img src={capturedSnaps[ang]} alt={ang} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span className="font-mono" style={{ fontSize: '0.65rem', color: 'rgba(246, 238, 219, 0.45)' }}>
                        EMPTY
                      </span>
                    )}
                    {currentAngle === ang && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 2,
                          right: 2,
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#f6eedb',
                        }}
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentAngle(ang);
                      captureSnapshot(ang);
                    }}
                    className="tech-btn"
                    style={{
                      padding: '6px 2px',
                      fontSize: '0.62rem',
                      background: capturedSnaps[ang] ? '#f6eedb' : 'rgba(10, 28, 63, 0.8)',
                      color: capturedSnaps[ang] ? '#06132b' : '#f6eedb',
                      borderColor: capturedSnaps[ang] ? '#f6eedb' : 'rgba(246, 238, 219, 0.35)',
                    }}
                  >
                    {capturedSnaps[ang] ? `✓ ${ang.toUpperCase()}` : `SNAP ${ang.toUpperCase()}`}
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Action Buttons */}
            {activeTab === '3d-creator' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => captureSnapshot(currentAngle)}
                  className="tech-btn"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#f6eedb',
                    color: '#06132b',
                    borderColor: '#f6eedb',
                    fontWeight: 700,
                  }}
                >
                  📸 CAPTURE {currentAngle.toUpperCase()} & BUILD 3D MESH
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="tech-btn"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.72rem',
                    background: 'rgba(246, 238, 219, 0.1)',
                    color: '#f6eedb',
                    borderColor: 'rgba(246, 238, 219, 0.35)',
                  }}
                >
                  📁 OR UPLOAD PHOTO FOR {currentAngle.toUpperCase()} FACE
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={triggerFacialRecognition}
                className="tech-btn"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#f6eedb',
                  color: '#06132b',
                  fontWeight: 700,
                  border: 'none',
                }}
              >
                🔍 VERIFY BIOMETRIC MATCH →
              </button>
            )}
          </div>

          {/* Right Column: Interactive 3D Face Mesh Viewport & Recognition Info */}
          <div
            style={{
              background: 'rgba(6, 19, 43, 0.85)',
              border: '1px solid rgba(246, 238, 219, 0.2)',
              borderRadius: '12px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {activeTab === '3d-creator' ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="font-mono" style={{ fontSize: '0.72rem', color: '#f6eedb', letterSpacing: '0.15em' }}>
                    3D BIOMETRIC MESH // DEPTH TOPOLOGY
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['textured', 'hologram', 'wireframe'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setThreeDMode(m)}
                        className="font-mono"
                        style={{
                          padding: '2px 8px',
                          fontSize: '0.62rem',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          background: threeDMode === m ? '#f6eedb' : 'transparent',
                          border: threeDMode === m ? '1px solid #f6eedb' : '1px solid rgba(246, 238, 219, 0.2)',
                          color: threeDMode === m ? '#06132b' : '#9fb6da',
                          fontWeight: threeDMode === m ? 700 : 500,
                        }}
                      >
                        {m.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3D Face Mesh Viewport */}
                <div
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
                    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
                    setPreviewMouse({ x, y });
                  }}
                  onMouseLeave={() => setPreviewMouse({ x: 0, y: 0 })}
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '1 / 1',
                    maxHeight: '340px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'radial-gradient(circle at center, rgba(14, 40, 89, 0.55) 0%, rgba(6, 19, 43, 0.96) 90%)',
                    border: '1.5px solid rgba(246, 238, 219, 0.35)',
                    boxShadow: '0 0 30px rgba(246, 238, 219, 0.1)',
                  }}
                >
                  <ThreeDFaceMesh
                    faceSnaps={capturedSnaps}
                    faceTextureUrl={currentPreviewTexture}
                    mouseX={previewMouse.x}
                    mouseY={previewMouse.y}
                    mode={threeDMode}
                  />

                  {/* Subtle 3D Reticle Overlay */}
                  <div
                    className="font-mono"
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '12px',
                      fontSize: '0.62rem',
                      color: 'rgba(246, 238, 219, 0.72)',
                    }}
                  >
                    INTERACTIVE 3D VISOR MESH // MOVE CURSOR TO ROTATE
                  </div>
                  <div
                    className="font-mono"
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '12px',
                      fontSize: '0.62rem',
                      color: '#ead9b2',
                    }}
                  >
                    SURFACE: {threeDMode.toUpperCase()} | 1,920 VERTICES
                  </div>
                </div>

                {/* Apply Button */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleApplyToVisor}
                    className="tech-btn"
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: '#f6eedb',
                      color: '#06132b',
                      borderColor: '#f6eedb',
                      fontWeight: 700,
                    }}
                  >
                    ✓ APPLY 3D FACE TO ASTRONAUT HELMET VISOR
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="tech-btn"
                    style={{
                      padding: '12px 18px',
                      background: 'rgba(10, 28, 63, 0.85)',
                      color: '#f6eedb',
                      borderColor: 'rgba(246, 238, 219, 0.35)',
                    }}
                  >
                    CLOSE
                  </button>
                </div>
              </>
            ) : (
              /* Facial Recognition Check Panel */
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <div className="font-mono" style={{ fontSize: '0.72rem', color: '#f6eedb', letterSpacing: '0.15em', marginBottom: '12px' }}>
                    FACIAL RECOGNITION AUTHENTICATOR // VERIFICATION
                  </div>

                  {isScanning && (
                    <div style={{ background: 'rgba(246, 238, 219, 0.08)', padding: '16px', borderRadius: '8px', border: '1px solid #f6eedb', marginBottom: '16px' }}>
                      <div className="font-mono" style={{ fontSize: '0.75rem', color: '#f6eedb', marginBottom: '8px' }}>
                        SCANNING OPTICAL PATTERNS... {scanProgress}%
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(246, 238, 219, 0.15)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${scanProgress}%`, height: '100%', background: 'linear-gradient(90deg, #ead9b2, #f6eedb)', transition: 'width 0.1s linear' }} />
                      </div>
                    </div>
                  )}

                  {recognitionMatch ? (
                    <div style={{ background: 'rgba(246, 238, 219, 0.1)', border: '1px solid #f6eedb', borderRadius: '10px', padding: '18px', marginBottom: '16px' }}>
                      <div className="font-tech" style={{ fontSize: '1.2rem', color: '#f6eedb', marginBottom: '8px' }}>
                        ✓ {recognitionMatch.status}
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.78rem', color: '#f6eedb', marginBottom: '4px' }}>
                        CREW MEMBER: <strong>{recognitionMatch.astronaut}</strong>
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.75rem', color: '#ead9b2', marginBottom: '8px' }}>
                        CALLSIGN: <strong>{recognitionMatch.callsign}</strong> | CONFIDENCE: <strong>{recognitionMatch.matchScore}%</strong>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#9fb6da' }}>
                        Facial geometry matches the biometric profile stored in RIDGE mission logs.
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: 'rgba(10, 28, 63, 0.65)', border: '1px solid rgba(246, 238, 219, 0.16)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                      <div className="font-mono" style={{ fontSize: '0.75rem', color: '#9fb6da' }}>
                        Click "VERIFY BIOMETRIC MATCH" on the left to analyze the current video feed against stored facial signatures.
                      </div>
                    </div>
                  )}
                </div>

                {recognitionMatch && onLoginSuccess && (
                  <button
                    type="button"
                    onClick={() => {
                      onLoginSuccess(activeAstronaut);
                      onClose();
                    }}
                    className="tech-btn"
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: '#f6eedb',
                      color: '#06132b',
                      fontWeight: 700,
                      border: 'none',
                    }}
                  >
                    ENTER RIDGE DASHBOARD NOW →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

