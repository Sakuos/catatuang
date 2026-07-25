export const STORAGE_KEYS = {
  transactions: 'catatuang.transactions',
  budget: 'catatuang.budget',
  dismissedUpdate: 'catatuang.dismissedUpdate',
  theme: 'catatuang.theme',
  goal: 'catatuang.goal',
  goalDeadline: 'catatuang.goalDeadline',
  customCategories: 'catatuang.customCategories',
  recurringPatterns: 'catatuang.recurringPatterns',
  dismissedSwipeHint: 'catatuang.dismissedSwipeHint',
}

export function readArray(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(data) ? data : []
  } catch (err) {
    console.error(`Gagal membaca ${key}:`, err)
    return []
  }
}

export function saveArray(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

export function makeId(prefix = '') {
  return `${prefix}${Date.now()}-${Math.floor(Math.random() * 100000)}`
}
