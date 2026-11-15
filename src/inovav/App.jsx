import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Effects, useGLTF, useAnimations } from '@react-three/drei';
import { UnrealBloomPass, ShaderPass, SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';
import {
  Home as LucideHome,
  Briefcase as LucideBriefcase,
  MessageSquare as LucideMessageSquare,
  Calendar as LucideCalendar,
  Archive as LucideArchive,
  BarChart3 as LucideBarChart,
  User as LucideUser,
  Settings as LucideSettings,
  LogOut as LucideLogOut,
  ChevronLeft as LucideChevronLeft,
  ChevronRight as LucideChevronRight,
  Activity,
  Heart,
  Radio,
  Sparkles,
  ShieldCheck,
  Thermometer,
  Wind,
  Dumbbell,
  Plus,
  ShieldAlert,
} from 'lucide-react';
import { SemiCircularGauge } from '../components/AstroCareDashboard';
import VitalObservatory from './VitalObservatory';
import JarvisTouchlessHud from './JarvisTouchlessHud';
import { getAstronautsFromFirebase, saveAstronautToFirebase } from './firebase';
import ThreeDFaceMesh from './components/ThreeDFaceMesh';
import ThreeDFaceStudioModal from './components/ThreeDFaceStudioModal';
import ModernSlidingLogin from './components/ModernSlidingLogin';
import MissionHUD from './components/experience/MissionHUD';
import HeartRateTelemetryChart from './components/HeartRateTelemetryChart';
import FaceAuthLogView from './components/FaceAuthLogView';
import { buildAstronautFaceDescriptors } from './utils/faceRecognition';
import { getFaceAuthLogs, clearFaceAuthLogs } from './utils/faceAuthLog';
import AstriChatbot from '../components/AstriChatbot';

extend({ UnrealBloomPass, ShaderPass });

// ── DEFAULT SEED ASTRONAUT ───────────────────────────────────────────────
const DEFAULT_ASTRONAUT = {
  id: 'ASTRO-01',
  name: 'CDR. Alex Vance',
  password: 'password123',
  mission: 'Artemis VII // Mars Transfer',
  role: 'Mission Commander',
  bloodType: 'O-Negative',
  fingerprint: 'FP-SYNTH-89012',
  faceSnaps: {
    center: null,
    left: null,
    right: null,
  },
};

const STORAGE_KEY = 'ridge_astronaut_db';
const LEGACY_STORAGE_KEY = 'inova_astronaut_db';

const getStoredAstronauts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([DEFAULT_ASTRONAUT]));
      return [DEFAULT_ASTRONAUT];
    }
    const parsed = JSON.parse(raw);
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return [DEFAULT_ASTRONAUT];
  }
};

const saveAstronautToDb = (newAstro) => {
  try {
    const current = getStoredAstronauts();
    const updated = [...current.filter((a) => a.id.toLowerCase() !== newAstro.id.toLowerCase()), newAstro];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Persist to Google Cloud / Firebase Firestore
    saveAstronautToFirebase(newAstro).catch(console.warn);
    return updated;
  } catch (err) {
    console.error('Storage error:', err);
    return [newAstro];
  }
};

// ── 3D Holographic Human Body Component for "SCAN VITAL 3D BODY" ──────────
const HolographicBody3D = ({ scanProgress }) => {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.7;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0]} scale={1.1}>
      {/* Head */}
      <mesh position={[0, 1.45, 0]}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.7} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.25, 0.2, 1.1, 16]} />
        <meshBasicMaterial color="#0099ff" wireframe transparent opacity={0.5} />
      </mesh>
      {/* Heart Core */}
      <mesh position={[0.04, 0.85, 0.05]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color="#ff2266" transparent opacity={0.9} />
      </mesh>
      {/* Lungs */}
      <mesh position={[-0.08, 0.88, 0]}>
        <capsuleGeometry args={[0.06, 0.18, 8, 16]} />
        <meshBasicMaterial color="#00ffcc" wireframe transparent opacity={0.6} />
      </mesh>
      <mesh position={[0.08, 0.88, 0]}>
        <capsuleGeometry args={[0.06, 0.18, 8, 16]} />
        <meshBasicMaterial color="#00ffcc" wireframe transparent opacity={0.6} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.38, 0.75, 0]} rotation={[0, 0, 0.2]}>
        <capsuleGeometry args={[0.06, 0.9, 8, 16]} />
        <meshBasicMaterial color="#00e5ff" wireframe transparent opacity={0.45} />
      </mesh>
      <mesh position={[0.38, 0.75, 0]} rotation={[0, 0, -0.2]}>
        <capsuleGeometry args={[0.06, 0.9, 8, 16]} />
        <meshBasicMaterial color="#00e5ff" wireframe transparent opacity={0.45} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.15, -0.4, 0]}>
        <capsuleGeometry args={[0.08, 1.2, 8, 16]} />
        <meshBasicMaterial color="#0088ff" wireframe transparent opacity={0.45} />
      </mesh>
      <mesh position={[0.15, -0.4, 0]}>
        <capsuleGeometry args={[0.08, 1.2, 8, 16]} />
        <meshBasicMaterial color="#0088ff" wireframe transparent opacity={0.45} />
      </mesh>

      {/* Dynamic Laser Scanning Ring */}
      <mesh position={[0, -0.9 + (scanProgress % 100) * 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 0.52, 32]} />
        <meshBasicMaterial color="#00ffff" side={THREE.DoubleSide} transparent opacity={0.85} />
      </mesh>
    </group>
  );
};

// ── NAV.JPG FAITHFUL ICONSAX VECTOR ICONS ─────────────────────────────────
const RabbitIcon = ({ size = 22, color = '#ffffff' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M6 3.5L8.5 10.5L12 6.5L15.5 10.5L18 3.5C19.2 6.8 20 11.2 18.2 15C16.8 18 14.5 20.5 12 20.5C9.5 20.5 7.2 18 5.8 15C4 11.2 4.8 6.8 6 3.5Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
    />
  </svg>
);

const HomeNavIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M4.5 11.5C4.5 6.8 7.8 3 12 3C16.2 3 19.5 6.8 19.5 11.5V17.5C19.5 19.4 17.9 21 16 21H8C6.1 21 4.5 19.4 4.5 17.5V11.5Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 13.5C10.2 15.2 13.8 15.2 15 13.5"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ProjectsNavIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M9 6V4.5C9 3.67 9.67 3 10.5 3H13.5C14.33 3 15 3.67 15 4.5V6"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="3.5"
      y="6"
      width="17"
      height="15"
      rx="4"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.5 11.5H9C9.5 11.5 10 12 10 12.5V13C10 14.1 10.9 15 12 15C13.1 15 14 14.1 14 13V12.5C14 12 14.5 11.5 15 11.5H20.5"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MessagesNavIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M8.5 19H16C19 19 21 17.5 21 14V8.5C21 5 19 3.5 16 3.5H8C5 3.5 3 5 3 8.5V16C3 17.7 4 19 5.8 19.5"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.2 16.5L3 20C3 20.6 3.5 21 4.1 20.8L7.5 19.5"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="8" cy="11.5" r="1" fill={color} />
    <circle cx="12" cy="11.5" r="1" fill={color} />
    <circle cx="16" cy="11.5" r="1" fill={color} />
  </svg>
);

const CalendarNavIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect
      x="3.5"
      y="5"
      width="17"
      height="16"
      rx="4.5"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 2.5V6M16 2.5V6"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.5 9.5H20.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x="7.5" y="12.5" width="1.8" height="1.8" rx="0.5" fill={color} />
    <rect x="11.1" y="12.5" width="1.8" height="1.8" rx="0.5" fill={color} />
    <rect x="14.7" y="12.5" width="1.8" height="1.8" rx="0.5" fill={color} />
    <rect x="7.5" y="16" width="1.8" height="1.8" rx="0.5" fill={color} />
    <rect x="11.1" y="16" width="1.8" height="1.8" rx="0.5" fill={color} />
    <rect x="14.7" y="16" width="1.8" height="1.8" rx="0.5" fill={color} />
  </svg>
);

const ArchiveNavIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M4 5.5C4 4.4 4.9 3.5 6 3.5H18C19.1 3.5 20 4.4 20 5.5V9C20 10.1 19.1 11 18 11H6C4.9 11 4 10.1 4 9V5.5Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.5 11V17.5C4.5 19.4 6.1 21 8 21H16C17.9 21 19.5 19.4 19.5 17.5V11"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 14H14"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AnalyticsNavIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.5 15.5V12.5M12 15.5V9M15.5 15.5V11"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AccountNavIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="12"
      r="3.2"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="1" fill={color} />
  </svg>
);

const SettingsNavIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 3V5.5M12 18.5V21M3 12H5.5M18.5 12H21M5.6 5.6L7.4 7.4M16.6 16.6L18.4 18.4M5.6 18.4L7.4 16.6M16.6 7.4L18.4 5.6"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ── SCREEN 1: Hohmann Transfer Particle Swarm (Intro) ─────────────────────
const HohmannParticleSwarm = () => {
  const meshRef = useRef();
  const count = 18000;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const color = useMemo(() => new THREE.Color(), []);

  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < count; i++) {
      pos.push(new THREE.Vector3((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100));
    }
    return pos;
  }, [count]);

  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xffffff }), []);
  const geometry = useMemo(() => {
    const geo = new THREE.TetrahedronGeometry(0.24).clone();
    const W = Math.ceil(Math.sqrt(count));
    const H = W;
    const references = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      references[i * 2] = ((i % W) + 0.5) / W;
      references[i * 2 + 1] = (Math.floor(i / W) + 0.5) / H;
    }
    geo.setAttribute('reference', new THREE.InstancedBufferAttribute(references, 2));
    return geo;
  }, [count]);

  const orbitScale = 20.0;
  const transferEccentricity = 0.21;
  const shipSpeed = 1.0;
  const rEarth = 10.0 * orbitScale;
  const rMars = 15.2 * orbitScale;
  const a = (rEarth + rMars) / 2.0;
  const e = transferEccentricity;
  const b = a * Math.sqrt(Math.abs(1.0 - e * e));

  const p1 = 0;
  const p2 = 0;
  const p3 = 0;
  const p4 = count * 0.7;

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const E_ship = (time * shipSpeed) % (Math.PI * 2.0);
    const cx = a * Math.cos(E_ship) - a * e;
    const cz = b * Math.sin(E_ship);

    for (let i = 0; i < count; i++) {
      if (i < p1) {
        const hash1 = (i * 0.12345) % 1.0;
        const phi = Math.acos(1.0 - 2.0 * ((i * 0.345) % 1.0));
        const theta = ((i * 0.678) % 1.0) * Math.PI * 2.0;
        const r = 2.0 * orbitScale * hash1;
        target.set(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
        color.setHSL(0.1 + hash1 * 0.05, 1.0, 0.5 + hash1 * 0.5);
      } else if (i < p2) {
        const angle = ((i - p1) / (p2 - p1)) * Math.PI * 2.0;
        target.set(Math.cos(angle) * rEarth, 0.0, Math.sin(angle) * rEarth);
        color.setHSL(0.6, 0.8, 0.5);
      } else if (i < p3) {
        const angle = ((i - p2) / (p3 - p2)) * Math.PI * 2.0;
        target.set(Math.cos(angle) * rMars, 0.0, Math.sin(angle) * rMars);
        color.setHSL(0.05, 0.9, 0.5);
      } else if (i < p4) {
        const E = ((i - p3) / (p4 - p3)) * Math.PI * 2.0;
        target.set(a * Math.cos(E) - a * e, 0.0, b * Math.sin(E));
        color.setHSL(0.3, 0.8, 0.3);
      } else {
        const idx = i - p4;
        const hash = (idx * 0.54321) % 1.0;
        const spread = 0.5 * orbitScale * hash;
        const phi = Math.acos(1.0 - 2.0 * ((idx * 0.111) % 1.0));
        const theta = ((idx * 0.222) % 1.0) * Math.PI * 2.0;
        target.set(cx + spread * Math.sin(phi) * Math.cos(theta), spread * Math.sin(phi) * Math.sin(theta), cz + spread * Math.cos(phi));
        color.setHSL(0.15, 1.0, 0.8 + hash * 0.2);
      }
      positions[i].lerp(target, 0.1);
      dummy.position.copy(positions[i]);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, color);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[geometry, material, count]} />;
};

// ── SCREEN 2: Astrophage Petrova Line Particle Swarm (Login Background) ──
const PetrovaParticleSwarm = () => {
  const meshRef = useRef();
  const count = 20000;
  const speedMult = 1.2;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const color = useMemo(() => new THREE.Color(), []);

  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < count; i++) {
      pos.push(new THREE.Vector3((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100));
    }
    return pos;
  }, [count]);

  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xffffff }), []);
  const geometry = useMemo(() => {
    const geo = new THREE.TetrahedronGeometry(0.25).clone();
    const W = Math.ceil(Math.sqrt(count));
    const H = W;
    const references = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      references[i * 2] = ((i % W) + 0.5) / W;
      references[i * 2 + 1] = (Math.floor(i / W) + 0.5) / H;
    }
    geo.setAttribute('reference', new THREE.InstancedBufferAttribute(references, 2));
    return geo;
  }, [count]);

  const orbitRadius = 220.0;
  const lineDensity = 2.5;
  const speed = 1.2;
  const chaos = 2.0;

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime() * speedMult;
    const t = time * speed;
    const sunX = -110.0, sunY = -25.0, sunZ = 0.0, venusX = 110.0;

    for (let i = 0; i < count; i++) {
      const u = i / count;
      const phase = (u + t * 0.05) % 1.0;
      const p = phase < 0.5 ? phase * 2.0 : (phase - 0.5) * 2.0;
      const dir = phase < 0.5 ? 1.0 : -1.0;
      const baseX = sunX + (venusX - sunX) * p;
      const angle = u * 6.28318530718 * lineDensity;
      const radius = 2.0 + 3.0 * Math.sin(u * 50.0 + t);
      const swirlY = sunY + Math.cos(angle + t * dir) * radius;
      const swirlZ = sunZ + Math.sin(angle + t * dir) * radius;
      const n = Math.sin((baseX) * 0.01 + t * 3.0) * chaos;
      target.set(baseX + n, swirlY, swirlZ);

      const heat = 1.0 - p;
      const hue = 0.1 + 0.6 * (1.0 - heat) + 0.1 * Math.sin(t + u * 10.0);
      const light = 0.5 + 0.3 * heat;
      color.setHSL(hue % 1.0, 1.0, light);

      positions[i].lerp(target, 0.1);
      dummy.position.copy(positions[i]);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, color);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[geometry, material, count]} />;
};

class AstronautErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

const ExternalGLTFAstronaut = ({ onSetAction }) => {
  const { scene, animations } = useGLTF('/animated_astronaut_in_space_suit_loop/scene.gltf');
  const modelRef = useRef();
  const clone = useMemo(() => {
    const c = SkeletonUtils.clone(scene);
    c.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.toneMapped = true;
        if (child.material.name === 'material1') {
          child.material.roughness = 0.15;
          child.material.metalness = 0.85;
        } else {
          child.material.roughness = 0.65;
          child.material.metalness = 0.15;
        }
      }
    });
    return c;
  }, [scene]);

  const { actions, names } = useAnimations(animations, modelRef);

  useEffect(() => {
    if (actions && names.length > 0) {
      const act = actions[names[0]];
      if (act) {
        act.reset().fadeIn(0.5).play();
        act.timeScale = 0.65;
        if (onSetAction) onSetAction(act);
      }
    }
    return () => {
      if (onSetAction) onSetAction(null);
    };
  }, [actions, names, onSetAction]);

  return <primitive ref={modelRef} object={clone} />;
};

// Detailed Articulated 3D Astronaut rendered when scene.bin is absent from repo
const ProceduralAstronautModel = ({ isHovered }) => {
  const rightShoulderRef = useRef();
  const rightElbowRef = useRef();
  const leftShoulderRef = useRef();
  const headRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();

  const [suitTex, visorTex] = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const s = loader.load('/animated_astronaut_in_space_suit_loop/textures/material0_baseColor.png');
    s.colorSpace = THREE.SRGBColorSpace;
    const v = loader.load('/animated_astronaut_in_space_suit_loop/textures/material1_baseColor.png');
    v.colorSpace = THREE.SRGBColorSpace;
    return [s, v];
  }, []);

  useEffect(() => {
    return () => {
      suitTex?.dispose();
      visorTex?.dispose();
    };
  }, [suitTex, visorTex]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const speed = isHovered ? 2.1 : 1.0;

    // Gentle waving right arm + subtle zero-G counter balance
    if (rightShoulderRef.current) {
      rightShoulderRef.current.rotation.z = 2.15 + Math.sin(t * 2.2 * speed) * 0.28;
      rightShoulderRef.current.rotation.x = -0.25 + Math.cos(t * 1.4) * 0.08;
    }
    if (rightElbowRef.current) {
      rightElbowRef.current.rotation.z = 0.55 + Math.sin(t * 3.0 * speed + 0.5) * 0.26;
    }
    if (leftShoulderRef.current) {
      leftShoulderRef.current.rotation.z = -0.22 + Math.sin(t * 1.1) * 0.06;
      leftShoulderRef.current.rotation.x = 0.12 + Math.cos(t * 1.3) * 0.07;
    }
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.8) * 0.12;
      headRef.current.rotation.x = Math.sin(t * 1.1) * 0.05;
    }
    if (leftLegRef.current && rightLegRef.current) {
      leftLegRef.current.rotation.x = Math.sin(t * 1.2) * 0.06;
      rightLegRef.current.rotation.x = -Math.sin(t * 1.2) * 0.06;
    }
  });

  return (
    <group>
      {/* Torso & Chest Assembly */}
      <mesh position={[0, 1.04, 0]}>
        <capsuleGeometry args={[0.24, 0.36, 12, 24]} />
        <meshStandardMaterial color="#e8edf5" map={suitTex} roughness={0.55} metalness={0.18} />
      </mesh>

      {/* Waist Belt / Gimbal Ring */}
      <mesh position={[0, 0.77, 0]}>
        <cylinderGeometry args={[0.24, 0.23, 0.1, 24]} />
        <meshStandardMaterial color="#1f2c40" roughness={0.45} metalness={0.55} />
      </mesh>

      {/* Chest Telemetry Display Control Module (DCM) */}
      <mesh position={[0, 1.08, 0.23]}>
        <boxGeometry args={[0.24, 0.2, 0.1]} />
        <meshStandardMaterial color="#cad4e2" roughness={0.4} metalness={0.45} />
      </mesh>
      <mesh position={[-0.055, 1.11, 0.285]}>
        <boxGeometry args={[0.075, 0.055, 0.015]} />
        <meshBasicMaterial color={isHovered ? '#00ffff' : '#38bdf8'} />
      </mesh>
      <mesh position={[0.055, 1.11, 0.285]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.015, 16]} />
        <meshBasicMaterial color="#ff5a5f" />
      </mesh>

      {/* PLSS Life Support Backpack */}
      <mesh position={[0, 1.08, -0.25]}>
        <boxGeometry args={[0.42, 0.54, 0.2]} />
        <meshStandardMaterial color="#dce4f0" roughness={0.5} metalness={0.25} />
      </mesh>
      <mesh position={[0.14, 1.42, -0.28]}>
        <cylinderGeometry args={[0.012, 0.012, 0.22, 10]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.14, 1.54, -0.28]}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshBasicMaterial color="#00ffcc" />
      </mesh>

      {/* Helmet & Neck Seal Ring */}
      <mesh position={[0, 1.36, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.19, 0.038, 14, 28]} />
        <meshStandardMaterial color="#253652" metalness={0.65} roughness={0.3} />
      </mesh>

      <group ref={headRef} position={[0, 1.56, 0]}>
        {/* White Helmet Shell */}
        <mesh>
          <sphereGeometry args={[0.255, 32, 32]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.35} metalness={0.2} />
        </mesh>
        {/* Gold/Obsidian Reflective EVA Visor */}
        <mesh position={[0, -0.01, 0.075]} scale={[0.92, 0.88, 0.92]}>
          <sphereGeometry args={[0.225, 32, 32]} />
          <meshStandardMaterial
            color="#d49b38"
            map={visorTex}
            roughness={0.1}
            metalness={0.92}
            emissive="#1a1204"
            emissiveIntensity={0.45}
          />
        </mesh>
        {/* Visor Oat Yellow HUD Glint */}
        <mesh position={[-0.08, 0.06, 0.25]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshBasicMaterial color="#f6eedb" transparent opacity={0.7} />
        </mesh>
        {/* Side Helmet Comms Pods */}
        <mesh position={[-0.255, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.065, 0.065, 0.05, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.55} roughness={0.4} />
        </mesh>
        <mesh position={[0.255, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.065, 0.065, 0.05, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.55} roughness={0.4} />
        </mesh>
      </group>

      {/* Left Arm */}
      <group ref={leftShoulderRef} position={[-0.29, 1.24, 0]}>
        <mesh>
          <sphereGeometry args={[0.095, 16, 16]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
        <mesh position={[-0.04, -0.18, 0.02]} rotation={[0, 0, -0.14]}>
          <capsuleGeometry args={[0.072, 0.24, 10, 16]} />
          <meshStandardMaterial color="#e8edf5" map={suitTex} roughness={0.6} />
        </mesh>
        <mesh position={[-0.07, -0.4, 0.07]} rotation={[0.25, 0, -0.08]}>
          <capsuleGeometry args={[0.065, 0.22, 10, 16]} />
          <meshStandardMaterial color="#dce4f0" roughness={0.55} />
        </mesh>
        <mesh position={[-0.08, -0.56, 0.1]}>
          <sphereGeometry args={[0.068, 14, 14]} />
          <meshStandardMaterial color="#1e293b" roughness={0.45} metalness={0.4} />
        </mesh>
      </group>

      {/* Right Arm (Waving) */}
      <group ref={rightShoulderRef} position={[0.29, 1.24, 0]}>
        <mesh>
          <sphereGeometry args={[0.095, 16, 16]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
        <mesh position={[0.02, -0.17, 0.02]}>
          <capsuleGeometry args={[0.072, 0.23, 10, 16]} />
          <meshStandardMaterial color="#e8edf5" map={suitTex} roughness={0.6} />
        </mesh>
        <group ref={rightElbowRef} position={[0.02, -0.34, 0.02]}>
          <mesh position={[0.02, -0.14, 0.04]}>
            <capsuleGeometry args={[0.064, 0.2, 10, 16]} />
            <meshStandardMaterial color="#dce4f0" roughness={0.55} />
          </mesh>
          <mesh position={[0.03, -0.28, 0.06]}>
            <sphereGeometry args={[0.068, 14, 14]} />
            <meshStandardMaterial color="#1e293b" roughness={0.45} metalness={0.4} />
          </mesh>
        </group>
      </group>

      {/* Left Leg & EVA Boot */}
      <group ref={leftLegRef} position={[-0.125, 0.72, 0]}>
        <mesh position={[0, -0.18, 0]}>
          <capsuleGeometry args={[0.092, 0.26, 10, 18]} />
          <meshStandardMaterial color="#e8edf5" map={suitTex} roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.45, -0.01]}>
          <capsuleGeometry args={[0.084, 0.26, 10, 18]} />
          <meshStandardMaterial color="#dce4f0" roughness={0.55} />
        </mesh>
        <mesh position={[0, -0.64, 0.045]}>
          <boxGeometry args={[0.14, 0.1, 0.24]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.45} />
        </mesh>
      </group>

      {/* Right Leg & EVA Boot */}
      <group ref={rightLegRef} position={[0.125, 0.72, 0]}>
        <mesh position={[0, -0.18, 0]}>
          <capsuleGeometry args={[0.092, 0.26, 10, 18]} />
          <meshStandardMaterial color="#e8edf5" map={suitTex} roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.45, -0.01]}>
          <capsuleGeometry args={[0.084, 0.26, 10, 18]} />
          <meshStandardMaterial color="#dce4f0" roughness={0.55} />
        </mesh>
        <mesh position={[0, -0.64, 0.045]}>
          <boxGeometry args={[0.14, 0.1, 0.24]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.45} />
        </mesh>
      </group>
    </group>
  );
};

// ── 3D Astronaut Component with Evasion Physics ───────────────────────────
const Astronaut = ({ onHover, isHovered, positionSide = 'right' }) => {
  const group = useRef();
  const actionRef = useRef(null);

  const enterTimeRef = useRef(null);

  // Dynamic target positioning for smooth planet-style cross-screen transitions
  const getTargets = (side) => {
    switch (side) {
      case 'center':
      case 'welcome': {
        const now = performance.now();
        if (enterTimeRef.current === null) {
          enterTimeRef.current = now;
        }
        const elapsedSec = Math.max(0, (now - enterTimeRef.current) / 1000);
        const flyProgress = THREE.MathUtils.clamp(elapsedSec / 1.8, 0, 1);
        const ease = 1 - Math.pow(1 - flyProgress, 3);
        const dynamicScale = THREE.MathUtils.lerp(5.5, 33.5, ease);
        const dynamicY = THREE.MathUtils.lerp(-10.0, -26.0, ease);
        const dynamicZ = THREE.MathUtils.lerp(-55.0, 12.0, ease);
        return { x: 0.0, y: dynamicY, z: dynamicZ, scale: dynamicScale, facingY: 0.0 };
      }
      case 'login-right': {
        enterTimeRef.current = null;
        return { x: 12.8, y: -13.0, z: 0.0, scale: 10.2, facingY: -0.22 };
      }
      case 'login-left': {
        enterTimeRef.current = null;
        return { x: -12.8, y: -13.0, z: 0.0, scale: 10.2, facingY: 0.22 };
      }
      case 'dashboard': {
        enterTimeRef.current = null;
        return { x: -30.5, y: -15.0, z: 0.0, scale: 13.5, facingY: 0.28 };
      }
      default:
        enterTimeRef.current = null;
        return { x: 0.0, y: -16.0, z: 0.0, scale: 16.5, facingY: 0.0 };
    }
  };

  const initial = getTargets(positionSide);
  const currentBaseX = useRef(initial.x);
  const currentBaseY = useRef(initial.y);
  const currentBaseZ = useRef(initial.z || 0.0);
  const currentScale = useRef(initial.scale);
  const currentOffset = useRef(new THREE.Vector3(0, 0, 0));
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const mouse3D = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    const { x: targetX, y: targetY, z: targetZ = 0.0, scale: targetScale, facingY: targetFacingY } = getTargets(positionSide);

    currentBaseX.current = THREE.MathUtils.lerp(currentBaseX.current, targetX, 0.05);
    currentBaseY.current = THREE.MathUtils.lerp(currentBaseY.current, targetY, 0.05);
    currentBaseZ.current = THREE.MathUtils.lerp(currentBaseZ.current, targetZ, 0.05);
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale, 0.05);

    plane.constant = -currentBaseZ.current;
    state.raycaster.setFromCamera(state.pointer, state.camera);
    state.raycaster.ray.intersectPlane(plane, mouse3D);

    const astroCenter = new THREE.Vector3(
      currentBaseX.current + currentOffset.current.x,
      currentBaseY.current + (currentScale.current * 0.95) + currentOffset.current.y,
      currentBaseZ.current + currentOffset.current.z
    );

    const distToMouse = astroCenter.distanceTo(mouse3D);
    const evadeRadius = positionSide === 'center' ? (currentScale.current * 2.2) : 20.0;
    const isEscaping = distToMouse < evadeRadius;

    if (onHover) onHover(isEscaping);

    if (actionRef.current) {
      const targetSpeed = isEscaping ? 2.2 : 0.65;
      actionRef.current.timeScale = THREE.MathUtils.lerp(actionRef.current.timeScale, targetSpeed, 0.08);
    }

    const targetOffset = new THREE.Vector3(0, 0, 0);

    if (isEscaping && positionSide === 'center') {
      const repelDir = astroCenter.clone().sub(mouse3D).normalize();
      const forceRatio = (evadeRadius - distToMouse) / evadeRadius;
      const force = Math.pow(forceRatio, 1.2) * 24.0;
      targetOffset.x = repelDir.x * force * 1.1;
      targetOffset.y = repelDir.y * force * 0.8;
      targetOffset.z = -force * 0.85;
    }

    targetOffset.y += Math.sin(t * 1.5) * 1.6;
    targetOffset.x += Math.cos(t * 0.9) * 0.9;
    currentOffset.current.lerp(targetOffset, 0.09);

    group.current.position.set(
      currentBaseX.current + currentOffset.current.x,
      currentBaseY.current + currentOffset.current.y,
      currentBaseZ.current + currentOffset.current.z
    );
    group.current.scale.setScalar(currentScale.current);

    let targetRotY = targetFacingY + Math.sin(t * 0.5) * 0.12;
    let targetRotX = Math.sin(t * 0.7) * 0.05;
    let targetRotZ = Math.sin(t * 0.8) * 0.04;

    if (isEscaping && positionSide === 'center') {
      const dx = astroCenter.x - mouse3D.x;
      const dy = astroCenter.y - mouse3D.y;
      targetRotZ = THREE.MathUtils.clamp(-dx * 0.02, -0.4, 0.4);
      targetRotX = THREE.MathUtils.clamp(-0.25 - dy * 0.015, -0.45, 0.08);
      targetRotY += THREE.MathUtils.clamp(dx * 0.015, -0.35, 0.35);
    }

    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotY, 0.08);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetRotX, 0.08);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, targetRotZ, 0.08);
  });

  return (
    <group ref={group} style={{ cursor: 'pointer' }}>
      <AstronautErrorBoundary fallback={<ProceduralAstronautModel isHovered={isHovered} />}>
        <Suspense fallback={<ProceduralAstronautModel isHovered={isHovered} />}>
          <ExternalGLTFAstronaut onSetAction={(act) => { actionRef.current = act; }} />
        </Suspense>
      </AstronautErrorBoundary>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[1.1, 1.45, 64]} />
        <meshBasicMaterial color={isHovered ? '#f6eedb' : '#ead9b2'} transparent opacity={isHovered ? 0.9 : 0.35} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

useGLTF.preload('/animated_astronaut_in_space_suit_loop/scene.gltf');

// ── MAIN APPLICATION COMPONENT ────────────────────────────────────────────
export default function InovavPortal({
  initialScreen = 'intro',
  initialShowBodyScan = false,
  onBackToOverview,
  onNavigateView,
  activeAstronaut: propActiveAstronaut,
  onAstronautChange,
  onLogout,
  showARVisor = false,
  onCloseARVisor,
  showProfileSettings = false,
  onCloseProfileSettings,
}) {
  const [screen, setScreen] = useState(initialScreen); // 'intro' | 'astronaut' | 'login' | 'dashboard'
  const [loginMode, setLoginMode] = useState('signin'); // 'signin' | 'signup'
  const [countdown, setCountdown] = useState(8);
  const [activeTab, setActiveTab] = useState('home');
  const [showBodyScanModal, setShowBodyScanModal] = useState(initialShowBodyScan);
  const [showJarvisHud, setShowJarvisHud] = useState(false);
  const [showMissionHUD, setShowMissionHUD] = useState(false);

  useEffect(() => {
    if (initialScreen) {
      setScreen(initialScreen);
    }
  }, [initialScreen]);

  useEffect(() => {
    if (typeof initialShowBodyScan === 'boolean') {
      setShowBodyScanModal(initialShowBodyScan);
    }
  }, [initialShowBodyScan]);

  useEffect(() => {
    if (showARVisor) setShowJarvisHud(true);
  }, [showARVisor]);

  useEffect(() => {
    if (showProfileSettings) setShow3DFaceStudio(true);
  }, [showProfileSettings]);

  // Astronaut DB & Active User
  const [astronauts, setAstronauts] = useState(getStoredAstronauts);
  const [activeAstronaut, setActiveAstronaut] = useState(() => {
    if (propActiveAstronaut && propActiveAstronaut.id) return propActiveAstronaut;
    const list = getStoredAstronauts();
    return list[0] || DEFAULT_ASTRONAUT;
  });

  useEffect(() => {
    if (propActiveAstronaut && propActiveAstronaut.id) {
      setActiveAstronaut(propActiveAstronaut);
    }
  }, [propActiveAstronaut]);

  const [isAstroHovered, setIsAstroHovered] = useState(false);

  // Visor 3D interactive tilt & angle
  const [visorMouseX, setVisorMouseX] = useState(0);
  const [visorMouseY, setVisorMouseY] = useState(0);
  const [show3DFaceStudio, setShow3DFaceStudio] = useState(false);
  const [suitTelemetryView, setSuitTelemetryView] = useState('metrics'); // 'metrics' | 'auth-log'
  const [faceAuthLogs, setFaceAuthLogs] = useState(getFaceAuthLogs);
  const [telemetrySide, setTelemetrySide] = useState('left'); // 'left' = Suit Telemetry on the left, Astronaut with 3D Face on the right
  const [exerciseMinutes, setExerciseMinutes] = useState(135);
  const [aredVolume, setAredVolume] = useState(1840);
  const [sleepHours, setSleepHours] = useState(6.6);
  const [psychReadiness, setPsychReadiness] = useState(7.0);

  // Real-time Heart Rate Telemetry Buffer for Suit Telemetry Line Chart
  const [heartRateHistory, setHeartRateHistory] = useState(() => {
    const now = Date.now();
    return Array.from({ length: 24 }, (_, idx) => {
      const ts = new Date(now - (23 - idx) * 1000);
      const time = ts.toISOString().slice(11, 19);
      const wave = Math.sin(idx * 0.42) * 3.2 + Math.cos(idx * 0.21) * 1.6;
      const bpm = Math.round(73 + wave);
      return { time, bpm };
    });
  });

  const liveHeartRate = heartRateHistory[heartRateHistory.length - 1]?.bpm ?? 74;

  // Dynamic 3D model positioning for continuous planetary-style transition
  const astroPositionSide = useMemo(() => {
    if (screen === 'astronaut') return 'center';
    if (screen === 'login') return loginMode === 'signup' ? 'login-left' : 'login-right';
    return 'center';
  }, [screen, loginMode]);

  // Sync astronauts database with Google Cloud / Firebase Firestore
  useEffect(() => {
    getAstronautsFromFirebase().then((cloudList) => {
      if (cloudList && cloudList.length > 0) {
        setAstronauts(cloudList);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudList));
        if (cloudList[0]) setActiveAstronaut(cloudList[0]);
      }
    });
  }, []);

  // 8-second auto intro transition to welcome astronaut page
  useEffect(() => {
    if (screen !== 'intro') return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setScreen('astronaut');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [screen]);

  // Real-time 1 Hz heart rate telemetry stream while Suit Telemetry dashboard is active
  useEffect(() => {
    if (screen !== 'dashboard') return;
    let tick = 24;
    const hrInterval = setInterval(() => {
      tick += 1;
      const ts = new Date();
      const time = ts.toISOString().slice(11, 19);
      setHeartRateHistory((prev) => {
        const lastBpm = prev[prev.length - 1]?.bpm ?? 74;
        const drift = Math.sin(tick * 0.38) * 1.9 + Math.cos(tick * 0.19) * 1.1 + (Math.random() - 0.5) * 1.8;
        const nextBpm = Math.max(64, Math.min(86, Math.round(lastBpm * 0.55 + (74 + drift) * 0.45)));
        return [...prev.slice(-23), { time, bpm: nextBpm }];
      });
    }, 1000);
    return () => clearInterval(hrInterval);
  }, [screen]);

  const handleSaveFaceData = async (snaps) => {
    const mergedSnaps = {
      ...(activeAstronaut.faceSnaps || {}),
      ...snaps,
    };
    const faceDescriptors = await buildAstronautFaceDescriptors(mergedSnaps);
    const updatedAstro = {
      ...activeAstronaut,
      faceSnaps: mergedSnaps,
      faceDescriptors,
    };
    setActiveAstronaut(updatedAstro);
    const updatedList = saveAstronautToDb(updatedAstro);
    setAstronauts(updatedList);
    if (onAstronautChange) onAstronautChange(updatedAstro);
  };

  // Determine current active face snap (center, left, right) based on mouse hover across visor
  const currentVisorFaceSnap = useMemo(() => {
    const snaps = activeAstronaut.faceSnaps || {};
    if (visorMouseX < -0.2 && snaps.left) return snaps.left;
    if (visorMouseX > 0.2 && snaps.right) return snaps.right;
    return snaps.center || snaps.left || snaps.right || null;
  }, [visorMouseX, activeAstronaut]);

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', height: '100vh', background: '#f6eedb', color: '#06132b', overflow: 'hidden' }}>

      {/* Floating Back Navigation Bar */}
      {onBackToOverview && (
        <div style={{ position: 'fixed', top: '16px', left: '16px', zIndex: 99999, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={onBackToOverview}
            className="tech-btn"
            style={{
              padding: '8px 18px',
              fontSize: '0.72rem',
              letterSpacing: '0.14em',
              background: '#06132b',
              border: '1px solid rgba(6, 19, 43, 0.4)',
              color: '#f6eedb',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 24px rgba(6, 19, 43, 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>←</span>
            <span>RETURN TO OVERVIEW</span>
          </button>
        </div>
      )}

      {/* ── 1. STARTING SCREEN: RIDGE IN THE CENTER & 8S TIMEOUT ── */}
      {screen === 'intro' && (
        <div
          className="screen-fade"
          onClick={() => setScreen('astronaut')}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            cursor: 'pointer',
            backgroundColor: '#06132b',
          }}
          title="Click to proceed"
        >
          <Canvas camera={{ position: [0, 0, 100], fov: 60 }} style={{ position: 'absolute', inset: 0 }}>
            <HohmannParticleSwarm />
            <OrbitControls autoRotate={true} autoRotateSpeed={0.8} enableDamping={true} />
            <Effects disableGamma>
              <unrealBloomPass threshold={0.25} strength={0.5} radius={0.3} />
              <shaderPass
                args={[
                  {
                    uniforms: { tDiffuse: { value: null }, bgColor: { value: new THREE.Color('#06132b') } },
                    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
                    fragmentShader: `uniform sampler2D tDiffuse; uniform vec3 bgColor; varying vec2 vUv; void main() { vec4 texel = texture2D(tDiffuse, vUv); float alpha = clamp(max(texel.r, max(texel.g, texel.b)), 0.0, 1.0); gl_FragColor = vec4(texel.rgb + bgColor * (1.0 - alpha), 1.0); }`,
                  },
                ]}
              />
            </Effects>
          </Canvas>

          {/* RIDGE in the center & 8s timeout below it */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              userSelect: 'none',
              pointerEvents: 'none',
              width: '90%',
              maxWidth: '680px',
            }}
          >
            <h1
              className="font-tech"
              style={{
                margin: 0,
                fontSize: 'clamp(3.8rem, 10vw, 7.2rem)',
                fontWeight: 700,
                color: '#f6eedb',
                letterSpacing: '0.34em',
                textIndent: '0.34em',
                lineHeight: 1,
                textShadow: '0 0 50px rgba(246, 238, 219, 0.4), 0 0 100px rgba(56, 189, 248, 0.25)',
              }}
            >
              RIDGE
            </h1>

            {/* 8-second timeout indicator below RIDGE */}
            <div
              style={{
                marginTop: '36px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '240px',
                  height: '3px',
                  background: 'rgba(246, 238, 219, 0.15)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  boxShadow: '0 0 12px rgba(246, 238, 219, 0.2)',
                }}
              >
                <div
                  style={{
                    width: `${((8 - countdown) / 8) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #38bdf8, #f6eedb)',
                    transition: 'width 1s linear',
                    boxShadow: '0 0 10px #f6eedb',
                  }}
                />
              </div>
              <span
                className="font-mono"
                style={{
                  fontSize: '0.78rem',
                  color: '#ead9b2',
                  letterSpacing: '0.22em',
                  fontWeight: 600,
                  opacity: 0.85,
                }}
              >
                0{countdown}S
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── PERSISTENT 3D ASTRONAUT & PARTICLE SWARM SCENE (WELCOME & LOGIN SCREENS ONLY) ── */}
      {(screen === 'astronaut' || screen === 'login') && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1,
            pointerEvents: screen === 'astronaut' ? 'auto' : 'none',
          }}
        >
          <Canvas camera={{ position: [0, 0, 100], fov: 60 }} style={{ width: '100%', height: '100%' }}>
            <ambientLight intensity={0.95} />
            <directionalLight position={[15, 25, 30]} intensity={1.6} color="#f6eedb" />
            <directionalLight position={[-25, 10, 20]} intensity={1.0} color="#9fb8de" />
            <pointLight position={[0, 10, 30]} intensity={1.6} color="#ead9b2" distance={80} />
            <PetrovaParticleSwarm />
            <Suspense fallback={null}>
              <Astronaut
                onHover={setIsAstroHovered}
                isHovered={isAstroHovered}
                positionSide={astroPositionSide}
              />
            </Suspense>
            <OrbitControls autoRotate={false} enableDamping={true} enabled={false} />
            <Effects disableGamma>
              <unrealBloomPass threshold={0.85} strength={0.4} radius={0.2} />
              <shaderPass
                args={[
                  {
                    uniforms: { tDiffuse: { value: null }, bgColor: { value: new THREE.Color('#06132b') } },
                    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
                    fragmentShader: `uniform sampler2D tDiffuse; uniform vec3 bgColor; varying vec2 vUv; void main() { vec4 texel = texture2D(tDiffuse, vUv); float alpha = clamp(max(texel.r, max(texel.g, texel.b)), 0.0, 1.0); gl_FragColor = vec4(texel.rgb + bgColor * (1.0 - alpha), 1.0); }`,
                  },
                ]}
              />
            </Effects>
          </Canvas>
        </div>
      )}

      {/* ── 2. WELCOME PAGE: ANIMATED WELCOME + 3D ASTRONAUT + LOGIN BUTTON ── */}
      {screen === 'astronaut' && (
        <div className="screen-fade" style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
          {/* Animated Welcome Heading */}
          <div
            style={{
              position: 'absolute',
              top: '56px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            <h1
              className="welcome-title font-tech"
              style={{
                margin: 0,
                fontSize: 'clamp(2.8rem, 6vw, 4.8rem)',
                fontWeight: 600,
                color: '#06132b',
                textIndent: '0.34em',
                lineHeight: 1.05,
                textTransform: 'uppercase',
              }}
            >
              Welcome
            </h1>
          </div>

          {/* Single Login Button */}
          <div
            style={{
              position: 'absolute',
              bottom: '56px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setLoginMode('signin');
                setScreen('login');
              }}
              className="tech-btn font-mono"
              style={{
                padding: '16px 56px',
                fontSize: '0.9rem',
                fontWeight: 600,
                letterSpacing: '0.26em',
                background: '#f6eedb',
                color: '#06132b',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 0 25px rgba(246, 238, 219, 0.4)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 40px rgba(246, 238, 219, 0.6)';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 25px rgba(246, 238, 219, 0.4)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Initiate Login
            </button>
          </div>
        </div>
      )}

      {/* ── 3. MODERN SLIDING DUAL-PANEL LOGIN (EXACT MATCH TO login ui_files WITH CONTINUOUS 3D TRANSITION) ── */}
      {screen === 'login' && (
        <ModernSlidingLogin
          activeAstronaut={activeAstronaut}
          astronauts={astronauts}
          loginMode={loginMode}
          onToggleMode={(mode) => setLoginMode(mode)}
          onLoginSuccess={(astro) => {
            setActiveAstronaut(astro);
            if (onAstronautChange) onAstronautChange(astro);
            setFaceAuthLogs(getFaceAuthLogs());
            setScreen('dashboard');
          }}
          onSignupSuccess={(newAstro) => {
            saveAstronautToDb(newAstro);
            setAstronauts(getStoredAstronauts());
            setActiveAstronaut(newAstro);
            if (onAstronautChange) onAstronautChange(newAstro);
            setScreen('dashboard');
          }}
          onOpen3DFaceStudio={() => setShow3DFaceStudio(true)}
          onBackToIntro={() => setScreen('astronaut')}
        />
      )}

      {/* ── 4. MAIN ASTRONAUT DASHBOARD (FRAMELESS AESTHETIC & RIGHT SIDEBAR) ── */}
      {screen === 'dashboard' && (
        <div
          id="suit-and-vitals-container"
          className="screen-fade custom-scroll"
          style={{
            position: 'relative',
            width: '100%',
            height: '100vh',
            minHeight: '100vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            backgroundColor: '#f6eedb',
            scrollBehavior: 'smooth',
          }}
        >
          {/* ── CLEAN OAT IVORY SPACE BACKGROUND WITH SUBTLE INK GRID ── */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 0,
              backgroundImage: 'radial-gradient(circle at 65% 45%, rgba(246, 238, 219, 0.96) 0%, rgba(238, 226, 202, 0.98) 85%)',
              pointerEvents: 'none',
            }}
          />

          {/* ── SECTION 1: SUIT TELEMETRY & ASTRONAUT 3D FACE VISOR (ALIGNED ON THE EXACT SAME LEVEL) ── */}
          <div
            className="w-full grid grid-cols-1 lg:grid-cols-2 items-start"
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '100vh',
              zIndex: 10,
            }}
          >
            {/* ── ASTRONAUT SIDE: /astro.jpg HELMET + 3D SPHERE FACE MESH OVER BLACK VISOR ── */}
            <div
              className={`w-full flex flex-col items-center justify-start ${
                telemetrySide === 'left' ? 'order-2 lg:order-2' : 'order-1 lg:order-1'
              }`}
              style={{
                position: 'relative',
                padding: '36px 24px 40px 24px',
                overflow: 'visible',
                pointerEvents: 'auto',
                zIndex: 20,
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
                const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
                setVisorMouseX(normX);
                setVisorMouseY(normY);
              }}
              onMouseLeave={() => {
                setVisorMouseX(0);
                setVisorMouseY(0);
              }}
            >
              {/* Astronaut Status & HUD Callsign Pill */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '560px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                  minHeight: '38px',
                  padding: '8px 14px',
                  background: 'rgba(10, 28, 63, 0.76)',
                  border: '1px solid rgba(246, 238, 219, 0.22)',
                  borderRadius: '10px',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                  <div>
                    <div className="font-mono" style={{ fontSize: '0.74rem', color: '#f6eedb', fontWeight: 700, letterSpacing: '0.08em' }}>
                      {activeAstronaut.name || 'CDR. Alex Mercer'} • <span style={{ color: '#ead9b2' }}>{activeAstronaut.role || 'Commander'}</span>
                    </div>
                    <div className="font-mono" style={{ fontSize: '0.62rem', color: '#9fb6da' }}>
                      {activeAstronaut.mission || 'EXPEDITION 72'} // USER 3D FACE ACTIVE
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setShow3DFaceStudio(true)}
                    style={{
                      background: 'rgba(246, 238, 219, 0.12)',
                      border: '1px solid rgba(246, 238, 219, 0.3)',
                      color: '#f6eedb',
                      fontSize: '0.68rem',
                      fontFamily: 'monospace',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    title="Open 3D Face Studio & Enrollment"
                  >
                    👤 3D Face Studio
                  </button>
                  <button
                    type="button"
                    onClick={() => setTelemetrySide((prev) => (prev === 'left' ? 'right' : 'left'))}
                    style={{
                      background: 'rgba(246, 238, 219, 0.14)',
                      border: '1px solid rgba(246, 238, 219, 0.35)',
                      color: '#ead9b2',
                      fontSize: '0.68rem',
                      fontFamily: 'monospace',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    title="Switch sides between Suit Telemetry and Astronaut Visor"
                  >
                    ⇄ {telemetrySide === 'left' ? 'Astronaut Left' : 'Telemetry Left'}
                  </button>
                </div>
              </div>

              {/* Locked 3:2 stage matching astro.jpg (1080x720) so visor mesh aligns accurately at any resolution */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '560px',
                  aspectRatio: '3 / 2',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
                }}
              >
                <img
                  src="/astro.jpg"
                  alt="RIDGE Suit Helmet Visor"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                />

                {/* Radial fade blending astro.jpg outer dark field into Ink Blue (#06132b) canvas */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'radial-gradient(ellipse at 51% 48%, rgba(6,19,43,0) 44%, rgba(6,19,43,0.72) 78%, rgba(6,19,43,1) 100%)',
                    pointerEvents: 'none',
                    zIndex: 2,
                  }}
                />

                {/* 3D Face Sphere Mesh nested cleanly inside the black helmet visor region */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '36.2%',
                    width: '25.5%',
                    aspectRatio: '1.09 / 1',
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '48% 48% 46% 46%',
                    overflow: 'hidden',
                    background:
                      'radial-gradient(circle at 50% 48%, rgba(10, 28, 63, 0.88) 0%, rgba(6, 19, 43, 0.96) 85%, rgba(4, 12, 28, 0.99) 100%)',
                    boxShadow:
                      'inset 0 0 24px rgba(4, 12, 28, 0.95), inset 0 0 14px rgba(246, 238, 219, 0.2)',
                    zIndex: 5,
                  }}
                >
                  <ThreeDFaceMesh
                    faceSnaps={activeAstronaut.faceSnaps}
                    faceTextureUrl={currentVisorFaceSnap}
                    mouseX={visorMouseX}
                    mouseY={visorMouseY}
                    mode="textured"
                    style={{ position: 'absolute', inset: 0 }}
                  />

                  {/* Subtle glass helmet curvature specular sheen */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '48% 48% 46% 46%',
                      pointerEvents: 'none',
                      background:
                        'linear-gradient(132deg, rgba(246,238,219,0.16) 0%, rgba(246,238,219,0.03) 34%, transparent 56%, rgba(234,217,178,0.1) 100%)',
                      boxShadow: 'inset 0 0 18px rgba(4, 12, 28, 0.88)',
                    }}
                  />
                </div>
              </div>

              {/* Visor Angle Quick Selector & Telemetry Sub-Status */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '560px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '14px',
                  padding: '8px 14px',
                  background: 'rgba(10, 28, 63, 0.65)',
                  border: '1px solid rgba(246, 238, 219, 0.16)',
                  borderRadius: '10px',
                  backdropFilter: 'blur(10px)',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="font-mono" style={{ fontSize: '0.65rem', color: '#9fb6da' }}>VISOR ANGLE:</span>
                  {['left', 'center', 'right'].map((ang) => (
                    <button
                      key={ang}
                      type="button"
                      onClick={() => {
                        if (ang === 'left') setVisorMouseX(-0.5);
                        else if (ang === 'right') setVisorMouseX(0.5);
                        else setVisorMouseX(0);
                      }}
                      style={{
                        background: (ang === 'left' && visorMouseX < -0.2) || (ang === 'right' && visorMouseX > 0.2) || (ang === 'center' && Math.abs(visorMouseX) <= 0.2)
                          ? 'rgba(246, 238, 219, 0.25)'
                          : 'rgba(246, 238, 219, 0.08)',
                        border: '1px solid rgba(246, 238, 219, 0.25)',
                        color: '#f6eedb',
                        fontSize: '0.65rem',
                        fontFamily: 'monospace',
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      {ang}
                    </button>
                  ))}
                </div>

                <div className="font-mono" style={{ fontSize: '0.68rem', color: '#9fb6da' }}>
                  RETICLE: <strong style={{ color: '#f6eedb' }}>ACTIVE 30°</strong> • O₂ CONSUMPTION: <strong style={{ color: '#10b981' }}>0.38 L/min</strong>
                </div>
              </div>
            </div>

            {/* ── SUIT TELEMETRY VIEWPORT (ON THE EXACT SAME LEVEL BESIDE ASTRONAUT) ── */}
            <main
              className={`custom-scroll w-full ${
                telemetrySide === 'left' ? 'order-1 lg:order-1' : 'order-2 lg:order-2'
              }`}
              style={{
                position: 'relative',
                padding: '36px 24px 40px 24px',
                zIndex: 25,
              }}
            >
            {/* TAB 1: HOME // SUIT TELEMETRY */}
            {activeTab === 'home' && (
              <div style={{ maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto' }}>
                {/* RIDGE Brand & Suit Telemetry Sub-View Switcher */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginBottom: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06132b', boxShadow: '0 0 10px #1e3a8a' }} />
                    <span className="font-mono" style={{ fontSize: '0.72rem', color: '#06132b', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700 }}>
                      RIDGE // ALL SYSTEMS NOMINAL
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div
                      role="tablist"
                      aria-label="Suit telemetry views"
                      style={{
                        display: 'inline-flex',
                        gap: '4px',
                        padding: '3px',
                        background: 'rgba(10, 28, 63, 0.72)',
                        border: '1px solid rgba(246, 238, 219, 0.2)',
                        borderRadius: '6px',
                      }}
                    >
                      <button
                        type="button"
                        role="tab"
                        aria-selected={suitTelemetryView === 'metrics'}
                        onClick={() => setSuitTelemetryView('metrics')}
                        className="font-mono"
                        style={{
                          padding: '5px 11px',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.66rem',
                          letterSpacing: '0.12em',
                          fontWeight: suitTelemetryView === 'metrics' ? 700 : 500,
                          background: suitTelemetryView === 'metrics' ? '#f6eedb' : 'transparent',
                          color: suitTelemetryView === 'metrics' ? '#06132b' : '#9fb6da',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        TELEMETRY
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={suitTelemetryView === 'auth-log'}
                        onClick={() => {
                          setFaceAuthLogs(getFaceAuthLogs());
                          setSuitTelemetryView('auth-log');
                        }}
                        className="font-mono"
                        style={{
                          padding: '5px 11px',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.66rem',
                          letterSpacing: '0.12em',
                          fontWeight: suitTelemetryView === 'auth-log' ? 700 : 500,
                          background: suitTelemetryView === 'auth-log' ? '#f6eedb' : 'transparent',
                          color: suitTelemetryView === 'auth-log' ? '#06132b' : '#9fb6da',
                          transition: 'all 0.15s ease',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>FACE AUTH LOG</span>
                        <span
                          style={{
                            padding: '1px 5px',
                            borderRadius: '3px',
                            fontSize: '0.62rem',
                            background: suitTelemetryView === 'auth-log' ? 'rgba(6, 19, 43, 0.16)' : 'rgba(246, 238, 219, 0.16)',
                            color: suitTelemetryView === 'auth-log' ? '#06132b' : '#f6eedb',
                          }}
                        >
                          {faceAuthLogs.length}
                        </span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setTelemetrySide((prev) => (prev === 'left' ? 'right' : 'left'))}
                      style={{
                        background: '#06132b',
                        border: '1px solid rgba(6, 19, 43, 0.3)',
                        color: '#f6eedb',
                        fontSize: '0.66rem',
                        fontFamily: 'monospace',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      title="Switch side: Telemetry on left or right of astronaut with 3D face"
                    >
                      ⇄ {telemetrySide === 'left' ? 'Astronaut Left' : 'Telemetry Left'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigateView) onNavigateView('astri');
                        else setActiveTab('astri');
                      }}
                      style={{
                        background: '#06132b',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        color: '#38bdf8',
                        fontSize: '0.66rem',
                        fontFamily: 'monospace',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        boxShadow: '0 2px 10px rgba(6, 19, 43, 0.25)',
                        transition: 'all 0.15s ease',
                      }}
                      title="Launch ASTRI Gemini AI Chatbot with 3D Astronaut"
                    >
                      <span>✨</span>
                      <span>ASTRI AI</span>
                    </button>
                  </div>
                </div>

                {/* Main Heading */}
                <h1
                  style={{
                    fontSize: '2.8rem',
                    fontWeight: 600,
                    color: '#06132b',
                    margin: '0 0 6px 0',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                  }}
                >
                  {suitTelemetryView === 'auth-log' ? 'Face auth log' : 'Suit telemetry'}
                </h1>
                <div className="font-mono" style={{ fontSize: '0.76rem', color: '#1e3a8a', marginBottom: '30px', letterSpacing: '0.08em', fontWeight: 600 }}>
                  {suitTelemetryView === 'auth-log'
                    ? 'EVA-04 / Biometric facial verification audit trail'
                    : 'EVA-04 / Live link established • 0.8 s latency'}
                </div>

                {suitTelemetryView === 'auth-log' ? (
                  <FaceAuthLogView
                    logs={faceAuthLogs}
                    onClearLogs={() => setFaceAuthLogs(clearFaceAuthLogs())}
                    onOpenFaceStudio={() => setShow3DFaceStudio(true)}
                  />
                ) : (
                  <>
                    {/* ── 1. EVA SUIT PRIMARY SYSTEMS & PRESSURE SEAL (SUIT KPIS: O2, PRESSURE, BATTERY) ── */}
                    <div className="bg-[#0B1736]/70 border border-blue-400/15 rounded-xl p-4 mb-4">
                      <div className="font-mono text-[11px] text-[#ead9b2] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>EVA Suit Primary Systems & Pressure Seal</span>
                      </div>
                      <div className="flex flex-col gap-3.5">
                        {/* Oxygen */}
                        <div>
                          <div className="flex justify-between items-baseline text-xs font-mono">
                            <span className="text-slate-400">OXYGEN RESERVE</span>
                            <span className="text-sm font-bold text-[#f6eedb]">99.4%</span>
                          </div>
                          <div className="hairline-bar-track mt-1">
                            <div className="hairline-bar-fill" style={{ width: '99.4%' }} />
                          </div>
                        </div>
                        {/* Suit Pressure */}
                        <div>
                          <div className="flex justify-between items-baseline text-xs font-mono">
                            <span className="text-slate-400">SUIT PRESSURE (INTERNAL)</span>
                            <span className="text-sm font-bold text-[#f6eedb]">4.3 <span className="text-slate-400 text-xs">psi</span></span>
                          </div>
                          <div className="hairline-bar-track mt-1">
                            <div className="hairline-bar-fill" style={{ width: '86%' }} />
                          </div>
                        </div>
                        {/* Battery */}
                        <div>
                          <div className="flex justify-between items-baseline text-xs font-mono">
                            <span className="text-slate-400">BATTERY CAPACITY</span>
                            <span className="text-sm font-bold text-[#f6eedb]">87%</span>
                          </div>
                          <div className="hairline-bar-track mt-1">
                            <div className="hairline-bar-fill" style={{ width: '87%' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── 2. CREW WELLBEING GAUGES (OAT YELLOW METRICS) ── */}
                    <div className="bg-[#0B1736]/95 border border-amber-400/25 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col space-y-4 mb-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                            Crew Wellbeing Gauges
                          </h2>
                          <span className="text-[10px] font-mono text-[#FDE047] font-semibold">
                            OAT YELLOW METRICS
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Restorative sleep, countermeasure exercise & cognitive readiness.
                        </p>
                      </div>

                      {/* 3 Semi-Circular Gauges: Sleep, Exercise, and Mood */}
                      <div className="flex flex-col gap-3.5">
                        {/* 1. Daily Restorative Sleep */}
                        <SemiCircularGauge
                          label="DAILY RESTORATIVE SLEEP"
                          value={sleepHours}
                          max={10}
                          unit="h"
                          targetText="Target: 8.0h Rest Baseline"
                          colorHex="#F5B82E"
                          cardClassName="bg-[#0B152C]/90 border border-slate-700/40 rounded-xl p-4 sm:p-5"
                        />

                        {/* 2. Daily Exercise Countermeasure */}
                        <SemiCircularGauge
                          label="DAILY EXERCISE COUNTERMEASURE"
                          value={exerciseMinutes}
                          max={150}
                          unit="min"
                          targetText="• Target: 150m ARED / T2 Baseline"
                          colorHex="#FACC15"
                          showGlowDot={true}
                          subtitle={`${Math.round((exerciseMinutes / 150) * 100)}% of Daily Target`}
                          headerAction={
                            <button
                              type="button"
                              onClick={() => {
                                setExerciseMinutes((prev) => Math.min(150, prev + 15));
                                setAredVolume((prev) => prev + 120);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-[#FACC15]/10 hover:bg-[#FACC15]/20 text-[#FACC15] border border-[#FACC15]/35 transition-all cursor-pointer active:scale-95 shadow-sm"
                              title="Log +15 min Countermeasure Exercise"
                            >
                              <Plus className="w-3 h-3" />
                              <span>+ Log Session</span>
                            </button>
                          }
                          cardClassName="bg-[#0B152C]/90 border border-slate-700/40 rounded-xl p-4 sm:p-5 hover:border-[#FACC15]/50 transition-all"
                          footerContent={
                            <div className="flex items-center gap-2 mt-2 w-full justify-center flex-wrap pt-2 border-t border-slate-800/60">
                              <div className="px-2.5 py-1 rounded-lg bg-[#060F28] border border-blue-400/20 font-mono text-[10px] text-slate-300 flex items-center gap-1.5 shadow-sm">
                                <Dumbbell className="w-3 h-3 text-[#FACC15]" />
                                <span className="text-slate-400">ARED LOAD:</span>
                                <span className="font-bold text-[#FFFDF7]">
                                  {aredVolume.toLocaleString()} kg
                                </span>
                              </div>
                              <div className="px-2.5 py-1 rounded-lg bg-[#060F28] border border-blue-400/20 font-mono text-[10px] text-slate-300 flex items-center gap-1.5 shadow-sm">
                                <Activity className="w-3 h-3 text-cyan-400" />
                                <span className="text-slate-400">T2 / CEVIS:</span>
                                <span className="font-bold text-[#FFFDF7]">
                                  45 min • 138 bpm
                                </span>
                              </div>
                            </div>
                          }
                        />

                        {/* 3. Psychological Readiness Index */}
                        <SemiCircularGauge
                          label="PSYCHOLOGICAL READINESS INDEX"
                          value={psychReadiness}
                          max={10}
                          unit="/10"
                          targetText="Behavioral Stability Normal"
                          colorHex="#FDE047"
                          cardClassName="bg-[#0B152C]/90 border border-slate-700/40 rounded-xl p-4 sm:p-5"
                        />
                      </div>
                    </div>

                    {/* ── 3. 4 REAL-TIME VITALS CARDS (SPACE TELEMETRY OBSIDIAN THEME MATCHING REFERENCE) ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {/* Card 1: Heart Rate */}
                      <div className="bg-[#0B1736]/90 border border-blue-400/20 rounded-xl p-3.5 shadow-lg shadow-black/30 hover:border-blue-400/50 transition-all">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                            Heart Rate (HR)
                          </span>
                          <Heart className="w-3.5 h-3.5 text-rose-400" />
                        </div>
                        <div className="flex items-baseline justify-between mt-1.5">
                          <h3 className="text-2xl font-black text-cyan-300 font-sans tracking-tight">
                            {liveHeartRate || 62}
                          </h3>
                          <span className="text-[11px] font-mono text-slate-400 font-bold">BPM</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px]">
                          <span className="text-emerald-400 font-mono flex items-center gap-1 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span>Resting Pace</span>
                          </span>
                          <span className="text-slate-400 font-mono text-[9px]">Baseline: 64 BPM</span>
                        </div>
                      </div>

                      {/* Card 2: Blood Pressure */}
                      <div className="bg-[#0B1736]/90 border border-blue-400/20 rounded-xl p-3.5 shadow-lg shadow-black/30 hover:border-yellow-400/40 transition-all">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                            Blood Pressure
                          </span>
                          <Activity className="w-3.5 h-3.5 text-[#FDE047]" />
                        </div>
                        <div className="flex items-baseline justify-between mt-1.5">
                          <h3 className="text-2xl font-black text-[#FDE047] font-sans tracking-tight">
                            112/71
                          </h3>
                          <span className="text-[11px] font-mono text-slate-400 font-bold">mmHg</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px]">
                          <span className="text-cyan-300 font-mono font-semibold">Microgravity Reg.</span>
                          <span className="text-slate-400 font-mono text-[9px]">Sys/Dia</span>
                        </div>
                      </div>

                      {/* Card 3: Core Temperature */}
                      <div className="bg-[#0B1736]/90 border border-blue-400/20 rounded-xl p-3.5 shadow-lg shadow-black/30 hover:border-yellow-400/40 transition-all">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                            Core Temperature
                          </span>
                          <Thermometer className="w-3.5 h-3.5 text-[#FDE047]" />
                        </div>
                        <div className="flex items-baseline justify-between mt-1.5">
                          <h3 className="text-2xl font-black text-[#FDE047] font-sans tracking-tight">
                            36.8
                          </h3>
                          <span className="text-[11px] font-mono text-slate-400 font-bold">°C</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px]">
                          <span className="text-emerald-400 font-mono font-semibold">Thermoregulated</span>
                          <span className="text-slate-400 font-mono text-[9px]">Optimal 36.6°C</span>
                        </div>
                      </div>

                      {/* Card 4: Blood Oxygen (SpO2) */}
                      <div className="bg-[#0B1736]/90 border border-blue-400/20 rounded-xl p-3.5 shadow-lg shadow-black/30 hover:border-emerald-400/40 transition-all">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                            Blood Oxygen (SpO2)
                          </span>
                          <Wind className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div className="flex items-baseline justify-between mt-1.5">
                          <h3 className="text-2xl font-black text-emerald-400 font-sans tracking-tight">
                            98%
                          </h3>
                          <span className="text-[11px] font-mono text-slate-400 font-bold">O₂ Sat</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px]">
                          <span className="text-emerald-400 font-mono font-semibold">Cabin Norm: 21.0 kPa</span>
                          <span className="text-slate-400 font-mono text-[9px]">Nominal</span>
                        </div>
                      </div>
                    </div>

                    {/* Real-time Heart Rate Trend Line Chart (Recharts) */}
                    <HeartRateTelemetryChart data={heartRateHistory} currentBpm={liveHeartRate} />

                    {/* Primary CTA Button: Smooth scroll downwards to Monitor Health & Organ Scan */}
                    <button
                      type="button"
                      id="scan-vital-btn"
                      onClick={() => {
                        const target = document.getElementById('monitor-health-section');
                        if (target) {
                          target.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          setShowBodyScanModal(true);
                        }
                      }}
                      style={{
                        position: 'relative',
                        zIndex: 30,
                        width: '100%',
                        padding: '16px 24px',
                        marginTop: '24px',
                        marginBottom: '24px',
                        background: '#06132b',
                        color: '#f6eedb',
                        border: '1px solid rgba(6, 19, 43, 0.4)',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        boxShadow: '0 4px 25px rgba(6, 19, 43, 0.25)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#0e2454';
                        e.currentTarget.style.boxShadow = '0 6px 30px rgba(6, 19, 43, 0.35)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#06132b';
                        e.currentTarget.style.boxShadow = '0 4px 25px rgba(6, 19, 43, 0.25)';
                      }}
                    >
                      <span>INSPECT ORGANS & SCAN HEALTH ↓</span>
                      <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>↓</span>
                    </button>

                    {/* Mission Status Summary (Clean Unboxed Editorial Typography) */}
                    <div style={{ borderTop: '1px solid rgba(6, 19, 43, 0.15)', paddingTop: '20px' }}>
                      <div className="font-mono" style={{ fontSize: '0.72rem', color: '#1e3a8a', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>
                        CURRENT FLIGHT MISSION STATUS: {activeAstronaut.mission}
                      </div>
                      <p style={{ fontSize: '0.84rem', color: '#1e3a8a', lineHeight: 1.6, margin: 0 }}>
                        Active crew member <strong style={{ color: '#06132b' }}>{activeAstronaut.name}</strong> is currently designated as <strong style={{ color: '#06132b' }}>{activeAstronaut.role}</strong>. Suit biometric telemetry channels 01–16 are transmitting in real-time. All zero-g autonomic reflexes, cardiac outputs, and metabolic oxygen consumption rates match baseline mission parameters.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB 2: PROJECTS / ASTRONAUT TO-DO LIST */}
            {activeTab === 'projects' && (
              <div style={{ maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto' }}>
                <div className="font-mono" style={{ fontSize: '0.72rem', color: '#1e3a8a', letterSpacing: '0.22em', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 700 }}>
                  RIDGE // ASTRONAUT DAILY MISSION ROADMAP
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 600, color: '#06132b', margin: '0 0 20px 0' }}>Daily Flight To-Do List</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    { time: '06:00 – 06:10 AM', title: 'Urine Test', status: 'Immediate Target', progress: 'Ready', desc: 'Collect midstream bio-specimen in UPA diagnostic pouch; record electrolyte osmolarity and specific gravity.', color: '#0284c7' },
                    { time: '06:10 – 06:40 AM', title: 'Blood Test Planner', status: 'Next Up', progress: 'Calibrated', desc: 'i-STAT clinical cartridge run for venous pH, lactate, and hematocrit metabolic panel baseline.', color: '#2563eb' },
                    { time: '06:40 – 07:00 AM', title: 'Plan Your Breakfast', status: 'Scheduled', progress: 'Galley', desc: 'Rehydrate lyophilized oat meal pack with 250 mL hot water; log vitamin D3 & calcium supplements.', color: '#1e3a8a' },
                    { time: '07:00 – 08:30 AM', title: 'Physical Exercise (Morning)', status: 'Active Circuit', progress: 'ARED Load', desc: '1200 kg musculoskeletal squat & deadlift resistance protocol; telemetry heart rate tracking.', color: '#b91c1c' },
                    { time: '12:00 – 13:00', title: 'Plan Your Lunch', status: 'Scheduled', progress: 'Mid-Day', desc: 'Nutritional rebalancing in Unity module; vacuum-sealed entrée & 500 mL mineral hydration pack.', color: '#1e3a8a' },
                    { time: '13:30 – 15:30', title: 'Wet Clean (Station Maintenance)', status: 'Scheduled', progress: 'Sanitation', desc: 'Antimicrobial wipe-down of Columbus & Destiny handrails; vacuum return air grill mesh filters.', color: '#0284c7' },
                    { time: '16:15 – 18:15', title: 'Afternoon Exercise', status: 'Countermeasure', progress: 'T2 / CEVIS', desc: '45-minute T2 Colbert treadmill run + 30-minute CEVIS ergometer cool-down @ 135 BPM.', color: '#b45309' },
                    { time: '18:45 – 19:36 PM', title: 'ODF Medical Support Analysis', status: 'Medical Sync', progress: 'Houston Link', desc: 'Operations Data File Checklist 4.2 review with Flight Surgeon; transmit bio-telemetry audit packet.', color: '#b91c1c' },
                    { time: '19:45 – 20:30', title: 'Dinner & Crew Debrief', status: 'Evening', progress: 'Reflection', desc: 'Hot meal reconstitution, daily behavioral wellness score logging, and Day +1 manifest review.', color: '#06132b' },
                  ].map((p, i) => (
                    <div key={i} style={{ borderBottom: '1px solid rgba(6, 19, 43, 0.12)', paddingBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span className="font-mono" style={{ fontSize: '0.72rem', color: p.color, letterSpacing: '0.12em', fontWeight: 600 }}>{p.time} // {p.status}</span>
                        <span className="font-mono" style={{ fontSize: '0.72rem', color: '#1e3a8a', fontWeight: 600 }}>{p.progress}</span>
                      </div>
                      <h3 style={{ fontSize: '1rem', color: '#06132b', margin: '0 0 4px 0', fontWeight: 600 }}>{p.title}</h3>
                      <p style={{ fontSize: '0.8rem', color: '#1e3a8a', lineHeight: 1.45, margin: 0 }}>{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: MESSAGES */}
            {activeTab === 'messages' && (
              <div style={{ maxWidth: '620px', marginLeft: 'auto', marginRight: 'auto' }}>
                <div className="font-mono" style={{ fontSize: '0.72rem', color: '#1e3a8a', letterSpacing: '0.22em', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 700 }}>
                  RIDGE // ORBITAL RELAYS
                </div>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 600, color: '#06132b', margin: '0 0 20px 0' }}>Comms & Transmissions</h2>

                {/* ASTRI AI Chatbot Quick Access Card */}
                <div
                  style={{
                    background: '#06132b',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    marginBottom: '24px',
                    boxShadow: '0 8px 24px rgba(6, 19, 43, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #00e5ff, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem', boxShadow: '0 0 15px rgba(0, 229, 255, 0.4)' }}>
                      ✨
                    </div>
                    <div>
                      <div className="font-mono" style={{ fontSize: '0.68rem', color: '#38bdf8', letterSpacing: '0.14em', fontWeight: 700 }}>
                        ONBOARD AI FLIGHT COMPANION // GEMINI N4
                      </div>
                      <div style={{ fontSize: '0.98rem', fontWeight: 600, color: '#f6eedb', marginTop: '2px' }}>
                        Chat with ASTRI & 3D Astronaut
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateView) onNavigateView('astri');
                      else setActiveTab('astri');
                    }}
                    style={{
                      background: '#38bdf8',
                      color: '#06132b',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '9px 16px',
                      fontWeight: 700,
                      fontSize: '0.74rem',
                      letterSpacing: '0.1em',
                      cursor: 'pointer',
                      boxShadow: '0 3px 12px rgba(56, 189, 248, 0.35)',
                      textTransform: 'uppercase',
                    }}
                  >
                    LAUNCH ASTRI AI →
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {[
                    { sender: 'HOUSTON FLIGHT DYNAMICS (CAPCOM)', time: '02:14 UTC', unread: true, subject: 'Telemetry verification confirmed on all 16 biometric channels.', body: 'Alex, telemetry locks look pristine from Johnson Space Center. Solar radiation levels remain below threshold. Next orbital burn scheduled at T+14:20:00.' },
                    { sender: 'CREW MEDICAL OFFICER (DR. S. CHEN)', time: '01:45 UTC', unread: true, subject: '3D Full Body Scan sync complete.', body: 'Your latest zero-gravity cardiovascular adaptation readings show 0.02% bone mass change, well within optimal tolerances. Continue daily 45-minute resistance workout protocol.' },
                    { sender: 'STARLINK DEEP-SPACE RELAY NODE 09', time: '00:12 UTC', unread: true, subject: 'Laser optical link synchronized.', body: 'Continuous 1.2 Gbps downlink established via Lunar Orbital Gateway optical terminal. High-bandwidth HD video feed ready for EVA mission sequence.' },
                  ].map((m, i) => (
                    <div key={i} style={{ borderBottom: '1px solid rgba(6, 19, 43, 0.12)', paddingBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span className="font-mono" style={{ fontSize: '0.75rem', color: '#06132b', fontWeight: 700 }}>{m.sender}</span>
                        <span className="font-mono" style={{ fontSize: '0.7rem', color: '#1e3a8a' }}>{m.time}</span>
                      </div>
                      <div style={{ fontSize: '0.95rem', color: '#06132b', fontWeight: 600, marginBottom: '6px' }}>{m.subject}</div>
                      <div style={{ fontSize: '0.82rem', color: '#1e3a8a', lineHeight: 1.5 }}>{m.body}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: CALENDAR / DAILY SCHEDULE */}
            {activeTab === 'calendar' && (
              <div style={{ maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto' }}>
                <div className="font-mono" style={{ fontSize: '0.72rem', color: '#1e3a8a', letterSpacing: '0.22em', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 700 }}>
                  INOVA // ASTRONAUT CHRONO SCHEDULE
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 600, color: '#06132b', margin: '0 0 20px 0' }}>Daily Mission Schedule</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    { date: 'TODAY // 06:00 – 06:10 AM', event: 'Urine Test', type: 'Biomarkers & Electrolytes', status: 'Immediate' },
                    { date: 'TODAY // 06:10 – 06:40 AM', event: 'Blood Test Planner', type: 'i-STAT Metabolic Panel', status: 'Scheduled' },
                    { date: 'TODAY // 06:40 – 07:00 AM', event: 'Plan Your Breakfast', type: 'Nutrition Reconstitution', status: 'Scheduled' },
                    { date: 'TODAY // 07:00 – 08:30 AM', event: 'Physical Exercise (Morning)', type: 'ARED Resistance Training', status: 'Scheduled' },
                    { date: 'TODAY // 12:00 – 13:00 PM', event: 'Plan Your Lunch', type: 'Mid-Day Nutrition & Hydration', status: 'Scheduled' },
                    { date: 'TODAY // 13:30 – 15:30 PM', event: 'Wet Clean Station Maintenance', type: 'Habitat Sanitation & HEPA', status: 'Scheduled' },
                    { date: 'TODAY // 16:15 – 18:15 PM', event: 'Afternoon Countermeasure Exercise', type: 'T2 Treadmill & CEVIS Cardio', status: 'Scheduled' },
                    { date: 'TODAY // 18:45 – 19:36 PM', event: 'ODF Medical Support Analysis', type: 'Operations Data File Review', status: 'Scheduled' },
                    { date: 'TODAY // 19:45 – 20:30 PM', event: 'Dinner & Behavioral Journaling', type: 'Crew Debrief & Sleep Prep', status: 'Scheduled' },
                  ].map((c, i) => (
                    <div key={i} style={{ borderBottom: '1px solid rgba(6, 19, 43, 0.12)', paddingBottom: '12px' }}>
                      <div className="font-mono" style={{ fontSize: '0.72rem', color: '#1e3a8a', marginBottom: '3px', fontWeight: 600 }}>{c.date}</div>
                      <h4 style={{ fontSize: '1rem', color: '#06132b', margin: '0 0 3px 0', fontWeight: 600 }}>{c.event}</h4>
                      <div className="font-mono" style={{ fontSize: '0.72rem', color: '#1e3a8a' }}>{c.type} // <span style={{ color: '#06132b', fontWeight: 700 }}>{c.status}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: ARCHIVE */}
            {activeTab === 'archive' && (
              <div style={{ maxWidth: '620px', marginLeft: 'auto', marginRight: 'auto' }}>
                <div className="font-mono" style={{ fontSize: '0.72rem', color: '#1e3a8a', letterSpacing: '0.22em', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 700 }}>
                  RIDGE // STORAGE
                </div>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 600, color: '#06132b', margin: '0 0 24px 0' }}>Blackbox & Biometric Archives</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    { id: 'LOG-78901', title: 'Suit Biometric Calibration #14', size: '24.5 MB', date: '2026-11-12' },
                    { id: 'LOG-78899', title: 'Zero-G Autonomic Reflex Waveforms', size: '112.8 MB', date: '2026-11-11' },
                    { id: 'LOG-78850', title: 'Orbital Insertion Blackbox Telemetry', size: '1.4 GB', date: '2026-11-10' },
                  ].map((a, i) => (
                    <div key={i} style={{ borderBottom: '1px solid rgba(6, 19, 43, 0.12)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span className="font-mono" style={{ fontSize: '0.72rem', color: '#1e3a8a', fontWeight: 600 }}>{a.id}</span>
                        <div style={{ fontSize: '0.95rem', color: '#06132b', fontWeight: 600 }}>{a.title}</div>
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.74rem', color: '#1e3a8a' }}>
                        {a.size} • {a.date}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: ANALYTICS */}
            {activeTab === 'analytics' && (
              <div style={{ maxWidth: '620px', marginLeft: 'auto', marginRight: 'auto' }}>
                <div className="font-mono" style={{ fontSize: '0.72rem', color: '#1e3a8a', letterSpacing: '0.22em', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 700 }}>
                  RIDGE // DIAGNOSTICS
                </div>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 600, color: '#06132b', margin: '0 0 24px 0' }}>Sensor Telemetry Trends</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  <div>
                    <div className="font-mono" style={{ fontSize: '0.75rem', color: '#06132b', marginBottom: '14px', letterSpacing: '0.12em', fontWeight: 700 }}>CARDIOVASCULAR VARIABILITY TRENDS</div>
                    <div style={{ height: '120px', display: 'flex', alignItems: 'flex-end', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid rgba(6, 19, 43, 0.15)' }}>
                      {[65, 72, 70, 74, 76, 74, 78, 74, 72, 74].map((h, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '100%', height: `${h * 1.3}px`, background: 'linear-gradient(180deg, #1e3a8a, #06132b)', borderRadius: '2px' }} />
                          <span className="font-mono" style={{ fontSize: '0.6rem', color: '#1e3a8a', fontWeight: 600 }}>T-{10 - i}</span>
                        </div>
                      ))}
                    </div>
                    <div className="font-mono" style={{ fontSize: '0.72rem', color: '#1e3a8a', marginTop: '8px' }}>Average: 73.9 BPM // Sinus rhythm stable</div>
                  </div>

                  <div>
                    <div className="font-mono" style={{ fontSize: '0.75rem', color: '#06132b', marginBottom: '14px', letterSpacing: '0.12em', fontWeight: 700 }}>O2 CONSUMPTION & METABOLIC LOAD</div>
                    <div style={{ height: '120px', display: 'flex', alignItems: 'flex-end', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid rgba(6, 19, 43, 0.15)' }}>
                      {[0.24, 0.28, 0.26, 0.31, 0.25, 0.27, 0.29, 0.26, 0.25, 0.26].map((o, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '100%', height: `${o * 320}px`, background: 'linear-gradient(180deg, #38bdf8, #06132b)', borderRadius: '2px' }} />
                          <span className="font-mono" style={{ fontSize: '0.6rem', color: '#1e3a8a', fontWeight: 600 }}>T-{10 - i}</span>
                        </div>
                      ))}
                    </div>
                    <div className="font-mono" style={{ fontSize: '0.72rem', color: '#1e3a8a', marginTop: '8px' }}>Mean O2 Burn: 0.26 L/min // Optimal EVA reserve</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: ACCOUNT */}
            {activeTab === 'account' && (
              <div style={{ maxWidth: '620px', marginLeft: 'auto', marginRight: 'auto' }}>
                <div className="font-mono" style={{ fontSize: '0.72rem', color: '#1e3a8a', letterSpacing: '0.22em', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 700 }}>
                  RIDGE // ASTRONAUT PROFILE
                </div>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 600, color: '#06132b', margin: '0 0 24px 0' }}>Crew Dossier</h2>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
                  {activeAstronaut.faceSnaps?.center ? (
                    <img src={activeAstronaut.faceSnaps.center} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #06132b' }} />
                  ) : (
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#06132b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', border: '2px solid #06132b' }}>
                      👨‍🚀
                    </div>
                  )}
                  <div>
                    <h3 style={{ fontSize: '1.4rem', color: '#06132b', margin: 0, fontWeight: 600 }}>{activeAstronaut.name}</h3>
                    <div className="font-mono" style={{ fontSize: '0.78rem', color: '#1e3a8a', marginTop: '4px', fontWeight: 600 }}>ID: {activeAstronaut.id} // {activeAstronaut.role}</div>
                    <div className="font-mono" style={{ fontSize: '0.74rem', color: '#1e3a8a' }}>MISSION: {activeAstronaut.mission}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
                  {['center', 'left', 'right'].map((ang) => (
                    <div key={ang} style={{ background: '#06132b', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid rgba(6, 19, 43, 0.25)', boxShadow: '0 4px 14px rgba(6, 19, 43, 0.15)' }}>
                      <div className="font-mono" style={{ fontSize: '0.65rem', color: '#f6eedb', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 600 }}>Face Scan: {ang}</div>
                      {activeAstronaut.faceSnaps?.[ang] ? (
                        <img src={activeAstronaut.faceSnaps[ang]} alt={ang} style={{ width: '100%', height: '85px', objectFit: 'cover', borderRadius: '2px' }} />
                      ) : (
                        <div style={{ height: '85px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9fb6da', fontSize: '0.72rem' }}>No photo</div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="font-mono" style={{ fontSize: '0.78rem', color: '#1e3a8a', lineHeight: 1.6, borderTop: '1px solid rgba(6, 19, 43, 0.15)', paddingTop: '16px' }}>
                  Blood Type: <strong style={{ color: '#06132b' }}>{activeAstronaut.bloodType || 'O-Positive'}</strong> • Fingerprint Hash: <strong style={{ color: '#06132b' }}>{activeAstronaut.fingerprint || 'FP-SYNTH-89012'}</strong> • Clearance: <strong style={{ color: '#06132b' }}>ORBITAL CLEARANCE A-1</strong>
                </div>
              </div>
            )}

            {/* TAB 8: SETTINGS */}
            {activeTab === 'settings' && (
              <div style={{ maxWidth: '620px', marginLeft: 'auto', marginRight: 'auto' }}>
                <div className="font-mono" style={{ fontSize: '0.72rem', color: '#1e3a8a', letterSpacing: '0.22em', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 700 }}>
                  RIDGE // SYSTEM PREFERENCES
                </div>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 600, color: '#06132b', margin: '0 0 24px 0' }}>Configuration</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(6, 19, 43, 0.12)' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', color: '#06132b', fontWeight: 600 }}>Zero-G Touch Avoidance Sensors</div>
                      <div className="font-mono" style={{ fontSize: '0.72rem', color: '#1e3a8a' }}>Astronaut cursor evasion in welcome screen</div>
                    </div>
                    <span className="font-mono" style={{ color: '#06132b', fontSize: '0.78rem', fontWeight: 700 }}>ACTIVE [100%]</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(6, 19, 43, 0.12)' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', color: '#06132b', fontWeight: 600 }}>Helmet Visor Reticle Tracking</div>
                      <div className="font-mono" style={{ fontSize: '0.72rem', color: '#1e3a8a' }}>Interactive 3D angle parallax on mouse move</div>
                    </div>
                    <span className="font-mono" style={{ color: '#06132b', fontSize: '0.78rem', fontWeight: 700 }}>ONLINE [30°]</span>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveAstronaut(DEFAULT_ASTRONAUT);
                        setScreen('intro');
                        if (onLogout) onLogout();
                      }}
                      style={{
                        background: '#06132b',
                        border: '1px solid rgba(6, 19, 43, 0.4)',
                        color: '#f6eedb',
                        width: '100%',
                        padding: '14px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        fontSize: '0.8rem',
                        boxShadow: '0 4px 20px rgba(6, 19, 43, 0.25)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#0e2454';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#06132b';
                      }}
                    >
                      LOG OUT OF RIDGE HUD
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 9: ASTRI AI CHATBOT WITH 3D ASTRONAUT IN THE MIDDLE */}
            {activeTab === 'astri' && (
              <div style={{ maxWidth: '1100px', marginLeft: 'auto', marginRight: 'auto', width: '100%', paddingBottom: '40px' }}>
                <AstriChatbot
                  onBackToOverview={() => setActiveTab('home')}
                  astronautName={activeAstronaut.name}
                  astronautRole={activeAstronaut.role}
                />
              </div>
            )}
          </main>
        </div>

        {/* ── SECTION 2: MONITOR HEALTH PAGE (CONTINUING DOWNWARDS DIRECTLY ON THE SAME PAGE) ── */}
        <div
          id="monitor-health-section"
          style={{
            position: 'relative',
            width: '100%',
            minHeight: '960px',
            borderTop: '1px solid rgba(6, 19, 43, 0.15)',
            zIndex: 20,
            backgroundColor: '#f6eedb',
          }}
        >
          {/* Section Header Anchor */}
          <div
            style={{
              padding: '20px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              borderBottom: '1px solid rgba(6, 19, 43, 0.12)',
              background: '#06132b',
              color: '#f6eedb',
              boxShadow: '0 4px 20px rgba(6, 19, 43, 0.18)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                <span className="font-mono" style={{ fontSize: '0.72rem', color: '#ead9b2', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
                  // STEP 4 // MONITOR HEALTH & 3D HUMAN SYSTEMS OBSERVATORY
                </span>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#f6eedb', margin: 0, letterSpacing: '-0.02em' }}>
                Inspect Organs & Scan Physiological Health
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="font-mono" style={{ fontSize: '0.75rem', color: '#9fb6da' }}>
                Scroll up for Suit Visor Telemetry ↑
              </span>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('suit-and-vitals-container')?.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="tech-btn"
                style={{
                  padding: '8px 16px',
                  fontSize: '0.7rem',
                  letterSpacing: '0.14em',
                }}
              >
                ↑ SUIT TELEMETRY
              </button>
            </div>
          </div>

          {/* Embedded 3D Vital Human Systems Observatory */}
          <div 
            style={{ position: 'relative', width: '100%', height: 'calc(100vh - 90px)' }}
            onWheelCapture={(e) => {
              // Force the parent container to scroll even if the 3D canvas intercepts the wheel event
              const container = document.getElementById('suit-and-vitals-container');
              if (container) {
                container.scrollTop += e.deltaY;
              }
            }}
          >
            <VitalObservatory
              astronaut={activeAstronaut}
              isEmbedded={true}
            />
          </div>
        </div>
      </div>
    )}

      {/* ── 5. VITAL HUMAN SYSTEMS OBSERVATORY (ENLARGED scene.gltf & INTERNAL ORGAN ZOOM) ── */}
      {showBodyScanModal && (
        <VitalObservatory
          astronaut={activeAstronaut}
          onClose={() => {
            setShowBodyScanModal(false);
            if (initialShowBodyScan && onBackToOverview) {
              onBackToOverview();
            }
          }}
        />
      )}

      {/* ── 6. JARVIS TOUCHLESS DESKTOP HUD ── */}
      {showJarvisHud && (
        <JarvisTouchlessHud
          onClose={() => setShowJarvisHud(false)}
          onLaunchObservatory={() => {
            setShowJarvisHud(false);
            setShowBodyScanModal(true);
          }}
        />
      )}

      {/* ── 7. OFFLINE AR PALM GESTURE MISSION HUD (5-STEP HEALTH BRIEFING) ── */}
      {showMissionHUD && (
        <MissionHUD
          astronaut={activeAstronaut}
          onClose={() => setShowMissionHUD(false)}
        />
      )}

      {/* ── 7. 3D FACE VISOR STUDIO & BIOMETRIC CAMERA RECOGNITION ── */}
      <ThreeDFaceStudioModal
        isOpen={show3DFaceStudio}
        onClose={() => setShow3DFaceStudio(false)}
        activeAstronaut={activeAstronaut}
        onSaveFaceData={handleSaveFaceData}
        onFaceAuthRecorded={(updatedLogs) => setFaceAuthLogs(updatedLogs)}
        onLoginSuccess={(astro) => {
          setActiveAstronaut(astro);
          setFaceAuthLogs(getFaceAuthLogs());
          setScreen('dashboard');
        }}
      />
    </div>
  );
}
