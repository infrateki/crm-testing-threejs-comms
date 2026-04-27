import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate, useBeforeUnload } from 'react-router-dom'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { HeroSplitCard } from '@/components/cards/HeroSplitCard'
import { StatsBar } from '@/components/stats/StatsBar'
import { BuildingModel3D } from '@/components/three/BuildingModel3D'
import { ConfirmDialog } from '@/components/modals/ConfirmDialog'
import { useOpportunityStore } from '@/store/useOpportunityStore'
import { formatCurrency } from '@/utils/format'
import { relativeTime, initials } from '@/utils/time'
import type { StatItem, Opportunity, OpportunityStatus, Tier, Score } from '@/types/opportunity'
import { PIPELINE_STAGES } from '@/types/pipeline'

type TabId = 'contacts' | 'notes' | 'documents' | 'actions' | 'timeline' | '3d-preview'

const TABS: { id: TabId; label: string }[] = [
  { id: 'contacts', label: 'Contacts' },
  { id: 'notes', label: 'Notes' },
  { id: 'documents', label: 'Documents' },
  { id: 'actions', label: 'Actions' },
  { id: 'timeline', label: 'Timeline' },
  { id: '3d-preview', label: '3D Preview' },
]

const OWNERS = ['jorge', 'sergio', 'julio', 'shami', 'jarvis']
const DEFAULT_AUTHOR = 'Sergio'

export function OpportunityDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const opportunity = useOpportunityStore((s) => (id ? s.getOpportunity(id) : undefined))
  const updateOpportunity = useOpportunityStore((s) => s.updateOpportunity)
  const deleteOpportunity = useOpportunityStore((s) => s.deleteOpportunity)
  const contacts = useOpportunityStore((s) => s.contacts)
  const linkContact = useOpportunityStore((s) => s.linkContactToOpportunity)
  const unlinkContact = useOpportunityStore((s) => s.unlinkContactFromOpportunity)
  const createContact = useOpportunityStore((s) => s.createContact)
  const updateContact = useOpportunityStore((s) => s.updateContact)
  const notes = useOpportunityStore((s) => s.notes)
  const addNote = useOpportunityStore((s) => s.addNote)
  const deleteNote = useOpportunityStore((s) => s.deleteNote)

  const [activeTab, setActiveTab] = useState<TabId>('contacts')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Opportunity | null>(opportunity ?? null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmDeleteNote, setConfirmDeleteNote] = useState<string | null>(null)
  const [pendingNav, setPendingNav] = useState<{ to: number | string } | null>(null)
  const [confirmNav, setConfirmNav] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [noteAuthor, setNoteAuthor] = useState(DEFAULT_AUTHOR)
  const [contactMode, setContactMode] = useState<'idle' | 'link' | 'create'>('idle')
  const [linkSearch, setLinkSearch] = useState('')
  const [newContact, setNewContact] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    role_tag: 'general',
    agency: '',
  })
  const [editingContactId, setEditingContactId] = useState<string | null>(null)
  const [contactDraft, setContactDraft] = useState<{ name: string; title: string; email: string; phone: string; role_tag: string }>({
    name: '',
    title: '',
    email: '',
    phone: '',
    role_tag: 'general',
  })

  const draftRef = useRef(draft)
  draftRef.current = draft

  // Sync draft when opportunity changes (and not editing)
  useEffect(() => {
    if (!editing && opportunity) setDraft(opportunity)
  }, [opportunity, editing])

  const isDirty = useMemo(() => {
    if (!editing || !opportunity || !draft) return false
    return JSON.stringify(opportunity) !== JSON.stringify(draft)
  }, [opportunity, draft, editing])

  // Warn on browser-level navigation when dirty
  useBeforeUnload(
    (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    },
    { capture: true },
  )

  const linkedContacts = useMemo(
    () => (id ? contacts.filter((c) => c.opportunity_ids.includes(id)) : []),
    [contacts, id],
  )

  const linkedContactIds = new Set(linkedContacts.map((c) => c.id))

  const oppNotes = useMemo(
    () =>
      id
        ? notes
            .filter((n) => n.opportunity_id === id)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        : [],
    [notes, id],
  )

  if (!opportunity || !draft) {
    return (
      <div style={{ padding: '40px', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--ink-muted)' }}>
        Opportunity not found.
      </div>
    )
  }

  const stats: StatItem[] = [
    { label: 'Est. Value', value: formatCurrency(opportunity.value) },
    { label: 'Score', value: opportunity.score.toUpperCase() },
    { label: 'NAICS', value: opportunity.naics_code ?? '—' },
    { label: 'Stage', value: opportunity.status.replace(/_/g, ' ').toUpperCase() },
    { label: 'Owner', value: opportunity.owner.toUpperCase() },
  ]

  const handleSave = () => {
    if (!draft) return
    const { id: _id, created_at: _c, updated_at: _u, ...updates } = draft
    void _id; void _c; void _u
    updateOpportunity(opportunity.id, updates)
    setEditing(false)
  }

  const handleCancelEdit = () => {
    setDraft(opportunity)
    setEditing(false)
  }

  const handleDelete = () => {
    deleteOpportunity(opportunity.id)
    setConfirmDelete(false)
    navigate('/showcase')
  }

  const guardedNavigate = (to: number | string) => {
    if (isDirty) {
      setPendingNav({ to })
      setConfirmNav(true)
    } else {
      if (typeof to === 'number') navigate(to)
      else navigate(to)
    }
  }

  const handleAddNote = () => {
    if (!noteText.trim()) return
    addNote(opportunity.id, noteAuthor.trim() || DEFAULT_AUTHOR, noteText.trim())
    setNoteText('')
  }

  const handleLinkContact = (contactId: string) => {
    linkContact(contactId, opportunity.id)
    setContactMode('idle')
    setLinkSearch('')
  }

  const handleCreateAndLink = () => {
    if (!newContact.name.trim()) return
    createContact({
      name: newContact.name.trim(),
      title: newContact.title.trim() || null,
      email: newContact.email.trim() || null,
      phone: newContact.phone.trim() || null,
      role_tag: newContact.role_tag,
      agency: newContact.agency.trim() || null,
      opportunity_ids: [opportunity.id],
    })
    setNewContact({ name: '', title: '', email: '', phone: '', role_tag: 'general', agency: '' })
    setContactMode('idle')
  }

  const startContactEdit = (c: typeof contacts[number]) => {
    setEditingContactId(c.id)
    setContactDraft({
      name: c.name,
      title: c.title ?? '',
      email: c.email ?? '',
      phone: c.phone ?? '',
      role_tag: c.role_tag,
    })
  }

  const saveContactEdit = () => {
    if (!editingContactId) return
    updateContact(editingContactId, {
      name: contactDraft.name.trim(),
      title: contactDraft.title.trim() || null,
      email: contactDraft.email.trim() || null,
      phone: contactDraft.phone.trim() || null,
      role_tag: contactDraft.role_tag,
    })
    setEditingContactId(null)
  }

  const linkCandidates = contacts
    .filter((c) => !linkedContactIds.has(c.id))
    .filter((c) => {
      if (!linkSearch.trim()) return true
      const q = linkSearch.trim().toLowerCase()
      return c.name.toLowerCase().includes(q) || (c.agency?.toLowerCase().includes(q) ?? false)
    })

  return (
    <div>
      {/* Top action bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '18px',
        }}
      >
        <button onClick={() => guardedNavigate(-1)} style={backBtn}>
          ← Back
        </button>
        <div style={{ display: 'flex', gap: '8px' }}>
          {!editing && (
            <>
              <button onClick={() => setEditing(true)} style={ghostBtn} aria-label="Edit">
                <PencilIcon /> Edit
              </button>
              <button onClick={() => setConfirmDelete(true)} style={dangerGhostBtn} aria-label="Delete">
                <TrashIcon /> Delete
              </button>
            </>
          )}
          {editing && (
            <>
              <button onClick={handleCancelEdit} style={ghostBtn}>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!isDirty}
                style={{
                  ...primaryBtn,
                  background: isDirty ? 'var(--accent-slate)' : 'var(--ink-ghost)',
                  cursor: isDirty ? 'pointer' : 'not-allowed',
                }}
              >
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hero card or edit form */}
      {editing ? (
        <div
          style={{
            background: 'var(--bg-warm)',
            border: '1px solid var(--border)',
            borderRadius: '3px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <div style={{ marginBottom: '12px' }}>
            <span style={editLabelStyle}>EDITING — unsaved changes will be lost on navigation</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Field label="Title">
              <input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                style={editInputStyle}
              />
            </Field>
            <Field label="Agency">
              <input
                value={draft.agency}
                onChange={(e) => setDraft({ ...draft, agency: e.target.value })}
                style={editInputStyle}
              />
            </Field>
            <Field label="Description">
              <textarea
                value={draft.description ?? ''}
                onChange={(e) => setDraft({ ...draft, description: e.target.value || null })}
                rows={4}
                style={{ ...editInputStyle, fontFamily: 'var(--font-body)', resize: 'vertical' }}
              />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <Field label="Status">
                <select
                  value={draft.status}
                  onChange={(e) => setDraft({ ...draft, status: e.target.value as OpportunityStatus })}
                  style={editInputStyle}
                >
                  {PIPELINE_STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tier">
                <select
                  value={draft.tier}
                  onChange={(e) => setDraft({ ...draft, tier: Number(e.target.value) as Tier })}
                  style={editInputStyle}
                >
                  <option value={1}>Tier 1</option>
                  <option value={2}>Tier 2</option>
                  <option value={3}>Tier 3</option>
                </select>
              </Field>
              <Field label="Score">
                <select
                  value={draft.score}
                  onChange={(e) => setDraft({ ...draft, score: e.target.value as Score })}
                  style={editInputStyle}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <Field label="Owner">
                <select
                  value={draft.owner}
                  onChange={(e) => setDraft({ ...draft, owner: e.target.value })}
                  style={editInputStyle}
                >
                  {OWNERS.map((o) => (
                    <option key={o} value={o}>
                      {o.charAt(0).toUpperCase() + o.slice(1)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Value ($)">
                <input
                  type="number"
                  value={draft.value ?? ''}
                  onChange={(e) =>
                    setDraft({ ...draft, value: e.target.value === '' ? null : parseFloat(e.target.value) })
                  }
                  style={{ ...editInputStyle, fontFamily: 'var(--font-mono)' }}
                />
              </Field>
              <Field label="Deadline">
                <input
                  type="date"
                  value={draft.deadline?.slice(0, 10) ?? ''}
                  onChange={(e) => setDraft({ ...draft, deadline: e.target.value || null })}
                  style={{ ...editInputStyle, fontFamily: 'var(--font-mono)' }}
                />
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="NAICS Code">
                <input
                  value={draft.naics_code ?? ''}
                  onChange={(e) => setDraft({ ...draft, naics_code: e.target.value || null })}
                  style={{ ...editInputStyle, fontFamily: 'var(--font-mono)' }}
                />
              </Field>
              <Field label="Set-aside">
                <input
                  value={draft.set_aside ?? ''}
                  onChange={(e) => setDraft({ ...draft, set_aside: e.target.value || null })}
                  style={editInputStyle}
                />
              </Field>
            </div>
          </div>
        </div>
      ) : (
        <HeroSplitCard opportunity={opportunity} onUploadPhoto={() => navigate('/processor')} />
      )}

      <StatsBar stats={stats} theme="cream" />

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--border)', marginTop: '32px', display: 'flex' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom:
                activeTab === tab.id ? '2px solid var(--ink-primary)' : '2px solid transparent',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? 'var(--ink-primary)' : 'var(--ink-muted)',
              letterSpacing: '0.02em',
              marginBottom: '-1px',
              transition: 'all 0.15s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {tab.label}
            {tab.id === 'contacts' && linkedContacts.length > 0 && (
              <CountChip n={linkedContacts.length} />
            )}
            {tab.id === 'notes' && oppNotes.length > 0 && <CountChip n={oppNotes.length} />}
          </button>
        ))}
      </div>

      <div style={{ padding: '24px 0' }}>
        {activeTab === 'contacts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <SectionLabel>Linked Contacts</SectionLabel>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => setContactMode('link')} style={miniBtn('secondary')}>
                  + Link Existing
                </button>
                <button onClick={() => setContactMode('create')} style={miniBtn('primary')}>
                  + Add New
                </button>
              </div>
            </div>

            {contactMode === 'link' && (
              <div style={inlineFormStyle}>
                <input
                  value={linkSearch}
                  onChange={(e) => setLinkSearch(e.target.value)}
                  placeholder="Search contacts to link…"
                  style={{ ...editInputStyle, marginBottom: '8px' }}
                  autoFocus
                />
                <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {linkCandidates.length === 0 ? (
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--ink-muted)' }}>
                      No matching contacts. Try "Add New" instead.
                    </p>
                  ) : (
                    linkCandidates.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleLinkContact(c.id)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 10px',
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border)',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontFamily: 'var(--font-body)',
                          fontSize: '13px',
                        }}
                      >
                        <div>
                          <strong style={{ color: 'var(--ink-primary)' }}>{c.name}</strong>
                          {c.title && (
                            <span style={{ color: 'var(--ink-muted)', marginLeft: '8px', fontSize: '12px' }}>
                              {c.title}
                            </span>
                          )}
                        </div>
                        <span style={{ color: 'var(--accent-slate)', fontSize: '12px' }}>+ Link</span>
                      </button>
                    ))
                  )}
                </div>
                <div style={{ marginTop: '8px', textAlign: 'right' }}>
                  <button onClick={() => { setContactMode('idle'); setLinkSearch('') }} style={miniBtn('secondary')}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {contactMode === 'create' && (
              <div style={inlineFormStyle}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <input value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} placeholder="Name *" style={editInputStyle} autoFocus />
                  <input value={newContact.title} onChange={(e) => setNewContact({ ...newContact, title: e.target.value })} placeholder="Title" style={editInputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <input value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} placeholder="Email" style={editInputStyle} />
                  <input value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} placeholder="Phone" style={editInputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <input value={newContact.agency} onChange={(e) => setNewContact({ ...newContact, agency: e.target.value })} placeholder="Org" style={editInputStyle} />
                  <select value={newContact.role_tag} onChange={(e) => setNewContact({ ...newContact, role_tag: e.target.value })} style={editInputStyle}>
                    {['sponsor', 'technical', 'contracting', 'finance', 'general'].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                  <button onClick={() => setContactMode('idle')} style={miniBtn('secondary')}>Cancel</button>
                  <button onClick={handleCreateAndLink} style={miniBtn('primary')}>Add & Link</button>
                </div>
              </div>
            )}

            {linkedContacts.length === 0 && contactMode === 'idle' && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-muted)' }}>
                No contacts linked yet. Add or link one.
              </p>
            )}

            {linkedContacts.map((c) => {
              const isEdit = editingContactId === c.id
              return (
                <div
                  key={c.id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: '3px',
                    padding: '12px 14px',
                    background: isEdit ? 'var(--bg-warm)' : 'var(--bg-primary)',
                  }}
                >
                  {isEdit ? (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                        <input value={contactDraft.name} onChange={(e) => setContactDraft({ ...contactDraft, name: e.target.value })} style={editInputStyle} />
                        <input value={contactDraft.title} onChange={(e) => setContactDraft({ ...contactDraft, title: e.target.value })} placeholder="Title" style={editInputStyle} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                        <input value={contactDraft.email} onChange={(e) => setContactDraft({ ...contactDraft, email: e.target.value })} placeholder="Email" style={editInputStyle} />
                        <input value={contactDraft.phone} onChange={(e) => setContactDraft({ ...contactDraft, phone: e.target.value })} placeholder="Phone" style={editInputStyle} />
                        <select value={contactDraft.role_tag} onChange={(e) => setContactDraft({ ...contactDraft, role_tag: e.target.value })} style={editInputStyle}>
                          {['sponsor', 'technical', 'contracting', 'finance', 'general'].map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button onClick={() => setEditingContactId(null)} style={miniBtn('secondary')}>Cancel</button>
                        <button onClick={saveContactEdit} style={miniBtn('primary')}>Save</button>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <strong style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--ink-primary)' }}>
                            {c.name}
                          </strong>
                          <span style={roleChipStyle}>{c.role_tag}</span>
                        </div>
                        {c.title && (
                          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--ink-tertiary)', marginBottom: '4px' }}>
                            {c.title}{c.agency ? ` · ${c.agency}` : ''}
                          </p>
                        )}
                        <div style={{ display: 'flex', gap: '14px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-muted)' }}>
                          {c.email && <span>{c.email}</span>}
                          {c.phone && <span>{c.phone}</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => startContactEdit(c)} style={miniBtn('secondary')}>Edit</button>
                        <button onClick={() => unlinkContact(c.id, opportunity.id)} style={{ ...miniBtn('secondary'), color: '#DC2626' }}>
                          Unlink
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'notes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={inlineFormStyle}>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note…"
                rows={3}
                style={{ ...editInputStyle, fontFamily: 'var(--font-body)', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <input
                  value={noteAuthor}
                  onChange={(e) => setNoteAuthor(e.target.value)}
                  placeholder="Author"
                  style={{ ...editInputStyle, width: '160px' }}
                />
                <button onClick={handleAddNote} disabled={!noteText.trim()} style={{ ...miniBtn('primary'), opacity: noteText.trim() ? 1 : 0.5, cursor: noteText.trim() ? 'pointer' : 'not-allowed' }}>
                  Post Note
                </button>
              </div>
            </div>

            {oppNotes.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-muted)' }}>
                No notes yet. Add the first one.
              </p>
            ) : (
              oppNotes.map((n) => (
                <div
                  key={n.id}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px 14px',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '3px',
                    background: 'var(--bg-primary)',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--bg-cream)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--ink-tertiary)',
                      flexShrink: 0,
                    }}
                  >
                    {initials(n.author)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <strong style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-primary)' }}>
                          {n.author}
                        </strong>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-muted)' }}>
                          {relativeTime(n.created_at)}
                        </span>
                      </div>
                      <button
                        onClick={() => setConfirmDeleteNote(n.id)}
                        aria-label="Delete note"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-body)',
                          fontSize: '11px',
                          color: 'var(--ink-muted)',
                          padding: '0 4px',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--ink-secondary)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                      {n.text}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--ink-muted)' }}>
            Documents available once API is connected.
          </p>
        )}

        {activeTab === 'actions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => updateOpportunity(opportunity.id, { status: 'contact' })}
              style={{ ...primaryBtn, alignSelf: 'flex-start' }}
            >
              Mark Pursuing (→ Contact)
            </button>
            <button
              onClick={() => updateOpportunity(opportunity.id, { status: 'won' })}
              style={{ ...primaryBtn, background: '#059669', alignSelf: 'flex-start' }}
            >
              Mark Won
            </button>
            <button
              onClick={() => updateOpportunity(opportunity.id, { status: 'lost' })}
              style={{ ...primaryBtn, background: '#DC2626', alignSelf: 'flex-start' }}
            >
              Mark Lost
            </button>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <TimelineItem label="Created" date={opportunity.created_at} />
            <TimelineItem label="Last updated" date={opportunity.updated_at} />
            <TimelineItem label="Posted" date={opportunity.posted_date} />
            {opportunity.deadline && <TimelineItem label="Deadline" date={opportunity.deadline} />}
          </div>
        )}

        {activeTab === '3d-preview' && (
          <div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'var(--ink-muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase' as const,
                marginBottom: '12px',
              }}
            >
              Procedural building model — NAICS {opportunity.naics_code ?? 'N/A'} · Drag to orbit
            </div>
            <div style={{ height: '480px', border: '1px solid var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
              <BuildingModel3D naicsCode={opportunity.naics_code} style={{ height: '100%' }} />
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this opportunity?"
        message={`"${opportunity.title}" will be permanently removed along with its notes.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <ConfirmDialog
        open={confirmDeleteNote !== null}
        title="Delete note?"
        message="This note will be permanently removed."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (confirmDeleteNote) deleteNote(confirmDeleteNote)
          setConfirmDeleteNote(null)
        }}
        onCancel={() => setConfirmDeleteNote(null)}
      />

      <ConfirmDialog
        open={confirmNav}
        title="Discard unsaved changes?"
        message="Your edits to this opportunity have not been saved."
        confirmLabel="Discard"
        danger
        onConfirm={() => {
          setConfirmNav(false)
          setEditing(false)
          setDraft(opportunity)
          if (pendingNav) {
            if (typeof pendingNav.to === 'number') navigate(pendingNav.to)
            else navigate(pendingNav.to)
            setPendingNav(null)
          }
        }}
        onCancel={() => {
          setConfirmNav(false)
          setPendingNav(null)
        }}
      />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={editLabelStyle}>{label}</label>
      <div style={{ marginTop: '4px' }}>{children}</div>
    </div>
  )
}

function CountChip({ n }: { n: number }) {
  return (
    <span
      style={{
        background: 'var(--bg-cream)',
        border: '1px solid var(--border)',
        borderRadius: '3px',
        padding: '0 5px',
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        color: 'var(--ink-tertiary)',
      }}
    >
      {n}
    </span>
  )
}

function TimelineItem({ label, date }: { label: string; date: string }) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'baseline', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--ink-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', minWidth: '120px' }}>
        {label}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--ink-primary)' }}>
        {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
      </span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--ink-muted)' }}>
        ({relativeTime(date)})
      </span>
    </div>
  )
}

function PencilIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
      <path d="M9.5 1.5l1 1L4 9 2 9.5 2.5 7.5z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
      <path d="M2 3.5h8M4.5 3v-1h3v1M3 3.5l.5 7h5L9 3.5" />
    </svg>
  )
}

const titleSize = 'inherit'
void titleSize

const backBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--ink-muted)',
  padding: 0,
  letterSpacing: '0.02em',
} as const

const ghostBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
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
} as const

const dangerGhostBtn = {
  ...ghostBtn,
  color: '#DC2626',
  borderColor: '#FCA5A5',
} as const

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
} as const

function miniBtn(variant: 'primary' | 'secondary'): React.CSSProperties {
  return {
    padding: '5px 10px',
    background: variant === 'primary' ? 'var(--accent-slate)' : 'var(--bg-primary)',
    color: variant === 'primary' ? '#fff' : 'var(--ink-secondary)',
    border: variant === 'primary' ? 'none' : '1px solid var(--border)',
    borderRadius: '3px',
    fontFamily: 'var(--font-body)',
    fontSize: '11px',
    fontWeight: 500,
    cursor: 'pointer',
    letterSpacing: '0.02em',
  }
}

const editLabelStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: '11px',
  fontWeight: 500,
  color: 'var(--ink-tertiary)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
}

const editInputStyle = {
  width: '100%',
  padding: '7px 10px',
  border: '1px solid var(--border)',
  borderRadius: '3px',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--ink-primary)',
  background: 'var(--bg-primary)',
  outline: 'none',
}

const inlineFormStyle = {
  border: '1px dashed var(--border)',
  borderRadius: '3px',
  padding: '12px',
  background: 'var(--bg-cream)',
}

const roleChipStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: '10px',
  fontWeight: 500,
  color: 'var(--ink-tertiary)',
  border: '1px solid var(--border)',
  borderRadius: '3px',
  padding: '1px 6px',
  textTransform: 'capitalize' as const,
  letterSpacing: '0.04em',
}
