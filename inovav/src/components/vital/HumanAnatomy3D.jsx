import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

// Pre-load verified local 3D assets
useGLTF.preload('/human_anatomy_draco.glb');
useGLTF.preload('/human_heart_realistic_anatomical_model/scene.gltf');
useGLTF.preload('/liver_spleen_pancreas_week_sixteen/scene.gltf');
useGLTF.preload('/sketch_fabulous_and_the_crystal_skull/scene.gltf');

const ANGIOLOGY_CANDIDATE_PATHS = [
  '/angiology/scene.gltf',
  '/anaglogy/scene.gltf',
  '/scene.gltf',
];

// ── ERROR BOUNDARY FOR EXTERNAL GLTF LOADING ───────────────────────────────
class GLTFErrorBoundary extends React.Component {
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

// ── EXTERNAL ANGIOLOGY/SCENE.GLTF MODEL LOADER ─────────────────────────────
function AngiologyExternalGLTF({ url }) {
  const { scene } = useGLTF(url);
  const groupRef = useRef();

  const { clonedScene, modelScale } = useMemo(() => {
    const cloned = scene.clone(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    cloned.position.set(-center.x, -center.y, -center.z);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleFactor = 2.45 / (maxDim || 1.8);

    cloned.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
        child.material.side = THREE.DoubleSide;
      }
    });

    return { clonedScene: cloned, modelScale: scaleFactor };
  }, [scene]);

  useEffect(() => {
    return () => {
      clonedScene.traverse((child) => {
        if (child.isMesh && child.material) {
          if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
          else child.material.dispose();
        }
      });
    };
  }, [clonedScene]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.4) * 0.008;
    }
  });

  return (
    <group ref={groupRef} scale={[modelScale, modelScale, modelScale]}>
      <primitive object={clonedScene} />
    </group>
  );
}

// ── ISOLATED ANGIOLOGY VASCULAR SYSTEM (NO OUTER HUMAN BODY SILHOUETTE) ────
function AngiologyVascularModel() {
  const { scene } = useGLTF('/human_anatomy_draco.glb');
  const groupRef = useRef();
  const heartGlowRef = useRef();

  const { arterialMat, venousMat, heartMat } = useMemo(() => {
    const artery = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#e11d48'),
      emissive: new THREE.Color('#7f1d1d'),
      emissiveIntensity: 0.45,
      roughness: 0.35,
      metalness: 0.15,
      side: THREE.DoubleSide,
    });
    const vein = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2563eb'),
      emissive: new THREE.Color('#0c4a6e'),
      emissiveIntensity: 0.45,
      roughness: 0.38,
      metalness: 0.15,
      side: THREE.DoubleSide,
    });
    const heart = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#ff5a5f'),
      emissive: new THREE.Color('#991b1b'),
      emissiveIntensity: 0.55,
      roughness: 0.3,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    return { arterialMat: artery, venousMat: vein, heartMat: heart };
  }, []);

  useEffect(() => {
    return () => {
      arterialMat.dispose();
      venousMat.dispose();
      heartMat.dispose();
    };
  }, [arterialMat, venousMat, heartMat]);

  const { clonedScene, bodyScale } = useMemo(() => {
    const cloned = scene.clone(true);

    // First filter down to cardiovascular / angiology nodes only
    const hasAncestry = (obj, keyword) => {
      let curr = obj;
      while (curr) {
        if ((curr.name || '').toLowerCase().includes(keyword)) return true;
        curr = curr.parent;
      }
      return false;
    };

    const vascularRegex = /(cardiovascular|heart|aorta|artery|arteries|vein|vena_cava|pulmonary_trunk|jugular|carotid|brachial|femoral|coronary)/i;

    cloned.traverse((child) => {
      if (child.isMesh) {
        const isVascular =
          vascularRegex.test(child.name || '') || hasAncestry(child, 'cardiovascular');
        child.visible = isVascular;

        if (isVascular) {
          const n = (child.name || '').toLowerCase();
          if (n.includes('heart')) {
            child.material = heartMat;
          } else if (n.includes('vein') || n.includes('vena_cava') || n.includes('jugular')) {
            child.material = venousMat;
          } else {
            child.material = arterialMat;
          }
        }
      }
    });

    // Compute bounding box of the full rig to preserve exact anatomical centering
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    cloned.position.set(-center.x, -center.y, -center.z);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleFactor = 2.45 / (maxDim || 1.8);

    return { clonedScene: cloned, bodyScale: scaleFactor };
  }, [scene, arterialMat, venousMat, heartMat]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 1.4) * 0.006;
    }
    if (heartGlowRef.current) {
      const cycle = (t * 1.2) % 1;
      let pulse = 0;
      if (cycle < 0.18) pulse = Math.sin((cycle / 0.18) * Math.PI) * 0.55;
      heartGlowRef.current.intensity = 2.8 + pulse;
    }
  });

  return (
    <group ref={groupRef} scale={[bodyScale, bodyScale, bodyScale]}>
      <primitive object={clonedScene} />
      <pointLight
        ref={heartGlowRef}
        position={[0.04, 0.38, 0.14]}
        color="#FF755F"
        intensity={3.0}
        distance={2.0}
      />
    </group>
  );
}

// ── DYNAMIC ANGIOLOGY STAGE SWITCHER ───────────────────────────────────────
function AngiologyPrimaryStage() {
  const [externalGltfUrl, setExternalGltfUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const probeAngiologyAsset = async () => {
      for (const candidate of ANGIOLOGY_CANDIDATE_PATHS) {
        try {
          const res = await fetch(candidate, { method: 'GET' });
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && !contentType.includes('text/html')) {
            if (!cancelled) setExternalGltfUrl(candidate);
            return;
          }
        } catch {
          // Continue checking next candidate path
        }
      }
    };

    probeAngiologyAsset();
    return () => {
      cancelled = true;
    };
  }, []);

  if (externalGltfUrl) {
    return (
      <GLTFErrorBoundary fallback={<AngiologyVascularModel />}>
        <Suspense fallback={<AngiologyVascularModel />}>
          <AngiologyExternalGLTF url={externalGltfUrl} />
        </Suspense>
      </GLTFErrorBoundary>
    );
  }

  return <AngiologyVascularModel />;
}

// ── ENLARGED BEATING 3D ANATOMICAL HEART (WITH SCIENTIFIC RETICLE RING) ────
function EnlargedHeartOrgan({ visible }) {
  const { scene } = useGLTF('/human_heart_realistic_anatomical_model/scene.gltf');
  const groupRef = useRef();
  const organRef = useRef();

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    const box = new THREE.Box3().setFromObject(c);
    const center = new THREE.Vector3();
    box.getCenter(center);
    c.position.set(-center.x, -center.y, -center.z);
    return c;
  }, [scene]);

  useFrame((state) => {
    if (!organRef.current || !visible) return;
    const t = state.clock.elapsedTime;
    const cycle = (t * (72 / 60)) % 1;

    let pulse = 0;
    if (cycle < 0.16) {
      pulse = Math.sin((cycle / 0.16) * Math.PI) * 0.09;
    } else if (cycle > 0.24 && cycle < 0.42) {
      pulse = Math.sin(((cycle - 0.24) / 0.18) * Math.PI) * 0.045;
    }

    const base = 0.58;
    organRef.current.scale.set(base + pulse, base + pulse * 1.06, base + pulse * 0.94);
    organRef.current.rotation.y = Math.sin(t * 0.4) * 0.12 + 0.15;
  });

  return (
    <group ref={groupRef} position={[-0.15, 0.08, 0.75]} visible={visible}>
      <group ref={organRef}>
        <primitive object={cloned} />
      </group>

      <pointLight position={[0.4, 0.5, 0.6]} color="#FF755F" intensity={3.5} distance={3} />
      <pointLight position={[-0.4, -0.3, -0.3]} color="#ead9b2" intensity={1.6} distance={2.5} />

      <mesh position={[0, 0, -0.05]}>
        <ringGeometry args={[0.56, 0.575, 64]} />
        <meshBasicMaterial color="#ead9b2" transparent opacity={0.48} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, -0.05]}>
        <ringGeometry args={[0.61, 0.618, 64]} />
        <meshBasicMaterial color="#f6eedb" transparent opacity={0.28} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, 0, -0.06]}>
        <planeGeometry args={[1.7, 0.004]} />
        <meshBasicMaterial color="#ead9b2" transparent opacity={0.32} />
      </mesh>
    </group>
  );
}

// ── ENLARGED LIVER / SPLEEN / PANCREAS (METABOLIC / IMMUNE VIEW) ───────────
function EnlargedMetabolicOrgan({ visible }) {
  const { scene } = useGLTF('/liver_spleen_pancreas_week_sixteen/scene.gltf');
  const groupRef = useRef();

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    const box = new THREE.Box3().setFromObject(c);
    const center = new THREE.Vector3();
    box.getCenter(center);
    c.position.set(-center.x, -center.y, -center.z);
    return c;
  }, [scene]);

  useFrame((state) => {
    if (!groupRef.current || !visible) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.25 + 0.1;
  });

  return (
    <group ref={groupRef} position={[-0.15, -0.05, 0.75]} visible={visible} scale={[0.62, 0.62, 0.62]}>
      <primitive object={cloned} />
      <pointLight position={[0.4, 0.4, 0.5]} color="#FF755F" intensity={3.0} distance={3} />
      <pointLight position={[-0.3, -0.2, -0.3]} color="#38BDF8" intensity={1.5} distance={2.5} />
    </group>
  );
}

// ── ENLARGED SKULL / CRANIAL SKELETON (SKELETAL / SLEEP VIEW) ─────────────
function ExternalCrystalSkull() {
  const { scene } = useGLTF('/sketch_fabulous_and_the_crystal_skull/scene.gltf');
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    const box = new THREE.Box3().setFromObject(c);
    const center = new THREE.Vector3();
    box.getCenter(center);
    c.position.set(-center.x, -center.y, -center.z);
    return c;
  }, [scene]);
  return <primitive object={cloned} />;
}

function DracoSkeletalFallback() {
  const { scene } = useGLTF('/human_anatomy_draco.glb');
  const boneMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#dce8f7'),
        emissive: new THREE.Color('#1d3557'),
        emissiveIntensity: 0.35,
        roughness: 0.42,
        metalness: 0.12,
        side: THREE.DoubleSide,
      }),
    []
  );

  useEffect(() => {
    return () => boneMat.dispose();
  }, [boneMat]);

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    const hasAncestry = (obj, keyword) => {
      let curr = obj;
      while (curr) {
        if ((curr.name || '').toLowerCase().includes(keyword)) return true;
        curr = curr.parent;
      }
      return false;
    };
    const skeletalRegex = /(skeletal|skull|cranium|spine|vertebra|rib|sternum|clavicle|pelvis|femur|humerus)/i;
    c.traverse((child) => {
      if (child.isMesh) {
        const isBone = skeletalRegex.test(child.name || '') || hasAncestry(child, 'skeletal');
        child.visible = isBone;
        if (isBone) child.material = boneMat;
      }
    });
    const box = new THREE.Box3().setFromObject(c);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);
    c.position.set(-center.x, -center.y, -center.z);
    const s = 1.65 / (Math.max(size.x, size.y, size.z) || 1.8);
    c.scale.setScalar(s);
    return c;
  }, [scene, boneMat]);

  return <primitive object={cloned} />;
}

function EnlargedSkeletalOrgan({ visible }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current || !visible) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(t * 0.35) * 0.28;
  });

  return (
    <group ref={groupRef} position={[-0.15, 0.25, 0.75]} visible={visible} scale={[0.42, 0.42, 0.42]}>
      <GLTFErrorBoundary fallback={<DracoSkeletalFallback />}>
        <Suspense fallback={<DracoSkeletalFallback />}>
          <ExternalCrystalSkull />
        </Suspense>
      </GLTFErrorBoundary>
      <pointLight position={[0.3, 0.4, 0.5]} color="#E6EDF7" intensity={2.8} distance={3} />
      <pointLight position={[-0.3, -0.2, 0.2]} color="#4E78A8" intensity={1.8} distance={2.5} />
    </group>
  );
}

// ── CINEMATIC CAMERA & ANGIOLOGY REPOSITIONING CONTROLLER ──────────────────
function SceneCameraController({ activeSystem }) {
  const { camera } = useThree();
  const bodyRootRef = useRef();

  useEffect(() => {
    if (activeSystem !== null) {
      gsap.to(camera.position, {
        x: -0.42,
        y: 0.2,
        z: 2.15,
        duration: 1.6,
        ease: 'power3.inOut',
      });
      if (bodyRootRef.current) {
        gsap.to(bodyRootRef.current.position, {
          x: -0.92,
          y: -0.05,
          z: 0,
          duration: 1.6,
          ease: 'power3.inOut',
        });
      }
    } else {
      gsap.to(camera.position, {
        x: 0,
        y: 0.15,
        z: 3.25,
        duration: 1.4,
        ease: 'power3.inOut',
      });
      if (bodyRootRef.current) {
        gsap.to(bodyRootRef.current.position, {
          x: 0,
          y: -0.05,
          z: 0,
          duration: 1.4,
          ease: 'power3.inOut',
        });
      }
    }
  }, [activeSystem, camera]);

  return (
    <>
      <group ref={bodyRootRef} position={[0, -0.05, 0]}>
        <AngiologyPrimaryStage />
      </group>

      <EnlargedHeartOrgan visible={activeSystem === 'cardiovascular'} />
      <EnlargedMetabolicOrgan visible={activeSystem === 'metabolic' || activeSystem === 'immune' || activeSystem === 'nutrition'} />
      <EnlargedSkeletalOrgan visible={activeSystem === 'skeletal' || activeSystem === 'sleep'} />
    </>
  );
}

// ── 3D CANVAS COMPONENT ────────────────────────────────────────────────────
export default function HumanAnatomy3D({ activeSystem }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        pointerEvents: 'auto',
      }}
    >
      <Canvas
        camera={{ position: [0, 0.15, 3.25], fov: 46 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.65} />
        <directionalLight position={[0, 4, 3]} intensity={1.1} color="#E6EDF7" />
        <directionalLight position={[-3, 1, 2]} intensity={0.65} color="#4E78A8" />
        <directionalLight position={[3, -1, -2]} intensity={0.55} color="#00D8FF" />

        <SceneCameraController activeSystem={activeSystem} />

        <OrbitControls
          enableDamping
          dampingFactor={0.06}
          enablePan={false}
          maxPolarAngle={Math.PI / 1.75}
          minPolarAngle={Math.PI / 2.35}
          minDistance={1.6}
          maxDistance={4.2}
        />
      </Canvas>
    </div>
  );
}
