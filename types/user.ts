import { Participant } from '@/types/participant'
import { ScheduleMember } from '@/types/scheduleMember'

export interface User {
  id: string
  email: string
  nickname: string
  profileImage: string
  createdAt: Date
  participants: Participant[]
  schedules: ScheduleMember[]
}
