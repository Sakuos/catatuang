import { useEffect, useState } from 'react'
import {
  addCustomCategory,
  addRecurringPattern,
  addTransaction,
  generateRecurringTransactions,
  getCustomCategories,
  getRecurringPatterns,
  getTransactions,
  importTransactions,
  removeCustomCategory,
  removeRecurringPattern,
  removeTransaction,
  setRecurringActive,
  updateRecurringPattern,
  updateTransaction,
} from '../lib/storage'

export function useLedger() {
  const [transactions, setTransactions] = useState(() => getTransactions())
  const [customCategories, setCustomCategories] = useState(() => getCustomCategories())
  const [recurringPatterns, setRecurringPatterns] = useState(() => getRecurringPatterns())

  function refresh() {
    setTransactions(getTransactions())
    setCustomCategories(getCustomCategories())
    setRecurringPatterns(getRecurringPatterns())
  }

  useEffect(() => {
    generateRecurringTransactions()
    refresh()

    function handleVisibility() {
      if (!document.hidden) {
        generateRecurringTransactions()
        refresh()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  function saveTransaction(transaction, data) {
    if (transaction) updateTransaction(transaction.id, data)
    else addTransaction(data)
    refresh()
  }

  function deleteTransaction(id) {
    removeTransaction(id)
    refresh()
  }

  function addCategory(type, label, emoji) {
    const category = addCustomCategory(type, label, emoji)
    setCustomCategories(getCustomCategories())
    return category
  }

  function deleteCategory(id) {
    removeCustomCategory(id)
    setCustomCategories(getCustomCategories())
  }

  function saveRecurring(pattern, data) {
    if (pattern) updateRecurringPattern(pattern.id, data)
    else addRecurringPattern(data)
    generateRecurringTransactions()
    refresh()
  }

  function toggleRecurring(pattern) {
    setRecurringActive(pattern.id, !pattern.active)
    if (!pattern.active) generateRecurringTransactions()
    refresh()
  }

  function deleteRecurring(id) {
    removeRecurringPattern(id)
    refresh()
  }

  function importList(list) {
    const added = importTransactions(list)
    refresh()
    return added
  }

  return {
    transactions,
    customCategories,
    recurringPatterns,
    saveTransaction,
    deleteTransaction,
    addCategory,
    deleteCategory,
    saveRecurring,
    toggleRecurring,
    deleteRecurring,
    importList,
  }
}
