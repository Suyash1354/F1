'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/* ─────────────────────────────────────────────────────────────────────
   PAINT SPLASH — METABALL APPROACH

   All positions are computed in aspect-corrected UV space so distances
   are circular on screen.  Texture sampling still uses raw vUv.

   Architecture:
     • 1  central blob   – the main body
     • 8  arm blobs      – merge with center to form splash tendrils
     • 6  satellite drops – isolated small circles at the tips
   
   Each arm/drop is placed at an animated angle + distance from the mouse.
   "align" = dot(arm direction, velocity direction)
     → positive (arm points with velocity)  → arm pushes further out
     → negative (arm points against motion) → arm pulls back
   This makes the splash "drag" realistically.
─────────────────────────────────────────────────────────────────────── */
const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture1;
  uniform sampler2D uTexture2;
  uniform vec2  uMouse;
  uniform vec2  uVelocity;
  uniform float uSpeed;
  uniform float uRadius;
  uniform float uTime;
  uniform float uAspect;
  varying vec2 vUv;

  /* metaball contribution: r² / d²  — sums to 1.0 at the "surface" */
  float meta(vec2 p, vec2 c, float r) {
    vec2 d = p - c;
    return (r * r) / (dot(d, d) + 0.00001);
  }

  void main() {
    /* aspect-corrected position space */
    vec2 p   = vec2(vUv.x * uAspect, vUv.y);
    vec2 mou = vec2(uMouse.x * uAspect, uMouse.y);

    float baseR = uRadius;
    float t     = uTime;

    /* normalised velocity direction in aspect space */
    vec2 moveDir = length(uVelocity) > 0.001
                 ? normalize(uVelocity)
                 : vec2(0.0);

    /* ── 1. central mass ── */
    float field = meta(p, mou, baseR * 1.05);

    /* ── 2. eight arm blobs ──
       Each arm has a unique base angle + per-arm phase wobble.
       Along the velocity axis the arm pushes out (stretch),
       against it the arm retracts (creating concavity = "drip" look).  */
    for (int i = 0; i < 8; i++) {
      float fi   = float(i);
      float bAng = fi * 0.7854;            /* base angle  (TAU/8)         */

      /* wobble angle so tendrils slowly twist */
      float ang  = bAng
                 + sin(t * 0.75 + fi * 1.57) * 0.30
                 + sin(t * 1.20 + fi * 2.44) * 0.15;

      vec2 dir   = vec2(cos(ang), sin(ang));
      float align = dot(dir, moveDir);

      /* arm distance reacts to velocity */
      float wobDist = baseR * (1.05 + 0.20 * sin(t * 1.0 + fi * 0.85));
      float armDist = wobDist
                    + align * uSpeed * baseR * 1.40   /* stretch forward */
                    - (1.0 - abs(align)) * uSpeed * baseR * 0.30; /* side tuck */
      armDist = max(armDist, baseR * 0.35);

      vec2  aPos = mou + dir * armDist;
      float aRad = baseR * (0.42 + 0.07 * sin(t * 1.6 + fi * 1.3));
      field += meta(p, aPos, aRad);
    }

    /* ── 3. satellite droplets (tip splashes) ──
       Offset angles so they sit between the arms.
       They fly out further and separate cleanly from the main body.    */
    for (int i = 0; i < 6; i++) {
      float fi   = float(i);
      float bAng = fi * 1.047 + 0.39;     /* TAU/6, offset half a step   */

      float ang  = bAng
                 + sin(t * 0.55 + fi * 2.10) * 0.35
                 + sin(t * 0.90 + fi * 3.30) * 0.20;

      vec2 dir   = vec2(cos(ang), sin(ang));
      float align = dot(dir, moveDir);

      float dropDist = baseR * (1.70 + 0.25 * sin(t * 0.85 + fi * 1.20));
      dropDist += align * uSpeed * baseR * 1.80;
      dropDist  = max(dropDist, baseR * 0.60);

      vec2  dPos = mou + dir * dropDist;
      float dRad = baseR * (0.20 + 0.06 * sin(t * 2.1 + fi * 1.7));
      field += meta(p, dPos, dRad);
    }

    /* ── 4. threshold + soft jelly edge ── */
    /* field > 1.0 = inside the splash */
    float inside = smoothstep(0.88, 1.08, field);

    /* jelly UV warp — subtle membrane stretch at the boundary */
    vec2 toMou  = vUv - uMouse;
    toMou.x    *= uAspect;
    vec2 pushDir = normalize(toMou + 0.00001);
    float lensStr = inside * (1.0 - inside) * 3.2;
    vec2 warpUV   = vUv - pushDir * lensStr * uRadius * 0.045;

    vec4 col1 = texture2D(uTexture1, warpUV);
    vec4 col2 = texture2D(uTexture2, vUv);

    gl_FragColor = mix(col1, col2, inside);
  }
`

export default function Hero() {
  const mountRef  = useRef(null)
  const cursorRef = useRef(null)
  const stateRef  = useRef({})

  const ease  = (cur, target, f) => cur + (target - cur) * f
  const ease2 = (cur, target, f) => ({
    x: ease(cur.x, target.x, f),
    y: ease(cur.y, target.y, f),
  })

  useEffect(() => {
    const mount  = mountRef.current
    const cursor = cursorRef.current
    if (!mount || !cursor) return

    /* ── renderer ── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.domElement.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;z-index:2;'
    mount.appendChild(renderer.domElement)

    const scene  = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10)
    camera.position.z = 1

    const loader  = new THREE.TextureLoader()
    const loadTex = (src) => {
      const t = loader.load(src)
      t.minFilter = THREE.LinearFilter
      t.magFilter = THREE.LinearFilter
      return t
    }
    const tex1 = loadTex('/images/Helmet.png')
    const tex2 = loadTex('/images/Sanny.png')

    const uniforms = {
      uTexture1 : { value: tex1 },
      uTexture2 : { value: tex2 },
      uMouse    : { value: new THREE.Vector2(0.5, 0.5) },
      uVelocity : { value: new THREE.Vector2(0, 0) },
      uSpeed    : { value: 0.0 },
      uRadius   : { value: 0.0 },
      uTime     : { value: 0.0 },
      uAspect   : { value: mount.clientWidth / mount.clientHeight },
    }

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms })
    )
    scene.add(mesh)

    /* ── state ── */
    const s        = stateRef.current
    s.mouse        = { x: 0.5, y: 0.5 }
    s.prevMouse    = { x: 0.5, y: 0.5 }
    s.smoothMouse  = { x: 0.5, y: 0.5 }
    s.rawVel       = { x: 0,   y: 0 }
    s.smoothVel    = { x: 0,   y: 0 }
    s.cursorX      = -100
    s.cursorY      = -100
    s.targetRadius = 0.0
    s.smoothRadius = 0.0
    s.raf          = null
    s.clock        = new THREE.Clock()

    /* ── loop ── */
    const tick = () => {
      s.raf = requestAnimationFrame(tick)
      const aspect = uniforms.uAspect.value

      /* velocity in aspect-corrected normalised space, scaled to per-frame */
      s.rawVel.x = (s.mouse.x - s.prevMouse.x) * aspect * 55
      s.rawVel.y = (s.mouse.y - s.prevMouse.y) * 55
      s.prevMouse = { ...s.mouse }

      s.smoothMouse  = ease2(s.smoothMouse, s.mouse, 0.10)
      s.smoothVel    = ease2(s.smoothVel,   s.rawVel, 0.12)
      s.smoothRadius = ease(s.smoothRadius, s.targetRadius, 0.06)

      const speed = Math.min(Math.hypot(s.smoothVel.x, s.smoothVel.y), 1.0)

      uniforms.uMouse.value.set(s.smoothMouse.x, s.smoothMouse.y)
      uniforms.uVelocity.value.set(s.smoothVel.x, s.smoothVel.y)
      uniforms.uSpeed.value  = speed
      uniforms.uRadius.value = s.smoothRadius
      uniforms.uTime.value   = s.clock.getElapsedTime()

      cursor.style.transform =
        `translate(${s.cursorX}px,${s.cursorY}px) translate(-50%,-50%)`

      renderer.render(scene, camera)
    }
    tick()

    /* ── events ── */
    const onMove = (e) => {
      const { left, top, width, height } = mount.getBoundingClientRect()
      s.mouse.x = (e.clientX - left) / width
      s.mouse.y = 1.0 - (e.clientY - top) / height
      s.cursorX = e.clientX - left
      s.cursorY = e.clientY - top
    }

    const onEnter = () => {
      s.targetRadius       = 0.13     /* small–medium splash */
      cursor.style.opacity = '1'
    }

    const onLeave = () => {
      s.targetRadius       = 0.0
      cursor.style.opacity = '0'
    }

    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight
      renderer.setSize(w, h)
      uniforms.uAspect.value = w / h
    }

    mount.addEventListener('mousemove',  onMove)
    mount.addEventListener('mouseenter', onEnter)
    mount.addEventListener('mouseleave', onLeave)
    window.addEventListener('resize',    onResize)

    return () => {
      cancelAnimationFrame(s.raf)
      mount.removeEventListener('mousemove',  onMove)
      mount.removeEventListener('mouseenter', onEnter)
      mount.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('resize',    onResize)
      renderer.dispose()
      if (renderer.domElement.parentNode === mount)
        mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <section>
      <div
        ref={mountRef}
        style={{
          position : 'relative',
          width    : '100%',
          height   : '100vh',
          overflow : 'hidden',
          cursor   : 'none',
        }}
      >
        <img src="/images/Sanny.png"  alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', zIndex:0 }} />
        <img src="/images/Helmet.png" alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', zIndex:1 }} />

        {/* WebGL canvas injected at z-index:2 */}

        {/* small cursor: dot + ring */}
        <div
          ref={cursorRef}
          style={{
            position     : 'absolute',
            top          : 0,
            left         : 0,
            pointerEvents: 'none',
            zIndex       : 10,
            opacity      : 0,
            transition   : 'opacity 0.18s ease',
            willChange   : 'transform',
          }}
        >
          <div style={{
            position     : 'absolute',
            width        : 18,
            height       : 18,
            borderRadius : '50%',
            border       : '1px solid rgba(255,255,255,0.85)',
            transform    : 'translate(-50%,-50%)',
          }} />
          <div style={{
            position        : 'absolute',
            width           : 4,
            height          : 4,
            borderRadius    : '50%',
            backgroundColor : '#fff',
            transform       : 'translate(-50%,-50%)',
          }} />
        </div>
      </div>
    </section>
  )
}