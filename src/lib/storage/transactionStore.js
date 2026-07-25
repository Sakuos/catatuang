import { makeId, readArray, saveArray, STORAGE_KEYS } from './shared'

export function getTransactions() {
  return readArray(STORAGE_KEYS.transactions)
}

export function saveTransactions(transactions) {
  saveArray(STORAGE_KEYS.transactions, transactions)
}

export function addTransaction(input) {
  const transactions = getTransactions()
  const transaction = {
    id: makeId(),
    type: input.type,
    amount: Number(input.amount),
    category: input.category,
    note: input.note || '',
    date: input.date,
  }
  transactions.push(transaction)
  saveTransactions(transactions)
  return transaction
}

export function updateTransaction(id, changes) {
  const transactions = getTransactions()
  const index = transactions.findIndex((transaction) => transaction.id === id)
  if (index === -1) return null
  transactions[index] = {
    ...transactions[index],
    ...changes,
    amount: changes.amount !== undefined ? Number(changes.amount) : transactions[index].amount,
  }
  saveTransactions(transactions)
  return transactions[index]
}

export function removeTransaction(id) {
  saveTransactions(getTransactions().filter((transaction) => transaction.id !== id))
}

export function importTransactions(list) {
  const transactions = getTransactions()
  const makeKey = (transaction) =>
    `${transaction.date}|${transaction.type}|${transaction.amount}|${transaction.category}|${transaction.note || ''}`
  const existingKeys = new Set(transactions.map(makeKey))

  let added = 0
  for (const input of list) {
    const transaction = {
      id: makeId(),
      type: input.type,
      amount: Number(input.amount),
      category: input.category,
      note: input.note || '',
      date: input.date,
    }
    if (existingKeys.has(makeKey(transaction))) continue
    existingKeys.add(makeKey(transaction))
    transactions.push(transaction)
    added++
  }
  saveTransactions(transactions)
  return added
}
