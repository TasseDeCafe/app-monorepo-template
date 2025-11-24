export const __getDayNDaysAgo = (n: number): Date => {
  const today = new Date()
  return new Date(today.getTime() - n * 24 * 60 * 60 * 1000)
}

export const __getDateOnlyString = (date: Date): string => {
  return date.toISOString().split('T')[0]
}
