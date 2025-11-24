import { useState, useCallback } from 'react'
import { Selection } from '@yourbestaccent/api-client/orpc-contracts/translation-exercise-contract'

export interface ChunkSelectionState {
  selectedChunks: Array<{
    chunk: string[]
    chunk_position: number[]
    language: string
  }>
  isSelectionMode: boolean
}

export interface UseSelectionReturn {
  selectionState: ChunkSelectionState
  toggleSelectionMode: () => void
  addSelection: (chunk: string[], positions: number[], language: string) => void
  clearSelections: () => void
  getSelectionsForLanguage: (language: string) => Selection[]
}

export const useSelection = (): UseSelectionReturn => {
  const [chunkSelectionState, setChunkSelectionState] = useState<ChunkSelectionState>({
    selectedChunks: [],
    isSelectionMode: false,
  })

  const toggleChunkSelectionMode = useCallback(() => {
    setChunkSelectionState((prev) => ({
      ...prev,
      isSelectionMode: !prev.isSelectionMode,
    }))
  }, [])

  const addChunkSelection = useCallback((chunk: string[], positions: number[], language: string) => {
    setChunkSelectionState((prev) => {
      // Check if this exact chunk already exists
      const chunkExists = prev.selectedChunks.some(
        (existing) =>
          existing.language === language &&
          existing.chunk.length === chunk.length &&
          existing.chunk.every((word, index) => word === chunk[index]) &&
          existing.chunk_position.length === positions.length &&
          existing.chunk_position.every((pos, index) => pos === positions[index])
      )

      // If chunk already exists, don't add it again
      if (chunkExists) {
        return prev
      }

      return {
        ...prev,
        selectedChunks: [
          ...prev.selectedChunks,
          {
            chunk,
            chunk_position: positions,
            language,
          },
        ],
      }
    })
  }, [])

  const clearChunkSelections = useCallback(() => {
    setChunkSelectionState((prev) => ({
      ...prev,
      selectedChunks: [],
    }))
  }, [])

  const getChunkSelectionsForLanguage = useCallback(
    (language: string) => {
      return chunkSelectionState.selectedChunks
        .filter((selection) => selection.language === language)
        .map((selection) => ({
          chunk: selection.chunk,
          chunk_position: selection.chunk_position,
          language: selection.language,
        }))
    },
    [chunkSelectionState.selectedChunks]
  )

  return {
    selectionState: chunkSelectionState,
    toggleSelectionMode: toggleChunkSelectionMode,
    addSelection: addChunkSelection,
    clearSelections: clearChunkSelections,
    getSelectionsForLanguage: getChunkSelectionsForLanguage,
  }
}
