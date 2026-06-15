import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Pressable, Alert, Modal, ActivityIndicator,
  StatusBar, Platform, Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import WebView from 'react-native-webview';
import * as Calendar from 'expo-calendar';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { formatDateTime, InitialAvatar } from '@/lib/scheduleUtils';

const KAKAO_MAP_KEY = process.env.EXPO_PUBLIC_KAKAO_MAP_KEY ?? '';

function kakaoMapHtml(lat: number, lng: number, name: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><style>*{margin:0;padding:0}html,body,#map{width:100%;height:100%}</style></head><body><div id="map"></div><script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}"></script><script>var map=new kakao.maps.Map(document.getElementById('map'),{center:new kakao.maps.LatLng(${lat},${lng}),level:4});var marker=new kakao.maps.Marker({map:map,position:new kakao.maps.LatLng(${lat},${lng})});var info=new kakao.maps.InfoWindow({content:'<div style="padding:5px 10px;font-size:12px;white-space:nowrap">${name.replace(/'/g, "\\'")}</div>'});info.open(map,marker);</script></body></html>`;
}

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
  lat: number;
  lng: number;
  memo: string | null;
  isCreator: boolean;
  myStatus: AttendanceStatus;
  participants: Participant[];
};

/* ── Helpers ─────────────────────────────────────────────────────────── */

const ATTENDANCE: Record<AttendanceStatus, { label: string; color: string; bg: string }> = {
  accepted: { label: '참석',  color: '#27a644', bg: 'rgba(39,166,68,0.12)' },
  declined: { label: '불참',  color: '#ffb4ab', bg: 'rgba(255,180,171,0.12)' },
  pending:  { label: '미응답', color: '#8a8f98', bg: 'rgba(138,143,152,0.12)' },
};

/* ── NavHeader ─────────────────────────────────────────────────────────── */

function NavHeader({ initial, profileImage, onBack, onMore }: { initial: string; profileImage?: string | null; onBack: () => void; onMore: () => void }) {
  return (
    <View style={nav.wrap}>
      <TouchableOpacity onPress={onBack} style={nav.btn} hitSlop={8}>
        <Ionicons name="chevron-back" size={22} color="#c6c5d5" />
      </TouchableOpacity>
      <Text style={nav.logo}>Clue<Text style={nav.accent}>Pot</Text></Text>
      <TouchableOpacity onPress={onMore} style={nav.btn} hitSlop={8}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={nav.avatar} />
        ) : (
          <View style={nav.avatarFallback}>
            <Text style={nav.avatarText}>{initial}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const nav = StyleSheet.create({
  wrap:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderBottomColor: '#23252a', backgroundColor: '#131316' },
  btn:          { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  logo:         { fontSize: 20, fontWeight: '700', color: '#f7f8f8', letterSpacing: -0.3 },
  accent:       { color: '#bdc2ff' },
  avatar:       { width: 30, height: 30, borderRadius: 15 },
  avatarFallback: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#5e6ad2', alignItems: 'center', justifyContent: 'center' },
  avatarText:   { fontSize: 12, fontWeight: '700', color: '#fdfaff' },
});

/* ── ScheduleDetailScreen ──────────────────────────────────────────────── */

export default function ScheduleDetailScreen() {
  const { id }   = useLocalSearchParams<{ id: string }>();
  const router   = useRouter();
  const nickname     = useAuthStore((s) => s.user?.nickname ?? '?');
  const profileImage = useAuthStore((s) => s.user?.profileImage ?? null);
  const initial      = nickname[0].toUpperCase();

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
      Alert.alert('오류', '일정을 불러올 수 없어요.', [{ text: '확인', onPress: () => router.back() }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleRsvp(status: 'accepted' | 'declined') {
    if (!schedule) return;
    setRsvpLoading(true);
    try {
      await api.patch(`/schedules/${id}/rsvp`, { status });
      setSchedule((prev) => prev ? {
        ...prev,
        myStatus: status,
        participants: prev.participants.map((p) => p.isMe ? { ...p, status } : p),
      } : prev);
    } catch {
      Alert.alert('오류', '응답을 저장하지 못했어요.');
    } finally {
      setRsvpLoading(false);
    }
  }

  async function handleAddToCalendar() {
    if (!schedule) return;
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '설정에서 캘린더 접근을 허용해주세요.');
        return;
      }

      let calendarId: string;
      if (Platform.OS === 'ios') {
        const defaultCalendar = await Calendar.getDefaultCalendarAsync();
        calendarId = defaultCalendar.id;
      } else {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const writable = calendars.find((c) => c.allowsModifications);
        if (!writable) {
          Alert.alert('오류', '사용 가능한 캘린더가 없어요.');
          return;
        }
        calendarId = writable.id;
      }

      const startDate = new Date(schedule.scheduledAt);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

      await Calendar.createEventAsync(calendarId, {
        title: schedule.title,
        startDate,
        endDate,
        location: `${schedule.placeName} ${schedule.placeAddress}`,
        notes: schedule.memo ?? undefined,
        timeZone: 'Asia/Seoul',
      });

      Alert.alert('완료', '캘린더에 일정이 추가됐어요.');
    } catch {
      Alert.alert('오류', '캘린더 추가에 실패했어요.');
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
        <NavHeader initial={initial} profileImage={profileImage} onBack={() => router.back()} onMore={() => setMoreOpen(true)} />
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
      <NavHeader initial={initial} profileImage={profileImage} onBack={() => router.back()} onMore={() => setMoreOpen(true)} />

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
          {Platform.OS !== 'web' ? (
            <WebView
              key={`${schedule.lat}-${schedule.lng}`}
              source={{ html: kakaoMapHtml(schedule.lat, schedule.lng, schedule.placeName) }}
              style={s.map}
              originWhitelist={['*']}
              javaScriptEnabled
              domStorageEnabled
              scrollEnabled={false}
            />
          ) : (
            <View style={[s.map, s.mapFallback]}>
              <Ionicons name="map-outline" size={32} color="#34343a" />
              <Text style={s.mapFallbackText}>지도는 앱에서 확인하세요</Text>
            </View>
          )}
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

        {/* ── 캘린더에 추가 ── */}
        <View style={s.section}>
          <TouchableOpacity
            style={s.calendarBtn}
            onPress={handleAddToCalendar}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="기기 캘린더에 일정 추가"
          >
            <Ionicons name="calendar-outline" size={16} color="#bdc2ff" />
            <Text style={s.calendarBtnText}>캘린더에 추가</Text>
          </TouchableOpacity>
        </View>

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

  /* calendar */
  calendarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    backgroundColor: 'rgba(189,194,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(189,194,255,0.2)',
    borderRadius: 12,
  },
  calendarBtnText: { fontSize: 14, fontWeight: '600', color: '#bdc2ff' },

  /* map */
  map: { height: 200, borderRadius: 14, overflow: 'hidden' },
  mapFallback: { backgroundColor: '#0f1011', borderWidth: 1, borderColor: '#23252a', alignItems: 'center', justifyContent: 'center', gap: 8 },
  mapFallbackText: { fontSize: 13, color: '#454652' },

  /* shared */
  dot: { width: 6, height: 6, borderRadius: 3 },
});
