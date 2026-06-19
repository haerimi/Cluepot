<<<<<<< HEAD
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TouchableOpacity, Animated, Alert, Platform, StatusBar, Share, Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
=======
import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TouchableOpacity, Animated, Alert, Platform, StatusBar, Share,
} from 'react-native';
import { useRouter } from 'expo-router';
>>>>>>> main
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

/* ── Types ─────────────────────────────────────────────────────────────── */

type RoomRow = {
  id: string;
  isHost: boolean;
  room: {
    roomCode: string;
    name: string;
    category: string;
    status: string;
<<<<<<< HEAD
    schedule: { id: string; scheduledAt: string; placeName: string } | null;
  };
};

function formatScheduledAt(iso: string): string {
  const d = new Date(iso);
  const M = d.getMonth() + 1;
  const D = d.getDate();
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? '오후' : '오전';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${M}월 ${D}일 ${ampm} ${hour}:${m}`;
}

=======
    schedule: { id: string } | null;
  };
};

>>>>>>> main
/* ── Config ─────────────────────────────────────────────────────────────── */

const CATEGORY_CONFIG: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; bg: string }> = {
  restaurant: { label: '맛집',   icon: 'restaurant-outline', bg: '#1e1510' },
  cafe:       { label: '카페',   icon: 'cafe-outline',       bg: '#1a1a0e' },
  bar:        { label: '술자리', icon: 'beer-outline',       bg: '#1a1020' },
  brunch:     { label: '브런치', icon: 'sunny-outline',      bg: '#111a14' },
  dessert:    { label: '디저트', icon: 'ice-cream-outline',  bg: '#1e1016' },
};

type FilterKey = 'all' | 'active' | 'done';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',    label: '전체' },
  { key: 'active', label: '진행 중' },
  { key: 'done',   label: '확정됨' },
];

/* ── NavHeader ─────────────────────────────────────────────────────────── */

function NavHeader({ initial, onBack }: { initial: string; onBack: () => void }) {
<<<<<<< HEAD
  const profileImage = useAuthStore((s) => s.user?.profileImage ?? null);
=======
>>>>>>> main
  return (
    <View style={navHdr.wrap}>
      <TouchableOpacity onPress={onBack} style={navHdr.backBtn} hitSlop={8}>
        <Ionicons name="chevron-back" size={22} color="#c6c5d5" />
      </TouchableOpacity>
      <Text style={navHdr.logo}>Clue<Text style={navHdr.accent}>Pot</Text></Text>
      <View style={navHdr.avatar}>
<<<<<<< HEAD
        {profileImage
          ? <Image source={{ uri: profileImage }} style={navHdr.avatarImg} />
          : <Text style={navHdr.avatarText}>{initial}</Text>
        }
=======
        <Text style={navHdr.avatarText}>{initial}</Text>
>>>>>>> main
      </View>
    </View>
  );
}

<<<<<<< HEAD
const SB_H = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;
const navHdr = StyleSheet.create({
  wrap:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: SB_H, height: 56 + SB_H, borderBottomWidth: 1, borderBottomColor: '#23252a', backgroundColor: '#131316' },
  backBtn:    { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  logo:       { fontSize: 20, fontWeight: '700', color: '#f7f8f8', letterSpacing: -0.3 },
  accent:     { color: '#bdc2ff' },
  avatar:     { width: 30, height: 30, borderRadius: 15, backgroundColor: '#5e6ad2', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#34343a', overflow: 'hidden' },
  avatarImg:  { width: 30, height: 30, borderRadius: 15 },
=======
const navHdr = StyleSheet.create({
  wrap:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderBottomColor: '#23252a', backgroundColor: '#131316' },
  backBtn:    { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  logo:       { fontSize: 20, fontWeight: '700', color: '#f7f8f8', letterSpacing: -0.3 },
  accent:     { color: '#bdc2ff' },
  avatar:     { width: 30, height: 30, borderRadius: 15, backgroundColor: '#5e6ad2', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#34343a' },
>>>>>>> main
  avatarText: { fontSize: 12, fontWeight: '700', color: '#fdfaff' },
});

/* ── PulseDot ───────────────────────────────────────────────────────────── */

function PulseDot({ color }: { color: string }) {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.2, duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1,   duration: 900, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);
  return <Animated.View style={[s.dot, { backgroundColor: color, opacity }]} />;
}

/* ── SkeletonCard ───────────────────────────────────────────────────────── */

function SkeletonCard() {
  const op = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(op, { toValue: 0.7, duration: 750, useNativeDriver: true }),
        Animated.timing(op, { toValue: 0.4, duration: 750, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [op]);
  return (
    <Animated.View style={[s.card, { opacity: op }]}>
      <View style={{ padding: 16, gap: 10 }}>
        <View style={{ height: 18, width: '30%', backgroundColor: '#23252a', borderRadius: 6 }} />
        <View style={{ height: 22, width: '60%', backgroundColor: '#23252a', borderRadius: 7 }} />
        <View style={{ height: 14, width: '45%', backgroundColor: '#1c1b1f', borderRadius: 6 }} />
        <View style={{ height: 1, backgroundColor: '#23252a', marginVertical: 4 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ height: 14, width: '35%', backgroundColor: '#1c1b1f', borderRadius: 6 }} />
          <View style={{ height: 34, width: 72, backgroundColor: '#1c1b1f', borderRadius: 8 }} />
        </View>
      </View>
    </Animated.View>
  );
}

/* ── RoomDetailCard ─────────────────────────────────────────────────────── */

<<<<<<< HEAD
function RoomDetailCard({ item, onEnter, onViewSchedule, onLongPress, onCardPress }: { item: RoomRow; onEnter: () => void; onViewSchedule: () => void; onLongPress?: () => void; onCardPress?: () => void }) {
=======
function RoomDetailCard({ item, onEnter, onViewSchedule }: { item: RoomRow; onEnter: () => void; onViewSchedule: () => void }) {
>>>>>>> main
  const [copied, setCopied] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const cat    = CATEGORY_CONFIG[item.room.category] ?? { label: '모임', icon: 'location-outline' as keyof typeof Ionicons.glyphMap, bg: '#1c1b1f' };
  const isDone = !!item.room.schedule;

  let badgeLabel = '진행 중';
  let badgeColor = '#ffb867';
  let badgeBg    = 'rgba(255,184,103,0.12)';
  let badgeBorder= 'rgba(255,184,103,0.25)';
  let accentBar  = '#ffb867';
  let showPulse  = true;

  if (isDone) {
    badgeLabel = '확정됨';   badgeColor = '#27a644';
    badgeBg    = 'rgba(39,166,68,0.12)'; badgeBorder = 'rgba(39,166,68,0.25)';
    accentBar  = '#27a644';  showPulse  = false;
  } else if (item.room.status === 'reselecting') {
    badgeLabel = '재선정 중'; badgeColor = '#bdc2ff';
    badgeBg    = 'rgba(189,194,255,0.12)'; badgeBorder = 'rgba(189,194,255,0.25)';
    accentBar  = '#bdc2ff';  showPulse  = true;
  }

  async function handleCopy() {
    try { await Share.share({ message: item.room.roomCode }); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function pressIn() {
    Animated.spring(scale, { toValue: 0.975, useNativeDriver: true, speed: 60, bounciness: 0 }).start();
  }
  function pressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 5 }).start();
  }

  return (
    <Animated.View style={[s.card, isDone && s.cardDone, { transform: [{ scale }] }]}>
      {/* 왼쪽 액센트 바 */}
      {!isDone && <View style={[s.accentBar, { backgroundColor: accentBar }]} />}

      <View style={s.cardInner}>
      {/* 카드 상단 — 전체가 탭 영역 */}
      <Pressable
<<<<<<< HEAD
        onPress={onCardPress ?? (isDone ? onViewSchedule : onEnter)}
        onLongPress={onLongPress}
        onPressIn={onCardPress ? undefined : pressIn}
        onPressOut={onCardPress ? undefined : pressOut}
        delayLongPress={400}
=======
        onPress={isDone ? onViewSchedule : onEnter}
        onPressIn={pressIn}
        onPressOut={pressOut}
>>>>>>> main
        style={s.cardTop}
        accessibilityRole="button"
        accessibilityLabel={isDone ? `${item.room.name || cat.label + ' 모임'} 일정 상세보기` : `${item.room.name || cat.label + ' 모임'} 모임 입장`}
      >
        <View style={s.cardTopLeft}>
          {/* status badge */}
          <View style={[s.badge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
            {showPulse ? <PulseDot color={badgeColor} /> : <View style={[s.dot, { backgroundColor: badgeColor }]} />}
            <Text style={[s.badgeText, { color: badgeColor }]}>{badgeLabel}</Text>
          </View>

          <Text style={[s.roomName, isDone && s.roomNameDone]} numberOfLines={1}>
            {item.room.name || `${cat.label} 모임`}
          </Text>

          <View style={s.metaRow}>
            <View style={[s.catIconBox, { backgroundColor: cat.bg }]}>
              <Ionicons name={cat.icon} size={13} color={isDone ? '#454652' : '#c6c5d5'} />
            </View>
            <Text style={s.categoryLabel}>{cat.label}</Text>
            {item.isHost && (
              <View style={s.hostBadge}>
                <Text style={s.hostBadgeText}>호스트</Text>
              </View>
            )}
          </View>
        </View>

        {/* 오른쪽 chevron — 시각적 단서 */}
        <Ionicons
          name={isDone ? 'calendar-outline' : 'chevron-forward'}
          size={18}
          color={isDone ? '#27a644' : '#454652'}
          style={{ marginTop: 2 }}
        />
      </Pressable>

      {/* divider */}
      <View style={s.divider} />

      {/* 카드 하단 — room code + CTA */}
      <View style={s.cardBottom}>
        <View style={s.codeBlock}>
<<<<<<< HEAD
          {isDone && item.room.schedule?.scheduledAt && (
            <View style={s.scheduleInfoRow}>
              <Ionicons name="calendar-outline" size={11} color="#27a644" />
              <Text style={s.scheduleInfoText} allowFontScaling={false}>{formatScheduledAt(item.room.schedule.scheduledAt)}</Text>
            </View>
          )}
          <Text style={s.codeLabel} allowFontScaling={false}>ROOM CODE</Text>
          <View style={s.codeRow}>
            <Text style={s.codeText} allowFontScaling={false}>{item.room.roomCode}</Text>
=======
          <Text style={s.codeLabel}>ROOM CODE</Text>
          <View style={s.codeRow}>
            <Text style={s.codeText}>{item.room.roomCode}</Text>
>>>>>>> main
            <TouchableOpacity
              onPress={handleCopy}
              hitSlop={12}
              style={[s.copyBtn, copied && s.copyBtnDone]}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={copied ? '코드 복사됨' : '코드 복사'}
            >
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={13} color={copied ? '#27a644' : '#bdc2ff'} />
<<<<<<< HEAD
              <Text style={[s.copyText, copied && s.copyTextDone]} allowFontScaling={false}>{copied ? '복사됨' : 'Copy'}</Text>
=======
              <Text style={[s.copyText, copied && s.copyTextDone]}>{copied ? '복사됨' : 'Copy'}</Text>
>>>>>>> main
            </TouchableOpacity>
          </View>
        </View>

        <Pressable
<<<<<<< HEAD
          onPress={onCardPress ?? (isDone ? onViewSchedule : onEnter)}
          onLongPress={onLongPress}
          onPressIn={onCardPress ? undefined : pressIn}
          onPressOut={onCardPress ? undefined : pressOut}
          delayLongPress={400}
=======
          onPress={isDone ? onViewSchedule : onEnter}
          onPressIn={pressIn}
          onPressOut={pressOut}
>>>>>>> main
          style={({ pressed }) => [s.enterBtn, isDone && s.enterBtnDone, pressed && { opacity: 0.82 }]}
          accessibilityRole="button"
          accessibilityLabel={isDone ? '일정 상세보기' : '모임 입장'}
        >
<<<<<<< HEAD
          <Text style={[s.enterBtnText, isDone && s.enterBtnTextDone]} allowFontScaling={false}>{isDone ? '상세보기' : '입장'}</Text>
=======
          <Text style={[s.enterBtnText, isDone && s.enterBtnTextDone]}>{isDone ? '상세보기' : '입장'}</Text>
>>>>>>> main
          <Ionicons name={isDone ? 'calendar-outline' : 'arrow-forward'} size={13} color={isDone ? '#8a8f98' : '#fdfaff'} />
        </Pressable>
      </View>
      </View>
    </Animated.View>
  );
}

/* ── EmptyState ─────────────────────────────────────────────────────────── */

function EmptyState({ filter }: { filter: FilterKey }) {
  const msg = filter === 'active' ? '진행 중인 모임이 없어요'
            : filter === 'done'   ? '확정된 모임이 없어요'
                                  : '아직 참여한 모임이 없어요';
  return (
    <View style={s.empty}>
      <Ionicons name="people-outline" size={38} color="#454652" style={{ marginBottom: 12 }} />
      <Text style={s.emptyTitle}>{msg}</Text>
      <Text style={s.emptyText}>모임을 만들거나 코드로 참가해보세요</Text>
    </View>
  );
}

/* ── RoomsListScreen ────────────────────────────────────────────────────── */

export default function RoomsListScreen() {
  const router   = useRouter();
  const nickname = useAuthStore((s) => s.user?.nickname ?? s.user?.email ?? '?');
  const initial  = nickname[0].toUpperCase();

<<<<<<< HEAD
  const [rooms,        setRooms]        = useState<RoomRow[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState<FilterKey>('all');
  const [selectMode,   setSelectMode]   = useState(false);
  const [selectedIds,  setSelectedIds]  = useState<Set<string>>(new Set());
  const [deleting,     setDeleting]     = useState(false);

  useFocusEffect(useCallback(() => {
    cancelSelect();
    fetchRooms();
  }, []));

  function enterSelectMode(id: string) {
    setSelectMode(true);
    setSelectedIds(new Set([id]));
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function cancelSelect() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  async function handleDeleteSelected() {
    const selected = rooms.filter((r) => selectedIds.has(r.id));
    const count = selected.length;
    const hostCount = selected.filter((r) => r.isHost).length;
    const memberCount = count - hostCount;

    let message = `선택한 ${count}개의 모임을 처리할까요?`;
    if (hostCount > 0 && memberCount > 0) {
      message += `\n• 호스트 ${hostCount}개 → 삭제\n• 참가자 ${memberCount}개 → 나가기`;
    } else if (hostCount > 0) {
      message += `\n모임이 완전히 삭제돼요.`;
    } else {
      message += `\n모임에서 나가게 돼요.`;
    }

    Alert.alert('모임 삭제/나가기', message, [
      { text: '취소', style: 'cancel' },
      {
        text: hostCount > 0 && memberCount === 0 ? '삭제' : '확인',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          const results = await Promise.allSettled(
            selected.map((r) =>
              r.isHost
                ? api.delete(`/rooms/${r.room.roomCode}`)
                : api.delete(`/rooms/${r.room.roomCode}/participants`)
            )
          );
          const failed = results.filter((r) => r.status === 'rejected').length;
          const succeededIds = new Set(
            selected
              .filter((_, i) => results[i].status === 'fulfilled')
              .map((r) => r.id)
          );
          setRooms((prev) => prev.filter((r) => !succeededIds.has(r.id)));
          setDeleting(false);
          cancelSelect();
          fetchRooms();
          if (failed > 0) {
            Alert.alert('일부 실패', `${failed}개를 처리하지 못했어요.`);
          }
        },
      },
    ]);
  }
=======
  const [rooms,   setRooms]   = useState<RoomRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<FilterKey>('all');

  useEffect(() => { fetchRooms(); }, []);
>>>>>>> main

  async function fetchRooms() {
    setLoading(true);
    try {
      const { data } = await api.get('/rooms');
      setRooms(data);
    } catch {
      Alert.alert('오류', '모임 목록을 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  }

  const filtered = rooms.filter((r) => {
    if (filter === 'active') return !r.room.schedule;
    if (filter === 'done')   return !!r.room.schedule;
    return true;
  });

  const activeCount = rooms.filter((r) => !r.room.schedule).length;
  const doneCount   = rooms.filter((r) => !!r.room.schedule).length;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#131316" />
      <NavHeader initial={initial} onBack={() => router.back()} />

<<<<<<< HEAD
      {/* 선택 모드 상단 바 */}
      {selectMode && (
        <View style={s.selectBar}>
          <TouchableOpacity onPress={cancelSelect} hitSlop={8}>
            <Ionicons name="close" size={22} color="#c6c5d5" />
          </TouchableOpacity>
          <Text allowFontScaling={false} style={s.selectBarText}>
            {selectedIds.size > 0 ? `${selectedIds.size}개 선택됨` : '모임을 선택하세요'}
          </Text>
          <TouchableOpacity
            onPress={handleDeleteSelected}
            disabled={selectedIds.size === 0 || deleting}
            hitSlop={8}
          >
            <Text allowFontScaling={false} style={[s.selectDeleteText, selectedIds.size === 0 && { opacity: 0.3 }]}>
              삭제
            </Text>
          </TouchableOpacity>
        </View>
      )}

=======
>>>>>>> main
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 헤더 ── */}
        <View style={s.pageHeader}>
          <View>
            <Text style={s.eyebrow}>DASHBOARD</Text>
            <Text style={s.pageTitle}>내 모임 목록</Text>
            <Text style={s.pageSub}>진행 중인 모임을 관리하거나 새 모임을 만들어보세요</Text>
          </View>
          {/* 요약 배지 */}
          <View style={s.statRow}>
            <View style={s.statChip}>
              <PulseDot color="#ffb867" />
              <Text style={s.statChipText}>{activeCount} 진행 중</Text>
            </View>
            {doneCount > 0 && (
              <View style={[s.statChip, s.statChipDone]}>
                <View style={[s.dot, { backgroundColor: '#27a644' }]} />
                <Text style={[s.statChipText, { color: '#27a644' }]}>{doneCount} 확정됨</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── 필터 탭 ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterRow}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[s.filterChip, filter === f.key && s.filterChipActive]}
              activeOpacity={0.75}
            >
              <Text style={[s.filterChipText, filter === f.key && s.filterChipTextActive]}>
                {f.label}
              </Text>
              {f.key !== 'all' && (
                <View style={[s.filterCount, filter === f.key && s.filterCountActive]}>
                  <Text style={[s.filterCountText, filter === f.key && s.filterCountTextActive]}>
                    {f.key === 'active' ? activeCount : doneCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── 목록 ── */}
        <View style={s.list}>
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : filtered.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
<<<<<<< HEAD
            filtered.map((item) => {
              const isSelected = selectedIds.has(item.id);
              return (
                <View key={item.id} style={{ position: 'relative' }}>
                  {selectMode && (
                    <View style={s.selectOverlay} pointerEvents="none">
                      <View style={[s.selectCheck, isSelected && s.selectCheckActive]}>
                        {isSelected && <Ionicons name="checkmark" size={14} color="#fdfaff" />}
                      </View>
                    </View>
                  )}
                  <RoomDetailCard
                    item={item}
                    onLongPress={() => enterSelectMode(item.id)}
                    onCardPress={selectMode ? () => toggleSelect(item.id) : undefined}
                    onEnter={() => router.push(`/(app)/rooms/${item.room.roomCode}` as any)}
                    onViewSchedule={() => router.push(`/(app)/schedules/${item.room.schedule!.id}` as any)}
                  />
                </View>
              );
            })
=======
            filtered.map((item) => (
              <RoomDetailCard
                key={item.id}
                item={item}
                onEnter={() => router.push(`/(app)/rooms/${item.room.roomCode}`)}
                onViewSchedule={() => router.push(`/(app)/schedules/${item.room.schedule!.id}`)}
              />
            ))
>>>>>>> main
          )}
        </View>

        {/* ── 새 모임 만들기 버튼 ── */}
        <View style={s.createWrap}>
          <TouchableOpacity
            style={s.createBtn}
            onPress={() => router.push('/(app)/rooms/create')}
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle-outline" size={18} color="#fdfaff" />
            <Text style={s.createBtnText}>새 모임 만들기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────────── */

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#131316' },
  scroll:      { flex: 1 },
  scrollContent: { paddingBottom: 64 },

  /* 페이지 헤더 */
  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 4,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: '#bdc2ff',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f7f8f8',
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  pageSub: {
    fontSize: 13,
    color: '#8a8f98',
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 16,
  },

  /* 요약 배지 */
  statRow: { flexDirection: 'row', gap: 8, marginTop: 2, marginBottom: 20 },
  statChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: 'rgba(255,184,103,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,184,103,0.25)', borderRadius: 20,
  },
  statChipDone: {
    backgroundColor: 'rgba(39,166,68,0.1)',
    borderColor: 'rgba(39,166,68,0.25)',
  },
  statChipText: { fontSize: 12, fontWeight: '700', color: '#ffb867' },

  /* 필터 */
  filterRow: {
    paddingHorizontal: 20, paddingBottom: 20, gap: 8, flexDirection: 'row',
  },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: '#0f1011',
    borderWidth: 1, borderColor: '#23252a', borderRadius: 20,
    minHeight: 36,
  },
  filterChipActive: {
    backgroundColor: 'rgba(94,106,210,0.12)',
    borderColor: '#5e6ad2',
    borderWidth: 1.5,
  },
  filterChipText: { fontSize: 13, fontWeight: '500', color: '#8a8f98' },
  filterChipTextActive: { color: '#bdc2ff', fontWeight: '700' },
  filterCount: {
    minWidth: 20, height: 20, borderRadius: 10,
    backgroundColor: '#23252a', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  filterCountActive: { backgroundColor: 'rgba(94,106,210,0.3)' },
  filterCountText: { fontSize: 10, fontWeight: '700', color: '#8a8f98' },
  filterCountTextActive: { color: '#bdc2ff' },

  /* 목록 */
  list: { paddingHorizontal: 20, gap: 14 },

  /* 카드 */
  card: {
    backgroundColor: '#0f1011',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#23252a',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  cardDone: { opacity: 0.65, borderColor: '#1c1b1f' },

  /* 왼쪽 액센트 바 */
  accentBar: { width: 3, alignSelf: 'stretch' },

  /* 카드 내부 래퍼 (액센트 바 제외) */
  cardInner: { flex: 1 },

  cardTop: {
    flex: 1,
    padding: 16,
    paddingLeft: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTopLeft: { flex: 1, marginRight: 8 },

  /* badge */
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: 6, borderWidth: 1,
    alignSelf: 'flex-start', marginBottom: 9,
  },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.1 },

  /* room name */
  roomName: {
    fontSize: 17, fontWeight: '700', color: '#f7f8f8',
    letterSpacing: -0.3, marginBottom: 8, lineHeight: 22,
  },
  roomNameDone: { color: '#454652' },

  /* meta row */
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  catIconBox: {
    width: 24, height: 24, borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
  },
  categoryLabel: { fontSize: 12, color: '#8a8f98', fontWeight: '500' },
  hostBadge: {
    paddingHorizontal: 7, paddingVertical: 2,
    backgroundColor: 'rgba(94,106,210,0.18)',
    borderRadius: 4, marginLeft: 4,
    borderWidth: 1, borderColor: 'rgba(94,106,210,0.3)',
  },
  hostBadgeText: { fontSize: 10, fontWeight: '700', color: '#bdc2ff', letterSpacing: 0.2 },

  divider: { height: 1, backgroundColor: '#1c1b1f', marginLeft: 14 },

  /* card bottom */
  cardBottom: {
<<<<<<< HEAD
    flexDirection: 'row', alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 13,
  },
  codeBlock: { flex: 1, marginRight: 12 },
  scheduleInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  scheduleInfoText: { fontSize: 11, fontWeight: '600', color: '#27a644' },
=======
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 13,
  },
  codeBlock: { flex: 1 },
>>>>>>> main
  codeLabel: {
    fontSize: 10, fontWeight: '600', color: '#454652',
    letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 4,
  },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  codeText: {
    fontSize: 15, fontWeight: '700', color: '#f7f8f8',
    letterSpacing: 1.5, fontVariant: ['tabular-nums'],
  },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6, borderWidth: 1,
    backgroundColor: 'rgba(189,194,255,0.06)',
    borderColor: 'rgba(189,194,255,0.15)',
    minHeight: 28,
  },
  copyBtnDone: {
    backgroundColor: 'rgba(39,166,68,0.08)',
    borderColor: 'rgba(39,166,68,0.25)',
  },
  copyText: { fontSize: 11, fontWeight: '600', color: '#bdc2ff' },
  copyTextDone: { color: '#27a644' },

  enterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#5e6ad2', borderRadius: 10,
<<<<<<< HEAD
    minHeight: 40, flexShrink: 0,
=======
    minHeight: 40,
>>>>>>> main
  },
  enterBtnDone: {
    backgroundColor: 'transparent',
    borderWidth: 1, borderColor: '#34343a',
  },
  enterBtnText: { fontSize: 13, fontWeight: '700', color: '#fdfaff' },
  enterBtnTextDone: { color: '#8a8f98', fontWeight: '600' },

  /* empty */
  empty: {
    backgroundColor: '#0f1011', borderRadius: 16,
    borderWidth: 1, borderColor: '#23252a',
    alignItems: 'center', paddingVertical: 56, paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16, fontWeight: '600', color: '#d0d6e0',
    marginBottom: 6, textAlign: 'center', letterSpacing: -0.2,
  },
  emptyText: { fontSize: 13, color: '#8a8f98', textAlign: 'center', lineHeight: 20 },

  /* create button */
  createWrap: { paddingHorizontal: 20, marginTop: 24 },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 54,
    backgroundColor: 'rgba(94,106,210,0.06)',
    borderWidth: 1, borderColor: 'rgba(94,106,210,0.2)',
    borderRadius: 14,
  },
  createBtnText: { fontSize: 14, fontWeight: '600', color: '#bdc2ff' },

  /* shared */
  dot: { width: 6, height: 6, borderRadius: 3 },
<<<<<<< HEAD

  /* 선택 모드 */
  selectBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#18191a', borderBottomWidth: 1, borderBottomColor: '#23252a',
  },
  selectBarText: { fontSize: 14, fontWeight: '600', color: '#f7f8f8' },
  selectDeleteText: { fontSize: 14, fontWeight: '600', color: '#ff6b6b' },
  selectOverlay: {
    position: 'absolute', top: 12, right: 12, zIndex: 10,
  },
  selectCheck: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: '#454652',
    backgroundColor: 'transparent',
    alignItems: 'center', justifyContent: 'center',
  },
  selectCheckActive: {
    backgroundColor: '#5e6ad2', borderColor: '#5e6ad2',
  },
=======
>>>>>>> main
});
