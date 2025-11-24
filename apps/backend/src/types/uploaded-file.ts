/**
 * Represents an uploaded file in a simplified format.
 * This replaces Express.Multer.File to avoid the multer dependency.
 */
export interface UploadedFile {
  buffer: Buffer
  mimetype?: string
  originalname?: string
}

type Base64FilePayload = {
  base64: string
  mimeType?: string
  name?: string
}

const isBase64FilePayload = (candidate: unknown): candidate is Base64FilePayload =>
  typeof candidate === 'object' &&
  candidate !== null &&
  'base64' in candidate &&
  typeof (candidate as Record<string, unknown>).base64 === 'string'

/**
 * Converts a Web API File object to UploadedFile format.
 * Used when handling file uploads via oRPC.
 */
export const fileToUploadedFile = async (file: File | Base64FilePayload): Promise<UploadedFile> => {
  if (isBase64FilePayload(file)) {
    return {
      buffer: Buffer.from(file.base64, 'base64'),
      mimetype: file.mimeType ?? 'application/octet-stream',
      originalname: file.name ?? 'upload',
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  return {
    buffer,
    mimetype: file.type || 'application/octet-stream',
    originalname: file.name || 'upload',
  }
}
