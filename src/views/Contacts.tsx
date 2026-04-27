import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { SearchInput } from '@/components/ui/SearchInput'
import { ConfirmDialog } from '@/components/modals/ConfirmDialog'
import { useOpportunityStore } from '@/store/useOpportunityStore'
import type { Contact } from '@/types/contact'

const ROLE_OPTIONS = ['sponsor', 'technical', 'contracting', 'finance', 'general']

interface DraftContact {
  name: string
  title: string
  agency: string
  email: string
  phone: string
  role_tag: string
}

const emptyDraft: DraftContact = {
  name: '',
  title: '',
  agency: '',
  email: '',
  phone: '',
  role_tag: 'general',
}

export function Contacts() {
  const navigate = useNavigate()
  const contacts = useOpportunityStore((s) => s.contacts)
  const opportunities = useOpportunityStore((s) => s.opportunities)
  const createContact = useOpportunityStore((s) => s.createContact)
  const updateContact = useOpportunityStore((s) => s.updateContact)
  const deleteContact = useOpportunityStore((s) => s.deleteContact)

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<DraftContact>(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<DraftContact>(emptyDraft)
  const [confirmDelete, setConfirmDelete] = useState<Contact | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return contacts.filter((c) => {
      if (roleFilter && c.role_tag !== roleFilter) return false
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        (c.title?.toLowerCase().includes(q) ?? false) ||
        (c.agency?.toLowerCase().includes(q) ?? false) ||
        (c.email?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [contacts, search, roleFilter])

  const linkedCount = (id: string) => {
    const c = contacts.find((x) => x.id === id)
    return c?.opportunity_ids.length ?? 0
  }

  const startEdit = (c: Contact) => {
    setEditingId(c.id)
    setEditDraft({
      name: c.name,
      title: c.title ?? '',
      agency: c.agency ?? '',
      email: c.email ?? '',
      phone: c.phone ?? '',
      role_tag: c.role_tag,
    })
  }

  const saveEdit = () => {
    if (!editingId) return
    if (!editDraft.name.trim()) return
    updateContact(editingId, {
      name: editDraft.name.trim(),
      title: editDraft.title.trim() || null,
      agency: editDraft.agency.trim() || null,
      email: editDraft.email.trim() || null,
      phone: editDraft.phone.trim() || null,
      role_tag: editDraft.role_tag,
    })
    setEditingId(null)
  }

  const saveAdd = () => {
    if (!draft.name.trim()) return
    createContact({
      name: draft.name.trim(),
      title: draft.title.trim() || null,
      agency: draft.agency.trim() || null,
      email: draft.email.trim() || null,
      phone: draft.phone.trim() || null,
      role_tag: draft.role_tag,
    })
    setDraft(emptyDraft)
    setAdding(false)
  }

  const linkedOpps = (c: Contact) =>
    opportunities.filter((o) => c.opportunity_ids.includes(o.id))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <SectionLabel>Directory</SectionLabel>
          <h1 style={titleStyle}>Contacts</h1>
        </div>
        <button onClick={() => setAdding((a) => !a)} style={primaryBtn}>
          {adding ? 'Cancel' : '+ Add Contact'}
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          padding: '12px 16px',
          background: 'var(--bg-cream)',
          border: '1px solid var(--border)',
          borderRadius: '3px',
        }}
      >
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, org, email…" />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            padding: '6px 10px',
            border: '1px solid var(--border)',
            borderRadius: '3px',
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--ink-secondary)',
            background: 'var(--bg-primary)',
            cursor: 'pointer',
          }}
        >
          <option value="">All Roles</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--ink-muted)' }}>
          {filtered.length} {filtered.length === 1 ? 'contact' : 'contacts'}
        </span>
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: COL_TEMPLATE, background: 'var(--bg-cream)', borderBottom: '1px solid var(--border)' }}>
          {COL_HEADERS.map((h) => (
            <div key={h} style={headerCellStyle}>
              {h}
            </div>
          ))}
        </div>

        {adding && (
          <div style={{ display: 'grid', gridTemplateColumns: COL_TEMPLATE, background: 'var(--bg-warm)', borderBottom: '1px solid var(--border)' }}>
            <CellInput value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} placeholder="Name *" />
            <CellInput value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} placeholder="Title" />
            <CellInput value={draft.agency} onChange={(v) => setDraft({ ...draft, agency: v })} placeholder="Org" />
            <CellInput value={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} placeholder="email@…" />
            <CellInput value={draft.phone} onChange={(v) => setDraft({ ...draft, phone: v })} placeholder="555-0100" />
            <div style={cellStyle}>
              <select
                value={draft.role_tag}
                onChange={(e) => setDraft({ ...draft, role_tag: e.target.value })}
                style={{ ...cellInputStyle }}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div style={cellStyle}>—</div>
            <div style={{ ...cellStyle, display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button onClick={saveAdd} style={miniBtn('primary')}>
                Save
              </button>
              <button onClick={() => { setAdding(false); setDraft(emptyDraft) }} style={miniBtn('secondary')}>
                ×
              </button>
            </div>
          </div>
        )}

        {filtered.map((c) => {
          const editing = editingId === c.id
          const opps = linkedOpps(c)
          return (
            <div
              key={c.id}
              style={{
                display: 'grid',
                gridTemplateColumns: COL_TEMPLATE,
                background: editing ? 'var(--bg-warm)' : 'var(--bg-primary)',
                borderBottom: '1px solid var(--border-subtle)',
                transition: 'background 0.15s',
              }}
            >
              {editing ? (
                <>
                  <CellInput value={editDraft.name} onChange={(v) => setEditDraft({ ...editDraft, name: v })} />
                  <CellInput value={editDraft.title} onChange={(v) => setEditDraft({ ...editDraft, title: v })} />
                  <CellInput value={editDraft.agency} onChange={(v) => setEditDraft({ ...editDraft, agency: v })} />
                  <CellInput value={editDraft.email} onChange={(v) => setEditDraft({ ...editDraft, email: v })} />
                  <CellInput value={editDraft.phone} onChange={(v) => setEditDraft({ ...editDraft, phone: v })} />
                  <div style={cellStyle}>
                    <select
                      value={editDraft.role_tag}
                      onChange={(e) => setEditDraft({ ...editDraft, role_tag: e.target.value })}
                      style={cellInputStyle}
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={cellStyle}>{linkedCount(c.id)}</div>
                  <div style={{ ...cellStyle, display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <button onClick={saveEdit} style={miniBtn('primary')}>
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)} style={miniBtn('secondary')}>
                      ×
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ ...cellStyle, fontWeight: 600, color: 'var(--ink-primary)' }}>{c.name}</div>
                  <div style={cellStyle}>{c.title ?? '—'}</div>
                  <div style={cellStyle}>{c.agency ?? '—'}</div>
                  <div style={{ ...cellStyle, fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                    {c.email ?? '—'}
                  </div>
                  <div style={{ ...cellStyle, fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                    {c.phone ?? '—'}
                  </div>
                  <div style={{ ...cellStyle, fontSize: '11px', color: 'var(--ink-tertiary)' }}>
                    {c.role_tag}
                  </div>
                  <div
                    style={{
                      ...cellStyle,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: opps.length > 0 ? 'var(--ink-primary)' : 'var(--ink-muted)',
                    }}
                    title={opps.map((o) => o.title).join(', ')}
                  >
                    {opps.length > 0 ? (
                      <button
                        onClick={() => opps[0] && navigate(`/opportunities/${opps[0].id}`)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '12px',
                          color: 'var(--accent-slate)',
                        }}
                      >
                        {opps.length}
                      </button>
                    ) : (
                      '0'
                    )}
                  </div>
                  <div style={{ ...cellStyle, display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button onClick={() => startEdit(c)} style={miniBtn('secondary')}>
                      Edit
                    </button>
                    <button onClick={() => setConfirmDelete(c)} style={{ ...miniBtn('secondary'), color: '#DC2626' }}>
                      Del
                    </button>
                  </div>
                </>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && !adding && (
          <div
            style={{
              padding: '40px 24px',
              textAlign: 'center',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--ink-muted)',
            }}
          >
            No contacts match your filters.
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete contact?"
        message={confirmDelete ? `Remove ${confirmDelete.name} from your contact directory?` : ''}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (confirmDelete) deleteContact(confirmDelete.id)
          setConfirmDelete(null)
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}

function CellInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div style={cellStyle}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={cellInputStyle}
      />
    </div>
  )
}

const COL_TEMPLATE = '180px 160px 180px 200px 130px 100px 70px 110px'
const COL_HEADERS = ['Name', 'Title', 'Org', 'Email', 'Phone', 'Role', 'Linked', '']

const titleStyle = {
  fontFamily: 'var(--font-headline)',
  fontSize: '36px',
  fontWeight: 900,
  color: 'var(--ink-primary)',
  letterSpacing: '-0.02em',
  marginTop: '4px',
}

const headerCellStyle = {
  padding: '10px 12px',
  fontFamily: 'var(--font-body)',
  fontSize: '11px',
  fontWeight: 500,
  color: 'var(--ink-muted)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
}

const cellStyle = {
  padding: '12px',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--ink-secondary)',
  display: 'flex',
  alignItems: 'center',
  minWidth: 0,
  overflow: 'hidden' as const,
  textOverflow: 'ellipsis' as const,
  whiteSpace: 'nowrap' as const,
}

const cellInputStyle = {
  width: '100%',
  padding: '4px 6px',
  border: '1px solid var(--border)',
  borderRadius: '3px',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--ink-primary)',
  background: 'var(--bg-primary)',
  outline: 'none',
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

function miniBtn(variant: 'primary' | 'secondary'): React.CSSProperties {
  return {
    padding: '4px 8px',
    background: variant === 'primary' ? 'var(--accent-slate)' : 'var(--bg-primary)',
    color: variant === 'primary' ? '#fff' : 'var(--ink-secondary)',
    border: variant === 'primary' ? 'none' : '1px solid var(--border)',
    borderRadius: '3px',
    fontFamily: 'var(--font-body)',
    fontSize: '11px',
    fontWeight: 500,
    cursor: 'pointer',
  }
}
