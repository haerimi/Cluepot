import { ScheduleMember } from '@/types/scheduleMember'
import { Room } from '@/types/room'
import { User } from '@/types/user'

export interface Schedule {
  id: string
  roomCode: string
  title: string
  placeName: string
  placeAddress: string
  lat: number
  lng: number
  scheduledAt: Date
  memo: string | null
  createdBy: string | null
  createdAt: Date
  members: ScheduleMember[]
  room: Room
  creator?: User | null
}
