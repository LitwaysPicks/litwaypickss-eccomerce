// Liberian Dollar currency formatter
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-LR', {
    style: 'currency',
    currency: 'LRD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Format currency without symbol
export const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-LR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Parse currency string to number
export const parseCurrency = (currencyString) => {
  return parseFloat(currencyString.replace(/[^0-9.-]+/g, ''))
}

// Currency symbol
export const CURRENCY_SYMBOL = 'LRD'
export const CURRENCY_CODE = 'LRD'