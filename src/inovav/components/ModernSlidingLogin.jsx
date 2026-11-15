import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  buildAstronautFaceDescriptors,
  matchLiveFaceAgainstCrew,
} from '../utils/faceRecognition';
import { recordFaceAuthSuccess } from '../utils/faceAuthLog';
import { firebaseAuthSignIn, firebaseAuthSignUp, isFirebaseOnline } from '../firebase';

// Palette: Oat Yellow (#f6eedb) & Ink Blue (#06132b)
const OAT_BG = '#f6eedb';
const OAT_INPUT = '#eae0c8';
const OAT_CARD_SOFT = '#efe5ce';
const INK_BLUE = '#06132b';
const INK_MID = '#0e2859';
const INK_SOFT = '#314770';
const INK_BORDER = 'rgba(6, 19, 43, 0.16)';

export default function ModernSlidingLogin({
  activeAstronaut,
  astronauts,
  onLoginSuccess,
  onSignupSuccess,
  onOpen3DFaceStudio,
  onBackToIntro,
  loginMode = 'signin',
  onToggleMode,
}) {
  const [isSignUp, setIsSignUp] = useState(loginMode === 'signup');
  const [authMethod, setAuthMethod] = useState('password'); // 'password' | 'face' | 'fingerprint'

  useEffect(() => {
    setIsSignUp(loginMode === 'signup');
  }, [loginMode]);

  const toggleToSignUp = () => {
    setIsSignUp(true);
    setSignInError('');
    setSignInSuccessMsg('');
    if (onToggleMode) onToggleMode('signup');
  };

  const toggleToSignIn = () => {
    setIsSignUp(false);
    setSignUpError('');
    if (onToggleMode) onToggleMode('signin');
  };

  // Sign In form state
  const [signInId, setSignInId] = useState(activeAstronaut?.id || 'ASTRO-01');
  const [signInPassword, setSignInPassword] = useState('password123');
  const [signInError, setSignInError] = useState('');
  const [signInSuccessMsg, setSignInSuccessMsg] = useState('');

  // Face recognition live readout
  const [faceScanStatus, setFaceScanStatus] = useState('Initializing optical recognition...');
  const [liveMatch, setLiveMatch] = useState(null);
  const [isVerifyingFace, setIsVerifyingFace] = useState(false);

  // Sign Up form state (stores all astronaut data + 3 face sides)
  const [signUpName, setSignUpName] = useState('');
  const [signUpId, setSignUpId] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpRole, setSignUpRole] = useState('EVA Specialist');
  const [signUpMission, setSignUpMission] = useState('Artemis VIII // Deep Space');
  const [signUpBloodType, setSignUpBloodType] = useState('O-Positive');
  const [signUpSnaps, setSignUpSnaps] = useState({ center: null, left: null, right: null });
  const [activeCaptureAngle, setActiveCaptureAngle] = useState('center');
  const [signUpError, setSignUpError] = useState('');
  const [isSavingSignUp, setIsSavingSignUp] = useState(false);

  // Persistent constant camera stream shared across Sign In Face ID & Sign Up 3-Side Capture
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const streamRef = useRef(null);
  const signInVideoRef = useRef(null);
  const signUpVideoRef = useRef(null);
  const canvasRef = useRef(null);

  const attachStreamToVideos = useCallback((stream) => {
    [signInVideoRef.current, signUpVideoRef.current].forEach((vid) => {
      if (!vid || !stream) return;
      if (vid.srcObject !== stream) {
        vid.srcObject = stream;
      }
      if (vid.paused) {
        vid.play().catch(() => {});
      }
    });
  }, []);

  const startConstantCamera = useCallback(async () => {
    setCameraError('');
    try {
      if (streamRef.current) {
        const tracks = streamRef.current.getVideoTracks();
        if (tracks.length > 0 && tracks[0].readyState === 'live') {
          attachStreamToVideos(streamRef.current);
          setCameraActive(true);
          return;
        }
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });

      streamRef.current = stream;
      attachStreamToVideos(stream);
      setCameraActive(true);
    } catch (err) {
      setCameraActive(false);
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setCameraError('Camera permission denied. Allow camera access in your browser bar and retry.');
      } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
        setCameraError('No camera hardware detected on this device.');
      } else {
        setCameraError(err?.message || 'Unable to start camera.');
      }
    }
  }, [attachStreamToVideos]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (signInVideoRef.current) signInVideoRef.current.srcObject = null;
    if (signUpVideoRef.current) signUpVideoRef.current.srcObject = null;
    setCameraActive(false);
  }, []);

  // Keep camera running constantly across Sign In & Sign Up so biometric feeds never cut out
  useEffect(() => {
    startConstantCamera();
    return () => stopCamera();
  }, [startConstantCamera, stopCamera]);

  // Re-attach live stream whenever switching between Sign In Face ID and Sign Up
  useEffect(() => {
    if (streamRef.current) {
      attachStreamToVideos(streamRef.current);
    }
  }, [authMethod, isSignUp, cameraActive, attachStreamToVideos]);

  // Continuous real-time facial recognition loop while on Face ID tab
  useEffect(() => {
    if (isSignUp || authMethod !== 'face' || !cameraActive) return;

    let cancelled = false;
    const runMatch = async () => {
      if (cancelled || !signInVideoRef.current || signInVideoRef.current.readyState < 2) return;
      const result = await matchLiveFaceAgainstCrew(signInVideoRef.current, astronauts);
      if (cancelled) return;

      if (result.noProfiles) {
        setLiveMatch(null);
        setFaceScanStatus('No 3-side face profiles enrolled yet. Register in Sign Up.');
      } else if (result.error) {
        setLiveMatch(null);
        setFaceScanStatus(result.error);
      } else {
        setLiveMatch(result);
        setFaceScanStatus(
          result.matched
            ? `Match: ${result.astronaut.name} (${result.confidence}% · ${result.angle})`
            : `Scanning... closest: ${result.astronaut?.name || 'Unknown'} (${result.confidence}%)`
        );
      }
    };

    runMatch();
    const timer = window.setInterval(runMatch, 600);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [isSignUp, authMethod, cameraActive, astronauts]);

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setSignInError('');
    setSignInSuccessMsg('');

    try {
      const res = await firebaseAuthSignIn(signInId, signInPassword, astronauts);
      if (res.success && res.astronaut) {
        setSignInSuccessMsg(
          res.mode === 'cloud'
            ? `Firebase Verified // Welcome, ${res.astronaut.name}`
            : `Offline Verified // Welcome, ${res.astronaut.name}`
        );
        setTimeout(() => {
          onLoginSuccess(res.astronaut);
        }, 650);
      } else {
        setSignInError(res.error || 'Invalid Callsign or Password.');
      }
    } catch {
      setSignInError('Authentication error. Please retry.');
    }
  };

  const handleVerifyFaceLogin = async () => {
    setSignInError('');
    setSignInSuccessMsg('');

    if (!cameraActive || !signInVideoRef.current) {
      setSignInError('Live camera is required for Face Recognition. Click Enable Camera.');
      return;
    }

    setIsVerifyingFace(true);
    try {
      const result = await matchLiveFaceAgainstCrew(signInVideoRef.current, astronauts);
      if (result.error) {
        setSignInError(result.error);
      } else if (result.matched && result.astronaut) {
        recordFaceAuthSuccess({
          astronautId: result.astronaut.id,
          astronautName: result.astronaut.name,
          confidence: result.confidence,
          angle: result.angle || 'center',
          source: 'Face ID Portal',
        });
        setSignInSuccessMsg(
          `Face Recognized: ${result.astronaut.name} (${result.confidence}% match)`
        );
        setTimeout(
          () =>
            onLoginSuccess(result.astronaut, {
              method: 'face',
              confidence: result.confidence,
              angle: result.angle,
            }),
          750
        );
      } else {
        setSignInError(
          `Face not recognized (${result.confidence || 0}% confidence). Align your face with the reticle or enroll in Sign Up.`
        );
      }
    } finally {
      setIsVerifyingFace(false);
    }
  };

  const captureFaceSide = (angle) => {
    setSignUpError('');
    const video = signUpVideoRef.current;
    if (video && cameraActive && video.readyState >= 2) {
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = video.videoWidth || 480;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();
      const url = canvas.toDataURL('image/jpeg', 0.88);
      setSignUpSnaps((prev) => ({ ...prev, [angle]: url }));

      if (angle === 'center') setActiveCaptureAngle('left');
      else if (angle === 'left') setActiveCaptureAngle('right');
    } else {
      setSignUpError('Camera stream is not active. Allow camera permissions to capture your face.');
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setSignUpError('');

    if (!signUpName.trim() || !signUpId.trim() || !signUpPassword) {
      setSignUpError('Please fill in Full Name, Callsign ID, and Password.');
      return;
    }

    const missingSides = ['center', 'left', 'right'].filter((ang) => !signUpSnaps[ang]);
    if (missingSides.length > 0) {
      setActiveCaptureAngle(missingSides[0]);
      setSignUpError(
        `Capture all 3 face angles before signing up (missing: ${missingSides.join(', ')}).`
      );
      return;
    }

    setIsSavingSignUp(true);
    try {
      const faceDescriptors = await buildAstronautFaceDescriptors(signUpSnaps);
      const newAstro = {
        id: signUpId.trim().toUpperCase(),
        name: signUpName.trim(),
        password: signUpPassword,
        role: signUpRole,
        mission: signUpMission.trim() || 'Artemis VIII // Deep Space',
        bloodType: signUpBloodType,
        fingerprint: `FP-${Date.now().toString().slice(-5)}`,
        faceSnaps: {
          center: signUpSnaps.center,
          left: signUpSnaps.left,
          right: signUpSnaps.right,
        },
        faceDescriptors,
        createdAt: new Date().toISOString(),
      };
      const authRes = await firebaseAuthSignUp(newAstro);
      onSignupSuccess(authRes.astronaut || newAstro);
    } catch (err) {
      console.warn('Sign up error:', err);
      setSignUpError('Failed to complete registration.');
    } finally {
      setIsSavingSignUp(false);
    }
  };

  const capturedCount = ['center', 'left', 'right'].filter((a) => Boolean(signUpSnaps[a])).length;

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background:
          'radial-gradient(ellipse at 70% 30%, rgba(16, 46, 107, 0.45) 0%, rgba(6, 19, 43, 0.76) 65%, rgba(3, 10, 24, 0.92) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Subtle Ink-Blue & Oat Grid Atmosphere */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at center, rgba(246, 238, 219, 0.06) 0%, transparent 70%), linear-gradient(rgba(246, 238, 219, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(246, 238, 219, 0.03) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 40px 40px, 40px 40px',
          pointerEvents: 'none',
        }}
      />

      {/* Top Header */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '32px',
          right: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            className="font-tech"
            style={{ fontSize: '0.95rem', color: OAT_BG, letterSpacing: '0.24em', fontWeight: 700 }}
          >
            RIDGE
          </span>
          <span style={{ color: 'rgba(246, 238, 219, 0.35)' }}>·</span>
          <span className="font-mono" style={{ fontSize: '0.75rem', color: '#9fb6da', letterSpacing: '0.16em' }}>
            HUMAN SYSTEMS OBSERVATORY
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            className="font-mono"
            style={{
              fontSize: '0.68rem',
              color: isFirebaseOnline() ? '#34d399' : '#ead9b2',
              letterSpacing: '0.08em',
              background: 'rgba(246, 238, 219, 0.1)',
              padding: '4px 10px',
              borderRadius: '12px',
              border: '1px solid rgba(246, 238, 219, 0.2)',
            }}
          >
            {isFirebaseOnline() ? '● FIREBASE CLOUD' : '○ OFFLINE LOCAL NOSQL'}
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: '0.7rem',
              color: cameraActive ? '#f6eedb' : '#ead9b2',
              letterSpacing: '0.08em',
            }}
          >
            {cameraActive ? 'Camera Live' : 'Camera Standby'}
          </span>
          {onBackToIntro && (
            <button
              type="button"
              onClick={onBackToIntro}
              className="font-mono"
              style={{
                background: 'rgba(246, 238, 219, 0.1)',
                border: '1px solid rgba(246, 238, 219, 0.25)',
                color: OAT_BG,
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.72rem',
                cursor: 'pointer',
                letterSpacing: '0.1em',
              }}
            >
              ← Back
            </button>
          )}
        </div>
      </div>

      {/* ── SLIDING DUAL-PANEL CARD (OAT YELLOW + INK BLUE) ── */}
      <div
        id="sliding-container"
        style={{
          position: 'relative',
          width: 'min(920px, 95vw)',
          minHeight: '580px',
          background: OAT_BG,
          borderRadius: '30px',
          border: `1px solid ${INK_BORDER}`,
          boxShadow: '0 24px 55px rgba(2, 8, 22, 0.55), 0 10px 24px rgba(2, 8, 22, 0.35)',
          overflow: 'hidden',
          zIndex: 10,
        }}
      >
        {/* ── FORM 1: SIGN IN FORM (LEFT ON DEFAULT) ── */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '50%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 42px',
            boxSizing: 'border-box',
            transition: 'all 0.6s ease-in-out',
            zIndex: isSignUp ? 1 : 2,
            opacity: isSignUp ? 0 : 1,
            pointerEvents: isSignUp ? 'none' : 'auto',
            transform: isSignUp ? 'translateX(100%)' : 'translateX(0)',
            background: OAT_BG,
          }}
        >
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: INK_BLUE, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
              Sign In
            </h1>

            <span style={{ fontSize: '0.8rem', color: INK_SOFT, marginBottom: '14px' }}>
              Authenticate with credentials, Face ID, or Touch
            </span>

            {/* Auth Method Switch Tabs */}
            <div style={{ display: 'flex', gap: '6px', width: '100%', marginBottom: '14px' }}>
              {[
                { id: 'password', label: 'Password' },
                { id: 'face', label: 'Face ID' },
                { id: 'fingerprint', label: 'Touch ID' },
              ].map((m) => {
                const active = authMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setAuthMethod(m.id);
                      setSignInError('');
                      setSignInSuccessMsg('');
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 6px',
                      fontSize: '0.72rem',
                      fontFamily: 'monospace',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: active ? INK_BLUE : OAT_CARD_SOFT,
                      border: active ? `1.5px solid ${INK_BLUE}` : `1px solid ${INK_BORDER}`,
                      color: active ? OAT_BG : INK_SOFT,
                      fontWeight: active ? 700 : 600,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            {/* Success / Error Banners */}
            {signInSuccessMsg && (
              <div
                style={{
                  background: '#e5f2e6',
                  border: '1px solid #166534',
                  color: '#14532d',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '0.74rem',
                  width: '100%',
                  marginBottom: '10px',
                  fontFamily: 'monospace',
                }}
              >
                ✓ {signInSuccessMsg}
              </div>
            )}
            {signInError && (
              <div
                style={{
                  background: '#fce8e8',
                  border: '1px solid #991b1b',
                  color: '#7f1d1d',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '0.74rem',
                  width: '100%',
                  marginBottom: '10px',
                  fontFamily: 'monospace',
                }}
              >
                ✕ {signInError}
              </div>
            )}

            {/* Password Mode */}
            {authMethod === 'password' && (
              <form onSubmit={handleSignInSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  type="text"
                  required
                  placeholder="Callsign ID (e.g. ASTRO-01)"
                  value={signInId}
                  onChange={(e) => setSignInId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    background: OAT_INPUT,
                    border: `1px solid ${INK_BORDER}`,
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    color: INK_BLUE,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    background: OAT_INPUT,
                    border: `1px solid ${INK_BORDER}`,
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    color: INK_BLUE,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <a
                  href="#demo-credentials"
                  onClick={(e) => {
                    e.preventDefault();
                    setSignInError('');
                    setSignInSuccessMsg('Demo Credentials — Callsign: ASTRO-01 | Password: password123');
                  }}
                  style={{ fontSize: '0.74rem', color: INK_SOFT, textDecoration: 'none', margin: '2px 0 6px 0', alignSelf: 'flex-start' }}
                >
                  Show Demo Credentials
                </a>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '24px',
                    background: `linear-gradient(135deg, ${INK_MID}, ${INK_BLUE})`,
                    color: OAT_BG,
                    border: 'none',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    boxShadow: '0 6px 16px rgba(6, 19, 43, 0.3)',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  Sign In
                </button>
              </form>
            )}

            {/* Face Recognition Mode (Constant Live Camera + Real Descriptor Matching) */}
            {authMethod === 'face' && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    position: 'relative',
                    width: '170px',
                    height: '170px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: `2px solid ${liveMatch?.matched ? '#16a34a' : INK_BLUE}`,
                    background: INK_BLUE,
                  }}
                >
                  <video
                    ref={signInVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: 'scaleX(-1)',
                      display: cameraActive ? 'block' : 'none',
                    }}
                  />
                  {!cameraActive && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '12px',
                        color: OAT_BG,
                        fontSize: '0.7rem',
                        textAlign: 'center',
                      }}
                    >
                      <span>{cameraError || 'Connecting camera...'}</span>
                    </div>
                  )}
                  <div className="scan-line" style={{ background: OAT_BG, height: '2px' }} />
                  <div
                    style={{
                      position: 'absolute',
                      inset: '11%',
                      border: `1.5px dashed ${liveMatch?.matched ? '#4ade80' : 'rgba(246, 238, 219, 0.7)'}`,
                      borderRadius: '50% 50% 45% 45%',
                      pointerEvents: 'none',
                    }}
                  />
                </div>

                <div
                  className="font-mono"
                  style={{
                    fontSize: '0.7rem',
                    color: liveMatch?.matched ? '#166534' : INK_SOFT,
                    fontWeight: liveMatch?.matched ? 700 : 500,
                    minHeight: '18px',
                  }}
                >
                  {faceScanStatus}
                </div>

                {!cameraActive && (
                  <button
                    type="button"
                    onClick={startConstantCamera}
                    style={{
                      fontSize: '0.72rem',
                      padding: '6px 14px',
                      background: INK_BLUE,
                      color: OAT_BG,
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Enable Camera
                  </button>
                )}

                <button
                  type="button"
                  disabled={isVerifyingFace}
                  onClick={handleVerifyFaceLogin}
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: '24px',
                    background: `linear-gradient(135deg, ${INK_MID}, ${INK_BLUE})`,
                    color: OAT_BG,
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.76rem',
                    letterSpacing: '0.06em',
                    cursor: isVerifyingFace ? 'wait' : 'pointer',
                    boxShadow: '0 6px 16px rgba(6, 19, 43, 0.28)',
                  }}
                >
                  {isVerifyingFace ? 'ANALYZING FACE...' : 'Verify Face ID & Sign In'}
                </button>
              </div>
            )}

            {/* Touch ID Mode */}
            {authMethod === 'fingerprint' && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '12px 0' }}>
                <button
                  type="button"
                  onClick={() => {
                    const target =
                      (astronauts || []).find((a) => a.id.toLowerCase() === signInId.trim().toLowerCase()) ||
                      activeAstronaut;
                    setSignInSuccessMsg(`Touch ID Accepted — ${target?.name}`);
                    setTimeout(() => onLoginSuccess(target), 700);
                  }}
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    border: `2px solid ${INK_BLUE}`,
                    background: OAT_INPUT,
                    color: INK_BLUE,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    cursor: 'pointer',
                  }}
                >
                  👆
                </button>
                <span style={{ fontSize: '0.74rem', color: INK_SOFT }}>Click biometric pad to authenticate</span>
              </div>
            )}
          </div>
        </div>

        {/* ── FORM 2: SIGN UP FORM (3-SIDE FACE CAPTURE + FULL CREW DATA) ── */}
        <div
          className="custom-scroll"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '50%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 32px',
            boxSizing: 'border-box',
            transition: 'all 0.6s ease-in-out',
            zIndex: isSignUp ? 2 : 1,
            opacity: isSignUp ? 1 : 0,
            pointerEvents: isSignUp ? 'auto' : 'none',
            transform: isSignUp ? 'translateX(100%)' : 'translateX(0)',
            background: OAT_BG,
            overflowY: 'auto',
          }}
        >
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: INK_BLUE, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
              Create Account
            </h1>
            <span style={{ fontSize: '0.72rem', color: INK_SOFT, marginBottom: '10px' }}>
              Enroll crew details and capture all 3 face angles ({capturedCount}/3)
            </span>

            {signUpError && (
              <div
                style={{
                  background: '#fce8e8',
                  border: '1px solid #991b1b',
                  color: '#7f1d1d',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '0.7rem',
                  width: '100%',
                  marginBottom: '8px',
                  fontFamily: 'monospace',
                }}
              >
                ✕ {signUpError}
              </div>
            )}

            <form onSubmit={handleSignUpSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {/* Live Camera + 3-Side Face Capture Strip */}
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                  background: OAT_CARD_SOFT,
                  border: `1px solid ${INK_BORDER}`,
                  borderRadius: '12px',
                  padding: '8px',
                }}
              >
                {/* Constant Live Webcam Feed */}
                <div
                  style={{
                    position: 'relative',
                    width: '96px',
                    height: '96px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: INK_BLUE,
                    border: `1.5px solid ${INK_BLUE}`,
                    flexShrink: 0,
                  }}
                >
                  <video
                    ref={signUpVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: 'scaleX(-1)',
                      display: cameraActive ? 'block' : 'none',
                    }}
                  />
                  {!cameraActive && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '6px',
                        color: OAT_BG,
                        fontSize: '0.6rem',
                        textAlign: 'center',
                      }}
                    >
                      <span>{cameraError ? 'No Camera' : 'Starting...'}</span>
                      <button
                        type="button"
                        onClick={startConstantCamera}
                        style={{
                          marginTop: '4px',
                          background: OAT_BG,
                          color: INK_BLUE,
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.58rem',
                          padding: '2px 6px',
                          cursor: 'pointer',
                          fontWeight: 700,
                        }}
                      >
                        Retry
                      </button>
                    </div>
                  )}
                  <div
                    style={{
                      position: 'absolute',
                      inset: '12%',
                      border: '1px dashed rgba(246, 238, 219, 0.65)',
                      borderRadius: '50% 50% 45% 45%',
                      pointerEvents: 'none',
                    }}
                  />
                </div>

                {/* 3 Face Side Slots: Center, Left, Right */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px' }}>
                    {['center', 'left', 'right'].map((ang) => {
                      const hasSnap = Boolean(signUpSnaps[ang]);
                      const isTarget = activeCaptureAngle === ang;
                      return (
                        <button
                          key={ang}
                          type="button"
                          onClick={() => {
                            setActiveCaptureAngle(ang);
                            captureFaceSide(ang);
                          }}
                          style={{
                            position: 'relative',
                            height: '58px',
                            borderRadius: '8px',
                            border: isTarget
                              ? `2px solid ${INK_BLUE}`
                              : hasSnap
                              ? '1.5px solid #15803d'
                              : `1px solid ${INK_BORDER}`,
                            background: OAT_INPUT,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {hasSnap ? (
                            <img
                              src={signUpSnaps[ang]}
                              alt={`${ang} face capture`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <span style={{ fontSize: '0.64rem', fontWeight: 700, color: INK_BLUE, textTransform: 'uppercase' }}>
                              {ang}
                            </span>
                          )}
                          <span
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: hasSnap ? 'rgba(21, 128, 61, 0.85)' : 'rgba(6, 19, 43, 0.78)',
                              color: OAT_BG,
                              fontSize: '0.55rem',
                              fontWeight: 700,
                              padding: '1px 0',
                              textTransform: 'uppercase',
                            }}
                          >
                            {hasSnap ? `✓ ${ang}` : `Snap ${ang}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => captureFaceSide(activeCaptureAngle)}
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      background: INK_BLUE,
                      color: OAT_BG,
                      border: 'none',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Capture {activeCaptureAngle.toUpperCase()} Side
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: OAT_INPUT,
                    border: `1px solid ${INK_BORDER}`,
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    color: INK_BLUE,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <input
                  type="text"
                  required
                  placeholder="Callsign (e.g. ASTRO-09)"
                  value={signUpId}
                  onChange={(e) => setSignUpId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: OAT_INPUT,
                    border: `1px solid ${INK_BORDER}`,
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    color: INK_BLUE,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
                <select
                  value={signUpRole}
                  onChange={(e) => setSignUpRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: OAT_INPUT,
                    border: `1px solid ${INK_BORDER}`,
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    color: INK_BLUE,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="Mission Commander">Mission Commander</option>
                  <option value="Flight Engineer">Flight Engineer</option>
                  <option value="Medical Specialist">Medical Specialist</option>
                  <option value="EVA Specialist">EVA Specialist</option>
                </select>
                <select
                  value={signUpBloodType}
                  onChange={(e) => setSignUpBloodType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: OAT_INPUT,
                    border: `1px solid ${INK_BORDER}`,
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    color: INK_BLUE,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="O-Positive">O-Positive</option>
                  <option value="O-Negative">O-Negative</option>
                  <option value="A-Positive">A-Positive</option>
                  <option value="A-Negative">A-Negative</option>
                  <option value="B-Positive">B-Positive</option>
                  <option value="AB-Positive">AB-Positive</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Mission Assignment"
                value={signUpMission}
                onChange={(e) => setSignUpMission(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: OAT_INPUT,
                  border: `1px solid ${INK_BORDER}`,
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  color: INK_BLUE,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />

              <input
                type="password"
                required
                placeholder="Password"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: OAT_INPUT,
                  border: `1px solid ${INK_BORDER}`,
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  color: INK_BLUE,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />

              {onOpen3DFaceStudio && (
                <button
                  type="button"
                  onClick={onOpen3DFaceStudio}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: 'rgba(6, 19, 43, 0.08)',
                    border: `1px dashed ${INK_BLUE}`,
                    color: INK_BLUE,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Open 3D Visor Face Preview
                </button>
              )}

              <button
                type="submit"
                disabled={isSavingSignUp}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: '24px',
                  background: `linear-gradient(135deg, ${INK_MID}, ${INK_BLUE})`,
                  color: OAT_BG,
                  border: 'none',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontSize: '0.76rem',
                  cursor: isSavingSignUp ? 'wait' : 'pointer',
                  boxShadow: '0 6px 16px rgba(6, 19, 43, 0.3)',
                  marginTop: '2px',
                }}
              >
                {isSavingSignUp ? 'Saving Crew Profile...' : 'Sign Up & Store 3-Side Face'}
              </button>
            </form>
          </div>
        </div>

        {/* ── CURVED INK BLUE TOGGLE CONTAINER (NO ASTRONAUT / ANATOMY BUTTONS) ── */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            width: '50%',
            height: '100%',
            overflow: 'hidden',
            transition: 'all 0.6s ease-in-out',
            borderRadius: isSignUp ? '0 150px 100px 0' : '150px 0 0 100px',
            transform: isSignUp ? 'translateX(-100%)' : 'translateX(0)',
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #0e2859 0%, #06132b 58%, #040d1e 100%)',
              boxShadow: 'inset 0 0 50px rgba(246, 238, 219, 0.12)',
              color: OAT_BG,
              position: 'relative',
              left: '-100%',
              height: '100%',
              width: '200%',
              transform: isSignUp ? 'translateX(50%)' : 'translateX(0)',
              transition: 'all 0.6s ease-in-out',
              display: 'flex',
            }}
          >
            {/* ── TOGGLE PANEL LEFT (SHOWN WHEN SIGNING UP -> "Welcome Back!") ── */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                width: '50%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 40px',
                textAlign: 'center',
                boxSizing: 'border-box',
                transition: 'all 0.6s ease-in-out',
                transform: isSignUp ? 'translateX(0)' : 'translateX(-200%)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.55,
                  pointerEvents: 'none',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '260px',
                    height: '260px',
                    borderRadius: '50%',
                    border: '1px dashed rgba(246, 238, 219, 0.3)',
                    boxShadow: '0 0 35px rgba(246, 238, 219, 0.12)',
                    animation: 'spin 25s linear infinite',
                  }}
                />
              </div>

              <div style={{ position: 'relative', zIndex: 10, maxWidth: '320px' }}>
                <h1 style={{ fontSize: '2.3rem', fontWeight: 800, color: OAT_BG, margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
                  Welcome Back!
                </h1>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'rgba(246, 238, 219, 0.85)', margin: '0 0 24px 0' }}>
                  Sign in with your crew credentials or live facial recognition
                </p>
                <button
                  type="button"
                  onClick={toggleToSignIn}
                  style={{
                    padding: '12px 42px',
                    borderRadius: '24px',
                    background: 'transparent',
                    border: `2px solid ${OAT_BG}`,
                    color: OAT_BG,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = OAT_BG;
                    e.currentTarget.style.color = INK_BLUE;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = OAT_BG;
                  }}
                >
                  Sign In
                </button>
              </div>
            </div>

            {/* ── TOGGLE PANEL RIGHT (SHOWN WHEN SIGNING IN -> "Hello, Crew!") ── */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '50%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 40px',
                textAlign: 'center',
                boxSizing: 'border-box',
                transition: 'all 0.6s ease-in-out',
                transform: isSignUp ? 'translateX(200%)' : 'translateX(0)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.55,
                  pointerEvents: 'none',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '260px',
                    height: '260px',
                    borderRadius: '50%',
                    border: '1px dashed rgba(246, 238, 219, 0.3)',
                    boxShadow: '0 0 35px rgba(246, 238, 219, 0.12)',
                    animation: 'spin 25s linear infinite',
                  }}
                />
              </div>

              <div style={{ position: 'relative', zIndex: 10, maxWidth: '320px' }}>
                <h1 style={{ fontSize: '2.3rem', fontWeight: 800, color: OAT_BG, margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
                  Hello, Explorer!
                </h1>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'rgba(246, 238, 219, 0.85)', margin: '0 0 24px 0' }}>
                  Register your crew dossier and enroll all 3 face angles for RIDGE visor telemetry
                </p>
                <button
                  type="button"
                  onClick={toggleToSignUp}
                  style={{
                    padding: '12px 42px',
                    borderRadius: '24px',
                    background: 'transparent',
                    border: `2px solid ${OAT_BG}`,
                    color: OAT_BG,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = OAT_BG;
                    e.currentTarget.style.color = INK_BLUE;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = OAT_BG;
                  }}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
