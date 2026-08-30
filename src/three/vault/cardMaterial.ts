import * as THREE from 'three'

const CARD_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/**
 * Rounded-rect SDF mask + accent border + neon grade, all in one pass.
 * Values are pushed above 1.0 on the border so the Bloom pass picks up the glow
 * instead of us faking it with extra geometry.
 */
const CARD_FRAG = /* glsl */ `
  precision highp float;

  uniform sampler2D uMap;
  uniform float uHasMap;
  uniform float uReveal;
  uniform vec3 uAccent;
  uniform float uHover;
  uniform float uFocus;
  uniform float uDim;
  uniform float uTime;
  uniform float uAspect;
  uniform float uOpacity;
  uniform float uRadius;

  varying vec2 vUv;

  float sdRoundRect(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  void main() {
    // Mirror the texture on back faces so cards on the far side of the orb still
    // read as photographs rather than reversed ones.
    vec2 uv = gl_FrontFacing ? vUv : vec2(1.0 - vUv.x, vUv.y);

    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
    vec2 b = vec2(uAspect, 1.0) * 0.5;
    float d = sdRoundRect(p, b, uRadius);

    float aa = max(fwidth(d), 0.0009);
    float inside = 1.0 - smoothstep(-aa, aa, d);
    if (inside <= 0.001) discard;

    // Until this card's canvas has been painted — and on any browser where that
    // paint fails outright — the plate still has to read as a designed object
    // rather than a black hole, so it falls back to an accent-graded gradient with
    // the same sheen sweep the photo cards get. When the bake does land, uReveal
    // cross-fades into it: the twelve canvases are built one at a time, so the orb
    // develops card by card instead of hard-cutting.
    float g = smoothstep(0.0, 1.0, 1.0 - vUv.y);
    vec3 plate = mix(vec3(0.035, 0.035, 0.045), uAccent * 0.40, g * 0.85);
    plate += uAccent * 0.12 * smoothstep(0.82, 1.0, sin((vUv.x * 1.4 + vUv.y) * 2.2 - uTime * 0.9));

    // uMap resolves to a 1x1 placeholder while unbound, so this always samples
    // something valid even on the branch that discards the result.
    vec3 col = mix(plate, texture2D(uMap, uv).rgb, uHasMap * uReveal);

    // Lift shadows toward the accent so twelve differently-lit sources cohere.
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(col, uAccent * (0.35 + lum), (1.0 - lum) * (0.16 + 0.14 * uHover));

    col *= 1.0 + 0.22 * uHover + 0.10 * uFocus;

    // VHS scanlines, relaxed when focused so the type stays legible up close and
    // faded out entirely once a stripe would land inside a pixel — otherwise they
    // moiré and crawl as the orb turns.
    float sl = 0.965 + 0.035 * sin(vUv.y * 480.0);
    float slFade = 1.0 - smoothstep(0.004, 0.008, fwidth(vUv.y));
    col *= mix(1.0, mix(sl, 1.0, uFocus), slFade);

    // Specular sweep across the face on hover.
    float sweep = sin((vUv.x * 1.4 + vUv.y) * 2.2 - uTime * 1.6);
    col += uAccent * smoothstep(0.86, 1.0, sweep) * 0.26 * uHover;

    col *= 1.0 - 0.26 * length(p * vec2(1.1, 0.85));

    // Accent hairline just inside the silhouette.
    float bw = 0.017;
    float border = smoothstep(-bw - aa, -bw + aa, d) * inside;
    col = mix(col, uAccent * (1.2 + 2.4 * uHover + 1.9 * uFocus), border * (0.55 + 0.45 * uHover));
    col += uAccent * border * (0.32 + 1.25 * uHover + 1.0 * uFocus);

    if (!gl_FrontFacing) col *= 0.55;

    col *= mix(1.0, 0.28, uDim);

    gl_FragColor = vec4(col, inside * uOpacity);

    // A custom ShaderMaterial gets no automatic output conversion. Inside the
    // EffectComposer this is a no-op (the render target is already linear and
    // postprocessing re-encodes at the end); when the composer is skipped on the
    // low quality tier it is the difference between correct colour and mud.
    #include <colorspace_fragment>
  }
`

const HALO_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uAccent;
  uniform float uStrength;
  varying vec2 vUv;
  void main() {
    // Falloff normalised to the quad so it reaches exactly zero at the edges and
    // corners. Anything non-zero at the boundary shows up as a hard rectangular
    // seam once twelve of these are blended additively.
    float r = length((vUv - 0.5) * 2.0);
    float a = pow(clamp(1.0 - r, 0.0, 1.0), 2.3);
    gl_FragColor = vec4(uAccent * a * uStrength, a * uStrength * 0.9);
    #include <colorspace_fragment>
  }
`

export interface CardUniforms {
  uMap: { value: THREE.Texture | null }
  uHasMap: { value: number }
  uReveal: { value: number }
  uAccent: { value: THREE.Color }
  uHover: { value: number }
  uFocus: { value: number }
  uDim: { value: number }
  uTime: { value: number }
  uAspect: { value: number }
  uOpacity: { value: number }
  uRadius: { value: number }
}

export function createCardMaterial(accent: string, aspect: number) {
  const uniforms: CardUniforms = {
    uMap: { value: null },
    uHasMap: { value: 0 },
    uReveal: { value: 0 },
    uAccent: { value: new THREE.Color(accent) },
    uHover: { value: 0 },
    uFocus: { value: 0 },
    uDim: { value: 0 },
    uTime: { value: 0 },
    uAspect: { value: aspect },
    uOpacity: { value: 0 },
    uRadius: { value: 0.055 },
  }
  const material = new THREE.ShaderMaterial({
    vertexShader: CARD_VERT,
    fragmentShader: CARD_FRAG,
    uniforms: uniforms as unknown as Record<string, THREE.IUniform>,
    transparent: true,
    depthWrite: true,
    side: THREE.DoubleSide,
    toneMapped: false,
  })
  return { material, uniforms }
}

export function createHaloMaterial(accent: string) {
  const uniforms = {
    uAccent: { value: new THREE.Color(accent) },
    uStrength: { value: 0 },
  }
  const material = new THREE.ShaderMaterial({
    vertexShader: CARD_VERT,
    fragmentShader: HALO_FRAG,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    toneMapped: false,
  })
  return { material, uniforms }
}
