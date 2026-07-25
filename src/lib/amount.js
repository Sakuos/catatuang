export function parseAmount(value) {
  return Number(String(value).replace(/\D/g, ''))
}

export function formatAmountInput(value) {
  const digits = String(value).replace(/\D/g, '')
  return digits ? Number(digits).toLocaleString('id-ID') : ''
}
