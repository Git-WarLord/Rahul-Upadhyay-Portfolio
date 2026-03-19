"use client"

import React, { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem { name: string; url: string; icon: LucideIcon }
interface NavBarProps {
  items: NavItem[]
  className?: string
  defaultActive?: string
  onNavigate?: (name: string) => void
}

/* ─── cute sounds (inline, no file deps) ─── */
function playNavClick() {
  try {
    const ac = new (window.AudioContext || (window as any).webkitAudioContext)()
    // bubbly "pop" — two quick sine tones
    ;[880, 1320].forEach((freq, i) => {
      const o = ac.createOscillator(), g = ac.createGain()
      o.type = 'sine'
      o.connect(g); g.connect(ac.destination)
      o.frequency.setValueAtTime(freq, ac.currentTime + i * 0.04)
      o.frequency.exponentialRampToValueAtTime(freq * 1.3, ac.currentTime + i * 0.04 + 0.06)
      g.gain.setValueAtTime(0.10, ac.currentTime + i * 0.04)
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + i * 0.04 + 0.12)
      o.start(ac.currentTime + i * 0.04)
      o.stop(ac.currentTime + i * 0.04 + 0.13)
    })
  } catch {}
}

function playHoverSound() {
  try {
    const ac = new (window.AudioContext || (window as any).webkitAudioContext)()
    const o = ac.createOscillator(), g = ac.createGain()
    o.type = 'sine'
    o.connect(g); g.connect(ac.destination)
    o.frequency.setValueAtTime(600, ac.currentTime)
    o.frequency.exponentialRampToValueAtTime(900, ac.currentTime + 0.05)
    g.gain.setValueAtTime(0.05, ac.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.07)
    o.start(); o.stop(ac.currentTime + 0.08)
  } catch {}
}

export function AnimeNavBar({ items, className, defaultActive = "Home", onNavigate }: NavBarProps) {
  const [mounted,    setMounted]    = useState(false)
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)
  const [activeTab,  setActiveTab]  = useState<string>(defaultActive)
  const [scrolled,   setScrolled]   = useState(false)
  const manualRef = useRef(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn, { passive: true })
    fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const observers: IntersectionObserver[] = []
    items.forEach(item => {
      const id = item.url.replace('#', '')
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !manualRef.current) setActiveTab(item.name)
      }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 })
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [mounted, items])

  const handleClick = (item: NavItem) => {
    playNavClick()
    setActiveTab(item.name)
    manualRef.current = true
    setTimeout(() => { manualRef.current = false }, 1000)
    onNavigate?.(item.name)
  }

  if (!mounted) return null

  return (
    /*
      KEY FIX: padding-top:72px gives room for the 52px mascot above the pill.
      overflow:visible on every ancestor so the mascot isn't clipped.
    */
    <div
      className={cn("fixed top-0 left-0 right-0 z-[9999] flex justify-center", className)}
      style={{ paddingTop: 16, overflow: 'visible', pointerEvents: 'none' }}
    >
      <motion.nav
        style={{
          pointerEvents  : 'auto',
          display        : 'flex',
          alignItems     : 'center',
          gap            : 2,
          padding        : '5px 6px',
          borderRadius   : 9999,
          border         : '1px solid rgba(255,255,255,0.13)',
          background     : scrolled ? 'rgba(8,8,8,0.82)' : 'rgba(8,8,8,0.52)',
          backdropFilter : 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow      : scrolled
            ? '0 2px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)'
            : '0 2px 12px rgba(0,0,0,0.3)',
          transition     : 'background 0.35s, box-shadow 0.35s',
          overflow       : 'visible',   // ← mascot must not be clipped
          position       : 'relative',
          marginTop      : 52,          // ← push nav down so mascot has space above
        }}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0,    opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.15 }}
      >
        {items.map(item => {
          const Icon     = item.icon
          const isActive = activeTab  === item.name
          const isHover  = hoveredTab === item.name

          return (
            <button
              key={item.name}
              onClick={() => handleClick(item)}
              onMouseEnter={() => { setHoveredTab(item.name); playHoverSound() }}
              onMouseLeave={() => setHoveredTab(null)}
              style={{
                position     : 'relative',
                display      : 'flex',
                alignItems   : 'center',
                justifyContent: 'center',
                gap          : 6,
                /* desktop: icon + text  |  mobile: icon only */
                padding      : '9px 16px',
                borderRadius : 9999,
                border       : 'none',
                background   : 'transparent',
                cursor       : 'pointer',
                fontFamily   : "'Space Mono', monospace",
                fontSize     : 11,
                letterSpacing: '0.05em',
                fontWeight   : 600,
                color        : isActive ? '#ffffff' : 'rgba(255,255,255,0.45)',
                transition   : 'color 0.2s',
                outline      : 'none',
                whiteSpace   : 'nowrap',
                overflow     : 'visible',
              }}
            >
              {/* Sliding active pill */}
              {isActive && (
                <motion.span
                  layoutId="active-pill"
                  style={{
                    position    : 'absolute',
                    inset       : 0,
                    borderRadius: 9999,
                    background  : 'rgba(232,255,90,0.13)',
                    border      : '1px solid rgba(232,255,90,0.28)',
                    boxShadow   : '0 0 14px rgba(232,255,90,0.10)',
                    zIndex      : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                />
              )}

              {/* Hover bg */}
              <AnimatePresence>
                {isHover && !isActive && (
                  <motion.span
                    key="hov"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.14 }}
                    style={{
                      position    : 'absolute',
                      inset       : 0,
                      borderRadius: 9999,
                      background  : 'rgba(255,255,255,0.06)',
                      zIndex      : 0,
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Icon — always visible */}
              <span style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', flexShrink:0 }}>
                <Icon
                  size={15}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  style={{
                    color     : isActive ? '#e8ff5a' : 'rgba(255,255,255,0.5)',
                    transition: 'color 0.2s',
                  }}
                />
              </span>

              {/* Label — hidden below 480px, visible on sm+ */}
              <span
                style={{
                  position : 'relative',
                  zIndex   : 1,
                  // hide on mobile
                  display  : 'none',
                }}
                className="sm:block"
              >
                {item.name}
              </span>

              {/* ── Mascot above active tab ── */}
              {isActive && (
                <motion.div
                  layoutId="mascot"
                  style={{
                    position     : 'absolute',
                    top          : -58,        // sits above the pill
                    left         : '50%',
                    transform    : 'translateX(-50%)',
                    pointerEvents: 'none',
                    zIndex       : 20,
                    overflow     : 'visible',
                  }}
                  transition={{ type:'spring', stiffness:340, damping:28 }}
                >
                  {/* Face */}
                  <motion.div
                    style={{
                      width       : 38,
                      height      : 38,
                      borderRadius: '50%',
                      background  : 'linear-gradient(135deg,#fff 60%,#f0f0f0)',
                      position    : 'relative',
                      margin      : '0 auto',
                      boxShadow   : '0 2px 12px rgba(232,255,90,0.25)',
                    }}
                    animate={isHover
                      ? { scale:[1,1.15,1], rotate:[0,-7,7,0], transition:{ duration:.4, ease:'easeInOut' } }
                      : { y:[0,-3,0], transition:{ duration:1.8, repeat:Infinity, ease:'easeInOut' } }
                    }
                  >
                    {/* Left eye */}
                    <motion.div
                      style={{ position:'absolute', width:6, height:6, borderRadius:'50%', background:'#1a1a1a', left:'23%', top:'36%' }}
                      animate={isHover ? { scaleY:[1,.08,1], transition:{ duration:.18, times:[0,.5,1] } } : {}}
                    />
                    {/* Right eye */}
                    <motion.div
                      style={{ position:'absolute', width:6, height:6, borderRadius:'50%', background:'#1a1a1a', right:'23%', top:'36%' }}
                      animate={isHover ? { scaleY:[1,.08,1], transition:{ duration:.18, times:[0,.5,1] } } : {}}
                    />
                    {/* Eye shine left */}
                    <div style={{ position:'absolute', width:2, height:2, borderRadius:'50%', background:'#fff', left:'28%', top:'38%', zIndex:1 }}/>
                    {/* Eye shine right */}
                    <div style={{ position:'absolute', width:2, height:2, borderRadius:'50%', background:'#fff', right:'28%', top:'38%', zIndex:1 }}/>
                    {/* Left cheek */}
                    <div style={{ position:'absolute', width:7, height:5, borderRadius:'50%', background:'#ffb3c1', opacity:.75, left:'8%', top:'54%' }}/>
                    {/* Right cheek */}
                    <div style={{ position:'absolute', width:7, height:5, borderRadius:'50%', background:'#ffb3c1', opacity:.75, right:'8%', top:'54%' }}/>
                    {/* Mouth */}
                    <motion.div
                      style={{ position:'absolute', width:13, height:7, borderBottom:'2.5px solid #1a1a1a', borderRadius:'0 0 8px 8px', left:'30%', top:'55%' }}
                      animate={isHover ? { scaleY:1.6, y:-1 } : { scaleY:1, y:0 }}
                      transition={{ duration:.15 }}
                    />
                    {/* Sparkles on hover */}
                    <AnimatePresence>
                      {isHover && (
                        <>
                          <motion.span
                            key="sp1"
                            initial={{ opacity:0, scale:0, x:0, y:0 }}
                            animate={{ opacity:1, scale:1, x:4, y:-4 }}
                            exit={{ opacity:0, scale:0 }}
                            style={{ position:'absolute', top:-2, right:-4, fontSize:11, zIndex:2 }}
                          >✨</motion.span>
                          <motion.span
                            key="sp2"
                            initial={{ opacity:0, scale:0, x:0, y:0 }}
                            animate={{ opacity:1, scale:1, x:-4, y:-6 }}
                            exit={{ opacity:0, scale:0 }}
                            transition={{ delay:.08 }}
                            style={{ position:'absolute', top:-4, left:-2, fontSize:10, zIndex:2 }}
                          >⭐</motion.span>
                        </>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Diamond connector tail */}
                  <motion.div
                    style={{
                      width       : 10,
                      height      : 10,
                      background  : '#ffffff',
                      transform   : 'rotate(45deg)',
                      margin      : '-3px auto 0',
                      boxShadow   : '0 2px 6px rgba(232,255,90,0.2)',
                    }}
                    animate={isHover
                      ? { y:[0,-5,0], transition:{ duration:.28, repeat:Infinity, repeatType:'reverse' } }
                      : { y:[0,2,0],  transition:{ duration:1, repeat:Infinity, ease:'easeInOut', delay:.4 } }
                    }
                  />
                </motion.div>
              )}
            </button>
          )
        })}
      </motion.nav>
    </div>
  )
}
