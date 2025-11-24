import { describe, expect, it } from 'vitest'
import { buildPronunciationEvaluationExercisePath } from '@/routing/route-paths.ts'

describe('route-paths', () => {
  describe('buildExercisePath', () => {
    it('should build the path correctly', () => {
      const result = buildPronunciationEvaluationExercisePath('123', 'standard')
      const expected = '/exercises/pronunciation-evaluation/123?exerciseSubtype=standard'

      expect(result).toBe(expected)
    })
  })
})
