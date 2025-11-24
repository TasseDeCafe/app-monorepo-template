import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../shadcn/button.tsx'
import { useLingui } from '@lingui/react/macro'

type IpaConverterResultProps = {
  isLoading: boolean
  outputIpa: string
}

export const IpaConverterResult = ({ isLoading, outputIpa }: IpaConverterResultProps) => {
  const { t } = useLingui()

  const handleCopyIpa = async () => {
    if (!outputIpa) {
      toast.error(t`No IPA transcription to copy`)
      return
    }

    try {
      await navigator.clipboard.writeText(outputIpa)
      toast.success(t`IPA transcription copied to clipboard`)
    } catch {
      toast.error(t`Failed to copy to clipboard`)
    }
  }

  return (
    <div className='flex w-full flex-col gap-y-1 md:gap-y-2'>
      <div className='flex items-center justify-between'>
        <label className='block text-sm font-medium text-gray-700'>{t`IPA Transcription`}</label>
      </div>
      <div className='min-h-32 rounded-lg border border-gray-300 bg-gray-50 p-3 md:min-h-52'>
        {outputIpa ? (
          <div className='font-mono text-lg leading-relaxed text-gray-900'>{outputIpa}</div>
        ) : (
          <div className='flex h-full items-center justify-center text-gray-400'>
            {isLoading ? (
              <div className='flex items-center gap-2'>
                <div className='h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent'></div>
                {t`Generating transcription...`}
              </div>
            ) : (
              t`IPA transcription will appear here`
            )}
          </div>
        )}
      </div>
      {outputIpa && (
        <Button onClick={handleCopyIpa} variant='outline' className='flex gap-x-2 px-4'>
          <Copy className='h-4 w-4' />
          {t`Copy`}
        </Button>
      )}
    </div>
  )
}
