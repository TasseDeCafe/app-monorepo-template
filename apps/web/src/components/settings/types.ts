import { LangCode } from '@template-app/core/constants/lang-codes'

export type SettingsFormProps = {
  onSubmit: (data: { studyLanguage: LangCode; motherLanguage: LangCode }) => void
}
