'use client'

import { AntiGravityCanvas } from "@/components/ui/particle-effect-for-hero"
import { AnimeNavBar }        from "@/components/ui/anime-navbar"
import OrbitingSkills         from "@/components/ui/orbiting-skills"
import { GlowingEffect }      from "@/components/ui/glowing-effect"
import { ContactForm }        from "@/components/ui/contact-form"
import { useState, useEffect, useRef, useCallback } from 'react'
import { Home, Layers, Briefcase, FolderOpen, Mail, Brain, Code2, Globe, Cpu } from 'lucide-react'
/* ─── cute sounds (inline Web Audio — no file deps) ─── */
function playClick() {
  try {
    const ac = new (window.AudioContext || (window as any).webkitAudioContext)()
    // double bubble pop
    ;[660, 1050].forEach((freq, i) => {
      const o = ac.createOscillator(), g = ac.createGain()
      o.type = 'sine'
      o.connect(g); g.connect(ac.destination)
      const t = ac.currentTime + i * 0.045
      o.frequency.setValueAtTime(freq, t)
      o.frequency.exponentialRampToValueAtTime(freq * 1.4, t + 0.07)
      g.gain.setValueAtTime(0.10, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.13)
      o.start(t); o.stop(t + 0.14)
    })
  } catch {}
}
function playModalOpen() {
  try {
    const ac = new (window.AudioContext || (window as any).webkitAudioContext)()
    // rising sparkle arpeggio
    ;[523, 659, 784, 1047].forEach((freq, i) => {
      const o = ac.createOscillator(), g = ac.createGain()
      o.type = 'sine'
      o.connect(g); g.connect(ac.destination)
      const t = ac.currentTime + i * 0.07
      o.frequency.value = freq
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.10, t + 0.03)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
      o.start(t); o.stop(t + 0.19)
    })
  } catch {}
}
function playModalClose() {
  try {
    const ac = new (window.AudioContext || (window as any).webkitAudioContext)()
    // descending soft whoosh
    ;[700, 500, 350].forEach((freq, i) => {
      const o = ac.createOscillator(), g = ac.createGain()
      o.type = 'sine'
      o.connect(g); g.connect(ac.destination)
      const t = ac.currentTime + i * 0.055
      o.frequency.setValueAtTime(freq, t)
      o.frequency.exponentialRampToValueAtTime(freq * 0.7, t + 0.08)
      g.gain.setValueAtTime(0.07, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.10)
      o.start(t); o.stop(t + 0.11)
    })
  } catch {}
}

/* ─── two-phase typing hook ───
   Phase 1: type "Rahul Upadhyay" once, keep it.
   Phase 2: cycle through designations below the name.
*/
const DESIGNATIONS = [
  'Software Developer',
  'Gen AI Engineer',
  'Full Stack Dev',
  'Problem Solver',
]

function useTwoPhaseTyping(name: string, speed = 70) {
  const [nameDisplay, setNameDisplay] = useState('')
  const [desgDisplay, setDesgDisplay] = useState('')
  const [phase,  setPhase]  = useState<'name'|'desg'>('name')
  const [di,     setDi]     = useState(0)          // designation index
  const [ci,     setCi]     = useState(0)          // char index
  const [erasing, setErasing] = useState(false)

  /* Phase 1 – type the name once */
  useEffect(() => {
    if (phase !== 'name') return
    if (ci < name.length) {
      const t = setTimeout(() => {
        setNameDisplay(name.slice(0, ci + 1))
        setCi(c => c + 1)
      }, speed)
      return () => clearTimeout(t)
    } else {
      // name done – start designation phase after short pause
      const t = setTimeout(() => { setCi(0); setPhase('desg') }, 600)
      return () => clearTimeout(t)
    }
  }, [phase, ci, name, speed])

  /* Phase 2 – cycle designations */
  useEffect(() => {
    if (phase !== 'desg') return
    const word = DESIGNATIONS[di]

    if (!erasing) {
      if (ci < word.length) {
        const t = setTimeout(() => {
          setDesgDisplay(word.slice(0, ci + 1))
          setCi(c => c + 1)
        }, speed)
        return () => clearTimeout(t)
      } else {
        // pause at full word
        const t = setTimeout(() => setErasing(true), 1600)
        return () => clearTimeout(t)
      }
    } else {
      if (ci > 0) {
        const t = setTimeout(() => {
          setDesgDisplay(word.slice(0, ci - 1))
          setCi(c => c - 1)
        }, speed / 2)
        return () => clearTimeout(t)
      } else {
        setErasing(false)
        setDi(d => (d + 1) % DESIGNATIONS.length)
      }
    }
  }, [phase, ci, di, erasing, speed])

  return { nameDisplay, desgDisplay, nameComplete: phase === 'desg' }
}

/* ─── nav ─── */
const NAV = [
  { name:'Home',       url:'#home',       icon:Home },
  { name:'Stacks',     url:'#stacks',     icon:Layers },
  { name:'Experience', url:'#experience', icon:Briefcase },
  { name:'Projects',   url:'#projects',   icon:FolderOpen },
  { name:'Contact Me', url:'#contact-me', icon:Mail },
]

export default function PortfolioPage() {
  const [ready,       setReady]       = useState(false)
  const [showContact, setShowContact] = useState(false)
  const { nameDisplay, desgDisplay, nameComplete } = useTwoPhaseTyping('Rahul Upadhyay')

  useEffect(() => { const t = setTimeout(() => setReady(true), 200); return () => clearTimeout(t) }, [])

  const scrollTo = (name: string) => {
    playClick()
    const id = name.toLowerCase().replace(/ /g, '-')
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const openContact  = () => { playModalOpen();  setShowContact(true)  }
  const closeContact = () => { playModalClose(); setShowContact(false) }

  return (
    <div style={{ background:'#000', color:'#fff', minHeight:'100vh', overflowX:'hidden', fontFamily:"'Syne',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap');

        :root { --a:#e8ff5a; --a2:#5affea; --b:rgba(255,255,255,.10); }
        *, *::before, *::after { box-sizing:border-box; }
        html { scroll-behavior:smooth; }
        ::selection { background:var(--a); color:#000; }
        .mono { font-family:'Space Mono',monospace; }

        @keyframes shine {
          0%  { transform:translateX(-100%); }
          50% { transform:translateX(100%);  }
          100%{ transform:translateX(-100%); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        .fu  { animation:fadeUp .7s ease forwards; }
        .d1  { animation-delay:.05s; opacity:0; }
        .d2  { animation-delay:.18s; opacity:0; }
        .d3  { animation-delay:.32s; opacity:0; }
        .d4  { animation-delay:.46s; opacity:0; }
        .d5  { animation-delay:.60s; opacity:0; }

        /* blinking cursor */
        .cursor::after {
          content:'|'; color:var(--a);
          animation:blink 1s step-end infinite; margin-left:2px;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        /* hero name */
        .hero-name {
          font-size:clamp(42px,7vw,96px);
          font-weight:800; line-height:.95; letter-spacing:-.03em;
          color:#fff; text-shadow:0 0 60px rgba(232,255,90,.18);
        }
        /* designation line */
        .hero-desg {
          font-family:'Space Mono',monospace;
          font-size:clamp(13px,1.6vw,18px);
          color:var(--a); letter-spacing:.08em; min-height:1.4em;
        }

        .tag {
          display:inline-block; padding:4px 14px;
          border:1px solid var(--b); border-radius:2px;
          font-size:10px; letter-spacing:.18em; text-transform:uppercase;
          font-family:'Space Mono',monospace; color:rgba(255,255,255,.38);
        }

        .section-label {
          font-family:'Space Mono',monospace; font-size:10px;
          letter-spacing:.2em; text-transform:uppercase;
          color:var(--a); margin-bottom:12px;
          display:flex; align-items:center; gap:12px;
        }
        .section-label::after { content:''; flex:1; max-width:36px; height:1px; background:var(--a); opacity:.35; }

        .divider { height:1px; background:var(--b); margin:80px 0; }

        .pill {
          display:inline-flex; align-items:center; gap:6px;
          padding:7px 14px; border:1px solid var(--b); border-radius:2px;
          font-size:12px; font-family:'Space Mono',monospace;
          color:rgba(255,255,255,.58); background:rgba(255,255,255,.02);
          transition:all .2s; cursor:default;
        }
        .pill:hover { border-color:var(--a); color:var(--a); background:rgba(232,255,90,.04); }

        .exp-card {
          border:1px solid var(--b); padding:26px 30px;
          position:relative; transition:border-color .3s;
          background:rgba(255,255,255,.01);
        }
        .exp-card:hover { border-color:rgba(255,255,255,.22); }
        .exp-card::before {
          content:''; position:absolute; left:0; top:0; bottom:0; width:2px;
          background:var(--a); transform:scaleY(0);
          transition:transform .3s; transform-origin:bottom;
        }
        .exp-card:hover::before { transform:scaleY(1); }

        .proj-ghost {
          font-family:'Space Mono',monospace; font-size:44px; font-weight:700;
          color:rgba(255,255,255,.04); position:absolute; top:14px; right:18px;
          line-height:1; pointer-events:none;
        }

        /* CTA ghost button */
        .btn {
          display:inline-flex; align-items:center; gap:9px;
          padding:13px 24px; border:1px solid var(--b);
          text-decoration:none; color:rgba(255,255,255,.68);
          font-family:'Space Mono',monospace; font-size:11px;
          letter-spacing:.1em; text-transform:uppercase;
          position:relative; overflow:hidden; border-radius:2px;
          cursor:pointer; background:transparent; transition:color .25s, border-color .25s;
        }
        .btn::before {
          content:''; position:absolute; inset:0;
          background:var(--a); transform:scaleX(0);
          transform-origin:left; transition:transform .28s ease; z-index:0;
        }
        .btn:hover::before { transform:scaleX(1); }
        .btn:hover { color:#000; border-color:var(--a); }
        .btn > * { position:relative; z-index:1; }
        .btn .arr { transition:transform .22s; }
        .btn:hover .arr { transform:translateX(4px); }

        /* CTA accent (filled) */
        .btn-accent {
          display:inline-flex; align-items:center; gap:9px;
          padding:13px 24px; border:1px solid var(--a);
          text-decoration:none; color:#000;
          font-family:'Space Mono',monospace; font-size:11px;
          letter-spacing:.1em; text-transform:uppercase;
          position:relative; overflow:hidden; border-radius:2px;
          cursor:pointer; background:var(--a); transition:all .25s;
        }
        .btn-accent:hover { background:transparent; color:var(--a); }
        .btn-accent .arr { transition:transform .22s; }
        .btn-accent:hover .arr { transform:translateX(4px); }

        /* modal */
        .overlay {
          position:fixed; inset:0; z-index:1000;
          background:rgba(0,0,0,.88); backdrop-filter:blur(10px);
          display:flex; align-items:center; justify-content:center;
          padding:20px; animation:fadeIn .22s ease;
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .modal {
          position:relative; width:100%; max-width:580px;
          max-height:90vh; overflow-y:auto;
          background:#080808; border:1px solid rgba(232,255,90,.18);
          border-radius:6px; padding:36px;
          animation:modalIn .32s cubic-bezier(.16,1,.3,1);
        }
        @keyframes modalIn {
          from { opacity:0; transform:scale(.9) translateY(18px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        .bracket { position:absolute; width:14px; height:14px; border-color:rgba(232,255,90,.22); border-style:solid; }
        .btl { top:0; left:0;  border-width:1px 0 0 1px; }
        .btr { top:0; right:0; border-width:1px 1px 0 0; }
        .bbl { bottom:0; left:0;  border-width:0 0 1px 1px; }
        .bbr { bottom:0; right:0; border-width:0 1px 1px 0; }

        @keyframes hintPulse {
          0%,100%{ opacity:.22; transform:translateX(-50%) translateY(0); }
          50%    { opacity:.5;  transform:translateX(-50%) translateY(-4px); }
        }
        .hint { animation:hintPulse 2.6s ease-in-out infinite; }
      `}</style>

      {/* ── NAVBAR ── */}
      <AnimeNavBar items={NAV} defaultActive="Home" onNavigate={scrollTo} />

      {/* ── HERO ── */}
      <section
        id="home"
        style={{ position:'relative', minHeight:'100vh', overflow:'hidden' }}
      >
        {/* ★ Particle canvas fills the section via absolute inset:0 */}
        <AntiGravityCanvas />

        {/* Gradient overlay */}
        <div style={{
          position:'absolute', inset:0, zIndex:1, pointerEvents:'none',
          background:'linear-gradient(to bottom, rgba(0,0,0,.22) 0%, rgba(0,0,0,.08) 18%, rgba(0,0,0,.5) 65%, #000 100%)',
        }}/>

        {/* Content */}
        <div style={{
          position:'relative', zIndex:2,
          maxWidth:900, margin:'0 auto', padding:'0 28px',
          minHeight:'100vh', display:'flex', flexDirection:'column',
          justifyContent:'center', paddingTop:120, paddingBottom:80,
        }}>
          {ready && <div className="fu d1" style={{marginBottom:20}}><span className="tag">Available for work</span></div>}

          {ready && (
            <div className="fu d2" style={{marginBottom:12}}>
              {/* Name — typed once, stays */}
              <div className="hero-name" style={{ marginBottom:14 }}>
                {nameDisplay}
                {!nameComplete && <span style={{color:'var(--a)',animation:'blink 1s step-end infinite'}}>|</span>}
              </div>
              {/* Designation — cycles after name is done */}
              {nameComplete && (
                <div className="hero-desg cursor">{desgDisplay || '\u00a0'}</div>
              )}
            </div>
          )}

          {ready && (
            <p className="mono fu d3" style={{
              fontSize:13, color:'rgba(255,255,255,.4)', maxWidth:420,
              lineHeight:1.9, marginBottom:32, marginTop:16,
            }}>
              Building intelligent systems at the intersection<br/>
              of code and language models.
            </p>
          )}

          {/* Stats */}
          {ready && (
            <div className="fu d4" style={{display:'flex',gap:32,marginBottom:36}}>
              {[['3+','Years Exp'],['20+','Projects'],['12+','Languages']].map(([v,l])=>(
                <div key={l}>
                  <div style={{fontSize:'1.55rem',fontWeight:800,color:'var(--a)',lineHeight:1}}>{v}</div>
                  <div className="mono" style={{fontSize:9,color:'rgba(255,255,255,.28)',letterSpacing:'.12em',marginTop:4}}>{l}</div>
                </div>
              ))}
            </div>
          )}

          {/* Buttons */}
          {ready && (
            <div className="fu d5" style={{display:'flex',gap:12,flexWrap:'wrap'}}>
              <button className="btn-accent" onMouseDown={playClick} onClick={openContact}>
                Contact Me <span className="arr">→</span>
              </button>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                className="btn" onMouseDown={playClick}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn <span className="arr">→</span>
              </a>
              <a href="mailto:rahul.upadhyay@gmail.com" className="btn" onMouseDown={playClick}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Gmail <span className="arr">→</span>
              </a>
            </div>
          )}
        </div>

        {/* Scroll hint */}
        <div className="hint" style={{position:'absolute',bottom:26,left:'50%',zIndex:2,display:'flex',flexDirection:'column',alignItems:'center',gap:5,pointerEvents:'none'}}>
          <span className="mono" style={{fontSize:8,letterSpacing:'.2em',color:'rgba(255,255,255,.2)'}}>SCROLL</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="1.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
        </div>
      </section>

      {/* ── CONTACT MODAL ── */}
      {showContact && (
        <div className="overlay" onClick={e=>{ if(e.target===e.currentTarget) closeContact() }}>
          <div className="modal">
            <div className="bracket btl"/><div className="bracket btr"/>
            <div className="bracket bbl"/><div className="bracket bbr"/>
            <button onMouseDown={playModalClose} onClick={closeContact}
              style={{position:'absolute',top:14,right:14,background:'transparent',
                border:'1px solid rgba(255,255,255,.12)',color:'rgba(255,255,255,.4)',
                width:30,height:30,borderRadius:2,cursor:'pointer',fontSize:16,
                display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
            <div className="section-label" style={{marginBottom:6}}>// Contact</div>
            <h3 style={{fontSize:'1.5rem',fontWeight:800,letterSpacing:'-.02em',marginBottom:6}}>Let's Talk</h3>
            <p className="mono" style={{fontSize:11,color:'rgba(255,255,255,.32)',marginBottom:26,lineHeight:1.7}}>
              Fill in the form — I'll reply within 24 hours.
            </p>
            <ContactForm />
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div style={{maxWidth:1100,margin:'0 auto',padding:'0 28px'}}>

        {/* STACKS */}
        <section id="stacks" style={{padding:'96px 0'}}>
          <div className="section-label">02 — Stacks</div>
          <h2 style={{fontSize:'2.1rem',fontWeight:800,letterSpacing:'-.02em',marginBottom:8}}>What I Build With</h2>
          <p className="mono" style={{fontSize:12,color:'rgba(255,255,255,.3)',marginBottom:52}}>Hover to inspect · pause to explore</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:48,alignItems:'center'}}>
            <div style={{flex:'1 1 440px',display:'flex',justifyContent:'center'}}>
              <OrbitingSkills/>
            </div>
            <div style={{flex:'1 1 240px',display:'flex',flexDirection:'column',gap:26}}>
              {[
                {cat:'Frontend',    icon:<Globe size={13}/>, items:['React','Next.js','TypeScript','Tailwind CSS','HTML5']},
                {cat:'Backend & DB',icon:<Cpu size={13}/>,   items:['Node.js','Python','FastAPI','MongoDB','PostgreSQL']},
                {cat:'AI & Tools',  icon:<Brain size={13}/>, items:['Gen AI','LangChain','OpenAI API','Claude API','Git','Docker']},
              ].map(g=>(
                <div key={g.cat}>
                  <div style={{display:'flex',alignItems:'center',gap:8,color:'var(--a)',marginBottom:9}}>
                    {g.icon}
                    <span className="mono" style={{fontSize:10,letterSpacing:'.18em',textTransform:'uppercase'}}>{g.cat}</span>
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
                    {g.items.map(i=><span key={i} className="pill">{i}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="divider"/>

        {/* EXPERIENCE */}
        <section id="experience" style={{paddingBottom:96}}>
          <div className="section-label">03 — Experience</div>
          <h2 style={{fontSize:'2.1rem',fontWeight:800,letterSpacing:'-.02em',marginBottom:8}}>Where I've Worked</h2>
          <p className="mono" style={{fontSize:12,color:'rgba(255,255,255,.3)',marginBottom:44}}>My professional journey</p>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {[
              {role:'Software Developer — Gen AI',company:'Current Position',period:'2023 — Present',
               desc:'Building production-grade Gen AI systems, LLM-powered workflows, and intelligent automation tools.',
               tags:['LLMs','RAG','Python','Next.js','Anthropic']},
              {role:'Full Stack Developer',company:'Previous Role',period:'2021 — 2023',
               desc:'Designed and shipped end-to-end web applications with React and Node.js.',
               tags:['React','Node.js','MongoDB','REST APIs']},
              {role:'Junior Developer',company:'Early Career',period:'2020 — 2021',
               desc:'Contributed to frontend features and bug fixes. Learned fundamentals of software delivery.',
               tags:['JavaScript','HTML/CSS','Git']},
            ].map((e,i)=>(
              <div key={i} className="exp-card">
                <div style={{display:'flex',flexWrap:'wrap',justifyContent:'space-between',gap:8,marginBottom:10}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:'1rem',marginBottom:3}}>{e.role}</div>
                    <span className="mono" style={{fontSize:11,color:'rgba(255,255,255,.28)'}}>{e.company}</span>
                  </div>
                  <span className="tag">{e.period}</span>
                </div>
                <p style={{fontSize:13,color:'rgba(255,255,255,.4)',lineHeight:1.8,marginBottom:12}}>{e.desc}</p>
                <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
                  {e.tags.map(t=><span key={t} className="pill" style={{fontSize:10,padding:'3px 9px'}}>{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="divider"/>

        {/* PROJECTS */}
        <section id="projects" style={{paddingBottom:96}}>
          <div className="section-label">04 — Projects</div>
          <h2 style={{fontSize:'2.1rem',fontWeight:800,letterSpacing:'-.02em',marginBottom:8}}>Things I've Built</h2>
          <p className="mono" style={{fontSize:12,color:'rgba(255,255,255,.3)',marginBottom:44}}>Hover cards to reveal the glow</p>
          <ul style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))',gap:14,listStyle:'none',padding:0,margin:0}}>
            {[
              {title:'AI Code Review Agent',  desc:'Autonomous agent that reviews PRs and generates summaries using Claude API.',   tags:['Claude API','Python','GitHub'],   accent:'var(--a)',  icon:<Brain size={14}/>},
              {title:'RAG Document Assistant',desc:'Query internal docs in natural language. LangChain + pgvector under the hood.', tags:['LangChain','pgvector','FastAPI'],  accent:'var(--a2)', icon:<Cpu size={14}/>},
              {title:'Dev Portfolio OS',      desc:'This site — particles, orbiting skills, glowing cards, typing effects.',         tags:['Next.js','Canvas','TypeScript'],  accent:'var(--a)',  icon:<Code2 size={14}/>},
              {title:'LLM Prompt Playground', desc:'Test, version and compare prompts. Tracks latency, cost, quality.',            tags:['React','OpenAI','Anthropic'],      accent:'var(--a2)', icon:<Brain size={14}/>},
              {title:'Global Edge Dashboard', desc:'Real-time monitoring with interactive 3D globe and live latency stats.',        tags:['Next.js','MongoDB','WebGL'],       accent:'var(--a)',  icon:<Globe size={14}/>},
              {title:'AI Chat SDK',           desc:'Drop-in SDK for LLM-powered chat. Supports OpenAI, Claude, local models.',     tags:['TypeScript','Node.js','SDK'],      accent:'var(--a2)', icon:<Cpu size={14}/>},
            ].map((p,i)=>(
              <li key={i} style={{minHeight:'12rem',listStyle:'none'}}>
                <div style={{position:'relative',height:'100%',borderRadius:18,border:'1px solid var(--b)',padding:7}}>
                  <GlowingEffect spread={36} glow={true} disabled={false} proximity={60} inactiveZone={0.01} borderWidth={2}/>
                  <div style={{position:'relative',height:'100%',minHeight:170,borderRadius:11,
                    border:'1px solid var(--b)',background:'rgba(255,255,255,.01)',padding:22,
                    display:'flex',flexDirection:'column',gap:9}}>
                    <div className="proj-ghost">0{i+1}</div>
                    <div style={{display:'flex',alignItems:'center',gap:7,color:p.accent}}>
                      {p.icon}
                      <span className="mono" style={{fontSize:9,letterSpacing:'.15em',textTransform:'uppercase'}}>{p.tags[0]}</span>
                    </div>
                    <div style={{fontWeight:700,fontSize:'.95rem',letterSpacing:'-.01em'}}>{p.title}</div>
                    <p style={{fontSize:12,color:'rgba(255,255,255,.38)',lineHeight:1.7,flex:1}}>{p.desc}</p>
                    <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                      {p.tags.slice(1).map(t=><span key={t} className="pill" style={{fontSize:10,padding:'3px 8px'}}>{t}</span>)}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="divider"/>

        {/* CONTACT */}
        <section id="contact-me" style={{paddingBottom:120}}>
          <div className="section-label">05 — Contact</div>
          <h2 style={{fontSize:'2.1rem',fontWeight:800,letterSpacing:'-.02em',marginBottom:8}}>Get In Touch</h2>
          <p className="mono" style={{fontSize:12,color:'rgba(255,255,255,.3)',marginBottom:36}}>Open to collaborations, roles &amp; conversations</p>

          <div style={{display:'flex',flexWrap:'wrap',gap:10,marginBottom:52}}>
            {[
              {href:'https://linkedin.com/in/rahul-upadhyay',label:'LinkedIn',
               icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>},
              {href:'mailto:rahul.upadhyay@gmail.com',label:'Gmail',
               icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>},
              {href:'https://twitter.com/rahul_upadhyay',label:'Twitter / X',
               icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>},
            ].map(l=>(
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                className="btn" onMouseDown={playClick}>
                {l.icon}{l.label}<span className="arr">→</span>
              </a>
            ))}
          </div>

          {/* Big glowing CTA */}
          <div style={{position:'relative',border:'1px solid var(--b)',borderRadius:5,background:'rgba(255,255,255,.01)',padding:'38px 36px'}}>
            <div className="bracket btl"/><div className="bracket btr"/>
            <div className="bracket bbl"/><div className="bracket bbr"/>
            <GlowingEffect spread={55} glow={true} disabled={false} proximity={75} inactiveZone={0.01} borderWidth={2}/>
            <div style={{position:'relative',zIndex:1}}>
              <p className="mono" style={{fontSize:9,letterSpacing:'.22em',textTransform:'uppercase',color:'var(--a)',marginBottom:12}}>// let's build together</p>
              <h3 style={{fontSize:'clamp(1.35rem,2.8vw,1.9rem)',fontWeight:800,letterSpacing:'-.02em',marginBottom:22}}>
                Have a project in mind?<br/>
                <span style={{color:'rgba(255,255,255,.28)'}}>I'd love to hear about it.</span>
              </h3>
              <button className="btn-accent" onMouseDown={playClick} onClick={openContact}>
                Open Contact Form <span className="arr">→</span>
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* FOOTER */}
      <footer style={{borderTop:'1px solid var(--b)',padding:'20px 0'}}>
        <div style={{maxWidth:1100,margin:'0 auto',padding:'0 28px',display:'flex',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:10}}>
          <span className="mono" style={{fontSize:10,color:'rgba(255,255,255,.16)'}}>© 2025 Rahul Upadhyay</span>
          <span className="mono" style={{fontSize:10,color:'rgba(255,255,255,.16)'}}>Software Developer · Gen AI Engineer</span>
        </div>
      </footer>
    </div>
  )
}

export { PortfolioPage as SpiralDemo }