import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface IllustrationOverridesState {
  overrides: Record<string, string>
  setOverride: (id: string, url: string) => void
  clearOverride: (id: string) => void
  getOverride: (id: string) => string | undefined
}

export const useIllustrationOverrides = create<IllustrationOverridesState>()(
  persist(
    (set, get) => ({
      overrides: {},
      setOverride: (id, url) =>
        set((s) => ({ overrides: { ...s.overrides, [id]: url } })),
      clearOverride: (id) =>
        set((s) => {
          const next = { ...s.overrides }
          delete next[id]
          return { overrides: next }
        }),
      getOverride: (id) => get().overrides[id],
    }),
    {
      name: 'bimsearch-illustration-overrides',
    },
  ),
)
