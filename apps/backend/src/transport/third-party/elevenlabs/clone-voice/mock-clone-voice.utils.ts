// this returns useful ids for mocking/tests,
// elevenlabs ids look like a4RzqРУpiiRqXvyMe3jh
export const convertUuidToElevenlabsVoiceId = (uuid: string): string => {
  // Remove hyphens and validate UUID format
  const cleanUuid = uuid.replace(/-/g, '')
  if (!/^[0-9a-f]{32}$/i.test(cleanUuid)) {
    throw new Error('Invalid UUID format')
  }

  // Convert hex string to byte array
  const bytes = new Uint8Array(16)
  for (let i = 0; i < 32; i += 2) {
    bytes[i / 2] = parseInt(cleanUuid.substr(i, 2), 16)
  }

  // Convert to base64
  const base64 = btoa(String.fromCharCode.apply(null, Array.from(bytes)))

  // Make URL safe by replacing '+' with '-' and '/' with '_'
  // Remove padding '=' characters
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}
