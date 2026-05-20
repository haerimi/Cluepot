import { Transport } from '@/types/participant'
import { Category } from '@/types/room'

export type BalanceTag =
  | 'most_balanced'
  | 'closest_to_all'
  | 'best_vibe'
  | 'quickest'
  | 'review_pick'

export interface PerParticipantTime {
  nickname: string
  minutes: number
  transport: Transport
}

export interface ReviewIntelligence {
  readonly authenticCount: number
  readonly pros: readonly string[]
  readonly cons: readonly string[]
}

export interface RecommendedPlace {
  readonly placeId: string
  readonly placeName: string
  readonly placeAddress: string
  readonly category: Category
  readonly rating?: number
  readonly lat: number
  readonly lng: number
  readonly fairnessScore: number
  readonly balanceTag: BalanceTag
  readonly reasoning: string
  readonly perParticipantTime: PerParticipantTime[]
  readonly atmosphereMatch: string
  readonly reviewIntelligence: ReviewIntelligence
}
