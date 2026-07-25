import {
  buatIdKategori,
  kategoriPresetUntuk,
  kunciLabelKategori,
  normalisasiLabelKategori,
} from '../categories'
import { readArray, saveArray, STORAGE_KEYS } from './shared'

export function getCustomCategories() {
  return readArray(STORAGE_KEYS.customCategories).filter(
    (category) =>
      category && category.id && (category.type === 'income' || category.type === 'expense')
  )
}

export function addCustomCategory(type, label, emoji = '📦') {
  if (type !== 'income' && type !== 'expense') throw new Error('Jenis kategori tidak valid.')
  const name = normalisasiLabelKategori(label)
  if (!name) throw new Error('Nama kategori wajib diisi.')
  if (name.length > 30) throw new Error('Nama kategori maksimal 30 karakter.')

  const labelKey = kunciLabelKategori(name)
  if (
    kategoriPresetUntuk(type).some((category) => kunciLabelKategori(category.label) === labelKey)
  ) {
    throw new Error('Kategori itu sudah tersedia.')
  }

  const categories = getCustomCategories()
  const existing = categories.find(
    (category) => category.type === type && kunciLabelKategori(category.label) === labelKey
  )
  if (existing) {
    if (existing.active !== false) throw new Error('Kategori itu sudah tersedia.')
    existing.active = true
    existing.label = name
    existing.emoji = String(emoji || '📦').trim() || '📦'
    saveArray(STORAGE_KEYS.customCategories, categories)
    return existing
  }

  let id = buatIdKategori(name, type)
  if (categories.some((category) => category.id === id)) id = `${id}-${Date.now()}`
  const category = {
    id,
    type,
    label: name,
    emoji: String(emoji || '📦').trim() || '📦',
    active: true,
  }
  categories.push(category)
  saveArray(STORAGE_KEYS.customCategories, categories)
  return category
}

export function removeCustomCategory(id) {
  const categories = getCustomCategories()
  const category = categories.find((item) => item.id === id)
  if (!category) return false
  category.active = false
  saveArray(STORAGE_KEYS.customCategories, categories)
  return true
}
