import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../shadcn/form.tsx'
import { Input } from '../../../shadcn/input.tsx'
import { Textarea } from '../../../shadcn/textarea.tsx'
import { useSelector } from 'react-redux'
import { selectEmail, selectName } from '../../../../state/slices/account-slice.ts'
import { toast } from 'sonner'
import { Copy, Loader2, Mail, Send } from 'lucide-react'
import { cn } from '@template-app/core/utils/tailwind-utils'
import { Button } from '../../../design-system/button.tsx'
import { formSchema } from '@template-app/api-client/orpc-contracts/contact-email-contract'
import { useSendContactEmail } from '@/hooks/api/contact-email/contact-hooks'
import { useLingui } from '@lingui/react/macro'

export const ContactForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { t } = useLingui()

  const userEmail = useSelector(selectEmail)
  const username = useSelector(selectName)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: username || '',
      email: userEmail || '',
      message: '',
    },
  })

  const ourEmail: string = 'contact@template-app.com'

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText(ourEmail).then()
    toast.success(t`Email copied to clipboard`)
  }

  const {
    mutate: sendEmail,
    isPending,
    isError,
    isSuccess,
  } = useSendContactEmail({
    onSuccess: () => {
      onSuccess()
      form.reset()
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    sendEmail(values)
  }

  return (
    <Form {...form}>
      <div className='flex items-center justify-between rounded-md'>
        <div className='flex items-center'>
          <a
            href='mailto:contact@template-app.com'
            className='flex flex-row items-center text-sm text-gray-700 hover:underline'
          >
            <Mail className='mr-2 h-5 w-5 text-gray-500' />
            contact@template-app.com
          </a>
        </div>
        <Button className='h-10 w-10 bg-white text-gray-500' onClick={copyEmailToClipboard}>
          <Copy className='h-5 min-h-5 w-5 min-w-5' />
        </Button>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium text-gray-700'>{t`Name (optional)`}</FormLabel>
              <FormControl>
                <Input
                  className='mt-1 block w-full rounded-md border-gray-300 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                  placeholder={t`Name`}
                  {...field}
                />
              </FormControl>
              <FormMessage className='mt-1 text-xs text-red-500' />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium text-gray-700'>{t`Your email`}</FormLabel>
              <FormControl>
                <Input
                  className='mt-1 block w-full rounded-md border-gray-300 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                  placeholder={t`Email`}
                  {...field}
                />
              </FormControl>
              <FormMessage className='mt-1 text-xs text-red-500' />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='message'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium text-gray-700'>{t`Message`}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t`Enter your message here...`}
                  className='mt-1 block h-32 w-full resize-none rounded-md border-gray-300 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                  {...field}
                />
              </FormControl>
              <FormMessage className='mt-1 text-xs text-red-500' />
            </FormItem>
          )}
        />
        <div className='pt-4'>
          <Button
            type='submit'
            className={cn(
              'w-full rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-500 px-4 py-2 font-medium text-white',
              {
                'cursor-not-allowed bg-gray-500': isPending || isSuccess,
                'bg-red-500 hover:bg-red-600': isError,
              }
            )}
            disabled={isPending || isSuccess}
          >
            {isPending ? (
              <>
                <Loader2 className='mr-2 inline h-4 w-4 animate-spin' />
                {t`Sending...`}
              </>
            ) : isError ? (
              t`An error occurred. Please try again.`
            ) : (
              <>
                <Send className='mr-2 inline h-4 w-4' />
                {t`Send Message`}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
