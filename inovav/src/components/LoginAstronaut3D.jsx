import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';

function AstronautModelInner({ mouseX = 0, mouseY = 0 }) {
  const group = useRef();
  const { scene, animations } = useGLTF('/animated_astronaut_in_space_suit_loop/scene.gltf');

  const clonedScene = useMemo(() => {
    const c = SkeletonUtils.clone(scene);
    c.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.toneMapped = true;
        if (child.material.name === 'material1') {
          child.material.roughness = 0.15;
          child.material.metalness = 0.85;
        } else {
          child.material.roughness = 0.65;
          child.material.metalness = 0.2;
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
        act.timeScale = 0.6;
      }
    }
  }, [actions, names]);

  // Center and scale astronaut
  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    return 2.5 / (maxDim || 2);
  }, [clonedScene]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      // Zero-G breathing float
      group.current.position.y = -0.3 + Math.sin(t * 1.2) * 0.05;
      group.current.position.x = Math.cos(t * 0.8) * 0.02;

      // Smooth rotation towards mouse cursor + gentle idle sway
      const targetRotY = Math.sin(t * 0.5) * 0.25 + mouseX * 0.45;
      const targetRotX = -mouseY * 0.25;
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotY, delta * 3);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetRotX, delta * 3);
    }
  });

  return (
    <group ref={group} scale={[scale, scale, scale]} position={[0, -0.3, 0]}>
      <primitive object={clonedScene} />
      {/* Dynamic Visor Cyan Glow Point */}
      <pointLight position={[0, 1.2, 0.8]} intensity={1.8} color="#00e5ff" distance={3} />
    </group>
  );
}

useGLTF.preload('/animated_astronaut_in_space_suit_loop/scene.gltf');

export default function LoginAstronaut3D({ mouseX = 0, mouseY = 0, style = {} }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none', ...style }}>
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 5, 4]} intensity={1.8} color="#ffffff" />
        <directionalLight position={[-4, -2, 2]} intensity={1.2} color="#818cf8" />
        <pointLight position={[0, 0, 3]} intensity={1.2} color="#38bdf8" distance={6} />
        <pointLight position={[0, -2, 2]} intensity={0.8} color="#c084fc" distance={5} />

        <AstronautModelInner mouseX={mouseX} mouseY={mouseY} />
      </Canvas>
    </div>
  );
}

