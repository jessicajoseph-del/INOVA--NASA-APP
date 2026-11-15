import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Stitches center, left, and right face snapshots onto a single spherical UV canvas texture
 * so the 3D sphere displays all 3 captured angles seamlessly across its front hemisphere.
 */
async function buildSphericalFaceTexture(faceSnaps, fallbackUrl) {
  const snaps = {
    center: faceSnaps?.center || fallbackUrl || null,
    left: faceSnaps?.left || null,
    right: faceSnaps?.right || null,
  };

  if (!snaps.center && !snaps.left && !snaps.right) return null;

  const W = 1024;
  const H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Deep helmet-interior obsidian ink-blue backdrop for the rear of the sphere
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#040a18');
  bgGrad.addColorStop(0.5, '#07142b');
  bgGrad.addColorStop(1, '#030812');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Subtle biometric grid on rear hemisphere
  ctx.strokeStyle = 'rgba(246, 238, 219, 0.14)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  const drawFeathered = (img, destX, destY, destW, destH) => {
    const off = document.createElement('canvas');
    off.width = destW;
    off.height = destH;
    const octx = off.getContext('2d');

    // Cover-crop source image
    const sAspect = img.width / img.height;
    const dAspect = destW / destH;
    let sx = 0, sy = 0, sw = img.width, sh = img.height;
    if (sAspect > dAspect) {
      sw = img.height * dAspect;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / dAspect;
      sy = (img.height - sh) / 2;
    }
    octx.drawImage(img, sx, sy, sw, sh, 0, 0, destW, destH);

    // Radial feather mask so angles blend cleanly into each other & the helmet void
    octx.globalCompositeOperation = 'destination-in';
    const rad = octx.createRadialGradient(
      destW / 2,
      destH / 2,
      destW * 0.22,
      destW / 2,
      destH / 2,
      destW * 0.52
    );
    rad.addColorStop(0, 'rgba(0,0,0,1)');
    rad.addColorStop(0.75, 'rgba(0,0,0,0.88)');
    rad.addColorStop(1, 'rgba(0,0,0,0)');
    octx.fillStyle = rad;
    octx.fillRect(0, 0, destW, destH);

    ctx.drawImage(off, destX, destY);
  };

  // In Three.js SphereGeometry, u = 0.5 faces +Z (front) if sphere is rotated -PI/2 around Y.
  // Draw left side (u ~ 0.34), right side (u ~ 0.66), and center (u ~ 0.50) on top.
  const loaded = await Promise.all([
    snaps.left ? loadImage(snaps.left).catch(() => null) : null,
    snaps.right ? loadImage(snaps.right).catch(() => null) : null,
    snaps.center ? loadImage(snaps.center).catch(() => null) : null,
  ]);

  const [leftImg, rightImg, centerImg] = loaded;
  const patchW = 290;
  const patchH = 350;
  const topY = (H - patchH) / 2;

  if (leftImg) drawFeathered(leftImg, W * 0.35 - patchW / 2, topY, patchW, patchH);
  if (rightImg) drawFeathered(rightImg, W * 0.65 - patchW / 2, topY, patchW, patchH);
  if (centerImg) drawFeathered(centerImg, W * 0.5 - patchW / 2, topY, patchW, patchH);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Sculpted 3D Sphere Face Mesh:
 * True 3D spherical head mesh with subtle front-hemisphere facial topography (brow, nose, cheekbones, jaw)
 * wrapped with the user's 3-side captured face texture.
 */
function FaceSphereMesh({
  faceTextureUrl,
  faceSnaps,
  mouseX = 0,
  mouseY = 0,
  mode = 'textured',
}) {
  const groupRef = useRef();
  const [sphereTexture, setSphereTexture] = useState(null);

  useEffect(() => {
    let active = true;
    let currentTex = null;

    buildSphericalFaceTexture(faceSnaps, faceTextureUrl).then((tex) => {
      if (!active) {
        tex?.dispose();
        return;
      }
      currentTex = tex;
      setSphereTexture((prev) => {
        if (prev) prev.dispose();
        return tex;
      });
    });

    return () => {
      active = false;
      if (currentTex) currentTex.dispose();
    };
  }, [faceTextureUrl, faceSnaps?.center, faceSnaps?.left, faceSnaps?.right]);

  // Sculpted 3D Sphere Geometry with subtle anatomical facial projection on +Z front
  const geometry = useMemo(() => {
    const geom = new THREE.SphereGeometry(1.06, 56, 56);
    // Rotate UVs by aligning sphere so u=0.5 faces +Z directly
    geom.rotateY(-Math.PI / 2);

    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      // Slight cranial ellipsoid elongation vertically & narrowing laterally
      let nx = x * 0.88;
      let ny = y * 1.06;
      let nz = z * 0.94;

      // Subtle front-face relief only on +Z hemisphere
      if (z > 0.15) {
        const fx = x / 0.85;
        const fy = y / 0.95;

        // Nose bridge & tip
        if (Math.abs(fx) < 0.22 && fy > -0.22 && fy < 0.25) {
          const noseProfile = Math.cos((fx / 0.22) * (Math.PI / 2));
          const noseHeight = Math.max(0, 1 - Math.abs(fy + 0.04) * 3.0);
          nz += noseProfile * noseHeight * 0.13;
        }
        // Subtle eye-socket indentation
        const leftEye = Math.hypot(fx + 0.28, fy - 0.18);
        const rightEye = Math.hypot(fx - 0.28, fy - 0.18);
        if (leftEye < 0.2) nz -= Math.cos((leftEye / 0.2) * (Math.PI / 2)) * 0.06;
        if (rightEye < 0.2) nz -= Math.cos((rightEye / 0.2) * (Math.PI / 2)) * 0.06;

        // Cheekbones
        const leftCheek = Math.hypot(fx + 0.42, fy + 0.02);
        const rightCheek = Math.hypot(fx - 0.42, fy + 0.02);
        if (leftCheek < 0.26) nz += Math.cos((leftCheek / 0.26) * (Math.PI / 2)) * 0.05;
        if (rightCheek < 0.26) nz += Math.cos((rightCheek / 0.26) * (Math.PI / 2)) * 0.05;
      }

      pos.setXYZ(i, nx, ny, nz);
    }

    geom.computeVertexNormals();
    return geom;
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  // Biometric landmark nodes sitting just outside the front sphere contour
  const landmarkPositions = useMemo(() => {
    const pts = [
      [-0.32, 0.5, 0.82], [0, 0.56, 0.88], [0.32, 0.5, 0.82],
      [-0.34, 0.2, 0.92], [-0.22, 0.22, 0.95], [0.22, 0.22, 0.95], [0.34, 0.2, 0.92],
      [0, 0.16, 1.04], [0, -0.02, 1.12], [-0.1, -0.08, 1.03], [0.1, -0.08, 1.03],
      [-0.4, 0.0, 0.92], [0.4, 0.0, 0.92],
      [-0.18, -0.34, 0.94], [0, -0.32, 0.98], [0.18, -0.34, 0.94],
      [0, -0.68, 0.78],
    ];
    return new Float32Array(pts.flat());
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const targetRotY = mouseX * 0.85 + Math.sin(t * 0.55) * 0.08;
    const targetRotX = -mouseY * 0.45 + Math.cos(t * 0.7) * 0.03;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, delta * 5.5);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, delta * 5.5);
  });

  return (
    <group ref={groupRef}>
      {/* Main 3D Face Sphere Mesh */}
      <mesh geometry={geometry}>
        {sphereTexture && mode !== 'wireframe' ? (
          <meshStandardMaterial
            map={sphereTexture}
            roughness={0.38}
            metalness={0.12}
            transparent={mode === 'hologram'}
            opacity={mode === 'hologram' ? 0.84 : 0.98}
            emissive={mode === 'hologram' ? new THREE.Color('#ead9b2') : new THREE.Color('#06132b')}
            emissiveIntensity={mode === 'hologram' ? 0.28 : 0.14}
          />
        ) : (
          <meshStandardMaterial
            color="#ead9b2"
            wireframe={mode === 'wireframe'}
            roughness={0.32}
            metalness={0.65}
            transparent
            opacity={mode === 'wireframe' ? 0.85 : 0.62}
          />
        )}
      </mesh>

      {/* Subtle Biometric Wireframe Lattice Shell */}
      <mesh geometry={geometry} scale={[1.006, 1.006, 1.006]}>
        <meshBasicMaterial
          color={mode === 'wireframe' ? '#f6eedb' : '#ead9b2'}
          wireframe
          transparent
          opacity={mode === 'wireframe' ? 0.88 : 0.14}
        />
      </mesh>

      {/* Biometric Landmark Nodes */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={landmarkPositions.length / 3}
            array={landmarkPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          color="#f6eedb"
          transparent
          opacity={0.78}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

/**
 * Self-contained 3D Sphere Face Canvas
 */
export default function ThreeDFaceMesh({
  faceTextureUrl,
  faceSnaps,
  mouseX = 0,
  mouseY = 0,
  mode = 'textured', // 'textured' | 'hologram' | 'wireframe'
  style = {},
  showControls = false,
  onModeChange,
}) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', ...style }}>
      <Canvas
        camera={{ position: [0, 0, 2.75], fov: 44 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <ambientLight intensity={mode === 'hologram' ? 0.95 : 0.85} />
        <directionalLight position={[2, 3, 4]} intensity={1.35} color="#f6eedb" />
        <directionalLight position={[-2.5, -1, 2]} intensity={0.65} color="#9fb8de" />
        <pointLight position={[0, 0.2, 2.6]} intensity={0.9} color="#ead9b2" distance={7} />

        <FaceSphereMesh
          faceTextureUrl={faceTextureUrl}
          faceSnaps={faceSnaps}
          mouseX={mouseX}
          mouseY={mouseY}
          mode={mode}
        />
      </Canvas>

      {showControls && (
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '6px',
            background: 'rgba(6, 19, 43, 0.9)',
            border: '1px solid rgba(246, 238, 219, 0.3)',
            borderRadius: '20px',
            padding: '4px 8px',
            zIndex: 10,
          }}
        >
          {['textured', 'hologram', 'wireframe'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onModeChange && onModeChange(m)}
              style={{
                background: mode === m ? '#f6eedb' : 'transparent',
                border: mode === m ? '1px solid #f6eedb' : 'none',
                color: mode === m ? '#06132b' : '#9fb6da',
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '0.62rem',
                fontFamily: 'monospace',
                fontWeight: mode === m ? 700 : 500,
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {m}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
