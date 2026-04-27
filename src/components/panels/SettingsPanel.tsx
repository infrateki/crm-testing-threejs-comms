import { useRef, useState } from 'react'
import { SlideOver } from './SlideOver'
import { ConfirmDialog } from '@/components/modals/ConfirmDialog'
import { useOpportunityStore } from '@/store/useOpportunityStore'

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const resetToDefaults = useOpportunityStore((s) => s.resetToDefaults)
  const exportData = useOpportunityStore((s) => s.exportData)
  const importData = useOpportunityStore((s) => s.importData)

  const [confirmReset, setConfirmReset] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bimsearch-data-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExportSuccess(true)
    setTimeout(() => setExportSuccess(false), 2000)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null)
    setImportSuccess(false)
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string
        const parsed = JSON.parse(text)
        if (!parsed.opportunities || !Array.isArray(parsed.opportunities)) {
          throw new Error('Missing opportunities array')
        }
        importData({
          opportunities: parsed.opportunities ?? [],
          contacts: parsed.contacts ?? [],
          notes: parsed.notes ?? [],
        })
        setImportSuccess(true)
        setTimeout(() => setImportSuccess(false), 2500)
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Invalid JSON file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <>
      <SlideOver open={open} onClose={onClose} title="Settings" subtitle="Data management & preferences" width={420}>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <Section title="Demo Data">
            <p style={paragraphStyle}>
              Reset all opportunities, contacts, and notes back to the original demo seed.
              Your local changes will be lost.
            </p>
            <button
              onClick={() => setConfirmReset(true)}
              style={{
                ...secondaryBtn,
                color: '#DC2626',
                borderColor: '#DC2626',
              }}
            >
              Reset to Demo Data
            </button>
          </Section>

          <Section title="Export">
            <p style={paragraphStyle}>
              Download a JSON snapshot of all your data (opportunities, contacts, notes).
            </p>
            <button onClick={handleExport} style={primaryBtn}>
              {exportSuccess ? '✓ Downloaded' : 'Export Data (JSON)'}
            </button>
          </Section>

          <Section title="Import">
            <p style={paragraphStyle}>
              Upload a previously-exported JSON file to restore your data. This replaces all
              existing data.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={handleImport}
            />
            <button onClick={() => fileRef.current?.click()} style={secondaryBtn}>
              {importSuccess ? '✓ Imported' : 'Import Data (JSON)'}
            </button>
            {importError && (
              <p
                style={{
                  marginTop: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: '#DC2626',
                }}
              >
                Error: {importError}
              </p>
            )}
          </Section>

          <Section title="Storage">
            <p style={paragraphStyle}>
              Your data is stored in browser localStorage under{' '}
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                bimsearch-opportunities
              </code>
              .
            </p>
          </Section>
        </div>
      </SlideOver>

      <ConfirmDialog
        open={confirmReset}
        title="Reset to demo data?"
        message="This will overwrite all opportunities, contacts, and notes with the original demo seed. This cannot be undone."
        confirmLabel="Reset"
        danger
        onConfirm={() => {
          resetToDefaults()
          setConfirmReset(false)
          onClose()
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--ink-tertiary)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
        {children}
      </div>
    </section>
  )
}

const paragraphStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--ink-secondary)',
  lineHeight: 1.55,
  margin: 0,
}

const primaryBtn = {
  padding: '8px 14px',
  background: 'var(--accent-slate)',
  color: '#fff',
  border: 'none',
  borderRadius: '3px',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  letterSpacing: '0.02em',
}

const secondaryBtn = {
  padding: '8px 14px',
  background: 'var(--bg-primary)',
  color: 'var(--ink-secondary)',
  border: '1px solid var(--border)',
  borderRadius: '3px',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  letterSpacing: '0.02em',
}
