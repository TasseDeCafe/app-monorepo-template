import { create } from 'zustand'
import type { PLAYER_TYPE } from '@/components/ui/audio-player/audio-player-types'

type AudioPlayerStore = {
  currentlyPlayingType: PLAYER_TYPE | null
  setCurrentlyPlaying: (playerType: PLAYER_TYPE | null) => void
  pauseAllPlayers: () => void
  playerRefs: Map<PLAYER_TYPE, { pause: () => Promise<void> | void }>
  registerPlayer: (playerType: PLAYER_TYPE, pause: () => Promise<void> | void) => void
  unregisterPlayer: (playerType: PLAYER_TYPE) => void
}

export const useAudioPlayerStore = create<AudioPlayerStore>((set, get) => ({
  currentlyPlayingType: null,
  playerRefs: new Map(),

  setCurrentlyPlaying: (playerType) => {
    set({ currentlyPlayingType: playerType })
  },

  pauseAllPlayers: () => {
    const { playerRefs } = get()
    playerRefs.forEach((player) => {
      player.pause()
    })
    set({ currentlyPlayingType: null })
  },

  registerPlayer: (playerType, pause) => {
    const { playerRefs } = get()
    playerRefs.set(playerType, { pause })
    set({ playerRefs: new Map(playerRefs) })
  },

  unregisterPlayer: (playerType) => {
    const { playerRefs, currentlyPlayingType } = get()
    playerRefs.delete(playerType)
    set({
      playerRefs: new Map(playerRefs),
      currentlyPlayingType: currentlyPlayingType === playerType ? null : currentlyPlayingType,
    })
  },
}))
