import React, { useEffect, useRef } from 'react';

const FRAG = `#version 300 es
precision highp float;
precision highp int;
out vec4 fragColor;

uniform float u_time;
uniform vec2  u_resolution;
uniform float u_layers;
uniform float u_warp_gain;
uniform float u_flow;
uniform float u_speed;
uniform float u_scale;
uniform float u_exposure;
uniform float u_brightness;
uniform float u_contrast;
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform vec3 u_colorC;

mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

vec3 hsv2rgb(vec3 c){
  vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 renderScene(vec2 uv){
  uv = rot(0.2) * uv;
  uv = uv * u_scale;
  float t = u_time * u_speed;
  vec2 q = uv;
  for (int i = 0; i < 4; i++){
    if (float(i) >= u_layers) break;
    q += u_warp_gain * vec2(sin(q.y * u_flow + t * 0.3), cos(q.x * u_flow - t * 0.3));
  }
  float v = sin(q.x * 2.0 + t * 0.4) + sin(q.y * 2.0 + t * 0.3)
          + sin((q.x + q.y) * 1.5 + t * 0.5) + sin(length(q) * 2.5 - t * 0.8);
  v *= 0.25;
  vec3 col = mix(u_colorC, u_colorA, smoothstep(-0.5, 0.5, v));
  col = mix(col, u_colorB, smoothstep(0.0, 1.0, v * v));
  col *= 0.7 + 0.45 * v;
  return col;
}

vec3 tonemapACES(vec3 x){
  float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

void main(){
  float uvScale = max(1.0 / u_resolution.y, (16.0 / 9.0) / u_resolution.x);
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) * uvScale;
  vec3 col = renderScene(uv);
  col = (col - 0.5) * u_contrast + 0.5;
  col *= u_brightness;
  col = tonemapACES(col * u_exposure);
  fragColor = vec4(col, 1.0);
}
`;

const VERT = `#version 300 es
layout(location = 0) in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

export default function CosmicPlasmaBackground({
  colorA = '#00a2ff',
  colorB = '#5c24ff',
  colorC = '#030614',
  speed = 0.8,
  opacity = 0.85
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', { antialias: false, powerPreference: 'high-performance' });
    if (!gl) return;

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const locTime = gl.getUniformLocation(prog, 'u_time');
    const locRes = gl.getUniformLocation(prog, 'u_resolution');
    const locLayers = gl.getUniformLocation(prog, 'u_layers');
    const locWarp = gl.getUniformLocation(prog, 'u_warp_gain');
    const locFlow = gl.getUniformLocation(prog, 'u_flow');
    const locSpeed = gl.getUniformLocation(prog, 'u_speed');
    const locScale = gl.getUniformLocation(prog, 'u_scale');
    const locExposure = gl.getUniformLocation(prog, 'u_exposure');
    const locBrightness = gl.getUniformLocation(prog, 'u_brightness');
    const locContrast = gl.getUniformLocation(prog, 'u_contrast');
    const locColA = gl.getUniformLocation(prog, 'u_colorA');
    const locColB = gl.getUniformLocation(prog, 'u_colorB');
    const locColC = gl.getUniformLocation(prog, 'u_colorC');

    gl.uniform1f(locLayers, 3.0);
    gl.uniform1f(locWarp, 0.28);
    gl.uniform1f(locFlow, 1.8);
    gl.uniform1f(locSpeed, speed);
    gl.uniform1f(locScale, 1.0);
    gl.uniform1f(locExposure, 1.15);
    gl.uniform1f(locBrightness, 1.0);
    gl.uniform1f(locContrast, 1.1);

    // Color conversion
    const parseHex = (hex) => {
      const c = hex.replace('#', '');
      const n = parseInt(c, 16);
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
    };

    const cA = parseHex(colorA);
    const cB = parseHex(colorB);
    const cC = parseHex(colorC);
    gl.uniform3f(locColA, cA[0], cA[1], cA[2]);
    gl.uniform3f(locColB, cB[0], cB[1], cB[2]);
    gl.uniform3f(locColC, cC[0], cC[1], cC[2]);

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        gl.uniform2f(locRes, w, h);
      }
    };
    resize();
    window.addEventListener('resize', resize);

    let animId;
    let startT = performance.now();

    const render = (now) => {
      const t = (now - startT) * 0.001;
      gl.uniform1f(locTime, t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [colorA, colorB, colorC, speed]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        opacity: opacity,
        pointerEvents: 'none',
      }}
    />
  );
}

