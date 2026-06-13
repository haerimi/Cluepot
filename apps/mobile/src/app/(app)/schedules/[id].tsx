import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Pressable, Alert, Modal, ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { formatDateTime, InitialAvatar } from '@/lib/scheduleUtils';

/* ── Types ─────────────────────────────────────────────────────────────── */

type AttendanceStatus = 'accepted' | 'declined' | 'pending';

type Participant = {
  id: string;
  userId: string;
  nickname: string;
  status: AttendanceStatus;
  isMe: boolean;
};

type ScheduleDetail = {
  id: string;
  title: string;
  scheduledAt: string;
  placeName: string;
  placeAddress: string;
  memo: string | null;
  isCreator: boolean;
  myStatus: AttendanceStatus;
  participants: Participant[];
};

/* ── Mock ─────────────────────────────────────────────────────────────── */

const MOCK: ScheduleDetail = {
  id: '1',
  title: '홍대 팀 회식',
  scheduledAt: new Date(Date.now() + 86400000 * 3).toISOString(),
  placeName: '스타벅스 홍대점',
  placeAddress: '서울 마포구 와우산로 12',
  memo: '지각하면 벌금 3000원 🙏',
  isCreator: true,
  myStatus: 'accepted',
  participants: [
    { id: 'p1', userId: 'u1', nickname: '나',    status: 'accepted', isMe: true  },
    { id: 'p2', userId: 'u2', nickname: '김철수', status: 'accepted', isMe: false },
    { id: 'p3', userId: 'u3', nickname: '이영희', status: 'pending',  isMe: false },
    { id: 'p4', userId: 'u4', nickname: '박지수', status: 'declined', isMe: false },
  ],
};

/* ── Helpers ─────────────────────────────────────────────────────────── */

const ATTENDANCE: Record<AttendanceStatus, { label: string; color: string; bg: string }> = {
  accepted: { label: '참석',  color: '#27a644', bg: 'rgba(39,166,68,0.12)' },
  declined: { label: '불참',  color: '#ffb4ab', bg: 'rgba(255,180,171,0.12)' },
  pending:  { label: '미응답', color: '#8a8f98', bg: 'rgba(138,143,152,0.12)' },
};

/* ── NavHeader ─────────────────────────────────────────────────────────── */

function NavHeader({ initial, onBack, onMore }: { initial: string; onBack: () => void; onMore: () => void }) {
  return (
    <View style={nav.wrap}>
      <TouchableOpacity onPress={onBack} style={nav.btn} hitSlop={8}>
        <Ionicons name="chevron-back" size={22} color="#c6c5d5" />
      </TouchableOpacity>
      <Text style={nav.logo}>Clue<Text style={nav.accent}>Pot</Text></Text>
      <TouchableOpacity onPress={onMore} style={nav.btn} hitSlop={8}>
        <Ionicons name="ellipsis-vertical" size={20} color="#8a8f98" />
      </TouchableOpacity>
    </View>
  );
}

const nav = StyleSheet.create({
  wrap:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderBottomColor: '#23252a', backgroundColor: '#131316' },
  btn:    { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  logo:   { fontSize: 20, fontWeight: '700', color: '#f7f8f8', letterSpacing: -0.3 },
  accent: { color: '#bdc2ff' },
});

/* ── MapPlaceholder ─────────────────────────────────────────────────────── */

function MapPlaceholder({ placeName }: { placeName: string }) {
  return (
    <View style={mp.wrap}>
      {/* road grid */}
      {[30, 70, 110, 150].map((top) => (
        <View key={`h${top}`} style={[mp.hLine, { top }]} />
      ))}
      {[40, 90, 140, 190].map((left) => (
        <View key={`v${left}`} style={[mp.vLine, { left }]} />
      ))}
      {/* blocks */}
      <View style={[mp.block, { top: 10, left: 10, width: 55, height: 45 }]} />
      <View style={[mp.block, { top: 10, left: 100, width: 70, height: 45 }]} />
      <View style={[mp.block, { top: 80, left: 10, width: 45, height: 55 }]} />
      <View style={[mp.block, { top: 80, left: 110, width: 55, height: 55 }]} />
      <View style={[mp.block, { top: 155, left: 50, width: 80, height: 40 }]} />
      {/* pin */}
      <View style={mp.pinWrap}>
        <View style={mp.pinCircle}>
          <Ionicons name="location" size={16} color="#fdfaff" />
        </View>
        <View style={mp.pinTail} />
      </View>
      {/* label */}
      <View style={mp.labelWrap}>
        <Text style={mp.labelText} numberOfLines={1}>{placeName}</Text>
      </View>
    </View>
  );
}

const mp = StyleSheet.create({
  wrap:      { height: 200, backgroundColor: '#0f1011', borderRadius: 14, borderWidth: 1, borderColor: '#23252a', overflow: 'hidden', position: 'relative', alignItems: 'center', justifyContent: 'center' },
  hLine:     { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#1c1b1f' },
  vLine:     { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: '#1c1b1f' },
  block:     { position: 'absolute', backgroundColor: '#141516', borderRadius: 4 },
  pinWrap:   { alignItems: 'center', zIndex: 10 },
  pinCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#5e6ad2', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fdfaff' },
  pinTail:   { width: 2, height: 8, backgroundColor: '#5e6ad2', marginTop: -1 },
  labelWrap: { position: 'absolute', bottom: 12, left: 16, right: 16, backgroundColor: '#141516', borderRadius: 8, borderWidth: 1, borderColor: '#34343a', paddingHorizontal: 10, paddingVertical: 6 },
  labelText: { fontSize: 12, fontWeight: '600', color: '#f7f8f8', textAlign: 'center' },
});

/* ── ScheduleDetailScreen ──────────────────────────────────────────────── */

export default function ScheduleDetailScreen() {
  const { id }   = useLocalSearchParams<{ id: string }>();
  const router   = useRouter();
  const nickname = useAuthStore((s) => s.user?.nickname ?? '?');
  const initial  = nickname[0].toUpperCase();

  const [schedule, setSchedule] = useState<ScheduleDetail | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  useEffect(() => { fetchSchedule(); }, [id]);

  async function fetchSchedule() {
    setLoading(true);
    try {
      const { data } = await api.get(`/schedules/${id}`);
      setSchedule(data);
    } catch {
      // fallback to mock while API is not ready
      setSchedule(MOCK);
    } finally {
      setLoading(false);
    }
  }

  async function handleRsvp(status: 'accepted' | 'declined') {
    if (!schedule) return;
    setRsvpLoading(true);
    try {
      await api.patch(`/schedules/${id}/rsvp`, { status });
      setSchedule((prev) => prev ? { ...prev, myStatus: status } : prev);
    } catch {
      Alert.alert('오류', '응답을 저장하지 못했어요.');
    } finally {
      setRsvpLoading(false);
    }
  }

  async function handleDelete() {
    Alert.alert('일정 삭제', '이 일정을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/schedules/${id}`);
            router.back();
          } catch {
            Alert.alert('오류', '삭제하지 못했어요.');
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor="#131316" />
        <NavHeader initial={initial} onBack={() => router.back()} onMore={() => {}} />
        <View style={s.loadingWrap}>
          <ActivityIndicator color="#bdc2ff" />
        </View>
      </View>
    );
  }

  if (!schedule) return null;

  const { date, time } = formatDateTime(schedule.scheduledAt);
  const accepted = schedule.participants.filter((p) => p.status === 'accepted').length;
  const total    = schedule.participants.length;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#131316" />
      <NavHeader initial={initial} onBack={() => router.back()} onMore={() => setMoreOpen(true)} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 상태 배지 + 제목 ── */}
        <View style={s.titleSection}>
          <View style={s.confirmedBadge}>
            <View style={[s.dot, { backgroundColor: '#27a644' }]} />
            <Text style={s.confirmedBadgeText}>일정 확정됨</Text>
          </View>
          <Text style={s.title}>{schedule.title}</Text>
          <Text style={s.participantSummary}>
            {accepted}/{total}명 참석 확정
          </Text>
        </View>

        {/* ── 날짜/시간/장소 카드 ── */}
        <View style={s.infoCard}>
          <View style={s.infoRow}>
            <View style={s.infoIconWrap}>
              <Ionicons name="calendar-outline" size={16} color="#bdc2ff" />
            </View>
            <View>
              <Text style={s.infoLabel}>날짜</Text>
              <Text style={s.infoValue}>{date}</Text>
            </View>
          </View>

          <View style={s.infoDivider} />

          <View style={s.infoRow}>
            <View style={s.infoIconWrap}>
              <Ionicons name="time-outline" size={16} color="#bdc2ff" />
            </View>
            <View>
              <Text style={s.infoLabel}>시간</Text>
              <Text style={s.infoValue}>{time}</Text>
            </View>
          </View>

          <View style={s.infoDivider} />

          <View style={s.infoRow}>
            <View style={s.infoIconWrap}>
              <Ionicons name="location-outline" size={16} color="#bdc2ff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.infoLabel}>장소</Text>
              <Text style={s.infoValue}>{schedule.placeName}</Text>
              <Text style={s.infoSub}>{schedule.placeAddress}</Text>
            </View>
          </View>
        </View>

        {/* ── 지도 ── */}
        <View style={s.section}>
          <MapPlaceholder placeName={schedule.placeName} />
        </View>

        {/* ── 참가자 ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>참가자 {total}명</Text>
          <View style={s.participantList}>
            {schedule.participants.map((p, idx) => {
              const att = ATTENDANCE[p.status];
              const isLast = idx === schedule.participants.length - 1;
              return (
                <View key={p.id} style={[s.participantRow, !isLast && s.participantRowBorder]}>
                  <InitialAvatar name={p.nickname} size={36} />
                  <View style={s.participantInfo}>
                    <Text style={s.participantName}>
                      {p.nickname}{p.isMe ? ' (나)' : ''}
                    </Text>
                  </View>
                  <View style={[s.attBadge, { backgroundColor: att.bg }]}>
                    <Text style={[s.attBadgeText, { color: att.color }]}>{att.label}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── 메모 ── */}
        {schedule.memo && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>메모</Text>
            <View style={s.memoBox}>
              <Ionicons name="document-text-outline" size={14} color="#8a8f98" style={{ marginTop: 1 }} />
              <Text style={s.memoText}>{schedule.memo}</Text>
            </View>
          </View>
        )}

        {/* ── 내 참석 응답 (비호스트) ── */}
        {!schedule.isCreator && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>내 참석 응답</Text>
            <View style={s.rsvpRow}>
              <Pressable
                style={({ pressed }) => [
                  s.rsvpBtn,
                  schedule.myStatus === 'accepted' && s.rsvpBtnAccepted,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => handleRsvp('accepted')}
                disabled={rsvpLoading}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={16}
                  color={schedule.myStatus === 'accepted' ? '#27a644' : '#8a8f98'}
                />
                <Text style={[s.rsvpBtnText, schedule.myStatus === 'accepted' && s.rsvpBtnTextAccepted]}>
                  참석
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  s.rsvpBtn,
                  schedule.myStatus === 'declined' && s.rsvpBtnDeclined,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => handleRsvp('declined')}
                disabled={rsvpLoading}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={16}
                  color={schedule.myStatus === 'declined' ? '#ffb4ab' : '#8a8f98'}
                />
                <Text style={[s.rsvpBtnText, schedule.myStatus === 'declined' && s.rsvpBtnTextDeclined]}>
                  불참
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── 더보기 바텀시트 ── */}
      <Modal visible={moreOpen} transparent animationType="slide" onRequestClose={() => setMoreOpen(false)}>
        <Pressable style={s.modalOverlay} onPress={() => setMoreOpen(false)} />
        <View style={s.bottomSheet}>
          <View style={s.sheetHandle} />
          <TouchableOpacity
            style={s.sheetItem}
            onPress={() => { setMoreOpen(false); router.push(`/(app)/calendar/${id}`); }}
          >
            <Ionicons name="create-outline" size={20} color="#d0d6e0" />
            <Text style={s.sheetItemText}>일정 수정</Text>
          </TouchableOpacity>
          <View style={s.sheetDivider} />
          <TouchableOpacity
            style={s.sheetItem}
            onPress={() => { setMoreOpen(false); handleDelete(); }}
          >
            <Ionicons name="trash-outline" size={20} color="#ffb4ab" />
            <Text style={[s.sheetItemText, { color: '#ffb4ab' }]}>일정 삭제</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────────── */

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#131316' },
  scroll:      { flex: 1 },
  scrollContent: { paddingBottom: 48 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  /* title section */
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(39,166,68,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(39,166,68,0.25)',
    marginBottom: 14,
  },
  confirmedBadgeText: { fontSize: 12, fontWeight: '700', color: '#27a644', letterSpacing: 0.1 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f7f8f8',
    letterSpacing: -0.6,
    marginBottom: 8,
    lineHeight: 34,
  },
  participantSummary: {
    fontSize: 13,
    color: '#8a8f98',
    fontWeight: '500',
  },

  /* info card */
  infoCard: {
    marginHorizontal: 20,
    backgroundColor: '#0f1011',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#23252a',
    overflow: 'hidden',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(94,106,210,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(94,106,210,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  infoLabel: { fontSize: 10, fontWeight: '700', color: '#454652', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8 },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#f7f8f8', letterSpacing: -0.2 },
  infoSub:   { fontSize: 12, color: '#8a8f98', marginTop: 3, lineHeight: 17 },
  infoDivider: { height: 1, backgroundColor: '#1c1b1f', marginLeft: 68 },

  /* section */
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#454652',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },

  /* participants */
  participantList: {
    backgroundColor: '#0f1011',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#23252a',
    overflow: 'hidden',
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  participantRowBorder: { borderBottomWidth: 1, borderBottomColor: '#1c1b1f' },
  participantInfo: { flex: 1 },
  participantName: { fontSize: 14, fontWeight: '600', color: '#f7f8f8', letterSpacing: -0.1 },
  attBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  attBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.1 },

  /* memo */
  memoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#0f1011',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#23252a',
    padding: 16,
  },
  memoText: { flex: 1, fontSize: 14, color: '#d0d6e0', lineHeight: 22, fontWeight: '400' },

  /* rsvp */
  rsvpRow: { flexDirection: 'row', gap: 10 },
  rsvpBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 52,
    backgroundColor: '#0f1011',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#23252a',
  },
  rsvpBtnAccepted: { borderColor: '#27a644', borderWidth: 1.5, backgroundColor: 'rgba(39,166,68,0.07)' },
  rsvpBtnDeclined: { borderColor: '#ffb4ab', borderWidth: 1.5, backgroundColor: 'rgba(255,180,171,0.07)' },
  rsvpBtnText: { fontSize: 14, fontWeight: '600', color: '#8a8f98' },
  rsvpBtnTextAccepted: { color: '#27a644', fontWeight: '700' },
  rsvpBtnTextDeclined: { color: '#ffb4ab', fontWeight: '700' },

  /* bottom sheet */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(1,1,2,0.65)' },
  bottomSheet: {
    backgroundColor: '#0f1011',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#34343a',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 48,
  },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#34343a', borderRadius: 2, alignSelf: 'center', marginBottom: 24 },
  sheetItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, minHeight: 52 },
  sheetItemText: { fontSize: 15, fontWeight: '500', color: '#d0d6e0' },
  sheetDivider: { height: 1, backgroundColor: '#1c1b1f' },

  /* shared */
  dot: { width: 6, height: 6, borderRadius: 3 },
});
