export const getRemainingTrialDays = (trialEnd: string | null): number => {
  if (!trialEnd) {
    return 0
  }
  const now = new Date()
  const trialEndDate = new Date(trialEnd)
  return Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 3600 * 24)))
}
