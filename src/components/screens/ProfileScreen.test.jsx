import { afterEach, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import ProfileScreen from './ProfileScreen'
import pkg from '../../../package.json'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const preferences = {
  theme: 'dark',
  toggleTheme: vi.fn(),
}

const ledger = {
  transactions: [
    { id: '1', type: 'income', amount: 5000000, category: 'gaji', note: '', date: '2026-07-23' },
    { id: '2', type: 'expense', amount: 25000, category: 'makan', note: '', date: '2026-07-24' },
  ],
  recurringPatterns: [{ id: 'p1' }, { id: 'p2' }],
  customCategories: [],
}

function baseProps(overrides = {}) {
  return {
    preferences,
    ledger,
    update: null,
    dismissUpdate: vi.fn(),
    onImportFile: vi.fn(),
    onAddRecurring: vi.fn(),
    onEditRecurring: vi.fn(),
    onGoToTransactions: vi.fn(),
    ...overrides,
  }
}

function render(ui) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => root.render(ui))
  return {
    container,
    cleanup: () => {
      act(() => root.unmount())
      container.remove()
    },
  }
}

afterEach(() => {
  document.body.innerHTML = ''
})

it('renders profile card with avatar, name, and description', () => {
  const { container, cleanup } = render(<ProfileScreen {...baseProps()} />)
  const card = container.querySelector('.profile-card')
  expect(card).not.toBeNull()
  expect(card.querySelector('.avatar')).not.toBeNull()
  expect(card.querySelector('h2').textContent).toBeTruthy()
  expect(card.querySelector('p').textContent).toContain('tercatat')
  cleanup()
})

it('aliases existing theme toggle to Tampilan button', () => {
  const { container, cleanup } = render(<ProfileScreen {...baseProps()} />)
  const buttons = [...container.querySelectorAll('.settings-group button')]
  const tampilkan = buttons.find((b) => b.textContent.includes('Tampilan'))
  expect(tampilkan).not.toBeUndefined()
  act(() => tampilkan.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  expect(preferences.toggleTheme).toHaveBeenCalledTimes(1)
  cleanup()
})

it('mata uang button is present and read-only (no crash on click)', () => {
  const { container, cleanup } = render(<ProfileScreen {...baseProps()} />)
  const buttons = [...container.querySelectorAll('.settings-group button')]
  const mataUang = buttons.find((b) => b.textContent.includes('Mata uang'))
  expect(mataUang).not.toBeUndefined()
  // Tidak ada akun auth; klik tidak boleh memicu destructif apa pun.
  act(() => mataUang.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  expect(() => mataUang.dispatchEvent(new MouseEvent('click', { bubbles: true }))).not.toThrow()
  cleanup()
})

it('kategori button routes to transactions screen', () => {
  const onGoToTransactions = vi.fn()
  const { container, cleanup } = render(<ProfileScreen {...baseProps({ onGoToTransactions })} />)
  const buttons = [...container.querySelectorAll('.settings-group button')]
  const kategori = buttons.find((b) => b.textContent.includes('Kategori'))
  act(() => kategori.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  expect(onGoToTransactions).toHaveBeenCalledTimes(1)
  cleanup()
})

it('backup & pulihkan triggers onImportFile (file picker intact)', () => {
  const onImportFile = vi.fn()
  const { container, cleanup } = render(<ProfileScreen {...baseProps({ onImportFile })} />)
  const buttons = [...container.querySelectorAll('.settings-group button')]
  const backup = buttons.find((b) => b.textContent.includes('Backup'))
  act(() => backup.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  expect(onImportFile).toHaveBeenCalledTimes(1)
  cleanup()
})

it('import & export menu is grouped with backup (same Data group)', () => {
  const { container, cleanup } = render(<ProfileScreen {...baseProps()} />)
  const groups = [...container.querySelectorAll('.settings-group')]
  const dataGroup = groups.find((g) => g.querySelector('h3')?.textContent === 'Data')
  expect(dataGroup).not.toBeUndefined()
  const titlesWithin = [...dataGroup.querySelectorAll('button b')].map((b) => b.textContent)
  expect(titlesWithin).toContain('Backup & Pulihkan')
  expect(titlesWithin).toContain('Import & Export')
  cleanup()
})

it('import & export invokes exportCSV when clicked', async () => {
  vi.resetModules()
  const exportSpy = vi.fn()
  vi.doMock('../../lib/export', () => ({ exportCSV: exportSpy }))
  // Re-require after mocking so the component picks up the mock.
  const ProfileScreenMocked = (await import('./ProfileScreen')).default
  const { container, cleanup } = render(<ProfileScreenMocked {...baseProps()} />)
  const buttons = [...container.querySelectorAll('.settings-group button')]
  const exportBtn = buttons.find((b) => b.textContent.includes('Import & Export'))
  act(() => exportBtn.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  expect(exportSpy).toHaveBeenCalledTimes(1)
  cleanup()
  vi.doUnmock('../../lib/export')
})

it('about group shows version from package.json metadata', () => {
  const { container, cleanup } = render(<ProfileScreen {...baseProps()} />)
  const groups = [...container.querySelectorAll('.settings-group')]
  const aboutGroup = groups.find((g) => g.querySelector('h3')?.textContent === 'Tentang')
  expect(aboutGroup).not.toBeUndefined()
  const versionLabel = aboutGroup.querySelector('small').textContent
  expect(versionLabel).toContain(pkg.version)
  // Bukan literal hardcoded.
  expect(versionLabel).not.toBe('Versi 1.0.0 · offline')
  cleanup()
})

it('keyboard accessible: tabbable buttons are real <button> elements', () => {
  const { container, cleanup } = render(<ProfileScreen {...baseProps()} />)
  const buttons = container.querySelectorAll('.settings-group button')
  expect(buttons.length).toBeGreaterThan(0)
  buttons.forEach((b) => {
    expect(b.tagName.toLowerCase()).toBe('button')
    expect(b.getAttribute('type')).toBe('button')
  })
  cleanup()
})

it('does not render any logout action (offline-first, no account)', () => {
  const { container, cleanup } = render(<ProfileScreen {...baseProps()} />)
  const text = container.textContent.toLowerCase()
  expect(text).not.toContain('logout')
  expect(text).not.toContain('keluar')
  expect(text).not.toContain('sign out')
  cleanup()
})
