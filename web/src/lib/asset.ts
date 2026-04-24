export function asset(path: string) {
  const base = import.meta.env.BASE_URL || '/'
  const p = path.startsWith('/') ? path.slice(1) : path
  return `${base}${p}`
}

