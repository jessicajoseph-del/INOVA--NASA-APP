import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Translucent Fresnel X-Ray Shader for Login Human Anatomy Model
const createAnatomyShader = () => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color('#38bdf8') },      // Electric Cyan
      uRimColor: { value: new THREE.Color('#c084fc') },   // Soft Violet Rim
      uFresnelPower: { value: 2.4 },
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
      uniform vec3 uRimColor;
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
        
        // Animated subtle anatomical longitudinal scanline
        float scanline = sin(vWorldPosition.y * 22.0 - uTime * 2.5) * 0.08 + 0.92;
        vec3 color = mix(uColor, uRimColor, fresnel) * (fresnel * uGlowIntensity + 0.22) * scanline;
        float alpha = clamp(fresnel * 0.88 + 0.16, 0.0, 1.0) * 0.75;
        
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
};

function AnatomyModelInner({ mouseX = 0, mouseY = 0 }) {
  const { scene } = useGLTF('/human_anatomy_draco.glb');
  const groupRef = useRef();
  const heartRef = useRef();

  const shaderMaterial = useMemo(() => createAnatomyShader(), []);

  const { clonedScene, scale } = useMemo(() => {
    const cloned = scene.clone(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    cloned.position.set(-center.x, -center.y, -center.z);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleFactor = 2.35 / (maxDim || 1.8);

    cloned.traverse((child) => {
      if (child.isMesh) {
        child.material = shaderMaterial;
      }
    });

    return { clonedScene: cloned, scale: scaleFactor };
  }, [scene, shaderMaterial]);

  useFrame((state, delta) => {
    if (shaderMaterial?.uniforms) {
      shaderMaterial.uniforms.uTime.value += delta;
    }
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      // Gentle continuous rotation + interactive mouse tracking
      const targetRotY = Math.sin(t * 0.6) * 0.35 + mouseX * 0.5;
      const targetRotX = -mouseY * 0.25;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, delta * 3);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, delta * 3);
      groupRef.current.position.y = Math.sin(t * 1.4) * 0.04;
    }

    if (heartRef.current) {
      // Heartbeat pulse (72 BPM)
      const cycle = (t * 1.2) % 1;
      let pulse = 0;
      if (cycle < 0.2) pulse = Math.sin((cycle / 0.2) * Math.PI) * 0.4;
      heartRef.current.intensity = 2.4 + pulse;
    }
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      <primitive object={clonedScene} />

      {/* Embedded Pulsing Heart in Chest */}
      <pointLight
        ref={heartRef}
        position={[0.04, 0.36, 0.12]}
        color="#ff755f"
        intensity={2.8}
        distance={1.6}
      />
      <mesh position={[0.04, 0.36, 0.12]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#ff755f" transparent opacity={0.8} />
      </mesh>

      {/* Subtle Biometric Core Laser Ring */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.38, 0.42, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export default function LoginAnatomy3D({ mouseX = 0, mouseY = 0, style = {} }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none', ...style }}>
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 3]} intensity={1.4} color="#ffffff" />
        <directionalLight position={[-3, -2, 2]} intensity={0.8} color="#c084fc" />
        <pointLight position={[0, 0, 2.8]} intensity={1.0} color="#38bdf8" distance={6} />

        <AnatomyModelInner mouseX={mouseX} mouseY={mouseY} />
      </Canvas>
    </div>
  );
}

