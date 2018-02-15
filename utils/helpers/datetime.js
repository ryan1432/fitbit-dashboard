export function humanReadablePace (time) {
  if (Number.isNaN(time)) return '00:00'
  const hours = Math.floor(time / 3600)
  let minutes = Math.floor(time / 60)
  let seconds = Math.floor(time - minutes * 60)
  if (minutes < 10 && hours) minutes = `0${minutes}`
  if (seconds < 10) seconds = `0${seconds}`
  return `${hours ? `${hours}:` : ''}${minutes}:${seconds}`
}
