/**
 * GooeyEffect.jsx
 *
 * Drop-in WebGL canvas that renders two images with a gooey mouse-reveal.
 * The canvas is 80% of the viewport width, full viewport height, centred.
 * Mouse coordinates are remapped relative to the canvas bounds.
 *
 * Props
 *   imageSrc  – top/default image   e.g. "/images/HelmetEnh.png"
 *   hoverSrc  – revealed image       e.g. "/images/SannyEnh.png"
 *
 * Deps: three, gsap
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'

// ─── Vertex Shader ────────────────────────────────────────────────────────────
const vertexShader = /* glsl */ `
  varying vec2 v_uv;
  void main() {
    v_uv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// ─── Fragment Shader ──────────────────────────────────────────────────────────
const fragmentShader = /* glsl */ `
  // ── Simplex 3-D noise (Ian McEwan / ashima arts) ─────────────────────────
  vec3 mod289v3(vec3 x){ return x - floor(x*(1./289.))*289.; }
  vec4 mod289v4(vec4 x){ return x - floor(x*(1./289.))*289.; }
  vec4 permute4(vec4 x){ return mod289v4(((x*34.)+1.)*x); }
  vec4 taylorInvSqrt4(vec4 r){ return 1.79284291400159 - 0.85373472095314*r; }

  float snoise3(vec3 v){
    const vec2 C = vec2(1./6., 1./3.);
    const vec4 D = vec4(0., 0.5, 1., 2.);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289v3(i);
    vec4 p = permute4(permute4(permute4(
      i.z + vec4(0., i1.z, i2.z, 1.))
      + i.y + vec4(0., i1.y, i2.y, 1.))
      + i.x + vec4(0., i1.x, i2.x, 1.));
    float n_ = .142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j  = p - 49. * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7. * x_);
    vec4 x  = x_ * ns.x + ns.yyyy;
    vec4 y  = y_ * ns.x + ns.yyyy;
    vec4 h  = 1. - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.+1.;
    vec4 s1 = floor(b1)*2.+1.;
    vec4 sh = -step(h, vec4(0.));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt4(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
    vec4 m = max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
    m = m*m;
    return 42.*dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }
  // ── end noise ─────────────────────────────────────────────────────────────

  float circle(in vec2 st, in float radius, in float blur){
    return 1. - smoothstep(
      radius - radius * blur,
      radius + radius * blur,
      dot(st, st) * 4.0
    );
  }

  // Object-cover UV mapping.
  vec2 coverUv(vec2 uv, float imgAspect, float planeAspect) {
    float imgR   = imgAspect;
    float planeR = planeAspect;
    vec2 scale;
    if (imgR > planeR) {
      scale = vec2(imgR / planeR, 1.0);
    } else {
      scale = vec2(1.0, planeR / imgR);
    }
    return (uv - 0.5) / scale + 0.5;
  }

  uniform sampler2D u_image;
  uniform sampler2D u_imagehover;
  uniform vec2      u_mouse;        // normalised NDC −1..1, relative to canvas
  uniform vec2      u_res;          // canvas px (80vw × 100vh)
  uniform float     u_time;
  uniform float     u_hover;
  uniform float     u_pr;
  uniform float     u_imgAspect;
  uniform float     u_hoverAspect;

  varying vec2 v_uv;

  void main(){
    float planeAspect = u_res.x / u_res.y;

    vec2 uvTop   = coverUv(v_uv, u_imgAspect,   planeAspect);
    vec2 uvHover = coverUv(v_uv, u_hoverAspect, planeAspect);

    // ── Gooey mask ──────────────────────────────────────────────────────────
    vec2 res = u_res * u_pr;

    // Fragment in −0.5..0.5, aspect-corrected to canvas
    vec2 st  = gl_FragCoord.xy / res - 0.5;
    st.y    *= u_res.y / u_res.x;

    // Mouse in the same space
    vec2 mouse  = u_mouse * 0.5;
    mouse.y    *= u_res.y / u_res.x;

    vec2 circlePos = st - mouse;

    float offx = v_uv.x + sin(v_uv.y + u_time * .1);
    float offy = v_uv.y - u_time * 0.1 - cos(u_time * .001) * .01;
    float n    = snoise3(vec3(offx, offy, u_time * .1) * 8.) - 1.;

    float c    = circle(circlePos, 0.06 * u_hover, 2.) * 2.5;
    float mask = smoothstep(0.4, 0.5, n + pow(c, 2.));

    vec4 top    = texture2D(u_image,      uvTop);
    vec4 bottom = texture2D(u_imagehover, uvHover);

    gl_FragColor = mix(top, bottom, mask);
  }
`

// ─── Component ────────────────────────────────────────────────────────────────
export default function GooeyEffect({ imageSrc, hoverSrc }) {
  const canvasRef = useRef(null)
  const cursorRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const cursor = cursorRef.current
    if (!canvas) return

    // Canvas is 80% of viewport width, full viewport height
    const W  = Math.round(window.innerWidth * 0.8)
    const H  = window.innerHeight
    const PR = window.devicePixelRatio || 1

    // ── Renderer ─────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(PR)

    // ── Scene & Camera ────────────────────────────────────────────────────────
    const scene  = new THREE.Scene()
    const PERSP  = 800
    const fov    = (180 * (2 * Math.atan(H / 2 / PERSP))) / Math.PI
    const camera = new THREE.PerspectiveCamera(fov, W / H, 1, 1000)
    camera.position.set(0, 0, PERSP)

    // ── Uniforms ─────────────────────────────────────────────────────────────
    const uniforms = {
      u_image:       { value: null },
      u_imagehover:  { value: null },
      u_mouse:       { value: new THREE.Vector2(0, 0) },
      u_res:         { value: new THREE.Vector2(W, H) },
      u_time:        { value: 0 },
      u_hover:       { value: 0 },
      u_pr:          { value: PR },
      u_imgAspect:   { value: 1.0 },
      u_hoverAspect: { value: 1.0 },
    }

    const loader = new THREE.TextureLoader()
    loader.load(imageSrc, (tex) => {
      uniforms.u_image.value     = tex
      uniforms.u_imgAspect.value = tex.image.width / tex.image.height
    })
    loader.load(hoverSrc, (tex) => {
      uniforms.u_imagehover.value  = tex
      uniforms.u_hoverAspect.value = tex.image.width / tex.image.height
    })

    // ── Mesh ──────────────────────────────────────────────────────────────────
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader })
    const geometry = new THREE.PlaneGeometry(1, 1, 1, 1)
    const mesh     = new THREE.Mesh(geometry, material)
    mesh.scale.set(W, H, 1)
    scene.add(mesh)

    // ── Mouse handlers ────────────────────────────────────────────────────────
    // Remap mouse relative to canvas bounds (not full window)
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      // NDC within the canvas: -1..1
      const nx =  ((e.clientX - rect.left) / rect.width)  * 2 - 1
      const ny = -((e.clientY - rect.top)  / rect.height) * 2 + 1
      gsap.to(uniforms.u_mouse.value, { x: nx, y: ny, duration: 0.2, ease: 'power2.out' })
      if (cursor) gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.05, ease: 'none' })
    }

    const onEnter = () => {
      gsap.to(uniforms.u_hover, { value: 1, duration: 0.6, ease: 'power2.out' })
      if (cursor) gsap.to(cursor, { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(2)' })
    }

    const onLeave = () => {
      gsap.to(uniforms.u_hover, { value: 0, duration: 0.5, ease: 'power2.in' })
      if (cursor) gsap.to(cursor, { opacity: 0, scale: 0, duration: 0.2, ease: 'power2.in' })
    }

    canvas.addEventListener('mousemove',  onMove)
    canvas.addEventListener('mouseenter', onEnter)
    canvas.addEventListener('mouseleave', onLeave)

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      const w = Math.round(window.innerWidth * 0.8)
      const h = window.innerHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.fov    = (180 * (2 * Math.atan(h / 2 / PERSP))) / Math.PI
      camera.updateProjectionMatrix()
      mesh.scale.set(w, h, 1)
      uniforms.u_res.value.set(w, h)
    }
    window.addEventListener('resize', onResize)

    // ── Render loop ───────────────────────────────────────────────────────────
    let rafId
    const tick = () => {
      rafId = requestAnimationFrame(tick)
      uniforms.u_time.value += 0.01
      renderer.render(scene, camera)
    }
    tick()

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId)
      canvas.removeEventListener('mousemove',  onMove)
      canvas.removeEventListener('mouseenter', onEnter)
      canvas.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
    }
  }, [imageSrc, hoverSrc])

  return (
    <>
      {/* Canvas constrained to 80% width, full height, centred */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top:      0,
          left:     '50%',
          transform: 'translateX(-50%)',
          width:    '80%',
          height:   '100%',
        }}
      />

      {/* Custom cursor dot */}
      <div
        ref={cursorRef}
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          width:         10,
          height:        10,
          borderRadius:  '50%',
          background:    'rgba(255,255,255,0.95)',
          mixBlendMode:  'difference',
          pointerEvents: 'none',
          transform:     'translate(-50%, -50%) scale(0)',
          opacity:       0,
          zIndex:        9999,
        }}
      />
    </>
  )
}