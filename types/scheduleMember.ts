import { Schedule } from '@/types/schedule'
import { User } from '@/types/user'

export interface ScheduleMember {
  id: string
  scheduleId: string
  userId: string
  schedule: Schedule
  user: User
}