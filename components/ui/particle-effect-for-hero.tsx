'use client'
import React, { useEffect, useRef, useCallback } from 'react'

interface P  { x:number; y:number; ox:number; oy:number; vx:number; vy:number; r:number; col:string }
interface BP { x:number; y:number; vx:number; vy:number; r:number; a:number; ph:number }

const rnd = (a:number,b:number) => Math.random()*(b-a)+a

export const AntiGravityCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef   = useRef<HTMLDivElement>(null)
  const mouse     = useRef({ x:-9999, y:-9999, on:false })
  const raf       = useRef(0)
  const W         = useRef(0)
  const H         = useRef(0)
  const pts       = useRef<P[]>([])
  const bgs       = useRef<BP[]>([])

  /* Build particles for a given logical w×h */
  const build = useCallback((w:number, h:number) => {
    W.current = w
    H.current = h

    const n = Math.floor(w * h * 0.00015)
    pts.current = Array.from({ length: n }, () => {
      const x = rnd(0,w), y = rnd(0,h)
      return { x, y, ox:x, oy:y, vx:0, vy:0,
               r: rnd(1,2.5),
               col: Math.random() > 0.9 ? '#e8ff5a' : '#ffffff' }
    })

    const bn = Math.floor(w * h * 0.00005)
    bgs.current = Array.from({ length: bn }, () => ({
      x: rnd(0,w), y: rnd(0,h),
      vx: (Math.random()-.5)*.2,
      vy: (Math.random()-.5)*.2,
      r: rnd(.5,1.5), a: rnd(.1,.4),
      ph: rnd(0, Math.PI*2)
    }))
  }, [])

  /* Resize: read wrapper size, NOT window */
  const resize = useCallback(() => {
    const wrap   = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return

    const w   = wrap.offsetWidth
    const h   = wrap.offsetHeight
    if (!w || !h) return

    const dpr = window.devicePixelRatio || 1
    canvas.width  = w * dpr
    canvas.height = h * dpr
    canvas.style.width  = w + 'px'
    canvas.style.height = h + 'px'

    const ctx = canvas.getContext('2d')
    if (ctx) { ctx.setTransform(1,0,0,1,0,0); ctx.scale(dpr, dpr) }

    build(w, h)
  }, [build])

  /* Animation loop */
  const tick = useCallback((t: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = W.current, h = H.current
    if (!w || !h) { raf.current = requestAnimationFrame(tick); return }

    ctx.clearRect(0, 0, w, h)

    /* Radial glow */
    const op = Math.sin(t * 0.0008) * 0.035 + 0.085
    const g  = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h) * 0.7)
    g.addColorStop(0,   `rgba(232,255,90,${(op*.4).toFixed(3)})`)
    g.addColorStop(.5,  `rgba(90,255,234,${(op*.2).toFixed(3)})`)
    g.addColorStop(1,   'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)

    /* Twinkling background stars */
    for (const p of bgs.current) {
      p.x += p.vx;  p.y += p.vy
      if (p.x < 0) p.x = w; else if (p.x > w) p.x = 0
      if (p.y < 0) p.y = h; else if (p.y > h) p.y = 0
      const tw = Math.sin(t * .002 + p.ph) * .5 + .5
      ctx.globalAlpha = p.a * (.3 + .7 * tw)
      ctx.fillStyle   = '#ffffff'
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill()
    }
    ctx.globalAlpha = 1

    const m = mouse.current

    /* Spring + mouse repulsion */
    for (const p of pts.current) {
      const dx = m.x - p.x, dy = m.y - p.y
      const d  = Math.sqrt(dx*dx + dy*dy)
      if (m.on && d < 180 && d > 0) {
        const f = ((180 - d) / 180) * 1.2
        p.vx -= (dx/d) * f * 5
        p.vy -= (dy/d) * f * 5
      }
      p.vx += (p.ox - p.x) * 0.08
      p.vy += (p.oy - p.y) * 0.08
    }

    /* Draw foreground particles */
    for (const p of pts.current) {
      p.vx *= 0.9;  p.vy *= 0.9
      p.x  += p.vx; p.y  += p.vy
      const v  = Math.sqrt(p.vx*p.vx + p.vy*p.vy)
      const op2 = Math.min(.3 + v*.1, 1)
      ctx.fillStyle = (p.col === '#ffffff')
        ? `rgba(255,255,255,${op2.toFixed(2)})`
        : p.col
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill()
    }

    raf.current = requestAnimationFrame(tick)
  }, [])

  /* Mount / resize */
  useEffect(() => {
    /* Small delay lets the DOM paint and give correct offsetWidth */
    const id = setTimeout(resize, 50)
    window.addEventListener('resize', resize)
    return () => { clearTimeout(id); window.removeEventListener('resize', resize) }
  }, [resize])

  /* Start loop */
  useEffect(() => {
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [tick])

  return (
    <div
      ref={wrapRef}
      style={{
        position : 'absolute',
        inset    : 0,
        zIndex   : 0,
        background: '#000',
        overflow : 'hidden',
        cursor   : 'crosshair',
      }}
      onMouseMove={e => {
        /* coords relative to the wrapper */
        const rect = wrapRef.current?.getBoundingClientRect()
        if (!rect) return
        mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, on: true }
      }}
      onMouseLeave={() => { mouse.current.on = false }}
    >
      <canvas
        ref={canvasRef}
        style={{ display:'block', position:'absolute', top:0, left:0 }}
      />
    </div>
  )
}
