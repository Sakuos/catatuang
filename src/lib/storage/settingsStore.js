import { STORAGE_KEYS } from './shared'

export function getTheme() {
  return localStorage.getItem(STORAGE_KEYS.theme) === 'dark' ? 'dark' : 'light'
}

export function setTheme(theme) {
  localStorage.setItem(STORAGE_KEYS.theme, theme === 'dark' ? 'dark' : 'light')
}

export function getGoal() {
  const amount = Number(localStorage.getItem(STORAGE_KEYS.goal))
  return amount > 0 ? amount : 0
}

export function setGoal(amount) {
  localStorage.setItem(STORAGE_KEYS.goal, String(Number(amount) || 0))
}

export function getGoalDeadline() {
  const raw = localStorage.getItem(STORAGE_KEYS.goalDeadline) || ''
  return /^\d{4}-\d{2}$/.test(raw) ? raw : ''
}

export function setGoalDeadline(yearMonth) {
  const raw = String(yearMonth || '').trim()
  localStorage.setItem(STORAGE_KEYS.goalDeadline, /^\d{4}-\d{2}$/.test(raw) ? raw : '')
}

export function getDismissedVersion() {
  return localStorage.getItem(STORAGE_KEYS.dismissedUpdate) || ''
}

export function setDismissedVersion(version) {
  localStorage.setItem(STORAGE_KEYS.dismissedUpdate, String(version || ''))
}

export function getBudget() {
  const amount = Number(localStorage.getItem(STORAGE_KEYS.budget))
  return amount > 0 ? amount : 0
}

export function setBudget(amount) {
  localStorage.setItem(STORAGE_KEYS.budget, String(Number(amount) || 0))
}

// Hint geser kartu di layar Transaksi: tampilkan sekali, lalu sembunyikan.
export function getDismissedSwipeHint() {
  return localStorage.getItem(STORAGE_KEYS.dismissedSwipeHint) === '1'
}

export function setDismissedSwipeHint() {
  localStorage.setItem(STORAGE_KEYS.dismissedSwipeHint, '1')
}
