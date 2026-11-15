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
} from 'lucide-react';
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
    const list = getStoredAstronauts();
    return list[0] || DEFAULT_ASTRONAUT;
  });

  const [dailyGreeting] = useState(getDailyMessage());
  
  const [show3DFaceStudio, setShow3DFaceStudio] = useState(false);
  const [suitTelemetryView, setSuitTelemetryView] = useState('metrics'); 
  const [faceAuthLogs, setFaceAuthLogs] = useState(getFaceAuthLogs);
  const [telemetrySide, setTelemetrySide] = useState('left'); 

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
  };

  const currentVisorFaceSnap = useMemo(() => {
    const snaps = activeAstronaut.faceSnaps || {};
    if (visorMouseX < -0.2 && snaps.left) return snaps.left;
    if (visorMouseX > 0.2 && snaps.right) return snaps.right;
    return snaps.center || snaps.left || snaps.right || null;
  }, [visorMouseX, activeAstronaut]);


  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', height: '100vh', background: '#06132b', overflow: 'hidden' }}>

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
              background: 'rgba(6, 19, 43, 0.92)',
              border: '1px solid #f6eedb',
              color: '#f6eedb',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
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

      {/* ── 1. STARTING SCREEN: HOHMANN TRANSFER SIMULATION & RIDGE 8S COUNTDOWN ── */}
      {screen === 'intro' && (
        <div className="screen-fade" style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
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

          {/* RIDGE Branding & 8s Countdown in the Middle */}
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
            <h1 className="ridge-title font-tech" style={{ margin: 0, fontSize: 'clamp(2.8rem, 6.5vw, 5.2rem)', fontWeight: 600, color: '#f6eedb', textIndent: '0.4em', lineHeight: 1 }}>
              RIDGE
            </h1>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', pointerEvents: 'auto', width: '100%', marginTop: '30px' }}>
              <div className="font-mono" style={{ fontSize: '0.85rem', color: 'rgba(234, 217, 178, 0.9)', letterSpacing: '0.15em' }}>
                INITIALIZING IN <span style={{ fontWeight: 'bold', color: '#f6eedb' }}>{countdown}S</span>
              </div>
              <div style={{ width: '220px', height: '3px', background: 'rgba(246, 238, 219, 0.16)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${((8 - countdown) / 8) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #ead9b2, #f6eedb)', transition: 'width 1s linear' }} />
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setScreen('astronaut')}
                  className="tech-btn"
                  style={{ cursor: 'pointer' }}
                >
                  ENTER CREW PORTAL →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('signin');
                    setScreen('login');
                  }}
                  className="tech-btn"
                  style={{ cursor: 'pointer', background: 'rgba(10, 28, 63, 0.85)', color: '#f6eedb', border: '1px solid rgba(246, 238, 219, 0.4)' }}
                >
                  CREW LOGIN & BIOMETRICS 👤
                </button>
                <button
                  type="button"
                  onClick={() => setShowBodyScanModal(true)}
                  className="tech-btn"
                  style={{ cursor: 'pointer', background: 'rgba(234, 217, 178, 0.15)', color: '#f6eedb', border: '1px solid #ead9b2' }}
                >
                  3D VITALS OBSERVATORY 🧬
                </button>
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
            
            <h1
              className="welcome-title font-tech"
              style={{
                margin: 0,
                fontSize: 'clamp(3.5rem, 8vw, 5.5rem)',
                fontWeight: 700,
                color: '#f6eedb',
                letterSpacing: '0.12em',
                lineHeight: 1,
                textTransform: 'uppercase',
                textShadow: '0 0 40px rgba(246, 238, 219, 0.5)'
              }}
            >
              Welcome
            </h1>

            {/* Daily Wishing Message (Glassmorphism Tech Card) */}
            <div
              style={{
                marginTop: '28px',
                maxWidth: '640px',
                width: '90%',
                padding: '24px 32px',
                background: 'linear-gradient(180deg, rgba(10, 28, 63, 0.4) 0%, rgba(6, 19, 43, 0.7) 100%)',
                border: '1px solid rgba(246, 238, 219, 0.15)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 16px rgba(246,238,219,0.05)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
                pointerEvents: 'auto',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="font-mono" style={{ fontSize: '0.75rem', color: '#9fb6da', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  SECURE CREW TRANSMISSION
                </span>
              </div>
              
              <h3 style={{ 
                fontSize: '1.25rem', 
                color: '#f6eedb', 
                margin: 0, 
                lineHeight: '1.6', 
                fontWeight: '300',
                fontStyle: 'italic',
                letterSpacing: '0.02em',
              }}>
                "{dailyGreeting.text}"
              </h3>
              
              {dailyGreeting.event && (
                <div className="font-mono" style={{ 
                  marginTop: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.7rem', 
                  color: '#ead9b2', 
                  background: 'rgba(234, 217, 178, 0.1)',
                  padding: '4px 12px',
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
                textTransform: 'uppercase'
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
            backgroundColor: '#06132b',
            scrollBehavior: 'smooth',
          }}
        >
          {/* ── CLEAN INK BLUE SPACE BACKGROUND ── */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 0,
              backgroundImage: 'radial-gradient(circle at 65% 45%, rgba(14, 40, 89, 0.55) 0%, rgba(6, 19, 43, 0.96) 85%)',
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
                    left: '51%',
                    top: '41.5%',
                    width: '23.5%',
                    aspectRatio: '1 / 1.06',
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '50% 50% 47% 47%',
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
                      borderRadius: '50% 50% 47% 47%',
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
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f6eedb', boxShadow: '0 0 10px #ead9b2' }} />
                    <span className="font-mono" style={{ fontSize: '0.72rem', color: '#ead9b2', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
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
                        background: 'rgba(246, 238, 219, 0.12)',
                        border: '1px solid rgba(246, 238, 219, 0.25)',
                        color: '#ead9b2',
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
                  </div>
                </div>

                {/* Main Heading */}
                <h1
                  style={{
                    fontSize: '2.8rem',
                    fontWeight: 400,
                    color: '#f6eedb',
                    margin: '0 0 6px 0',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                  }}
                >
                  {suitTelemetryView === 'auth-log' ? 'Face auth log' : 'Suit telemetry'}
                </h1>
                <div className="font-mono" style={{ fontSize: '0.76rem', color: '#9fb6da', marginBottom: '30px', letterSpacing: '0.08em' }}>
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
                    {/* ── FRAMELESS HAIRLINE TELEMETRY METRICS ───────────── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                      {/* Metric 1: Oxygen Reserve */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span className="font-mono" style={{ fontSize: '0.74rem', color: '#9fb6da', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                            OXYGEN RESERVE
                          </span>
                          <span style={{ fontSize: '2rem', fontWeight: 300, color: '#f6eedb', letterSpacing: '-0.02em' }}>
                            99.4 <span style={{ fontSize: '1.25rem', fontWeight: 300, color: '#9fb6da' }}>%</span>
                          </span>
                        </div>
                        <div className="hairline-bar-track">
                          <div className="hairline-bar-fill" style={{ width: '99.4%' }} />
                        </div>
                      </div>

                      {/* Metric 2: Suit Pressure */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span className="font-mono" style={{ fontSize: '0.74rem', color: '#9fb6da', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                            SUIT PRESSURE
                          </span>
                          <span style={{ fontSize: '2rem', fontWeight: 300, color: '#f6eedb', letterSpacing: '-0.02em' }}>
                            4.3 <span style={{ fontSize: '1.25rem', fontWeight: 300, color: '#9fb6da' }}>psi</span>
                          </span>
                        </div>
                        <div className="hairline-bar-track">
                          <div className="hairline-bar-fill" style={{ width: '86%' }} />
                        </div>
                      </div>

                      {/* Metric 3: Battery Capacity / Life Support */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span className="font-mono" style={{ fontSize: '0.74rem', color: '#9fb6da', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                            BATTERY CAPACITY
                          </span>
                          <span style={{ fontSize: '2rem', fontWeight: 300, color: '#f6eedb', letterSpacing: '-0.02em' }}>
                            87 <span style={{ fontSize: '1.25rem', fontWeight: 300, color: '#9fb6da' }}>%</span>
                          </span>
                        </div>
                        <div className="hairline-bar-track">
                          <div className="hairline-bar-fill" style={{ width: '87%' }} />
                        </div>
                      </div>
                    </div>

                    {/* Micro Stats Inline Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '26px', padding: '0 4px' }}>
                      <div className="font-mono" style={{ fontSize: '0.75rem', color: '#9fb6da', letterSpacing: '0.12em' }}>
                        HEART RATE <span style={{ color: '#f6eedb', fontWeight: 600 }}>{liveHeartRate} BPM</span>
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.75rem', color: '#9fb6da', letterSpacing: '0.12em' }}>
                        EVA SEAL <span style={{ color: '#f6eedb', fontWeight: 600 }}>100%</span>
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.75rem', color: '#9fb6da', letterSpacing: '0.12em' }}>
                        THERMAL <span style={{ color: '#f6eedb', fontWeight: 600 }}>+21°C</span>
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
                        background: '#f6eedb',
                        color: '#06132b',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        boxShadow: '0 0 25px rgba(246, 238, 219, 0.35)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ead9b2';
                        e.currentTarget.style.boxShadow = '0 0 35px rgba(246, 238, 219, 0.55)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f6eedb';
                        e.currentTarget.style.boxShadow = '0 0 25px rgba(246, 238, 219, 0.35)';
                      }}
                    >
                      <span>INSPECT ORGANS & SCAN HEALTH ↓</span>
                      <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>↓</span>
                    </button>

                    {/* Mission Status Summary (Clean Unboxed Editorial Typography) */}
                    <div style={{ borderTop: '1px solid rgba(246, 238, 219, 0.14)', paddingTop: '20px' }}>
                      <div className="font-mono" style={{ fontSize: '0.72rem', color: '#ead9b2', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>
                        CURRENT FLIGHT MISSION STATUS: {activeAstronaut.mission}
                      </div>
                      <p style={{ fontSize: '0.84rem', color: '#9fb6da', lineHeight: 1.6, margin: 0 }}>
                        Active crew member <strong style={{ color: '#f6eedb' }}>{activeAstronaut.name}</strong> is currently designated as <strong style={{ color: '#f6eedb' }}>{activeAstronaut.role}</strong>. Suit biometric telemetry channels 01–16 are transmitting in real-time. All zero-g autonomic reflexes, cardiac outputs, and metabolic oxygen consumption rates match baseline mission parameters.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB 2: PROJECTS */}
            {activeTab === 'projects' && (
              <div style={{ maxWidth: '620px', marginLeft: 'auto', marginRight: 'auto' }}>
                <div className="font-mono" style={{ fontSize: '0.72rem', color: '#ead9b2', letterSpacing: '0.22em', marginBottom: '8px', textTransform: 'uppercase' }}>
                  RIDGE // EXPEDITION CHECKLISTS
                </div>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 400, color: '#f6eedb', margin: '0 0 24px 0' }}>Flight Missions & Tasks</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { title: 'Project Artemis VII Deep-Space Transfer', status: 'In Transit', progress: '68%', desc: 'Hohmann orbital transfer trajectory between Earth orbital habitat and Mars orbital insertion stage.', color: '#f6eedb' },
                    { title: 'EVA Spacewalk Delta-4 Checklist', status: 'Scheduled 04:30 UTC', progress: 'Ready', desc: 'Depressurize airlock B, inspect primary photovoltaic array gimbal hinges, replace high-gain microwave antenna coupler.', color: '#ead9b2' },
                    { title: 'Cryogenic Fuel Boil-Off Countermeasures', status: 'Continuous Active', progress: '98%', desc: 'Active cooling circulation loop monitoring LOX/CH4 storage tanks under direct solar exposure.', color: '#f6eedb' },
                    { title: 'Autonomous Life Support Bio-Regen', status: 'Active Recycling', progress: '94%', desc: 'Chlorella algae closed-loop carbon dioxide scrubbing and potable water condensation reclaim system.', color: '#ead9b2' },
                  ].map((p, i) => (
                    <div key={i} style={{ borderBottom: '1px solid rgba(246,238,219,0.12)', paddingBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span className="font-mono" style={{ fontSize: '0.72rem', color: p.color, letterSpacing: '0.12em' }}>{p.status}</span>
                        <span className="font-mono" style={{ fontSize: '0.72rem', color: '#f6eedb' }}>{p.progress}</span>
                      </div>
                      <h3 style={{ fontSize: '1.05rem', color: '#f6eedb', margin: '0 0 6px 0', fontWeight: 500 }}>{p.title}</h3>
                      <p style={{ fontSize: '0.82rem', color: '#9fb6da', lineHeight: 1.5, margin: 0 }}>{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: MESSAGES */}
            {activeTab === 'messages' && (
              <div style={{ maxWidth: '620px', marginLeft: 'auto', marginRight: 'auto' }}>
                <div className="font-mono" style={{ fontSize: '0.72rem', color: '#ead9b2', letterSpacing: '0.22em', marginBottom: '8px', textTransform: 'uppercase' }}>
                  RIDGE // ORBITAL RELAYS
                </div>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 400, color: '#f6eedb', margin: '0 0 24px 0' }}>Comms & Transmissions</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {[
                    { sender: 'HOUSTON FLIGHT DYNAMICS (CAPCOM)', time: '02:14 UTC', unread: true, subject: 'Telemetry verification confirmed on all 16 biometric channels.', body: 'Alex, telemetry locks look pristine from Johnson Space Center. Solar radiation levels remain below threshold. Next orbital burn scheduled at T+14:20:00.' },
                    { sender: 'CREW MEDICAL OFFICER (DR. S. CHEN)', time: '01:45 UTC', unread: true, subject: '3D Full Body Scan sync complete.', body: 'Your latest zero-gravity cardiovascular adaptation readings show 0.02% bone mass change, well within optimal tolerances. Continue daily 45-minute resistance workout protocol.' },
                    { sender: 'STARLINK DEEP-SPACE RELAY NODE 09', time: '00:12 UTC', unread: true, subject: 'Laser optical link synchronized.', body: 'Continuous 1.2 Gbps downlink established via Lunar Orbital Gateway optical terminal. High-bandwidth HD video feed ready for EVA mission sequence.' },
                  ].map((m, i) => (
                    <div key={i} style={{ borderBottom: '1px solid rgba(246,238,219,0.12)', paddingBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span className="font-mono" style={{ fontSize: '0.75rem', color: '#ead9b2', fontWeight: 600 }}>{m.sender}</span>
                        <span className="font-mono" style={{ fontSize: '0.7rem', color: '#9fb6da' }}>{m.time}</span>
                      </div>
                      <div style={{ fontSize: '0.95rem', color: '#f6eedb', fontWeight: 500, marginBottom: '6px' }}>{m.subject}</div>
                      <div style={{ fontSize: '0.82rem', color: '#9fb6da', lineHeight: 1.5 }}>{m.body}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: CALENDAR */}
            {activeTab === 'calendar' && (
              <div style={{ maxWidth: '620px', marginLeft: 'auto', marginRight: 'auto' }}>
                <div className="font-mono" style={{ fontSize: '0.72rem', color: '#ead9b2', letterSpacing: '0.22em', marginBottom: '8px', textTransform: 'uppercase' }}>
                  RIDGE // TIMELINES
                </div>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 400, color: '#f6eedb', margin: '0 0 24px 0' }}>Orbital Schedule</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {[
                    { date: 'TODAY // 04:30 UTC', event: 'EVA Air-Lock Exit Delta-4', type: 'Extravehicular Activity', status: 'Confirmed' },
                    { date: 'TODAY // 11:15 UTC', event: 'Orbital Perigee Booster Check', type: 'Navigation', status: 'Ready' },
                    { date: 'TOMORROW // 02:00 UTC', event: 'Astronaut Sleep Cycle Sync (8 hrs)', type: 'Life Support', status: 'Scheduled' },
                    { date: 'IN 2 DAYS // 09:45 UTC', event: 'Lunar Flyby Trajectory Observation', type: 'Deep Space Mission', status: 'Planned' },
                  ].map((c, i) => (
                    <div key={i} style={{ borderBottom: '1px solid rgba(246,238,219,0.12)', paddingBottom: '14px' }}>
                      <div className="font-mono" style={{ fontSize: '0.72rem', color: '#ead9b2', marginBottom: '4px' }}>{c.date}</div>
                      <h4 style={{ fontSize: '1rem', color: '#f6eedb', margin: '0 0 4px 0', fontWeight: 500 }}>{c.event}</h4>
                      <div className="font-mono" style={{ fontSize: '0.72rem', color: '#9fb6da' }}>{c.type} // {c.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: ARCHIVE */}
            {activeTab === 'archive' && (
              <div style={{ maxWidth: '620px', marginLeft: 'auto', marginRight: 'auto' }}>
                <div className="font-mono" style={{ fontSize: '0.72rem', color: '#ead9b2', letterSpacing: '0.22em', marginBottom: '8px', textTransform: 'uppercase' }}>
                  RIDGE // STORAGE
                </div>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 400, color: '#f6eedb', margin: '0 0 24px 0' }}>Blackbox & Biometric Archives</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    { id: 'LOG-78901', title: 'Suit Biometric Calibration #14', size: '24.5 MB', date: '2026-11-12' },
                    { id: 'LOG-78899', title: 'Zero-G Autonomic Reflex Waveforms', size: '112.8 MB', date: '2026-11-11' },
                    { id: 'LOG-78850', title: 'Orbital Insertion Blackbox Telemetry', size: '1.4 GB', date: '2026-11-10' },
                  ].map((a, i) => (
                    <div key={i} style={{ borderBottom: '1px solid rgba(246,238,219,0.12)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span className="font-mono" style={{ fontSize: '0.72rem', color: '#ead9b2' }}>{a.id}</span>
                        <div style={{ fontSize: '0.95rem', color: '#f6eedb', fontWeight: 500 }}>{a.title}</div>
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.74rem', color: '#9fb6da' }}>
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
                <div className="font-mono" style={{ fontSize: '0.72rem', color: '#ead9b2', letterSpacing: '0.22em', marginBottom: '8px', textTransform: 'uppercase' }}>
                  RIDGE // DIAGNOSTICS
                </div>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 400, color: '#f6eedb', margin: '0 0 24px 0' }}>Sensor Telemetry Trends</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  <div>
                    <div className="font-mono" style={{ fontSize: '0.75rem', color: '#f6eedb', marginBottom: '14px', letterSpacing: '0.12em' }}>CARDIOVASCULAR VARIABILITY TRENDS</div>
                    <div style={{ height: '120px', display: 'flex', alignItems: 'flex-end', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid rgba(246,238,219,0.14)' }}>
                      {[65, 72, 70, 74, 76, 74, 78, 74, 72, 74].map((h, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '100%', height: `${h * 1.3}px`, background: 'linear-gradient(180deg, #f6eedb, #112957)', borderRadius: '2px' }} />
                          <span className="font-mono" style={{ fontSize: '0.6rem', color: '#9fb6da' }}>T-{10 - i}</span>
                        </div>
                      ))}
                    </div>
                    <div className="font-mono" style={{ fontSize: '0.72rem', color: '#9fb6da', marginTop: '8px' }}>Average: 73.9 BPM // Sinus rhythm stable</div>
                  </div>

                  <div>
                    <div className="font-mono" style={{ fontSize: '0.75rem', color: '#ead9b2', marginBottom: '14px', letterSpacing: '0.12em' }}>O2 CONSUMPTION & METABOLIC LOAD</div>
                    <div style={{ height: '120px', display: 'flex', alignItems: 'flex-end', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid rgba(246,238,219,0.14)' }}>
                      {[0.24, 0.28, 0.26, 0.31, 0.25, 0.27, 0.29, 0.26, 0.25, 0.26].map((o, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '100%', height: `${o * 320}px`, background: 'linear-gradient(180deg, #ead9b2, #0a1c3f)', borderRadius: '2px' }} />
                          <span className="font-mono" style={{ fontSize: '0.6rem', color: '#9fb6da' }}>T-{10 - i}</span>
                        </div>
                      ))}
                    </div>
                    <div className="font-mono" style={{ fontSize: '0.72rem', color: '#9fb6da', marginTop: '8px' }}>Mean O2 Burn: 0.26 L/min // Optimal EVA reserve</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: ACCOUNT */}
            {activeTab === 'account' && (
              <div style={{ maxWidth: '620px', marginLeft: 'auto', marginRight: 'auto' }}>
                <div className="font-mono" style={{ fontSize: '0.72rem', color: '#ead9b2', letterSpacing: '0.22em', marginBottom: '8px', textTransform: 'uppercase' }}>
                  RIDGE // ASTRONAUT PROFILE
                </div>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 400, color: '#f6eedb', margin: '0 0 24px 0' }}>Crew Dossier</h2>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
                  {activeAstronaut.faceSnaps?.center ? (
                    <img src={activeAstronaut.faceSnaps.center} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f6eedb' }} />
                  ) : (
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#0a1c3f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', border: '2px solid #f6eedb' }}>
                      👨‍🚀
                    </div>
                  )}
                  <div>
                    <h3 style={{ fontSize: '1.4rem', color: '#f6eedb', margin: 0, fontWeight: 500 }}>{activeAstronaut.name}</h3>
                    <div className="font-mono" style={{ fontSize: '0.78rem', color: '#ead9b2', marginTop: '4px' }}>ID: {activeAstronaut.id} // {activeAstronaut.role}</div>
                    <div className="font-mono" style={{ fontSize: '0.74rem', color: '#9fb6da' }}>MISSION: {activeAstronaut.mission}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
                  {['center', 'left', 'right'].map((ang) => (
                    <div key={ang} style={{ background: 'rgba(10, 28, 63, 0.72)', padding: '10px', borderRadius: '4px', textAlign: 'center', border: '1px solid rgba(246,238,219,0.16)' }}>
                      <div className="font-mono" style={{ fontSize: '0.65rem', color: '#ead9b2', marginBottom: '6px', textTransform: 'uppercase' }}>Face Scan: {ang}</div>
                      {activeAstronaut.faceSnaps?.[ang] ? (
                        <img src={activeAstronaut.faceSnaps[ang]} alt={ang} style={{ width: '100%', height: '85px', objectFit: 'cover', borderRadius: '2px' }} />
                      ) : (
                        <div style={{ height: '85px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9fb6da', fontSize: '0.72rem' }}>No photo</div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="font-mono" style={{ fontSize: '0.78rem', color: '#9fb6da', lineHeight: 1.6, borderTop: '1px solid rgba(246,238,219,0.12)', paddingTop: '16px' }}>
                  Blood Type: <strong style={{ color: '#f6eedb' }}>{activeAstronaut.bloodType || 'O-Positive'}</strong> • Fingerprint Hash: <strong style={{ color: '#f6eedb' }}>{activeAstronaut.fingerprint || 'FP-SYNTH-89012'}</strong> • Clearance: <strong style={{ color: '#ead9b2' }}>ORBITAL CLEARANCE A-1</strong>
                </div>
              </div>
            )}

            {/* TAB 8: SETTINGS */}
            {activeTab === 'settings' && (
              <div style={{ maxWidth: '620px', marginLeft: 'auto', marginRight: 'auto' }}>
                <div className="font-mono" style={{ fontSize: '0.72rem', color: '#ead9b2', letterSpacing: '0.22em', marginBottom: '8px', textTransform: 'uppercase' }}>
                  RIDGE // SYSTEM PREFERENCES
                </div>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 400, color: '#f6eedb', margin: '0 0 24px 0' }}>Configuration</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(246,238,219,0.12)' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', color: '#f6eedb', fontWeight: 500 }}>Zero-G Touch Avoidance Sensors</div>
                      <div className="font-mono" style={{ fontSize: '0.72rem', color: '#9fb6da' }}>Astronaut cursor evasion in welcome screen</div>
                    </div>
                    <span className="font-mono" style={{ color: '#f6eedb', fontSize: '0.78rem' }}>ACTIVE [100%]</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(246,238,219,0.12)' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', color: '#f6eedb', fontWeight: 500 }}>Helmet Visor Reticle Tracking</div>
                      <div className="font-mono" style={{ fontSize: '0.72rem', color: '#9fb6da' }}>Interactive 3D angle parallax on mouse move</div>
                    </div>
                    <span className="font-mono" style={{ color: '#f6eedb', fontSize: '0.78rem' }}>ONLINE [30°]</span>
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
                        background: 'rgba(246, 238, 219, 0.12)',
                        border: '1px solid rgba(246, 238, 219, 0.4)',
                        color: '#f6eedb',
                        width: '100%',
                        padding: '14px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        fontSize: '0.8rem',
                      }}
                    >
                      LOG OUT OF RIDGE HUD
                    </button>
                  </div>
                </div>
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
            borderTop: '1px solid rgba(246, 238, 219, 0.18)',
            zIndex: 20,
            backgroundColor: '#06132b',
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
              borderBottom: '1px solid rgba(246, 238, 219, 0.12)',
              background: 'rgba(10, 28, 63, 0.8)',
              backdropFilter: 'blur(16px)',
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
          <VitalObservatory
            astronaut={activeAstronaut}
            isEmbedded={true}
          />
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