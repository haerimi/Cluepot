import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal, TextInput, Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth';

// ─── NavHeader ────────────────────────────────────────────────────────────────

function NavHeader({ initial, onBack }: { initial: string; onBack: () => void }) {
  return (
    <View style={navHdr.wrap}>
      <TouchableOpacity onPress={onBack} style={navHdr.backBtn} hitSlop={8}>
        <Ionicons name="chevron-back" size={22} color="#c6c5d5" />
      </TouchableOpacity>
      <Text style={navHdr.logo}>Clue<Text style={navHdr.accent}>Pot</Text></Text>
      <View style={navHdr.avatar}>
        <Text style={navHdr.avatarText}>{initial}</Text>
      </View>
    </View>
  );
}
const navHdr = StyleSheet.create({
  wrap:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderBottomColor: '#23252a', backgroundColor: '#131316' },
  backBtn:    { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  logo:       { fontSize: 20, fontWeight: '700', color: '#f7f8f8', letterSpacing: -0.3 },
  accent:     { color: '#bdc2ff' },
  avatar:     { width: 30, height: 30, borderRadius: 15, backgroundColor: '#5e6ad2', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#34343a' },
  avatarText: { fontSize: 12, fontWeight: '700', color: '#fdfaff' },
});

// ─── Types ────────────────────────────────────────────────────────────────────

type AttendanceStatus = 'accepted' | 'declined' | 'pending';

type Participant = {
  id: string;
  userId: string;
  nickname: string;
  profileImage: string | null;
  status: AttendanceStatus;
  isMe: boolean;
};

type ScheduleDetail = {
  id: string;
  title: string;
  scheduledAt: string;
  placeName: string;
  placeAddress: string;
  placeLatitude: number;
  placeLongitude: number;
  memo: string | null;
  isCreator: boolean;
  myStatus: AttendanceStatus;
  participants: Participant[];
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK: ScheduleDetail = {
  id: '1',
  title: '홍대 팀 회식',
  scheduledAt: new Date(Date.now() + 86400000 * 3).toISOString(),
  placeName: '홍대 고기집 A',
  placeAddress: '서울 마포구 와우산로 12',
  placeLatitude: 37.5519,
  placeLongitude: 126.9245,
  memo: '지각하면 벌금 3000원',
  isCreator: true,
  myStatus: 'accepted',
  participants: [
    { id: 'p1', userId: 'u1', nickname: '나',    profileImage: null, status: 'accepted', isMe: true  },
    { id: 'p2', userId: 'u2', nickname: '김철수', profileImage: null, status: 'accepted', isMe: false },
    { id: 'p3', userId: 'u3', nickname: '이영희', profileImage: null, status: 'pending',  isMe: false },
    { id: 'p4', userId: 'u4', nickname: '박지수', profileImage: null, status: 'declined', isMe: false },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const month   = d.getMonth() + 1;
  const day     = d.getDate();
  const weekday = weekdays[d.getDay()];
  const h = d.getHours();
  const m = d.getMinutes();
  const period = h < 12 ? '오전' : '오후';
  const hour   = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return {
    date: `${month}월 ${day}일 (${weekday})`,
    time: `${period} ${hour}:${String(m).padStart(2, '0')}`,
  };
}

function formatDateDisplay(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const wd = weekdays[new Date(y, m - 1, d).getDay()];
  return `${m}월 ${d}일 (${wd})`;
}

function formatTimeDisplay(timeStr: string) {
  const [h, min] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(min)) return timeStr;
  const period = h < 12 ? '오전' : '오후';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${period} ${hour12}:${String(min).padStart(2, '0')}`;
}

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; bg: string; color: string }> = {
  accepted: { label: '수락', bg: '#1a2b1e', color: '#27a644' },
  declined: { label: '거절', bg: '#2b1a1a', color: '#ffb4ab' },
  pending:  { label: '보류', bg: '#23252a', color: '#8a8f98' },
};

// ─── InitialAvatar ────────────────────────────────────────────────────────────

function InitialAvatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <View style={[av.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[av.text, { fontSize: size * 0.4 }]}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}
const av = StyleSheet.create({
  wrap: { backgroundColor: '#5e6ad2', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#34343a' },
  text: { color: '#fdfaff', fontWeight: '700' },
});

// ─── MapBackground ────────────────────────────────────────────────────────────

function MapBackground() {
  const GRID = 12;
  const lines = Array.from({ length: GRID }, (_, i) => i);
  const blocks = [
    { top: '12%', left: '8%',  w: 60, h: 38 },
    { top: '18%', left: '62%', w: 80, h: 48 },
    { top: '52%', left: '4%',  w: 50, h: 58 },
    { top: '58%', left: '68%', w: 68, h: 44 },
    { top: '28%', left: '32%', w: 44, h: 34 },
    { top: '72%', left: '28%', w: 88, h: 38 },
    { top: '8%',  left: '42%', w: 52, h: 28 },
    { top: '42%', left: '48%', w: 40, h: 52 },
    { top: '35%', left: '72%', w: 36, h: 42 },
    { top: '65%', left: '14%', w: 64, h: 32 },
  ];
  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={mapS.grid}>
        {lines.map(i => (
          <View key={`h${i}`} style={[mapS.hLine, { top: `${(i / (GRID - 1)) * 100}%` as any }]} />
        ))}
        {lines.map(i => (
          <View key={`v${i}`} style={[mapS.vLine, { left: `${(i / (GRID - 1)) * 100}%` as any }]} />
        ))}
        {blocks.map((b, i) => (
          <View key={i} style={[mapS.block, { top: b.top as any, left: b.left as any, width: b.w, height: b.h }]} />
        ))}
      </View>
      <View style={mapS.fadeOverlay} />
    </View>
  );
}
const mapS = StyleSheet.create({
  grid:        { ...StyleSheet.absoluteFillObject, opacity: 0.3 },
  hLine:       { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#34343a' },
  vLine:       { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: '#34343a' },
  block:       { position: 'absolute', backgroundColor: '#18191a', borderWidth: 1, borderColor: '#23252a', borderRadius: 2 },
  fadeOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(19,19,22,0.55)' },
});

// ─── PulsePin ─────────────────────────────────────────────────────────────────

function PulsePin() {
  const scale   = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale,   { toValue: 2.2, duration: 1400, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0,   duration: 1400, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.7, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, []);

  return (
    <View style={pinS.wrap}>
      <Animated.View style={[pinS.ring, { transform: [{ scale }], opacity }]} />
      <View style={pinS.pin}>
        <Ionicons name="location" size={10} color="#131316" />
      </View>
    </View>
  );
}
const pinS = StyleSheet.create({
  wrap: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(189,194,255,0.2)' },
  pin:  { width: 26, height: 26, borderRadius: 13, backgroundColor: '#bdc2ff', borderWidth: 3, borderColor: '#131316', alignItems: 'center', justifyContent: 'center' },
});

// ─── DatePickerModal ──────────────────────────────────────────────────────────

function DatePickerModal({ visible, initial, onConfirm, onClose }: {
  visible: boolean; initial: string;
  onConfirm: (d: string) => void; onClose: () => void;
}) {
  const now = new Date();
  const parts = initial ? initial.split('-') : [];
  const [year,  setYear]  = useState(parts[0] ?? String(now.getFullYear()));
  const [month, setMonth] = useState(parts[1] ?? String(now.getMonth() + 1).padStart(2, '0'));
  const [day,   setDay]   = useState(parts[2] ?? String(now.getDate()).padStart(2, '0'));

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.modalOverlay}>
        <View style={s.modalSheet}>
          <View style={s.modalHandle} />
          <Text style={s.modalTitle}>날짜 선택</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 2 }}>
              <Text style={s.modalFieldLabel}>연도</Text>
              <TextInput style={s.modalInput} value={year} onChangeText={setYear} keyboardType="number-pad" maxLength={4} placeholder="2025" placeholderTextColor="#454652" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.modalFieldLabel}>월</Text>
              <TextInput style={s.modalInput} value={month} onChangeText={v => setMonth(v.replace(/\D/g, ''))} keyboardType="number-pad" maxLength={2} placeholder="06" placeholderTextColor="#454652" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.modalFieldLabel}>일</Text>
              <TextInput style={s.modalInput} value={day} onChangeText={v => setDay(v.replace(/\D/g, ''))} keyboardType="number-pad" maxLength={2} placeholder="15" placeholderTextColor="#454652" />
            </View>
          </View>
          <View style={s.modalActions}>
            <TouchableOpacity style={s.modalCancelBtn} onPress={onClose}><Text style={s.modalCancelText}>취소</Text></TouchableOpacity>
            <TouchableOpacity style={s.modalSaveBtn} onPress={() => { onConfirm(`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`); onClose(); }}>
              <Text style={s.modalSaveText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── TimePickerModal ──────────────────────────────────────────────────────────

function TimePickerModal({ visible, initial, onConfirm, onClose }: {
  visible: boolean; initial: string;
  onConfirm: (t: string) => void; onClose: () => void;
}) {
  const parts = initial ? initial.split(':') : [];
  const initH = parseInt(parts[0] ?? '12', 10);
  const [ampm,   setAmpm]   = useState<'AM'|'PM'>(initH < 12 ? 'AM' : 'PM');
  const [hour,   setHour]   = useState(String(initH === 0 ? 12 : initH > 12 ? initH - 12 : initH));
  const [minute, setMinute] = useState(parts[1] ?? '00');

  function handleConfirm() {
    let h = parseInt(hour, 10);
    if (ampm === 'AM' && h === 12) h = 0;
    if (ampm === 'PM' && h !== 12) h += 12;
    onConfirm(`${String(h).padStart(2,'0')}:${minute.padStart(2,'0')}`);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.modalOverlay}>
        <View style={s.modalSheet}>
          <View style={s.modalHandle} />
          <Text style={s.modalTitle}>시간 선택</Text>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-end' }}>
            <View style={{ gap: 6 }}>
              <Text style={s.modalFieldLabel}>오전/오후</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {(['AM', 'PM'] as const).map(v => (
                  <TouchableOpacity key={v} onPress={() => setAmpm(v)} style={[s.ampmBtn, ampm === v && s.ampmBtnActive]}>
                    <Text style={[s.ampmBtnText, ampm === v && s.ampmBtnTextActive]}>{v === 'AM' ? '오전' : '오후'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.modalFieldLabel}>시</Text>
              <TextInput style={s.modalInput} value={hour} onChangeText={v => setHour(v.replace(/\D/g,''))} keyboardType="number-pad" maxLength={2} placeholder="12" placeholderTextColor="#454652" />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#8a8f98', paddingBottom: 14 }}>:</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.modalFieldLabel}>분</Text>
              <TextInput style={s.modalInput} value={minute} onChangeText={v => setMinute(v.replace(/\D/g,''))} keyboardType="number-pad" maxLength={2} placeholder="00" placeholderTextColor="#454652" />
            </View>
          </View>
          <View style={s.quickRow}>
            {['12:00','12:30','13:00','18:00','19:00','20:00'].map(t => (
              <TouchableOpacity key={t} style={s.quickChip} onPress={() => {
                const [h, m] = t.split(':').map(Number);
                setAmpm(h < 12 ? 'AM' : 'PM');
                setHour(String(h === 0 ? 12 : h > 12 ? h - 12 : h));
                setMinute(String(m).padStart(2, '0'));
              }}>
                <Text style={s.quickChipText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.modalActions}>
            <TouchableOpacity style={s.modalCancelBtn} onPress={onClose}><Text style={s.modalCancelText}>취소</Text></TouchableOpacity>
            <TouchableOpacity style={s.modalSaveBtn} onPress={handleConfirm}><Text style={s.modalSaveText}>확인</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Confirmed Screen ─────────────────────────────────────────────────────────

function ConfirmedScreen({ schedule, editTitle, editDate, editTime }: {
  schedule: ScheduleDetail;
  editTitle: string;
  editDate: string;
  editTime: string;
}) {
  const router = useRouter();
  const { date, time } = formatDateTime(schedule.scheduledAt);
  const displayDate = editDate ? formatDateDisplay(editDate) : date;
  const displayTime = editTime ? formatTimeDisplay(editTime) : time;
  const shown = schedule.participants.slice(0, 4);
  const extra = schedule.participants.length - shown.length;
  const names = shown.map(p => p.nickname).join(', ') + (extra > 0 ? ` 외 ${extra}명` : '');

  return (
    <View style={cs.container}>
      <MapBackground />

      <ScrollView
        contentContainerStyle={cs.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Success header */}
        <View style={cs.heroSection}>
          <View style={cs.checkBg}>
            <Ionicons name="checkmark-circle" size={32} color="#27a644" />
          </View>
          <Text style={cs.heroTitle}>플랜이 확정됐어요!</Text>
          <Text style={cs.heroSub}>모든 참가자에게 알림이 발송됩니다.</Text>
        </View>

        {/* Glass card */}
        <View style={cs.card}>
          {/* Meeting name */}
          <View style={cs.section}>
            <Text style={cs.label}>MEETING NAME</Text>
            <Text style={cs.meetingName}>{editTitle || schedule.title}</Text>
          </View>

          {/* Date/Time + Location */}
          <View style={[cs.section, cs.row, cs.borderTop]}>
            <View style={{ flex: 1 }}>
              <Text style={cs.label}>날짜 · 시간</Text>
              <View style={cs.infoRow}>
                <Ionicons name="calendar-outline" size={13} color="#bdc2ff" />
                <Text style={cs.infoVal}>{displayDate}</Text>
              </View>
              <View style={cs.infoRow}>
                <Ionicons name="time-outline" size={13} color="#8a8f98" />
                <Text style={[cs.infoVal, { color: '#d0d6e0' }]}>{displayTime}</Text>
              </View>
            </View>
            <View style={cs.dividerV} />
            <View style={{ flex: 1 }}>
              <Text style={cs.label}>장소</Text>
              <View style={cs.infoRow}>
                <Ionicons name="location-outline" size={13} color="#8a8f98" />
                <Text style={cs.infoVal} numberOfLines={1}>{schedule.placeName}</Text>
              </View>
              <Text style={cs.infoSub}>{schedule.placeAddress}</Text>
            </View>
          </View>

          {/* Participants */}
          <View style={[cs.section, cs.borderTop]}>
            <Text style={cs.label}>참가자</Text>
            <View style={cs.participantsRow}>
              <View style={{ flexDirection: 'row' }}>
                {shown.map((p, i) => (
                  <View key={p.id} style={{ marginLeft: i === 0 ? 0 : -10, zIndex: 10 - i }}>
                    <InitialAvatar name={p.nickname} size={34} />
                  </View>
                ))}
                {extra > 0 && (
                  <View style={[cs.extraBadge, { marginLeft: -10 }]}>
                    <Text style={cs.extraText}>+{extra}</Text>
                  </View>
                )}
              </View>
              <Text style={cs.participantsLabel} numberOfLines={1}>{names}</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={[cs.section, cs.borderTop, { gap: 10 }]}>
            <TouchableOpacity style={cs.primaryBtn} activeOpacity={0.8}>
              <Ionicons name="calendar-outline" size={17} color="#fdfaff" />
              <Text style={cs.primaryBtnText}>캘린더에 추가</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={cs.secondaryBtn}
                activeOpacity={0.8}
                onPress={() => router.push(`/(app)/schedules/${schedule.id}` as any)}
              >
                <Text style={cs.secondaryBtnText}>상세 보기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={cs.secondaryBtn}
                activeOpacity={0.8}
                onPress={() => router.replace('/(app)/home' as any)}
              >
                <Text style={cs.secondaryBtnText}>완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={cs.footnote}>확정 알림이 모든 참가자에게 발송됩니다.</Text>
      </ScrollView>
    </View>
  );
}

const cs = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#131316' },
  scroll:          { paddingHorizontal: 20, paddingTop: 72, paddingBottom: 48 },

  heroSection:     { alignItems: 'center', marginBottom: 28 },
  checkBg:         { width: 58, height: 58, borderRadius: 29, backgroundColor: 'rgba(39,166,68,0.12)', borderWidth: 1, borderColor: 'rgba(39,166,68,0.28)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  heroTitle:       { fontSize: 28, fontWeight: '700', color: '#f7f8f8', letterSpacing: -0.6, textAlign: 'center', marginBottom: 6 },
  heroSub:         { fontSize: 14, color: '#8a8f98', textAlign: 'center' },

  card:            { backgroundColor: 'rgba(15,16,17,0.9)', borderWidth: 1.5, borderColor: '#34343a', borderRadius: 16, overflow: 'hidden' },
  section:         { padding: 18 },
  row:             { flexDirection: 'row', gap: 14 },
  borderTop:       { borderTopWidth: 1, borderTopColor: '#23252a' },
  dividerV:        { width: 1, backgroundColor: '#23252a', marginVertical: 2 },

  label:           { fontSize: 10, fontWeight: '700', color: '#d0d6e0', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 },
  meetingName:     { fontSize: 20, fontWeight: '600', color: '#f7f8f8', letterSpacing: -0.4 },

  infoRow:         { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 },
  infoVal:         { fontSize: 13, color: '#bdc2ff', fontWeight: '500', flex: 1 },
  infoSub:         { fontSize: 11, color: '#454652', marginLeft: 18, marginTop: -3 },

  participantsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  extraBadge:      { width: 34, height: 34, borderRadius: 17, backgroundColor: '#141516', borderWidth: 1, borderColor: '#34343a', alignItems: 'center', justifyContent: 'center' },
  extraText:       { fontSize: 10, fontWeight: '700', color: '#8a8f98' },
  participantsLabel:{ fontSize: 12, color: '#8a8f98', flex: 1 },

  primaryBtn:      { height: 50, backgroundColor: '#5e6ad2', borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(189,194,255,0.2)' },
  primaryBtnText:  { fontSize: 14, fontWeight: '700', color: '#fdfaff' },
  secondaryBtn:    { flex: 1, height: 44, backgroundColor: '#18191a', borderWidth: 1, borderColor: '#23252a', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  secondaryBtnText:{ fontSize: 13, fontWeight: '600', color: '#d0d6e0' },

  footnote:        { textAlign: 'center', fontSize: 11, color: '#454652', marginTop: 20 },
});

// ─── Main Screen (Step 3 of 3) ────────────────────────────────────────────────

export default function FinalizeScheduleScreen() {
  const { scheduleId } = useLocalSearchParams<{ scheduleId: string }>();
  const router  = useRouter();
  const user    = useAuthStore((s) => s.user);
  const initial = (user?.nickname?.[0] ?? user?.email?.[0] ?? '?').toUpperCase();

  const [schedule]  = useState<ScheduleDetail>(MOCK);
  const [confirmed, setConfirmed] = useState(false);

  const [editTitle, setEditTitle] = useState(MOCK.title);
  const [editDate,  setEditDate]  = useState('');
  const [editTime,  setEditTime]  = useState('');
  const [editMemo,  setEditMemo]  = useState(MOCK.memo ?? '');
  const [locking,   setLocking]   = useState(false);

  const [showEdit,      setShowEdit]      = useState(false);
  const [showDelete,    setShowDelete]    = useState(false);
  const [showDatePick,  setShowDatePick]  = useState(false);
  const [showTimePick,  setShowTimePick]  = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { date, time } = formatDateTime(schedule.scheduledAt);

  if (confirmed) {
    return (
      <ConfirmedScreen
        schedule={schedule}
        editTitle={editTitle}
        editDate={editDate}
        editTime={editTime}
      />
    );
  }

  function handleLockIn() {
    if (!editTitle.trim()) return;
    setLocking(true);
    // TODO: api.post('/schedules', { title: editTitle, date: editDate, time: editTime, memo: editMemo })
    setTimeout(() => { setLocking(false); setConfirmed(true); }, 1000);
  }

  function handleDelete() {
    setActionLoading(true);
    // TODO: api.delete(`/rooms/${scheduleId}`)
    setTimeout(() => { setActionLoading(false); setShowDelete(false); router.back(); }, 800);
  }

  return (
    <View style={s.container}>
      <NavHeader initial={initial} onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.body}>
        <Text style={s.pageTitle}>일정을 확정해요</Text>
        <Text style={s.pageSubtitle}>AI가 추천한 장소로 최종 일정을 작성해주세요.</Text>

        {/* PLAN NAME */}
        <Text style={s.fieldLabel}>PLAN NAME</Text>
        <TextInput
          style={s.input}
          value={editTitle}
          onChangeText={setEditTitle}
          placeholder="모임 이름을 입력하세요"
          placeholderTextColor="#454652"
          maxLength={40}
        />

        {/* DATE / TIME */}
        <View style={s.rowGrid}>
          <View style={{ flex: 1 }}>
            <Text style={s.fieldLabel}>DATE</Text>
            <TouchableOpacity
              style={[s.infoCell, s.infoCellEditable, !!editDate && s.infoCellFilled]}
              onPress={() => setShowDatePick(true)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="날짜 선택"
            >
              <Ionicons name="calendar-outline" size={15} color={editDate ? '#bdc2ff' : '#8a8f98'} />
              <Text style={[s.infoCellText, !!editDate && { color: '#f7f8f8' }]} numberOfLines={1}>
                {editDate ? formatDateDisplay(editDate) : date}
              </Text>
              <Ionicons name="chevron-down" size={13} color={editDate ? '#bdc2ff' : '#454652'} />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.fieldLabel}>TIME</Text>
            <TouchableOpacity
              style={[s.infoCell, s.infoCellEditable, !!editTime && s.infoCellFilled]}
              onPress={() => setShowTimePick(true)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="시간 선택"
            >
              <Ionicons name="time-outline" size={15} color={editTime ? '#bdc2ff' : '#8a8f98'} />
              <Text style={[s.infoCellText, !!editTime && { color: '#f7f8f8' }]}>
                {editTime ? formatTimeDisplay(editTime) : time}
              </Text>
              <Ionicons name="chevron-down" size={13} color={editTime ? '#bdc2ff' : '#454652'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* LOCATION */}
        <Text style={s.fieldLabel}>LOCATION</Text>
        <View style={[s.infoCell, { marginBottom: 20, opacity: 0.65 }]}>
          <Ionicons name="location-outline" size={15} color="#8a8f98" />
          <Text style={s.infoCellText}>{schedule.placeName}</Text>
        </View>

        {/* PARTICIPANTS */}
        <Text style={s.fieldLabel}>PARTICIPANTS</Text>
        <View style={s.participantsCard}>
          <View style={s.avatarRow}>
            {schedule.participants.slice(0, 5).map((p, i) => (
              <View key={p.id} style={[s.miniAvatar, { marginLeft: i === 0 ? 0 : -8 }]}>
                <Text style={s.miniAvatarText}>{p.nickname[0].toUpperCase()}</Text>
              </View>
            ))}
          </View>
          <Text style={s.participantCount}>{schedule.participants.length}명</Text>
          <View style={s.participantStatusRow}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const cnt = schedule.participants.filter(p => p.status === key).length;
              if (cnt === 0) return null;
              return (
                <View key={key} style={[s.statusDot, { backgroundColor: cfg.bg }]}>
                  <Text style={[s.statusDotText, { color: cfg.color }]}>{cfg.label} {cnt}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* NOTES */}
        <Text style={s.fieldLabel}>NOTES</Text>
        <TextInput
          style={[s.input, s.textarea]}
          value={editMemo}
          onChangeText={setEditMemo}
          placeholder="참가자들에게 전달할 메모를 입력하세요..."
          placeholderTextColor="#454652"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* AI badge */}
        <View style={s.aiCard}>
          <View style={s.aiLeft}>
            <Ionicons name="flash" size={15} color="#bdc2ff" />
            <View>
              <Text style={s.aiTitle}>PINI AI 최적화 완료</Text>
              <Text style={s.aiDesc}>모든 참가자의 선호도가 반영됐어요.</Text>
            </View>
          </View>
          <Ionicons name="checkmark-circle" size={19} color="#27a644" />
        </View>

        {/* Creator quick actions */}
        {schedule.isCreator && (
          <View style={s.creatorRow}>
            <TouchableOpacity style={s.creatorBtn} onPress={() => setShowEdit(true)} activeOpacity={0.8}>
              <Ionicons name="create-outline" size={14} color="#d0d6e0" />
              <Text style={s.creatorBtnText}>일정 수정</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.creatorBtn, s.creatorDanger]} onPress={() => setShowDelete(true)} activeOpacity={0.8}>
              <Ionicons name="trash-outline" size={14} color="#ffb4ab" />
              <Text style={[s.creatorBtnText, { color: '#ffb4ab' }]}>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Footer CTA */}
      <View style={s.footer}>
        <View style={s.footerMeta}>
          <Ionicons name="people-outline" size={12} color="#8a8f98" />
          <Text style={s.footerMetaText}>{schedule.participants.length}명 참가</Text>
          <View style={s.metaDot} />
          <Ionicons name="location-outline" size={12} color="#8a8f98" />
          <Text style={s.footerMetaText}>{schedule.placeName}</Text>
        </View>
        <TouchableOpacity
          style={[s.lockBtn, (!editTitle.trim() || locking) && { opacity: 0.38 }]}
          onPress={handleLockIn}
          disabled={!editTitle.trim() || locking}
          activeOpacity={0.85}
        >
          {locking
            ? <ActivityIndicator color="#fdfaff" size="small" />
            : (
              <>
                <Ionicons name="checkmark-circle" size={18} color="#fdfaff" />
                <Text style={s.lockBtnText}>Lock It In</Text>
              </>
            )
          }
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <DatePickerModal visible={showDatePick} initial={editDate} onConfirm={setEditDate} onClose={() => setShowDatePick(false)} />
      <TimePickerModal visible={showTimePick} initial={editTime} onConfirm={setEditTime} onClose={() => setShowTimePick(false)} />

      {/* Edit modal */}
      <Modal visible={showEdit} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>일정 수정</Text>
            <Text style={s.modalFieldLabel}>제목</Text>
            <TextInput style={s.modalInput} value={editTitle} onChangeText={setEditTitle} placeholder="일정 제목" placeholderTextColor="#454652" maxLength={50} />
            <Text style={s.modalFieldLabel}>메모</Text>
            <TextInput style={[s.modalInput, { height: 80, textAlignVertical: 'top' }]} value={editMemo} onChangeText={setEditMemo} placeholder="메모" placeholderTextColor="#454652" multiline />
            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancelBtn} onPress={() => setShowEdit(false)}><Text style={s.modalCancelText}>취소</Text></TouchableOpacity>
              <TouchableOpacity style={s.modalSaveBtn} onPress={() => setShowEdit(false)}><Text style={s.modalSaveText}>저장</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete confirm modal */}
      <Modal visible={showDelete} animationType="fade" transparent>
        <View style={[s.modalOverlay, { justifyContent: 'center', padding: 24 }]}>
          <View style={[s.modalSheet, { borderRadius: 16 }]}>
            <Text style={[s.modalTitle, { textAlign: 'center' }]}>일정을 삭제할까요?</Text>
            <Text style={{ fontSize: 13, color: '#8a8f98', textAlign: 'center', lineHeight: 20, marginBottom: 20 }}>
              삭제된 일정은 복구할 수 없으며,{'\n'}모든 참가자에게서 제거돼요.
            </Text>
            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancelBtn} onPress={() => setShowDelete(false)}><Text style={s.modalCancelText}>취소</Text></TouchableOpacity>
              <TouchableOpacity style={[s.modalSaveBtn, { backgroundColor: '#7f1d1d' }]} onPress={handleDelete} disabled={actionLoading}>
                {actionLoading ? <ActivityIndicator color="#fdfaff" size="small" /> : <Text style={s.modalSaveText}>삭제</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#131316' },

  // Body
  body:       { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120 },
  pageTitle:  { fontSize: 28, fontWeight: '700', color: '#f7f8f8', letterSpacing: -0.6, marginBottom: 6 },
  pageSubtitle:{ fontSize: 14, color: '#8a8f98', marginBottom: 28, lineHeight: 20 },

  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#454652', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  input:      { backgroundColor: '#18191a', borderWidth: 1.5, borderColor: '#23252a', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#f7f8f8', marginBottom: 20 },
  textarea:   { height: 100, textAlignVertical: 'top' },

  rowGrid:         { flexDirection: 'row', gap: 10, marginBottom: 20 },
  infoCell:        { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#18191a', borderWidth: 1.5, borderColor: '#23252a', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 14 },
  infoCellEditable:{ borderStyle: 'dashed' },
  infoCellFilled:  { borderColor: '#5e6ad2', borderStyle: 'solid', backgroundColor: 'rgba(94,106,210,0.08)' },
  infoCellText:    { flex: 1, fontSize: 12, color: '#8a8f98', fontWeight: '500' },

  participantsCard:     { backgroundColor: '#18191a', borderWidth: 1.5, borderColor: '#23252a', borderRadius: 12, padding: 14, marginBottom: 20, gap: 10 },
  avatarRow:            { flexDirection: 'row' },
  miniAvatar:           { width: 26, height: 26, borderRadius: 13, backgroundColor: '#5e6ad2', borderWidth: 2, borderColor: '#131316', alignItems: 'center', justifyContent: 'center' },
  miniAvatarText:       { fontSize: 10, fontWeight: '700', color: '#fdfaff' },
  participantCount:     { fontSize: 13, fontWeight: '600', color: '#d0d6e0' },
  participantStatusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  statusDot:            { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusDotText:        { fontSize: 11, fontWeight: '600' },

  aiCard:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(94,106,210,0.07)', borderWidth: 1, borderColor: 'rgba(94,106,210,0.22)', borderRadius: 12, padding: 14, marginBottom: 20 },
  aiLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiTitle: { fontSize: 12, fontWeight: '700', color: '#bdc2ff' },
  aiDesc:  { fontSize: 11, color: '#8a8f98' },

  creatorRow:    { flexDirection: 'row', gap: 8, marginBottom: 20 },
  creatorBtn:    { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: '#18191a', borderWidth: 1, borderColor: '#23252a' },
  creatorBtnText:{ fontSize: 12, fontWeight: '600', color: '#d0d6e0' },
  creatorDanger: { borderColor: 'rgba(255,180,171,0.25)', backgroundColor: 'rgba(255,180,171,0.04)' },

  // Footer
  footer:       { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#131316', borderTopWidth: 1, borderTopColor: '#23252a', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 28 },
  footerMeta:   { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 12 },
  footerMetaText:{ fontSize: 11, color: '#8a8f98' },
  metaDot:      { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#454652' },
  lockBtn:      { height: 48, backgroundColor: '#5e6ad2', borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1, borderColor: 'rgba(189,194,255,0.2)' },
  lockBtnText:  { fontSize: 14, fontWeight: '700', color: '#fdfaff', letterSpacing: 0.1 },

  // Modals (shared)
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end' },
  modalSheet:      { backgroundColor: '#141516', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, borderTopWidth: 1, borderColor: '#23252a' },
  modalHandle:     { width: 36, height: 4, borderRadius: 2, backgroundColor: '#34343a', alignSelf: 'center', marginBottom: 20 },
  modalTitle:      { fontSize: 18, fontWeight: '700', color: '#f7f8f8', marginBottom: 16, letterSpacing: -0.3 },
  modalFieldLabel: { fontSize: 10, fontWeight: '700', color: '#454652', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6, marginTop: 12 },
  modalInput:      { backgroundColor: '#18191a', borderWidth: 1.5, borderColor: '#23252a', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#f7f8f8' },
  modalActions:    { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalCancelBtn:  { flex: 1, height: 48, backgroundColor: '#18191a', borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#23252a' },
  modalCancelText: { fontSize: 14, fontWeight: '600', color: '#8a8f98' },
  modalSaveBtn:    { flex: 1, height: 48, backgroundColor: '#5e6ad2', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalSaveText:   { fontSize: 14, fontWeight: '700', color: '#fdfaff' },

  ampmBtn:          { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, backgroundColor: '#18191a', borderWidth: 1.5, borderColor: '#23252a' },
  ampmBtnActive:    { borderColor: '#5e6ad2', backgroundColor: 'rgba(94,106,210,0.14)' },
  ampmBtnText:      { fontSize: 13, fontWeight: '600', color: '#8a8f98' },
  ampmBtnTextActive:{ color: '#bdc2ff' },
  quickRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  quickChip:        { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: '#18191a', borderWidth: 1, borderColor: '#23252a' },
  quickChipText:    { fontSize: 12, fontWeight: '600', color: '#8a8f98' },
});
