import { Skeleton } from '../../../shadcn/skeleton.tsx'
import { DialogContent, DialogDescription, DialogTitle } from '../../../shadcn/dialog.tsx'
import { useLingui } from '@lingui/react/macro'

type Props = {
  expectedText: string
  translatedText: string
  isFetchingExerciseText: boolean
  isFetchingTextTranslation: boolean
}

export const TranslateTextModalContentCommon = ({
  expectedText,
  translatedText,
  isFetchingExerciseText,
  isFetchingTextTranslation,
}: Props) => {
  const { t } = useLingui()

  return (
    <DialogContent className='w-11/12 rounded-xl bg-white p-8 sm:max-w-md'>
      <DialogTitle className='hidden'></DialogTitle>
      <DialogDescription className='hidden'></DialogDescription>
      <div>
        <div className='mb-2 text-lg font-semibold leading-none tracking-tight text-gray-700'>{t`Original Text`}</div>
        {isFetchingExerciseText || !expectedText ? (
          <div className='flex flex-col gap-y-2'>
            <Skeleton className='h-4 w-full md:max-w-4xl' />
            <Skeleton className='h-4 w-full md:max-w-4xl' />
          </div>
        ) : (
          <span className='tracking-tight'>{expectedText}</span>
        )}
      </div>
      <div>
        <div className='mb-2 text-lg font-semibold leading-none tracking-tight text-gray-700'>{t`Translation`}</div>
        {isFetchingTextTranslation || !translatedText ? (
          <div className='flex flex-col gap-y-2'>
            <Skeleton className='h-4 w-full md:max-w-4xl' />
            <Skeleton className='h-4 w-full md:max-w-4xl' />
          </div>
        ) : (
          <span className='tracking-tight'>{translatedText}</span>
        )}
      </div>
    </DialogContent>
  )
}
