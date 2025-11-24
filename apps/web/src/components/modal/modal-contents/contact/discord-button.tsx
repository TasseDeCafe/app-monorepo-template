import { Copy } from 'lucide-react'
import discordSvg from '../../../../images/svg/flowbite/discord.svg'
import { TooltipProvider } from '../../../shadcn/tooltip.tsx'
import { EXTERNAL_LINKS } from '@template-app/core/constants/external-links.ts'
import { Button } from '../../../design-system/button.tsx'
import { toast } from 'sonner'

export const DiscordForm = () => {
  const copyDiscordLinkToClipboard = () => {
    navigator.clipboard.writeText(EXTERNAL_LINKS.DISCORD_SERVER).then()
    toast.success('Discord link copied to clipboard')
  }

  return (
    <div className='flex items-center justify-between rounded-md'>
      <div className='flex items-center'>
        <a
          target='_blank'
          rel='noopener noreferrer'
          href={EXTERNAL_LINKS.DISCORD_SERVER}
          className='flex flex-row items-center text-sm text-gray-700 hover:underline'
        >
          <img src={discordSvg} className='mr-2 h-6 w-6' alt={'discord'} />
          Discord
        </a>
      </div>

      <TooltipProvider delayDuration={0}>
        <Button className='h-10 w-10 bg-white text-gray-500' onClick={copyDiscordLinkToClipboard}>
          <Copy className='h-5 min-h-5 w-5 min-w-5' />
        </Button>
      </TooltipProvider>
    </div>
  )
}
