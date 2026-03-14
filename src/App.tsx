<<<<<<< HEAD
import { useState, useEffect } from 'react'

const WAITLIST_COUNT = 174
const FOUNDING_SPOTS_TOTAL = 1000

function App() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackStep, setFeedbackStep] = useState<'hidden' | 'form' | 'done'>('hidden')
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [feedback, setFeedback] = useState({ usability: '', valuable: '', wouldPay: '', suggestions: '', email: '' })
  const [scrolled, setScrolled] = useState(false)
  const [pricingPlan, setPricingPlan] = useState<'monthly' | 'lifetime' | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
=======
import { useState, useEffect, useRef } from 'react'

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const FORMSPREE_URL = 'https://formspree.io/f/xjkvolod'
const FOUNDERS_TOTAL = 1000
const APP_URL = 'https://app.moneyunseen.com'

// ─── TYPES ───────────────────────────────────────────────────────────────────
type Plan = 'monthly' | 'lifetime' | null

// ─── HOOKS ───────────────────────────────────────────────────────────────────
function useScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [threshold])
  return scrolled
}

function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      let start = 0
      const step = target / (duration / 16)
      const tick = () => {
        start = Math.min(start + step, target)
        setCount(Math.floor(start))
        if (start < target) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])
  return { count, ref }
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const s = {
  // colours
  ink: '#0d0d14',
  inkLight: '#1a1a2e',
  purple: '#6d4aff',
  purpleMid: '#8b6fff',
  purpleLight: '#ede9ff',
  green: '#16a34a',
  greenLight: '#f0fdf4',
  greenBorder: '#bbf7d0',
  grey50: '#f8f8f7',
  grey100: '#f0f0ee',
  grey200: '#e4e4e0',
  grey400: '#9ca3af',
  grey500: '#6b7280',
  grey700: '#374151',
  white: '#ffffff',
  // typography
  fontSans: "'DM Sans', system-ui, -apple-system, sans-serif",
  fontSerif: "'Lora', 'Georgia', serif",
  // radii
  r8: 8,
  r12: 12,
  r16: 16,
  r20: 20,
  r24: 24,
  r99: 9999,
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function Badge({ children, color = s.purple }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: s.fontSans, fontSize: '0.72rem', fontWeight: 600,
      letterSpacing: '0.07em', textTransform: 'uppercase',
      padding: '0.3rem 0.85rem', borderRadius: s.r99,
      background: s.purpleLight, color,
    }}>{children}</span>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: s.fontSans, fontSize: '0.72rem', fontWeight: 700,
      letterSpacing: '0.1em', textTransform: 'uppercase',
      color: s.purple, marginBottom: '0.75rem',
    }}>{children}</p>
  )
}

function Check({ dark = false }: { dark?: boolean }) {
  return <span style={{ color: dark ? '#4ade80' : s.green, fontWeight: 700, fontSize: '0.85rem', marginTop: 2, flexShrink: 0 }}>✓</span>
}

function FeatureRow({ text, dark = false }: { text: string; dark?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', marginBottom: '0.55rem' }}>
      <Check dark={dark} />
      <span style={{ fontFamily: s.fontSans, fontSize: '0.84rem', color: dark ? '#d1d5db' : s.grey700, lineHeight: 1.55 }}>{text}</span>
    </div>
  )
}

function PrimaryButton({ children, href, onClick, style: extra }: {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  style?: React.CSSProperties
}) {
  const base: React.CSSProperties = {
    fontFamily: s.fontSans, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.4rem', padding: '0.875rem 2rem', borderRadius: s.r99,
    background: s.ink, color: s.white, fontWeight: 700, fontSize: '0.92rem',
    textDecoration: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 0.15s',
    ...extra,
  }
  if (href) return <a href={href} style={base}>{children}</a>
  return <button onClick={onClick} style={base}>{children}</button>
}

function GhostButton({ children, href, onClick, style: extra }: {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  style?: React.CSSProperties
}) {
  const base: React.CSSProperties = {
    fontFamily: s.fontSans, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.4rem', padding: '0.875rem 2rem', borderRadius: s.r99,
    border: `1.5px solid ${s.grey200}`, color: s.grey700, fontWeight: 600,
    fontSize: '0.92rem', textDecoration: 'none', background: 'transparent',
    cursor: 'pointer', transition: 'border-color 0.15s',
    ...extra,
  }
  if (href) return <a href={href} style={base}>{children}</a>
  return <button onClick={onClick} style={base}>{children}</button>
}

// ─── SAVINGS CALCULATOR ──────────────────────────────────────────────────────
function calcFV(monthly: number, years: number, rate = 0.04) {
  return monthly * 12 * (((1 + rate) ** years - 1) / rate)
}

function SavingsExplainer() {
  const [monthly, setMonthly] = useState(45)

  const horizons = [
    { years: 10, label: '10 years' },
    { years: 20, label: '20 years' },
    { years: 30, label: '30 years' },
  ]

  return (
    <section style={{ padding: '5rem 1.5rem', background: s.grey50 }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <SectionLabel>What your savings actually become</SectionLabel>
          <h2 style={{ fontFamily: s.fontSerif, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 700, color: s.ink, lineHeight: 1.2, margin: '0 0 1rem' }}>
            Money saved isn't just money saved.
          </h2>
          <p style={{ fontFamily: s.fontSans, fontSize: '1rem', color: s.grey500, maxWidth: 520, margin: '0 auto', lineHeight: 1.75 }}>
            When you redirect forgotten subscriptions into savings, compound interest quietly multiplies the result. Drag the slider and see what time does.
          </p>
        </div>

        <div style={{ background: s.white, border: `1px solid ${s.grey200}`, borderRadius: s.r24, padding: 'clamp(1.75rem, 4vw, 3rem)', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
              <label style={{ fontFamily: s.fontSans, fontSize: '0.88rem', fontWeight: 600, color: s.grey700 }}>
                Monthly savings redirected
              </label>
              <span style={{ fontFamily: s.fontSerif, fontSize: '1.6rem', fontWeight: 700, color: s.purple }}>
                €{monthly}
              </span>
            </div>
            <input
              type="range" min={5} max={300} step={5} value={monthly}
              onChange={e => setMonthly(Number(e.target.value))}
              style={{ width: '100%', accentColor: s.purple, cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
              <span style={{ fontFamily: s.fontSans, fontSize: '0.72rem', color: s.grey400 }}>€5/mo</span>
              <span style={{ fontFamily: s.fontSans, fontSize: '0.72rem', color: s.grey400 }}>€300/mo</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {horizons.map(({ years, label }, i) => {
              const withInterest = calcFV(monthly, years)
              const simple = monthly * 12 * years
              const gain = withInterest - simple
              const accent = i === 2
              return (
                <div key={years} style={{
                  background: accent ? s.ink : s.grey50,
                  border: `1px solid ${accent ? '#2d2d4e' : s.grey100}`,
                  borderRadius: s.r16, padding: '1.4rem',
                  transition: 'all 0.2s',
                }}>
                  <p style={{ fontFamily: s.fontSans, fontSize: '0.7rem', fontWeight: 700, color: accent ? s.purpleMid : s.grey400, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>{label}</p>
                  <p style={{ fontFamily: s.fontSerif, fontSize: '1.9rem', fontWeight: 700, color: accent ? s.white : s.ink, margin: '0 0 0.3rem' }}>
                    €{Math.round(withInterest).toLocaleString('en')}
                  </p>
                  <p style={{ fontFamily: s.fontSans, fontSize: '0.75rem', color: accent ? '#9ca3af' : s.grey400, margin: '0 0 0.6rem' }}>
                    with 4% annual return
                  </p>
                  <div style={{ borderTop: `1px solid ${accent ? 'rgba(255,255,255,0.08)' : s.grey100}`, paddingTop: '0.6rem' }}>
                    <p style={{ fontFamily: s.fontSans, fontSize: '0.78rem', color: accent ? '#4ade80' : s.green, fontWeight: 600, margin: 0 }}>
                      +€{Math.round(gain).toLocaleString('en')} from interest
                    </p>
                    <p style={{ fontFamily: s.fontSans, fontSize: '0.72rem', color: accent ? '#6b7280' : s.grey400, margin: '0.1rem 0 0' }}>
                      vs. €{Math.round(simple).toLocaleString('en')} without investing
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ background: s.greenLight, border: `1px solid ${s.greenBorder}`, borderRadius: s.r12, padding: '0.9rem 1.1rem' }}>
            <p style={{ fontFamily: s.fontSans, fontSize: '0.83rem', color: '#15803d', margin: 0, lineHeight: 1.65 }}>
              <strong>The math is simple.</strong> MoneyUnseen helps you find the €{monthly}/month you're already paying for without noticing.
              What you do with it next is entirely up to you — we just make sure you can see it clearly.
            </p>
          </div>

          <p style={{ fontFamily: s.fontSans, fontSize: '0.72rem', color: s.grey400, textAlign: 'center', margin: '1rem 0 0' }}>
            Illustrative only. Assumes consistent monthly savings at 4% annual return, compounded annually. Not financial advice.
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── POLICY CARD ─────────────────────────────────────────────────────────────
function PolicyCard({ id, icon, title, tldr, full }: { id: string; icon: string; title: string; tldr: string[]; full: string }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div id={id} style={{ background: s.white, border: `1px solid ${s.grey200}`, borderRadius: s.r20, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <span style={{ fontSize: '1.4rem' }}>{icon}</span>
        <h3 style={{ fontFamily: s.fontSerif, fontSize: '1.05rem', fontWeight: 700, color: s.ink, marginTop: '0.4rem', marginBottom: 0 }}>{title}</h3>
      </div>
      <div style={{ background: s.purpleLight, borderRadius: s.r12, padding: '0.9rem 1rem' }}>
        <p style={{ fontFamily: s.fontSans, fontSize: '0.7rem', fontWeight: 700, color: s.purple, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>
          TL;DR <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 'normal', color: s.grey400 }}>(short version)</span>
        </p>
        <ul style={{ margin: 0, padding: '0 0 0 1rem' }}>
          {tldr.map(line => <li key={line} style={{ fontFamily: s.fontSans, fontSize: '0.81rem', color: '#4b5563', lineHeight: 1.7, marginBottom: '0.15rem' }}>{line}</li>)}
        </ul>
      </div>
      {!expanded
        ? <button onClick={() => setExpanded(true)} style={{ fontFamily: s.fontSans, fontSize: '0.78rem', color: s.purple, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>Read the full version →</button>
        : <div>
          <p style={{ fontFamily: s.fontSans, fontSize: '0.8rem', color: s.grey500, lineHeight: 1.8, margin: '0 0 0.5rem' }}>{full}</p>
          <button onClick={() => setExpanded(false)} style={{ fontFamily: s.fontSans, fontSize: '0.78rem', color: s.grey400, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>↑ Collapse</button>
        </div>
      }
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const scrolled = useScrolled()
  const [email, setEmail] = useState('')
  const [plan, setPlan] = useState<Plan>(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [waitlistCount] = useState(174)
  const { count: animatedCount, ref: counterRef } = useCountUp(waitlistCount)

  // In production: fetch real count from your backend/Formspree
  useEffect(() => {
    // wire to your backend: setWaitlistCount(fetchedCount)
>>>>>>> b14b5779c8dddd715ded22c894554eec7d063995
  }, [])

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault()
<<<<<<< HEAD
    setIsSubmitting(true)
    try {
      await fetch('https://formspree.io/f/xjkvolod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, plan: pricingPlan, type: 'founding_member', _subject: `MoneyUnseen — Founding Member signup (${pricingPlan || 'undecided'})` }),
      })
    } catch { /* ignore */ }
    setIsSubmitted(true)
    setIsSubmitting(false)
  }

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedbackSubmitting(true)
    try {
      await fetch('https://formspree.io/f/xjkvolod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...feedback, type: 'beta_feedback', _subject: 'MoneyUnseen Beta Feedback' }),
      })
    } catch { /* ignore */ }
    setFeedbackStep('done')
    setFeedbackSubmitting(false)
  }

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden', background: '#fafaf8', fontFamily: "'Georgia', 'Times New Roman', serif" }}>

      {/* Sticky header */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'all 0.3s',
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
        borderBottom: scrolled ? '1px solid #f0f0f0' : 'none',
        boxShadow: scrolled ? '0 1px 8px rgba(0,0,0,0.06)' : 'none',
        backdropFilter: scrolled ? 'blur(8px)' : 'none',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #7c3aed, #1a1a2e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'system-ui' }}>M</span>
            </div>
            <span style={{ fontFamily: "'Georgia', serif", fontWeight: 700, fontSize: '1rem', color: '#0f0f23' }}>MoneyUnseen</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', borderRadius: 99, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
              {WAITLIST_COUNT} op de wachtlijst
            </span>
            <a href="https://app.moneyunseen.com" target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.85rem', fontWeight: 700, padding: '0.5rem 1.25rem', borderRadius: 99, background: '#1a1a2e', color: '#fff', textDecoration: 'none' }}>
              Open app →
            </a>
=======
    setSubmitting(true)
    try {
      await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, plan,
          type: 'founders_circle',
          _subject: `MoneyUnseen — Founders Circle signup (${plan || 'undecided'})`,
        }),
      })
    } catch { /* ignore */ }
    setSubmitted(true)
    setSubmitting(false)
  }

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden', background: s.white, fontFamily: s.fontSans, color: s.ink }}>

      {/* ── GOOGLE FONTS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Lora:wght@600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        input[type=range] { -webkit-appearance: none; height: 4px; background: #e4e4e0; border-radius: 99px; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #6d4aff; cursor: pointer; box-shadow: 0 2px 6px rgba(109,74,255,0.3); }
        a:hover { opacity: 0.8; }
        button:hover { opacity: 0.85; }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'all 0.25s',
        background: scrolled ? 'rgba(255,255,255,0.96)' : 'transparent',
        borderBottom: scrolled ? `1px solid ${s.grey100}` : 'none',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: s.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: s.white, fontSize: 14, fontWeight: 700 }}>M</span>
            </div>
            <span style={{ fontFamily: s.fontSerif, fontWeight: 700, fontSize: '1rem', color: s.ink }}>MoneyUnseen</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontFamily: s.fontSans, fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', borderRadius: s.r99, background: s.greenLight, color: s.green, border: `1px solid ${s.greenBorder}` }}>
              Free to use now
            </span>
            <a href={APP_URL} target="_blank" rel="noopener noreferrer" style={{
              fontFamily: s.fontSans, fontSize: '0.85rem', fontWeight: 700,
              padding: '0.5rem 1.25rem', borderRadius: s.r99,
              background: s.ink, color: s.white, textDecoration: 'none',
            }}>Open app →</a>
>>>>>>> b14b5779c8dddd715ded22c894554eec7d063995
          </div>
        </div>
      </header>

      <main>

<<<<<<< HEAD
        {/* HERO */}
        <section style={{ paddingTop: 120, paddingBottom: 80, paddingLeft: '1.5rem', paddingRight: '1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 20% 50%, rgba(124,58,237,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(109,97,185,0.04) 0%, transparent 40%)' }} />
          <div style={{ maxWidth: 780, margin: '0 auto', position: 'relative' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', padding: '0.4rem 1rem', borderRadius: 99, background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.82rem', color: '#6b7280' }}>Live beta · Gratis te gebruiken · Geen bankgegevens</span>
            </div>

            <h1 style={{ fontSize: 'clamp(2.6rem, 7vw, 5rem)', lineHeight: 1.1, fontWeight: 700, color: '#0f0f23', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
              Know what you pay.<br />
              <span style={{ color: '#7c3aed' }}>Own what you keep.</span>
            </h1>

            <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '1.15rem', color: '#6b7280', maxWidth: 560, margin: '0 auto 2.5rem', lineHeight: 1.75 }}>
              You know your main fixed monthly costs. But add up insurance, road tax, forgotten subscriptions, and that magazine you receive four times a year — the real total surprises most people.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', marginBottom: '1rem' }}>
              <a href="#founding"
                style={{ fontFamily: 'system-ui, sans-serif', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.9rem 2rem', borderRadius: 99, background: '#1a1a2e', color: '#fff', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' }}>
                Join the waitlist
              </a>
              <a href="https://app.moneyunseen.com" target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: 'system-ui, sans-serif', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.9rem 2rem', borderRadius: 99, border: '2px solid #d1d5db', color: '#374151', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none', background: 'transparent' }}>
                Try the app free →
              </a>
            </div>
            <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.77rem', color: '#9ca3af' }}>No credit card. No bank login. Your data stays on your device.</p>
          </div>
        </section>

        {/* TWO WORLDS DEMO */}
        <section style={{ padding: '4rem 1.5rem' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            <div>
              <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>How it works</p>
              <h2 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, color: '#0f0f23', lineHeight: 1.2, marginBottom: '1rem' }}>
                Two worlds.<br />One clear picture.
              </h2>
              <p style={{ fontFamily: 'system-ui, sans-serif', color: '#6b7280', lineHeight: 1.8, marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                Add your fixed monthly costs and hidden charges with ease — takes about 2 minutes. The app shows you what you're still paying and what you've already chosen to cut. The green number is yours.
              </p>
              {[
                ['✏️', 'Add any cost with ease — subscriptions, insurance, road tax, anything'],
                ['🔒', 'Data lives on your device, not our servers'],
                ['⏸️', 'Mark a cost as paused to see your potential savings grow'],
                ['🎯', 'Set personal goals and see how fast you can get there'],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.6rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1rem', marginTop: 2 }}>{icon}</span>
                  <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.88rem', color: '#374151', lineHeight: 1.6 }}>{text}</span>
=======
        {/* ── HERO ── */}
        <section style={{ paddingTop: 130, paddingBottom: 80, paddingLeft: '1.5rem', paddingRight: '1.5rem', textAlign: 'center', position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(109,74,255,0.06) 0%, transparent 70%)',
          }} />
          <div style={{ maxWidth: 780, margin: '0 auto', position: 'relative' }}>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: '2rem', padding: '0.4rem 1rem 0.4rem 0.5rem', borderRadius: s.r99, background: s.white, border: `1px solid ${s.grey200}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontFamily: s.fontSans, fontSize: '0.82rem', color: s.grey500 }}>Live · Free to use · No bank login · Your data stays on your device</span>
            </div>

            <h1 style={{ fontFamily: s.fontSerif, fontSize: 'clamp(2.8rem, 7vw, 5.2rem)', lineHeight: 1.1, fontWeight: 700, color: s.ink, marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>
              Know what you pay.<br />
              <span style={{ color: s.purple }}>Own what you keep.</span>
            </h1>

            <p style={{ fontFamily: s.fontSans, fontSize: '1.1rem', color: s.grey500, maxWidth: 560, margin: '0 auto 2.5rem', lineHeight: 1.8 }}>
              You know your rent and your phone bill. But add up insurance, road tax, that streaming service you forgot, the
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', marginBottom: '1rem' }}>
              <PrimaryButton href={APP_URL}>Try the app free →</PrimaryButton>
              <GhostButton href="#founders-circle">Join Founders Circle</GhostButton>
            </div>
            <p style={{ fontFamily: s.fontSans, fontSize: '0.77rem', color: s.grey400 }}>No credit card. No bank login. Nothing to install.</p>
          </div>
        </section>

        {/* ── TWO WORLDS DEMO ── */}
        <section style={{ padding: '4rem 1.5rem' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
            <div>
              <SectionLabel>How it works</SectionLabel>
              <h2 style={{ fontFamily: s.fontSerif, fontSize: 'clamp(1.7rem, 4vw, 2.4rem)', fontWeight: 700, color: s.ink, lineHeight: 1.2, marginBottom: '1rem' }}>
                Two worlds.<br />One clear picture.
              </h2>
              <p style={{ fontFamily: s.fontSans, color: s.grey500, lineHeight: 1.8, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                Add your fixed costs — takes about two minutes. The app splits them into what you're still paying and what you've already taken back. The green number is yours.
              </p>
              {[
                'Add any cost — subscriptions, insurance, road tax, anything fixed',
                'Everything stays on your device. We never see your data',
                'Mark a cost as paused to watch your savings grow',
                'Set personal goals and track how fast you get there',
              ].map(text => (
                <div key={text} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.6rem', alignItems: 'flex-start' }}>
                  <Check />
                  <span style={{ fontFamily: s.fontSans, fontSize: '0.88rem', color: s.grey700, lineHeight: 1.6 }}>{text}</span>
>>>>>>> b14b5779c8dddd715ded22c894554eec7d063995
                </div>
              ))}
            </div>

<<<<<<< HEAD
            {/* Visual demo */}
            <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.10)', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ background: '#f9fafb', padding: '1.5rem', borderRight: '1px solid #f0f0f0' }}>
                  <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.65rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Still paying</p>
                  <p style={{ fontSize: '2rem', fontWeight: 700, color: '#374151', margin: 0 }}>€38</p>
                  <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.7rem', color: '#9ca3af', marginTop: 4 }}>per month · 3 costs</p>
                </div>
                <div style={{ background: '#16a34a', padding: '1.5rem' }}>
                  <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.65rem', fontWeight: 700, color: '#bbf7d0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Reclaimed</p>
                  <p style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', margin: 0 }}>€30</p>
                  <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.7rem', color: '#bbf7d0', marginTop: 4 }}>= €360/year 🎉</p>
                </div>
              </div>
              <div style={{ background: '#fff', padding: '0.75rem 1.25rem' }}>
                {[{n:'Netflix',c:'€13.99',a:true},{n:'Gym',c:'€29.00',a:false},{n:'Spotify',c:'€9.99',a:true},{n:'Magazine',c:'€12.00',a:false},{n:'Road tax',c:'€8.00',a:false}].map(sub => (
                  <div key={sub.n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f9fafb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: sub.a ? '#7c3aed' : '#d1fae5' }} />
                      <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.82rem', color: sub.a ? '#374151' : '#9ca3af' }}>{sub.n}</span>
                      {!sub.a && <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.62rem', background: '#f0fdf4', color: '#16a34a', padding: '1px 5px', borderRadius: 99, fontWeight: 600 }}>paused</span>}
                    </div>
                    <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.82rem', fontWeight: 600, color: sub.a ? '#374151' : '#9ca3af' }}>{sub.c}/mo</span>
=======
            {/* Demo card */}
            <div style={{ borderRadius: s.r24, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', border: `1px solid ${s.grey200}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ background: s.grey50, padding: '1.5rem', borderRight: `1px solid ${s.grey100}` }}>
                  <p style={{ fontFamily: s.fontSans, fontSize: '0.65rem', fontWeight: 700, color: s.grey400, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Still paying</p>
                  <p style={{ fontFamily: s.fontSerif, fontSize: '2rem', fontWeight: 700, color: s.grey700, margin: 0 }}>€174</p>
                  <p style={{ fontFamily: s.fontSans, fontSize: '0.7rem', color: s.grey400, marginTop: 4 }}>per month · 5 active</p>
                </div>
                <div style={{ background: s.green, padding: '1.5rem' }}>
                  <p style={{ fontFamily: s.fontSans, fontSize: '0.65rem', fontWeight: 700, color: '#bbf7d0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Reclaimed</p>
                  <p style={{ fontFamily: s.fontSerif, fontSize: '2rem', fontWeight: 700, color: s.white, margin: 0 }}>€63</p>
                  <p style={{ fontFamily: s.fontSans, fontSize: '0.7rem', color: '#bbf7d0', marginTop: 4 }}>= €756/year</p>
                </div>
              </div>
              <div style={{ background: s.white, padding: '0.75rem 1.25rem' }}>
                {[
                  { n: 'Health insurance', c: '€149.00', active: true },
                  { n: 'Netflix', c: '€13.99', active: true },
                  { n: 'Gym membership', c: '€29.00', active: false },
                  { n: 'Spotify', c: '€9.99', active: true },
                  { n: 'Road tax', c: '€8.00', active: true },
                  { n: 'Trial: Adobe CC', c: '€25.99', active: false },
                  { n: 'Magazine', c: '€12.00', active: false },
                  { n: 'LinkedIn Premium', c: '€25.99', active: true },
                ].map(sub => (
                  <div key={sub.n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: `1px solid ${s.grey50}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: sub.active ? s.purple : '#d1fae5', flexShrink: 0 }} />
                      <span style={{ fontFamily: s.fontSans, fontSize: '0.82rem', color: sub.active ? s.grey700 : s.grey400 }}>{sub.n}</span>
                      {!sub.active && <span style={{ fontFamily: s.fontSans, fontSize: '0.62rem', background: s.greenLight, color: s.green, padding: '1px 5px', borderRadius: s.r99, fontWeight: 600 }}>paused</span>}
                    </div>
                    <span style={{ fontFamily: s.fontSans, fontSize: '0.82rem', fontWeight: 600, color: sub.active ? s.grey700 : s.grey400 }}>{sub.c}/mo</span>
>>>>>>> b14b5779c8dddd715ded22c894554eec7d063995
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

<<<<<<< HEAD
        {/* INDEPENDENCE MANIFESTO */}
        <section style={{ padding: '4rem 1.5rem' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ background: '#0f0f23', borderRadius: 32, padding: 'clamp(2rem, 5vw, 4rem)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -50, right: -50, width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Our independence promise</p>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: '1.25rem' }}>
                "We earn nothing<br />from your choices."
              </h2>
              <p style={{ fontFamily: 'system-ui, sans-serif', color: '#9ca3af', lineHeight: 1.8, maxWidth: 560, marginBottom: '2rem', fontSize: '0.95rem' }}>
                Most "independent" comparison tools are secretly paid by the companies they recommend. We're not. No affiliate deals, no sponsored results, no data sold, no ads — ever. Our only income is your subscription, which means our only interest is yours.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
                {[['🚫','No affiliate links'],['🚫','No sponsored results'],['🚫','No data sold'],['🚫','No bank access, ever'],['🚫','No ads — ever'],['✓','Only paid by you']].map(([icon, text]) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.82rem', color: icon === '✓' ? '#4ade80' : '#f87171', fontWeight: 700 }}>{icon}</span>
                    <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.82rem', color: '#d1d5db' }}>{text}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {[['Mission & Vision','#mission'],['Privacy Policy','#privacy'],['Terms & Conditions','#terms']].map(([label, href]) => (
                  <a key={label} href={href} style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.82rem', color: '#7c3aed', textDecoration: 'none' }}>{label} →</a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" style={{ padding: '4rem 1.5rem' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Pricing</p>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, color: '#0f0f23', lineHeight: 1.2, marginBottom: '1rem' }}>
                Simple, honest pricing.
              </h2>
              <p style={{ fontFamily: 'system-ui, sans-serif', color: '#6b7280', maxWidth: 480, margin: '0 auto', lineHeight: 1.7, fontSize: '0.95rem' }}>
                The core app is free — always. Premium adds the features that save you the most time and money. Founding Members get a special deal that never comes back.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>

              {/* Free */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 24, padding: '2rem' }}>
                <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.8rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Free</p>
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontFamily: "'Georgia', serif", fontSize: '2.5rem', fontWeight: 700, color: '#0f0f23' }}>€0</span>
                  <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.85rem', color: '#9ca3af' }}> / always free</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
                  {['Track all fixed costs & subscriptions','Two worlds view (paying vs. reclaimed)','Personal goals & opportunity cost view','Manual entry — full privacy, no bank login','Data stored on your device only'].map(f => (
                    <div key={f} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                      <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.85rem', marginTop: 1 }}>✓</span>
                      <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.83rem', color: '#374151', lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a href="https://app.moneyunseen.com" target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: 'system-ui, sans-serif', display: 'block', textAlign: 'center', padding: '0.8rem', borderRadius: 12, border: '2px solid #e5e7eb', color: '#374151', fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none' }}>
=======


        {/* ── PRICING ── */}
        <section id="pricing" style={{ padding: '5rem 1.5rem', background: s.grey50 }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <SectionLabel>Pricing</SectionLabel>
              <h2 style={{ fontFamily: s.fontSerif, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, color: s.ink, lineHeight: 1.2, marginBottom: '1rem' }}>
                Simple, honest pricing.
              </h2>
              <p style={{ fontFamily: s.fontSans, color: s.grey500, maxWidth: 500, margin: '0 auto', lineHeight: 1.7, fontSize: '0.95rem' }}>
                The app is free and fully unlimited right now — no restrictions. After our first 1,000 Founders claim their spots, the free tier moves to 10 items. If you're already using the app, your data and access are safe. We believe in being upfront about this.
              </p>
            </div>

            {/* Free + Premium side by side — smaller */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem', maxWidth: 640, margin: '0 auto 1.5rem' }}>

              {/* Free */}
              <div style={{ background: s.white, border: `1px solid ${s.grey200}`, borderRadius: s.r20, padding: '1.75rem' }}>
                <p style={{ fontFamily: s.fontSans, fontSize: '0.75rem', fontWeight: 700, color: s.grey400, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Free</p>
                <div style={{ marginBottom: '1.25rem' }}>
                  <span style={{ fontFamily: s.fontSerif, fontSize: '2.2rem', fontWeight: 700, color: s.ink }}>€0</span>
                  <span style={{ fontFamily: s.fontSans, fontSize: '0.82rem', color: s.grey400 }}> / always free</span>
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  {['Track all fixed costs & subscriptions', 'Two worlds view', 'Personal goals & savings calculator', 'Manual entry — full privacy', 'Data on your device only'].map(f => <FeatureRow key={f} text={f} />)}
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', marginBottom: '0.55rem' }}>
                    <span style={{ color: s.grey400, fontWeight: 700, fontSize: '0.85rem', marginTop: 2, flexShrink: 0 }}>→</span>
                    <span style={{ fontFamily: s.fontSans, fontSize: '0.8rem', color: s.grey400, lineHeight: 1.55, fontStyle: 'italic' }}>Up to 10 items after 1,000 Founders claimed</span>
                  </div>
                </div>
                <a href={APP_URL} target="_blank" rel="noopener noreferrer" style={{ fontFamily: s.fontSans, display: 'block', textAlign: 'center', padding: '0.75rem', borderRadius: s.r12, border: `1.5px solid ${s.grey200}`, color: s.grey700, fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>
>>>>>>> b14b5779c8dddd715ded22c894554eec7d063995
                  Try it free →
                </a>
              </div>

              {/* Premium */}
<<<<<<< HEAD
              <div style={{ background: '#fff', border: '2px solid #7c3aed', borderRadius: 24, padding: '2rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#7c3aed', color: '#fff', fontFamily: 'system-ui, sans-serif', fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.9rem', borderRadius: 99, whiteSpace: 'nowrap' }}>
                  COMING SOON
                </div>
                <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.8rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Premium</p>
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontFamily: "'Georgia', serif", fontSize: '2.5rem', fontWeight: 700, color: '#0f0f23' }}>€3,99</span>
                  <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.85rem', color: '#9ca3af' }}> / month</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
                  {['Everything in Free','Renewal reminders — before it\'s too late to cancel','Subscription detective — finds what you forgot','Insurance overlap checker','Energy contract alerts','Annual cost calendar','New modules added monthly based on your feedback'].map(f => (
                    <div key={f} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                      <span style={{ color: '#7c3aed', fontWeight: 700, fontSize: '0.85rem', marginTop: 1 }}>✓</span>
                      <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.83rem', color: '#374151', lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a href="#founding"
                  style={{ fontFamily: 'system-ui, sans-serif', display: 'block', textAlign: 'center', padding: '0.8rem', borderRadius: 12, background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
                  Join waitlist for early access →
                </a>
              </div>

              {/* Founding Member Lifetime */}
              <div style={{ background: '#0f0f23', border: '1px solid #2d2d4e', borderRadius: 24, padding: '2rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff', fontFamily: 'system-ui, sans-serif', fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.9rem', borderRadius: 99, whiteSpace: 'nowrap' }}>
                  FOUNDING MEMBERS ONLY
                </div>
                <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.8rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Lifetime Deal</p>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: "'Georgia', serif", fontSize: '2.5rem', fontWeight: 700, color: '#fff' }}>€49,99</span>
                  <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.85rem', color: '#6b7280' }}> / once</span>
                </div>
                <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.78rem', color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  Pay once. Use forever. All current and future premium features included — including every new module we add.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '0.75rem' }}>
                  {['Everything in Premium — forever','All future modules included automatically','Founding Member badge — permanently yours','Vote on what we build next','Referral rewards: 2 months free per referral'].map(f => (
                    <div key={f} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                      <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.85rem', marginTop: 1 }}>✓</span>
                      <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.83rem', color: '#d1d5db', lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'rgba(124,58,237,0.15)', borderRadius: 10, padding: '0.6rem 0.9rem', marginBottom: '1.25rem' }}>
                  <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.75rem', color: '#a78bfa', margin: 0, lineHeight: 1.6 }}>
                    ⚠️ Founding Member status is linked to an active account. If you cancel, your status cannot be transferred or reinstated.
                  </p>
                </div>
                <a href="#founding"
                  style={{ fontFamily: 'system-ui, sans-serif', display: 'block', textAlign: 'center', padding: '0.8rem', borderRadius: 12, background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
                  Reserve your lifetime spot →
                </a>
                <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.72rem', color: '#4b5563', textAlign: 'center', marginTop: '0.6rem' }}>
                  Available to the first 1,000 members only
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* FOUNDING MEMBERS */}
        <section id="founding" style={{ padding: '4rem 1.5rem', background: '#f9fafb' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>

            {/* Waitlist counter */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: '1.25rem 1.75rem', marginBottom: '3rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 700, color: '#0f0f23', fontSize: '0.9rem' }}>
                  🔥 {WAITLIST_COUNT} mensen op de wachtlijst
                </span>
                <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.82rem', color: '#6b7280' }}>
                  De eerste {FOUNDING_SPOTS_TOTAL} die activeren worden Founding Member
                </span>
              </div>
              <div style={{ background: '#f3f4f6', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(90deg, #7c3aed, #a855f7)', height: '100%', width: `${(WAITLIST_COUNT / FOUNDING_SPOTS_TOTAL) * 100}%`, borderRadius: 99 }} />
              </div>
              <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.6rem', margin: '0.5rem 0 0' }}>
                Iedereen op de wachtlijst krijgt als eerste bericht bij lancering. Wie snel activeert, claimt een van de {FOUNDING_SPOTS_TOTAL} Founding Member spots.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'start' }}>

              {/* Left */}
              <div>
                <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Founding members</p>
                <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 700, color: '#0f0f23', lineHeight: 1.2, marginBottom: '1rem' }}>
                  Be among<br />the first 1,000.
                </h2>
                <p style={{ fontFamily: 'system-ui, sans-serif', color: '#6b7280', lineHeight: 1.8, marginBottom: '1.5rem', fontSize: '0.93rem' }}>
                  Sign up for the waitlist now. When the paid version launches, the first 1,000 people to activate their account become Founding Members — with permanent benefits and a deal that never comes back.
                </p>

                {[
                  ['🎁', 'Monthly: 2 months free', 'Pay months 1–3 normally. Months 4 and 5 are on us — automatically.'],
                  ['⭐', 'Or: Lifetime deal at €49,99', 'Pay once, use forever. Every future feature included. Only for Founding Members.'],
                  ['🤝', 'Refer & both benefit', 'Every person you bring in who activates gets 2 months free — and so do you, per referral.'],
                  ['🗳️', 'Vote on the roadmap', 'Monthly input round — your vote directly shapes what we build next.'],
                ].map(([icon, title, body]) => (
                  <div key={title as string} style={{ display: 'flex', gap: '0.9rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.2rem', marginTop: 2 }}>{icon}</span>
                    <div>
                      <p style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 700, color: '#0f0f23', fontSize: '0.92rem', margin: '0 0 0.2rem' }}>{title as string}</p>
                      <p style={{ fontFamily: 'system-ui, sans-serif', color: '#6b7280', fontSize: '0.83rem', margin: 0, lineHeight: 1.6 }}>{body as string}</p>
=======
              <div style={{ background: s.white, border: `1.5px solid ${s.grey200}`, borderRadius: s.r20, padding: '1.75rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: s.grey700, color: s.white, fontFamily: s.fontSans, fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.9rem', borderRadius: s.r99, whiteSpace: 'nowrap' }}>
                  COMING SOON
                </div>
                <p style={{ fontFamily: s.fontSans, fontSize: '0.75rem', fontWeight: 700, color: s.grey500, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Premium</p>
                <div style={{ marginBottom: '1.25rem' }}>
                  <span style={{ fontFamily: s.fontSerif, fontSize: '2.2rem', fontWeight: 700, color: s.ink }}>€3.99</span>
                  <span style={{ fontFamily: s.fontSans, fontSize: '0.82rem', color: s.grey400 }}> / month</span>
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  {['Everything in Free', 'Renewal reminders — before it\'s too late to cancel', 'Subscription detective — finds what you forgot', 'Annual vs. monthly payment checker', 'Insurance overlap checker', 'Annual cost calendar', 'Energy contract alerts', 'Mobile plan optimiser', 'New modules added monthly based on your feedback'].map(f => <FeatureRow key={f} text={f} />)}
                </div>
                <a href="#founders-circle" style={{ fontFamily: s.fontSans, display: 'block', textAlign: 'center', padding: '0.75rem', borderRadius: s.r12, background: s.grey50, border: `1.5px solid ${s.grey200}`, color: s.grey700, fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>
                  Join waitlist for early access →
                </a>
              </div>
            </div>

            {/* Founders Circle — hero card */}
            <div style={{ background: s.ink, border: `1px solid #2d2d4e`, borderRadius: s.r24, padding: 'clamp(2rem, 4vw, 3rem)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(109,74,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <Badge color={s.purpleMid}>Founders Circle · First 1,000 only</Badge>
                  </div>
                  <h3 style={{ fontFamily: s.fontSerif, fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 700, color: s.white, lineHeight: 1.15, marginBottom: '0.75rem' }}>
                    Lifetime access.<br />One price. Forever.
                  </h3>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <span style={{ fontFamily: s.fontSerif, fontSize: '3rem', fontWeight: 700, color: s.white }}>€59.99</span>
                    <span style={{ fontFamily: s.fontSans, fontSize: '0.9rem', color: '#6b7280' }}> / once</span>
                  </div>
                  <p style={{ fontFamily: s.fontSans, fontSize: '0.9rem', color: '#9ca3af', lineHeight: 1.75, marginBottom: '1.5rem' }}>
                    Pay once. Every current and future Premium feature is yours — forever. This deal disappears after the first 1,000 Founders. It does not come back.
                  </p>
                  <a href="#founders-circle" style={{
                    fontFamily: s.fontSans, display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.9rem 2rem', borderRadius: s.r99,
                    background: 'linear-gradient(135deg, #6d4aff, #a855f7)',
                    color: s.white, fontWeight: 700, fontSize: '0.92rem', textDecoration: 'none',
                  }}>
                    Reserve your spot →
                  </a>
                  <p style={{ fontFamily: s.fontSans, fontSize: '0.72rem', color: '#4b5563', marginTop: '0.6rem' }}>
                    Free to join the waitlist. You choose at launch.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {[
                    'Everything in Premium — forever',
                    'All future modules, automatically included',
                    'Founders Circle badge — permanently yours',
                    'Vote on the roadmap every month',
                    'Direct line to the founders — your feedback shapes what we build',
                    'Referral rewards when you bring others in',
                  ].map(f => <FeatureRow key={f} text={f} dark />)}

                  <div style={{ background: 'rgba(109,74,255,0.12)', borderRadius: s.r12, padding: '0.9rem 1rem', marginTop: '0.5rem' }}>
                    <p style={{ fontFamily: s.fontSans, fontSize: '0.78rem', color: '#a78bfa', margin: 0, lineHeight: 1.65 }}>
                      Founders Circle status is linked to your active account and cannot be transferred or reinstated after cancellation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── COMPOUND INTEREST EXPLAINER ── */}
        <SavingsExplainer />

        {/* ── FOUNDERS CIRCLE SECTION ── */}
        <section id="founders-circle" style={{ padding: '5rem 1.5rem' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>

            {/* Counter */}
            <div ref={counterRef} style={{ background: s.white, border: `1px solid ${s.grey200}`, borderRadius: s.r20, padding: '1.25rem 1.75rem', marginBottom: '3.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontFamily: s.fontSans, fontWeight: 700, color: s.ink, fontSize: '0.92rem' }}>
                  🔥 <span style={{ color: s.purple }}>{animatedCount.toLocaleString()}</span> people on the waitlist
                </span>
                <span style={{ fontFamily: s.fontSans, fontSize: '0.82rem', color: s.grey500 }}>
                  First {FOUNDERS_TOTAL.toLocaleString()} to activate at launch become Founders
                </span>
              </div>
              <div style={{ background: s.grey100, borderRadius: s.r99, height: 6, overflow: 'hidden' }}>
                <div style={{ background: `linear-gradient(90deg, ${s.purple}, #a855f7)`, height: '100%', width: `${(waitlistCount / FOUNDERS_TOTAL) * 100}%`, borderRadius: s.r99, transition: 'width 1s ease' }} />
              </div>
              <p style={{ fontFamily: s.fontSans, fontSize: '0.75rem', color: s.grey400, marginTop: '0.5rem' }}>
                Everyone on the waitlist hears first at launch. Who activates fast claims one of the {FOUNDERS_TOTAL.toLocaleString()} Founders Circle spots.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3.5rem', alignItems: 'start' }}>

              {/* Left: story */}
              <div>
                <SectionLabel>Founders Circle</SectionLabel>
                <h2 style={{ fontFamily: s.fontSerif, fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 700, color: s.ink, lineHeight: 1.2, marginBottom: '1rem' }}>
                  Be among<br />the first 1,000.
                </h2>
                <p style={{ fontFamily: s.fontSans, color: s.grey500, lineHeight: 1.8, marginBottom: '1.5rem', fontSize: '0.93rem' }}>
                  MoneyUnseen is already a mature, capable product. We've built well beyond an MVP. The Founders Circle isn't about helping us get started — it's about being part of shaping what this becomes. You get lifetime access. We get a community of people who care.
                </p>

                {[
                  ['🏅', 'Lifetime access at €59.99', 'Pay once. Every current feature and every future module is yours — automatically included, forever.'],
                  ['🗳️', 'Vote on what we build', 'Monthly roadmap input round. Your vote directly shapes what comes next. Not a ticket queue — a real conversation.'],
                  ['🤝', 'Referral rewards', 'Bring someone in who becomes a paid member and you both benefit. The more you share, the more everyone wins.'],
                  ['💸', 'Share MoneyUnseen, earn rewards', 'When someone you refer becomes a paid member, you both benefit — concrete rewards, not just good karma. Full details at launch.'],
                ].map(([icon, title, body]) => (
                  <div key={title as string} style={{ display: 'flex', gap: '0.9rem', marginBottom: '1.1rem', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.2rem', marginTop: 2, flexShrink: 0 }}>{icon}</span>
                    <div>
                      <p style={{ fontFamily: s.fontSans, fontWeight: 700, color: s.ink, fontSize: '0.92rem', margin: '0 0 0.2rem' }}>{title as string}</p>
                      <p style={{ fontFamily: s.fontSans, color: s.grey500, fontSize: '0.83rem', margin: 0, lineHeight: 1.65 }}>{body as string}</p>
>>>>>>> b14b5779c8dddd715ded22c894554eec7d063995
                    </div>
                  </div>
                ))}

<<<<<<< HEAD
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '1rem 1.25rem', marginTop: '0.5rem' }}>
                  <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.78rem', color: '#6b7280', margin: 0, lineHeight: 1.7 }}>
                    <strong style={{ color: '#374151' }}>Good to know:</strong> Founding Member status is linked to your active account. Signing up for the waitlist is free and without obligation — you choose monthly or lifetime when the paid version launches. Status cannot be transferred or reinstated after cancellation.
=======
                <div style={{ background: s.grey50, border: `1px solid ${s.grey200}`, borderRadius: s.r12, padding: '1rem 1.25rem', marginTop: '0.5rem' }}>
                  <p style={{ fontFamily: s.fontSans, fontSize: '0.78rem', color: s.grey500, margin: 0, lineHeight: 1.7 }}>
                    <strong style={{ color: s.grey700 }}>Good to know:</strong> Joining the waitlist is free and non-binding. You choose monthly (€3.99/mo) or lifetime (€59.99 once) when we launch. Founders Circle status cannot be transferred or reinstated after cancellation.
>>>>>>> b14b5779c8dddd715ded22c894554eec7d063995
                  </p>
                </div>
              </div>

              {/* Right: form */}
              <div>
<<<<<<< HEAD
                {!isSubmitted ? (
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 24, padding: '2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.07)' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f0f23', marginBottom: '0.4rem' }}>Join the waitlist</h3>
                    <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.87rem', color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                      Free, no obligation. When we launch, you'll be first to know — and first to claim a Founding Member spot.
                    </p>

                    {/* Plan preference */}
                    <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>What sounds most interesting to you?</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                      {[
                        ['monthly', '€3,99/month — with 2 months free on signup'],
                        ['lifetime', '€49,99 once — lifetime access, all future features'],
                      ].map(([val, label]) => (
                        <button key={val} type="button" onClick={() => setPricingPlan(val as 'monthly' | 'lifetime')}
                          style={{ fontFamily: 'system-ui, sans-serif', padding: '0.7rem 1rem', borderRadius: 12, fontSize: '0.83rem', fontWeight: 500, border: `1.5px solid ${pricingPlan === val ? '#7c3aed' : '#e5e7eb'}`, background: pricingPlan === val ? '#f5f3ff' : '#fff', color: pricingPlan === val ? '#7c3aed' : '#6b7280', cursor: 'pointer', textAlign: 'left' }}>
                          {pricingPlan === val ? '● ' : '○ '}{label}
=======
                {!submitted ? (
                  <div style={{ background: s.white, border: `1px solid ${s.grey200}`, borderRadius: s.r24, padding: '2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
                    <h3 style={{ fontFamily: s.fontSerif, fontSize: '1.45rem', fontWeight: 700, color: s.ink, marginBottom: '0.4rem' }}>Join the waitlist</h3>
                    <p style={{ fontFamily: s.fontSans, fontSize: '0.87rem', color: s.grey500, marginBottom: '1.5rem', lineHeight: 1.7 }}>
                      Free and non-binding. Be first to know when we launch — and first to claim a Founders Circle spot.
                    </p>

                    <p style={{ fontFamily: s.fontSans, fontSize: '0.83rem', fontWeight: 600, color: s.grey700, marginBottom: '0.5rem' }}>What sounds most interesting to you?</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                      {[
                        ['monthly', '€3.99/month — premium access'],
                        ['lifetime', '€59.99 once — Founders Circle lifetime deal'],
                      ].map(([val, label]) => (
                        <button key={val} type="button" onClick={() => setPlan(val as Plan)}
                          style={{
                            fontFamily: s.fontSans, padding: '0.75rem 1rem', borderRadius: s.r12,
                            fontSize: '0.84rem', fontWeight: 500, textAlign: 'left', cursor: 'pointer',
                            border: `1.5px solid ${plan === val ? s.purple : s.grey200}`,
                            background: plan === val ? s.purpleLight : s.white,
                            color: plan === val ? s.purple : s.grey500,
                          }}>
                          {plan === val ? '● ' : '○ '}{label}
>>>>>>> b14b5779c8dddd715ded22c894554eec7d063995
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handleWaitlist} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required
<<<<<<< HEAD
                        style={{ fontFamily: 'system-ui, sans-serif', width: '100%', padding: '0.8rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box', color: '#0f0f23' }} />
                      <button type="submit" disabled={isSubmitting}
                        style={{ fontFamily: 'system-ui, sans-serif', width: '100%', padding: '0.85rem', borderRadius: 12, background: '#1a1a2e', color: '#fff', fontWeight: 700, fontSize: '0.92rem', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.6 : 1 }}>
                        {isSubmitting ? 'Saving...' : 'Join the waitlist →'}
                      </button>
                    </form>
                    <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.72rem', color: '#9ca3af', textAlign: 'center', marginTop: '0.75rem' }}>No spam. No payment now. Unsubscribe anytime.</p>

                    {/* Referral math */}
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f5f3ff', borderRadius: 14 }}>
                      <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.78rem', fontWeight: 700, color: '#7c3aed', marginBottom: '0.4rem' }}>💡 The referral maths (monthly plan)</p>
                      <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.7, margin: 0 }}>
                        2 free months on signup · +2 months per referral who activates<br />
                        3 referrals = 2 + 6 = <strong style={{ color: '#374151' }}>8 months free in year one</strong><br />
                        <span style={{ color: '#9ca3af' }}>No limit — every successful referral counts.</span>
=======
                        style={{ fontFamily: s.fontSans, width: '100%', padding: '0.85rem 1rem', border: `1.5px solid ${s.grey200}`, borderRadius: s.r12, fontSize: '0.92rem', outline: 'none', color: s.ink }} />
                      <PrimaryButton style={{ width: '100%', opacity: submitting ? 0.6 : 1 }}>
                        {submitting ? 'Saving...' : 'Join the waitlist →'}
                      </PrimaryButton>
                    </form>
                    <p style={{ fontFamily: s.fontSans, fontSize: '0.72rem', color: s.grey400, textAlign: 'center', marginTop: '0.75rem' }}>No spam. No payment now. Unsubscribe anytime.</p>

                    {/* Referral teaser */}
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: s.purpleLight, borderRadius: s.r12 }}>
                      <p style={{ fontFamily: s.fontSans, fontSize: '0.78rem', fontWeight: 700, color: s.purple, marginBottom: '0.35rem' }}>💸 Founders Circle referral rewards</p>
                      <p style={{ fontFamily: s.fontSans, fontSize: '0.78rem', color: '#5b21b6', lineHeight: 1.7, margin: 0 }}>
                        When someone you refer becomes a paid member, you both get rewarded — concrete benefits, not just good feelings. Full reward structure announced at launch.
>>>>>>> b14b5779c8dddd715ded22c894554eec7d063995
                      </p>
                    </div>
                  </div>
                ) : (
<<<<<<< HEAD
                  <div style={{ background: '#fff', border: '1px solid #d1fae5', borderRadius: 24, padding: '2.5rem', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.07)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f0f23', marginBottom: '0.5rem' }}>You're on the list!</h3>
                    <p style={{ fontFamily: 'system-ui, sans-serif', color: '#6b7280', lineHeight: 1.7, fontSize: '0.9rem' }}>
                      We'll reach out when the paid version launches. You'll be among the first — claim your Founding Member spot before anyone else.
                    </p>
                    <a href="https://app.moneyunseen.com" target="_blank" rel="noopener noreferrer"
                      style={{ fontFamily: 'system-ui, sans-serif', display: 'inline-block', marginTop: '1.5rem', padding: '0.75rem 1.75rem', background: '#1a1a2e', color: '#fff', borderRadius: 12, fontWeight: 600, textDecoration: 'none', fontSize: '0.88rem' }}>
=======
                  <div style={{ background: s.white, border: `1px solid ${s.greenBorder}`, borderRadius: s.r24, padding: '2.5rem', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                    <h3 style={{ fontFamily: s.fontSerif, fontSize: '1.45rem', fontWeight: 700, color: s.ink, marginBottom: '0.5rem' }}>You're on the list.</h3>
                    <p style={{ fontFamily: s.fontSans, color: s.grey500, lineHeight: 1.7, fontSize: '0.9rem' }}>
                      We'll reach out when we launch. You'll be among the first — claim your Founders Circle spot before anyone else.
                    </p>
                    <a href={APP_URL} target="_blank" rel="noopener noreferrer" style={{ fontFamily: s.fontSans, display: 'inline-block', marginTop: '1.5rem', padding: '0.75rem 1.75rem', background: s.ink, color: s.white, borderRadius: s.r12, fontWeight: 600, textDecoration: 'none', fontSize: '0.88rem' }}>
>>>>>>> b14b5779c8dddd715ded22c894554eec7d063995
                      Try the free app now →
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

<<<<<<< HEAD
        {/* REFERRAL STRUCTURE */}
        <section style={{ padding: '3rem 1.5rem' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ background: '#f5f3ff', borderRadius: 28, padding: 'clamp(2rem, 4vw, 3rem)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', alignItems: 'start' }}>
                <div>
                  <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Referral programme</p>
                  <h2 style={{ fontSize: '1.7rem', fontWeight: 700, color: '#0f0f23', lineHeight: 1.2 }}>Everyone wins when you share.</h2>
                </div>
                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { who: '🏅 Founding Members — monthly plan', color: '#7c3aed', rules: ['2 months free on signup (after 3 paid months)','Every referral who activates → you both get 2 months free','No limit — every successful referral counts'] },
                    { who: '👤 Regular paid members', color: '#374151', rules: ['Every referral who activates → you both get 1 month free','No limit'] },
                    { who: '🆓 Free users', color: '#374151', rules: ['Refer someone who becomes a paid member → you both get 1 month free','Your free month unlocks premium automatically — no upfront commitment','Keep going if you love it, stop if you don\'t'] },
                  ].map(({ who, color, rules }) => (
                    <div key={who} style={{ background: '#fff', borderRadius: 16, padding: '1.1rem 1.4rem', border: '1px solid #e5e7eb' }}>
                      <p style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 700, color, fontSize: '0.87rem', marginBottom: '0.5rem' }}>{who}</p>
                      <ul style={{ margin: 0, padding: '0 0 0 1.1rem' }}>
                        {rules.map(r => <li key={r} style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.81rem', color: '#6b7280', marginBottom: '0.2rem', lineHeight: 1.6 }}>{r}</li>)}
                      </ul>
                    </div>
                  ))}
                  <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.72rem', color: '#9ca3af' }}>
                    Rewards are credited after the referred person completes 3 paid months. One account per email address. Founding Member status cannot be transferred.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ROADMAP PREVIEW */}
        <section style={{ padding: '4rem 1.5rem', background: '#f9fafb' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>What's coming</p>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, color: '#0f0f23', lineHeight: 1.2, marginBottom: '1rem' }}>
                A product that keeps growing.
              </h2>
              <p style={{ fontFamily: 'system-ui, sans-serif', color: '#6b7280', maxWidth: 520, margin: '0 auto', lineHeight: 1.7, fontSize: '0.93rem' }}>
                MoneyUnseen is a living product. Every month we add new modules — based on what our users tell us they need. Founding Members get all future features automatically included.
=======
        {/* ── ROADMAP ── */}
        <section style={{ padding: '5rem 1.5rem', background: s.grey50 }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <SectionLabel>What's coming</SectionLabel>
              <h2 style={{ fontFamily: s.fontSerif, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, color: s.ink, lineHeight: 1.2, marginBottom: '1rem' }}>
                A product that keeps getting better.
              </h2>
              <p style={{ fontFamily: s.fontSans, color: s.grey500, maxWidth: 520, margin: '0 auto', lineHeight: 1.7, fontSize: '0.93rem' }}>
                We're constantly looking for new ways to help you save more or get more insight into where your money goes. Founders Circle members get every new feature automatically — and have a direct voice in what we build.
>>>>>>> b14b5779c8dddd715ded22c894554eec7d063995
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {[
<<<<<<< HEAD
                { status: 'live', label: 'Live now', icon: '✅', items: ['Fixed cost & subscription tracking','Two worlds view','Personal goals & opportunity cost','Manual entry, full privacy'] },
                { status: 'soon', label: 'Coming in premium', icon: '🔜', items: ['Renewal reminders (before it\'s too late)','Annual cost calendar','Subscription detective'] },
                { status: 'roadmap', label: 'On the roadmap', icon: '🗺️', items: ['Insurance overlap checker','Energy contract alerts','Mobile plan optimiser','Car cost tracker'] },
                { status: 'future', label: 'Future modules', icon: '💡', items: ['Solar panel & heat pump calculator','Rent vs. buy comparison','Simple pension overview','New ideas from your feedback — monthly'] },
              ].map(({ status, label, icon, items }) => (
                <div key={status} style={{ background: '#fff', border: `1px solid ${status === 'live' ? '#d1fae5' : '#e5e7eb'}`, borderRadius: 20, padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1rem' }}>{icon}</span>
                    <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.75rem', fontWeight: 700, color: status === 'live' ? '#16a34a' : '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
                  </div>
                  <ul style={{ margin: 0, padding: '0 0 0 0', listStyle: 'none' }}>
                    {items.map(item => (
                      <li key={item} style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.82rem', color: status === 'live' ? '#374151' : '#6b7280', marginBottom: '0.4rem', lineHeight: 1.5, paddingLeft: '1rem', position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 0, color: status === 'live' ? '#16a34a' : '#d1d5db' }}>→</span>
=======
                { status: 'live', label: 'Live now', icon: '✅', items: ['Fixed cost & subscription tracking', 'Two worlds view', 'Personal goals & savings calculator', 'Manual entry — full privacy'] },
                { status: 'soon', label: 'Coming in Premium', icon: '🔜', items: ['Renewal reminders', 'Annual cost calendar', 'Subscription detective'] },
                { status: 'roadmap', label: 'On the roadmap', icon: '🗺️', items: ['Insurance overlap checker', 'Energy contract alerts', 'Mobile plan optimiser', 'Car cost tracker'] },
                { status: 'future', label: 'Future modules', icon: '💡', items: ['Solar panel & heat pump calculator', 'Rent vs. buy comparison', 'Simple pension overview', 'New ideas from you — every month'] },
              ].map(({ status, label, icon, items }) => (
                <div key={status} style={{ background: s.white, border: `1px solid ${status === 'live' ? s.greenBorder : s.grey200}`, borderRadius: s.r20, padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1rem' }}>{icon}</span>
                    <span style={{ fontFamily: s.fontSans, fontSize: '0.72rem', fontWeight: 700, color: status === 'live' ? s.green : s.grey500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {items.map(item => (
                      <li key={item} style={{ fontFamily: s.fontSans, fontSize: '0.82rem', color: status === 'live' ? s.grey700 : s.grey500, marginBottom: '0.4rem', lineHeight: 1.5, paddingLeft: '1rem', position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 0, color: status === 'live' ? s.green : s.grey200 }}>→</span>
>>>>>>> b14b5779c8dddd715ded22c894554eec7d063995
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
<<<<<<< HEAD
              <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.83rem', color: '#9ca3af', lineHeight: 1.7 }}>
                Have an idea for a module? <a href="#feedback" style={{ color: '#7c3aed', textDecoration: 'none' }}>Share it via feedback →</a> The best suggestion each month gets built — and that person gets a free month.
=======
              <p style={{ fontFamily: s.fontSans, fontSize: '0.83rem', color: s.grey400, lineHeight: 1.7 }}>
                Have an idea? <a href="#feedback" style={{ color: s.purple, textDecoration: 'none' }}>Share it via feedback →</a> The best suggestion each month gets built.
>>>>>>> b14b5779c8dddd715ded22c894554eec7d063995
              </p>
            </div>
          </div>
        </section>

<<<<<<< HEAD
        {/* BETA + FEEDBACK */}
        <section id="beta" style={{ padding: '4rem 1.5rem' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'start' }}>
            <div>
              <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>This is a beta</p>
              <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.3rem)', fontWeight: 700, color: '#0f0f23', lineHeight: 1.2, marginBottom: '1rem' }}>
                We're building this with you, not for you.
              </h2>
              <p style={{ fontFamily: 'system-ui, sans-serif', color: '#6b7280', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.93rem' }}>
                MoneyUnseen is a work in progress — intentionally. Your feedback goes straight to product decisions, not into a ticket queue nobody reads.
              </p>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
                <p style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 700, color: '#92400e', fontSize: '0.87rem', marginBottom: '0.3rem' }}>⭐ Tip of the month</p>
                <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.82rem', color: '#78350f', lineHeight: 1.7, margin: 0 }}>
                  Every month we spotlight the most valuable piece of feedback. That person gets a free month — and their suggestion published in our product update.
=======
        {/* ── BETA + FEEDBACK ── */}
        <section id="beta" style={{ padding: '5rem 1.5rem' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3.5rem', alignItems: 'start' }}>
            <div>
              <SectionLabel>Help us build what matters</SectionLabel>
              <h2 style={{ fontFamily: s.fontSerif, fontSize: 'clamp(1.7rem, 3.5vw, 2.3rem)', fontWeight: 700, color: s.ink, lineHeight: 1.2, marginBottom: '1rem' }}>
                We're building this<br />with you.
              </h2>
              <p style={{ fontFamily: s.fontSans, color: s.grey500, lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.93rem' }}>
                MoneyUnseen is a capable, mature product — and it keeps getting better. Your feedback goes straight to product decisions, not into a ticket queue nobody reads.
              </p>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: s.r12, padding: '1rem 1.25rem' }}>
                <p style={{ fontFamily: s.fontSans, fontWeight: 700, color: '#92400e', fontSize: '0.87rem', marginBottom: '0.3rem' }}>⭐ Best suggestion each month gets built</p>
                <p style={{ fontFamily: s.fontSans, fontSize: '0.82rem', color: '#78350f', lineHeight: 1.7, margin: 0 }}>
                  We spotlight the most valuable piece of feedback every month. That person gets a free month — and their idea published in our product update.
>>>>>>> b14b5779c8dddd715ded22c894554eec7d063995
                </p>
              </div>
            </div>

            <div id="feedback">
<<<<<<< HEAD
              {feedbackStep === 'hidden' && (
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 24, padding: '2rem', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>💬</div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f0f23', marginBottom: '0.6rem' }}>Help us build what matters</h3>
                  <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.87rem', color: '#6b7280', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                    Tried the app? Have an idea? Something frustrated you? We want to hear it directly — not in an app store review.
                  </p>
                  <button onClick={() => setFeedbackStep('form')}
                    style={{ fontFamily: 'system-ui, sans-serif', width: '100%', padding: '0.85rem', borderRadius: 12, background: '#1a1a2e', color: '#fff', fontWeight: 700, fontSize: '0.92rem', border: 'none', cursor: 'pointer' }}>
                    Share feedback →
                  </button>
                  <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.6rem' }}>2 minutes · Anonymous if you want</p>
                </div>
              )}

              {feedbackStep === 'form' && (
                <form onSubmit={handleFeedback} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 24, padding: '2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f0f23', margin: 0 }}>Your feedback</h3>
                  {[
                    { label: 'How easy was it to use?', key: 'usability', opts: ['Very easy','Easy enough','A bit confusing','Hard to use'] },
                    { label: 'Most valuable feature?', key: 'valuable', opts: ['Seeing total costs','Two worlds view','Personal goals','Pausing costs'] },
                    { label: 'Would you pay for premium?', key: 'wouldPay', opts: ['Yes definitely','Maybe','Probably not','Only if free stays'] },
                  ].map(({ label, key, opts }) => (
                    <div key={key}>
                      <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.83rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>{label}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {opts.map(opt => (
                          <button key={opt} type="button" onClick={() => setFeedback(f => ({ ...f, [key]: opt }))}
                            style={{ fontFamily: 'system-ui, sans-serif', padding: '0.35rem 0.8rem', borderRadius: 99, fontSize: '0.78rem', fontWeight: 500, border: `1.5px solid ${(feedback as any)[key] === opt ? '#7c3aed' : '#e5e7eb'}`, background: (feedback as any)[key] === opt ? '#f5f3ff' : '#fff', color: (feedback as any)[key] === opt ? '#7c3aed' : '#6b7280', cursor: 'pointer' }}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div>
                    <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.83rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>What's missing or what would make this 10x better?</p>
                    <textarea value={feedback.suggestions} onChange={e => setFeedback(f => ({ ...f, suggestions: e.target.value }))} placeholder="Anything goes..." rows={3}
                      style={{ fontFamily: 'system-ui, sans-serif', width: '100%', padding: '0.7rem 0.9rem', border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: '0.83rem', resize: 'none', outline: 'none', boxSizing: 'border-box', color: '#374151' }} />
                  </div>
                  <div>
                    <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.83rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Email (optional — only if you want a reply)</p>
                    <input type="email" value={feedback.email} onChange={e => setFeedback(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com"
                      style={{ fontFamily: 'system-ui, sans-serif', width: '100%', padding: '0.7rem 0.9rem', border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: '0.83rem', outline: 'none', boxSizing: 'border-box', color: '#374151' }} />
                  </div>
                  <button type="submit" disabled={feedbackSubmitting}
                    style={{ fontFamily: 'system-ui, sans-serif', padding: '0.85rem', borderRadius: 12, background: '#1a1a2e', color: '#fff', fontWeight: 700, fontSize: '0.92rem', border: 'none', cursor: feedbackSubmitting ? 'not-allowed' : 'pointer', opacity: feedbackSubmitting ? 0.6 : 1 }}>
                    {feedbackSubmitting ? 'Sending...' : 'Send feedback →'}
                  </button>
                </form>
              )}

              {feedbackStep === 'done' && (
                <div style={{ background: '#fff', border: '1px solid #d1fae5', borderRadius: 24, padding: '2.5rem', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🙏</div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f0f23', marginBottom: '0.5rem' }}>Thank you — seriously.</h3>
                  <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.88rem', color: '#6b7280', lineHeight: 1.7 }}>Your feedback goes straight to product decisions. We read every message.</p>
                </div>
              )}
=======
              <FeedbackWidget />
>>>>>>> b14b5779c8dddd715ded22c894554eec7d063995
            </div>
          </div>
        </section>

<<<<<<< HEAD
        {/* LEGAL */}
        <section style={{ padding: '3rem 1.5rem', background: '#f9fafb' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {[
              { id: 'mission', icon: '🧭', title: 'Mission & Vision',
                tldr: ['We exist to give people financial clarity — without any commercial interest in their choices.','We are, and will always remain, fully independent.'],
                full: 'MoneyUnseen was created because most financial tools serve banks, advertisers, or data brokers — not users. We believe people deserve a tool that is purely on their side. Our mission is to make financial reality visible, in plain language, without agenda. Our vision is a world where no one is surprised by what they pay.' },
              { id: 'privacy', icon: '🔒', title: 'Privacy Policy',
                tldr: ['Your data stays on your device.','We never sell, share, or analyse your personal financial data.','We collect only anonymous usage metrics to improve the product.'],
                full: 'MoneyUnseen stores all data locally in your browser using IndexedDB. We do not transmit this to our servers. Anonymous usage data may be collected to improve the product. Your email address is stored securely and never sold or shared. You can delete your data at any time by clearing your browser storage.' },
              { id: 'terms', icon: '📋', title: 'Terms & Conditions',
                tldr: ['This is a beta — we\'re still building it.','Calculations are informational only — not financial advice.','Founding Member status is linked to an active account and cannot be transferred.'],
                full: 'MoneyUnseen is provided as-is during the beta period. Features may change without notice. All calculations are for informational purposes only and do not constitute financial advice. MoneyUnseen accepts no liability for decisions made based on the app. Founding Member status is permanently linked to the account that activated it — it cannot be transferred, sold, or reinstated after cancellation. Questions? hello@moneyunseen.com' },
=======
        {/* ── FAQ ── */}
        <FAQSection />

        {/* ── INDEPENDENCE MANIFESTO ── */}
        <section style={{ padding: '4rem 1.5rem' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ background: s.ink, borderRadius: s.r24, padding: 'clamp(2rem, 5vw, 4rem)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(109,74,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <SectionLabel>Our independence promise</SectionLabel>
              <h2 style={{ fontFamily: s.fontSerif, fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 700, color: s.white, lineHeight: 1.2, marginBottom: '1.25rem' }}>
                "We earn nothing<br />from your choices."
              </h2>
              <p style={{ fontFamily: s.fontSans, color: '#9ca3af', lineHeight: 1.8, maxWidth: 560, marginBottom: '2rem', fontSize: '0.95rem' }}>
                Most "independent" tools are secretly paid by the companies they recommend. We're not. No affiliate deals. No sponsored results. No data sold. No ads — ever. Our only income is your subscription, which means our only interest is yours.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.65rem', marginBottom: '2rem' }}>
                {[
                  ['✗', 'No affiliate links'],
                  ['✗', 'No sponsored results'],
                  ['✗', 'No data sold'],
                  ['✗', 'No bank access, ever'],
                  ['✗', 'No ads — ever'],
                  ['✓', 'Your interests only'],
                ].map(([icon, text]) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontFamily: s.fontSans, fontSize: '0.85rem', color: icon === '✓' ? '#4ade80' : '#f87171', fontWeight: 700, flexShrink: 0 }}>{icon}</span>
                    <span style={{ fontFamily: s.fontSans, fontSize: '0.82rem', color: '#d1d5db' }}>{text}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {[['Mission & Vision', '#mission'], ['Privacy Policy', '#privacy'], ['Terms & Conditions', '#terms']].map(([label, href]) => (
                  <a key={label} href={href} style={{ fontFamily: s.fontSans, fontSize: '0.82rem', color: s.purpleMid, textDecoration: 'none' }}>{label} →</a>
                ))}
              </div>
            </div>
          </div>
        </section>

                {/* ── LEGAL ── */}
        <section style={{ padding: '3rem 1.5rem', background: s.grey50 }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {[
              { id: 'mission', icon: '🧭', title: 'Mission & Vision', tldr: ['We exist to give people financial clarity — without any commercial interest in their choices.', 'We are, and will always remain, fully independent.'], full: 'MoneyUnseen was created because most financial tools serve banks, advertisers, or data brokers — not users. We believe people deserve a tool that is purely on their side. Our mission is to make financial reality visible, in plain language, without agenda. Our vision is a world where no one is surprised by what they pay.' },
              { id: 'privacy', icon: '🔒', title: 'Privacy Policy', tldr: ['Your data stays on your device.', 'We never sell, share, or analyse your personal financial data.', 'We collect only anonymous usage metrics to improve the product.'], full: 'MoneyUnseen stores all data locally in your browser using IndexedDB. We do not transmit this to our servers. Anonymous usage data may be collected to improve the product. Your email address is stored securely and never sold or shared. You can delete your data at any time by clearing your browser storage.' },
              { id: 'terms', icon: '📋', title: 'Terms & Conditions', tldr: ['Calculations are informational only — not financial advice.', 'Founders Circle status is linked to an active account and cannot be transferred.', 'Questions? hello@moneyunseen.com'], full: 'MoneyUnseen is provided as-is. Features may change without notice. All calculations are for informational purposes only and do not constitute financial advice. MoneyUnseen accepts no liability for decisions made based on the app. Founders Circle status is permanently linked to the account that activated it — it cannot be transferred, sold, or reinstated after cancellation. Questions? hello@moneyunseen.com' },
>>>>>>> b14b5779c8dddd715ded22c894554eec7d063995
            ].map(props => <PolicyCard key={props.id} {...props} />)}
          </div>
        </section>

      </main>

<<<<<<< HEAD
      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #e5e7eb', padding: '2.5rem 1.5rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, #7c3aed, #1a1a2e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: 'system-ui' }}>M</span>
            </div>
            <span style={{ fontFamily: "'Georgia', serif", fontWeight: 700, fontSize: '0.95rem', color: '#374151' }}>MoneyUnseen</span>
          </div>
          <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.78rem', color: '#9ca3af', maxWidth: 380, lineHeight: 1.7, margin: 0 }}>
            We earn nothing from your choices. No affiliates. No sponsors. No ads — ever.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[['Facebook','https://facebook.com/moneyunseen'],['Instagram','https://instagram.com/moneyunseen'],['hello@moneyunseen.com','mailto:hello@moneyunseen.com']].map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.8rem', color: '#9ca3af', textDecoration: 'none' }}>{label}</a>
            ))}
          </div>
          <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.72rem', color: '#d1d5db', margin: 0 }}>© 2026 MoneyUnseen · Made with 💜 to help you see clearly.</p>
=======
      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${s.grey200}`, padding: '2.5rem 1.5rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: s.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: s.white, fontSize: 12, fontWeight: 700 }}>M</span>
            </div>
            <span style={{ fontFamily: s.fontSerif, fontWeight: 700, fontSize: '0.95rem', color: s.grey700 }}>MoneyUnseen</span>
          </div>
          <p style={{ fontFamily: s.fontSans, fontSize: '0.78rem', color: s.grey400, maxWidth: 380, lineHeight: 1.7, margin: 0 }}>
            We earn nothing from your choices. No affiliates. No sponsors. No ads — ever.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[['Facebook', 'https://facebook.com/moneyunseen'], ['Instagram', 'https://instagram.com/moneyunseen'], ['hello@moneyunseen.com', 'mailto:hello@moneyunseen.com']].map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{ fontFamily: s.fontSans, fontSize: '0.8rem', color: s.grey400, textDecoration: 'none' }}>{label}</a>
            ))}
          </div>
          <p style={{ fontFamily: s.fontSans, fontSize: '0.72rem', color: s.grey200, margin: 0 }}>© 2026 MoneyUnseen · Made with 💜 to help you see clearly.</p>
>>>>>>> b14b5779c8dddd715ded22c894554eec7d063995
        </div>
      </footer>
    </div>
  )
}

<<<<<<< HEAD
function PolicyCard({ id, icon, title, tldr, full }: { id: string, icon: string, title: string, tldr: string[], full: string }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div id={id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <span style={{ fontSize: '1.4rem' }}>{icon}</span>
        <h3 style={{ fontFamily: "'Georgia', serif", fontSize: '1.05rem', fontWeight: 700, color: '#0f0f23', marginTop: '0.4rem', marginBottom: 0 }}>{title}</h3>
      </div>
      <div style={{ background: '#f5f3ff', borderRadius: 12, padding: '0.9rem 1rem' }}>
        <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.7rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>
          TL;DR <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 'normal', color: '#9ca3af' }}>(short version)</span>
        </p>
        <ul style={{ margin: 0, padding: '0 0 0 1rem' }}>
          {tldr.map(line => <li key={line} style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.81rem', color: '#4b5563', lineHeight: 1.7, marginBottom: '0.15rem' }}>{line}</li>)}
        </ul>
      </div>
      {!expanded
        ? <button onClick={() => setExpanded(true)} style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.78rem', color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>Read the full version →</button>
        : <div>
            <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.8, margin: '0 0 0.5rem' }}>{full}</p>
            <button onClick={() => setExpanded(false)} style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.78rem', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>↑ Collapse</button>
          </div>
      }
    </div>
  )
}

export default App
=======

// ─── FAQ SECTION ─────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: "Is MoneyUnseen really free?",
    a: "Yes — the app is completely free and unlimited right now. After the first 1,000 Founders claim their spots, the free tier moves to 10 items. We're being upfront about this because we think you deserve to know."
  },
  {
    q: "I'm already using the app. Will my data and access change?",
    a: "Your data is stored on your device and belongs to you — nothing changes there. The free tier limit (10 items) will apply to new users after the Founders milestone. We'll communicate any changes clearly before they happen."
  },
  {
    q: "What is the Founders Circle exactly?",
    a: "The Founders Circle is for the first 1,000 people who choose the lifetime deal at launch (€59.99 once). You get every current and future Premium feature, forever — plus a permanent Founders badge and a direct voice in what we build next. This deal will not be offered again after the 1,000 spots are filled."
  },
  {
    q: "Why should I join the waitlist now if the app is already free?",
    a: "The waitlist guarantees you're first to know when we launch paid features — and first to claim one of the 1,000 Founders Circle spots. Once those spots are gone, the lifetime deal is gone permanently."
  },
  {
    q: "What's the difference between Free, Premium, and Founders Circle?",
    a: "Free gives you the core app — track everything, see your two worlds, set goals. Premium (€3.99/month) adds smart tools like renewal reminders, a subscription detective, annual calendar, and more. Founders Circle (€59.99 once) is lifetime access to all Premium features, current and future — for the first 1,000 members only."
  },
  {
    q: "Does MoneyUnseen connect to my bank?",
    a: "Never. MoneyUnseen is entirely manual and intentionally so. You enter your costs yourself — that's the point. Your data lives on your device only. We have no access to it."
  },
  {
    q: "What happens to my data if I stop using the app?",
    a: "Your data stays on your device until you clear your browser storage. We hold no copy of it on our servers. Unsubscribing from the waitlist removes only your email from our list."
  },
  {
    q: "Will you ever add ads or sell my data?",
    a: "No — ever. Our only income is from subscriptions. We have no affiliate deals, no sponsored results, no data sales. This is a deliberate business decision, not a temporary promise."
  },
]

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section style={{ padding: '5rem 1.5rem', background: s.white }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <SectionLabel>Frequently asked questions</SectionLabel>
          <h2 style={{ fontFamily: s.fontSerif, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 700, color: s.ink, lineHeight: 1.2 }}>
            Good questions deserve straight answers.
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} style={{ background: s.grey50, border: `1px solid ${open === i ? s.purple : s.grey200}`, borderRadius: s.r16, overflow: 'hidden', transition: 'border-color 0.2s' }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%', textAlign: 'left', padding: '1.1rem 1.4rem',
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
                }}
              >
                <span style={{ fontFamily: s.fontSans, fontSize: '0.92rem', fontWeight: 600, color: open === i ? s.purple : s.ink, lineHeight: 1.4 }}>{item.q}</span>
                <span style={{ color: open === i ? s.purple : s.grey400, fontSize: '1.1rem', flexShrink: 0, transition: 'transform 0.2s', transform: open === i ? 'rotate(45deg)' : 'none' }}>+</span>
              </button>
              {open === i && (
                <div style={{ padding: '0 1.4rem 1.1rem' }}>
                  <p style={{ fontFamily: s.fontSans, fontSize: '0.88rem', color: s.grey500, lineHeight: 1.75, margin: 0 }}>{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <p style={{ fontFamily: s.fontSans, fontSize: '0.82rem', color: s.grey400, textAlign: 'center', marginTop: '2rem' }}>
          Still have a question? <a href="mailto:hello@moneyunseen.com" style={{ color: s.purple, textDecoration: 'none' }}>hello@moneyunseen.com</a>
        </p>
      </div>
    </section>
  )
}

// ─── FEEDBACK WIDGET ─────────────────────────────────────────────────────────
function FeedbackWidget() {
  const [step, setStep] = useState<'idle' | 'form' | 'done'>('idle')
  const [submitting, setSubmitting] = useState(false)
  const [fb, setFb] = useState({ usability: '', valuable: '', wouldPay: '', suggestions: '', email: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fb, type: 'feedback', _subject: 'MoneyUnseen Feedback' }),
      })
    } catch { /* ignore */ }
    setStep('done')
    setSubmitting(false)
  }

  if (step === 'done') return (
    <div style={{ background: s.white, border: `1px solid ${s.greenBorder}`, borderRadius: s.r24, padding: '2.5rem', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🙏</div>
      <h3 style={{ fontFamily: s.fontSerif, fontSize: '1.3rem', fontWeight: 700, color: s.ink, marginBottom: '0.5rem' }}>Thank you — seriously.</h3>
      <p style={{ fontFamily: s.fontSans, fontSize: '0.88rem', color: s.grey500, lineHeight: 1.7 }}>Your feedback goes straight to product decisions. We read every message.</p>
    </div>
  )

  if (step === 'idle') return (
    <div style={{ background: s.white, border: `1px solid ${s.grey200}`, borderRadius: s.r24, padding: '2rem', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
      <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>💬</div>
      <h3 style={{ fontFamily: s.fontSerif, fontSize: '1.3rem', fontWeight: 700, color: s.ink, marginBottom: '0.6rem' }}>Share your thoughts</h3>
      <p style={{ fontFamily: s.fontSans, fontSize: '0.87rem', color: s.grey500, lineHeight: 1.7, marginBottom: '1.25rem' }}>
        Tried the app? Have an idea? Something frustrated you? We want to hear it directly.
      </p>
      <PrimaryButton onClick={() => setStep('form')} style={{ width: '100%' }}>Share feedback →</PrimaryButton>
      <p style={{ fontFamily: s.fontSans, fontSize: '0.72rem', color: s.grey400, marginTop: '0.6rem' }}>2 minutes · Anonymous if you want</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} style={{ background: s.white, border: `1px solid ${s.grey200}`, borderRadius: s.r24, padding: '2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      <h3 style={{ fontFamily: s.fontSerif, fontSize: '1.2rem', fontWeight: 700, color: s.ink }}>Your feedback</h3>
      {[
        { label: 'How easy was it to use?', key: 'usability', opts: ['Very easy', 'Easy enough', 'A bit confusing', 'Hard to use'] },
        { label: 'Most valuable feature?', key: 'valuable', opts: ['Seeing total costs', 'Two worlds view', 'Personal goals', 'Pausing costs'] },
        { label: 'Would you pay for premium?', key: 'wouldPay', opts: ['Yes definitely', 'Maybe', 'Probably not', 'Only if free stays'] },
      ].map(({ label, key, opts }) => (
        <div key={key}>
          <p style={{ fontFamily: s.fontSans, fontSize: '0.83rem', fontWeight: 600, color: s.grey700, marginBottom: '0.4rem' }}>{label}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {opts.map(opt => (
              <button key={opt} type="button" onClick={() => setFb(f => ({ ...f, [key]: opt }))}
                style={{ fontFamily: s.fontSans, padding: '0.35rem 0.8rem', borderRadius: s.r99, fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer', border: `1.5px solid ${(fb as any)[key] === opt ? s.purple : s.grey200}`, background: (fb as any)[key] === opt ? s.purpleLight : s.white, color: (fb as any)[key] === opt ? s.purple : s.grey500 }}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div>
        <p style={{ fontFamily: s.fontSans, fontSize: '0.83rem', fontWeight: 600, color: s.grey700, marginBottom: '0.4rem' }}>What's missing or what would make this 10x better?</p>
        <textarea value={fb.suggestions} onChange={e => setFb(f => ({ ...f, suggestions: e.target.value }))} placeholder="Anything goes..." rows={3}
          style={{ fontFamily: s.fontSans, width: '100%', padding: '0.7rem 0.9rem', border: `1.5px solid ${s.grey200}`, borderRadius: s.r12, fontSize: '0.83rem', resize: 'none', outline: 'none', color: s.grey700 }} />
      </div>
      <div>
        <p style={{ fontFamily: s.fontSans, fontSize: '0.83rem', fontWeight: 600, color: s.grey700, marginBottom: '0.4rem' }}>Email (optional — only if you want a reply)</p>
        <input type="email" value={fb.email} onChange={e => setFb(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com"
          style={{ fontFamily: s.fontSans, width: '100%', padding: '0.7rem 0.9rem', border: `1.5px solid ${s.grey200}`, borderRadius: s.r12, fontSize: '0.83rem', outline: 'none', color: s.grey700 }} />
      </div>
      <PrimaryButton style={{ opacity: submitting ? 0.6 : 1 }}>
        {submitting ? 'Sending...' : 'Send feedback →'}
      </PrimaryButton>
    </form>
  )
}
>>>>>>> b14b5779c8dddd715ded22c894554eec7d063995
