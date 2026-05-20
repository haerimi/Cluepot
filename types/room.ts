import { Participant } from '@/types/participant'
import { Schedule } from '@/types/schedule'

export type Category = 'restaurant' | 'cafe' | 'bar' | 'brunch' | 'dessert'
export type RoomStatus = 'waiting' | 'voting' | 'done'

export interface Room {  
  id: string
  roomCode: string
  category: Category
  status: RoomStatus
  linkExpiresAt: Date
  createdAt: Date
  participants: Participant[]
  schedule: Schedule
}