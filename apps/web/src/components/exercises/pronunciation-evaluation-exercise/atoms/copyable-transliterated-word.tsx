import { toast } from 'sonner'

export const CopyableTransliteratedWord = ({ text }: { text: string }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      toast.info(`"${text}" copied to clipboard`)
    })
  }

  return (
    <div
      onClick={handleCopy}
      className='flex h-6 cursor-pointer items-center justify-center rounded px-2 pb-0 pt-1 text-sm text-gray-400 transition-colors duration-100 hover:text-gray-800 md:pb-1'
    >
      {text}
    </div>
  )
}
