import { getMyRooms } from "@/app/actions/rooms"
import { RoomCard } from "./_components/RoomCard";
import Link from "next/link";
import { Button } from "@/app/components/ui/Button";

export default async function RoomsPage() {
  const rooms = await getMyRooms();

  return (
    <div className="flex-1 overflow-y-auto">
      {rooms.length === 0 ? (
        // 빈 상태 UI
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
          <span className="text-ink-tertiary">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <rect x="6" y="10" width="36" height="30" rx="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M6 20h36" stroke="currentColor" strokeWidth="2"/>
              <path d="M16 6v8M32 6v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M16 30h4M24 30h4M16 36h4M24 36h4M32 36h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          <h2 className="text-[20px] font-black text-ink">아직 참여한 모임이 없어요</h2>
          <p className="text-[14px] text-ink-subtle">
            새 모임을 만들거나 코드로 참가해보세요
          </p>
          <div className="flex gap-3 mt-2">
            <Link href="/rooms/create">
              <Button variant="primary" size="md">모임 만들기</Button>
            </Link>
            <Link href="/rooms/join">
              <Button variant="secondary" size="md">코드로 참가</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
          {rooms.map(room => <RoomCard key={room.roomCode} data={room} />)}
        </div>
      )}
    </div>
  );
}
