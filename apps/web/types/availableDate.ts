export interface AvailableDate{
    id: string
    roomCode: string
    userId: string
    date: Date
}

export interface DateRecommendation {
    date: string
    count: number   // 가능한 참가자 수
    total: number   // 전체 참가자 수
    userIds: string[]   // 가능한 유저 목록
}