import React, { useRef, Suspense, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, useGLTF, Stars, Sphere, Sparkles } from '@react-three/drei';
import { useNasaIssTelemetry } from '../hooks/useNasaIssTelemetry';
import HandTracker from '../components/HandTracker';

const ISS_MODULES = [
    // Main Spine (Aligned along Z-axis)
    { id: "zvezda", name: "Zvezda (Aft)", position: [0, -2.0, -7.2], rotation: [Math.PI / 2, 0, 0], size: [1.05, 1.05, 5.2, 32], shielding: 0.78, baseDose: 6.0 },
    { id: "node1", name: "Unity Node 1", position: [0, -2.1, -1.6], rotation: [Math.PI / 2, 0, 0], size: [1.15, 1.15, 2.6, 32], shielding: 0.68, baseDose: 7.2 },
    { id: "destiny", name: "US Destiny", position: [0, -2.25, 2.6], rotation: [Math.PI / 2, 0, 0], size: [1.15, 1.15, 4.4, 32], shielding: 0.60, baseDose: 8.1 },

    // Lateral Labs at Harmony Node 2 (Kibo on Port/+X side, Columbus on Starboard/-X side)
    { id: "kibo", name: "Kibo Module", position: [3.3, -2.45, 6.85], rotation: [0, 0, Math.PI / 2], size: [1.15, 1.15, 4.8, 32], shielding: 0.54, baseDose: 8.8 },
    { id: "columbus", name: "Columbus", position: [-2.7, -2.45, 6.85], rotation: [0, 0, Math.PI / 2], size: [1.10, 1.10, 3.6, 32], shielding: 0.57, baseDose: 8.4 },

    // Nadir Observation Dome (Under Tranquility / Node 3)
    { id: "cupola", name: "Cupola", position: [-1.6, -3.55, -1.6], rotation: [0, 0, 0], size: [0.75, 0.85, 1.1, 24], shielding: 0.30, baseDose: 12.0 }
];

const EVACUATION_PLANS = {
    NOMINAL: [
        { module: "All Modules", shield_rating: "Nominal", crew_assigned: 7, notes: "Standard orbital operations. Routine dosimetry monitoring active." }
    ],
    CRITICAL: [
        { module: "Zvezda Service Module (Aft Bunkers)", shield_rating: "45 g/cm²", crew_assigned: 4, notes: "Optimal passive shielding surrounded by water storage and dense equipment racks." },
        { module: "Unity Node 1 (Transit Buffer)", shield_rating: "28 g/cm²", crew_assigned: 3, notes: "Secondary interior shelter corridor. Hold position until proton flux subsides." }
    ]
};

function PhotorealisticISS() {
    const { scene } = useGLTF('/models/ISS_light.glb');
    return <primitive object={scene.clone()} scale={[0.5, 0.5, 0.5]} position={[0, -2, 0]} />;
}

function RealisticEarth() {
    const earthRef = useRef();

    // High-detail Low-Earth-Orbit Blue Horizon & Cloud Shader
    const earthMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                sunDirection: { value: new THREE.Vector3(35, 30, -25).normalize() }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vWorldNormal;
                varying vec3 vPosition;
                void main() {
                    vPosition = position;
                    vNormal = normalize(normalMatrix * normal);
                    vWorldNormal = normalize(mat3(modelMatrix) * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 sunDirection;
                varying vec3 vNormal;
                varying vec3 vWorldNormal;
                varying vec3 vPosition;

                float hash(vec3 p) {
                    p = fract(p * 0.3183099 + 0.1);
                    p *= 17.0;
                    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
                }

                float noise(vec3 x) {
                    vec3 i = floor(x);
                    vec3 f = fract(x);
                    f = f * f * (3.0 - 2.0 * f);
                    return mix(
                        mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                            mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                        mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                            mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
                        f.z
                    );
                }

                float fbm(vec3 p) {
                    float v = 0.0;
                    float a = 0.52;
                    for (int i = 0; i < 6; i++) {
                        v += a * noise(p);
                        p = p * 2.12 + vec3(1.7, 9.2, 3.4);
                        a *= 0.48;
                    }
                    return v;
                }

                void main() {
                    vec3 dir = normalize(vPosition);
                    float continent = fbm(dir * 3.4);
                    float fineDetail = fbm(dir * 18.0);

                    vec3 abyssBlue = vec3(0.01, 0.08, 0.28);
                    vec3 orbitalBlue = vec3(0.03, 0.24, 0.56);
                    vec3 coastalTeal = vec3(0.08, 0.46, 0.76);

                    float oceanGrad = smoothstep(0.25, 0.55, continent + fineDetail * 0.08);
                    vec3 oceanColor = mix(abyssBlue, orbitalBlue, oceanGrad);
                    oceanColor = mix(oceanColor, coastalTeal, smoothstep(0.49, 0.54, continent));

                    vec3 landColor = mix(vec3(0.06, 0.22, 0.24), vec3(0.16, 0.30, 0.25), fineDetail);
                    float landMask = smoothstep(0.54, 0.57, continent);
                    vec3 surface = mix(oceanColor, landColor, landMask);

                    vec3 warp = vec3(
                        fbm(dir * 4.0),
                        fbm(dir * 4.0 + vec3(5.2, 1.3, 2.8)),
                        fbm(dir * 4.0 + vec3(2.1, 7.4, 4.9))
                    );
                    float cloudBase = fbm(dir * 6.5 + warp * 1.65);
                    float cloudWisps = fbm(dir * 16.0 + warp * 2.2);
                    float clouds = smoothstep(0.50, 0.72, cloudBase) * 0.85 + smoothstep(0.62, 0.82, cloudWisps) * 0.35;
                    clouds = clamp(clouds, 0.0, 1.0);

                    vec3 cloudTint = mix(vec3(0.76, 0.88, 1.0), vec3(1.0, 1.0, 1.0), smoothstep(0.3, 0.9, clouds));
                    surface = mix(surface, cloudTint, clouds * 0.88);

                    float ndotl = dot(vWorldNormal, sunDirection);
                    float light = 0.22 + 0.88 * smoothstep(-0.25, 0.75, ndotl);

                    float viewAngle = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
                    float innerHaze = pow(viewAngle, 2.6);
                    float brightLimb = pow(viewAngle, 5.2);

                    vec3 atmosphereColor = mix(vec3(0.12, 0.48, 0.95), vec3(0.58, 0.86, 1.0), brightLimb);
                    vec3 finalColor = surface * light + atmosphereColor * (innerHaze * 0.55 + brightLimb * 0.95) * (0.4 + 0.6 * smoothstep(-0.3, 0.6, ndotl));

                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `
        });
    }, []);

    const haloMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                sunDirection: { value: new THREE.Vector3(35, 30, -25).normalize() }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPositionNormal;
                varying vec3 vWorldNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
                    vWorldNormal = normalize(mat3(modelMatrix) * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 sunDirection;
                varying vec3 vNormal;
                varying vec3 vPositionNormal;
                varying vec3 vWorldNormal;
                void main() {
                    float viewDot = dot(vNormal, vPositionNormal);
                    float fresnel = pow(clamp(1.0 + viewDot, 0.0, 1.0), 4.2);
                    float sunSide = smoothstep(-0.3, 0.7, dot(vWorldNormal, sunDirection));
                    vec3 glow = mix(vec3(0.08, 0.42, 0.95), vec3(0.65, 0.90, 1.0), fresnel);
                    gl_FragColor = vec4(glow, fresnel * (0.35 + 0.65 * sunSide) * 0.9);
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false
        });
    }, []);

    useFrame((_, delta) => {
        if (earthRef.current) {
            earthRef.current.rotation.y += delta * 0.012;
        }
    });

    return (
        <group position={[0, -148, -25]} rotation={[-0.28, -1.35, -0.08]}>
            <mesh ref={earthRef} material={earthMaterial}>
                <sphereGeometry args={[140, 128, 128]} />
            </mesh>
            <mesh material={haloMaterial}>
                <sphereGeometry args={[143.5, 96, 96]} />
            </mesh>
        </group>
    );
}

function HolographicZone({ position, rotation = [0, 0, 0], size, name, isCritical, shielding, isSelected, onClick }) {
    const isSafe = isCritical && shielding >= 0.70;
    let zoneColor = "#94a3b8";

    if (isCritical) {
        if (shielding >= 0.70) zoneColor = "#00ff44";
        else if (shielding >= 0.60) zoneColor = "#facc15";
        else if (shielding >= 0.50) zoneColor = "#fb923c";
        else zoneColor = "#ef4444";
    } else if (isSelected) {
        zoneColor = "#38bdf8";
    }

    const currentOpacity = isSafe ? 0.55 : (isSelected ? 0.5 : (isCritical ? 0.35 : 0.2));
    const showLabel = isSelected || isSafe;

    return (
        <group position={position}>
            <mesh
                rotation={rotation}
                onClick={onClick}
                onPointerOver={() => { document.body.style.cursor = "pointer"; }}
                onPointerOut={() => { document.body.style.cursor = "default"; }}
            >
                <cylinderGeometry args={size} />
                <meshBasicMaterial color={zoneColor} transparent opacity={currentOpacity} depthWrite={false} side={2} />
            </mesh>

            {showLabel && (
                <Text
                    position={[0, size[0] + 1.1, 0]}
                    fontSize={0.85}
                    color={isSafe ? "#4ade80" : "#ffffff"}
                    outlineWidth={0.07}
                    outlineColor="#020617"
                    anchorX="center"
                    anchorY="bottom"
                >
                    {isSafe ? `SAFE SHELTER: ${name}` : name}
                </Text>
            )}
        </group>
    );
}

function ARSceneRotator({ globalRotationRef, children }) {
    const groupRef = useRef();
    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y = globalRotationRef.current;
        }
    });
    return <group ref={groupRef}>{children}</group>;
}

// Helper to build a smooth Catmull-Rom / cubic Bezier SVG path from history points
function buildSmoothPath(coords) {
    if (!coords.length) return '';
    if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;
    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
        const p0 = coords[i];
        const p1 = coords[i + 1];
        const midX = (p0.x + p1.x) / 2;
        d += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
}

export default function AuraDashboard({ onBackToHome }) {
    const [isCritical, setIsCritical] = useState(false);
    const { streamStatus, stationMode, atmosphere, oxygenGenerator } = useNasaIssTelemetry();

    // AR States
    const [arEnabled, setArEnabled] = useState(false);
    const [cursor, setCursor] = useState({ x: 0, y: 0, isPinching: false, active: false });

    const globalRotation = useRef(0);
    const speIntensity = useRef(0);
    const lastPinch = useRef({ x: 0, y: 0, active: false });
    const lastClickTime = useRef(0);

    // Orbital & Module States
    const [issPosition, setIssPosition] = useState(null);
    const [selectedModuleId, setSelectedModuleId] = useState('destiny');
    const selectedModule = ISS_MODULES.find(m => m.id === selectedModuleId);

    // Biometrics, EVA & Trend States
    const [evaStatus, setEvaStatus] = useState('NO_EVA');
    const [doseHistory, setDoseHistory] = useState([24.2, 25.6, 23.9, 26.1, 24.8, 25.9, 24.1, 26.4, 25.0, 25.8, 24.6, 25.4]);
    const [biometrics, setBiometrics] = useState({ hr: 74, dose: '25.1', stress: 'NOMINAL' });
    const [dosimeterConnected, setDosimeterConnected] = useState(true);

    // 4-Tier Protection Profile (Dark Glassmorphic HUD Colors)
    const getModuleProtection = (shielding) => {
        const pct = Math.round(shielding * 100);
        if (shielding >= 0.70) {
            return {
                tier: 'SAFE', hr: 84, stress: 'SHIELDED',
                boxClass: 'bg-emerald-950/50 border-emerald-500/40',
                valueClass: 'text-emerald-400',
                alertClass: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200',
                icon: '🛡️', title: 'SAFE SHELTER CONFIRMED:',
                message: `Crew protected inside ${selectedModule.name} (${pct}% shielding). Radiation exposure attenuated; hold position until solar flare subsides.`
            };
        }
        if (shielding >= 0.60) {
            return {
                tier: 'MODERATE', hr: 96, stress: 'MODERATE',
                boxClass: 'bg-amber-950/50 border-amber-500/40',
                valueClass: 'text-amber-300',
                alertClass: 'bg-amber-950/70 border-amber-500/40 text-amber-200',
                icon: '⚠️', title: 'MODERATE SHIELDING (TRANSIT ONLY):',
                message: `${selectedModule.name} (${pct}% shielding) provides partial attenuation. Minimize stay and relocate to Zvezda (Aft) for full protection.`
            };
        }
        if (shielding >= 0.50) {
            return {
                tier: 'CAUTION', hr: 108, stress: 'CAUTION',
                boxClass: 'bg-orange-950/50 border-orange-500/40',
                valueClass: 'text-orange-400',
                alertClass: 'bg-orange-950/70 border-orange-500/40 text-orange-200',
                icon: '☢️', title: 'LOW SHIELDING CAUTION:',
                message: `Elevated radiation penetration in ${selectedModule.name} (${pct}% shielding). Restrict non-essential operations and evacuate to Zvezda (Aft).`
            };
        }
        return {
            tier: 'CRITICAL', hr: 118, stress: 'CRITICAL',
            boxClass: 'bg-red-950/60 border-red-500/50',
            valueClass: 'text-red-400',
            alertClass: 'bg-red-950/80 border-red-500/50 text-red-200',
            icon: '🚨', title: 'CRITICAL EXPOSURE RISK:',
            message: `Minimal shielding in ${selectedModule.name} (${pct}%). Ingest potassium iodide and evacuate to Zvezda (Aft) immediately.`
        };
    };

    const protection = getModuleProtection(selectedModule.shielding);

    // Evaluate ISS Environmental Telemetry Safety Limits
    const isAtmosphereDanger = (() => {
        const temp = Number(atmosphere?.destiny?.temp);
        const o2 = Number(atmosphere?.mean?.o2);
        const co2 = Number(atmosphere?.mean?.co2);
        const n2 = Number(atmosphere?.mean?.n2);

        const tempDanger = !isNaN(temp) && (temp < 18 || temp > 27);
        const o2Danger = !isNaN(o2) && (o2 < 145 || o2 > 175);
        const co2Danger = !isNaN(co2) && co2 > 5.0;
        const n2Danger = !isNaN(n2) && (n2 < 540 || n2 > 620);

        return tempDanger || o2Danger || co2Danger || n2Danger;
    })();

    // Fast 250ms Telemetry & SPE Simulation Loop
    useEffect(() => {
        const interval = setInterval(() => {
            if (isCritical) {
                speIntensity.current = Math.min(speIntensity.current + 0.35, 3.5);
            } else {
                speIntensity.current = Math.max(speIntensity.current - 0.45, 0);
            }

            const speEffect = speIntensity.current * (1 - selectedModule.shielding) * 6.5;
            const orbitalWave = Math.sin(Date.now() / 350) * 1.8;
            const rawAbsorbed = selectedModule.baseDose + speEffect + orbitalWave;
            const noisyAbsorbed = rawAbsorbed * (1 + (Math.random() - 0.5) * 0.25);

            const qualityFactor = 3.1;
            const doseEquivalentRate = noisyAbsorbed * qualityFactor;
            const finalDose = Number(doseEquivalentRate.toFixed(1));

            setDoseHistory((prev) => [...prev.slice(-11), finalDose]);

            setBiometrics({
                hr: isCritical ? protection.hr : (72 + Math.floor(Math.random() * 4)),
                dose: finalDose.toFixed(1),
                stress: isCritical ? protection.stress : 'NOMINAL'
            });
        }, 250);

        return () => clearInterval(interval);
    }, [isCritical, selectedModule, protection]);

    // Fetch Live ISS Coordinates
    useEffect(() => {
        const fetchOrbit = async () => {
            try {
                const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
                const data = await res.json();
                setIssPosition({
                    lat: data.latitude.toFixed(4),
                    lng: data.longitude.toFixed(4),
                    alt: data.altitude.toFixed(1),
                    vel: data.velocity.toFixed(0)
                });
            } catch {
                setIssPosition(null);
            }
        };

        fetchOrbit();
        const interval = setInterval(fetchOrbit, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleHandUpdate = (data) => {
        if (!data.active) {
            setCursor((prev) => ({ ...prev, active: false }));
            lastPinch.current.active = false;
            return;
        }
        setCursor({ x: data.x, y: data.y, isPinching: data.isPinching, active: true });

        if (data.isPinching) {
            if (!lastPinch.current.active) {
                const now = Date.now();
                if (now - lastClickTime.current > 500) {
                    const element = document.elementFromPoint(data.x, data.y);
                    if (element && (element.tagName === 'BUTTON' || element.closest('button'))) {
                        element.click();
                        lastClickTime.current = now;
                    }
                }
            } else {
                const deltaX = data.x - lastPinch.current.x;
                globalRotation.current += deltaX * 0.008;
            }
            lastPinch.current = { x: data.x, y: data.y, active: true };
        } else {
            lastPinch.current.active = false;
        }
    };

    const directives = isCritical ? EVACUATION_PLANS.CRITICAL : EVACUATION_PLANS.NOMINAL;

    const tranquilityTempDisplay =
        atmosphere.tranquility.temp ??
        (!isNaN(Number(atmosphere.destiny.temp))
            ? (Number(atmosphere.destiny.temp) - 0.34).toFixed(2)
            : '—');

    return (
        <div className="h-[100vh] w-[100vw] bg-[#040914] text-slate-100 flex flex-col font-sans overflow-hidden">
            {arEnabled && <HandTracker onHandUpdate={handleHandUpdate} />}

            {/* TOP HEADER (Ivory & ECLSS Telemetry Matrix) */}
            <header className="shrink-0 px-6 py-3.5 border-b border-stone-200/80 bg-[#FFFFF0] flex flex-col gap-3.5 relative z-20">
                <div className="flex flex-wrap justify-between items-center w-full gap-4">
                    {/* Left: Brand Title & Mission Subtitle */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-lg sm:text-xl font-extrabold tracking-wider text-slate-900 leading-none">
                                AURA <span className="text-slate-400 font-light">/</span> EDGE_COMPUTE
                            </h1>
                            <span
                                className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                                    streamStatus === 'NASA_ISSLIVE_ACTIVE'
                                        ? 'bg-emerald-100/90 text-emerald-800'
                                        : 'bg-amber-100/90 text-amber-800'
                                }`}
                            >
                                <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                        streamStatus === 'NASA_ISSLIVE_ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'
                                    }`}
                                ></span>
                                {streamStatus === 'NASA_ISSLIVE_ACTIVE' ? 'NASA ISSLIVE' : 'SYNCING NASA'}
                            </span>
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mt-1.5 font-medium">
                            Autonomous Radiation &amp; Orbital Telemetry Visor • ISS-25544
                        </span>
                    </div>

                    {/* Center: AR Visor Button + Vertical Divider + Station Mode Pill */}
                    <div className="flex items-center gap-3.5">
                        <button
                            onClick={() => setArEnabled(!arEnabled)}
                            className={`px-4 py-2 text-[11px] rounded-xl font-bold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-2 ${
                                arEnabled
                                    ? 'bg-blue-950 border-blue-950 text-[#FFFFF0] shadow-sm'
                                    : 'bg-white border-stone-200/90 text-slate-800 shadow-[0_2px_8px_rgba(15,23,42,0.05)] hover:border-slate-300 hover:bg-slate-50/70'
                            }`}
                        >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
                                <rect x="2.5" y="5" width="15" height="9" rx="2.5" />
                                <path d="M6.5 16.5h7" strokeLinecap="round" />
                                <circle cx="7" cy="9.5" r="1" fill="currentColor" stroke="none" />
                                <circle cx="13" cy="9.5" r="1" fill="currentColor" stroke="none" />
                            </svg>
                            {arEnabled ? 'AR VISOR ACTIVE' : 'ENABLE AR VISOR'}
                        </button>

                        <div className="h-6 w-[1px] bg-stone-200 hidden sm:block"></div>

                        <div className="px-3.5 py-2 rounded-xl bg-white/80 border border-stone-200/80 text-xs font-sans text-slate-500 flex items-center gap-1.5 shadow-[0_1px_4px_rgba(15,23,42,0.03)]">
                            <span>Station Mode:</span>
                            <strong className="text-slate-900 font-bold">{stationMode}</strong>
                            <svg className="w-3.5 h-3.5 text-slate-500 ml-0.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>

                    {/* Right: Back Pill Button + User Profile Avatar */}
                    <div className="flex items-center gap-3">
                        {onBackToHome && (
                            <button
                                onClick={onBackToHome}
                                className="shrink-0 px-4 py-2 bg-[#0f2557] hover:bg-blue-900 rounded-full text-[11px] font-bold uppercase tracking-wider text-white transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                            >
                                <span>←</span> Back to INOVA
                            </button>
                        )}

                        <div className="flex items-center gap-1 cursor-pointer group">
                            <div className="w-8 h-8 rounded-full bg-slate-200/90 border border-stone-300/80 flex items-center justify-center text-[#0f2557] group-hover:bg-slate-300/80 transition-colors">
                                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                </svg>
                            </div>
                            <svg className="w-3 h-3 text-slate-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Full-Width Clean White ECLSS Atmosphere Matrix */}
                <div
                    className={`w-full bg-white rounded-2xl px-6 py-3 text-xs font-mono text-slate-800 tabular-nums border-2 transition-colors ${
                        isAtmosphereDanger
                            ? 'border-red-500 ring-2 ring-red-500/20 shadow-[0_2px_12px_rgba(239,68,68,0.12)]'
                            : 'border-emerald-500 shadow-[0_2px_10px_rgba(16,185,129,0.08)]'
                    }`}
                >
                    <div className="grid grid-cols-5 gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 mb-1.5 items-center">
                        <span className="text-slate-800 flex items-center gap-2">
                            <span
                                className={`w-2 h-2 rounded-full ${
                                    isAtmosphereDanger ? 'bg-red-500 animate-ping' : 'bg-emerald-500'
                                }`}
                            ></span>
                            <span>Atmosphere Telemetry</span>
                            <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                                    isAtmosphereDanger
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-emerald-100/90 text-emerald-700'
                                }`}
                            >
                                {isAtmosphereDanger ? 'DANGER' : 'SAFE'}
                            </span>
                        </span>

                        <span className="flex items-center justify-center gap-1.5 text-slate-600">
                            <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
                                <path d="M10 3v9.5M8 4.5a2 2 0 114 0v6.8a3.5 3.5 0 11-4 0V4.5z" strokeLinecap="round" />
                            </svg>
                            Temp
                        </span>

                        <span className="flex items-center justify-center gap-1.5 text-slate-600">
                            <span className="text-[10px] font-extrabold text-blue-700 tracking-tighter">O₂</span>
                            O₂ Partial Press
                        </span>

                        <span className="flex items-center justify-center gap-1.5 text-slate-600">
                            <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
                                <path d="M6.5 15h7.5a3 3 0 00.4-5.97A4.5 4.5 0 005.7 7.6 3.5 3.5 0 006.5 15z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            CO₂ Partial Press
                        </span>

                        <span className="flex items-center justify-end gap-1.5 text-slate-600">
                            <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
                                <circle cx="10" cy="5.5" r="1.75" />
                                <circle cx="5.5" cy="14" r="1.75" />
                                <circle cx="14.5" cy="14" r="1.75" />
                                <path d="M9.1 7l-2.7 5.3M10.9 7l2.7 5.3M7.25 14h5.5" />
                            </svg>
                            N₂ Partial Press
                        </span>
                    </div>

                    {/* Row 1: Mean */}
                    <div className="grid grid-cols-5 gap-2 py-1 border-b border-slate-50 hover:bg-slate-50/70 transition-colors rounded px-1 -mx-1 items-center">
                        <span className="font-bold text-slate-900">Mean</span>
                        <span className="text-center font-bold text-slate-900">
                            {atmosphere.destiny.temp} <span className="text-slate-400 font-normal text-[10px]">°C</span>
                        </span>
                        <span className="text-center font-bold text-slate-900">
                            {atmosphere.mean.o2} <span className="text-slate-400 font-normal text-[10px]">mmHg</span>
                        </span>
                        <span className="text-center font-bold text-slate-900">
                            {atmosphere.mean.co2} <span className="text-slate-400 font-normal text-[10px]">mmHg</span>
                        </span>
                        <span className="text-right font-bold text-slate-900">
                            {atmosphere.mean.n2} <span className="text-slate-400 font-normal text-[10px]">mmHg</span>
                        </span>
                    </div>

                    {/* Row 2: Destiny */}
                    <div className="grid grid-cols-5 gap-2 py-1 border-b border-slate-50 hover:bg-slate-50/70 transition-colors rounded px-1 -mx-1 items-center">
                        <span className="text-slate-800 font-bold">Destiny</span>
                        <span className="text-center font-bold text-slate-900">
                            {atmosphere.destiny.temp} <span className="text-slate-400 font-normal text-[10px]">°C</span>
                        </span>
                        <span className="text-center font-bold text-slate-900">
                            {atmosphere.destiny.o2} <span className="text-slate-400 font-normal text-[10px]">mmHg</span>
                        </span>
                        <span className="text-center font-bold text-slate-900">
                            {atmosphere.destiny.co2} <span className="text-slate-400 font-normal text-[10px]">mmHg</span>
                        </span>
                        <span className="text-right font-bold text-slate-900">
                            {atmosphere.destiny.n2} <span className="text-slate-400 font-normal text-[10px]">mmHg</span>
                        </span>
                    </div>

                    {/* Row 3: Tranquility */}
                    <div className="grid grid-cols-5 gap-2 py-1 hover:bg-slate-50/70 transition-colors rounded px-1 -mx-1 items-center">
                        <span className="text-slate-800 font-bold">Tranquility</span>
                        <span className="text-center font-bold text-slate-900">
                            {tranquilityTempDisplay} <span className="text-slate-400 font-normal text-[10px]">°C</span>
                        </span>
                        <span className="text-center font-bold text-slate-900">
                            {atmosphere.tranquility.o2} <span className="text-slate-400 font-normal text-[10px]">mmHg</span>
                        </span>
                        <span className="text-center font-bold text-slate-900">
                            {atmosphere.tranquility.co2} <span className="text-slate-400 font-normal text-[10px]">mmHg</span>
                        </span>
                        <span className="text-right font-bold text-slate-900">
                            {atmosphere.tranquility.n2} <span className="text-slate-400 font-normal text-[10px]">mmHg</span>
                        </span>
                    </div>

                    {/* Bottom Strip */}
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center gap-3">
                            <span>
                                Oxygen Generator: <strong className="text-slate-900 font-bold">{oxygenGenerator.rate} mg/s</strong>
                            </span>
                            <span className="text-slate-300">|</span>
                            <span className="flex items-center gap-1.5">
                                State:
                                <span className="px-2 py-0.5 rounded bg-blue-100/80 text-blue-700 font-bold text-[10px] uppercase tracking-wide">
                                    {oxygenGenerator.state}
                                </span>
                            </span>
                        </div>
                        <span className="text-[10px] font-semibold tracking-wider text-slate-400 hidden sm:flex items-center gap-2">
                            SRC: NASA ISSLIVE TELEMETRY
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        </span>
                    </div>
                </div>
            </header>

           {/* FULL-BLEED 3D SPACE VIEWPORT WITH FLOATING TRANSLUCENT GLASS HUD PANELS */}
            <main className="flex-1 relative w-full min-h-0 overflow-hidden bg-[#030711]">
                {/* Full-Screen 3D Canvas */}
                <div className="absolute inset-0 w-full h-full">
                    <Canvas camera={{ position: [18, 16, 42], fov: 44 }}>
                        <Stars radius={120} depth={60} count={6000} factor={4.5} saturation={0.1} fade speed={1} />
                        <RealisticEarth />
                        <Sphere args={[4, 32, 32]} position={[40, 20, -30]}>
                            <meshBasicMaterial color="#fef08a" />
                        </Sphere>

                        <ambientLight intensity={0.85} />
                        <directionalLight position={[40, 20, -30]} intensity={1.6} color="#ffffff" />

                        {isCritical ? (
                            <Sparkles count={2500} scale={[60, 60, 60]} size={12} speed={6} opacity={0.5} color="#fbbf24" noise={1} />
                        ) : (
                            <Sparkles count={450} scale={[60, 60, 60]} size={6} speed={0.4} opacity={0.35} color="#38bdf8" />
                        )}

                        <Suspense fallback={null}>
                            <ARSceneRotator globalRotationRef={globalRotation}>
                                <PhotorealisticISS />
                                {ISS_MODULES.map((mod) => (
                                    <HolographicZone
                                        key={mod.id}
                                        position={mod.position}
                                        rotation={mod.rotation}
                                        size={mod.size}
                                        name={mod.name}
                                        isCritical={isCritical}
                                        shielding={mod.shielding}
                                        isSelected={selectedModuleId === mod.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedModuleId(mod.id);
                                        }}
                                    />
                                ))}
                            </ARSceneRotator>
                        </Suspense>

                        <OrbitControls target={[2, -7, 0]} enablePan enableZoom makeDefault />
                    </Canvas>
                </div>

                {/* Subtle Edge Vignette for Depth & HUD Contrast */}
                <div
                    className="absolute inset-0 pointer-events-none z-10"
                    style={{
                        background: 'radial-gradient(circle at 42% 48%, transparent 52%, rgba(2, 6, 23, 0.68) 100%)'
                    }}
                />

                {/* Minimal Top-Left Orbital Live Feed Pill */}
                <div className="absolute top-5 left-6 z-20 pointer-events-none flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0a162b]/70 backdrop-blur-xl border border-sky-400/25 text-xs font-mono text-slate-200 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"></span>
                    <span className="font-bold tracking-wider text-white">ISS-25544</span>
                    <span className="text-sky-400/50">•</span>
                    <span className="text-[11px] text-sky-300 font-semibold">
                        {isCritical ? 'SIM_SOLAR_FLARE' : 'ORBITAL_LIVE'}
                    </span>
                </div>

                {/* BOTTOM-CENTER FLOATING PILL DOCK: Nominal State & Inject X-Class Flare */}
                <div className="absolute bottom-6 left-1/2 xl:left-[38%] transform -translate-x-1/2 z-20 flex items-center gap-4">
                    <button
                        onClick={() => setIsCritical(false)}
                        className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2.5 backdrop-blur-xl border ${
                            !isCritical
                                ? 'bg-[#0c2d5e]/85 border-sky-400/70 text-white shadow-[0_0_24px_rgba(56,189,248,0.4)]'
                                : 'bg-[#0a162b]/75 border-slate-600/50 text-slate-300 hover:bg-slate-800/80'
                        }`}
                    >
                        <svg className="w-4 h-4 text-sky-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="7" />
                            <circle cx="12" cy="12" r="2" fill="currentColor" />
                            <line x1="12" y1="2" x2="12" y2="5" />
                            <line x1="12" y1="19" x2="12" y2="22" />
                            <line x1="2" y1="12" x2="5" y2="12" />
                            <line x1="19" y1="12" x2="22" y2="12" />
                        </svg>
                        Nominal State
                    </button>

                    <button
                        onClick={() => setIsCritical(true)}
                        className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2.5 backdrop-blur-xl border ${
                            isCritical
                                ? 'bg-red-600/90 border-red-300 text-white shadow-[0_0_28px_rgba(239,68,68,0.85)] animate-pulse'
                                : 'bg-[#5c161e]/85 border-red-500/60 text-red-100 hover:bg-red-900/90 shadow-[0_0_20px_rgba(220,38,38,0.3)]'
                        }`}
                    >
                        <svg className="w-4 h-4 text-red-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="4" fill="currentColor" />
                            <path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" strokeLinecap="round" />
                        </svg>
                        Inject X-Class Flare
                    </button>
                </div>

                {/* RIGHT FLOATING TRANSLUCENT GLASS HUD SIDEBAR */}
                <div
                    style={{ width: '380px', maxWidth: '380px', minWidth: '380px' }}
                    className="absolute top-4 right-4 bottom-4 z-20 flex flex-col gap-3.5 overflow-y-auto overflow-x-hidden pr-1 tabular-nums"
                >
                    {/* 1. SYSTEM STATUS GLASS CARD (shrink-0 prevents vertical squishing) */}
                    <div
                        className={`shrink-0 min-h-[86px] relative overflow-hidden rounded-2xl p-4 backdrop-blur-xl border shadow-[0_8px_32px_rgba(0,0,0,0.45)] transition-colors flex items-center ${
                            isCritical
                                ? 'bg-[#2a0c14]/80 border-red-400/45'
                                : 'bg-[#0a1d2e]/75 border-emerald-400/40'
                        }`}
                    >
                        <svg
                            viewBox="0 0 200 70"
                            preserveAspectRatio="none"
                            className="absolute right-0 top-0 h-full w-44 opacity-45 pointer-events-none"
                        >
                            <defs>
                                <linearGradient id="statusWaveGrad" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor={isCritical ? '#f87171' : '#34d399'} stopOpacity="0.45" />
                                    <stop offset="100%" stopColor={isCritical ? '#dc2626' : '#059669'} stopOpacity="0.05" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M 30 70 C 60 20, 95 65, 130 30 C 155 5, 180 40, 200 12 L 200 70 Z"
                                fill="url(#statusWaveGrad)"
                            />
                            <path
                                d="M 30 70 C 60 20, 95 65, 130 30 C 155 5, 180 40, 200 12"
                                fill="none"
                                stroke={isCritical ? '#f87171' : '#34d399'}
                                strokeWidth="1.5"
                            />
                        </svg>

                        <div className="relative z-10 flex items-center gap-3.5 w-full">
                            <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 shadow-lg ${
                                    isCritical
                                        ? 'bg-red-500/25 border-red-400/50 text-red-300 shadow-red-500/20'
                                        : 'bg-emerald-500/25 border-emerald-400/50 text-emerald-300 shadow-emerald-500/20'
                                }`}
                            >
                                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L4 5.5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5.5L12 2zm-1.2 14.2L7 12.4l1.4-1.4 2.4 2.4 5.2-5.2 1.4 1.4-6.6 6.6z" />
                                </svg>
                            </div>

                            <div>
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                                    System Status
                                </h3>
                                <p className={`text-2xl font-extrabold tracking-wide mt-0.5 leading-tight ${isCritical ? 'text-red-400' : 'text-white'}`}>
                                    {isCritical ? 'CRITICAL_EVACUATE' : 'NOMINAL'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 2. ASTRONAUT BIOMETRICS GLASS CARD (Cumulative Dose Only) */}
                    <div className="shrink-0 bg-[#0a162b]/70 backdrop-blur-xl rounded-2xl border border-sky-400/20 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.45)] w-full">
                        <div className="flex justify-between items-start mb-2.5 gap-2">
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-sky-300" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                    </svg>
                                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
                                        Astronaut Biometrics
                                    </h3>
                                </div>

                                <button
                                    onClick={() => setDosimeterConnected(!dosimeterConnected)}
                                    className={`text-[9px] font-mono px-2.5 py-0.5 rounded-full border uppercase text-left w-max font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                        dosimeterConnected
                                            ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/30'
                                            : 'bg-red-500/25 border-red-400/50 text-red-200 animate-pulse'
                                    }`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full ${dosimeterConnected ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                                    {dosimeterConnected ? 'DOSIMETER CONNECTED' : 'DOSIMETER DISCONNECTED'}
                                </button>
                            </div>

                            <span className="text-[11px] text-slate-200 font-mono font-medium text-right shrink-0 leading-snug">
                                LOC: <strong className="text-white">{selectedModule.name}</strong><br />
                                SHIELD: <strong className="text-sky-300">{Math.round(selectedModule.shielding * 100)}%</strong>
                            </span>
                        </div>

                        <div className="h-[1px] bg-sky-400/15 my-3"></div>

                        <div className={`p-3 rounded-xl border ${isCritical ? protection.boxClass : 'bg-slate-900/40 border-sky-400/15'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                                    <svg className="w-4 h-4 text-amber-300 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                        <circle cx="12" cy="12" r="2.2" />
                                        <path d="M12 2a10 10 0 0 0-8.66 5l4.33 2.5A5 5 0 0 1 12 7V2zm8.66 5A10 10 0 0 0 12 2v5a5 5 0 0 1 4.33 2.5L20.66 7zM12 22a10 10 0 0 0 8.66-5l-4.33-2.5A5 5 0 0 1 12 17v5z" />
                                    </svg>
                                    <span>Cumulative Dose</span>
                                </div>

                                <p className={`text-2xl font-mono font-extrabold tracking-tight ${
                                    !dosimeterConnected ? 'text-slate-500' :
                                    isCritical
                                        ? `${protection.valueClass} ${protection.tier !== 'SAFE' ? 'animate-pulse' : ''}`
                                        : 'text-white'
                                }`}>
                                    {!dosimeterConnected ? 'ERR' : biometrics.dose}{' '}
                                    <span className="text-xs font-semibold text-slate-300">mSv</span>
                                </p>
                            </div>
                        </div>

                        {isCritical && (
                            <div className={`mt-3 p-3 border rounded-xl text-xs leading-relaxed flex items-start gap-2 w-full ${protection.alertClass}`}>
                                <span className="mt-0.5 shrink-0">{protection.icon}</span>
                                <p style={{ whiteSpace: 'normal', wordBreak: 'break-word', minWidth: 0, flex: 1 }}>
                                    <strong>{protection.title}</strong> {protection.message}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* 3. ABSORBED DOSE-RATE TREND */}
                    <div className="shrink-0 bg-[#0a162b]/70 backdrop-blur-xl rounded-2xl border border-sky-400/20 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.45)] w-full">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
                                Absorbed Dose-Rate Trend
                            </h3>
                            <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border ${
                                isCritical
                                    ? 'text-red-300 bg-red-950/70 border-red-400/40'
                                    : 'text-sky-200 bg-sky-500/15 border-sky-400/30'
                            }`}>
                                {biometrics.dose} mSv/h
                            </span>
                        </div>

                        {(() => {
                            const rawMin = Math.min(...doseHistory);
                            const rawMax = Math.max(...doseHistory);
                            const pad = Math.max((rawMax - rawMin) * 0.25, 2.0);
                            const minVal = Math.max(0, rawMin - pad);
                            const maxVal = rawMax + pad;
                            const span = Math.max(maxVal - minVal, 1);

                            const coords = doseHistory.map((val, idx) => {
                                const x = (idx / Math.max(doseHistory.length - 1, 1)) * 200;
                                const y = 44 - ((val - minVal) / span) * 36;
                                return { x, y };
                            });

                            const smoothLine = buildSmoothPath(coords);
                            const areaPath = `${smoothLine} L 200 50 L 0 50 Z`;
                            const lastPoint = coords[coords.length - 1] || { x: 200, y: 24 };
                            const strokeColor = isCritical ? '#f87171' : '#38bdf8';

                            return (
                                <svg viewBox="0 0 200 50" className="w-full h-14 overflow-visible mt-2">
                                    <defs>
                                        <linearGradient id="glassDoseGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
                                            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                                        </linearGradient>
                                        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                                            <feGaussianBlur stdDeviation="2.5" result="blur" />
                                            <feMerge>
                                                <feMergeNode in="blur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>

                                    <path d={areaPath} fill="url(#glassDoseGrad)" />
                                    <path
                                        d={smoothLine}
                                        fill="none"
                                        stroke={strokeColor}
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        filter="url(#neonGlow)"
                                    />

                                    <circle cx={lastPoint.x} cy={lastPoint.y} r="3.5" fill="#ffffff" stroke={strokeColor} strokeWidth="2" />
                                    <circle cx={lastPoint.x} cy={lastPoint.y} r="7.5" fill={strokeColor} opacity="0.3" />
                                </svg>
                            );
                        })()}

                        <div className="flex justify-between text-[10px] font-mono text-slate-300/80 mt-1.5 font-semibold">
                            <span>T-3s</span>
                            <span>AUTO-SCALED LIVE</span>
                        </div>
                    </div>

                    {/* 4. EVA RADIATION GATE GLASS CARD */}
                    <div className="shrink-0 bg-[#0a162b]/70 backdrop-blur-xl rounded-2xl border border-sky-400/20 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.45)] w-full">
                        <div className="flex justify-between items-center mb-3 border-b border-sky-400/15 pb-2">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">EVA Radiation Gate</h3>
                            <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold ${
                                isCritical && evaStatus !== 'NO_EVA'
                                    ? 'bg-red-500/25 border-red-400/50 text-red-200 animate-pulse'
                                    : 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                            }`}>
                                {isCritical && evaStatus !== 'NO_EVA' ? 'ABORT / HOLD EVA' : 'EVA CLEAR'}
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 mb-3 bg-slate-950/60 p-1 rounded-xl border border-sky-400/15">
                            {[
                                { id: 'NO_EVA', label: 'No EVA' },
                                { id: 'SCHEDULED', label: 'Scheduled' },
                                { id: 'ACTIVE', label: 'EVA Active' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setEvaStatus(tab.id)}
                                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                        evaStatus === tab.id
                                            ? 'bg-sky-500/80 text-white shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <p className="text-xs text-slate-300 font-medium leading-relaxed" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                            {isCritical ? (
                                evaStatus === 'ACTIVE'
                                    ? '🚨 URGENT: Unshielded spacewalk exposure. Terminate EVA immediately, ingress airlock, and translate to Zvezda.'
                                    : evaStatus === 'SCHEDULED'
                                        ? '⚠️ HOLD: Solar particle event active. Defer planned EVA until geomagnetic & proton flux return to nominal.'
                                        : '🛡️ Crew inside hull. Keep airlock sealed and remain in Zvezda safe shelter.'
                            ) : (
                                evaStatus === 'ACTIVE'
                                    ? '✅ Nominal GCR environment. External suit dosimetry within NASA operational limits.'
                                    : '✅ Space weather nominal. Airlock and EVA corridor cleared for scheduled operations.'
                            )}
                        </p>
                    </div>

                    {/* 5. ACTIVE DIRECTIVES GLASS CARD */}
                    <div className="shrink-0 w-full mb-2">
                        <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-sky-300/80 mb-2.5 px-1">
                            Active Directives
                        </h3>
                        {directives.map((route, index) => (
                            <div key={index} className="bg-[#0a162b]/70 backdrop-blur-xl rounded-2xl p-4 mb-2.5 border border-sky-400/20 shadow-[0_8px_32px_rgba(0,0,0,0.45)] w-full">
                                <div className="flex justify-between items-start gap-2 mb-1.5">
                                    <h4 className="font-bold text-white text-sm" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{route.module}</h4>
                                    {route.shield_rating && (
                                        <span className="bg-sky-500/15 text-sky-200 border border-sky-400/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0">
                                            Shield: {route.shield_rating}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-200 mb-1" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                    <strong className="text-sky-300">Dispatch:</strong> Move {route.crew_assigned} astronaut(s) here.
                                </p>
                                <p className="text-xs text-slate-400 italic leading-relaxed" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                    Directive: {route.notes}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* High-Visibility Neon Fuchsia AR Cursor */}
            {cursor.active && (
                <div
                    className={`fixed pointer-events-none rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 transition-colors duration-75 ${
                        cursor.isPinching
                            ? 'bg-fuchsia-500/60 border-fuchsia-300 scale-75'
                            : 'border-fuchsia-400 scale-100'
                    }`}
                    style={{
                        zIndex: 99999,
                        left: cursor.x,
                        top: cursor.y,
                        width: '40px',
                        height: '40px',
                        boxShadow: '0 0 20px rgba(232, 121, 249, 0.8)'
                    }}
                >
                    <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-fuchsia-200 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
            )}
        </div>
    );
}