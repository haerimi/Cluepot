import { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { api } from '@/lib/api';

type Schedule = {
  id: string;
  title: string;
  placeName: string;
  placeAddress: string;
  scheduledAt: string;
  memberCount: number;
  myStatus: string;
};

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTH_LABELS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getCalendarCells(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  const cells: Date[] = [];
  for (let i = 0; i < first.getDay(); i++) cells.push(new Date(year, month, 1 - (first.getDay() - i)));
  for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(year, month, d));
  while (cells.length < 42) { const l = cells[cells.length-1]; cells.push(new Date(l.getFullYear(), l.getMonth(), l.getDate()+1)); }
  return cells;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const h = d.getHours(), m = d.getMinutes();
  const period = h < 12 ? '오전' : '오후';
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${period} ${hour}:${String(m).padStart(2,'0')}`;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  accepted: { label: '수락', bg: '#E6F7EF', color: '#2E7D52' },
  declined: { label: '거절', bg: '#FFF0F0', color: '#E05555' },
  pending:  { label: '보류', bg: '#F0F2F5', color: '#5A6A85' },
};

export default function CalendarScreen() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [year,  setYear]  = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [selectedKey, setSelectedKey] = useState<string>(() => toDateKey(new Date()));
  const todayKey = toDateKey(new Date());

  useEffect(() => {
    // TODO: api.get('/schedules') 로 일정 목록 가져오기
    api.get('/schedules').then(({ data }) => setSchedules(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const byDate = useMemo(() => {
    const map = new Map<string, Schedule[]>();
    for (const s of schedules) {
      const key = toDateKey(new Date(s.scheduledAt));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return map;
  }, [schedules]);

  const cells = useMemo(() => getCalendarCells(year, month), [year, month]);
  const selectedSchedules = byDate.get(selectedKey) ?? [];

  function prevMonth() {
    if (month === 0) { setYear(y => y-1); setMonth(11); }
    else setMonth(m => m-1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y+1); setMonth(0); }
    else setMonth(m => m+1);
  }

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#7298C7" /></View>;

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>내 일정</Text>
          <Text style={styles.headerTitle}>모임 일정</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 월 네비게이터 */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <Text style={styles.navArrow}>‹</Text>
          </TouchableOpacity>
          <View style={styles.monthCenter}>
            <Text style={styles.yearText}>{year}</Text>
            <Text style={styles.monthText}>{MONTH_LABELS[month]}</Text>
          </View>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <Text style={styles.navArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 요일 헤더 */}
        <View style={styles.dayHeaders}>
          {DAY_LABELS.map((d) => (
            <Text key={d} style={styles.dayLabel}>{d}</Text>
          ))}
        </View>

        {/* 캘린더 그리드 */}
        <View style={styles.grid}>
          {cells.map((cellDate, i) => {
            const key = toDateKey(cellDate);
            const isCurrMonth = cellDate.getMonth() === month;
            const isToday = key === todayKey;
            const isSelected = key === selectedKey;
            const hasSchedule = byDate.has(key) && isCurrMonth;

            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.cell,
                  isSelected && styles.cellSelected,
                  isToday && !isSelected && styles.cellToday,
                ]}
                onPress={() => isCurrMonth && setSelectedKey(key)}
                disabled={!isCurrMonth}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.cellText,
                  !isCurrMonth && styles.cellTextDim,
                  isSelected && styles.cellTextSelected,
                  isToday && !isSelected && styles.cellTextToday,
                ]}>
                  {cellDate.getDate()}
                </Text>
                {hasSchedule && (
                  <View style={[styles.dot, isSelected ? styles.dotWhite : styles.dotBlue]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.divider} />

        {/* 선택된 날짜 일정 */}
        <View style={styles.scheduleList}>
          <Text style={styles.selectedDateLabel}>
            {new Date(selectedKey + 'T00:00:00').toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
          </Text>

          {selectedSchedules.length === 0 ? (
            <View style={styles.emptyDate}>
              <Text style={styles.emptyDateText}>이 날은 예정된 일정이 없어요</Text>
            </View>
          ) : (
            selectedSchedules.map((s) => {
              const status = STATUS_CONFIG[s.myStatus] ?? STATUS_CONFIG.pending;
              return (
                <TouchableOpacity key={s.id} style={styles.scheduleCard} activeOpacity={0.8}>
                  <View style={styles.timeCol}>
                    <Text style={styles.timeText}>{formatTime(s.scheduledAt)}</Text>
                  </View>
                  <View style={styles.timelineDot} />
                  <View style={styles.scheduleContent}>
                    <Text style={styles.scheduleTitle} numberOfLines={1}>{s.title}</Text>
                    <Text style={styles.schedulePlaceName} numberOfLines={1}>{s.placeName}</Text>
                    <View style={styles.scheduleMeta}>
                      <Text style={styles.memberCount}>{s.memberCount}명</Text>
                      <View style={[styles.statusChip, { backgroundColor: status.bg }]}>
                        <Text style={[styles.statusChipText, { color: status.color }]}>{status.label}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const CELL_SIZE = 44;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F0' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F5F0' },
  header: { paddingHorizontal: 20, marginBottom: 16, marginTop: 16 },
  headerEyebrow: { fontSize: 10, fontWeight: '700', color: '#9AAFC5', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 2 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#1A2033' },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  navBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  navArrow: { fontSize: 24, color: '#5A6A85', fontWeight: '300' },
  monthCenter: { alignItems: 'center' },
  yearText: { fontSize: 11, fontWeight: '700', color: '#9AAFC5', letterSpacing: 2 },
  monthText: { fontSize: 22, fontWeight: '900', color: '#1A2033' },
  dayHeaders: { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 4 },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '600', color: '#9AAFC5' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginBottom: 8 },
  cell: { width: `${100/7}%` as any, height: CELL_SIZE, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  cellSelected: { backgroundColor: '#7298C7' },
  cellToday: { borderWidth: 1, borderColor: '#7298C7' },
  cellText: { fontSize: 13, fontWeight: '500', color: '#1A2033' },
  cellTextDim: { color: '#C5CCD8' },
  cellTextSelected: { color: '#fff', fontWeight: '700' },
  cellTextToday: { color: '#7298C7', fontWeight: '700' },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },
  dotBlue: { backgroundColor: '#7298C7' },
  dotWhite: { backgroundColor: 'rgba(255,255,255,0.7)' },
  divider: { height: 1, backgroundColor: '#E2E6EC', marginHorizontal: 20, marginBottom: 20 },
  scheduleList: { paddingHorizontal: 20, paddingBottom: 60 },
  selectedDateLabel: { fontSize: 18, fontWeight: '900', color: '#1A2033', marginBottom: 16 },
  emptyDate: { alignItems: 'center', paddingVertical: 32 },
  emptyDateText: { fontSize: 13, color: '#9AAFC5' },
  scheduleCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#E2E6EC' },
  timeCol: { width: 48 },
  timeText: { fontSize: 11, fontWeight: '600', color: '#5A6A85', textAlign: 'right' },
  timelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#7298C7', marginTop: 3 },
  scheduleContent: { flex: 1 },
  scheduleTitle: { fontSize: 14, fontWeight: '700', color: '#1A2033', marginBottom: 2 },
  schedulePlaceName: { fontSize: 12, color: '#5A6A85', marginBottom: 6 },
  scheduleMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  memberCount: { fontSize: 11, color: '#9AAFC5' },
  statusChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  statusChipText: { fontSize: 10, fontWeight: '700' },
  arrow: { fontSize: 18, color: '#C5CCD8', marginTop: 2 },
});
