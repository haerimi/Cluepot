import { Room } from '@/types/room'
import { User } from '@/types/user'

export type Transport = 'walk' | 'transit' | 'car' | 'bike'

export interface Participant {
  id: string
  roomCode: string
  userId: string
  abstractLocation: string
  lat: number
  lng: number
  transport: Transport
  isHost: boolean
  leftAt: Date
  createdAt: Date
  room: Room
  user: User
}