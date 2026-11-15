import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

// Pre-load 3D models for instant, glitch-free transitions
useGLTF.preload('/scene.gltf');
useGLTF.preload('/human_heart_realistic_anatomical_model/scene.gltf');
useGLTF.preload('/liver_spleen_pancreas_week_sixteen/scene.gltf');
useGLTF.preload('/sketch_fabulous_and_the_crystal_skull/scene.gltf');

// ── CUSTOM FRESNEL HOLOGRAPHIC X-RAY SHADER ──────────────────────────────────
const createHolographicMaterial = (baseColor = '#00D8FF', opacity = 0.65) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(baseColor) },
      uOpacity: { value: opacity },
      uFresnelPower: { value: 2.2 },
      uGlowIntensity: { value: 1.8 },
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uFresnelPower;
      uniform float uGlowIntensity;
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), uFresnelPower);
        
        // Subtle scanline pulse
        float scanline = sin(vWorldPosition.y * 35.0 - uTime * 4.0) * 0.08 + 0.92;
        
        vec3 finalColor = uColor * (fresnel * uGlowIntensity + 0.15) * scanline;
        float alpha = clamp(fresnel * 0.85 + 0.12, 0.0, 1.0) * uOpacity;
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
};

// ── INFRARED THERMAL HEAT-MAP SHADER (Inspired by video_1.mp4) ─────────────
const createThermalShaderMaterial = () => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uCoreTemp: { value: 36.8 },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vLocalPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        vLocalPosition = position;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uCoreTemp;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vLocalPosition;

      // Thermal gradient lookup: Blue (32°C) -> Cyan -> Green -> Yellow -> Red -> White (37.5°C)
      vec3 getThermalColor(float t) {
        t = clamp(t, 0.0, 1.0);
        if (t < 0.2) return mix(vec3(0.0, 0.05, 0.45), vec3(0.0, 0.65, 0.9), t / 0.2);
        if (t < 0.4) return mix(vec3(0.0, 0.65, 0.9), vec3(0.0, 0.85, 0.35), (t - 0.2) / 0.2);
        if (t < 0.65) return mix(vec3(0.0, 0.85, 0.35), vec3(0.95, 0.85, 0.1), (t - 0.4) / 0.25);
        if (t < 0.85) return mix(vec3(0.95, 0.85, 0.1), vec3(0.95, 0.2, 0.05), (t - 0.65) / 0.2);
        return mix(vec3(0.95, 0.2, 0.05), vec3(1.0, 1.0, 0.95), (t - 0.85) / 0.15);
      }

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 1.8);

        // Core heat is highest in chest & cranium (Y coords), lower at extremities
        float normY = clamp((vLocalPosition.y + 0.8) / 1.6, 0.0, 1.0);
        float heat = 0.55 + 0.35 * sin(normY * 3.14159) + 0.05 * sin(uTime * 2.0);
        
        vec3 color = getThermalColor(heat);
        // Aura glow on rims
        color += vec3(0.2, 0.0, 0.1) * fresnel * 1.5;

        gl_FragColor = vec4(color, 0.82);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
};

// ── 1. ENLARGED FULL HUMAN BODY (scene.gltf) ─────────────────────────────────
function EnlargedHumanBody({ hoveredZone, selectedSystem, bodyOpacity = 0.65 }) {
  const { scene } = useGLTF('/scene.gltf');
  const groupRef = useRef();

  // Create materials
  const holographicMat = useMemo(() => createHolographicMaterial('#00D8FF', bodyOpacity), []);
  const thermalMat = useMemo(() => createThermalShaderMaterial(), []);

  // Update opacity uniform when bodyOpacity changes
  useEffect(() => {
    if (holographicMat) {
      holographicMat.uniforms.uOpacity.value = bodyOpacity;
    }
  }, [bodyOpacity, holographicMat]);

  // Compute bounding box, center, and normalize scale
  const { clonedScene, bodyScale } = useMemo(() => {
    const cloned = scene.clone(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Center model at origin
    cloned.position.set(-center.x, -center.y, -center.z);

    // Compute target scale so height is prominent (~2.4 units in world space, ~85% of screen)
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleFactor = 2.45 / (maxDim || 1.8);

    // Assign materials
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.material = holographicMat;
      }
    });

    return { clonedScene: cloned, bodyScale: scaleFactor };
  }, [scene, holographicMat]);

  // Apply thermal shader if thermal mode is active
  useEffect(() => {
    if (!clonedScene) return;
    const isThermal = selectedSystem === 'thermal' || hoveredZone === 'thermal';
    const targetMat = isThermal ? thermalMat : holographicMat;
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.material = targetMat;
      }
    });
  }, [selectedSystem, hoveredZone, clonedScene, thermalMat, holographicMat]);

  // Animate shader time & subtle idle breathing sway
  useFrame((state, delta) => {
    if (holographicMat && holographicMat.uniforms) {
      holographicMat.uniforms.uTime.value += delta;
    }
    if (thermalMat && thermalMat.uniforms) {
      thermalMat.uniforms.uTime.value += delta;
    }
    if (groupRef.current) {
      const breath = Math.sin(state.clock.elapsedTime * 1.5) * 0.008;
      groupRef.current.position.y = breath;
    }
  });

  return (
    <group ref={groupRef} scale={[bodyScale, bodyScale, bodyScale]}>
      <primitive object={clonedScene} />
    </group>
  );
}

// ── 2. ANATOMICAL HIT ZONES (HOVER-DRIVEN DISCOMFORT ROUTING) ─────────────────
const ANATOMICAL_ZONES = [
  {
    id: 'cardiovascular',
    name: 'Chest / Heart',
    organLabel: 'Heart & Arteries',
    telemetryDesc: 'Cardiovascular Health (Heart Rate, BP)',
    position: [0, 0.38, 0.12],
    radius: 0.18,
    color: '#00D8FF',
  },
  {
    id: 'metabolic',
    name: 'Abdomen',
    organLabel: 'Liver & Pancreas',
    telemetryDesc: 'Metabolic Health (Blood Sugar, Endocrine)',
    position: [0, 0.08, 0.1],
    radius: 0.22,
    color: '#38BDF8',
  },
  {
    id: 'thermal',
    name: 'Torso / Skin',
    organLabel: 'Skin & Thermal Aura',
    telemetryDesc: 'Thermal Regulation (Core & Skin Temp)',
    position: [0, -0.32, 0.08],
    radius: 0.24,
    color: '#ff6633',
  },
  {
    id: 'circadian',
    name: 'Pineal / Temple',
    organLabel: 'Pineal Gland',
    telemetryDesc: 'Circadian Rhythm & Sleep Entrainment',
    position: [0, 0.72, 0.06],
    radius: 0.11,
    color: '#a855f7',
  },
  {
    id: 'neurological',
    name: 'Upper Cranium',
    organLabel: 'Brain & Cortex',
    telemetryDesc: 'Neurological & Mood Monitoring',
    position: [0, 0.88, 0.04],
    radius: 0.13,
    color: '#00ff88',
  },
];

function AnatomicalHitZones({ hoveredZone, setHoveredZone, onSelectSystem, selectedSystem, setPointerCoords }) {
  return (
    <group>
      {ANATOMICAL_ZONES.map((zone) => {
        const isHovered = hoveredZone === zone.id;
        const isSelected = selectedSystem === zone.id;
        const isVisibleInMode = !selectedSystem || isSelected;

        if (!isVisibleInMode) return null;

        return (
          <mesh
            key={zone.id}
            position={zone.position}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredZone(zone.id);
              setPointerCoords({ x: e.clientX, y: e.clientY });
              document.body.style.cursor = 'pointer';
            }}
            onPointerMove={(e) => {
              setPointerCoords({ x: e.clientX, y: e.clientY });
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              if (hoveredZone === zone.id) setHoveredZone(null);
              document.body.style.cursor = 'auto';
            }}
            onClick={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'auto';
              onSelectSystem(zone.id);
            }}
          >
            <sphereGeometry args={[zone.radius, 20, 20]} />
            <meshBasicMaterial
              color={zone.color}
              transparent
              opacity={isHovered ? 0.42 : isSelected ? 0.25 : 0.0}
              wireframe={isHovered}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ── 3. ENLARGED BEATING 3D HEART (CARDIOVASCULAR VIEW) ────────────────────────
function BeatingHeartModel({ bpm = 72 }) {
  const { scene } = useGLTF('/human_heart_realistic_anatomical_model/scene.gltf');
  const heartRef = useRef();

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    const box = new THREE.Box3().setFromObject(c);
    const center = new THREE.Vector3();
    box.getCenter(center);
    c.position.set(-center.x, -center.y, -center.z);
    return c;
  }, [scene]);

  // Animate realistic 72 BPM lub-dub double pulse beat
  useFrame((state) => {
    if (!heartRef.current) return;
    const time = state.clock.elapsedTime;
    const cycle = (time * (bpm / 60)) % 1; // 0.0 to 1.0

    let pulse = 0;
    // Primary ventricular contraction (lub)
    if (cycle < 0.16) {
      pulse = Math.sin((cycle / 0.16) * Math.PI) * 0.085;
    }
    // Secondary atrial contraction (dub)
    else if (cycle > 0.24 && cycle < 0.42) {
      pulse = Math.sin(((cycle - 0.24) / 0.18) * Math.PI) * 0.045;
    }

    const base = 0.52;
    heartRef.current.scale.set(base + pulse, base + pulse * 1.06, base + pulse * 0.94);
    heartRef.current.rotation.y = Math.sin(time * 0.4) * 0.15 + 0.3;
  });

  return (
    <group ref={heartRef} position={[-0.95, 0.05, 1.4]}>
      <primitive object={cloned} />
      {/* Dynamic arterial blood illumination */}
      <pointLight position={[0.2, 0.3, 0.4]} color="#ff2255" intensity={2.8} distance={3} />
      <pointLight position={[-0.3, -0.2, -0.2]} color="#00D8FF" intensity={1.8} distance={3} />
    </group>
  );
}

// ── 4. ENLARGED LIVER & PANCREAS MODEL (METABOLIC VIEW) ───────────────────────
function LiverPancreasModel() {
  const { scene } = useGLTF('/liver_spleen_pancreas_week_sixteen/scene.gltf');
  const ref = useRef();

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    const box = new THREE.Box3().setFromObject(c);
    const center = new THREE.Vector3();
    box.getCenter(center);
    c.position.set(-center.x, -center.y, -center.z);
    return c;
  }, [scene]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = Math.sin(t * 0.35) * 0.25 - 0.1;
    ref.current.position.y = 0.05 + Math.sin(t * 1.2) * 0.015;
  });

  return (
    <group ref={ref} position={[-0.95, 0.05, 1.4]} scale={[0.42, 0.42, 0.42]}>
      <primitive object={cloned} />
      <pointLight position={[0.5, 0.5, 0.5]} color="#38BDF8" intensity={2.2} distance={3} />
      <pointLight position={[-0.4, -0.3, 0.2]} color="#00ff88" intensity={1.5} distance={3} />
    </group>
  );
}

// ── 5. ENLARGED CEREBRAL CORTEX / SKULL (NEUROLOGICAL & MOOD VIEW) ─────────────
function CranialSkullModel() {
  const { scene } = useGLTF('/sketch_fabulous_and_the_crystal_skull/scene.gltf');
  const ref = useRef();

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    const box = new THREE.Box3().setFromObject(c);
    const center = new THREE.Vector3();
    box.getCenter(center);
    c.position.set(-center.x, -center.y, -center.z);
    return c;
  }, [scene]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.25;
    ref.current.position.y = 0.05 + Math.sin(t * 0.8) * 0.012;
  });

  return (
    <group ref={ref} position={[-0.95, 0.05, 1.4]} scale={[0.22, 0.22, 0.22]}>
      <primitive object={cloned} />
      <pointLight position={[0.4, 0.6, 0.5]} color="#00ff88" intensity={2.5} distance={3} />
      <pointLight position={[-0.5, -0.2, -0.3]} color="#00D8FF" intensity={2.0} distance={3} />
    </group>
  );
}

// ── 6. CAMERA CONTROLLER (GSAP DIVE TRANSITIONS) ─────────────────────────────
function CameraController({ selectedSystem }) {
  const { camera } = useThree();

  useEffect(() => {
    if (selectedSystem) {
      // Dolly camera smoothly toward side-framed organ position
      gsap.to(camera.position, {
        x: -0.42,
        y: 0.12,
        z: 2.1,
        duration: 1.25,
        ease: 'power2.inOut',
      });
    } else {
      // Pull back smoothly to full body overview
      gsap.to(camera.position, {
        x: 0,
        y: 0.08,
        z: 3.5,
        duration: 1.1,
        ease: 'power2.inOut',
      });
    }
  }, [selectedSystem, camera]);

  return null;
}

// ── 7. MAIN ANATOMY SCENE WRAPPER ────────────────────────────────────────────
export default function AnatomyScene({
  selectedSystem,
  onSelectSystem,
  hoveredZone,
  setHoveredZone,
  pointerCoords,
  setPointerCoords,
  bodyOpacity = 0.65,
}) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, 0.08, 3.5], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[3, 5, 4]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-3, 2, 3]} intensity={2.0} color="#00D8FF" />

        <Suspense
          fallback={
            <Html center>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', minWidth: '320px', pointerEvents: 'none' }}>
                <div style={{ width: '42px', height: '42px', border: '2.5px solid #00D8FF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <div className="font-mono" style={{ fontSize: '0.72rem', color: '#00D8FF', letterSpacing: '0.22em', textTransform: 'uppercase', textAlign: 'center' }}>
                  INITIALIZING ANATOMICAL TELEMETRY // 3D MESH SYNC
                </div>
              </div>
            </Html>
          }
        >
          <CameraController selectedSystem={selectedSystem} />

          {/* Full Human Body Overview */}
          <EnlargedHumanBody
            hoveredZone={hoveredZone}
            selectedSystem={selectedSystem}
            bodyOpacity={bodyOpacity}
          />

          {/* Invisible interactive raycast colliders for discomfort hover routing */}
          <AnatomicalHitZones
            hoveredZone={hoveredZone}
            setHoveredZone={setHoveredZone}
            onSelectSystem={onSelectSystem}
            selectedSystem={selectedSystem}
            setPointerCoords={setPointerCoords}
          />

          {/* Side-Framed Enlarged 3D Organs when dive is active */}
          {selectedSystem === 'cardiovascular' && <BeatingHeartModel bpm={72} />}
          {selectedSystem === 'metabolic' && <LiverPancreasModel />}
          {selectedSystem === 'circadian' && <CranialSkullModel />}
          {selectedSystem === 'neurological' && <CranialSkullModel />}
        </Suspense>

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={1.4}
          maxDistance={5.5}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 3}
          rotateSpeed={0.6}
        />
      </Canvas>
    </div>
  );
}

export { ANATOMICAL_ZONES };

