import { useEffect, useState } from 'react'
import {
  getBudget,
  getDismissedSwipeHint,
  getGoal,
  getGoalDeadline,
  getTheme,
  setBudget,
  setDismissedSwipeHint,
  setGoal,
  setGoalDeadline,
  setTheme,
} from '../lib/storage'

export function usePreferences() {
  const [budget, setBudgetState] = useState(() => getBudget())
  const [goal, setGoalState] = useState(() => getGoal())
  const [goalDeadline, setGoalDeadlineState] = useState(() => getGoalDeadline())
  const [theme, setThemeState] = useState(() => getTheme())
  const [swipeHintDismissed, setSwipeHintDismissedState] = useState(() => getDismissedSwipeHint())

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  function saveBudget(value) {
    setBudget(value)
    setBudgetState(value)
  }

  function saveGoal(amount, deadline = '') {
    setGoal(amount)
    setGoalState(amount)
    setGoalDeadline(deadline)
    setGoalDeadlineState(deadline)
  }

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    setThemeState(nextTheme)
  }

  // Sembunyikan hint geser kartu permanen (tampil sekali lalu diingat).
  function dismissSwipeHint() {
    setDismissedSwipeHint()
    setSwipeHintDismissedState(true)
  }

  return {
    budget,
    goal,
    goalDeadline,
    theme,
    saveBudget,
    saveGoal,
    toggleTheme,
    swipeHintDismissed,
    dismissSwipeHint,
  }
}
