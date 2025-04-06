import { z } from 'zod'

/**
 * Schema for trait assessment
 */
export const traitSchema = z.object({
  id: z.string(),
  name: z.string(),
  score: z.number().min(0).max(10),
  description: z.string()
})

/**
 * Schema for focus selection
 */
export const focusSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  selected: z.boolean()
})

/**
 * Schema for assessment form
 */
export const assessmentFormSchema = z.object({
  traits: z.array(traitSchema)
})

/**
 * Schema for focus selection form
 */
export const focusSelectionSchema = z.object({
  selectedFocus: focusSchema
})

/**
 * Schema for round result
 */
export const roundResultSchema = z.object({
  id: z.string(),
  score: z.number(),
  feedback: z.string(),
  timestamp: z.date()
})

/**
 * Schema for game results
 */
export const gameResultsSchema = z.object({
  userId: z.string().optional(),
  traits: z.array(traitSchema),
  focus: focusSchema,
  rounds: z.object({
    round1: roundResultSchema.optional(),
    round2: roundResultSchema.optional(),
    round3: roundResultSchema.optional()
  }),
  finalScore: z.number(),
  profileSummary: z.string(),
  createdAt: z.date()
})

/**
 * Type definitions derived from schemas
 */
export type Trait = z.infer<typeof traitSchema>
export type Focus = z.infer<typeof focusSchema>
export type AssessmentForm = z.infer<typeof assessmentFormSchema>
export type FocusSelection = z.infer<typeof focusSelectionSchema>
export type RoundResult = z.infer<typeof roundResultSchema>
export type GameResults = z.infer<typeof gameResultsSchema>
