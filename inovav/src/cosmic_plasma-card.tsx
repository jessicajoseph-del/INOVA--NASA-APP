/**
 * Cosmic Plasma — Interactive React Component
 * Based on cosmic_plasma-card.tsx by Shader Studio
 * 
 * Features:
 * - ⚡ 60 FPS WebGL2 procedural rendering
 * - 📐 Container-responsive with ResizeObserver
 * - 🔋 Auto-pauses offscreen (0% CPU/GPU via IntersectionObserver & visibilitychange)
 * - 🌌 Domain-warped plasma field with smooth multi-layer convection dynamics
 * - 🎛️ Interactive mouse reactivity & full background / card modes
 */

import React, { useEffect, useRef } from 'react';

export interface CosmicPlasmaCardProps {
  badge?: string;
  title?: string;
  subtitle?: string;
  cta?: string;
  logoSrc?: string;
  imageSrc?: string;
  colorA?: string;
  colorB?: string;
  colorC?: string;
  speed?: number;
  interactive?: boolean;
  tilt?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const FRAG = `#version 300 es
precision highp float;
precision highp int;
out vec4 fragColor;

// ── Active System Uniforms
uniform float u_time;
uniform vec2  u_resolution;
uniform vec4  u_mouse;
uniform float u_layers;
uniform float u_warp_gain;
uniform float u_flow;
uniform float u_speed;
uniform float u_scale;
uniform float u_rotation;
uniform float u_cx;
uniform float u_cy;
uniform float u_exposure;
uniform float u_hue;
uniform float u_saturation;
uniform float u_brightness;
uniform float u_contrast;
uniform vec3  u_colorA;
uniform vec3  u_colorB;
uniform vec3  u_colorC;

mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
vec2 rot(vec2 p, float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c) * p; }

vec3 hsv2rgb(vec3 c){
  vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 rgb2hsv(vec3 c){
  vec4 K = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

// ═══════ User shader body — evaluates raw scene colour at uv ═══════
vec3 renderScene(vec2 uv){
  uv = rot(u_rotation) * uv;
  uv = uv * u_scale + vec2(u_cx, u_cy);
  float t = u_time * u_speed;
  vec2 q = uv;
  
  // Subtle interactive mouse deflection
  vec2 mouseDelta = u_mouse.xy * 0.45;
  q += mouseDelta * 0.15;

  for (int i = 0; i < 6; i++){
    if (float(i) >= u_layers) break;
    q += u_warp_gain * vec2(sin(q.y * u_flow + t * 0.4), cos(q.x * u_flow - t * 0.4));
  }
  float v = sin(q.x * 2.0 + t * 0.5) + sin(q.y * 2.0 + t * 0.35)
          + sin((q.x + q.y) * 1.5 + t * 0.65) + sin(length(q) * 3.0 - t);
  v *= 0.25;
  vec3 col = mix(u_colorC, u_colorA, smoothstep(-0.5, 0.5, v));
  col = mix(col, u_colorB, smoothstep(0.0, 1.0, v * v));
  col *= 0.75 + 0.45 * v;
  return col;
}

vec3 gradeColor(vec3 c){
  c = (c - 0.5) * u_contrast + 0.5;
  c *= u_brightness;
  float maxVal = max(c.r, max(c.g, c.b));
  vec3 norm = maxVal > 1.0 ? c / maxVal : c;
  vec3 h = rgb2hsv(clamp(norm, 0.0, 1.0));
  h.x = fract(h.x + u_hue);
  h.y = clamp(h.y * u_saturation, 0.0, 2.0);
  vec3 res = hsv2rgb(h);
  return maxVal > 1.0 ? res * maxVal : res;
}

vec3 sampleGraded(vec2 uv){
  vec3 scene = renderScene(uv);
  vec3 col = gradeColor(scene);
  return col;
}

vec3 tonemapACES(vec3 x){
  float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

vec3 applyTonemap(vec3 col){
  return tonemapACES(col * max(u_exposure, 0.01));
}

void main(){
  float uvScale = max(1.0 / u_resolution.y, (16.0 / 9.0) / u_resolution.x);
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) * uvScale;
  vec3 col = sampleGraded(uv);
  col = applyTonemap(col);
  fragColor = vec4(col, 1.0);
}
`;

const VERT = `#version 300 es
layout(location = 0) in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  const n = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function CosmicPlasmaCard({
  badge,
  title,
  subtitle,
  cta,
  logoSrc = '',
  imageSrc = '',
  colorA = '#00D8FF',
  colorB = '#7c5cff',
  colorC = '#050914',
  speed = 0.8,
  interactive = true,
  tilt = false,
  className = '',
  style = {},
  children,
}: CosmicPlasmaCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const gl = canvas.getContext('webgl2', { antialias: false, powerPreference: 'high-performance' });
    if (!gl) return;

    canvas.addEventListener('webglcontextlost', (e) => e.preventDefault(), false);

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('[Cosmic Plasma Shader Error]', gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('[Cosmic Plasma Link Error]', gl.getProgramInfoLog(prog));
      gl.deleteProgram(prog);
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const uniforms: Record<string, any> = {
      u_layers: 3.0,
      u_warp_gain: 0.28,
      u_flow: 1.7,
      u_speed: 1.0,
      u_scale: 1.0,
      u_rotation: 0.0,
      u_cx: 0.0,
      u_cy: 0.0,
      u_exposure: 1.05,
      u_hue: 0.0,
      u_saturation: 1.05,
      u_brightness: 1.0,
      u_contrast: 1.05,
    };

    const locs: Record<string, WebGLUniformLocation | null> = {
      u_time: gl.getUniformLocation(prog, 'u_time'),
      u_resolution: gl.getUniformLocation(prog, 'u_resolution'),
      u_mouse: gl.getUniformLocation(prog, 'u_mouse'),
      u_speed: gl.getUniformLocation(prog, 'u_speed'),
      u_colorA: gl.getUniformLocation(prog, 'u_colorA'),
      u_colorB: gl.getUniformLocation(prog, 'u_colorB'),
      u_colorC: gl.getUniformLocation(prog, 'u_colorC'),
    };

    Object.keys(uniforms).forEach((k) => {
      if (!locs[k]) locs[k] = gl.getUniformLocation(prog, k);
    });

    const upload = (k: string, v: any) => {
      const loc = locs[k];
      if (!loc) return;
      if (Array.isArray(v)) gl.uniform3f(loc, v[0], v[1], v[2]);
      else gl.uniform1f(loc, v);
    };

    Object.keys(uniforms).forEach((k) => upload(k, uniforms[k]));

    // Pre-upload colors
    const rgbA = hexToRgb(colorA);
    const rgbB = hexToRgb(colorB);
    const rgbC = hexToRgb(colorC);
    if (locs.u_colorA) gl.uniform3f(locs.u_colorA, rgbA[0], rgbA[1], rgbA[2]);
    if (locs.u_colorB) gl.uniform3f(locs.u_colorB, rgbB[0], rgbB[1], rgbB[2]);
    if (locs.u_colorC) gl.uniform3f(locs.u_colorC, rgbC[0], rgbC[1], rgbC[2]);

    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 1.5);
    let sizeDirty = true;
    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        sizeDirty = true;
      }
    };
    updateSize();

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateSize) : null;
    if (ro) ro.observe(container);

    let mouse = { x: 0, y: 0, tx: 0, ty: 0, down: 0 };
    const onPointerMove = (e: PointerEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const normX = (e.clientX - rect.left - 0.5 * rect.width) / rect.height;
      const normY = -(e.clientY - rect.top - 0.5 * rect.height) / rect.height;
      mouse.tx = normX;
      mouse.ty = normY;

      if (tilt) {
        const tiltX = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
        const tiltY = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
        container.style.transition = 'transform 0.08s ease-out';
        container.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(1.018, 1.018, 1.018)`;
      }
    };

    const onPointerLeave = () => {
      mouse.tx = 0;
      mouse.ty = 0;
      mouse.down = 0;
      if (tilt) {
        container.style.transition = 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)';
        container.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      }
    };

    const onPointerDown = () => { mouse.down = 1; };
    const onPointerUp = () => { mouse.down = 0; };

    window.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', onPointerLeave);
    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    let isVisible = typeof document !== 'undefined' ? !document.hidden : true;
    let animId = 0;
    let lastT = performance.now();
    let simTime = 0;

    const render = (now: number) => {
      if (!isVisible) {
        animId = 0;
        return;
      }
      const dt = Math.min((now - lastT) * 0.001, 0.1);
      lastT = now;
      simTime += dt * speed;

      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;

      gl.useProgram(prog);
      if (locs.u_time) gl.uniform1f(locs.u_time, simTime);
      if (locs.u_resolution && sizeDirty) {
        gl.uniform2f(locs.u_resolution, canvas.width, canvas.height);
        sizeDirty = false;
      }
      if (locs.u_mouse) gl.uniform4f(locs.u_mouse, mouse.x, mouse.y, mouse.down, 0);
      if (locs.u_speed) gl.uniform1f(locs.u_speed, speed);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      animId = requestAnimationFrame(render);
    };

    const startLoop = () => {
      if (!animId && isVisible) {
        lastT = performance.now();
        animId = requestAnimationFrame(render);
      }
    };

    const stopLoop = () => {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = 0;
      }
    };

    const io = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver((entries) => {
      isVisible = (entries[0]?.isIntersecting ?? true) && !document.hidden;
      if (isVisible) startLoop();
      else stopLoop();
    }, { rootMargin: '100px' }) : null;
    if (io) io.observe(container);

    const onVisibility = () => {
      isVisible = !document.hidden;
      if (isVisible) startLoop();
      else stopLoop();
    };
    document.addEventListener('visibilitychange', onVisibility);

    startLoop();

    return () => {
      stopLoop();
      if (ro) ro.disconnect();
      if (io) io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
    };
  }, [colorA, colorB, colorC, speed, interactive, tilt]);

  const hasCardContent = Boolean(badge || title || subtitle || cta);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: colorC,
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}
      />

      {hasCardContent && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '36px',
            color: '#ffffff',
            zIndex: 2,
          }}
        >
          {badge && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 11px',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.09em',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}
            >
              {badge}
            </span>
          )}
          {title && (
            <h2
              style={{
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: 'clamp(28px, 5vw, 42px)',
                fontWeight: 800,
                letterSpacing: '-0.035em',
                lineHeight: 1.05,
                margin: 0,
                textShadow: '0 4px 30px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.9)',
              }}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              style={{
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: 'clamp(14px, 2vw, 18px)',
                fontWeight: 500,
                opacity: 0.88,
                marginTop: '12px',
                maxWidth: '540px',
                lineHeight: 1.45,
                textShadow: '0 2px 18px rgba(0,0,0,0.85)',
              }}
            >
              {subtitle}
            </p>
          )}
          {cta && (
            <button
              type="button"
              style={{
                pointerEvents: 'auto',
                marginTop: '16px',
                padding: '10px 22px',
                background: '#ffffff',
                color: '#000000',
                border: 'none',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              }}
            >
              {cta}
            </button>
          )}
        </div>
      )}

      {children && (
        <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 1 }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default CosmicPlasmaCard;

