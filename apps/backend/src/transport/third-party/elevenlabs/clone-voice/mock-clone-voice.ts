import { v4 as uuidv4 } from 'uuid'
import { convertUuidToElevenlabsVoiceId } from './mock-clone-voice.utils'
import { UploadedFile } from '../../../../types/uploaded-file'
import type { CloneVoiceResult } from './clone-voice'

export const mockCloneVoice = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  audioFile: UploadedFile,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userId: string
): Promise<CloneVoiceResult> => {
  return {
    status: 'success',
    voice: {
      voice_id: convertUuidToElevenlabsVoiceId(uuidv4()),
    },
  }
}
