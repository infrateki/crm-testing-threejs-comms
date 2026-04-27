import { SectionLabel } from '@/components/ui/SectionLabel'

export function Dashboard() {
  return (
    <div>
      <SectionLabel>Overview</SectionLabel>
      <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '36px', fontWeight: 900, marginTop: '16px' }}>
        Dashboard
      </h1>
    </div>
  )
}
