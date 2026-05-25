import { getMySchedules } from "@/app/actions/schedule";
import { CalendarView } from "./_components/CalendarView";

export default async function CalendarPage() {
  const schedules = await getMySchedules();
  return <CalendarView schedules={schedules} />;
}
