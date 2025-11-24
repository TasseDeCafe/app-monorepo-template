import { msg } from '@lingui/core/macro'
import type { MessageDescriptor } from '@lingui/core'
import { PersonalityCode } from '@template-app/api-client/orpc-contracts/messages-contract'

export const personalityMessages: Record<PersonalityCode, MessageDescriptor> = {
  [PersonalityCode.FRIENDLY]: msg`Friendly`,
  [PersonalityCode.PROFESSIONAL]: msg`Professional`,
  [PersonalityCode.HUMOROUS]: msg`Humorous`,
  [PersonalityCode.STRICT]: msg`Strict`,
  [PersonalityCode.ENCOURAGING]: msg`Encouraging`,
  [PersonalityCode.MISCHIEVOUS]: msg`Mischievous`,
  [PersonalityCode.JOKER]: msg`Joker`,
  [PersonalityCode.ANGRY]: msg`Angry`,
  [PersonalityCode.SAD]: msg`Sad`,
  [PersonalityCode.CUTE]: msg`Cute`,
  [PersonalityCode.INTROVERT]: msg`Introvert`,
  [PersonalityCode.CRAZY]: msg`Crazy`,
}
