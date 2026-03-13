import { useState } from 'react'
import type { BillingFrequency, SubscriptionCategory } from '../types'

interface OnboardingWizardProps {
  onComplete: (firstSubscription?: {
    name: string
    cost: number
    frequency: BillingFrequency
    category: SubscriptionCategory
    renewalDate: Date
  }) => void
}

const STEPS = ['welcome', 'add', 'goal'] as const
type Step = typeof STEPS[number]

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState<Step>('welcome')
  const [name, setName] = useState('')
  const [cost, setCost] = useState('')
  const [frequency, setFrequency] = useState<BillingFrequency>('monthly')
  const [category, setCategory] = useState<SubscriptionCategory>('streaming')

  const progress = (STEPS.indexOf(step) + 1) / STEPS.length

  const handleAddAndContinue = () => {
    if (name && cost) setStep('goal')
    else setStep('goal')
  }

  const handleFinish = () => {
    if (name && cost) {
      onComplete({
        name,
        cost: parseFloat(cost),
        frequency,
        category,
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      })
    } else {
      onComplete()
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(15,15,35,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: '#fff', borderRadius: 24, padding: '2rem',
        width: '100%', maxWidth: 480,
        boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
      }}>

        {/* Progress bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', fontFamily: 'system-ui' }}>
              Step {STEPS.indexOf(step) + 1} of {STEPS.length}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'system-ui' }}>
              {Math.round(progress * 100)}% complete
            </span>
          </div>
          <div style={{ height: 6, background: '#f3f4f6', borderRadius: 99 }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
              width: `${progress * 100}%`,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* STEP 1: Welcome */}
        {step === 'welcome' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>👀</div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f0f23', marginBottom: '0.5rem', fontFamily: 'system-ui' }}>
                Welcome to MoneyUnseen
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.7, fontFamily: 'system-ui' }}>
                Most people have no idea how much they actually pay every month. This takes 2 minutes — no bank login needed.
              </p>
            </div>

            {/* Privacy badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.75rem' }}>
              {[
                ['🔒', 'No bank login — ever', 'We never touch your bank. You type everything yourself.'],
                ['📱', 'Data stays on your device', 'Nothing leaves your phone or browser.'],
                ['✏️', 'You stay in control', 'Add, pause, or delete anything at any time.'],
              ].map(([icon, title, desc]) => (
                <div key={title} style={{
                  display: 'flex', gap: '0.75rem', padding: '0.75rem 1rem',
                  background: '#f5f3ff', borderRadius: 12, alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: '1.1rem', marginTop: 1 }}>{icon}</span>
                  <div>
                    <p style={{ fontFamily: 'system-ui', fontWeight: 700, fontSize: '0.85rem', color: '#374151', margin: '0 0 0.1rem' }}>{title}</p>
                    <p style={{ fontFamily: 'system-ui', fontSize: '0.78rem', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep('add')}
              style={{
                width: '100%', padding: '0.9rem', borderRadius: 12,
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                border: 'none', cursor: 'pointer', fontFamily: 'system-ui',
              }}>
              Let's start — add your first cost →
            </button>
            <p style={{ fontFamily: 'system-ui', fontSize: '0.72rem', color: '#9ca3af', textAlign: 'center', marginTop: '0.6rem' }}>
              You can skip this and add everything manually later
            </p>
          </div>
        )}

        {/* STEP 2: Add first subscription */}
        {step === 'add' && (
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f0f23', marginBottom: '0.4rem', fontFamily: 'system-ui' }}>
              Add your first cost
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.25rem', fontFamily: 'system-ui', lineHeight: 1.6 }}>
              Start with anything — Netflix, insurance, a gym, your phone plan. Whatever comes to mind first.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ fontFamily: 'system-ui', fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                  What is it?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Netflix, Gym, Insurance..."
                  style={{
                    width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
                    border: '1.5px solid #e5e7eb', fontSize: '0.92rem',
                    fontFamily: 'system-ui', outline: 'none', boxSizing: 'border-box', color: '#0f0f23',
                  }}
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontFamily: 'system-ui', fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={cost}
                    onChange={e => setCost(e.target.value)}
                    placeholder="9.99"
                    style={{
                      width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
                      border: '1.5px solid #e5e7eb', fontSize: '0.92rem',
                      fontFamily: 'system-ui', outline: 'none', boxSizing: 'border-box', color: '#0f0f23',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontFamily: 'system-ui', fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                    How often?
                  </label>
                  <select
                    value={frequency}
                    onChange={e => setFrequency(e.target.value as BillingFrequency)}
                    style={{
                      width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
                      border: '1.5px solid #e5e7eb', fontSize: '0.88rem',
                      fontFamily: 'system-ui', outline: 'none', boxSizing: 'border-box',
                      background: '#fff', color: '#374151',
                    }}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontFamily: 'system-ui', fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as SubscriptionCategory)}
                  style={{
                    width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
                    border: '1.5px solid #e5e7eb', fontSize: '0.88rem',
                    fontFamily: 'system-ui', outline: 'none', boxSizing: 'border-box',
                    background: '#fff', color: '#374151',
                  }}
                >
                  <option value="streaming">📺 Streaming</option>
                  <option value="music">🎵 Music</option>
                  <option value="gaming">🎮 Gaming</option>
                  <option value="news">📰 News & Media</option>
                  <option value="software">💻 Software</option>
                  <option value="mobile_phone">📱 Mobile Phone</option>
                  <option value="food">🍔 Food & Delivery</option>
                  <option value="fitness">💪 Fitness</option>
                  <option value="sports_club">⚽ Sports Club</option>
                  <option value="hobby_club">🎨 Hobby Club</option>
                  <option value="utilities">💡 Utilities</option>
                  <option value="insurance">🛡️ Insurance</option>
                  <option value="road_tax">🚗 Road Tax</option>
                  <option value="car_fuel">⛽ Car Fuel</option>
                  <option value="lottery">🎰 Lottery</option>
                  <option value="other">📦 Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                onClick={handleAddAndContinue}
                disabled={!name || !cost}
                style={{
                  flex: 1, padding: '0.9rem', borderRadius: 12,
                  background: name && cost ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : '#e5e7eb',
                  color: name && cost ? '#fff' : '#9ca3af',
                  fontWeight: 700, fontSize: '0.92rem',
                  border: 'none', cursor: name && cost ? 'pointer' : 'not-allowed',
                  fontFamily: 'system-ui',
                }}>
                Add & continue →
              </button>
              <button
                onClick={() => setStep('goal')}
                style={{
                  padding: '0.9rem 1.25rem', borderRadius: 12,
                  border: '1.5px solid #e5e7eb', background: '#fff',
                  color: '#6b7280', fontWeight: 600, fontSize: '0.85rem',
                  cursor: 'pointer', fontFamily: 'system-ui',
                }}>
                Skip
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Ready */}
        {step === 'goal' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎯</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f0f23', marginBottom: '0.5rem', fontFamily: 'system-ui' }}>
              {name ? `"${name}" added!` : "You're all set!"}
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.75, marginBottom: '1.5rem', fontFamily: 'system-ui' }}>
              Now add the rest of your subscriptions and fixed costs. The more you add, the clearer the picture — and the bigger the opportunity to reclaim money.
            </p>

            <div style={{ background: '#f5f3ff', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.5rem', textAlign: 'left' }}>
              <p style={{ fontFamily: 'system-ui', fontSize: '0.82rem', fontWeight: 700, color: '#7c3aed', marginBottom: '0.5rem' }}>💡 Things people often forget</p>
              {['Lottery subscriptions', 'Cloud storage (iCloud, Google One)', 'Magazines & newspapers', 'Road tax & car insurance', 'Annual software licences', 'Charity direct debits'].map(item => (
                <p key={item} style={{ fontFamily: 'system-ui', fontSize: '0.8rem', color: '#6b7280', margin: '0.2rem 0', lineHeight: 1.5 }}>→ {item}</p>
              ))}
            </div>

            <button
              onClick={handleFinish}
              style={{
                width: '100%', padding: '0.9rem', borderRadius: 12,
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                border: 'none', cursor: 'pointer', fontFamily: 'system-ui',
              }}>
              Open MoneyUnseen →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
