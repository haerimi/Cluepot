import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

type Transport = 'walk' | 'transit' | 'car' | 'bike';
type DistanceTolerance = 'short' | 'medium' | 'far';
type AtmospherePreference = 'quiet' | 'lively' | 'cozy' | 'trendy';

type Participant = {
  id: string;
  userId: string;
  isHost: boolean;
  abstractLocation: string;
  transports: string[];
  user: { nickname: string; profileImage: string | null };
};

const TRANSPORT_OPTIONS: { value: Transport; label: string; emoji: string }[] = [
  { value: 'walk',    label: '도보',     emoji: '🚶' },
  { value: 'transit', label: '대중교통', emoji: '🚇' },
  { value: 'car',     label: '자동차',   emoji: '🚗' },
  { value: 'bike',    label: '자전거',   emoji: '🚲' },
];

const DISTANCE_OPTIONS: { value: DistanceTolerance; label: string; emoji: string; desc: string }[] = [
  { value: 'short',  label: '짧게',       emoji: '⚡', desc: '15분 이내' },
  { value: 'medium', label: '적당히',     emoji: '🚶', desc: '30분 이내' },
  { value: 'far',    label: '상관없어요', emoji: '🗺', desc: '멀어도 OK' },
];

const ATMOSPHERE_OPTIONS: { value: AtmospherePreference; label: string; emoji: string }[] = [
  { value: 'quiet',  label: '조용한',   emoji: '☕' },
  { value: 'lively', label: '활기찬',   emoji: '🎵' },
  { value: 'cozy',   label: '아늑한',   emoji: '🕯' },
  { value: 'trendy', label: '트렌디한', emoji: '✨' },
];

export default function RoomScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const roomCode = code?.toUpperCase() ?? '';
  const router = useRouter();
  const currentUserId = useAuthStore((s) => s.user?.id);

  const [loading, setLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const [location, setLocation] = useState('');
  const [transport, setTransport] = useState<Transport | null>(null);
  const [distance, setDistance] = useState<DistanceTolerance | null>(null);
  const [atmosphere, setAtmosphere] = useState<AtmospherePreference | null>(null);
  const [locationSaved, setLocationSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => { init(); }, [roomCode]);

  async function init() {
    try {
      // TODO: api.post(`/rooms/${roomCode}/join`) → isHost, savedPreference 받기
      // TODO: savedPreference 있으면 폼 상태 복원 + setLocationSaved(true)
      // TODO: api.get(`/rooms/${roomCode}/participants`) → 참가자 목록
      const { data: joinData } = await api.post(`/rooms/${roomCode}/join`);
      setIsHost(joinData.isHost);
      if (joinData.savedPreference) {
        setLocation(joinData.savedPreference.abstractLocation);
        setTransport(joinData.savedPreference.transports[0] ?? null);
        setDistance(joinData.savedPreference.distanceTolerance ?? null);
        setAtmosphere(joinData.savedPreference.atmospherePreference ?? null);
        setLocationSaved(true);
      }
      const { data: pData } = await api.get(`/rooms/${roomCode}/participants`);
      setParticipants(pData.participants);
    } catch {
      Alert.alert('오류', '방에 입장할 수 없어요.', [{ text: '확인', onPress: () => router.back() }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePreference() {
    if (!location.trim()) { setFormError('출발 지역을 입력해주세요.'); return; }
    if (!transport)        { setFormError('교통수단을 선택해주세요.'); return; }
    if (!distance)         { setFormError('이동 거리 선호를 선택해주세요.'); return; }
    if (!atmosphere)       { setFormError('분위기 선호를 선택해주세요.'); return; }
    setFormError('');
    setSaving(true);
    try {
      // TODO: api.post(`/rooms/${roomCode}/preference`, { ... }) 호출
      await api.post(`/rooms/${roomCode}/preference`, {
        abstractLocation: location, lat: 0, lng: 0,
        transports: [transport], distanceTolerance: distance, atmospherePreference: atmosphere,
      });
      setLocationSaved(true);
      const { data: pData } = await api.get(`/rooms/${roomCode}/participants`);
      setParticipants(pData.participants);
    } catch {
      Alert.alert('오류', '선호를 저장할 수 없어요.');
    } finally {
      setSaving(false);
    }
  }

  const readyCount = participants.filter(p =>
    p.userId === currentUserId ? locationSaved : Boolean(p.abstractLocation)
  ).length;
  const allReady = participants.length > 0 && readyCount === participants.length;

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#7298C7" /></View>;
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← 홈</Text>
        </TouchableOpacity>
        <View style={[styles.badge, allReady ? styles.badgeReady : styles.badgeWaiting]}>
          <View style={[styles.badgeDot, allReady ? styles.dotReady : styles.dotWaiting]} />
          <Text style={[styles.badgeText, allReady ? styles.badgeTextReady : styles.badgeTextWaiting]}>
            {allReady ? '모두 준비됨' : '대기 중'}
          </Text>
        </View>
        <Text style={styles.roomCode}>{roomCode}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {/* 참가자 목록 */}
        <Text style={styles.sectionLabel}>참가자 {readyCount}/{participants.length}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${participants.length ? (readyCount / participants.length) * 100 : 0}%` as any }]} />
        </View>

        {participants.map((p) => {
          const isReady = p.userId === currentUserId ? locationSaved : Boolean(p.abstractLocation);
          return (
            <View key={p.id} style={styles.participantRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{p.user.nickname[0]}</Text>
              </View>
              <Text style={styles.participantName}>{p.user.nickname}</Text>
              {p.isHost && <View style={styles.hostBadge}><Text style={styles.hostBadgeText}>호스트</Text></View>}
              <View style={[styles.readyDot, isReady ? styles.dotReady : styles.dotWaiting]} />
            </View>
          );
        })}

        <View style={styles.divider} />

        {/* 선호 저장 완료 */}
        {locationSaved ? (
          <View style={styles.savedBox}>
            <Text style={styles.savedEmoji}>✅</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.savedTitle}>선호가 저장됐어요!</Text>
              <Text style={styles.savedSub}>모든 참가자가 준비되면 PINI를 실행해요</Text>
            </View>
            <TouchableOpacity onPress={() => setLocationSaved(false)}>
              <Text style={styles.editLink}>수정</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.sectionLabel}>내 정보 알려주기</Text>

            {/* 출발 지역 */}
            <Text style={styles.fieldLabel}>출발 지역</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 강남구, 홍대, 잠실"
              placeholderTextColor="#B0BAC8"
              value={location}
              onChangeText={(t) => { setLocation(t); setFormError(''); }}
            />

            {/* 교통수단 */}
            <Text style={styles.fieldLabel}>이동 수단</Text>
            <View style={styles.optionRow}>
              {TRANSPORT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.optionBtn, transport === opt.value && styles.optionBtnActive]}
                  onPress={() => { setTransport(opt.value); setFormError(''); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                  <Text style={[styles.optionLabel, transport === opt.value && styles.optionLabelActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 이동 거리 */}
            <Text style={styles.fieldLabel}>이동 거리 선호</Text>
            <View style={styles.optionRow}>
              {DISTANCE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.optionBtn, distance === opt.value && styles.optionBtnActive]}
                  onPress={() => { setDistance(opt.value); setFormError(''); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                  <Text style={[styles.optionLabel, distance === opt.value && styles.optionLabelActive]}>{opt.label}</Text>
                  <Text style={styles.optionDesc}>{opt.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 분위기 */}
            <Text style={styles.fieldLabel}>선호 분위기</Text>
            <View style={styles.optionRow}>
              {ATMOSPHERE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.optionBtn, atmosphere === opt.value && styles.optionBtnActive]}
                  onPress={() => { setAtmosphere(opt.value); setFormError(''); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                  <Text style={[styles.optionLabel, atmosphere === opt.value && styles.optionLabelActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {formError ? <Text style={styles.errorText}>⚠️ {formError}</Text> : null}

            <TouchableOpacity
              style={[styles.btn, saving && styles.btnDisabled]}
              onPress={handleSavePreference}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>선호 저장하기</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* 호스트 PINI 버튼 */}
        {isHost && locationSaved && (
          <>
            <View style={styles.divider} />
            <TouchableOpacity
              style={[styles.piniBtn, !allReady && styles.btnDisabled]}
              disabled={!allReady}
              activeOpacity={0.8}
              onPress={() => Alert.alert('PINI', '준비 완료! PINI 연동은 다음 단계에서 추가해요')}
            >
              <Text style={styles.btnText}>
                {allReady ? '🔍 PINI 실행하기' : `대기 중 (${readyCount}/${participants.length})`}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F0', paddingTop: 60 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F5F0' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, marginBottom: 16 },
  back: { fontSize: 15, color: '#5A6A85', fontWeight: '600' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeReady: { backgroundColor: '#E6F7EF' },
  badgeWaiting: { backgroundColor: '#F0F2F5' },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  dotReady: { backgroundColor: '#4CAF7D' },
  dotWaiting: { backgroundColor: '#C5CCD8' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  badgeTextReady: { color: '#2E7D52' },
  badgeTextWaiting: { color: '#5A6A85' },
  roomCode: { marginLeft: 'auto', fontSize: 13, fontWeight: '700', color: '#9AAFC5' },
  body: { paddingHorizontal: 20, paddingBottom: 60 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#9AAFC5', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },
  progressBar: { height: 4, backgroundColor: '#E2E6EC', borderRadius: 2, marginBottom: 14, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#7298C7', borderRadius: 2 },
  participantRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E2E6EC', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '700', color: '#5A6A85' },
  participantName: { fontSize: 14, fontWeight: '500', color: '#1A2033', flex: 1 },
  hostBadge: { backgroundColor: '#EEF3FB', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  hostBadgeText: { fontSize: 10, fontWeight: '700', color: '#7298C7' },
  readyDot: { width: 8, height: 8, borderRadius: 4 },
  divider: { height: 1, backgroundColor: '#E2E6EC', marginVertical: 20 },
  savedBox: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#E6F7EF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#B2DFCE' },
  savedEmoji: { fontSize: 20 },
  savedTitle: { fontSize: 14, fontWeight: '700', color: '#2E7D52' },
  savedSub: { fontSize: 12, color: '#4CAF7D', marginTop: 2 },
  editLink: { fontSize: 12, color: '#2E7D52', textDecorationLine: 'underline', fontWeight: '600' },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#5A6A85', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8, marginTop: 16 },
  input: { height: 48, borderWidth: 1, borderColor: '#E2E6EC', borderRadius: 12, paddingHorizontal: 16, fontSize: 16, color: '#1A2033', backgroundColor: '#fff' },
  optionRow: { flexDirection: 'row', gap: 8 },
  optionBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E6EC', alignItems: 'center', gap: 4 },
  optionBtnActive: { backgroundColor: '#EEF3FB', borderColor: '#7298C7' },
  optionEmoji: { fontSize: 20 },
  optionLabel: { fontSize: 11, fontWeight: '600', color: '#5A6A85' },
  optionLabelActive: { color: '#7298C7' },
  optionDesc: { fontSize: 10, color: '#9AAFC5' },
  errorText: { fontSize: 12, color: '#E05555', marginVertical: 8 },
  btn: { height: 52, backgroundColor: '#7298C7', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  piniBtn: { height: 56, backgroundColor: '#1A2033', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
