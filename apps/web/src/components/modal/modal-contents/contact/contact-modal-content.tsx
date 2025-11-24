import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../shadcn/dialog.tsx'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { modalActions, selectIsOpen } from '../../../../state/slices/modal-slice.ts'
import { ContactForm } from './contact-form.tsx'
import { DiscordForm } from './discord-button.tsx'
import { Button } from '../../../design-system/button.tsx'
import { useLingui } from '@lingui/react/macro'

export const ContactModalContent = () => {
  const { t } = useLingui()

  const [isSuccess, setIsSuccess] = useState(false)
  const dispatch = useDispatch()
  const isOpen = useSelector(selectIsOpen)

  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false)
    }
  }, [isOpen])

  const handleSuccess = () => {
    setIsSuccess(true)
  }

  return (
    <DialogContent className='max-h-[90vh] w-11/12 gap-y-2 overflow-y-auto rounded-xl bg-white p-6 shadow-xl sm:max-w-md'>
      <DialogHeader className='mb-4'>
        <DialogTitle className='text-2xl font-bold'>{t`Contact Us`}</DialogTitle>
        <DialogDescription className='hidden'></DialogDescription>
      </DialogHeader>
      <div className='h-2' />
      <AnimatePresence>
        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className='flex flex-col items-center justify-center space-y-4'
          >
            <CheckCircle className='h-16 w-16 text-green-500' />
            <p className='text-xl font-semibold text-gray-800'>{t`Your email has been sent!`}</p>
            <Button
              className='w-full rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-2 text-white'
              onClick={() => dispatch(modalActions.closeModal())}
            >
              {t`Close`}
            </Button>
          </motion.div>
        ) : (
          <>
            <span className='text-sm text-gray-400'>{t`Join our Discord`}</span>
            <DiscordForm />
            <span className='text-sm text-gray-400'>{t`or send us an email`}</span>
            <ContactForm onSuccess={handleSuccess} />
          </>
        )}
      </AnimatePresence>
    </DialogContent>
  )
}
