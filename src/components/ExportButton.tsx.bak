import { useState } from 'react'
import type { Subscription, Currency } from '../types'
import { getMonthlyEquivalent, getCurrencySymbol } from '../types'

interface ExportButtonProps {
  subscriptions: Subscription[]
  currency?: Currency
}

const CATEGORY_EMOJI: Record<string, string> = {
  streaming: '📺', fitness: '💪', software: '💻', music: '🎵', gaming: '🎮',
  food: '🍔', news: '📰', insurance: '🛡️', road_tax: '🚗', lottery: '🎰',
  sports_club: '⚽', hobby_club: '🎨', mobile_phone: '📱', car_fuel: '⛽',
  utilities: '💡', other: '📦',
}

export default function ExportButton({ subscriptions, currency = 'EUR' }: ExportButtonProps) {
  const [open, setOpen] = useState(false)
  const sym = getCurrencySymbol(currency)

  if (subscriptions.length === 0) return null

  const exportCSV = () => {
    const headers = ['Name', 'Category', 'Cost', 'Frequency', 'Monthly Equivalent', 'Status', 'Renewal Date', 'Is Trial']
    const rows = subscriptions.map(s => [
      s.name, s.category, s.cost.toFixed(2), s.frequency,
      getMonthlyEquivalent(s.cost, s.frequency).toFixed(2),
      s.isActive ? 'Active' : 'Paused',
      s.renewalDate ? new Date(s.renewalDate).toLocaleDateString('nl-NL') : '',
      s.isTrial ? 'Yes' : 'No',
    ])
    const csv = [headers, ...rows]
      .map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `moneyunseen-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
    setOpen(false)
  }

  const exportPDF = () => {
    const active = subscriptions.filter(s => s.isActive)
    const paused = subscriptions.filter(s => !s.isActive)
    const totalMonthly = active.reduce((sum, s) => sum + getMonthlyEquivalent(s.cost, s.frequency), 0)
    const savedMonthly = paused.reduce((sum, s) => sum + getMonthlyEquivalent(s.cost, s.frequency), 0)
    const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

    const rows = (subs: Subscription[]) => subs.map(s => {
      const mo = getMonthlyEquivalent(s.cost, s.frequency)
      return `
        <tr>
          <td>${CATEGORY_EMOJI[s.category] || '📦'} ${s.name}${s.isTrial ? ' <span class="trial-badge">trial</span>' : ''}</td>
          <td>${sym}${s.cost.toFixed(2)} / ${s.frequency}</td>
          <td>${sym}${mo.toFixed(2)}</td>
          <td>${s.renewalDate ? new Date(s.renewalDate).toLocaleDateString('en-GB') : '—'}</td>
        </tr>`
    }).join('')

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>MoneyUnseen — My Subscriptions</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a2e; background: #fff; padding: 40px; }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #f3f4f6; }
    .logo { display: flex; align-items: center; gap: 10px; }
    .logo img { height: 32px; }
    .logo-text { font-size: 20px; font-weight: 700; color: #1a1a2e; }
    .date { font-size: 13px; color: #9ca3af; }
    .summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 32px; }
    .summary-card { padding: 16px 20px; border-radius: 12px; }
    .summary-card.paying { background: #f9fafb; border: 1px solid #e5e7eb; }
    .summary-card.saved { background: #f0fdf4; border: 1px solid #bbf7d0; }
    .summary-card.yearly { background: #f5f3ff; border: 1px solid #ddd6fe; }
    .summary-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 6px; }
    .summary-value { font-size: 28px; font-weight: 700; }
    .summary-card.paying .summary-value { color: #1a1a2e; }
    .summary-card.saved .summary-value { color: #16a34a; }
    .summary-card.yearly .summary-value { color: #7c3aed; }
    .summary-sub { font-size: 12px; color: #9ca3af; margin-top: 2px; }
    h2 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 10px; margin-top: 28px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
    td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
    tr:last-child td { border-bottom: none; }
    .trial-badge { font-size: 10px; background: #fef3c7; color: #92400e; padding: 1px 5px; border-radius: 4px; font-weight: 600; }
    .paused-section table { opacity: 0.6; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #f3f4f6; font-size: 11px; color: #d1d5db; text-align: center; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <img src="/logo.png" alt="MoneyUnseen" onerror="this.style.display='none'">
      <span class="logo-text">MoneyUnseen</span>
    </div>
    <span class="date">Generated on ${date}</span>
  </div>

  <div class="summary">
    <div class="summary-card paying">
      <div class="summary-label">Still paying</div>
      <div class="summary-value">${sym}${totalMonthly.toFixed(2)}</div>
      <div class="summary-sub">${active.length} active subscription${active.length !== 1 ? 's' : ''}</div>
    </div>
    <div class="summary-card saved">
      <div class="summary-label">Reclaimed</div>
      <div class="summary-value">${sym}${savedMonthly.toFixed(2)}</div>
      <div class="summary-sub">per month by pausing</div>
    </div>
    <div class="summary-card yearly">
      <div class="summary-label">Yearly total</div>
      <div class="summary-value">${sym}${(totalMonthly * 12).toFixed(0)}</div>
      <div class="summary-sub">at current spending</div>
    </div>
  </div>

  ${active.length > 0 ? `
  <h2>Active subscriptions</h2>
  <table>
    <thead><tr><th>Name</th><th>Cost</th><th>Per month</th><th>Renewal</th></tr></thead>
    <tbody>${rows(active)}</tbody>
  </table>` : ''}

  ${paused.length > 0 ? `
  <div class="paused-section">
  <h2>Paused subscriptions</h2>
  <table>
    <thead><tr><th>Name</th><th>Cost</th><th>Per month</th><th>Renewal</th></tr></thead>
    <tbody>${rows(paused)}</tbody>
  </table>
  </div>` : ''}

  <div class="footer">moneyunseen.com · Your data stays on your device · No bank login ever</div>
</body>
</html>`

    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(html)
    win.document.close()
    setTimeout(() => { win.print() }, 400)
    setOpen(false)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.5rem 1rem', borderRadius: 10,
          border: '1.5px solid #e5e7eb', background: '#fff',
          color: '#6b7280', fontSize: '0.82rem', fontWeight: 600,
          fontFamily: 'system-ui', cursor: 'pointer',
        }}
      >
        ⬇️ Export
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
          {/* Dropdown */}
          <div style={{
            position: 'absolute', bottom: '110%', left: 0,
            background: '#fff', borderRadius: 12, padding: '0.5rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #e5e7eb',
            zIndex: 20, minWidth: 180,
          }}>
            <button onClick={exportPDF} style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              width: '100%', padding: '0.6rem 0.8rem', borderRadius: 8,
              border: 'none', background: 'transparent', cursor: 'pointer',
              fontFamily: 'system-ui', fontSize: '0.85rem', fontWeight: 600, color: '#374151',
              textAlign: 'left',
            }}>
              📄 Download as PDF
            </button>
            <button onClick={exportCSV} style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              width: '100%', padding: '0.6rem 0.8rem', borderRadius: 8,
              border: 'none', background: 'transparent', cursor: 'pointer',
              fontFamily: 'system-ui', fontSize: '0.85rem', fontWeight: 600, color: '#374151',
              textAlign: 'left',
            }}>
              📊 Download as CSV
            </button>
          </div>
        </>
      )}
    </div>
  )
}
