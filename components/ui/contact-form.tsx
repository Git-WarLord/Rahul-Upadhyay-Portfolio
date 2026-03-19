'use client'
import { useState, useRef, useEffect } from 'react'

/* ── tiny Web Audio helpers ── */
function playClick() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.frequency.setValueAtTime(1200, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.06)
    g.gain.setValueAtTime(0.18, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
    o.start(); o.stop(ctx.currentTime + 0.08)
  } catch {}
}

function playSuccess() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((freq, i) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.type = 'sine'
      o.frequency.value = freq
      const t = ctx.currentTime + i * 0.12
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.15, t + 0.04)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
      o.start(t); o.stop(t + 0.36)
    })
  } catch {}
}

interface Field { id: string; label: string; type: string; placeholder: string }
const FIELDS: Field[] = [
  { id: 'name',    label: 'Full Name',     type: 'text',  placeholder: 'Rahul Upadhyay' },
  { id: 'email',   label: 'Email Address', type: 'email', placeholder: 'you@email.com' },
  { id: 'subject', label: 'Subject',       type: 'text',  placeholder: 'Project idea / Collaboration' },
]

export function ContactForm() {
  const [values,  setValues]  = useState({ name:'', email:'', subject:'', message:'' })
  const [focused, setFocused] = useState<string|null>(null)
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [particles, setParticles] = useState<{id:number;x:number;y:number;c:string;a:number;vx:number;vy:number}[]>([])
  const btnRef = useRef<HTMLButtonElement>(null)
  const rafRef = useRef(0)
  const partRef = useRef(particles)
  partRef.current = particles

  /* confetti burst */
  const burst = () => {
    const btn = btnRef.current
    if (!btn) return
    const r = btn.getBoundingClientRect()
    const cx = r.left + r.width/2
    const cy = r.top  + r.height/2
    const colors = ['#e8ff5a','#5affea','#ff6bff','#fff','#ffaa5a']
    const ps = Array.from({length:40}, (_,i)=>({
      id: i,
      x: cx, y: cy,
      vx: (Math.random()-0.5)*12,
      vy: (Math.random()-1.2)*10,
      c: colors[Math.floor(Math.random()*colors.length)],
      a: 1,
    }))
    setParticles(ps)
    let frame = 0
    const animate = () => {
      frame++
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy + frame*0.18,
        a: Math.max(0, p.a - 0.025),
      })).filter(p => p.a > 0))
      if (frame < 60) rafRef.current = requestAnimationFrame(animate)
      else setParticles([])
    }
    rafRef.current = requestAnimationFrame(animate)
  }

  useEffect(()=>()=>cancelAnimationFrame(rafRef.current),[])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    playClick()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1800))
    setLoading(false)
    setDone(true)
    playSuccess()
    burst()
  }

  const mono = { fontFamily:"'Space Mono',monospace" }

  if (done) return (
    <>
      {/* confetti overlay */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:9999 }}>
        {particles.map(p=>(
          <div key={p.id} style={{
            position:'fixed', left:p.x, top:p.y,
            width:8, height:8, borderRadius:2,
            background:p.c, opacity:p.a,
            transform:'translate(-50%,-50%)',
            pointerEvents:'none', zIndex:9999,
          }}/>
        ))}
      </div>

      {/* Thank you card */}
      <div style={{
        position:'relative', padding:'48px 40px', textAlign:'center',
        border:'1px solid rgba(232,255,90,0.3)', borderRadius:8,
        background:'rgba(0,0,0,0.8)', backdropFilter:'blur(12px)',
        animation:'thankYouIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
      }}>
        <style>{`
          @keyframes thankYouIn {
            from { opacity:0; transform:scale(0.85) translateY(20px); }
            to   { opacity:1; transform:scale(1) translateY(0); }
          }
          @keyframes ringPulse {
            0%   { transform:scale(1);   opacity:0.8; }
            100% { transform:scale(2.2); opacity:0; }
          }
          @keyframes checkDraw {
            from { stroke-dashoffset: 60; }
            to   { stroke-dashoffset: 0; }
          }
          @keyframes floatUp {
            0%   { opacity:0; transform:translateY(10px); }
            100% { opacity:1; transform:translateY(0); }
          }
        `}</style>

        {/* Animated check */}
        <div style={{ position:'relative', display:'inline-block', marginBottom:24 }}>
          <div style={{
            position:'absolute', inset:0, borderRadius:'50%',
            border:'2px solid #e8ff5a',
            animation:'ringPulse 1s ease-out forwards',
          }}/>
          <div style={{
            width:72, height:72, borderRadius:'50%',
            background:'rgba(232,255,90,0.12)',
            border:'1.5px solid rgba(232,255,90,0.4)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <polyline
                points="6,17 13,24 26,10"
                stroke="#e8ff5a" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="60" strokeDashoffset="60"
                style={{ animation:'checkDraw 0.5s 0.3s ease forwards' }}
              />
            </svg>
          </div>
        </div>

        <h3 style={{ fontSize:'1.6rem', fontWeight:800, letterSpacing:'-0.02em', marginBottom:10, color:'#fff',
          animation:'floatUp 0.5s 0.2s ease forwards', opacity:0 }}>
          Message Sent 🚀
        </h3>
        <p style={{ ...mono, fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.8, marginBottom:28,
          animation:'floatUp 0.5s 0.35s ease forwards', opacity:0 }}>
          Thanks for reaching out, {values.name.split(' ')[0] || 'friend'}!<br/>
          I'll get back to you within 24 hours.
        </p>

        <div style={{ display:'flex', justifyContent:'center', gap:16, flexWrap:'wrap',
          animation:'floatUp 0.5s 0.5s ease forwards', opacity:0 }}>
          {['Python','JavaScript','TypeScript','Go','React'].map((lang,i)=>(
            <span key={lang} style={{
              ...mono, fontSize:10, padding:'3px 10px',
              border:'1px solid rgba(232,255,90,0.2)', borderRadius:2,
              color:'rgba(255,255,255,0.4)', letterSpacing:'0.1em',
              animation:`floatUp 0.4s ${0.6+i*0.08}s ease forwards`, opacity:0,
            }}>{lang}</span>
          ))}
        </div>

        <button
          onClick={()=>{ setDone(false); setValues({name:'',email:'',subject:'',message:''}) }}
          onMouseDown={playClick}
          style={{
            ...mono, marginTop:32, fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase',
            padding:'10px 20px', border:'1px solid rgba(255,255,255,0.12)', borderRadius:2,
            background:'transparent', color:'rgba(255,255,255,0.4)', cursor:'pointer',
            transition:'all 0.2s',
          }}
        >Send Another →</button>
      </div>
    </>
  )

  return (
    <>
      {/* Confetti overlay */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:9999 }}>
        {particles.map(p=>(
          <div key={p.id} style={{
            position:'fixed', left:p.x, top:p.y, width:8, height:8, borderRadius:2,
            background:p.c, opacity:p.a, transform:'translate(-50%,-50%)',
            pointerEvents:'none',
          }}/>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <style>{`
          .cf-field { position:relative; margin-bottom:20px; }
          .cf-label {
            font-family:'Space Mono',monospace; font-size:10px;
            letter-spacing:0.18em; text-transform:uppercase;
            color:rgba(255,255,255,0.35); display:block; margin-bottom:6px;
            transition:color 0.2s;
          }
          .cf-field:focus-within .cf-label { color:#e8ff5a; }
          .cf-input {
            width:100%; background:rgba(255,255,255,0.03);
            border:1px solid rgba(255,255,255,0.10); border-radius:3px;
            padding:12px 16px; color:#fff; font-size:14px;
            font-family:'Space Mono',monospace;
            outline:none; transition:border-color 0.2s, box-shadow 0.2s;
          }
          .cf-input::placeholder { color:rgba(255,255,255,0.2); }
          .cf-input:focus {
            border-color:rgba(232,255,90,0.5);
            box-shadow:0 0 0 3px rgba(232,255,90,0.06), 0 0 20px rgba(232,255,90,0.08);
          }
          .cf-line {
            position:absolute; bottom:0; left:0;
            height:2px; width:0; background:var(--accent);
            transition:width 0.35s cubic-bezier(0.16,1,0.3,1);
            border-radius:0 0 2px 2px;
          }
          .cf-field:focus-within .cf-line { width:100%; }
          .cf-submit {
            width:100%; padding:16px; border:1px solid rgba(232,255,90,0.4);
            border-radius:3px; background:rgba(232,255,90,0.06);
            color:#e8ff5a; font-family:'Space Mono',monospace;
            font-size:12px; letter-spacing:0.18em; text-transform:uppercase;
            cursor:pointer; position:relative; overflow:hidden;
            transition:all 0.3s;
          }
          .cf-submit:not(:disabled):hover {
            background:rgba(232,255,90,0.14);
            border-color:rgba(232,255,90,0.7);
            box-shadow:0 0 30px rgba(232,255,90,0.15);
          }
          .cf-submit:disabled { opacity:0.6; cursor:default; }
          @keyframes scanLine {
            0%   { transform:translateY(-100%); }
            100% { transform:translateY(200%); }
          }
          .cf-scan {
            position:absolute; inset-x:0; height:40%; top:0;
            background:linear-gradient(to bottom,transparent,rgba(232,255,90,0.08),transparent);
            animation:scanLine 1.4s linear infinite;
            pointer-events:none;
          }
          @keyframes spin { to { transform:rotate(360deg); } }
          .cf-spinner {
            display:inline-block; width:14px; height:14px;
            border:2px solid rgba(232,255,90,0.3);
            border-top-color:#e8ff5a; border-radius:50%;
            animation:spin 0.7s linear infinite; vertical-align:middle; margin-right:8px;
          }
        `}</style>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }}>
          {FIELDS.map(f => (
            <div
              key={f.id}
              className="cf-field"
              style={{ gridColumn: f.id==='subject' ? '1/-1' : 'auto' }}
            >
              <label className="cf-label" htmlFor={f.id}>{f.label}</label>
              <input
                id={f.id} type={f.type} className="cf-input"
                placeholder={f.placeholder}
                value={(values as any)[f.id]}
                onChange={e=>setValues(v=>({...v,[f.id]:e.target.value}))}
                onFocus={()=>{ setFocused(f.id); playClick() }}
                onBlur={()=>setFocused(null)}
                required
              />
              <div className="cf-line"/>
            </div>
          ))}

          {/* Message */}
          <div className="cf-field" style={{ gridColumn:'1/-1' }}>
            <label className="cf-label" htmlFor="message">Message</label>
            <textarea
              id="message" className="cf-input"
              placeholder="Tell me about your project, idea, or just say hi..."
              rows={5}
              style={{ resize:'vertical', minHeight:100 }}
              value={values.message}
              onChange={e=>setValues(v=>({...v,message:e.target.value}))}
              onFocus={()=>{ setFocused('message'); playClick() }}
              onBlur={()=>setFocused(null)}
              required
            />
            <div className="cf-line"/>
          </div>
        </div>

        {/* Futuristic corner decorations */}
        <div style={{ position:'relative', marginTop:8 }}>
          <button
            ref={btnRef}
            type="submit"
            className="cf-submit"
            disabled={loading}
            onMouseDown={playClick}
          >
            {loading && <div className="cf-scan"/>}
            {loading
              ? <><span className="cf-spinner"/>Transmitting...</>
              : '⟶ Send Message'
            }
          </button>
        </div>

        {/* Corner decorations */}
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:10, opacity:0.25 }}>
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:'0.2em', color:'var(--accent)' }}>
            // SECURE CHANNEL
          </span>
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:'0.2em', color:'var(--accent)' }}>
            v2.0.25 //
          </span>
        </div>
      </form>
    </>
  )
}
