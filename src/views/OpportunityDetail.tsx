import { useParams } from 'react-router-dom'
import { SectionLabel } from '@/components/ui/SectionLabel'

export function OpportunityDetail() {
  const { id } = useParams<{ id: string }>()
  return (
    <div>
      <SectionLabel>Opportunity</SectionLabel>
      <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '36px', fontWeight: 900, marginTop: '16px' }}>
        Detail — {id}
      </h1>
    </div>
  )
}
