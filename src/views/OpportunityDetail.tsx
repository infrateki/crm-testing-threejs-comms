import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { HeroSplitCard } from '@/components/cards/HeroSplitCard'
import { StatsBar } from '@/components/stats/StatsBar'
import { useOpportunity } from '@/api/opportunities'
import { formatCurrency } from '@/utils/format'
import type { StatItem } from '@/types/opportunity'
import { DEMO_OPPORTUNITIES } from './_fixtures'

type TabId = 'contacts' | 'documents' | 'actions' | 'timeline'

const TABS: { id: TabId; label: string }[] = [
  { id: 'contacts', label: 'Contacts' },
  { id: 'documents', label: 'Documents' },
  { id: 'actions', label: 'Actions' },
  { id: 'timeline', label: 'Timeline' },
]

export function OpportunityDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabId>('contacts')

  const { data: apiOpp, isLoading } = useOpportunity(id ?? '')
  const opportunity = apiOpp ?? DEMO_OPPORTUNITIES.find((o) => o.id === id) ?? DEMO_OPPORTUNITIES[0]

  const stats: StatItem[] = opportunity
    ? [
        { label: 'Est. Value', value: formatCurrency(opportunity.value) },
        { label: 'Score', value: opportunity.score.toUpperCase() },
        { label: 'NAICS', value: opportunity.naics_code ?? '—' },
        { label: 'Stage', value: opportunity.status.replace(/_/g, ' ').toUpperCase() },
        { label: 'Owner', value: opportunity.owner.toUpperCase() },
      ]
    : []

  if (isLoading && !opportunity) {
    return (
      <div
        style={{
          padding: '40px',
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          color: 'var(--ink-muted)',
        }}
      >
        Loading…
      </div>
    )
  }

  if (!opportunity) {
    return (
      <div
        style={{
          padding: '40px',
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          color: 'var(--ink-muted)',
        }}
      >
        Opportunity not found.
      </div>
    )
  }

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'var(--ink-muted)',
          padding: '0',
          marginBottom: '24px',
          letterSpacing: '0.02em',
        }}
      >
        ← Back
      </button>

      {/* Hero card */}
      <HeroSplitCard
        opportunity={opportunity}
        onUploadPhoto={() => navigate('/processor')}
      />

      {/* Stats bar */}
      <StatsBar stats={stats} theme="cream" />

      {/* Tabs */}
      <div
        style={{
          borderBottom: '1px solid var(--border)',
          marginTop: '32px',
          display: 'flex',
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom:
                activeTab === tab.id
                  ? '2px solid var(--ink-primary)'
                  : '2px solid transparent',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? 600 : 400,
              color:
                activeTab === tab.id ? 'var(--ink-primary)' : 'var(--ink-muted)',
              letterSpacing: '0.02em',
              marginBottom: '-1px',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: '24px 0' }}>
        {activeTab === 'contacts' && (
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--ink-muted)',
            }}
          >
            Contact data available once API is connected. (T2 pending)
          </div>
        )}
        {activeTab === 'documents' && (
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--ink-muted)',
            }}
          >
            Documents available once API is connected. (T2 pending)
          </div>
        )}
        {activeTab === 'actions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              style={{
                padding: '10px 20px',
                background: 'var(--accent-sage)',
                color: '#fff',
                border: 'none',
                borderRadius: '3px',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                alignSelf: 'flex-start',
                letterSpacing: '0.02em',
              }}
            >
              Mark Pursuing
            </button>
            <button
              style={{
                padding: '10px 20px',
                background: 'var(--bg-cream)',
                color: 'var(--ink-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '3px',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                alignSelf: 'flex-start',
                letterSpacing: '0.02em',
              }}
            >
              Add to Export Queue
            </button>
          </div>
        )}
        {activeTab === 'timeline' && (
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--ink-muted)',
            }}
          >
            Timeline available once API is connected. (T2 pending)
          </div>
        )}
      </div>

      {/* Card export placeholder — T5 owns CardExporter */}
      <div
        style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '24px',
          marginTop: '8px',
        }}
      >
        <SectionLabel>Export</SectionLabel>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--ink-muted)',
            marginTop: '8px',
          }}
        >
          Card export managed by T5 (CardExporter — pending).
        </p>
      </div>
    </div>
  )
}
