import { useState, useRef } from 'react'
import type { Subscription, Currency } from '../types'
import { getMonthlyEquivalent, getCurrencySymbol } from '../types'

interface ExportButtonProps {
  subscriptions: Subscription[]
  currency?: Currency
  onImport?: (subs: Subscription[]) => void
  headerMode?: boolean   // compact import-only button for header
  mode?: 'download' | 'backup' | 'all'  // 'download' = PDF/CSV, 'backup' = JSON, 'all' = dropdown with everything
}

const CATEGORY_EMOJI: Record<string, string> = {
  streaming: '📺', fitness: '💪', software: '💻', music: '🎵', gaming: '🎮',
  food: '🍔', news: '📰', insurance: '🛡️', road_tax: '🚗', lottery: '🎰',
  sports_club: '⚽', hobby_club: '🎨', mobile_phone: '📱', car_fuel: '⛽',
  utilities: '💡', other: '📦',
}

export default function ExportButton({ subscriptions, currency = 'EUR', onImport, headerMode = false, mode = 'all' }: ExportButtonProps) {
  const [open, setOpen] = useState(false)
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sym = getCurrencySymbol(currency)

  // ── JSON export (backup) ─────────────────────────────────────
  const exportJSON = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      currency,
      subscriptions: subscriptions.map(s => ({
        ...s,
        renewalDate: s.renewalDate ? new Date(s.renewalDate).toISOString() : null,
        addedDate: s.addedDate ? new Date(s.addedDate).toISOString() : null,
        trialEndsDate: s.trialEndsDate ? new Date(s.trialEndsDate).toISOString() : null,
      })),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `moneyunseen-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
    setOpen(false)
  }

  // ── JSON import ──────────────────────────────────────────────
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string)
        if (!raw.subscriptions || !Array.isArray(raw.subscriptions)) throw new Error('Invalid format')
        const restored: Subscription[] = raw.subscriptions.map((s: Record<string, unknown>) => ({
          ...s,
          renewalDate: s.renewalDate ? new Date(s.renewalDate as string) : new Date(),
          addedDate: s.addedDate ? new Date(s.addedDate as string) : new Date(),
          trialEndsDate: s.trialEndsDate ? new Date(s.trialEndsDate as string) : undefined,
        }))
        onImport?.(restored)
        setImportStatus('success')
        setTimeout(() => setImportStatus('idle'), 3000)
      } catch {
        setImportStatus('error')
        setTimeout(() => setImportStatus('idle'), 3000)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
    setOpen(false)
  }

  // ── CSV export ───────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ['Name', 'Category', 'Cost', 'Frequency', 'Monthly Equivalent', 'Status', 'Renewal Date', 'Is Trial']
    const rows = subscriptions.map(s => [
      s.name, s.category, s.cost.toFixed(2), s.frequency,
      getMonthlyEquivalent(s.cost, s.frequency).toFixed(2),
      s.isStopped ? 'Stopped' : s.isActive ? 'Active' : 'Paused',
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

  // ── PDF export ───────────────────────────────────────────────
  const exportPDF = () => {
    const active = subscriptions.filter(s => s.isActive && !s.isStopped)
    const paused = subscriptions.filter(s => !s.isActive && !s.isStopped)
    const stopped = subscriptions.filter(s => s.isStopped)
    const totalMonthly = active.reduce((sum, s) => sum + getMonthlyEquivalent(s.cost, s.frequency), 0)
    const savedMonthly = [...paused, ...stopped].reduce((sum, s) => sum + getMonthlyEquivalent(s.cost, s.frequency), 0)
    const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

    const rows = (subs: Subscription[]) => subs.map(s => {
      const mo = getMonthlyEquivalent(s.cost, s.frequency)
      const renewal = s.renewalDate
        ? new Date(s.renewalDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '—'
      return `<tr>
        <td>${CATEGORY_EMOJI[s.category] || '📦'} ${s.name}${s.isTrial ? ' <span class="trial-badge">trial</span>' : ''}</td>
        <td>${sym}${s.cost.toFixed(2)} / ${s.frequency}</td>
        <td>${sym}${mo.toFixed(2)}</td>
        <td>${renewal}</td>
      </tr>`
    }).join('')

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>MoneyUnseen — My Costs</title>
<style>
  * { margin:0;padding:0;box-sizing:border-box }
  body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a2e;padding:24px 32px }
  .header { display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid #f3f4f6 }
  .logo-text { font-size:15px;font-weight:700;color:#1a1a2e }
  .date { font-size:10px;color:#9ca3af }
  .summary { display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px }
  .summary-card { padding:9px 12px;border-radius:8px }
  .paying { background:#f9fafb;border:1px solid #e5e7eb }
  .saved { background:#f0fdf4;border:1px solid #bbf7d0 }
  .yearly { background:#f5f3ff;border:1px solid #ddd6fe }
  .summary-label { font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#9ca3af;margin-bottom:2px }
  .summary-value { font-size:18px;font-weight:700 }
  .paying .summary-value { color:#1a1a2e } .saved .summary-value { color:#16a34a } .yearly .summary-value { color:#7c3aed }
  .summary-sub { font-size:9px;color:#9ca3af;margin-top:1px }
  h2 { font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#b0b7c3;margin-bottom:3px;margin-top:14px }
  table { width:100%;border-collapse:collapse;table-layout:fixed }
  th { text-align:left;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#c4cad4;padding:4px 6px;border-bottom:1px solid #e5e7eb }
  th:nth-child(1) { width:40% } th:nth-child(2) { width:22%;text-align:right } th:nth-child(3) { width:18%;text-align:right } th:nth-child(4) { width:20%;text-align:right }
  td { padding:4px 6px;font-size:11px;border-bottom:1px solid #f5f5f5;overflow:hidden;text-overflow:ellipsis;white-space:nowrap }
  td:nth-child(2),td:nth-child(3),td:nth-child(4) { text-align:right }
  tr:last-child td { border-bottom:none }
  .trial-badge { font-size:8px;background:#fef3c7;color:#92400e;padding:1px 3px;border-radius:3px;font-weight:600 }
  .section-dimmed { opacity:.5 }
  .footer { margin-top:16px;padding-top:8px;border-top:1px solid #f3f4f6;font-size:9px;color:#d1d5db;text-align:center }
  @media print { body { padding:10px 18px } @page { margin:8mm 10mm } }
</style></head><body>
<div class="header"><span class="logo-text">MoneyUnseen</span><span class="date">Generated on ${date}</span></div>
<div class="summary">
  <div class="summary-card paying"><div class="summary-label">Still paying</div><div class="summary-value">${sym}${totalMonthly.toFixed(2)}</div><div class="summary-sub">${active.length} active items</div></div>
  <div class="summary-card saved"><div class="summary-label">Reclaimed</div><div class="summary-value">${sym}${savedMonthly.toFixed(2)}</div><div class="summary-sub">per month · paused + stopped</div></div>
  <div class="summary-card yearly"><div class="summary-label">Yearly total</div><div class="summary-value">${sym}${(totalMonthly * 12).toFixed(0)}</div><div class="summary-sub">at current spending</div></div>
</div>
${active.length > 0 ? `<h2>Active costs</h2><table><thead><tr><th>Name</th><th>Cost</th><th>Per month</th><th>Renewal</th></tr></thead><tbody>${rows(active)}</tbody></table>` : ''}
${paused.length > 0 ? `<div class="section-dimmed"><h2>Paused</h2><table><thead><tr><th>Name</th><th>Cost</th><th>Per month</th><th>Renewal</th></tr></thead><tbody>${rows(paused)}</tbody></table></div>` : ''}
${stopped.length > 0 ? `<div class="section-dimmed"><h2>Stopped</h2><table><thead><tr><th>Name</th><th>Cost</th><th>Per month</th><th>Renewal</th></tr></thead><tbody>${rows(stopped)}</tbody></table></div>` : ''}
<div class="footer">moneyunseen.com · Your data stays on your device · No bank login ever</div>
</body></html>`

    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(html)
    win.document.close()
    setTimeout(() => { win.print() }, 400)
    setOpen(false)
  }

    const btnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    width: '100%', padding: '0.6rem 0.8rem', borderRadius: 8,
    border: 'none', background: 'transparent', cursor: 'pointer',
    fontFamily: 'system-ui', fontSize: '0.85rem', fontWeight: 600,
    color: '#374151', textAlign: 'left',
  }

  // ── Download mode: PDF + CSV choice ──────────────────────────
  if (mode === 'download') {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.5rem 1.1rem', borderRadius: 10,
            border: '1.5px solid #e5e7eb', background: '#fff',
            color: '#6b7280', fontSize: '0.82rem', fontWeight: 600,
            fontFamily: 'system-ui', cursor: 'pointer',
          }}
        >
          ⬇️ Download
        </button>
        {open && (
          <>
            <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
            <div style={{
              position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
              background: '#fff', borderRadius: 12, padding: '0.5rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #e5e7eb',
              zIndex: 20, minWidth: 180,
            }}>
              <button onClick={exportPDF} style={btnStyle}>📄 PDF report</button>
              <button onClick={exportCSV} style={btnStyle}>📊 CSV spreadsheet</button>
            </div>
          </>
        )}
      </div>
    )
  }

  // ── Backup mode: JSON only ────────────────────────────────────
  if (mode === 'backup') {
    return (
      <button
        onClick={exportJSON}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.5rem 1.1rem', borderRadius: 10,
          border: '1.5px solid #e5e7eb', background: '#fff',
          color: '#6b7280', fontSize: '0.82rem', fontWeight: 600,
          fontFamily: 'system-ui', cursor: 'pointer',
        }}
      >
        💾 Backup
      </button>
    )
  }

  // In headerMode: compact import-only button for the header
  if (headerMode) {
    return (
      <div style={{ position: 'relative' }}>
        <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportFile} />
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Restore from backup"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.4rem 0.7rem', borderRadius: 8,
            border: '1.5px solid #e5e7eb', background: '#fff',
            color: importStatus === 'success' ? '#16a34a' : importStatus === 'error' ? '#dc2626' : '#9ca3af',
            fontSize: '0.78rem', fontWeight: 600, fontFamily: 'system-ui', cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {importStatus === 'success' ? '✅' : importStatus === 'error' ? '❌' : '📂'}
          <span style={{ fontSize: '0.72rem' }}>
            {importStatus === 'success' ? 'Imported!' : importStatus === 'error' ? 'Invalid' : 'Import'}
          </span>
        </button>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportFile} />

      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.5rem 1rem', borderRadius: 10,
          border: '1.5px solid #e5e7eb', background: '#fff',
          color: importStatus === 'success' ? '#16a34a' : importStatus === 'error' ? '#dc2626' : '#6b7280',
          fontSize: '0.82rem', fontWeight: 600, fontFamily: 'system-ui', cursor: 'pointer',
        }}
      >
        {importStatus === 'success' ? '✅ Imported!' : importStatus === 'error' ? '❌ Invalid file' : '⬇️ Export / Import'}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
          <div style={{
            position: 'absolute', bottom: '110%', left: 0,
            background: '#fff', borderRadius: 12, padding: '0.5rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #e5e7eb',
            zIndex: 20, minWidth: 210,
          }}>
            <div style={{ padding: '0.3rem 0.8rem 0.2rem', fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Export</div>
            <button onClick={exportPDF} style={btnStyle}>📄 Download as PDF</button>
            <button onClick={exportCSV} style={btnStyle}>📊 Download as CSV</button>
            <button onClick={exportJSON} style={btnStyle}>💾 Backup as JSON</button>
            <div style={{ height: 1, background: '#f3f4f6', margin: '0.3rem 0' }} />
            <div style={{ padding: '0.3rem 0.8rem 0.2rem', fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Import</div>
            <button onClick={() => fileInputRef.current?.click()} style={{ ...btnStyle, color: '#7c3aed' }}>
              📂 Restore from JSON backup
            </button>
            <div style={{ padding: '0 0.8rem 0.5rem', fontSize: '0.72rem', color: '#9ca3af' }}>
              Restores a previously exported backup
            </div>
          </div>
        </>
      )}
    </div>
  )
}
