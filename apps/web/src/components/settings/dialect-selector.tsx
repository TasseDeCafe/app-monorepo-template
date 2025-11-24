import { ToggleGroup, ToggleGroupItem } from '../shadcn/toggle-group.tsx'
import { FormDescription, FormItem, FormLabel } from '../shadcn/form.tsx'
import { DialectCode } from '@yourbestaccent/core/constants/lang-codes'
import { ShadcnTooltip } from '../design-system/tooltip.tsx'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils'
import { CustomCircularFlag } from '@/components/design-system/custom-circular-flag.tsx'
import { useLingui } from '@lingui/react/macro'
import { dialectNameMessages } from '@yourbestaccent/i18n/lang-code-translation-utils'

interface DialectSelectorProps {
  dialects: DialectCode[]
  selectedDialect: DialectCode
  onDialectSelect: (value: DialectCode) => void
}

// we need a special function because Scottish English has the country code 'GB-SCT', which looks ugly in the UI
const getCountryAbbreviation = (dialect: DialectCode): string => {
  const parts = dialect.split('-')
  return parts[parts.length - 1]
}

const DialectSelector = ({ dialects, selectedDialect, onDialectSelect }: DialectSelectorProps) => {
  const { t, i18n } = useLingui()

  return (
    <FormItem className='space-y-2'>
      <FormLabel className='text-base font-semibold'>{t`My preferred accent:`}</FormLabel>
      <ToggleGroup
        type='single'
        value={selectedDialect}
        onValueChange={onDialectSelect}
        className='flex w-full flex-wrap justify-start gap-2'
      >
        {dialects.map((dialect) => {
          return (
            <div key={dialect}>
              <ShadcnTooltip content={i18n._(dialectNameMessages[dialect])} side='top'>
                <ToggleGroupItem
                  variant='outline'
                  value={dialect}
                  aria-label={`Toggle ${dialect}`}
                  className={cn(
                    'flex h-9 w-20 items-center justify-center rounded-md border border-gray-300 px-3 py-2',
                    {
                      'bg-gray-200 shadow': selectedDialect === dialect,
                    }
                  )}
                >
                  <CustomCircularFlag languageOrDialectCode={dialect} className={'h-5 w-5 bg-transparent'} />
                  <div className='ml-2 text-sm'>{getCountryAbbreviation(dialect)}</div>
                </ToggleGroupItem>
              </ShadcnTooltip>
            </div>
          )
        })}
      </ToggleGroup>
      <FormDescription className='text-sm text-gray-400'>{t`Note: some accents are in beta. The speed of the audio might vary.`}</FormDescription>
    </FormItem>
  )
}

export default DialectSelector
