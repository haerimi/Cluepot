import { Schedule } from '@/types/schedule'
import { User } from '@/types/user'

export type ScheduleMemberStatus = 'pending' | 'accepted' | 'declined'

export interface ScheduleMember {
  id: string
  scheduleId: string
  userId: string
  status: ScheduleMemberStatus
  schedule: Schedule
  user: User
}
