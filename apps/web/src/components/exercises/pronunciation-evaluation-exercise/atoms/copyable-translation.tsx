import { toast } from 'sonner'
import { useLingui } from '@lingui/react/macro'

export const CopyableTranslation = ({ translation }: { translation: string | undefined }) => {
  const { t } = useLingui()

  return (
    <div className='flex w-full justify-center text-center'>
      {translation ? (
        <span
          className='cursor-pointer'
          onClick={() => {
            navigator.clipboard.writeText(translation).then(() => {
              const translationText = translation
              toast.info(t`"${translationText}" copied to clipboard`)
            })
          }}
        >
          {translation}
        </span>
      ) : (
        t`Loading...`
      )}
    </div>
  )
}
