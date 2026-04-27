import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Shell } from '@/components/layout/Shell'
import { ThreeSpinner } from '@/components/three/ThreeSpinner'

const Dashboard = lazy(() => import('@/views/Dashboard').then((m) => ({ default: m.Dashboard })))
const Showcase = lazy(() => import('@/views/Showcase').then((m) => ({ default: m.Showcase })))
const OpportunityDetail = lazy(() =>
  import('@/views/OpportunityDetail').then((m) => ({ default: m.OpportunityDetail }))
)
const Pipeline = lazy(() => import('@/views/Pipeline').then((m) => ({ default: m.Pipeline })))
const Contacts = lazy(() => import('@/views/Contacts').then((m) => ({ default: m.Contacts })))
const PortalHealth = lazy(() => import('@/views/PortalHealth').then((m) => ({ default: m.PortalHealth })))
const InkProcessor = lazy(() => import('@/views/InkProcessor').then((m) => ({ default: m.InkProcessor })))
const CardBuilder = lazy(() => import('@/views/CardBuilder').then((m) => ({ default: m.CardBuilder })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

function AppRoutes() {
  return (
    <Shell>
      <Suspense fallback={<div style={{ padding: '40px', display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--ink-muted)', fontFamily: 'var(--font-body)', fontSize: '13px' }}><ThreeSpinner />Loading…</div>}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/showcase" element={<Showcase />} />
          <Route path="/opportunities/:id" element={<OpportunityDetail />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/portals" element={<PortalHealth />} />
          <Route path="/processor" element={<InkProcessor />} />
          <Route path="/card-builder" element={<CardBuilder />} />
        </Routes>
      </Suspense>
    </Shell>
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
    </QueryClientProvider>
  )
}
