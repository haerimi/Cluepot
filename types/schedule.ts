import { ScheduleMember } from '@/types/scheduleMember'
import { Room } from '@/types/room'

export interface Schedule {
  id: string
  roomCode: string  
  title: string
  placeName: string
  placeAddress: string
  lat: number
  lng: number
  scheduledAt: Date
  memo: string
  createdAt: Date
  members: ScheduleMember[]
  room: Room 
}
