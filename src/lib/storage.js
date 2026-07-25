// Facade data publik. Komponen UI tidak boleh mengimpor modul storage internal.

export {
  getTheme,
  setTheme,
  getGoal,
  setGoal,
  getGoalDeadline,
  setGoalDeadline,
  getDismissedVersion,
  setDismissedVersion,
  getBudget,
  setBudget,
  getDismissedSwipeHint,
  setDismissedSwipeHint,
} from './storage/settingsStore'

export {
  getCustomCategories,
  addCustomCategory,
  removeCustomCategory,
} from './storage/categoryStore'

export {
  getTransactions,
  addTransaction,
  updateTransaction,
  removeTransaction,
  importTransactions,
} from './storage/transactionStore'

export {
  getRecurringPatterns,
  addRecurringPattern,
  updateRecurringPattern,
  setRecurringActive,
  removeRecurringPattern,
  generateRecurringTransactions,
} from './storage/recurringStore'
