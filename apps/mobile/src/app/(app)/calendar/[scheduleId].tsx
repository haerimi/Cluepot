import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal, TextInput, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

// TODO: import { api } from '@/lib/api';
// TODO: import { useAuthStore } from '@/store/auth';

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Mock data (remove when API connected) ───────────────────────────────────

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
    { id: 'p1', userId: 'u1', nickname: '나', profileImage: null, status: 'accepted', isMe: true },
    { id: 'p2', userId: 'u2', nickname: '김철수', profileImage: null, status: 'accepted', isMe: false },
    { id: 'p3', userId: 'u3', nickname: '이영희', profileImage: null, status: 'pending', isMe: false },
    { id: 'p4', userId: 'u4', nickname: '박지수', profileImage: null, status: 'declined', isMe: false },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekday = weekdays[d.getDay()];
  const h = d.getHours();
  const m = d.getMinutes();
  const period = h < 12 ? '오전' : '오후';
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return {
    date: `${month}월 ${day}일 ${weekday}요일`,
    time: `${period} ${hour}:${String(m).padStart(2, '0')}`,
  };
}

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; bg: string; color: string }> = {
  accepted: { label: '✓ 수락',  bg: '#E6F7EF', color: '#2E7D52' },
  declined: { label: '✕ 거절',  bg: '#FFF0F0', color: '#E05555' },
  pending:  { label: '— 보류', bg: '#F0F2F5', color: '#64748B' },
};

function InitialAvatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({
  visible,
  schedule,
  onClose,
}: {
  visible: boolean;
  schedule: ScheduleDetail;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(schedule.title);
  const [memo, setMemo] = useState(schedule.memo ?? '');
  const [saving, setSaving] = useState(false);

  function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    // TODO: api.patch(`/schedules/${schedule.id}`, { title, memo }) 로 수정
    setTimeout(() => {
      setSaving(false);
      onClose();
    }, 800);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>날짜·시간 수정</Text>

          <Text style={styles.fieldLabel}>제목</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="일정 제목"
            placeholderTextColor="#94A3B8"
            maxLength={50}
          />

          <Text style={styles.fieldLabel}>메모 (선택)</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={memo}
            onChangeText={setMemo}
            placeholder="참가자들에게 전달할 메모"
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
          />
          {/* TODO: 날짜·시간 DateTimePicker 추가 */}

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, (!title.trim() || saving) && styles.btnDisabled]}
              onPress={handleSave}
              disabled={!title.trim() || saving}
            >
              {saving
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.saveBtnText}>저장</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel,
  danger,
  loading,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.confirmSheet}>
          <Text style={styles.confirmTitle}>{title}</Text>
          <Text style={styles.confirmMessage}>{message}</Text>
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, danger && styles.dangerBtn, loading && styles.btnDisabled]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.saveBtnText}>{confirmLabel}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ScheduleDetailScreen() {
  const { scheduleId } = useLocalSearchParams<{ scheduleId: string }>();
  const router = useRouter();

  // TODO: 실제 데이터 로딩
  // const [schedule, setSchedule] = useState<ScheduleDetail | null>(null);
  // const [loading, setLoading] = useState(true);
  // useEffect(() => {
  //   api.get(`/schedules/${scheduleId}`).then(({ data }) => setSchedule(data)).finally(() => setLoading(false));
  // }, [scheduleId]);

  const [schedule, setSchedule] = useState<ScheduleDetail>(MOCK);
  const [loading] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4376C8" />
      </View>
    );
  }

  if (!schedule) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>일정을 찾을 수 없어요</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLinkBtn}>
          <Text style={styles.backLinkText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { date, time } = formatDateTime(schedule.scheduledAt);
  const acceptedCount = schedule.participants.filter((p) => p.status === 'accepted').length;

  function handleAttendance(status: AttendanceStatus) {
    // TODO: api.patch(`/schedules/${scheduleId}/attendance`, { status }) 호출
    setSchedule((prev) => ({ ...prev, myStatus: status }));
  }

  function handleDelete() {
    setActionLoading(true);
    // TODO: api.delete(`/schedules/${scheduleId}`) 호출 후 router.back()
    setTimeout(() => {
      setActionLoading(false);
      setShowDelete(false);
      router.back();
    }, 800);
  }

  function handleLeave() {
    setActionLoading(true);
    // TODO: api.delete(`/schedules/${scheduleId}/participants/me`) 호출 후 router.back()
    setTimeout(() => {
      setActionLoading(false);
      setShowLeave(false);
      router.back();
    }, 800);
  }

  function handleChangePlace() {
    // TODO: 장소 재선정 API 호출 후 rooms/[code] 로 이동
    Alert.alert('장소 변경', '장소를 다시 선정하시겠어요? 참가자는 유지됩니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '변경',
        style: 'destructive',
        onPress: () => {
          // TODO: api.post(`/schedules/${scheduleId}/reselect`) 호출
          router.back();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backLabel}>모임 일정</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 타이틀 섹션 */}
        <View style={styles.titleSection}>
          <Text style={styles.eyebrow}>확정된 모임</Text>
          <Text style={styles.scheduleTitle}>{schedule.title}</Text>
          <Text style={styles.dateText}>{date}</Text>
          <Text style={styles.timeText}>{time}</Text>
        </View>

        {/* 크리에이터 액션 */}
        {schedule.isCreator ? (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowEdit(true)}>
              <Text style={styles.actionBtnIcon}>✏️</Text>
              <Text style={styles.actionBtnText}>날짜·시간</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleChangePlace}>
              <Text style={styles.actionBtnIcon}>📍</Text>
              <Text style={styles.actionBtnText}>장소 변경</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.dangerActionBtn]} onPress={() => setShowDelete(true)}>
              <Text style={styles.actionBtnIcon}>🗑️</Text>
              <Text style={[styles.actionBtnText, styles.dangerActionText]}>삭제</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.dangerActionBtn]} onPress={() => setShowLeave(true)}>
              <Text style={styles.actionBtnIcon}>🚪</Text>
              <Text style={[styles.actionBtnText, styles.dangerActionText]}>나가기</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 장소 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>장소</Text>

          {/* TODO: WebView 또는 react-native-maps로 카카오맵/구글맵 embed */}
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderIcon}>🗺️</Text>
            <Text style={styles.mapPlaceholderText}>지도 (TODO: 지도 연동)</Text>
          </View>

          <View style={styles.placeInfo}>
            <Text style={styles.placeName}>{schedule.placeName}</Text>
            <Text style={styles.placeAddress}>{schedule.placeAddress}</Text>
          </View>

          {schedule.memo && (
            <>
              <View style={styles.divider} />
              <View style={styles.memoRow}>
                <Text style={styles.memoIcon}>📝</Text>
                <Text style={styles.memoText}>{schedule.memo}</Text>
              </View>
            </>
          )}
        </View>

        {/* 참가자 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>참가자 · {acceptedCount}명 수락</Text>
          <View style={styles.participantGrid}>
            {schedule.participants.map((p) => {
              const sc = STATUS_CONFIG[p.status];
              return (
                <View key={p.id} style={styles.participantChip}>
                  <InitialAvatar name={p.nickname} size={32} />
                  <View style={styles.participantInfo}>
                    <View style={styles.participantNameRow}>
                      <Text style={styles.participantName} numberOfLines={1}>{p.nickname}</Text>
                      {p.isMe && <Text style={styles.meTag}>나</Text>}
                    </View>
                    <View style={[styles.statusChip, { backgroundColor: sc.bg }]}>
                      <Text style={[styles.statusChipText, { color: sc.color }]}>{sc.label}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* 내 참석 여부 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>내 참석 여부</Text>
          <View style={styles.attendanceRow}>
            <TouchableOpacity
              style={[
                styles.attendanceBtn,
                schedule.myStatus === 'accepted' && styles.attendanceBtnAccepted,
              ]}
              onPress={() => handleAttendance('accepted')}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.attendanceBtnText,
                schedule.myStatus === 'accepted' && styles.attendanceBtnTextActive,
              ]}>
                ✓ 참석할게요
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.attendanceBtn,
                schedule.myStatus === 'declined' && styles.attendanceBtnDeclined,
              ]}
              onPress={() => handleAttendance('declined')}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.attendanceBtnText,
                schedule.myStatus === 'declined' && styles.attendanceBtnTextActive,
              ]}>
                ✕ 참석 못해요
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modals */}
      <EditModal visible={showEdit} schedule={schedule} onClose={() => setShowEdit(false)} />

      <ConfirmModal
        visible={showDelete}
        title="일정을 삭제할까요?"
        message="삭제된 일정은 복구할 수 없으며, 모든 참가자에게서 제거돼요."
        confirmLabel="삭제"
        danger
        loading={actionLoading}
        onConfirm={handleDelete}
        onClose={() => setShowDelete(false)}
      />

      <ConfirmModal
        visible={showLeave}
        title="해당 일정에서 나가실건가요?"
        message="복구할 수 없어요. 다른 참가자의 일정에는 영향을 주지 않아요."
        confirmLabel="나가기"
        danger
        loading={actionLoading}
        onConfirm={handleLeave}
        onClose={() => setShowLeave(false)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F7F8FA' },
  centered:        { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F8FA' },
  errorText:       { fontSize: 15, color: '#64748B', marginBottom: 16 },
  backLinkBtn:     { paddingHorizontal: 20, paddingVertical: 10 },
  backLinkText:    { fontSize: 14, color: '#4376C8', fontWeight: '600' },

  header:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  backBtn:         { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backArrow:       { fontSize: 26, color: '#64748B', fontWeight: '300', lineHeight: 30 },
  backLabel:       { fontSize: 14, fontWeight: '600', color: '#64748B' },

  scrollContent:   { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },

  titleSection:    { marginBottom: 20 },
  eyebrow:         { fontSize: 10, fontWeight: '700', color: '#4376C8', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 },
  scheduleTitle:   { fontSize: 26, fontWeight: '900', color: '#0F172A', marginBottom: 6 },
  dateText:        { fontSize: 15, fontWeight: '600', color: '#64748B', marginBottom: 2 },
  timeText:        { fontSize: 28, fontWeight: '900', color: '#4376C8' },

  actionRow:       { flexDirection: 'row', gap: 8, marginBottom: 24 },
  actionBtn:       { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0' },
  actionBtnIcon:   { fontSize: 14 },
  actionBtnText:   { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  dangerActionBtn: { borderColor: '#FFD0D0', backgroundColor: '#FFF8F8' },
  dangerActionText:{ color: '#E05555' },

  section:         { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, marginBottom: 14 },
  sectionLabel:    { fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },

  mapPlaceholder:  { height: 180, borderRadius: 10, backgroundColor: '#EEF1F5', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' },
  mapPlaceholderIcon: { fontSize: 32, marginBottom: 6 },
  mapPlaceholderText: { fontSize: 13, color: '#94A3B8' },

  placeInfo:       { gap: 4 },
  placeName:       { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  placeAddress:    { fontSize: 13, color: '#64748B' },

  divider:         { height: 1, backgroundColor: '#E2E8F0', marginVertical: 12 },
  memoRow:         { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  memoIcon:        { fontSize: 14, marginTop: 1 },
  memoText:        { fontSize: 13, color: '#64748B', flex: 1, lineHeight: 20 },

  participantGrid: { gap: 8 },
  participantChip: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F7F8FA', borderRadius: 10, padding: 10 },
  avatar:          { backgroundColor: '#4376C8', alignItems: 'center', justifyContent: 'center' },
  avatarText:      { color: '#fff', fontWeight: '700' },
  participantInfo: { flex: 1, gap: 4 },
  participantNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  participantName: { fontSize: 14, fontWeight: '600', color: '#0F172A', flex: 1 },
  meTag:           { fontSize: 10, fontWeight: '700', color: '#4376C8', backgroundColor: '#EAF1FA', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  statusChip:      { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusChipText:  { fontSize: 10, fontWeight: '700' },

  attendanceRow:   { flexDirection: 'row', gap: 10 },
  attendanceBtn:   { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#F7F8FA', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  attendanceBtnAccepted: { backgroundColor: '#E6F7EF', borderColor: '#2E7D52' },
  attendanceBtnDeclined: { backgroundColor: '#FFF0F0', borderColor: '#E05555' },
  attendanceBtnText:     { fontSize: 14, fontWeight: '700', color: '#64748B' },
  attendanceBtnTextActive: { color: '#0F172A' },

  // Modal
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet:      { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHandle:     { width: 36, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 20 },
  modalTitle:      { fontSize: 18, fontWeight: '900', color: '#0F172A', marginBottom: 20 },
  confirmSheet:    { backgroundColor: '#fff', borderRadius: 20, padding: 24, margin: 24 },
  confirmTitle:    { fontSize: 17, fontWeight: '800', color: '#0F172A', marginBottom: 8, textAlign: 'center' },
  confirmMessage:  { fontSize: 13, color: '#64748B', lineHeight: 20, textAlign: 'center', marginBottom: 20 },

  fieldLabel:      { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 6, marginTop: 14 },
  textInput:       { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#0F172A', backgroundColor: '#F9FAFB' },
  textArea:        { height: 80, textAlignVertical: 'top' },

  modalActions:    { flexDirection: 'row', gap: 10, marginTop: 20 },
  cancelBtn:       { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#F7F8FA', alignItems: 'center' },
  cancelBtnText:   { fontSize: 14, fontWeight: '700', color: '#64748B' },
  saveBtn:         { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#4376C8', alignItems: 'center' },
  saveBtnText:     { fontSize: 14, fontWeight: '700', color: '#fff' },
  dangerBtn:       { backgroundColor: '#E05555' },
  btnDisabled:     { opacity: 0.5 },
});
