export const generateQueryString = <T extends Record<string, string | number | undefined>>(params: T): string => {
  const queryParams = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')

  return queryParams
}
