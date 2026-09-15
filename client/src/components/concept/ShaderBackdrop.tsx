import { useEffect, useRef } from "react";
import { damp, prefersReducedMotion } from "./fx";

/*
 * Tło hero: płynny "jedwab ze złota" liczony na GPU (WebGL, własny shader, zero bibliotek).
 * - domain warping szumu fbm → powoli płynące fałdy światła
 * - światło podąża za kursorem (z opóźnieniem); bez myszy krąży samo
 * - lewa część ciemniejsza, żeby nagłówek był zawsze czytelny
 * - render w obniżonej rozdzielczości (tło jest miękkie), pauza poza ekranem i w tle karty
 * - brak WebGL / ograniczenie ruchu → pod spodem zostaje statyczne tło CSS
 */

const VERTEX = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_light;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;
  mat2 rot = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) {
    value += amp * noise(p);
    p = rot * p;
    amp *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  vec2 m = vec2(u_mouse.x * aspect, u_mouse.y);
  float t = u_time * 0.04;

  vec2 toMouse = p - m;
  float dist = length(toMouse);
  p += toMouse * 0.12 * u_light * exp(-dist * dist * 7.0);

  vec2 q = vec2(fbm(p * 1.3 + vec2(0.0, t)), fbm(p * 1.3 + vec2(5.2, -t)));
  vec2 r = vec2(
    fbm(p * 1.6 + 3.0 * q + vec2(1.7, 9.2) + t * 0.8),
    fbm(p * 1.6 + 3.0 * q + vec2(8.3, 2.8) - t * 0.6)
  );
  float f = fbm(p * 1.1 + 2.4 * r);

  float silk = pow(0.5 + 0.5 * sin(f * 12.0 + r.x * 5.0 - t * 4.0), 4.0);
  float fold = smoothstep(0.25, 0.75, f);
  float glow = exp(-dist * dist * 4.5) * u_light;

  vec3 base = vec3(0.028, 0.026, 0.036);
  vec3 bronze = vec3(0.30, 0.20, 0.075);
  vec3 gold = vec3(0.95, 0.74, 0.40);

  vec3 col = base;
  col += bronze * fold * 0.75;
  col += gold * silk * fold * (0.2 + 0.55 * glow);
  col += gold * glow * 0.07;

  col *= mix(0.28, 1.0, smoothstep(0.05, 0.8, uv.x));
  col *= mix(0.55, 1.0, smoothstep(0.0, 0.45, uv.y));
  float vignette = smoothstep(1.4, 0.3, length((uv - vec2(0.64, 0.56)) * vec2(1.2, 1.0)));
  col *= mix(0.45, 1.0, vignette);

  col += (hash(gl_FragCoord.xy + fract(u_time * 7.0)) - 0.5) * (2.0 / 255.0);
  gl_FragColor = vec4(col, 1.0);
}
`;

const MAX_RENDER_WIDTH = 960;

export function ShaderBackdrop({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn("[ShaderBackdrop]", gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    };

    const vertex = compile(gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uLight = gl.getUniformLocation(program, "u_light");

    const reduced = prefersReducedMotion();
    let width = 0;
    let height = 0;
    let raf = 0;
    let visible = true;
    let lastFrame = performance.now();
    let elapsed = 12;
    let pointerX = 0.72;
    let pointerY = 0.58;
    let pointerActiveAt = -Infinity;
    const mouse = { x: 0.72, y: 0.58, light: 0.5 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const scale = Math.min(1, MAX_RENDER_WIDTH / Math.max(rect.width, 1));
      width = Math.max(1, Math.round(rect.width * scale));
      height = Math.max(1, Math.round(rect.height * scale));
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      if (reduced) draw();
    };

    const draw = () => {
      gl.uniform2f(uRes, width, height);
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uLight, mouse.light);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.dataset.ready = "true";
    };

    const frame = (now: number) => {
      const dt = Math.min(0.064, (now - lastFrame) / 1000);
      lastFrame = now;
      elapsed += dt;

      const pointerFresh = now - pointerActiveAt < 2500;
      const targetX = pointerFresh ? pointerX : 0.68 + Math.sin(elapsed * 0.23) * 0.16;
      const targetY = pointerFresh ? pointerY : 0.56 + Math.cos(elapsed * 0.31) * 0.14;
      mouse.x = damp(mouse.x, targetX, 0.06, dt);
      mouse.y = damp(mouse.y, targetY, 0.06, dt);
      mouse.light = damp(mouse.light, pointerFresh ? 1 : 0.55, 0.04, dt);

      draw();
      raf = visible ? requestAnimationFrame(frame) : 0;
    };

    const start = () => {
      if (reduced || raf || !visible || document.hidden) return;
      lastFrame = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = canvas.getBoundingClientRect();
      if (event.clientY < rect.top || event.clientY > rect.bottom) return;
      pointerX = (event.clientX - rect.left) / rect.width;
      pointerY = 1 - (event.clientY - rect.top) / rect.height;
      pointerActiveAt = performance.now();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    const resizeObserver = new ResizeObserver(resize);
    const onVisibility = () => (document.hidden ? stop() : start());
    const onContextLost = (event: Event) => {
      event.preventDefault();
      stop();
      canvas.dataset.ready = "false";
    };

    resize();
    observer.observe(canvas);
    resizeObserver.observe(canvas);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onContextLost);
    if (reduced) draw();
    else start();

    return () => {
      stop();
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas ref={canvasRef} className={`c-shader ${className}`} aria-hidden="true" />;
}
