import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Pre-load 3D anatomical models
useGLTF.preload('/scene.gltf');
useGLTF.preload('/human_heart_realistic_anatomical_model/scene.gltf');
useGLTF.preload('/liver_spleen_pancreas_week_sixteen/scene.gltf');
useGLTF.preload('/sketch_fabulous_and_the_crystal_skull/scene.gltf');

// ── HOLOGRAPHIC X-RAY FRESNEL SHADER FOR TRANSLUCENT BODY IN AR ────────────
const createARHologramMaterial = (opacity = 0.45) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color('#00D8FF') },
      uOpacity: { value: opacity },
      uFresnelPower: { value: 2.4 },
      uGlowIntensity: { value: 1.9 },
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
        
        // Dynamic horizontal holographic scanlines
        float scanline = sin(vWorldPosition.y * 40.0 - uTime * 4.5) * 0.07 + 0.93;
        
        vec3 finalColor = uColor * (fresnel * uGlowIntensity + 0.12) * scanline;
        float alpha = clamp(fresnel * 0.82 + 0.08, 0.0, 1.0) * uOpacity;
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
};

// ── BEATING 3D HEART ───────────────────────────────────────────────────────
function BeatingHeart({ bpm = 72 }) {
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

  useFrame((state) => {
    if (!heartRef.current) return;
    const time = state.clock.elapsedTime;
    const cycle = (time * (bpm / 60)) % 1;

    let pulse = 0;
    if (cycle < 0.16) {
      pulse = Math.sin((cycle / 0.16) * Math.PI) * 0.11;
    } else if (cycle > 0.24 && cycle < 0.42) {
      pulse = Math.sin(((cycle - 0.24) / 0.18) * Math.PI) * 0.055;
    }

    const base = 0.28;
    heartRef.current.scale.set(base + pulse, base + pulse * 1.08, base + pulse * 0.92);
    heartRef.current.rotation.y = Math.sin(time * 0.5) * 0.2 + 0.1;
  });

  return (
    <group ref={heartRef} position={[0.04, 0.28, 0.05]}>
      <primitive object={cloned} />
      <pointLight position={[0.1, 0.2, 0.3]} color="#ff2255" intensity={3.5} distance={2.5} />
      <pointLight position={[-0.2, -0.1, -0.2]} color="#00D8FF" intensity={2.0} distance={2} />
    </group>
  );
}

// ── LIVER & PANCREAS MODEL ─────────────────────────────────────────────────
function LiverPancreas() {
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
    const time = state.clock.elapsedTime;
    const metabolicPulse = Math.sin(time * 1.8) * 0.02;
    const base = 0.32;
    ref.current.scale.set(base + metabolicPulse, base + metabolicPulse, base + metabolicPulse);
    ref.current.rotation.y = Math.sin(time * 0.35) * 0.18;
  });

  return (
    <group ref={ref} position={[0.02, 0.06, 0.06]}>
      <primitive object={cloned} />
      <pointLight position={[0.1, 0.2, 0.3]} color="#38BDF8" intensity={3.2} distance={2.5} />
      <pointLight position={[-0.2, 0, -0.2]} color="#00ff88" intensity={2.0} distance={2} />
    </group>
  );
}

// ── SKULL & CRANIAL CORTEX MODEL ───────────────────────────────────────────
function SkullCranial() {
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
    const time = state.clock.elapsedTime;
    const neuralPulse = Math.sin(time * 2.4) * 0.02;
    const base = 0.22;
    ref.current.scale.set(base + neuralPulse, base + neuralPulse, base + neuralPulse);
    ref.current.rotation.y = Math.sin(time * 0.4) * 0.25;
  });

  return (
    <group ref={ref} position={[0, 0.68, 0.03]}>
      <primitive object={cloned} />
      <pointLight position={[0.1, 0.3, 0.3]} color="#a855f7" intensity={3.0} distance={2.5} />
      <pointLight position={[-0.1, -0.2, 0.2]} color="#00D8FF" intensity={2.2} distance={2} />
    </group>
  );
}

// ── MAIN TRANSLUCENT HUMAN ANATOMY OBSERVATORY MODEL FOR AR ────────────────
export function HumanObservatoryModel({ activeOrgan, onSelectOrgan }) {
  const { scene } = useGLTF('/scene.gltf');
  const groupRef = useRef();

  // Create Holographic Material
  const holographicMat = useMemo(() => {
    return createARHologramMaterial(activeOrgan ? 0.22 : 0.48);
  }, [activeOrgan]);

  // Clone and center the human body
  const { clonedScene, bodyScale } = useMemo(() => {
    const cloned = scene.clone(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    cloned.position.set(-center.x, -center.y, -center.z);

    // Normalize scale so human stands ~1.7 meters high
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleFactor = 1.75 / (maxDim || 1.8);

    cloned.traverse((child) => {
      if (child.isMesh) {
        child.material = holographicMat;
      }
    });

    return { clonedScene: cloned, bodyScale: scaleFactor };
  }, [scene, holographicMat]);

  // Update opacity dynamically when activeOrgan changes
  useEffect(() => {
    if (!holographicMat) return;
    holographicMat.uniforms.uOpacity.value = activeOrgan ? 0.2 : 0.48;
  }, [activeOrgan, holographicMat]);

  // Subtle breathing idle sway and shader clock animation
  useFrame((state, delta) => {
    if (holographicMat?.uniforms) {
      holographicMat.uniforms.uTime.value += delta;
    }
    if (groupRef.current) {
      const breath = Math.sin(state.clock.elapsedTime * 1.4) * 0.006;
      groupRef.current.position.y = breath;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Translucent Holographic Human Body (.gltf / .glb) */}
      <group scale={[bodyScale, bodyScale, bodyScale]}>
        <primitive object={clonedScene} />
      </group>

      {/* 2. Interactive Anatomical Touch Zones in AR */}
      <group>
        {/* Heart Tap Zone */}
        <mesh
          position={[0.04, 0.28, 0.08]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectOrgan?.('heart');
          }}
        >
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshBasicMaterial
            color="#ff2255"
            transparent
            opacity={activeOrgan === 'heart' ? 0.35 : 0.08}
            wireframe
          />
        </mesh>

        {/* Liver / Pancreas Tap Zone */}
        <mesh
          position={[0.02, 0.06, 0.08]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectOrgan?.('liver');
          }}
        >
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshBasicMaterial
            color="#38BDF8"
            transparent
            opacity={activeOrgan === 'liver' || activeOrgan === 'pancreas' ? 0.35 : 0.08}
            wireframe
          />
        </mesh>

        {/* Cranial / Brain Tap Zone */}
        <mesh
          position={[0, 0.68, 0.06]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectOrgan?.('brain');
          }}
        >
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial
            color="#a855f7"
            transparent
            opacity={activeOrgan === 'brain' ? 0.35 : 0.08}
            wireframe
          />
        </mesh>
      </group>

      {/* 3. Internal Organs Showcased inside/alongside Body */}
      {(activeOrgan === 'heart' || activeOrgan === 'cardiovascular') && (
        <BeatingHeart bpm={72} />
      )}

      {(activeOrgan === 'liver' || activeOrgan === 'pancreas' || activeOrgan === 'metabolic') && (
        <LiverPancreas />
      )}

      {(activeOrgan === 'brain' || activeOrgan === 'neurological' || activeOrgan === 'circadian') && (
        <SkullCranial />
      )}

      {/* Floating Holographic Ring Anchor Base */}
      <mesh position={[0, -0.88, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.45, 0.58, 36]} />
        <meshBasicMaterial color="#00D8FF" side={THREE.DoubleSide} transparent opacity={0.35} />
      </mesh>
      <mesh position={[0, -0.88, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.25, 36]} />
        <meshBasicMaterial color="#38BDF8" side={THREE.DoubleSide} transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

export default HumanObservatoryModel;

