import { HASH_ENABLED_MODAL_IDS } from './modal-ids.ts'

type HashEnabledModalId = (typeof HASH_ENABLED_MODAL_IDS)[number]

export const isHashEnabledModalId = (id: string): id is HashEnabledModalId =>
  HASH_ENABLED_MODAL_IDS.includes(id as HashEnabledModalId)
