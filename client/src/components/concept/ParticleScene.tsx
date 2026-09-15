import { useEffect, useRef } from "react";
import { clamp, damp, prefersReducedMotion } from "./fx";

/*
 * Scena WebGL pod całą stroną konceptu (jedno płótno, position: fixed, własne shadery, zero bibliotek).
 *
 * Warstwy:
 * 1. "Jedwab ze złota" – szum fbm z domain warpingiem, liczony w 1/4 rozdzielczości do tekstury
 *    i skalowany (tło jest miękkie, więc to prawie nic nie kosztuje).
 * 2. Kilkadziesiąt tysięcy złotych cząsteczek (addytywnie, z głębią ostrości), które układają się
 *    w kształt zależnie od sekcji na środku ekranu:
 *    - [data-scene="logo"] (hero, CTA) → sygnet DatiVe próbkowany z PNG; obraca się za kursorem,
 *      a kursor rozgarnia cząsteczki w pierścień,
 *    - [data-scene="word"] (koniec strony) → napis "DatiVe" złożony z cząsteczek w miejscu elementu,
 *    - pozostałe sekcje → wirująca galaktyka złotego pyłu: płynie z paralaksą przy przewijaniu,
 *      przy szybkim przewijaniu cząsteczki rozciągają się w smugi, a kursor wkręca pył w wir.
 * 3. Intro: cząsteczki nadlatują z głębi i układają sygnet po zejściu kurtyny.
 *
 * Wydajność: DPR maks. 1,5, automatyczne obniżenie jakości przy słabym GPU, pauza w tle karty.
 * Ograniczenie ruchu: statyczna klatka odświeżana tylko przy przewijaniu.
 * Brak WebGL: .c-root dostaje data-scene="off" i zostaje statyczne tło CSS.
 */

const FOV = (35 * Math.PI) / 180;
const CAM_Z = 3.2;

const FULLSCREEN_VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const SILK_FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_focus;
uniform float u_amount;
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
  vec2 r = vec2(fbm(p * 1.6 + 3.0 * q + vec2(1.7, 9.2) + t * 0.8), fbm(p * 1.6 + 3.0 * q + vec2(8.3, 2.8) - t * 0.6));
  float f = fbm(p * 1.1 + 2.4 * r);

  float silk = pow(0.5 + 0.5 * sin(f * 12.0 + r.x * 5.0 - t * 4.0), 4.0);
  float fold = smoothstep(0.25, 0.75, f);
  float glow = exp(-dist * dist * 4.5) * u_light;
  vec2 fc = vec2(u_focus.x * aspect, u_focus.y);
  float pool = exp(-dot(p - fc, p - fc) * 1.5);

  vec3 bronze = vec3(0.30, 0.20, 0.075);
  vec3 gold = vec3(0.95, 0.74, 0.40);
  float amount = u_amount * (0.3 + 0.7 * pool);

  vec3 col = vec3(0.022, 0.021, 0.03);
  col += bronze * fold * 0.8 * amount;
  col += gold * silk * fold * (0.22 + 0.5 * glow) * amount;
  col += gold * glow * (0.05 * u_amount + 0.035);
  gl_FragColor = vec4(col, 1.0);
}
`;

const COPY_FRAG = `
precision mediump float;
uniform sampler2D u_tex;
uniform vec2 u_res;
uniform float u_time;
void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec3 col = texture2D(u_tex, uv).rgb;
  float vignette = smoothstep(1.2, 0.25, length((uv - 0.5) * vec2(1.3, 1.0)) * 1.35);
  col *= mix(0.55, 1.0, vignette);
  float n = fract(sin(dot(gl_FragCoord.xy + fract(u_time) * 71.0, vec2(12.9898, 78.233))) * 43758.5453);
  col += (n - 0.5) * (3.0 / 255.0);
  gl_FragColor = vec4(col, 1.0);
}
`;

const POINT_VERT = `
attribute vec3 aLogo;
attribute vec3 aWord;
attribute vec3 aDust;
attribute vec4 aRand;
uniform mat4 uProj;
uniform float uTime;
uniform float uForm;
uniform float uWordForm;
uniform float uIntro;
uniform float uScale;
uniform float uWordScale;
uniform float uDim;
uniform float uSize;
uniform float uSpin;
uniform float uDrift;
uniform float uScrollVel;
uniform float uMouseStrength;
uniform vec2 uOffset;
uniform vec2 uWordOffset;
uniform vec2 uDustOffset;
uniform vec2 uMouse;
uniform vec2 uRot;
varying vec3 vColor;
varying float vAlpha;
varying float vBlur;
varying float vStretch;

const float CAM_Z = 3.2;

mat3 rotY(float a) { float c = cos(a); float s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
mat3 rotX(float a) { float c = cos(a); float s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }

float stagger(float value, float seed) {
  float t = clamp((value - seed * 0.3) / 0.7, 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

void main() {
  float phase = aRand.x * 6.2831853;

  vec3 logo = aLogo * uScale;
  logo += vec3(sin(uTime * 0.7 + phase), cos(uTime * 0.6 + phase * 1.7), sin(uTime * 0.5 + phase * 0.6)) * vec3(0.004, 0.004, 0.025);
  logo = rotY(uRot.x) * rotX(uRot.y) * logo;
  logo.xy += uOffset;

  vec3 word = vec3(aWord.xy * uWordScale, aWord.z);
  word += vec3(sin(uTime * 0.8 + phase), cos(uTime * 0.7 + phase * 1.3), sin(uTime * 0.6 + phase)) * vec3(0.003, 0.003, 0.02);
  word = rotY(uRot.x * 0.2) * word;
  word.xy += uWordOffset;

  vec3 dust = rotY(uSpin * (0.55 + aRand.y * 0.9)) * aDust;
  dust = rotX(1.08) * dust;
  dust.y += sin(uTime * 0.25 + phase) * 0.04;
  dust.y = mod(dust.y + uDrift + 3.2, 6.4) - 3.2;
  dust.xy += uDustOffset;

  vec3 chaos = vec3((aRand.x - 0.5) * 9.0, (aRand.y - 0.5) * 6.0, -2.5 - aRand.z * 5.0);

  float logoT = stagger(uForm, aRand.w);
  float wordT = stagger(uWordForm, fract(aRand.w + 0.37));
  float shapeT = max(logoT, wordT);
  vec3 pos = mix(dust, logo, logoT);
  pos = mix(pos, word, wordT);

  float introT = clamp((uIntro - aRand.z * 0.45) / 0.55, 0.0, 1.0);
  introT = 1.0 - pow(1.0 - introT, 3.0);
  pos = mix(chaos, pos, introT);

  vec2 away = pos.xy - uMouse;
  float dist = length(away);
  float push = uMouseStrength * exp(-dist * dist * 30.0) * (0.35 + 0.65 * shapeT);
  pos.xy += away / max(dist, 0.001) * push * 0.16;
  pos.z += push * 0.22;

  float swirl = uMouseStrength * exp(-dist * dist * 2.8) * (1.0 - shapeT);
  float angle = swirl * (1.7 + 0.6 * sin(uTime * 0.9 + phase));
  float ca = cos(angle);
  float sa = sin(angle);
  pos.xy = uMouse + mat2(ca, sa, -sa, ca) * (pos.xy - uMouse);

  pos.y += sin(phase * 3.0 + uTime * 2.0) * uScrollVel * 0.02 * (1.0 - shapeT);

  vec4 view = vec4(pos, 1.0);
  view.z -= CAM_Z;
  gl_Position = uProj * view;

  float depth = max(-view.z, 0.25);
  float blur = clamp(abs(depth - CAM_Z) * 0.8, 0.0, 1.0);
  float stretch = uScrollVel * (1.0 - shapeT);
  vBlur = blur;
  vStretch = stretch;
  float wordSize = mix(1.0, clamp(uWordScale / 1.2, 0.55, 1.0), wordT);
  gl_PointSize = uSize * (1.0 + aRand.y * 2.4) * (1.0 + blur * 3.2) * (1.0 + stretch * 2.2) * wordSize * (CAM_Z / depth);

  float base = 0.35 + 0.65 * aRand.x;
  vAlpha = uDim * base * mix(1.0, 0.14, blur) * mix(0.5, 1.0, shapeT) * mix(0.3, 1.0, introT) * (1.0 + swirl * 2.2);

  vec3 bronze = vec3(0.62, 0.40, 0.15);
  vec3 champagne = vec3(1.0, 0.87, 0.62);
  vColor = mix(bronze, champagne, aRand.y * aRand.y);
  vColor = mix(vColor, vec3(1.0, 0.97, 0.9), clamp(push * 3.5 + swirl * 0.6, 0.0, 1.0));
}
`;

const POINT_FRAG = `
precision mediump float;
varying vec3 vColor;
varying float vAlpha;
varying float vBlur;
varying float vStretch;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float fadeY = 1.0 - smoothstep(0.3, 0.5, abs(c.y));
  c.x *= 1.0 + vStretch * 2.2;
  c.y *= 1.0 - vStretch * 0.55;
  float d = dot(c, c) * 4.0;
  float a = exp(-d * mix(8.0, 3.0, vBlur)) * (1.0 - smoothstep(0.75, 1.0, d)) * vAlpha;
  a *= mix(1.0, fadeY, vStretch) * (1.0 - vStretch * 0.3);
  if (a < 0.002) discard;
  gl_FragColor = vec4(vColor * a, a);
}
`;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function perspective(fovy: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
}

type AlphaShape = { fill: number[]; edge: number[]; minX: number; minY: number; maxX: number; maxY: number };

/** Piksele kształtu (kanał alfa > 50%) co `step` px, z osobną listą pikseli brzegowych i ramką. */
function shapeFromAlpha(alpha: Uint8ClampedArray, width: number, height: number, step: number): AlphaShape {
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < width && y < height && alpha[(y * width + x) * 4 + 3] > 127;
  const shape: AlphaShape = { fill: [], edge: [], minX: width, minY: height, maxX: 0, maxY: 0 };
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (!inside(x, y)) continue;
      shape.fill.push(x, y);
      if (!inside(x - step, y) || !inside(x + step, y) || !inside(x, y - step) || !inside(x, y + step)) shape.edge.push(x, y);
      if (x < shape.minX) shape.minX = x;
      if (y < shape.minY) shape.minY = y;
      if (x > shape.maxX) shape.maxX = x;
      if (y > shape.maxY) shape.maxY = y;
    }
  }
  return shape;
}

/** Losowe punkty w kształcie: 40% na brzegach dla ostrego konturu, reszta w wypełnieniu. */
function scatterInShape(
  shape: AlphaShape,
  count: number,
  random: () => number,
  step: number,
  map: (x: number, y: number) => [number, number],
  depthFill: number,
  depthEdge: number,
) {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const onEdge = shape.edge.length > 0 && random() < 0.4;
    const list = onEdge ? shape.edge : shape.fill;
    const k = Math.floor(random() * (list.length / 2)) * 2;
    const [x, y] = map(list[k] + random() * step, list[k + 1] + random() * step);
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = (random() - 0.5) * (onEdge ? depthEdge : depthFill);
  }
  return out;
}

/** Sygnet z PNG (kształt z kanału alfa), współrzędne w kwadracie [-1, 1]. */
async function sampleMark(src: string, count: number, random: () => number) {
  const image = new Image();
  image.src = src;
  await image.decode();
  const size = 240;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("2d context");
  context.drawImage(image, 0, 0, size, size);
  const shape = shapeFromAlpha(context.getImageData(0, 0, size, size).data, size, size, 1);
  if (!shape.fill.length) throw new Error("empty mark");
  return scatterInShape(shape, count, random, 1, (x, y) => [(x / size) * 2 - 1, -((y / size) * 2 - 1)], 0.22, 0.05);
}

/** Napis w Montserrat 900: x w [-1, 1] na szerokości farby, y przeskalowane proporcjonalnie. */
async function sampleText(text: string, count: number, random: () => number) {
  await Promise.race([
    document.fonts.load('900 300px "Montserrat"').catch(() => undefined),
    new Promise((resolve) => window.setTimeout(resolve, 1500)),
  ]);
  const width = 1800;
  const height = 480;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("2d context");
  context.fillStyle = "#fff";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = '900 360px "Montserrat", sans-serif';
  (context as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = "-20px";
  context.fillText(text, width / 2, height / 2);
  const shape = shapeFromAlpha(context.getImageData(0, 0, width, height).data, width, height, 2);
  if (!shape.fill.length) throw new Error("empty text");
  const inkWidth = Math.max(1, shape.maxX - shape.minX);
  const inkHeight = Math.max(1, shape.maxY - shape.minY);
  const positions = scatterInShape(
    shape,
    count,
    random,
    2,
    (x, y) => [((x - shape.minX) / inkWidth) * 2 - 1, -(((y - shape.minY) / inkHeight) * 2 - 1) * (inkHeight / inkWidth)],
    0.1,
    0.03,
  );
  return { positions, aspect: inkHeight / inkWidth };
}

/** Galaktyka: trzy spiralne ramiona + rzadkie halo, żeby pył wypełniał cały ekran. */
function makeDust(count: number, random: () => number) {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    let x: number;
    let y: number;
    let z: number;
    if (random() < 0.24) {
      const u = random() * 2 - 1;
      const theta = random() * Math.PI * 2;
      const radius = 1.6 + random() * 3.4;
      const s = Math.sqrt(1 - u * u);
      x = radius * s * Math.cos(theta);
      y = radius * u * 0.7;
      z = radius * s * Math.sin(theta);
    } else {
      const arm = Math.floor(random() * 3);
      const radius = Math.pow(random(), 0.55) * 2.7;
      const theta = (arm / 3) * Math.PI * 2 + radius * 1.4 + (random() - 0.5) * 0.6;
      const spread = (random() - 0.5) * (0.12 + radius * 0.12);
      const gauss = (random() + random() + random() - 1.5) / 1.5;
      x = Math.cos(theta) * radius + spread;
      z = Math.sin(theta) * radius + spread;
      y = gauss * 0.12 * (1.25 - radius / 2.7);
    }
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}

function compileProgram(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) throw new Error("shader");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? "compile");
    return shader;
  };
  const program = gl.createProgram();
  if (!program) throw new Error("program");
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "link");
  return program;
}

type Props = {
  /** PNG ze znakiem na przezroczystym tle (kształt brany z kanału alfa). */
  markSrc: string;
  /** false = cząsteczki czekają w głębi (np. pod kurtyną intro), true = nadlatują i składają znak. */
  assemble: boolean;
  /** Napis, w który układają się cząsteczki przy elemencie [data-scene="word"]. */
  word?: string;
};

export function ParticleScene({ markSrc, assemble, word = "DatiVe" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const assembleRef = useRef(assemble);

  useEffect(() => {
    assembleRef.current = assemble;
  }, [assemble]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = canvas?.closest<HTMLElement>(".c-root") ?? null;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    });
    if (!gl) {
      root?.setAttribute("data-scene", "off");
      return;
    }

    let disposed = false;
    let raf = 0;
    const cleanups: (() => void)[] = [];

    const start = async () => {
      const reduced = prefersReducedMotion();
      const small = window.matchMedia("(max-width: 1023px)").matches;
      const count = small ? 18000 : 46000;

      let logoPositions: Float32Array;
      try {
        logoPositions = await sampleMark(markSrc, count, mulberry32(20260915));
      } catch {
        root?.setAttribute("data-scene", "off");
        return;
      }
      if (disposed) return;

      let silkProgram: WebGLProgram;
      let copyProgram: WebGLProgram;
      let pointProgram: WebGLProgram;
      try {
        silkProgram = compileProgram(gl, FULLSCREEN_VERT, SILK_FRAG);
        copyProgram = compileProgram(gl, FULLSCREEN_VERT, COPY_FRAG);
        pointProgram = compileProgram(gl, POINT_VERT, POINT_FRAG);
      } catch (error) {
        console.warn("[ParticleScene]", error);
        root?.setAttribute("data-scene", "off");
        return;
      }

      root?.setAttribute("data-scene", "on");
      document.documentElement.classList.add("c-scene-on");
      cleanups.push(() => document.documentElement.classList.remove("c-scene-on"));

      const random = mulberry32(20260917);
      const dustPositions = makeDust(count, random);
      const randoms = new Float32Array(count * 4);
      for (let i = 0; i < randoms.length; i++) randoms[i] = random();

      const triangle = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, triangle);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

      const makeBuffer = (data: Float32Array) => {
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        return buffer;
      };
      const logoBuffer = makeBuffer(logoPositions);
      /* napis próbkujemy w tle (czeka na font) – do tego czasu bufor trzyma kształt sygnetu */
      const wordBuffer = makeBuffer(logoPositions);
      /* proporcja wysokości do szerokości farby napisu (do ustawienia go nad dolną krawędzią elementu) */
      let wordAspect = 1;
      const dustBuffer = makeBuffer(dustPositions);
      const randBuffer = makeBuffer(randoms);

      void sampleText(word, count, mulberry32(20260916))
        .then(({ positions, aspect }) => {
          if (disposed) return;
          wordAspect = aspect;
          gl.bindBuffer(gl.ARRAY_BUFFER, wordBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        })
        .catch(() => undefined);

      const loc = (program: WebGLProgram, name: string) => gl.getUniformLocation(program, name);
      const silkU = {
        res: loc(silkProgram, "u_res"),
        time: loc(silkProgram, "u_time"),
        focus: loc(silkProgram, "u_focus"),
        amount: loc(silkProgram, "u_amount"),
        mouse: loc(silkProgram, "u_mouse"),
        light: loc(silkProgram, "u_light"),
      };
      const copyU = { tex: loc(copyProgram, "u_tex"), res: loc(copyProgram, "u_res"), time: loc(copyProgram, "u_time") };
      const pointU = {
        proj: loc(pointProgram, "uProj"),
        time: loc(pointProgram, "uTime"),
        form: loc(pointProgram, "uForm"),
        wordForm: loc(pointProgram, "uWordForm"),
        intro: loc(pointProgram, "uIntro"),
        scale: loc(pointProgram, "uScale"),
        wordScale: loc(pointProgram, "uWordScale"),
        dim: loc(pointProgram, "uDim"),
        size: loc(pointProgram, "uSize"),
        spin: loc(pointProgram, "uSpin"),
        drift: loc(pointProgram, "uDrift"),
        scrollVel: loc(pointProgram, "uScrollVel"),
        mouseStrength: loc(pointProgram, "uMouseStrength"),
        offset: loc(pointProgram, "uOffset"),
        wordOffset: loc(pointProgram, "uWordOffset"),
        dustOffset: loc(pointProgram, "uDustOffset"),
        mouse: loc(pointProgram, "uMouse"),
        rot: loc(pointProgram, "uRot"),
      };
      const silkPos = gl.getAttribLocation(silkProgram, "a_pos");
      const copyPos = gl.getAttribLocation(copyProgram, "a_pos");
      const aLogo = gl.getAttribLocation(pointProgram, "aLogo");
      const aWord = gl.getAttribLocation(pointProgram, "aWord");
      const aDust = gl.getAttribLocation(pointProgram, "aDust");
      const aRand = gl.getAttribLocation(pointProgram, "aRand");

      const silkTexture = gl.createTexture();
      const framebuffer = gl.createFramebuffer();

      let dprCap = 1.5;
      let drawCount = count;
      let width = 0;
      let height = 0;
      let silkWidth = 0;
      let silkHeight = 0;
      let dpr = 1;
      let projection = perspective(FOV, 1, 0.1, 30);

      const resize = () => {
        dpr = Math.min(window.devicePixelRatio || 1, dprCap);
        const cssWidth = canvas.clientWidth || window.innerWidth;
        const cssHeight = canvas.clientHeight || window.innerHeight;
        width = Math.max(1, Math.round(cssWidth * dpr));
        height = Math.max(1, Math.round(cssHeight * dpr));
        canvas.width = width;
        canvas.height = height;
        silkWidth = Math.max(1, Math.round(cssWidth / 4));
        silkHeight = Math.max(1, Math.round(cssHeight / 4));
        gl.bindTexture(gl.TEXTURE_2D, silkTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, silkWidth, silkHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, silkTexture, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        projection = perspective(FOV, cssWidth / cssHeight, 0.1, 30);
      };

      /* ---------- stan sceny (wygładzany) ---------- */
      const state = {
        form: 1,
        wordForm: 0,
        intro: reduced ? 1 : 0,
        offsetX: 0.8,
        offsetY: 0,
        scale: 0.6,
        wordOffsetX: 0,
        wordOffsetY: -2,
        wordScale: 1,
        dim: 1,
        silk: 1,
        focusX: 0.75,
        focusY: 0.55,
        mouseX: 0,
        mouseY: 0,
        mouseStrength: 0,
        rotX: 0,
        rotY: 0,
        spin: 0,
        drift: 0,
        scrollVel: 0,
      };
      const pointer = { ndcX: 0, ndcY: 0, active: false, movedAt: -Infinity };
      let lastScroll = window.scrollY;
      let elapsed = 0;
      let last = performance.now();
      let frames = 0;
      let slowFrames = 0;

      const mix = (a: number, b: number, t: number) => a + (b - a) * t;

      /** Ramka samego tekstu elementu (a nie całego bloku), np. napisu wyśrodkowanego w szerokim kontenerze. */
      const textRect = (element: HTMLElement) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        const rect = range.getBoundingClientRect();
        return rect.width > 0 ? rect : element.getBoundingClientRect();
      };

      const readScene = () => {
        const vw = canvas.clientWidth || window.innerWidth;
        const vh = canvas.clientHeight || window.innerHeight;
        const aspect = vw / vh;
        const halfH = Math.tan(FOV / 2) * CAM_Z;
        const halfW = halfH * aspect;
        const mobile = aspect < 0.85;
        const probe = vh * 0.5;
        const weightOf = (rect: DOMRect) => {
          const distance = probe < rect.top ? rect.top - probe : probe > rect.bottom ? probe - rect.bottom : 0;
          return clamp(1 - distance / (vh * 0.4), 0, 1);
        };

        let logoWeight = 0;
        let logoElement: HTMLElement | null = null;
        let logoRect: DOMRect | null = null;
        let wordWeight = 0;
        let wordElement: HTMLElement | null = null;
        for (const element of Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"))) {
          const kind = element.dataset.scene;
          if (kind !== "logo" && kind !== "word") continue;
          const rect = element.getBoundingClientRect();
          const w = weightOf(rect);
          if (kind === "logo" && w > logoWeight) {
            logoWeight = w;
            logoElement = element;
            logoRect = rect;
          } else if (kind === "word" && w > wordWeight) {
            wordWeight = w;
            wordElement = element;
          }
        }

        const result = {
          logoForm: 0,
          wordForm: 0,
          offsetX: state.offsetX,
          offsetY: state.offsetY,
          scale: state.scale,
          wordOffsetX: state.wordOffsetX,
          wordOffsetY: state.wordOffsetY,
          wordScale: state.wordScale,
          dim: mobile ? 0.5 : 0.62,
          silk: 0.34,
          focusX: 0.72,
          focusY: 0.5,
          halfW,
          halfH,
        };

        if (logoElement && logoRect && logoWeight >= wordWeight) {
          const element: HTMLElement = logoElement;
          const rect: DOMRect = logoRect;
          const read = (name: string, fallback: number) => {
            const value = element.dataset[mobile ? `sceneM${name}` : `scene${name}`];
            return value === undefined ? fallback : Number(value);
          };
          const centerNdcY = 1 - ((rect.top + rect.bottom) / 2 / vh) * 2;
          const x = read("X", 0.5);
          const y = read("Y", 0);
          result.logoForm = logoWeight;
          result.offsetX = x * halfW;
          result.offsetY = clamp(centerNdcY, -1.6, 1.6) * halfH * 0.85 + y * halfH;
          result.scale = read("Scale", 0.6);
          result.dim = mix(result.dim, mobile ? 0.8 : 1, logoWeight);
          result.silk = mix(result.silk, 1, logoWeight);
          result.focusX = 0.5 + x * 0.5;
          result.focusY = clamp(0.5 + (result.offsetY / halfH) * 0.5, 0, 1);
        } else if (wordElement) {
          const rect = textRect(wordElement);
          const box = wordElement.getBoundingClientRect();
          /* szerokość jak tekst elementu; dół napisu nad dolną krawędzią elementu, żeby nie wchodził na stopkę */
          const halfWidthPx = (rect.width / 2) * 0.94;
          const centerX = rect.left + rect.width / 2;
          const centerY = box.bottom - box.height * 0.1 - halfWidthPx * wordAspect;
          result.wordForm = wordWeight;
          result.wordOffsetX = ((centerX / vw) * 2 - 1) * halfW;
          result.wordOffsetY = (1 - (centerY / vh) * 2) * halfH;
          result.wordScale = ((halfWidthPx * 2) / vw) * halfW;
          result.dim = mix(result.dim, 0.95, wordWeight);
          result.silk = mix(result.silk, 0.75, wordWeight);
          result.focusX = clamp(centerX / vw, 0, 1);
          result.focusY = clamp(1 - centerY / vh, 0, 1);
        }
        return result;
      };

      const readDustShift = () => {
        const aspect = (canvas.clientWidth || 1) / (canvas.clientHeight || 1);
        const halfH = Math.tan(FOV / 2) * CAM_Z;
        return aspect < 0.85 ? [0, -0.1] : [halfH * aspect * 0.42, -0.05];
      };

      const render = () => {
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.viewport(0, 0, silkWidth, silkHeight);
        gl.disable(gl.BLEND);
        gl.useProgram(silkProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, triangle);
        gl.enableVertexAttribArray(silkPos);
        gl.vertexAttribPointer(silkPos, 2, gl.FLOAT, false, 0, 0);
        const halfH = Math.tan(FOV / 2) * CAM_Z;
        gl.uniform2f(silkU.res, silkWidth, silkHeight);
        gl.uniform1f(silkU.time, elapsed + 12);
        gl.uniform2f(silkU.focus, state.focusX, state.focusY);
        gl.uniform1f(silkU.amount, state.silk);
        gl.uniform2f(silkU.mouse, (state.mouseX / (halfH * (width / height)) + 1) / 2, (state.mouseY / halfH + 1) / 2);
        gl.uniform1f(silkU.light, 0.35 + state.mouseStrength * 0.65);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, width, height);
        gl.useProgram(copyProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, triangle);
        gl.enableVertexAttribArray(copyPos);
        gl.vertexAttribPointer(copyPos, 2, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, silkTexture);
        gl.uniform1i(copyU.tex, 0);
        gl.uniform2f(copyU.res, width, height);
        gl.uniform1f(copyU.time, elapsed);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        gl.useProgram(pointProgram);
        const bind = (buffer: WebGLBuffer | null, location: number, size: number) => {
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
          gl.enableVertexAttribArray(location);
          gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
        };
        bind(logoBuffer, aLogo, 3);
        bind(wordBuffer, aWord, 3);
        bind(dustBuffer, aDust, 3);
        bind(randBuffer, aRand, 4);
        const vmin = Math.min(canvas.clientWidth || 1, canvas.clientHeight || 1);
        const dustShift = readDustShift();
        gl.uniformMatrix4fv(pointU.proj, false, projection);
        gl.uniform1f(pointU.time, elapsed);
        gl.uniform1f(pointU.form, state.form);
        gl.uniform1f(pointU.wordForm, state.wordForm);
        gl.uniform1f(pointU.intro, state.intro);
        gl.uniform1f(pointU.scale, state.scale);
        gl.uniform1f(pointU.wordScale, state.wordScale);
        gl.uniform1f(pointU.dim, state.dim);
        gl.uniform1f(pointU.size, dpr * 1.2 * clamp(vmin / 950, 0.7, 1.35));
        gl.uniform1f(pointU.spin, state.spin);
        gl.uniform1f(pointU.drift, state.drift);
        gl.uniform1f(pointU.scrollVel, state.scrollVel);
        gl.uniform1f(pointU.mouseStrength, state.mouseStrength);
        gl.uniform2f(pointU.offset, state.offsetX, state.offsetY);
        gl.uniform2f(pointU.wordOffset, state.wordOffsetX, state.wordOffsetY);
        gl.uniform2f(pointU.dustOffset, dustShift[0], dustShift[1]);
        gl.uniform2f(pointU.mouse, state.mouseX, state.mouseY);
        gl.uniform2f(pointU.rot, state.rotY, state.rotX);
        gl.drawArrays(gl.POINTS, 0, drawCount);
        gl.disableVertexAttribArray(aLogo);
        gl.disableVertexAttribArray(aWord);
        gl.disableVertexAttribArray(aDust);
        gl.disableVertexAttribArray(aRand);
      };

      const step = (dt: number, instant: boolean) => {
        const scene = readScene();
        const scroll = window.scrollY;
        const velocity = dt > 0 ? (scroll - lastScroll) / dt : 0;
        lastScroll = scroll;
        const ease = (current: number, target: number, rate: number) => (instant ? target : damp(current, target, rate, dt));

        state.form = ease(state.form, scene.logoForm, 0.05);
        state.wordForm = ease(state.wordForm, scene.wordForm, 0.045);
        state.offsetX = ease(state.offsetX, scene.offsetX, 0.08);
        state.offsetY = ease(state.offsetY, scene.offsetY, 0.12);
        state.scale = ease(state.scale, scene.scale, 0.06);
        state.wordOffsetX = ease(state.wordOffsetX, scene.wordOffsetX, 0.12);
        state.wordOffsetY = ease(state.wordOffsetY, scene.wordOffsetY, 0.18);
        state.wordScale = ease(state.wordScale, scene.wordScale, 0.1);
        state.dim = ease(state.dim, scene.dim, 0.05);
        state.silk = ease(state.silk, scene.silk, 0.04);
        state.focusX = ease(state.focusX, scene.focusX, 0.05);
        state.focusY = ease(state.focusY, scene.focusY, 0.08);
        state.intro = reduced ? 1 : ease(state.intro, assembleRef.current ? 1 : 0, 0.022);
        state.drift = ease(state.drift, scroll * 0.0009, 0.2);

        const now = performance.now();
        const pointerLive = pointer.active && now - pointer.movedAt < 3000;
        const idleX = Math.sin(elapsed * 0.35) * 0.28;
        const idleY = Math.sin(elapsed * 0.27) * 0.12;
        state.mouseX = ease(state.mouseX, pointer.ndcX * scene.halfW, 0.18);
        state.mouseY = ease(state.mouseY, pointer.ndcY * scene.halfH, 0.18);
        state.mouseStrength = ease(state.mouseStrength, pointerLive ? 1 : 0, 0.06);
        state.rotY = ease(state.rotY, pointerLive ? pointer.ndcX * 0.5 : idleX, 0.05);
        state.rotX = ease(state.rotX, pointerLive ? -pointer.ndcY * 0.32 : idleY, 0.05);

        state.scrollVel = ease(state.scrollVel, clamp(Math.abs(velocity) / 2500, 0, 1), 0.1);
        state.spin += dt * (0.035 + state.scrollVel * 0.5) * (velocity < 0 ? -1 : 1);
      };

      const frame = (time: number) => {
        const dt = Math.min(0.064, Math.max(0, (time - last) / 1000));
        last = time;
        elapsed += dt;
        step(dt, false);
        render();

        frames++;
        if (frames > 30 && frames < 150 && dt > 0.026) slowFrames++;
        if (frames === 150 && slowFrames > 45 && dprCap > 1) {
          dprCap = 1;
          drawCount = Math.round(count * 0.55);
          resize();
        }
        raf = requestAnimationFrame(frame);
      };

      const onPointerMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        const vw = canvas.clientWidth || window.innerWidth;
        const vh = canvas.clientHeight || window.innerHeight;
        pointer.ndcX = (event.clientX / vw) * 2 - 1;
        pointer.ndcY = 1 - (event.clientY / vh) * 2;
        pointer.active = true;
        pointer.movedAt = performance.now();
      };
      const onPointerLeave = () => (pointer.active = false);
      const onVisibility = () => {
        if (reduced) return;
        if (document.hidden) {
          cancelAnimationFrame(raf);
          raf = 0;
        } else if (!raf) {
          last = performance.now();
          raf = requestAnimationFrame(frame);
        }
      };

      let staticRaf = 0;
      const renderStatic = () => {
        if (staticRaf) return;
        staticRaf = requestAnimationFrame(() => {
          staticRaf = 0;
          step(0, true);
          render();
        });
      };

      const resizeObserver = new ResizeObserver(() => {
        resize();
        if (reduced) renderStatic();
      });
      resize();
      resizeObserver.observe(canvas);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onPointerLeave);
      document.addEventListener("visibilitychange", onVisibility);
      cleanups.push(() => {
        resizeObserver.disconnect();
        window.removeEventListener("pointermove", onPointerMove);
        document.documentElement.removeEventListener("pointerleave", onPointerLeave);
        document.removeEventListener("visibilitychange", onVisibility);
        cancelAnimationFrame(staticRaf);
      });

      if (reduced) {
        step(0, true);
        render();
        window.addEventListener("scroll", renderStatic, { passive: true });
        cleanups.push(() => window.removeEventListener("scroll", renderStatic));
      } else {
        step(0, true);
        state.intro = 0;
        raf = requestAnimationFrame(frame);
      }
      canvas.dataset.ready = "true";
    };

    void start();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanups.forEach((cleanup) => cleanup());
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [markSrc, word]);

  return <canvas ref={canvasRef} className="c-scene" aria-hidden="true" />;
}
