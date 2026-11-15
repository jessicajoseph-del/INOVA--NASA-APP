import React, { useState, useRef, useEffect } from 'react';
import {
  LogIn,
  Key,
  Camera,
  Fingerprint,
  UserPlus,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  signInWithPassword,
  signInWithFace,
  signInWithFingerprint,
  getLocalUsers,
  isFingerprintAvailable,
} from '../services/authService';
import { extractDescriptorFromSource } from '../inovav/utils/faceRecognition';

export default function LoginScreen({
  onLoginSuccess,
  onNavigateToSignUp,
  sessionExpiredMessage,
}) {
  // Login Tab: 'password' | 'face' | 'fingerprint'
  const [activeTab, setActiveTab] = useState('password');

  // Username & Password state
  const [usernameOrEmail, setUsernameOrEmail] = useState('alex.vance');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  // Facial Recognition state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [faceConfidence, setFaceConfidence] = useState(null);
  const [faceScanMessage, setFaceScanMessage] = useState('Align your face inside the optical reticle.');

  // Fingerprint state
  const [isFingerprintSupported, setIsFingerprintSupported] = useState(true);

  // Status & Feedback state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const faceScanIntervalRef = useRef(null);

  useEffect(() => {
    isFingerprintAvailable().then((supported) => {
      setIsFingerprintSupported(supported);
    });
  }, []);

  // Stop camera when unmounting or switching tabs
  const stopCamera = () => {
    if (faceScanIntervalRef.current) {
      clearInterval(faceScanIntervalRef.current);
      faceScanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleTabChange = (tab) => {
    setErrorMessage('');
    setSuccessMessage('');
    if (activeTab === 'face' && tab !== 'face') {
      stopCamera();
    }
    setActiveTab(tab);
  };

  // 1. Password Login
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!usernameOrEmail.trim()) {
      setErrorMessage('Please enter your Username / Callsign.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await signInWithPassword(usernameOrEmail, password);
      setSuccessMessage(`Welcome back, ${user.fullName || user.username}. Authentication verified.`);
      setTimeout(() => onLoginSuccess(user), 400);
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Facial Recognition Login
  const startFaceRecognitionLogin = async () => {
    setErrorMessage('');
    setFaceConfidence(null);
    setFaceScanMessage('Initializing high-resolution optical sensor...');
    setIsCameraActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setFaceScanMessage('Aligning facial landmarks against Firestore biometric templates...');

      // Run facial landmark scanning loop
      let attempts = 0;
      faceScanIntervalRef.current = setInterval(async () => {
        if (!videoRef.current) return;
        attempts++;

        try {
          const descriptor = extractDescriptorFromSource(videoRef.current);
          if (descriptor && descriptor.length > 0) {
            const result = await signInWithFace(Array.from(descriptor));
            if (result && result.user) {
              clearInterval(faceScanIntervalRef.current);
              stopCamera();
              setFaceConfidence(result.confidence);
              setSuccessMessage(`Match Verified: ${result.confidence}. Identity authenticated.`);
              setTimeout(() => onLoginSuccess(result.user), 600);
            }
          }
        } catch (scanErr) {
          if (attempts > 8) {
            clearInterval(faceScanIntervalRef.current);
            stopCamera();
            setErrorMessage(scanErr.message || 'Facial recognition timed out. Please try password sign-in.');
          }
        }
      }, 1200);
    } catch (err) {
      setIsCameraActive(false);
      setErrorMessage(err.message || 'Unable to access camera for facial recognition.');
    }
  };

  // 3. Fingerprint Biometric Login
  const handleFingerprintLogin = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      const user = await signInWithFingerprint(usernameOrEmail);
      setSuccessMessage(`Fingerprint Sensor Authenticated: Welcome, ${user.fullName}.`);
      setTimeout(() => onLoginSuccess(user), 500);
    } catch (err) {
      setErrorMessage(err.message || 'Fingerprint biometric sensor scan failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center bg-[#F7F4EE] text-[#0B1736] p-4 sm:p-6 overflow-y-auto">
      {/* Background Subtle Oat Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(11,23,54,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(11,23,54,0.04)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md bg-[#FFFFFF] border border-[#DCD5C7] rounded-3xl p-6 sm:p-9 shadow-[0_12px_40px_rgba(11,23,54,0.08)] my-8">
        
        {/* Session Inactivity Timeout Banner (If Expired) */}
        {sessionExpiredMessage && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2.5 mb-5 shadow-xs">
            <Clock className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="font-medium">{sessionExpiredMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#EDE8DE] border border-[#DCD5C7] flex items-center justify-center text-[#0F2557] mx-auto shadow-sm mb-3">
            <ShieldCheck className="w-7 h-7 text-[#0F2557]" />
          </div>
          <h1 className="font-extrabold text-2xl text-[#0B1736] tracking-tight">
            Crew Authentication
          </h1>
          <p className="font-mono text-xs text-[#5A657D] mt-1">
            RIDGE ZERO-TRUST TELEMETRY PROTOCOL
          </p>
        </div>

        {/* 3 Authentication Method Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#EDE8DE] border border-[#DCD5C7] mb-6">
          <button
            type="button"
            onClick={() => handleTabChange('password')}
            className={`py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'password'
                ? 'bg-[#0F2557] text-white shadow-sm'
                : 'text-[#5A657D] hover:text-[#0B1736]'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Password</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('face')}
            className={`py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'face'
                ? 'bg-[#0F2557] text-white shadow-sm'
                : 'text-[#5A657D] hover:text-[#0B1736]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Face ID</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('fingerprint')}
            className={`py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'fingerprint'
                ? 'bg-[#0F2557] text-white shadow-sm'
                : 'text-[#5A657D] hover:text-[#0B1736]'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Touch ID</span>
          </button>
        </div>

        {/* Inline Feedback Alerts */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2 mb-5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 mb-5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ── TAB 1: USERNAME & PASSWORD SIGN IN ── */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-[#5A657D] uppercase mb-1">
                Username / Callsign
              </label>
              <input
                type="text"
                required
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="e.g. alex.vance"
                className="w-full bg-[#EDE8DE] text-[#0B1736] placeholder-[#5A657D] text-xs px-3.5 py-2.5 rounded-xl border border-[#DCD5C7] focus:outline-none focus:border-[#0F2557]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#5A657D] uppercase mb-1">
                Security Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter mission password"
                  className="w-full bg-[#EDE8DE] text-[#0B1736] placeholder-[#5A657D] text-xs px-3.5 py-2.5 rounded-xl border border-[#DCD5C7] focus:outline-none focus:border-[#0F2557] pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 text-[#5A657D] hover:text-[#0B1736]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#0F2557] hover:bg-[#1A3B8B] text-white font-bold text-sm shadow-md active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Authenticate & Enter System</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ── TAB 2: FACIAL RECOGNITION QUICK LOGIN ── */}
        {activeTab === 'face' && (
          <div className="space-y-4 text-center">
            <div className="relative rounded-2xl overflow-hidden border border-[#DCD5C7] bg-[#EDE8DE] aspect-square flex flex-col items-center justify-center p-3">
              {isCameraActive ? (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-xl" />
                  {/* Optical Reticle */}
                  <div className="absolute inset-6 border-2 border-dashed border-cyan-500/80 rounded-full pointer-events-none animate-pulse" />
                </>
              ) : (
                <div className="space-y-2">
                  <Camera className="w-12 h-12 text-[#5A657D] mx-auto opacity-70" />
                  <span className="block text-xs font-mono text-[#5A657D]">
                    Optical Reticle Offline
                  </span>
                </div>
              )}

              {faceConfidence && (
                <div className="absolute bottom-3 inset-x-3 bg-emerald-900/90 text-white rounded-lg p-2 text-xs font-mono font-bold">
                  Match Verified: {faceConfidence}
                </div>
              )}
            </div>

            <p className="text-xs text-[#5A657D] font-mono leading-relaxed">
              {faceScanMessage}
            </p>

            {!isCameraActive ? (
              <button
                type="button"
                onClick={startFaceRecognitionLogin}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#0F2557] hover:bg-[#1A3B8B] text-white font-bold text-sm shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Activate Camera & Scan Face</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCamera}
                className="w-full py-2.5 px-4 rounded-xl border border-[#DCD5C7] text-xs font-bold text-[#5A657D] hover:text-[#0B1736] cursor-pointer"
              >
                Cancel Optical Scan
              </button>
            )}
          </div>
        )}

        {/* ── TAB 3: FINGERPRINT BIOMETRIC LOGIN ── */}
        {activeTab === 'fingerprint' && (
          <div className="space-y-4 text-center">
            <div className="p-8 rounded-2xl bg-[#EDE8DE]/60 border border-[#DCD5C7] flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-[#FFFFFF] border border-[#DCD5C7] flex items-center justify-center text-[#0F2557] shadow-inner mb-3">
                <Fingerprint className="w-10 h-10 text-[#0F2557] animate-pulse" />
              </div>
              <span className="font-mono text-xs font-bold text-[#0B1736]">
                Native WebAuthn Platform Sensor
              </span>
              <span className="text-[11px] text-[#5A657D] mt-1">
                Touch sensor with Windows Hello, Touch ID, or registered passkey.
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#5A657D] uppercase mb-1 text-left">
                Callsign / Username for Passkey (Optional)
              </label>
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="Defaults to active enrolled crew"
                className="w-full bg-[#EDE8DE] text-[#0B1736] placeholder-[#5A657D] text-xs px-3.5 py-2.5 rounded-xl border border-[#DCD5C7] focus:outline-none focus:border-[#0F2557]"
              />
            </div>

            <button
              type="button"
              disabled={isLoading || !isFingerprintSupported}
              onClick={handleFingerprintLogin}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#0F2557] hover:bg-[#1A3B8B] text-white font-bold text-sm shadow-md active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Scanning Biometric Sensor...</span>
                </>
              ) : (
                <>
                  <Fingerprint className="w-4 h-4" />
                  <span>Touch Fingerprint Sensor to Sign In</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Link to Sign Up */}
        <div className="mt-6 pt-4 border-t border-[#DCD5C7] text-center text-xs text-[#5A657D]">
          <span>New crew member? </span>
          <button
            type="button"
            onClick={onNavigateToSignUp}
            className="font-bold text-[#0F2557] hover:underline cursor-pointer"
          >
            Create New Crew Account (Sign Up)
          </button>
        </div>

      </div>

      {/* Bottom Pre-Configured Test Credentials Pill */}
      <div className="relative z-10 px-4 py-2 rounded-full bg-[#FFFFFF] border border-[#DCD5C7] text-[11px] font-mono text-[#5A657D] shadow-xs flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#0F2557]" />
        <span>Seeded Test Crew: <strong>alex.vance</strong> / <strong>password123</strong></span>
      </div>
    </div>
  );
}
