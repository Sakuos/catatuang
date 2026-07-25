import { useState } from 'react'

export function useAmountEditor(value, onSave) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ? String(value) : '')

  function startEditing() {
    setDraft(value ? String(value) : '')
    setEditing(true)
  }

  function save() {
    onSave(Number(draft) || 0)
    setEditing(false)
  }

  return { editing, setEditing, draft, setDraft, startEditing, save }
}
