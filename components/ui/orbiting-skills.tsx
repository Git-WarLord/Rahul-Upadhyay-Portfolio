"use client"
import React, { useEffect, useState, memo } from 'react';

type IconType = 'html' | 'css' | 'javascript' | 'react' | 'node' | 'tailwind' | 'nextjs' | 'mongodb' | 'git' | 'genai' | 'typescript' | 'python';
type GlowColor = 'cyan' | 'purple' | 'yellow';

interface SkillIconProps { type: IconType }
interface SkillConfig { id: string; orbitRadius: number; size: number; speed: number; iconType: IconType; phaseShift: number; glowColor: GlowColor; label: string }
interface OrbitingSkillProps { config: SkillConfig; angle: number }
interface GlowingOrbitPathProps { radius: number; glowColor?: GlowColor; animationDelay?: number }

const iconComponents: Record<IconType, { component: () => React.JSX.Element; color: string }> = {
  html: {
    component: () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z" fill="#E34F26"/></svg>),
    color: '#E34F26'
  },
  css: {
    component: () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622 10.125.002-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.956-.81-.188-2.11h-2.61l.29 3.751L12 19.351l5.379-1.443.744-8.157z" fill="#1572B6"/></svg>),
    color: '#1572B6'
  },
  javascript: {
    component: () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><rect width="24" height="24" fill="#F7DF1E"/><path d="M22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="#323330"/></svg>),
    color: '#F7DF1E'
  },
  react: {
    component: () => (<svg viewBox="0 0 24 24" fill="none" className="w-full h-full"><g stroke="#61DAFB" strokeWidth="1" fill="none"><circle cx="12" cy="12" r="2.05" fill="#61DAFB"/><ellipse cx="12" cy="12" rx="11" ry="4.2"/><ellipse cx="12" cy="12" rx="11" ry="4.2" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="11" ry="4.2" transform="rotate(120 12 12)"/></g></svg>),
    color: '#61DAFB'
  },
  node: {
    component: () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M11.998 24c-.321 0-.641-.084-.922-.247l-2.936-1.737c-.438-.245-.224-.332-.08-.383.585-.203.703-.25 1.328-.602.065-.037.151-.023.218.017l2.256 1.339c.082.045.198.045.275 0l8.795-5.076c.082-.047.135-.141.135-.241V6.921c0-.103-.055-.198-.137-.246l-8.791-5.072c-.081-.047-.189-.047-.273 0L2.075 6.675c-.084.048-.139.144-.139.246v10.146c0 .1.055.194.139.241l2.409 1.392c1.307.654 2.108-.116 2.108-.89V7.787c0-.142.114-.253.256-.253h1.115c.139 0 .255.112.255.253v10.021c0 1.745-.95 2.745-2.604 2.745-.508 0-.909 0-2.026-.551L1.352 18.675C.533 18.215 0 17.352 0 16.43V6.284c0-.922.533-1.786 1.352-2.245L10.147-.963c.8-.452 1.866-.452 2.657 0l8.796 5.002c.819.459 1.352 1.323 1.352 2.245v10.146c0 .922-.533 1.783-1.352 2.245l-8.796 5.078c-.28.163-.601.247-.926.247z" fill="#339933"/></svg>),
    color: '#339933'
  },
  tailwind: {
    component: () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" fill="#06B6D4"/></svg>),
    color: '#06B6D4'
  },
  nextjs: {
    component: () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747C23.573 3.07 20.056.358 15.937.056c-.11-.008-.495-.023-.565-.025z" fill="white"/></svg>),
    color: '#ffffff'
  },
  mongodb: {
    component: () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0 1 11.91 24h.481c.114-1.032.284-2.056.51-3.07.417-.296.604-.463.85-.693a11.342 11.342 0 0 0 3.639-8.464c.01-.814-.103-1.662-.197-2.218zm-5.336 8.195s0-8.291.275-8.29c.213 0 .49 10.695.49 10.695-.381-.045-.765-1.76-.765-2.405z" fill="#47A248"/></svg>),
    color: '#47A248'
  },
  git: {
    component: () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.658 2.66c.645-.223 1.387-.078 1.9.435.721.72.721 1.884 0 2.604-.719.719-1.881.719-2.6 0-.539-.541-.674-1.337-.404-1.996L12.86 8.955v6.525c.176.086.342.203.488.348.713.721.713 1.883 0 2.6-.719.721-1.889.721-2.609 0-.719-.719-.719-1.879 0-2.598.182-.18.387-.316.605-.406V8.835c-.217-.091-.424-.222-.6-.401-.545-.545-.676-1.342-.396-2.009L7.636 3.7.45 10.881c-.6.605-.6 1.584 0 2.189l10.48 10.477c.604.604 1.582.604 2.186 0l10.43-10.43c.605-.603.605-1.582 0-2.187" fill="#F05032"/></svg>),
    color: '#F05032'
  },
  genai: {
    component: () => (<svg viewBox="0 0 24 24" fill="none" className="w-full h-full"><defs><linearGradient id="genaiGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#e8ff5a"/><stop offset="100%" stopColor="#5affea"/></linearGradient></defs><circle cx="12" cy="12" r="3" fill="url(#genaiGrad)"/><path d="M12 2L13.5 8.5L20 7L15.5 12L20 17L13.5 15.5L12 22L10.5 15.5L4 17L8.5 12L4 7L10.5 8.5Z" stroke="url(#genaiGrad)" strokeWidth="1.5" fill="none"/></svg>),
    color: '#e8ff5a'
  },
  typescript: {
    component: () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><rect width="24" height="24" rx="2" fill="#3178C6"/><path d="M13.2 12.05v.684l2.18 1.26v-.684L13.2 12.05zm-3.35 3.13c-.36.2-.73.3-1.14.3-.74 0-1.33-.26-1.77-.79-.43-.52-.65-1.22-.65-2.07 0-.87.22-1.57.66-2.1.45-.52 1.05-.79 1.8-.79.38 0 .72.08 1.04.23.32.15.56.37.74.66l.98-.57c-.26-.43-.62-.76-1.08-.99A3.35 3.35 0 0 0 8.7 9.7c-1.05 0-1.89.36-2.53 1.08-.63.72-.95 1.66-.95 2.82 0 1.15.32 2.07.96 2.78.64.7 1.5 1.06 2.58 1.06.5 0 .97-.1 1.4-.28.43-.19.79-.46 1.07-.82l-.97-.6c-.16.2-.37.35-.6.43zm4.45-5.25h-3.1v6.88h1.1v-2.75h1.88c.76 0 1.36-.2 1.78-.6.42-.4.63-.93.63-1.6 0-.65-.2-1.17-.6-1.57-.4-.24-.97-.36-1.69-.36zm-.04 3.27h-1.96v-2.23h1.96c.41 0 .72.1.94.3.22.2.33.48.33.83 0 .34-.11.6-.33.8-.22.2-.53.3-.94.3z" fill="white"/></svg>),
    color: '#3178C6'
  },
  python: {
    component: () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.007 2.752h5.814v.826H3.9S0 5.789 0 11.969c0 6.18 3.403 5.963 3.403 5.963h2.031v-2.868s-.109-3.402 3.35-3.402h5.769s3.24.052 3.24-3.131V3.19S18.28 0 11.914 0zm-3.21 1.85a1.043 1.043 0 1 1 0 2.086 1.043 1.043 0 0 1 0-2.085z" fill="#366994"/><path d="M12.086 24c6.094 0 5.714-2.656 5.714-2.656l-.007-2.752h-5.814v-.826h8.121S24 18.211 24 12.031c0-6.18-3.403-5.963-3.403-5.963h-2.031v2.868s.109 3.402-3.35 3.402H9.447s-3.24-.052-3.24 3.131V20.81S5.72 24 12.086 24zm3.21-1.85a1.043 1.043 0 1 1 0-2.086 1.043 1.043 0 0 1 0 2.085z" fill="#FFC331"/></svg>),
    color: '#3776AB'
  },
}

const SkillIcon = memo(({ type }: SkillIconProps) => {
  const IconComponent = iconComponents[type]?.component
  return IconComponent ? <IconComponent /> : null
})
SkillIcon.displayName = 'SkillIcon'

const skillsConfig: SkillConfig[] = [
  // Inner orbit — core web
  { id: 'react', orbitRadius: 100, size: 44, speed: 0.7, iconType: 'react', phaseShift: 0, glowColor: 'cyan', label: 'React' },
  { id: 'typescript', orbitRadius: 100, size: 40, speed: 0.7, iconType: 'typescript', phaseShift: (2 * Math.PI) / 4, glowColor: 'cyan', label: 'TypeScript' },
  { id: 'nextjs', orbitRadius: 100, size: 40, speed: 0.7, iconType: 'nextjs', phaseShift: (2 * Math.PI) / 2, glowColor: 'cyan', label: 'Next.js' },
  { id: 'tailwind', orbitRadius: 100, size: 38, speed: 0.7, iconType: 'tailwind', phaseShift: (3 * Math.PI) / 2, glowColor: 'cyan', label: 'Tailwind CSS' },
  // Middle orbit — backend & db
  { id: 'node', orbitRadius: 170, size: 44, speed: -0.45, iconType: 'node', phaseShift: 0, glowColor: 'purple', label: 'Node.js' },
  { id: 'python', orbitRadius: 170, size: 42, speed: -0.45, iconType: 'python', phaseShift: (2 * Math.PI) / 3, glowColor: 'purple', label: 'Python' },
  { id: 'mongodb', orbitRadius: 170, size: 40, speed: -0.45, iconType: 'mongodb', phaseShift: (4 * Math.PI) / 3, glowColor: 'purple', label: 'MongoDB' },
  // Outer orbit — tools & AI
  { id: 'javascript', orbitRadius: 240, size: 40, speed: 0.3, iconType: 'javascript', phaseShift: 0, glowColor: 'yellow', label: 'JavaScript' },
  { id: 'git', orbitRadius: 240, size: 40, speed: 0.3, iconType: 'git', phaseShift: (2 * Math.PI) / 4, glowColor: 'yellow', label: 'Git' },
  { id: 'genai', orbitRadius: 240, size: 44, speed: 0.3, iconType: 'genai', phaseShift: (2 * Math.PI) / 2, glowColor: 'yellow', label: 'Gen AI' },
  { id: 'html', orbitRadius: 240, size: 38, speed: 0.3, iconType: 'html', phaseShift: (3 * Math.PI) / 2, glowColor: 'yellow', label: 'HTML5' },
]

const OrbitingSkill = memo(({ config, angle }: OrbitingSkillProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const { orbitRadius, size, iconType, label } = config
  const x = Math.cos(angle) * orbitRadius
  const y = Math.sin(angle) * orbitRadius

  return (
    <div
      className="absolute top-1/2 left-1/2 transition-all duration-300 ease-out"
      style={{ width: `${size}px`, height: `${size}px`, transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))`, zIndex: isHovered ? 20 : 10 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`relative w-full h-full p-2 bg-gray-900/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer border border-white/10 ${isHovered ? 'scale-125 shadow-2xl' : 'shadow-lg'}`}
        style={{ boxShadow: isHovered ? `0 0 30px ${iconComponents[iconType]?.color}40, 0 0 60px ${iconComponents[iconType]?.color}20` : undefined }}
      >
        <SkillIcon type={iconType} />
        {isHovered && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/95 border border-white/10 backdrop-blur-sm rounded text-xs text-white whitespace-nowrap pointer-events-none font-mono">
            {label}
          </div>
        )}
      </div>
    </div>
  )
})
OrbitingSkill.displayName = 'OrbitingSkill'

const GlowingOrbitPath = memo(({ radius, glowColor = 'cyan', animationDelay = 0 }: GlowingOrbitPathProps) => {
  const glowColors = {
    cyan: { primary: 'rgba(90,255,234,0.3)', secondary: 'rgba(90,255,234,0.1)', border: 'rgba(90,255,234,0.2)' },
    purple: { primary: 'rgba(147,51,234,0.3)', secondary: 'rgba(147,51,234,0.1)', border: 'rgba(147,51,234,0.2)' },
    yellow: { primary: 'rgba(232,255,90,0.3)', secondary: 'rgba(232,255,90,0.1)', border: 'rgba(232,255,90,0.2)' },
  }
  const colors = glowColors[glowColor]

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none" style={{ width: `${radius * 2}px`, height: `${radius * 2}px` }}>
      <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, transparent 30%, ${colors.secondary} 70%, ${colors.primary} 100%)`, boxShadow: `0 0 40px ${colors.primary}, inset 0 0 40px ${colors.secondary}`, animation: `pulse 4s ease-in-out infinite`, animationDelay: `${animationDelay}s` }} />
      <div className="absolute inset-0 rounded-full" style={{ border: `1px solid ${colors.border}` }} />
    </div>
  )
})
GlowingOrbitPath.displayName = 'GlowingOrbitPath'

export default function OrbitingSkills() {
  const [time, setTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    let id: number
    let last = performance.now()
    const animate = (now: number) => {
      setTime(t => t + (now - last) / 1000)
      last = now
      id = requestAnimationFrame(animate)
    }
    id = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(id)
  }, [isPaused])

  const orbitConfigs = [
    { radius: 100, glowColor: 'cyan' as GlowColor, delay: 0 },
    { radius: 170, glowColor: 'purple' as GlowColor, delay: 1 },
    { radius: 240, glowColor: 'yellow' as GlowColor, delay: 2 },
  ]

  return (
    <div className="w-full flex items-center justify-center overflow-hidden">
      <div
        className="relative flex items-center justify-center"
        style={{ width: '550px', height: '550px' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Center */}
        <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center z-10 relative shadow-2xl border border-white/10">
          <div className="absolute inset-0 rounded-full bg-[#5affea]/20 blur-xl animate-pulse" />
          <div className="absolute inset-0 rounded-full bg-[#e8ff5a]/10 blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="url(#ruGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="ruGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#5affea" />
                  <stop offset="100%" stopColor="#e8ff5a" />
                </linearGradient>
              </defs>
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
        </div>

        {orbitConfigs.map(cfg => (
          <GlowingOrbitPath key={cfg.radius} radius={cfg.radius} glowColor={cfg.glowColor} animationDelay={cfg.delay} />
        ))}

        {skillsConfig.map(config => (
          <OrbitingSkill key={config.id} config={config} angle={time * config.speed + config.phaseShift} />
        ))}
      </div>
    </div>
  )
}
