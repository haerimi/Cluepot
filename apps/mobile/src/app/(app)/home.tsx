import { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable,
  Alert, ScrollView, Platform, StatusBar,
  Animated, TouchableWithoutFeedback,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

/* ─────────────────────────────────────────────────────────────────────────
   Types — 변경 없음
───────────────────────────────────────────────────────────────────────── */

type RoomRow = {
  id: string;
  isHost: boolean;
  room: {
    roomCode: string;
    name: string;
    category: string;
    status: string;
    schedule: { id: string } | null;
  };
};

type ScheduleRow = {
  id: string;
  title: string;
  placeName: string;
  scheduledAt: string;
  memberCount: number;
};

/* ─────────────────────────────────────────────────────────────────────────
   Config — 변경 없음
───────────────────────────────────────────────────────────────────────── */

const CATEGORY_CONFIG: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; bg: string }> = {
  restaurant: { label: '맛집',   icon: 'restaurant-outline', bg: '#1e1510' },
  cafe:       { label: '카페',   icon: 'cafe-outline',       bg: '#1a1a0e' },
  bar:        { label: '술자리', icon: 'beer-outline',       bg: '#1a1020' },
  brunch:     { label: '브런치', icon: 'sunny-outline',      bg: '#111a14' },
  dessert:    { label: '디저트', icon: 'ice-cream-outline',  bg: '#1e1016' },
};

const STATUS_CONFIG: Record<string, {
  label: string; color: string; dot: string;
  accentBorder: boolean; pulse: boolean;
}> = {
  waiting:     { label: '대기 중',        color: '#ffb867', dot: '#ffb867', accentBorder: true,  pulse: true  },
  done:        { label: '확정됨',         color: '#27a644', dot: '#27a644', accentBorder: false, pulse: false },
  reselecting: { label: '장소 재선정 중', color: '#bdc2ff', dot: '#bdc2ff', accentBorder: true,  pulse: true  },
};

/* ─────────────────────────────────────────────────────────────────────────
   PulseDot
───────────────────────────────────────────────────────────────────────── */

function PulseDot({ color, pulse }: { color: string; pulse: boolean }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!pulse) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.2, duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1,   duration: 900, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse, opacity]);

  return (
    <Animated.View
      style={[styles.dot, { backgroundColor: color, opacity }]}
      accessibilityElementsHidden
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SummaryCard — DESIGN.md surface-1 카드, hairline 보더
───────────────────────────────────────────────────────────────────────── */

function SummaryCard({ total, active, done }: { total: number; active: number; done: number }) {
  return (
    <View style={styles.summaryCard}>
      <Text allowFontScaling={false} style={styles.summaryEyebrow}>내 모임 현황</Text>
      <View style={styles.summaryCountRow}>
        <Text allowFontScaling={false} style={styles.summaryNumber}>{String(total).padStart(2, '0')}</Text>
        <Text allowFontScaling={false} style={styles.summaryUnit}>개의 모임</Text>
      </View>

      <View style={styles.summaryStatRow}>
        <View style={styles.summaryStatItem}>
          <Text allowFontScaling={false} style={styles.summaryStatNum}>{active}</Text>
          <Text allowFontScaling={false} style={styles.summaryStatLabel}>진행 중</Text>
        </View>
        <View style={[styles.summaryStatItem, styles.summaryStatItemBorder]}>
          <Text allowFontScaling={false} style={[styles.summaryStatNum, done > 0 && styles.summaryStatNumGreen]}>{done}</Text>
          <Text allowFontScaling={false} style={styles.summaryStatLabel}>확정됨</Text>
        </View>
      </View>

      <View style={styles.summaryDivider} />

      <View style={styles.summaryChipRow}>
        {active > 0 ? (
          <View style={styles.chipActive}>
            <PulseDot color="#ffb867" pulse />
            <Text allowFontScaling={false} style={styles.chipActiveText}>{active}개 진행 중</Text>
          </View>
        ) : (
          <View style={styles.chipIdle}>
            <Text allowFontScaling={false} style={styles.chipIdleText}>진행 중 없음</Text>
          </View>
        )}
        {done > 0 && (
          <View style={styles.chipDone}>
            <View style={[styles.dot, { backgroundColor: '#27a644' }]} />
            <Text allowFontScaling={false} style={styles.chipDoneText}>{done}개 확정됨</Text>
          </View>
        )}
      </View>
    </View>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SummaryCardSkeleton
───────────────────────────────────────────────────────────────────────── */

function SummaryCardSkeleton() {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 750, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [shimmer]);
  const op = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.7] });
  return (
    <Animated.View style={[styles.summaryCard, { opacity: op }]}>
      <View style={sk.eyebrow} />
      <View style={sk.number} />
      <View style={sk.chips} />
    </Animated.View>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SkeletonCard
───────────────────────────────────────────────────────────────────────── */

function SkeletonCard() {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 750, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [shimmer]);
  const op = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.7] });
  return (
    <Animated.View style={[styles.card, { opacity: op }]}>
      <View style={[styles.cardAccent, { backgroundColor: '#23252a' }]} />
      <View style={[styles.cardIcon, { backgroundColor: '#1c1b1f', marginLeft: 12, marginRight: 12 }]} />
      <View style={[styles.cardBody, { gap: 8 }]}>
        <View style={sk.title} />
        <View style={sk.meta} />
      </View>
    </Animated.View>
  );
}

const sk = StyleSheet.create({
  eyebrow: { height: 10, width: '30%', backgroundColor: '#23252a', borderRadius: 5, marginBottom: 8 },
  number:  { height: 36, width: '40%', backgroundColor: '#23252a', borderRadius: 8, marginBottom: 14 },
  chips:   { height: 26, width: '55%', backgroundColor: '#1c1b1f', borderRadius: 13 },
  title:   { height: 14, width: '58%', backgroundColor: '#23252a', borderRadius: 7 },
  meta:    { height: 11, width: '32%', backgroundColor: '#1c1b1f', borderRadius: 6 },
});

/* ─────────────────────────────────────────────────────────────────────────
   RoomCard — DESIGN.md: surface-1, hairline 보더, 아이콘 대체
───────────────────────────────────────────────────────────────────────── */

function RoomCard({ item, onPress }: { item: RoomRow; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  const cat       = CATEGORY_CONFIG[item.room.category] ?? { label: '모임', icon: 'location-outline' as keyof typeof Ionicons.glyphMap, bg: '#1c1b1f' };
  const statusKey = item.room.schedule ? 'done' : item.room.status;
  const status    = STATUS_CONFIG[statusKey] ?? { label: '알 수 없음', color: '#8a8f98', dot: '#454652', accentBorder: false, pulse: false };
  const isDone    = statusKey === 'done';
  const roomLabel = item.room.name || `${cat.label} 모임`;

  function onPressIn() {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 60, bounciness: 0 }).start();
  }
  function onPressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 5 }).start();
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      accessibilityLabel={`${roomLabel}, ${status.label}${item.isHost ? ', 내가 호스트' : ''}`}
      accessibilityHint="탭하면 모임 대기실로 이동해요"
    >
      <Animated.View style={[styles.card, isDone && styles.cardDone, { transform: [{ scale }] }]}>
        {/* 왼쪽 액센트 바 */}
        {status.accentBorder && (
          <View style={[styles.cardAccent, { backgroundColor: status.dot }]} />
        )}

        {/* 카테고리 아이콘 — 이모지 대신 Ionicons */}
        <View style={[styles.cardIcon, { backgroundColor: cat.bg, marginLeft: status.accentBorder ? 12 : 16 }]}>
          <Ionicons name={cat.icon} size={20} color={isDone ? '#454652' : '#c6c5d5'} />
        </View>

        {/* 본문 */}
        <View style={styles.cardBody}>
          <View style={styles.cardStatusRow} accessible accessibilityLabel={`상태: ${status.label}`}>
            <PulseDot color={status.dot} pulse={status.pulse} />
            <Text allowFontScaling={false} style={[styles.cardStatusText, { color: status.color }]}>{status.label}</Text>
            {item.isHost && (
              <View style={styles.hostBadge}>
                <Text allowFontScaling={false} style={styles.hostBadgeText}>호스트</Text>
              </View>
            )}
          </View>
          <Text allowFontScaling={false} style={[styles.cardName, isDone && styles.cardNameDone]} numberOfLines={1}>
            {roomLabel}
          </Text>
          <Text allowFontScaling={false} style={styles.cardMeta} accessibilityLabel={`${cat.label} · 모임 코드 ${item.room.roomCode}`}>
            {cat.label} · {item.room.roomCode}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={16} color="#454652" style={{ marginLeft: 6 }} />
      </Animated.View>
    </Pressable>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   TodayScheduleList — Stitch "Scheduled Today" UI
   DESIGN.md: surface-1 카드, hairline 구분선, 시간 강조
───────────────────────────────────────────────────────────────────────── */

function TodayScheduleList({ schedules }: { schedules: ScheduleRow[] }) {
  const router = useRouter();

  if (schedules.length === 0) {
    return (
      <View style={tod.empty}>
        <Text allowFontScaling={false} style={tod.emptyText}>오늘 예정된 약속이 없어요</Text>
      </View>
    );
  }

  return (
    <View style={tod.card}>
      {schedules.map((s, idx) => {
        const date   = new Date(s.scheduledAt);
        const hour   = date.getHours();
        const minute = String(date.getMinutes()).padStart(2, '0');
        const ampm   = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        const isLast = idx === schedules.length - 1;

        return (
          <Pressable
            key={s.id}
            onPress={() => router.push(`/(app)/schedules/${s.id}` as any)}
            style={({ pressed }) => [tod.row, pressed && tod.rowPressed, !isLast && tod.rowBorder]}
            accessibilityRole="button"
            accessibilityLabel={`${s.title}, ${hour12}:${minute} ${ampm}`}
          >
            {/* 시간 — Stitch: 모노 폰트, 시간/AM-PM 스택 */}
            <View style={tod.timeCol}>
              <Text allowFontScaling={false} style={tod.timeText}>{`${hour12}:${minute}`}</Text>
              <Text allowFontScaling={false} style={tod.ampm}>{ampm}</Text>
            </View>

            {/* 내용 */}
            <View style={tod.content}>
              <Text allowFontScaling={false} style={tod.title} numberOfLines={1}>{s.title}</Text>
              <Text allowFontScaling={false} style={tod.place} numberOfLines={1}>{s.placeName} · {s.memberCount}명</Text>
            </View>

            <Ionicons name="ellipsis-vertical" size={16} color="#454652" />
          </Pressable>
        );
      })}
    </View>
  );
}

const tod = StyleSheet.create({
  card: {
    backgroundColor: '#0f1011',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#23252a',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 64,
  },
  rowPressed: { backgroundColor: '#141516' },
  rowBorder:  { borderBottomWidth: 1, borderBottomColor: '#23252a' },
  timeCol: {
    alignItems: 'center',
    minWidth: 48,
    marginRight: 14,
  },
  timeText: {
    fontVariant: ['tabular-nums'],
    fontSize: 15,
    fontWeight: '700',
    color: '#f7f8f8',
    letterSpacing: -0.2,
    lineHeight: 18,
  },
  ampm: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8a8f98',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 2,
  },
  content: { flex: 1 },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f7f8f8',
    letterSpacing: -0.1,
    marginBottom: 3,
  },
  place: {
    fontSize: 12,
    color: '#8a8f98',
    fontWeight: '500',
  },
  empty: {
    backgroundColor: '#0f1011',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#23252a',
    paddingVertical: 28,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#8a8f98',
    fontWeight: '500',
  },
});

/* ─────────────────────────────────────────────────────────────────────────
   FAB — 44×44 버튼 + 주신 Stitch 코드 기반 바텀시트
   blur overlay → 하단 슬라이드업 시트 → 모임만들기 / 코드로참가
───────────────────────────────────────────────────────────────────────── */

function FAB() {
  const router       = useRouter();
  const [open, setOpen] = useState(false);

  /* 오버레이 페이드 */
  const overlayOp = useRef(new Animated.Value(0)).current;
  /* 바텀시트 슬라이드업 */
  const sheetY    = useRef(new Animated.Value(300)).current;

  function openSheet() {
    setOpen(true);
    Animated.parallel([
      Animated.timing(overlayOp, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(sheetY,    { toValue: 0, speed: 16, bounciness: 2, useNativeDriver: true }),
    ]).start();
  }

  function closeSheet() {
    Animated.parallel([
      Animated.timing(overlayOp, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(sheetY,    { toValue: 300, duration: 240, useNativeDriver: true }),
    ]).start(() => setOpen(false));
  }

  function navigate(path: '/(app)/rooms/create' | '/(app)/rooms/join') {
    closeSheet();
    setTimeout(() => router.push(path), 220);
  }

  return (
    <>
      {/* ── blur overlay ── */}
      {open && (
        <TouchableWithoutFeedback onPress={closeSheet} accessibilityLabel="메뉴 닫기">
          <Animated.View style={[fab.overlay, { opacity: overlayOp }]} />
        </TouchableWithoutFeedback>
      )}

      {/* ── 바텀시트 ── */}
      {open && (
        <Animated.View style={[fab.sheet, { transform: [{ translateY: sheetY }] }]}>
          {/* 드래그 핸들 */}
          <View style={fab.handle} />

          {/* 헤더 */}
          <View style={fab.sheetHeader}>
            <Text allowFontScaling={false} style={fab.sheetTitle}>새 모임 시작</Text>
            <Text allowFontScaling={false} style={fab.sheetSub}>어떻게 모임을 시작할까요?</Text>
          </View>

          {/* 모임 만들기 — primary-container */}
          <Pressable
            onPress={() => navigate('/(app)/rooms/create')}
            style={({ pressed }) => [fab.sheetBtn, fab.sheetBtnPrimary, pressed && { opacity: 0.88 }]}
            accessibilityRole="button"
            accessibilityLabel="모임 만들기"
          >
            <Ionicons name="add-circle-outline" size={22} color="#fdfaff" style={fab.sheetBtnIcon} />
            <Text allowFontScaling={false} style={[fab.sheetBtnText, fab.sheetBtnTextPrimary]}>모임 만들기</Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(253,250,255,0.35)" />
          </Pressable>

          {/* 코드로 참가 — surface-1 + hairline */}
          <Pressable
            onPress={() => navigate('/(app)/rooms/join')}
            style={({ pressed }) => [fab.sheetBtn, fab.sheetBtnSecondary, pressed && { opacity: 0.75 }]}
            accessibilityRole="button"
            accessibilityLabel="코드로 참가"
          >
            <Ionicons name="qr-code-outline" size={22} color="#c6c5d5" style={fab.sheetBtnIcon} />
            <Text allowFontScaling={false} style={fab.sheetBtnText}>코드로 참가</Text>
            <Ionicons name="chevron-forward" size={18} color="#454652" />
          </Pressable>
        </Animated.View>
      )}

      {/* ── FAB 본체 44×44 ── */}
      <View style={fab.fabWrap} pointerEvents="box-none">
        <Pressable
          onPress={openSheet}
          style={({ pressed }) => [fab.btn, pressed && fab.btnPressed]}
          accessibilityRole="button"
          accessibilityLabel="새 모임 만들기 또는 참가"
        >
          <Ionicons name="add" size={22} color="#fdfaff" />
        </Pressable>
      </View>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   HomeScreen
───────────────────────────────────────────────────────────────────────── */

export default function HomeScreen() {
  const router = useRouter();
  const user   = useAuthStore((s) => s.user);
  const [rooms,     setRooms]     = useState<RoomRow[]>([]);
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);
  const [loading,   setLoading]   = useState(true);

  useFocusEffect(useCallback(() => { fetchAll(); }, []));

  async function fetchAll() {
    setLoading(true);
    try {
      const [roomsRes, schedulesRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/schedules'),
      ]);
      setRooms(roomsRes.data);

      /* 오늘 날짜인 일정만 필터 */
      const today = new Date();
      const todaySchedules = (schedulesRes.data as ScheduleRow[]).filter((s) => {
        const d = new Date(s.scheduledAt);
        return (
          d.getFullYear() === today.getFullYear() &&
          d.getMonth()    === today.getMonth()    &&
          d.getDate()     === today.getDate()
        );
      });
      setSchedules(todaySchedules);
    } catch {
      Alert.alert('오류', '데이터를 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  }

  /* 최근 2개 — API 응답 순서 기준 마지막 2개 */
  const previewRooms = rooms.slice(-2);
  const activeRooms  = rooms.filter((r) => !r.room.schedule);
  const doneRooms    = rooms.filter((r) => !!r.room.schedule);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#131316" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 헤더 ── */}
        <View style={styles.header}>
          <View style={styles.headerTextCol}>
            <Text allowFontScaling={false} style={styles.greeting}>
              {user?.nickname ? `${user.nickname}님, 안녕하세요` : '안녕하세요'}
            </Text>
            <Text allowFontScaling={false} style={styles.headerTitle}>내 모임</Text>
          </View>
        </View>

        {/* ── 요약 카드 ── */}
        <View style={styles.sectionPad}>
          {loading ? <SummaryCardSkeleton /> : (
            <SummaryCard total={rooms.length} active={activeRooms.length} done={doneRooms.length} />
          )}
        </View>

        {/* ── 내 모임 목록 (최근 2개) ── */}
        <View style={styles.sectionHeader}>
          <Text allowFontScaling={false} style={styles.sectionTitle}>내 모임 목록</Text>
          <View style={styles.sectionHeaderRight}>
            {rooms.length > 0 && (
              <View style={styles.sectionCount}>
                <Text allowFontScaling={false} style={styles.sectionCountText}>{rooms.length}</Text>
              </View>
            )}
            <Pressable
              onPress={() => router.push('/(app)/rooms/')}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="전체 보기"
            >
              <Text allowFontScaling={false} style={styles.sectionViewAll}>전체 보기</Text>
            </Pressable>
          </View>
        </View>

        {loading ? (
          <View style={styles.listStack}>
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : rooms.length === 0 ? (
          <View style={styles.sectionPad}>
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={36} color="#454652" style={{ marginBottom: 14 }} />
              <Text allowFontScaling={false} style={styles.emptyTitle}>아직 참여한 모임이 없어요</Text>
              <Text allowFontScaling={false} style={styles.emptyText}>모임을 만들거나 코드로 참가해보세요</Text>
            </View>
          </View>
        ) : (
          <View style={styles.listStack}>
            {previewRooms.map((item) => (
              <RoomCard
                key={item.id}
                item={item}
                onPress={() => {
                  if (item.room.schedule) {
                    router.push(`/(app)/schedules/${item.room.schedule.id}` as any);
                  } else {
                    router.push(`/(app)/rooms/${item.room.roomCode}` as any);
                  }
                }}
              />
            ))}
          </View>
        )}

        {/* ── 오늘 예정된 약속 — Stitch "Scheduled Today" ── */}
        <View style={[styles.sectionHeader, { marginTop: 28 }]}>
          <Text allowFontScaling={false} style={styles.sectionTitle}>오늘 예정된 약속</Text>
        </View>

        <View style={styles.sectionPad}>
          {loading ? (
            <View style={[tod.card, { paddingVertical: 28, alignItems: 'center' }]}>
              <View style={[sk.title, { width: '50%' }]} />
            </View>
          ) : (
            <TodayScheduleList schedules={schedules} />
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <FAB />
    </View>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Styles — DESIGN.md 다크 테마 기준
───────────────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({

  root: {
    flex: 1,
    backgroundColor: '#131316',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 20 : 20,
    paddingBottom: 120,
  },
  bottomSpacer: { height: 16 },

  /* 헤더 */
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTextCol: { flex: 1 },
  greeting: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8a8f98',
    marginBottom: 3,
    letterSpacing: 0.1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#f7f8f8',
    letterSpacing: -0.6,
  },

  /* 섹션 패딩 */
  sectionPad: {
    paddingHorizontal: 20,
    marginBottom: 0,
  },

  /* 요약 카드 — surface-1, hairline */
  summaryCard: {
    backgroundColor: '#0f1011',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#23252a',
    padding: 20,
    marginBottom: 28,
  },
  summaryEyebrow: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8a8f98',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  summaryCountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 14,
  },
  summaryNumber: {
    fontSize: 42,
    fontWeight: '600',
    color: '#f7f8f8',
    letterSpacing: -1.5,
    lineHeight: 46,
  },
  summaryUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8a8f98',
  },
  summaryStatRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  summaryStatItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#141516',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#23252a',
  },
  summaryStatItemBorder: {},
  summaryStatNum: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f7f8f8',
    letterSpacing: -0.4,
    lineHeight: 24,
  },
  summaryStatNumGreen: { color: '#27a644' },
  summaryStatLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8a8f98',
    marginTop: 2,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#23252a',
    marginBottom: 14,
  },
  summaryChipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chipActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,184,103,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,184,103,0.2)',
    borderRadius: 20,
  },
  chipActiveText: { fontSize: 12, fontWeight: '700', color: '#ffb867' },
  chipIdle: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#1c1b1f',
    borderWidth: 1,
    borderColor: '#23252a',
    borderRadius: 20,
  },
  chipIdleText: { fontSize: 12, fontWeight: '600', color: '#8a8f98' },
  chipDone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(39,166,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(39,166,68,0.2)',
    borderRadius: 20,
  },
  chipDoneText: { fontSize: 12, fontWeight: '700', color: '#27a644' },

  /* 섹션 헤더 */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#f7f8f8',
    letterSpacing: -0.3,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionCount: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: 'rgba(94,106,210,0.15)',
    borderRadius: 6,
  },
  sectionCountText: { fontSize: 11, fontWeight: '700', color: '#bdc2ff' },
  sectionViewAll: {
    fontSize: 13,
    fontWeight: '500',
    color: '#bdc2ff',
    letterSpacing: -0.1,
  },

  /* 카드 목록 */
  listStack: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 0,
  },

  /* 카드 — surface-1, hairline */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f1011',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#23252a',
    overflow: 'hidden',
    minHeight: 80,
    paddingRight: 14,
  },
  cardDone: {
    borderColor: '#1c1b1f',
    opacity: 0.7,
  },
  cardAccent: {
    width: 3,
    alignSelf: 'stretch',
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
    paddingVertical: 14,
    gap: 3,
    minWidth: 0,
  },
  cardStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cardStatusText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
    flex: 1,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f7f8f8',
    letterSpacing: -0.2,
    marginTop: 2,
  },
  cardNameDone: {
    color: '#454652',
    fontWeight: '500',
  },
  cardMeta: {
    fontSize: 12,
    color: '#8a8f98',
    fontWeight: '500',
    marginTop: 2,
  },

  /* 호스트 배지 */
  hostBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(94,106,210,0.15)',
    borderRadius: 4,
    flexShrink: 0,
  },
  hostBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#bdc2ff',
    letterSpacing: 0.2,
  },

  /* 빈 상태 */
  empty: {
    backgroundColor: '#0f1011',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#23252a',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 36,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d0d6e0',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  emptyText: {
    fontSize: 13,
    color: '#8a8f98',
    textAlign: 'center',
    lineHeight: 20,
  },

  /* 공통 dot */
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

/* ─────────────────────────────────────────────────────────────────────────
   FAB StyleSheet — Stitch 바텀시트 방식
───────────────────────────────────────────────────────────────────────── */

const fab = StyleSheet.create({
  /* blur overlay — 화면 전체 */
  overlay: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: 'rgba(1,1,2,0.72)',
    zIndex: 30,
  },

  /* 바텀시트 — surface-1, 상단 radius, hairline-strong 보더 */
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 40,
    backgroundColor: '#0f1011',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#34343a',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  handle: {
    width: 48,
    height: 5,
    backgroundColor: '#34343a',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 24,
  },
  sheetHeader: {
    marginBottom: 28,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#f7f8f8',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  sheetSub: {
    fontSize: 14,
    color: '#8a8f98',
    fontWeight: '400',
  },

  /* 버튼 공통 */
  sheetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sheetBtnIcon: { marginRight: 12 },
  sheetBtnText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#d0d6e0',
    letterSpacing: 0,
  },
  /* 모임 만들기 — primary-container (#5e6ad2) */
  sheetBtnPrimary: {
    backgroundColor: '#5e6ad2',
  },
  sheetBtnTextPrimary: { color: '#fdfaff' },
  /* 코드로 참가 — surface-2 + hairline-strong */
  sheetBtnSecondary: {
    backgroundColor: '#141516',
    borderWidth: 1,
    borderColor: '#34343a',
  },

  /* FAB 본체 래퍼 */
  fabWrap: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    zIndex: 20,
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#5e6ad2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#34343a',
  },
  btnPressed: { backgroundColor: '#4854bb' },
});
