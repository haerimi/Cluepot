import { useCallback, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
  accepted: { label: '수락', bg: '#1a2b1e', color: '#27a644' },
  declined: { label: '거절', bg: '#2b1a1a', color: '#ffb4ab' },
  pending:  { label: '보류', bg: '#23252a', color: '#8a8f98' },
};

export default function CalendarScreen() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [year,  setYear]  = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [selectedKey, setSelectedKey] = useState<string>(() => toDateKey(new Date()));
  const todayKey = toDateKey(new Date());

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      api.get('/schedules')
        .then(({ data }) => setSchedules(data))
        .catch(() => Alert.alert('오류', '일정을 불러올 수 없어요.'))
        .finally(() => setLoading(false));
    }, [])
  );

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

  const selectedDateLabel = new Date(selectedKey + 'T00:00:00').toLocaleDateString('ko-KR', {
    month: 'long', day: 'numeric', weekday: 'long',
  });

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#5e6ad2" />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* 캘린더 카드 */}
        <View style={styles.calendarCard}>
          {/* 월 네비게이터 */}
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={prevMonth} style={styles.navBtn} accessibilityLabel="이전 달" hitSlop={8}>
              <Ionicons name="chevron-back" size={20} color="#8a8f98" />
            </TouchableOpacity>
            <View style={styles.monthCenter}>
              <Text allowFontScaling={false} style={styles.yearText}>{year}</Text>
              <Text allowFontScaling={false} style={styles.monthText}>{MONTH_LABELS[month]}</Text>
            </View>
            <TouchableOpacity onPress={nextMonth} style={styles.navBtn} accessibilityLabel="다음 달" hitSlop={8}>
              <Ionicons name="chevron-forward" size={20} color="#8a8f98" />
            </TouchableOpacity>
          </View>

          {/* 요일 헤더 */}
          <View style={styles.dayHeaders}>
            {DAY_LABELS.map((d) => (
              <Text allowFontScaling={false} key={d} style={styles.dayLabel}>{d}</Text>
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
                  <Text allowFontScaling={false} style={[
                    styles.cellText,
                    !isCurrMonth && styles.cellTextDim,
                    isSelected && styles.cellTextSelected,
                    isToday && !isSelected && styles.cellTextToday,
                  ]}>
                    {cellDate.getDate()}
                  </Text>
                  {hasSchedule && (
                    <View style={[styles.dot, isSelected ? styles.dotWhite : styles.dotPrimary]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 선택 날짜 일정 */}
        <View style={styles.scheduleSection}>
          <Text allowFontScaling={false} style={styles.sectionEyebrow}>SCHEDULE</Text>
          <Text allowFontScaling={false} style={styles.selectedDateLabel}>{selectedDateLabel}</Text>

          {selectedSchedules.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={32} color="#454652" />
              <Text allowFontScaling={false} style={styles.emptyText}>이 날은 예정된 일정이 없어요</Text>
            </View>
          ) : (
            selectedSchedules.map((s) => {
              const status = STATUS_CONFIG[s.myStatus] ?? STATUS_CONFIG.pending;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={styles.scheduleCard}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/(app)/schedules/${s.id}` as any)}
                >
                  <View style={styles.scheduleCardInner}>
                    <View style={styles.scheduleTop}>
                      <Text allowFontScaling={false} style={styles.scheduleTitle} numberOfLines={1}>{s.title}</Text>
                      <View style={[styles.statusChip, { backgroundColor: status.bg }]}>
                        <Text allowFontScaling={false} style={[styles.statusChipText, { color: status.color }]}>{status.label}</Text>
                      </View>
                    </View>

                    <View style={styles.scheduleMeta}>
                      <View style={styles.metaRow}>
                        <Ionicons name="time-outline" size={13} color="#8a8f98" />
                        <Text allowFontScaling={false} style={styles.metaText}>{formatTime(s.scheduledAt)}</Text>
                      </View>
                      {s.placeName ? (
                        <View style={styles.metaRow}>
                          <Ionicons name="location-outline" size={13} color="#8a8f98" />
                          <Text allowFontScaling={false} style={styles.metaText} numberOfLines={1}>{s.placeName}</Text>
                        </View>
                      ) : null}
                      <View style={styles.metaRow}>
                        <Ionicons name="people-outline" size={13} color="#8a8f98" />
                        <Text allowFontScaling={false} style={styles.metaText}>{s.memberCount}명</Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#454652" />
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
  container: { flex: 1, backgroundColor: '#131316' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#131316' },
  scrollContent: { paddingBottom: 80 },

  /* 캘린더 카드 */
  calendarCard: {
    margin: 16,
    backgroundColor: '#0f1011',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#23252a',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },

  /* 월 네비게이터 */
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingBottom: 12 },
  navBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  monthCenter: { alignItems: 'center' },
  yearText: { fontSize: 11, fontWeight: '600', color: '#8a8f98', letterSpacing: 1.5 },
  monthText: { fontSize: 20, fontWeight: '700', color: '#f7f8f8', letterSpacing: -0.4 },

  /* 요일 헤더 */
  dayHeaders: { flexDirection: 'row', marginBottom: 4 },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '600', color: '#454652', letterSpacing: 0.5 },

  /* 그리드 */
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100/7}%` as any, height: CELL_SIZE, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  cellSelected: { backgroundColor: '#5e6ad2' },
  cellToday: { borderWidth: 1, borderColor: '#5e6ad2' },
  cellText: { fontSize: 13, fontWeight: '500', color: '#d0d6e0' },
  cellTextDim: { color: '#34343a' },
  cellTextSelected: { color: '#fdfaff', fontWeight: '700' },
  cellTextToday: { color: '#bdc2ff', fontWeight: '700' },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },
  dotPrimary: { backgroundColor: '#5e6ad2' },
  dotWhite: { backgroundColor: 'rgba(253,250,255,0.6)' },

  /* 일정 섹션 */
  scheduleSection: { paddingHorizontal: 16, paddingTop: 4 },
  sectionEyebrow: { fontSize: 11, fontWeight: '600', color: '#454652', letterSpacing: 1.5, marginBottom: 4 },
  selectedDateLabel: { fontSize: 18, fontWeight: '700', color: '#f7f8f8', letterSpacing: -0.3, marginBottom: 12 },

  /* 빈 상태 */
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 40,
    backgroundColor: '#0f1011',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#23252a',
  },
  emptyText: { fontSize: 13, color: '#454652' },

  /* 스케줄 카드 */
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f1011',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#23252a',
    padding: 14,
    marginBottom: 8,
  },
  scheduleCardInner: { flex: 1 },
  scheduleTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  scheduleTitle: { fontSize: 14, fontWeight: '600', color: '#f7f8f8', flex: 1, marginRight: 8, letterSpacing: -0.1 },
  statusChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999 },
  statusChipText: { fontSize: 11, fontWeight: '600' },
  scheduleMeta: { gap: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, color: '#8a8f98', flex: 1 },
});
