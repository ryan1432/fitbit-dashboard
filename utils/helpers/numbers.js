export function roundOff (num) {
  if (Number.isNaN(num)) return '0.00'
  return (Math.round(num * 100) / 100).toFixed(2)
}
