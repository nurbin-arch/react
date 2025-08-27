import { format } from 'date-fns'

export function formatDate(iso) {
  if (!iso) return ''
  try {
    return format(new Date(iso), 'yyyy-MM-dd')
  } catch {
    return ''
  }
}


