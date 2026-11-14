import React, { useRef, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, useGLTF, Stars, Sphere, Sparkles } from '@react-three/drei';
import { useNasaIssTelemetry } from '../hooks/useNasaIssTelemetry';
// Uncomment below once you copy HandTracker.jsx into src/components/
// import HandTracker from '../components/HandTracker';

const ISS_MODULES = [
    { id: "zvezda", name: "Zvezda (Aft)", position: [8, -1, 0], size: [2.5, 2.5, 8, 32], shielding: 0.78, baseDose: 6.0 },
    { id: "node1", name: "Unity Node 1", position: [4, -1, 1.5], size: [2.8, 2.8, 4, 32], shielding: 0.68, baseDose: 7.2 },
    { id: "destiny", name: "US Destiny", position: [0, -1, 3], size: [3.0, 3.0, 10, 32], shielding: 0.60, baseDose: 8.1 },
    { id: "cupola", name: "Cupola", position: [-3, -4, 4], size: [1.5, 1.5, 3, 16], shielding: 0.30, baseDose: 12.0 },
    { id: "kibo", name: "Kibo Module", position: [-5, -1, 6], size: [2.5, 2.5, 8, 32], shielding: 0.54, baseDose: 8.8 },
    { id: "columbus", name: "Columbus", position: [0, -1, -3], size: [2.3, 2.3, 6, 32], shielding: 0.57, baseDose: 8.4 }
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
    // Note: In Vite, public/models/ISS_light.glb is referenced as '/models/ISS_light.glb'
    const { scene } = useGLTF('/models/ISS_light.glb');
    return <primitive object={scene.clone()} scale={[0.5, 0.5, 0.5]} position={[0, -2, 0]} />;
}

function HolographicZone({ position, size, name, isCritical, shielding, isSelected, onClick }) {
    const isSafe = isCritical && shielding >= 0.70;
    let zoneColor = "#94a3b8";

    if (isCritical) {
        if (shielding >= 0.70) zoneColor = "#00ff44";
        else if (shielding >= 0.60) zoneColor = "#facc15";
        else if (shielding >= 0.50) zoneColor = "#fb923c";
        else zoneColor = "#ef4444";
    } else if (isSelected) {
        zoneColor = "#06b6d4";
    }

    const currentOpacity = isSafe ? 0.55 : (isSelected ? 0.5 : (isCritical ? 0.35 : 0.2));
    const showLabel = isSelected || isSafe;

    return (
        <group position={position}>
            <mesh
                onClick={onClick}
                onPointerOver={() => { document.body.style.cursor = "pointer"; }}
                onPointerOut={() => { document.body.style.cursor = "default"; }}
            >
                <cylinderGeometry args={size} />
                <meshBasicMaterial color={zoneColor} transparent opacity={currentOpacity} depthWrite={false} side={2} />
            </mesh>

            {showLabel && (
                <Text
                    position={[0, (size[2] / 2) + 1.2, 0]}
                    fontSize={1.1}
                    color={isSafe ? "#4ade80" : "#ffffff"}
                    outlineWidth={0.08}
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

export default function AuraDashboard({ onBackToHome }) {
    // Local State replaces Inertia backend props
    const [isCritical, setIsCritical] = useState(false);
    const { streamStatus, stationMode, atmosphere, oxygenGenerator } = useNasaIssTelemetry();

    // AR States
    const [arEnabled, setArEnabled] = useState(false);
    const [cursor, setCursor] = useState({ x: 0, y: 0, isPinching: false, active: false });

    const globalRotation = useRef(0);
    const lastPinch = useRef({ x: 0, y: 0, active: false });
    const lastClickTime = useRef(0);

    // Orbital & Module States
    const [issPosition, setIssPosition] = useState(null);
    const [selectedModuleId, setSelectedModuleId] = useState('destiny');
    const selectedModule = ISS_MODULES.find(m => m.id === selectedModuleId);

    // Biometrics, EVA & Trend States
    const [evaStatus, setEvaStatus] = useState('NO_EVA');
    const [doseHistory, setDoseHistory] = useState([8.1, 8.2, 8.0, 8.1, 8.3, 8.1]);
    const [biometrics, setBiometrics] = useState({ hr: 72, dose: '8.1', stress: 'NOMINAL' });

    const getModuleProtection = (shielding) => {
        const pct = Math.round(shielding * 100);
        if (shielding >= 0.70) {
            return {
                tier: 'SAFE',
                badge: 'OPTIMAL SHIELDING',
                hr: 84,
                stress: 'STABILIZING',
                boxClass: 'bg-emerald-950/40 border-emerald-500/50',
                valueClass: 'text-emerald-400',
                alertClass: 'bg-emerald-950/50 border-emerald-500/50 text-emerald-100',
                badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                icon: '🛡️',
                title: 'YOU ARE IN A SAFE BUNKER',
                summary: `${selectedModule.name} (${pct}% attenuation) is blocking peak solar particle flux.`,
                steps: [
                    'Steady breathing: 4s inhale, 6s exhale to lower heart rate.',
                    'Hydrate with onboard water pouches and remain in Zvezda.',
                    'Stand by for Flight Control all-clear telemetry.'
                ]
            };
        }
        if (shielding >= 0.60) {
            return {
                tier: 'MODERATE',
                badge: 'TRANSIT CORRIDOR',
                hr: 96,
                stress: 'ELEVATED',
                boxClass: 'bg-yellow-950/40 border-yellow-500/50',
                valueClass: 'text-yellow-400',
                alertClass: 'bg-yellow-950/50 border-yellow-500/50 text-yellow-100',
                badgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
                icon: '🧭',
                title: 'PARTIAL PROTECTION — KEEP MOVING',
                summary: `${selectedModule.name} (${pct}% attenuation) offers temporary buffer only.`,
                steps: [
                    'Stay calm and translate smoothly aft toward Zvezda.',
                    'Avoid lingering near hatches or unshielded racks.',
                    'Monitor personal dosimeter until green zone entry.'
                ]
            };
        }
        if (shielding >= 0.50) {
            return {
                tier: 'CAUTION',
                badge: 'LOW ATTENUATION',
                hr: 108,
                stress: 'HIGH',
                boxClass: 'bg-orange-950/40 border-orange-500/50',
                valueClass: 'text-orange-400',
                alertClass: 'bg-orange-950/50 border-orange-500/50 text-orange-100',
                badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
                icon: '☢️',
                title: 'EXPOSED LAB — RELOCATE NOW',
                summary: `${selectedModule.name} (${pct}% attenuation) allows elevated particle penetration.`,
                steps: [
                    'Pause non-critical experiments immediately.',
                    'Proceed directly through Unity Node 1 to Zvezda (Aft).',
                    'Take one slow breath before translating.'
                ]
            };
        }
        return {
            tier: 'CRITICAL',
            badge: 'MINIMAL SHIELDING',
            hr: 118,
            stress: 'ACUTE',
            boxClass: 'bg-red-950/50 border-red-500/50',
            valueClass: 'text-red-400',
            alertClass: 'bg-red-950/60 border-red-500/60 text-red-100',
            badgeClass: 'bg-red-500/20 text-red-300 border-red-500/40',
            icon: '🚨',
            title: 'HIGH EXPOSURE — EVACUATE IMMEDIATELY',
            summary: `${selectedModule.name} (${pct}% attenuation) has thin hull glazing with minimal protection.`,
            steps: [
                'Exit Cupola immediately and translate aft toward Zvezda.',
                'Administer potassium iodide (KI) per flight surgeon protocol.',
                'Focus on steady movement — shelter is 15 meters aft.'
            ]
        };
    };

    const protection = getModuleProtection(selectedModule.shielding);

    // Dynamic Biometrics & Rolling Dose-Rate Trend with Sensor Noise
    useEffect(() => {
        const speIntensity = isCritical ? 3.5 : 0;
        const speEffect = speIntensity * (1 - selectedModule.shielding) * 6.5;
        const baseDose = selectedModule.baseDose + speEffect;
        const noisyDose = baseDose * (1 + (Math.random() - 0.5) * 0.10);
        const currentDose = Number(noisyDose.toFixed(1));

        setDoseHistory((prev) => [...prev.slice(-9), currentDose]);

        if (isCritical) {
            setBiometrics({
                hr: protection.hr,
                dose: currentDose.toFixed(1),
                stress: protection.stress
            });
        } else {
            setBiometrics({ hr: 72, dose: currentDose.toFixed(1), stress: 'NOMINAL' });
        }
    }, [isCritical, selectedModule, protection.hr, protection.stress, issPosition]);

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

    return (
        <div className="h-[100vh] w-[100vw] bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
            {/* {arEnabled && <HandTracker onHandUpdate={handleHandUpdate} />} */}

           <header className="shrink-0 px-5 py-3 border-b border-slate-800 bg-slate-950/95 flex flex-wrap xl:flex-nowrap justify-between items-center gap-4 relative z-10">
                {/* Left: Brand & AR Toggle */}
                <div className="shrink-0">
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-xl font-bold tracking-widest text-cyan-400">AURA / EDGE_COMPUTE</h1>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            streamStatus === 'NASA_ISSLIVE_ACTIVE'
                                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                                : 'bg-amber-950/70 border-amber-500/50 text-amber-300'
                        }`}>
                            {streamStatus === 'NASA_ISSLIVE_ACTIVE' ? '● NASA ISSLIVE' : '◌ SYNCING NASA'}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                        <button
                            onClick={() => setArEnabled(!arEnabled)}
                            className={`px-2.5 py-0.5 text-[11px] rounded font-bold uppercase tracking-widest border ${
                                arEnabled ? 'bg-cyan-900 border-cyan-500 text-cyan-300' : 'bg-transparent border-slate-700 text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {arEnabled ? '● AR VISOR ACTIVE' : 'ENABLE AR VISOR'}
                        </button>
                        <span className="text-xs font-mono text-slate-400">
                            Station Mode: <strong className="text-slate-200">{stationMode}</strong>
                        </span>
                    </div>
                </div>

                {/* Center: NASA ECLSS Atmosphere Matrix (Matches iss.telemetry.space) */}
                <div className="flex-1 max-w-4xl bg-slate-900/90 border border-slate-800 rounded-lg px-4 py-2 text-xs font-mono">
                    <div className="grid grid-cols-5 gap-2 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1 mb-1">
                        <span className="text-cyan-400 font-bold">Atmosphere</span>
                        <span className="text-right">Temp</span>
                        <span className="text-right">O₂ Partial Press</span>
                        <span className="text-right">CO₂ Partial Press</span>
                        <span className="text-right">N₂ Partial Press</span>
                    </div>

                    {/* Row 1: Mean */}
                    <div className="grid grid-cols-5 gap-2 py-0.5 text-slate-200 border-b border-slate-800/50">
                        <span className="text-slate-400 font-semibold">Mean</span>
                        <span className="text-right text-slate-600">—</span>
                        <span className="text-right text-cyan-300 font-bold">{atmosphere.mean.o2} <span className="text-slate-500 text-[10px]">mmHg</span></span>
                        <span className="text-right text-amber-300 font-bold">{atmosphere.mean.co2} <span className="text-slate-500 text-[10px]">mmHg</span></span>
                        <span className="text-right text-indigo-300 font-bold">{atmosphere.mean.n2} <span className="text-slate-500 text-[10px]">mmHg</span></span>
                    </div>

                    {/* Row 2: Destiny */}
                    <div className="grid grid-cols-5 gap-2 py-0.5 text-slate-300 border-b border-slate-800/50">
                        <span className="text-slate-400">Destiny</span>
                        <span className="text-right text-emerald-300 font-bold">{atmosphere.destiny.temp} <span className="text-slate-500 text-[10px]">°C</span></span>
                        <span className="text-right">{atmosphere.destiny.o2} <span className="text-slate-500 text-[10px]">mmHg</span></span>
                        <span className="text-right">{atmosphere.destiny.co2} <span className="text-slate-500 text-[10px]">mmHg</span></span>
                        <span className="text-right">{atmosphere.destiny.n2} <span className="text-slate-500 text-[10px]">mmHg</span></span>
                    </div>

                    {/* Row 3: Tranquility */}
                    <div className="grid grid-cols-5 gap-2 py-0.5 text-slate-300">
                        <span className="text-slate-400">Tranquility</span>
                        <span className="text-right text-slate-600">—</span>
                        <span className="text-right">{atmosphere.tranquility.o2} <span className="text-slate-500 text-[10px]">mmHg</span></span>
                        <span className="text-right">{atmosphere.tranquility.co2} <span className="text-slate-500 text-[10px]">mmHg</span></span>
                        <span className="text-right">{atmosphere.tranquility.n2} <span className="text-slate-500 text-[10px]">mmHg</span></span>
                    </div>

                    {/* Bottom Strip: Oxygen Generator */}
                    <div className="mt-1 pt-1 border-t border-slate-800 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-4">
                            <span className="text-slate-400">
                                Oxygen Generator: <strong className="text-slate-200">{oxygenGenerator.rate} mg/s</strong>
                            </span>
                            <span className="text-slate-400">
                                State: <strong className="text-emerald-400 uppercase">{oxygenGenerator.state}</strong>
                            </span>
                        </div>
                        <span className="text-[10px] text-slate-500 hidden sm:inline">SRC: NASA ISSLIVE TELEMETRY</span>
                    </div>
                </div>

                {/* Right: Back Button */}
                {onBackToHome && (
                    <button
                        onClick={onBackToHome}
                        className="shrink-0 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-bold uppercase tracking-wider text-slate-300 transition-colors"
                    >
                        ← Back to INOVA
                    </button>
                )}
            </header>

            <main className="flex-1 flex w-full min-h-0 overflow-hidden relative z-10">
                {/* LEFT: 3D Visualization */}
                <div className="flex-1 min-w-0 relative h-full bg-slate-900 shadow-inner overflow-hidden">
                    <div className="absolute top-6 left-6 z-10 pointer-events-none flex flex-col gap-4">
                        <div>
                            <h2 className="text-xl font-bold">Structural Raycast Analysis</h2>
                            <p className={`mt-2 font-mono ${isCritical ? 'text-red-400' : 'text-slate-400'}`}>
                                Threat Vector: {isCritical ? 'X2.8 Solar Flare' : 'Background GCR'}
                            </p>
                            <p className="mt-1 text-xs font-mono text-cyan-500 uppercase tracking-widest">
                                DATA LINK: {isCritical ? 'LOCAL_SIMULATION' : 'NASA_DONKI_LIVE'}
                            </p>
                        </div>

                        <div className="bg-slate-950/80 p-4 border border-slate-800 rounded backdrop-blur-sm shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 border-b border-slate-800 pb-2">Live Orbital Telemetry</h3>
                            {issPosition ? (
                                <div className="font-mono text-sm text-cyan-400 grid grid-cols-2 gap-x-6 gap-y-2">
                                    <div><span className="text-slate-500 text-xs">LAT</span><br />{issPosition.lat}°</div>
                                    <div><span className="text-slate-500 text-xs">LNG</span><br />{issPosition.lng}°</div>
                                    <div><span className="text-slate-500 text-xs">ALT</span><br />{issPosition.alt} km</div>
                                    <div><span className="text-slate-500 text-xs">VEL</span><br />{issPosition.vel} km/h</div>
                                </div>
                            ) : (
                                <div className="font-mono text-sm text-amber-500 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                    EDGE NODE: TRACKING SUSPENDED
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ergonomic Bottom-Center AR Control Dock */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-4 bg-slate-950/85 backdrop-blur-md px-5 py-3 rounded-xl border border-slate-700/80 shadow-[0_0_25px_rgba(0,0,0,0.8)]">
                        <button
                            onClick={() => setIsCritical(false)}
                            className={`px-6 py-3.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all border ${
                                !isCritical
                                    ? 'bg-cyan-900/80 border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                                    : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:bg-slate-700'
                            }`}
                        >
                            Nominal State
                        </button>

                        <button
                            onClick={() => setIsCritical(true)}
                            className={`px-6 py-3.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all border ${
                                isCritical
                                    ? 'bg-red-600 border-red-400 text-white shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-pulse'
                                    : 'bg-red-950/90 border-red-700 text-red-200 hover:bg-red-900'
                            }`}
                        >
                            Inject X-Class Flare
                        </button>
                    </div>

                    {/* 3D Canvas */}
                    <div className="absolute inset-0 w-full h-full">
                        <Canvas camera={{ position: [20, 20, 45], fov: 45 }}>
                            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                            <Sphere args={[80, 32, 32]} position={[0, -85, -20]}>
                                <meshBasicMaterial color="#0891b2" wireframe transparent opacity={0.15} />
                            </Sphere>
                            <Sphere args={[4, 32, 32]} position={[40, 20, -30]}>
                                <meshBasicMaterial color={isCritical ? "#ef4444" : "#fef08a"} />
                            </Sphere>

                            <ambientLight intensity={isCritical ? 0.3 : 0.8} />
                            <directionalLight position={[40, 20, -30]} intensity={isCritical ? 4.0 : 1.5} color={isCritical ? "#f87171" : "#ffffff"} />

                            {isCritical ? (
                                <Sparkles count={2500} scale={[60, 60, 60]} size={12} speed={6} opacity={0.5} color="#fbbf24" noise={1} />
                            ) : (
                                <Sparkles count={400} scale={[60, 60, 60]} size={6} speed={0.4} opacity={0.3} color="#38bdf8" />
                            )}

                            <Suspense fallback={null}>
                                <ARSceneRotator globalRotationRef={globalRotation}>
                                    <PhotorealisticISS />
                                    {ISS_MODULES.map((mod) => (
                                        <HolographicZone
                                            key={mod.id}
                                            position={mod.position}
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

                            <OrbitControls target={[0, -10, 0]} enablePan enableZoom makeDefault />
                        </Canvas>
                    </div>
                </div>

                {/* RIGHT: Telemetry & Crew Guidance Sidebar */}
                <div
                    style={{ width: '400px', maxWidth: '400px', minWidth: '400px', flexShrink: 0 }}
                    className="h-full border-l border-slate-800 bg-slate-950 p-5 flex flex-col gap-5 overflow-y-auto overflow-x-hidden"
                >
                    <div className={`p-4 rounded border-l-4 ${isCritical ? 'bg-red-950 border-red-500' : 'bg-green-950 border-green-500'}`}>
                        <h3 className="text-sm text-slate-400 uppercase">System Status</h3>
                        <p className={`text-2xl font-bold ${isCritical ? 'text-red-400' : 'text-green-400'}`}>
                            {isCritical ? 'CRITICAL_EVACUATE' : 'NOMINAL'}
                        </p>
                    </div>

                    {/* Astronaut Biometrics & Stress-Relief Guidance */}
                    <div className="bg-slate-900 rounded border border-slate-800 p-4 shadow-inner w-full">
                        <div className="flex justify-between items-end mb-3 border-b border-slate-800 pb-2 gap-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Astronaut Biometrics</h3>
                            <span className="text-xs text-cyan-500 font-mono text-right shrink-0">
                                LOC: {selectedModule.name}<br />
                                SHIELDING: {Math.round(selectedModule.shielding * 100)}%
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className={`p-3 rounded border ${isCritical ? protection.boxClass : 'bg-slate-950 border-slate-800'}`}>
                                <p className="text-xs text-slate-400">Cumulative Dose</p>
                                <p className={`text-xl font-mono font-bold ${
                                    isCritical ? `${protection.valueClass} ${protection.tier !== 'SAFE' ? 'animate-pulse' : ''}` : 'text-cyan-400'
                                }`}>
                                    {biometrics.dose} <span className="text-sm">mSv</span>
                                </p>
                            </div>
                            <div className={`p-3 rounded border ${isCritical ? protection.boxClass : 'bg-slate-950 border-slate-800'}`}>
                                <p className="text-xs text-slate-400">Heart Rate</p>
                                <p className={`text-xl font-mono font-bold ${isCritical ? protection.valueClass : 'text-green-400'}`}>
                                    {biometrics.hr} <span className="text-sm">BPM</span>
                                </p>
                            </div>
                        </div>

                        {isCritical && (
                            <div className={`mt-3 p-3.5 border rounded-lg text-xs leading-relaxed w-full ${protection.alertClass}`}>
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                    <div className="flex items-center gap-2 font-bold tracking-wide">
                                        <span className="text-sm">{protection.icon}</span>
                                        <span style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{protection.title}</span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded border text-[10px] font-mono uppercase shrink-0 ${protection.badgeClass}`}>
                                        {protection.badge}
                                    </span>
                                </div>
                                <p className="opacity-90 mb-2.5" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                    {protection.summary}
                                </p>
                                <div className="border-t border-white/10 pt-2 space-y-1.5">
                                    {protection.steps.map((step, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <span className="font-mono opacity-75 shrink-0">0{i + 1}.</span>
                                            <span style={{ whiteSpace: 'normal', wordBreak: 'break-word', flex: 1 }}>{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Absorbed Dose-Rate Trend */}
                    <div className="bg-slate-900 rounded border border-slate-800 p-4 shadow-inner w-full">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Absorbed Dose-Rate Trend</h3>
                            <span className="text-xs font-mono text-cyan-400">{biometrics.dose} mSv/h</span>
                        </div>
                        <svg viewBox="0 0 200 45" className="w-full h-12 overflow-visible">
                            <polyline
                                fill="none"
                                stroke={isCritical ? '#f59e0b' : '#22d3ee'}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points={doseHistory
                                    .map((val, idx) => {
                                        const x = (idx / Math.max(doseHistory.length - 1, 1)) * 200;
                                        const y = 42 - Math.min(Math.max(((val - 5) / 25) * 38, 2), 40);
                                        return `${x},${y}`;
                                    })
                                    .join(' ')}
                            />
                        </svg>
                        <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                            <span>T-50s</span>
                            <span>LIVE TELEMETRY</span>
                        </div>
                    </div>

                    {/* EVA Radiation Gate */}
                    <div className="bg-slate-900 rounded border border-slate-800 p-4 shadow-inner w-full">
                        <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">EVA Radiation Gate</h3>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                isCritical && evaStatus !== 'NO_EVA'
                                    ? 'bg-red-950 border-red-500 text-red-300 animate-pulse'
                                    : 'bg-slate-800 border-slate-700 text-slate-300'
                            }`}>
                                {isCritical && evaStatus !== 'NO_EVA' ? 'ABORT / HOLD EVA' : 'EVA CLEAR'}
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 mb-3">
                            {[
                                { id: 'NO_EVA', label: 'No EVA' },
                                { id: 'SCHEDULED', label: 'Scheduled' },
                                { id: 'ACTIVE', label: 'EVA Active' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setEvaStatus(tab.id)}
                                    className={`py-1.5 px-2 rounded text-[11px] font-bold border transition-colors ${
                                        evaStatus === tab.id
                                            ? 'bg-cyan-900/60 border-cyan-500 text-cyan-200'
                                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
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

                    {/* Active Directives */}
                    <div className="w-full">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-800 pb-2">Active Directives</h3>
                        {directives.map((route, index) => (
                            <div key={index} className="bg-slate-900 rounded p-4 mb-4 border border-slate-800 w-full">
                                <div className="flex justify-between items-start gap-2 mb-2">
                                    <h4 className="font-bold text-cyan-300" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{route.module}</h4>
                                    {route.shield_rating && <span className="bg-slate-800 text-xs px-2 py-1 rounded shrink-0">Shielding: {route.shield_rating}</span>}
                                </div>
                                <p className="text-sm text-slate-300 mb-2" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}><strong>Dispatch:</strong> Move {route.crew_assigned} astronaut(s) here.</p>
                                <p className="text-xs text-slate-400 italic" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>Directive: {route.notes}</p>
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