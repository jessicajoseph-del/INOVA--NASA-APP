import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Float, OrbitControls } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';

interface AstriAstronautModelProps {
  mouseX: number;
  mouseY: number;
  isThinking: boolean;
  isSpeaking: boolean;
}

function AstronautMesh({ mouseX, mouseY, isThinking, isSpeaking }: AstriAstronautModelProps) {
  const group = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ringInnerRef = useRef<THREE.Mesh>(null);
  const { scene, animations } = useGLTF('/animated_astronaut_in_space_suit_loop/scene.gltf');

  const clonedScene = useMemo(() => {
    const c = SkeletonUtils.clone(scene);
    c.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          (mesh.material as THREE.Material).toneMapped = true;
          if (mesh.material.name === 'material1') {
            // Gold Visor Material
            (mesh.material as THREE.MeshStandardMaterial).roughness = 0.12;
            (mesh.material as THREE.MeshStandardMaterial).metalness = 0.9;
          } else {
            // Space Suit Fabric
            (mesh.material as THREE.MeshStandardMaterial).roughness = 0.65;
            (mesh.material as THREE.MeshStandardMaterial).metalness = 0.25;
          }
        }
      }
    });
    return c;
  }, [scene]);

  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    if (actions && names.length > 0) {
      const act = actions[names[0]];
      if (act) {
        act.reset().fadeIn(0.5).play();
        act.timeScale = 0.55; // Gentle majestic zero-G speed
      }
    }
  }, [actions, names]);

  // Center and scale astronaut
  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    return 2.6 / (maxDim || 2);
  }, [clonedScene]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      // Zero-G breathing float
      group.current.position.y = -0.32 + Math.sin(t * 1.3) * 0.06;
      group.current.position.x = Math.cos(t * 0.9) * 0.025;

      // Smooth head & body tilt towards mouse cursor
      const targetRotY = Math.sin(t * 0.4) * 0.2 + mouseX * 0.45;
      const targetRotX = -mouseY * 0.25;
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotY, delta * 3.5);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetRotX, delta * 3.5);
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += delta * (isThinking ? 2.5 : isSpeaking ? 1.5 : 0.4);
    }
    if (ringInnerRef.current) {
      ringInnerRef.current.rotation.z -= delta * (isThinking ? 3.0 : isSpeaking ? 1.8 : 0.6);
    }
  });

  return (
    <group ref={group} scale={[scale, scale, scale]} position={[0, -0.32, 0]}>
      <primitive object={clonedScene} />

      {/* Dynamic Cyan Visor Glow */}
      <pointLight
        position={[0, 1.25, 0.85]}
        intensity={isThinking ? 3.5 : isSpeaking ? 2.8 : 1.9}
        color={isThinking ? '#38bdf8' : isSpeaking ? '#22d3ee' : '#00e5ff'}
        distance={3.2}
      />

      {/* Golden Suit Rim Light */}
      <pointLight position={[0.8, 1.5, -0.6]} intensity={1.2} color="#fde047" distance={2.5} />

      {/* Holographic Telemetry Rings at the Base of the Astronaut */}
      <group position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh ref={ringRef}>
          <ringGeometry args={[0.9, 0.98, 48]} />
          <meshBasicMaterial
            color={isThinking ? '#38bdf8' : '#06132b'}
            side={THREE.DoubleSide}
            transparent
            opacity={0.7}
          />
        </mesh>
        <mesh ref={ringInnerRef}>
          <ringGeometry args={[0.68, 0.74, 32]} />
          <meshBasicMaterial
            color={isSpeaking ? '#22d3ee' : '#1e3a8a'}
            side={THREE.DoubleSide}
            transparent
            opacity={0.65}
          />
        </mesh>
      </group>
    </group>
  );
}

useGLTF.preload('/animated_astronaut_in_space_suit_loop/scene.gltf');

interface AstriAstronaut3DProps {
  isThinking?: boolean;
  isSpeaking?: boolean;
  mouseX?: number;
  mouseY?: number;
}

export default function AstriAstronaut3D({
  isThinking = false,
  isSpeaking = false,
  mouseX = 0,
  mouseY = 0,
}: AstriAstronaut3DProps) {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing select-none">
      <Canvas
        camera={{ position: [0, 0.3, 3.6], fov: 45 }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Cinematic Studio Space Lighting */}
        <ambientLight intensity={1.4} color="#f6eedb" />
        <directionalLight position={[10, 20, 15]} intensity={2.2} color="#ffffff" />
        <directionalLight position={[-10, 10, -10]} intensity={1.2} color="#93c5fd" />
        <pointLight position={[0, -4, 2]} intensity={0.9} color="#1e3a8a" />

        <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
          <AstronautMesh
            mouseX={mouseX}
            mouseY={mouseY}
            isThinking={isThinking}
            isSpeaking={isSpeaking}
          />
        </Float>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 2.3}
          maxAzimuthAngle={Math.PI / 4}
          minAzimuthAngle={-Math.PI / 4}
        />
      </Canvas>
    </div>
  );
}
