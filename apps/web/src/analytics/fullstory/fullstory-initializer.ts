import { FullStory, init } from '@fullstory/browser'
import { getConfig } from '../../config/environment-config.ts'

export const initializeFullstory = (userId: string) => {
  if (getConfig().fullstoryOrganizationId) {
    init({ orgId: getConfig().fullstoryOrganizationId })
    FullStory('setIdentity', {
      consent: true,
      uid: userId,
      properties: {
        displayName: `${userId}`,
      },
    })
  }
}
