import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../shadcn/dialog'
import { useDispatch, useSelector } from 'react-redux'
import { selectEmail, selectName } from '../../../state/slices/account-slice'
import { Button } from '../../design-system/button'
import { Loader2, Send } from 'lucide-react'
import { Textarea } from '../../shadcn/textarea'
import { Input } from '../../shadcn/input'
import { modalActions } from '../../../state/slices/modal-slice'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../shadcn/form'
import { z } from 'zod'
import { cn } from '@template-app/core/utils/tailwind-utils'
import { formSchema } from '@template-app/api-client/orpc-contracts/contact-email-contract'
import { useSendContactEmail } from '@/hooks/api/contact-email/contact-hooks'
import { useLingui } from '@lingui/react/macro'

export const ContactUsModalContent = () => {
  const { t } = useLingui()

  const dispatch = useDispatch()
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

  const {
    mutate: sendEmail,
    isPending,
    isError,
    isSuccess,
  } = useSendContactEmail({
    onSuccess: () => {
      form.reset()
      dispatch(modalActions.closeModal())
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    sendEmail(values)
  }

  return (
    <DialogContent className='w-11/12 rounded-xl bg-white p-8 sm:max-w-md'>
      <DialogHeader>
        <DialogTitle>{t`Help us improve TemplateApp`}</DialogTitle>
        <p className='text-sm text-gray-500'>{t`Share your feedback or suggest improvements to the founders. We read and reply to every submission!`}</p>
        <DialogDescription className='hidden'></DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='mt-4 space-y-4'>
          <FormField
            control={form.control}
            name='message'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium text-gray-700'>{t`Message to the founders`}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={t`Tell us what you think or describe any issues you encountered...`}
                    className='mt-1 min-h-[120px] resize-none rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium text-gray-700'>{t`Email`}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type='email'
                    className='mt-1 block w-full rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500'
                    placeholder={t`your@email.com`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem className='pb-4'>
                <FormLabel className='text-sm font-medium text-gray-700'>{t`Name (optional)`}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className='mt-1 block w-full rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500'
                    placeholder={t`Your name`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex justify-end gap-3'>
            <Button
              onClick={() => dispatch(modalActions.closeModal())}
              type='button'
              className='border border-gray-200 bg-white px-6 text-gray-700 hover:bg-gray-50'
            >
              {t`Cancel`}
            </Button>
            <Button
              type='submit'
              disabled={isPending}
              className={cn(
                'w-full rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-500 px-4 py-2 font-medium text-white',
                {
                  'cursor-not-allowed bg-gray-500': isPending || isSuccess,
                  'bg-red-500 hover:bg-red-600': isError,
                }
              )}
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
    </DialogContent>
  )
}
