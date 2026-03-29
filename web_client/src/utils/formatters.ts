export function formatDate(dateStr: string, opts?: Intl.DateTimeFormatOptions): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', opts ?? { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatCalories(cal: number): string {
  return `${Math.round(cal)} kcal`
}

export function formatGrams(g: number): string {
  return `${Math.round(g)}g`
}

export function formatWeight(kg: number): string {
  return `${kg.toFixed(1)} kg`
}

export function formatWater(ml: number): string {
  return ml >= 1000 ? `${(ml / 1000).toFixed(1)}L` : `${ml}ml`
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}
