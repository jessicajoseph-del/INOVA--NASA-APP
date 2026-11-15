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

// ── 3D Holographic Human Body Component ──────────
const HolographicBody3D = ({ scanProgress }) => {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.7;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0]} scale={1.1}>
      <mesh position={[0, 1.45, 0]}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.25, 0.2, 1.1, 16]} />
        <meshBasicMaterial color="#0099ff" wireframe transparent opacity={0.5} />
      </mesh>
      <mesh position={[0.04, 0.85, 0.05]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color="#ff2266" transparent opacity={0.9} />
      </mesh>
      <mesh position={[-0.08, 0.88, 0]}>
        <capsuleGeometry args={[0.06, 0.18, 8, 16]} />
        <meshBasicMaterial color="#00ffcc" wireframe transparent opacity={0.6} />
      </mesh>
      <mesh position={[0.08, 0.88, 0]}>
        <capsuleGeometry args={[0.06, 0.18, 8, 16]} />
        <meshBasicMaterial color="#00ffcc" wireframe transparent opacity={0.6} />
      </mesh>
      <mesh position={[-0.38, 0.75, 0]} rotation={[0, 0, 0.2]}>
        <capsuleGeometry args={[0.06, 0.9, 8, 16]} />
        <meshBasicMaterial color="#00e5ff" wireframe transparent opacity={0.45} />
      </mesh>
      <mesh position={[0.38, 0.75, 0]} rotation={[0, 0, -0.2]}>
        <capsuleGeometry args={[0.06, 0.9, 8, 16]} />
        <meshBasicMaterial color="#00e5ff" wireframe transparent opacity={0.45} />
      </mesh>
      <mesh position={[-0.15, -0.4, 0]}>
        <capsuleGeometry args={[0.08, 1.2, 8, 16]} />
        <meshBasicMaterial color="#0088ff" wireframe transparent opacity={0.45} />
      </mesh>
      <mesh position={[0.15, -0.4, 0]}>
        <capsuleGeometry args={[0.08, 1.2, 8, 16]} />
        <meshBasicMaterial color="#0088ff" wireframe transparent opacity={0.45} />
      </mesh>
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
        color.setHSL(0.6, 0.18, 0.42); // Slate Pewter (#5A657D)
      } else {
        const idx = i - p4;
        const hash = (idx * 0.54321) % 1.0;
        const spread = 0.5 * orbitScale * hash;
        const phi = Math.acos(1.0 - 2.0 * ((idx * 0.111) % 1.0));
        const theta = ((idx * 0.222) % 1.0) * Math.PI * 2.0;
        target.set(cx + spread * Math.sin(phi) * Math.cos(theta), spread * Math.sin(phi) * Math.sin(theta), cz + spread * Math.cos(phi));
        color.setHSL(0.61, 0.65, 0.15 + hash * 0.2); // Deep Ink Navy (#0B1736)
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


// ── DAILY ASTRONAUT MESSAGING SYSTEM ────────────────────────────────────
const GENERAL_MESSAGES = [
  "Even across galaxies, your heartbeat belongs to humanity.",
  "Earth is far away, but its care travels with you.",
  "Every heartbeat carries a little piece of home.",
  "You are never just a signal in the silence.",
  "Somewhere on Earth, millions of hearts beat alongside yours.",
  "Your vitals tell a story Earth is listening to.",
  "Distance separates worlds, never the lives connecting them.",
  "Even in silence, your body speaks, and we listen.",
  "A universe apart, yet connected by every heartbeat.",
  "Your solitude is vast, but so is our care.",
  "Across the darkness, your heartbeat remains our brightest signal.",
  "Every breath connects you to the world you left behind.",
  "The stars may surround you, but humanity travels within you.",
  "Your heartbeat is a familiar rhythm in an unfamiliar world.",
  "Even light-years cannot measure the distance between caring hearts.",
  "Beyond Earth's atmosphere, you remain part of its heartbeat.",
  "Your wellbeing echoes across every mile between us.",
  "The universe is quiet; your connection to Earth is not.",
  "Every vital sign brings us a little closer.",
  "Home is listening, one heartbeat at a time.",
  "Your strength travels further than any spacecraft.",
  "In the quiet of space, remember the warmth of belonging.",
  "Millions of miles away, never outside the circle of care.",
  "Your heartbeat is a message we never stop receiving.",
  "Even the loneliest orbit carries a connection home.",
  "Your body holds the rhythm of a world behind you.",
  "The stars are distant; our attention is not.",
  "Every signal from you reminds us how connected we are.",
  "Let the quiet remind you of your inner strength.",
  "Your heartbeat bridges the silence between worlds.",
  "Earth may be a distant blue, but its care remains close.",
  "Every breath is proof of your remarkable resilience.",
  "Your health connects two worlds through one shared purpose.",
  "In infinite space, your wellbeing is never a small thing.",
  "The silence outside cannot quiet the strength within.",
  "Your vital signs carry whispers of life across the cosmos.",
  "Somewhere beneath the same stars, someone is thinking of you.",
  "Every heartbeat is another thread connecting you to home.",
  "Space may feel endless; our care has no distance.",
  "Your pulse keeps time with the human story.",
  "A quiet moment can still hold countless connections.",
  "Your wellbeing matters beyond the boundaries of Earth.",
  "Even in orbit, you belong to something greater.",
  "Your heartbeat travels farther than you can imagine.",
  "Let each steady breath bring a little piece of Earth closer.",
  "The universe surrounds you; humanity stands behind you.",
  "Your signals cross the stars, carrying life and hope.",
  "You are Earth's explorer, never its stranger.",
  "Every synced heartbeat reminds us that nobody stands alone.",
  "Your body is extraordinary; so is the care surrounding it.",
  "The stars witness your courage; your data tells your story.",
  "In the vastness, find comfort in the rhythm within.",
  "Your connection to home is stronger than the distance.",
  "Even far from Earth, you remain deeply rooted.",
  "A thousand stars above, countless hearts beside you.",
  "Your pulse is a gentle reminder that you belong.",
  "Beyond the atmosphere, the human connection remains constant.",
  "Every health signal carries a little reassurance from home.",
  "The distance is astronomical; the care is immeasurable.",
  "Your heartbeat is never just your own.",
  "Even when Earth disappears from view, belonging remains.",
  "Let your steady pulse anchor you among the stars.",
  "Your wellbeing is part of humanity's greatest journey.",
  "Across the cosmic silence, your life keeps us connected.",
  "The universe is enormous, but you are never insignificant.",
  "Each breath carries the resilience of those who came before.",
  "Your health data travels; our thoughts travel further.",
  "There is strength in solitude and comfort in connection.",
  "One small heartbeat, one extraordinary connection to Earth.",
  "Wherever your orbit takes you, you are part of us.",
  "Even light-years away, you are held by countless hearts.",
  "Your heartbeat makes the silence feel a little less distant.",
  "Every signal home carries a reminder that you belong.",
  "The stars may feel endless, but connection knows no boundaries.",
  "One steady breath closer to home, one heartbeat stronger."
];

const SPECIAL_DAYS = {
  "04-22": { text: "Every planet deserves the care we give our own home.", event: "Earth Day" },
  "06-05": { text: "A cleaner atmosphere begins with understanding every breath.", event: "World Environment Day" },
  "04-07": { text: "Healthy bodies make extraordinary journeys possible.", event: "World Health Day" },
  "10-10": { text: "Mental wellbeing matters, even millions of miles from home.", event: "World Mental Health Day" },
  "09-07": { text: "Clean air is life's invisible foundation, on Earth and beyond.", event: "International Day of Clean Air" },
  "03-22": { text: "Every drop matters, whether in oceans or spacecraft.", event: "World Water Day" },
  "04-12": { text: "Humanity's journey into space began with one remarkable flight.", event: "International Day of Human Space Flight" },
  "11-10": { text: "Every discovery begins with the courage to question.", event: "World Science Day for Peace and Development" },
  "07-30": { text: "Across galaxies, human connection remains our greatest constant.", event: "International Day of Friendship" },
  "10-16": { text: "Nourishment is the foundation of every extraordinary expedition.", event: "World Food Day" },
  "05-16": { text: "Light helps us explore the universe and understand life.", event: "International Day of Light" },
  "06-08": { text: "Our oceans regulate the blue planet we call home.", event: "World Oceans Day" },
  "05-22": { text: "Protecting biodiversity means protecting the future of life.", event: "International Day for Biological Diversity" },
  "03-21": { text: "Every forest contributes to the planet's breathing system.", event: "International Day of Forests" },
  "03-13": { text: "Sleep restores the mind and body for tomorrow's discoveries.", event: "World Sleep Day" },
  "07-11": { text: "A growing population deserves healthier environments and sustainable futures.", event: "World Population Day" },
  "06-07": { text: "Safe food sustains healthy explorers across every frontier.", event: "World Food Safety Day" },
  "05-03": { text: "The Sun powers life, discovery, and our changing planet.", event: "International Sun Day" },
  "09-29": { text: "Every heartbeat deserves attention, wherever humanity travels.", event: "World Heart Day" },
  "12-05": { text: "Healthy soil sustains the food systems that sustain us.", event: "World Soil Day" },
  "04-21": { text: "Innovation transforms scientific curiosity into meaningful progress.", event: "World Creativity and Innovation Day" },
  "09-21": { text: "A peaceful mind supports a resilient human spirit.", event: "International Day of Peace" },
  "10-02": { text: "Every breath reminds us how precious Earth's atmosphere is.", event: "World Space Week" },
  "03-03": { text: "Protecting wildlife means preserving the balance of our ecosystems.", event: "World Wildlife Day" },
  "11-20": { text: "Every generation inherits the responsibility of a living planet.", event: "World Children's Day" },
  "03-23": { text: "Understanding our climate helps protect tomorrow's explorers.", event: "World Meteorological Day" },
  "12-20": { text: "Human resilience grows through knowledge, care, and connection.", event: "International Human Solidarity Day" },
  "12-08": { text: "Our planet's changing climate deserves our scientific attention.", event: "World Climate Day" },
  "03-18": { text: "Every step toward sustainability shapes humanity's future among the stars.", event: "Global Recycling Day" },
  "02-11": { text: "Scientific discoveries flourish when every mind has room to explore.", event: "International Day of Women and Girls in Science" }
};

const getDailyMessage = () => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateKey = `${month}-${day}`;

  if (SPECIAL_DAYS[dateKey]) {
    return SPECIAL_DAYS[dateKey];
  }

  const randomGenMsg = GENERAL_MESSAGES[Math.floor(Math.random() * GENERAL_MESSAGES.length)];
  return { text: randomGenMsg, event: null };
};


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
  globalArEnabled = false,
  onDisableGlobalAR,
}) {
  const [screen, setScreen] = useState(initialScreen);
  const [loginMode, setLoginMode] = useState('signin');
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
  const [dailyGreeting] = useState(getDailyMessage());

  const [show3DFaceStudio, setShow3DFaceStudio] = useState(false);
  const [suitTelemetryView, setSuitTelemetryView] = useState('metrics');
  const [faceAuthLogs, setFaceAuthLogs] = useState(getFaceAuthLogs);
  const [telemetrySide, setTelemetrySide] = useState('left');
  const [exerciseMinutes, setExerciseMinutes] = useState(135);
  const [aredVolume, setAredVolume] = useState(1840);
  const [sleepHours, setSleepHours] = useState(6.6);
  const [psychReadiness, setPsychReadiness] = useState(7.0);

  const [visorMouseX, setVisorMouseX] = useState(0);
  const [visorMouseY, setVisorMouseY] = useState(0);

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

  useEffect(() => {
    getAstronautsFromFirebase().then((cloudList) => {
      if (cloudList && cloudList.length > 0) {
        setAstronauts(cloudList);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudList));
        if (cloudList[0]) setActiveAstronaut(cloudList[0]);
      }
    });
  }, []);

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

  const currentVisorFaceSnap = useMemo(() => {
    const snaps = activeAstronaut.faceSnaps || {};
    if (visorMouseX < -0.2 && snaps.left) return snaps.left;
    if (visorMouseX > 0.2 && snaps.right) return snaps.right;
    return snaps.center || snaps.left || snaps.right || null;
  }, [visorMouseX, activeAstronaut]);


  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', height: '100vh', background: '#F7F4EE', color: '#0B1736', overflow: 'hidden' }}>

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
              background: '#0B1736',
              border: '1px solid #DCD5C7',
              color: '#F7F4EE',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 24px rgba(11, 23, 54, 0.25)',
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
            backgroundColor: '#F7F4EE',
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
                    uniforms: { tDiffuse: { value: null }, bgColor: { value: new THREE.Color('#F7F4EE') } },
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
                color: '#0B1736',
                letterSpacing: '0.34em',
                textIndent: '0.34em',
                lineHeight: 1,
                textShadow: '0 4px 30px rgba(11, 23, 54, 0.12)',
              }}
            >
              RIDGE
            </h1>

            {/* Health Monitoring System subtitle below RIDGE */}
            <span
              className="font-mono"
              style={{
                marginTop: '16px',
                fontSize: 'clamp(0.85rem, 2vw, 1.1rem)',
                fontWeight: 600,
                color: '#5A657D',
                letterSpacing: '0.24em',
                textIndent: '0.24em',
                textTransform: 'uppercase',
              }}
            >
              Health Monitoring System
            </span>

            {/* 8-second timeout indicator below RIDGE */}
            <div
              style={{
                marginTop: '28px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '240px',
                  height: '4px',
                  background: '#EDE8DE',
                  border: '1px solid #DCD5C7',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(11, 23, 54, 0.05)',
                }}
              >
                <div
                  style={{
                    width: `${((8 - countdown) / 8) * 100}%`,
                    height: '100%',
                    background: '#0B1736',
                    transition: 'width 1s linear',
                    borderRadius: '4px',
                  }}
                />
              </div>
              <span
                className="font-mono"
                style={{
                  fontSize: '0.78rem',
                  color: '#5A657D',
                  letterSpacing: '0.22em',
                  fontWeight: 600,
                  opacity: 0.9,
                }}
              >
                0{countdown}S
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW: CROSS-DOMAIN OPERATIONS SCREEN ── */}
      {screen === 'cross-domain' && (
        <div className="screen-fade" style={{ position: 'absolute', inset: 0, zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#06132b', padding: '20px', overflowY: 'auto' }}>
          <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(14, 40, 89, 0.6) 0%, #06132b 80%)', pointerEvents: 'none' }} />

          <div style={{ position: 'absolute', top: '40px', left: '40px', zIndex: 40 }}>
            <button onClick={() => setScreen('intro')} className="tech-btn" style={{ padding: '8px 16px', fontSize: '0.75rem', letterSpacing: '0.15em' }}>
              ← BACK TO SYSTEM BOOT
            </button>
          </div>

          <div style={{ position: 'relative', zIndex: 10, maxWidth: '900px', width: '100%', textAlign: 'center', margin: 'auto' }}>
            <span className="font-mono" style={{ fontSize: '0.85rem', color: '#9fb6da', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px', display: 'block' }}>
              RIDGE // MULTI-ENVIRONMENT SUPPORT
            </span>
            <h1 className="font-tech" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 600, color: '#f6eedb', marginBottom: '40px', letterSpacing: '0.05em' }}>
              Cross-Domain Operations
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', textAlign: 'left' }}>
              {/* Card 1: Submariners */}
              <div style={{ background: 'rgba(10, 28, 63, 0.6)', border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: '16px', padding: '32px', backdropFilter: 'blur(12px)', boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 229, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0, 229, 255, 0.4)' }}>
                      <Radio className="w-6 h-6 text-[#00e5ff]" />
                    </div>
                    <h3 style={{ fontSize: '1.4rem', color: '#f6eedb', margin: 0, fontWeight: 500 }}>Deep-Sea Submariners</h3>
                 </div>
                 <p style={{ color: '#9fb6da', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                   Extreme pressure environments require continuous physiological monitoring. The RIDGE system tracks oxygen saturation, stress levels, and isolation fatigue for naval submarine crews during prolonged underwater deployments, ensuring operational readiness beneath the surface.
                 </p>
              </div>

              {/* Card 2: HERA Analog */}
              <div style={{ background: 'rgba(10, 28, 63, 0.6)', border: '1px solid rgba(255, 115, 0, 0.3)', borderRadius: '16px', padding: '32px', backdropFilter: 'blur(12px)', boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 115, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 115, 0, 0.4)' }}>
                      <Activity className="w-6 h-6 text-[#ff7300]" />
                    </div>
                    <h3 style={{ fontSize: '1.4rem', color: '#f6eedb', margin: 0, fontWeight: 500 }}>HERA Analog Astronauts</h3>
                 </div>
                 <p style={{ color: '#9fb6da', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                   Simulating deep-space isolation on Earth. RIDGE monitors behavioral health, team dynamics, and biometric baselines for crews in the Human Exploration Research Analog (HERA), preparing humanity for the psychological demands of Mars-bound missions.
                 </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PERSISTENT PARTICLE SWARM SCENE (WELCOME & LOGIN SCREENS ONLY) ── */}
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

      {/* ── 2. WELCOME PAGE: ANIMATED WELCOME + MESSAGE + LOGIN BUTTON ── */}
      {screen === 'astronaut' && (
        <div
          className="screen-fade"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            gap: '36px'
          }}
        >
         {/* Animated Welcome Heading & Message Container */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%' }}>

          {/* Small, subtle Welcome text */}
        <h1
          className="font-tech"
          style={{
            margin: 0,
            fontSize: '54px', // Reduced from (1rem, 3vw, 1.4rem)
            fontWeight: 500,                         // Reduced weight for subtlety
            color: '#9fb6da',
            letterSpacing: '0.6em',                  // Increased tracking for that "tech" look
            lineHeight: 1,
            textTransform: 'uppercase',
            textShadow: '0 0 15px rgba(159, 182, 218, 0.3)' // Dimmed the glow slightly
          }}
        >
          Welcome
        </h1>
{/* Daily Wishing Message (Glassmorphism Tech Card) */}
<div
  style={{
    marginTop: '16px',
    maxWidth: '840px',    // Brought down slightly to frame the text better
    width: '94%',
    padding: '40px 56px', // Slightly tighter padding to match the new text scale
    background: 'linear-gradient(180deg, rgba(10, 28, 63, 0.4) 0%, rgba(6, 19, 43, 0.7) 100%)',
    border: '1px solid rgba(246, 238, 219, 0.15)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 16px rgba(246,238,219,0.05)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
    pointerEvents: 'auto',
  }}
>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="font-mono" style={{ fontSize: '0.75rem', color: '#9fb6da', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  SECURE CREW TRANSMISSION
                </span>
              </div>

            {/* Massive, bold wishing message */}
            <h2
              className="font-tech"
              style={{
                margin: 0,
                fontSize: '27px', // Scaled down significantly for a 2-line fit
                fontWeight: 700,
                color: '#f6eedb',
                letterSpacing: '0.04em',
                lineHeight: 1.3,                          // Relaxed line height for readability
                textTransform: 'uppercase',
                textShadow: '0 0 30px rgba(246, 238, 219, 0.5)', // Softer, cleaner glow
                textAlign: 'center',
                textWrap: 'balance',                      // Ensures lines are roughly equal in width
              }}
            >
              "{dailyGreeting.text}"
            </h2>

              {dailyGreeting.event && (
                <div className="font-mono" style={{
                  marginTop: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.75rem',
                  color: '#ead9b2',
                  background: 'rgba(234, 217, 178, 0.1)',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  border: '1px solid rgba(234, 217, 178, 0.25)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
                  {dailyGreeting.event}
                </div>
              )}
            </div>
          </div>

          {/* Centered Login Button */}
          <div style={{ pointerEvents: 'auto' }}>
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
          onOpen3DFaceStudio={() => {
            onDisableGlobalAR?.();
            setShow3DFaceStudio(true);
          }}
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

<VitalObservatory
            astronaut={activeAstronaut}
            isEmbedded={true}
            globalArEnabled={globalArEnabled}
            onClose={onBackToOverview}
          />
        </div>
      )}

      {/* ── 5. VITAL HUMAN SYSTEMS OBSERVATORY (ENLARGED scene.gltf & INTERNAL ORGAN ZOOM) ── */}
      {showBodyScanModal && (
        <VitalObservatory
          astronaut={activeAstronaut}
          globalArEnabled={globalArEnabled}
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
          globalArEnabled={globalArEnabled}
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