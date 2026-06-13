import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, Alert, Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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

type AiPlace = { name: string; address: string; match: number };

const TRANSPORT_OPTIONS: { value: Transport; label: string; icon: any; iconColor: string }[] = [
  { value: 'walk',    label: '도보',     icon: 'walk-outline',    iconColor: '#bdc2ff' },
  { value: 'transit', label: '대중교통', icon: 'subway-outline',  iconColor: '#ffb867' },
  { value: 'car',     label: '자동차',   icon: 'car-outline',     iconColor: '#7a7fad' },
  { value: 'bike',    label: '자전거',   icon: 'bicycle-outline', iconColor: '#27a644' },
];

const DISTANCE_OPTIONS: { value: DistanceTolerance; label: string; icon: any; desc: string }[] = [
  { value: 'short',  label: '짧게',       icon: 'flash-outline', desc: '15분 이내' },
  { value: 'medium', label: '적당히',     icon: 'walk-outline',  desc: '30분 이내' },
  { value: 'far',    label: '상관없어요', icon: 'map-outline',   desc: '멀어도 OK' },
];

const ATMOSPHERE_OPTIONS: { value: AtmospherePreference; label: string; icon: any; iconColor: string }[] = [
  { value: 'quiet',  label: '조용한',   icon: 'cafe-outline',          iconColor: '#bdc2ff' },
  { value: 'lively', label: '활기찬',   icon: 'musical-notes-outline', iconColor: '#ffb867' },
  { value: 'cozy',   label: '아늑한',   icon: 'flame-outline',         iconColor: '#7a7fad' },
  { value: 'trendy', label: '트렌디한', icon: 'star-outline',          iconColor: '#27a644' },
];

const PINI_STATUSES = [
  '참가자 선호도 분석 중...',
  '최적 장소 탐색 중...',
  'AI 매칭 점수 계산 중...',
  '추천 결과 정리 중...',
];

const MOCK_PLACES: AiPlace[] = [
  { name: '스타벅스 홍대입구역점', address: '서울 마포구 양화로 160',    match: 92 },
  { name: '카페 노티드 홍대',       address: '서울 마포구 어울마당로 35', match: 85 },
  { name: '투썸플레이스 홍대점',    address: '서울 마포구 홍익로 6길',   match: 78 },
];

function NavHeader({ initial, onBack }: { initial: string; onBack?: () => void }) {
  const router = useRouter();
  return (
    <View style={navHdr.wrap}>
      <TouchableOpacity onPress={onBack ?? (() => router.back())} style={navHdr.backBtn} hitSlop={8}>
        <Ionicons name="chevron-back" size={22} color="#c6c5d5" />
      </TouchableOpacity>
      <Text style={navHdr.logo}>Clue<Text style={navHdr.accent}>Pot</Text></Text>
      <View style={navHdr.avatar}><Text style={navHdr.avatarText}>{initial}</Text></View>
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

export default function RoomScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const roomCode = code?.toUpperCase() ?? '';
  const router = useRouter();
  const currentUserId   = useAuthStore((s) => s.user?.id);
  const currentNickname = useAuthStore((s) => s.user?.nickname ?? s.user?.email ?? '?');

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

  // PINI AI 상태
  const [piniLoading, setPiniLoading] = useState(false);
  const [aiResults, setAiResults] = useState(false);
  const [statusIdx, setStatusIdx] = useState(0);
  const [selectedPlace, setSelectedPlace] = useState<AiPlace>(MOCK_PLACES[0]);

  const pulseAnim   = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0.4)).current;
  const piniGlow    = useRef(new Animated.Value(0.5)).current;
  const piniPulse   = useRef(new Animated.Value(1)).current;

  useEffect(() => { init(); }, [roomCode]);

  useEffect(() => {
    if (locationSaved && !isHost) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim,   { toValue: 0.3, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim,   { toValue: 1,   duration: 1000, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, { toValue: 1,   duration: 1500, useNativeDriver: true }),
          Animated.timing(shimmerAnim, { toValue: 0.3, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [locationSaved, isHost]);

  useEffect(() => {
    if (!piniLoading) return;
    const interval = setInterval(() => setStatusIdx(i => (i + 1) % PINI_STATUSES.length), 2000);
    Animated.loop(
      Animated.sequence([
        Animated.timing(piniGlow,  { toValue: 1,   duration: 1200, useNativeDriver: true }),
        Animated.timing(piniGlow,  { toValue: 0.3, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(piniPulse, { toValue: 1.08, duration: 1800, useNativeDriver: true }),
        Animated.timing(piniPulse, { toValue: 0.95, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
    const timer = setTimeout(() => {
      setPiniLoading(false);
      setAiResults(true);
    }, 6000);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, [piniLoading]);

  async function init() {
    try {
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

  const readyCount  = participants.filter(p =>
    p.userId === currentUserId ? locationSaved : Boolean(p.abstractLocation)
  ).length;
  const allReady    = participants.length > 0 && readyCount === participants.length;
  const progressPct = participants.length > 0 ? (readyCount / participants.length) * 100 : 0;

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#5e6ad2" /></View>;
  }

  /* ── PINI AI 대기 화면 ── */
  if (piniLoading) {
    return (
      <View style={styles.container}>
        <NavHeader initial={currentNickname[0].toUpperCase()} />
        <View style={styles.piniScreen}>
          <View style={styles.piniCenter}>
            <Animated.View style={[styles.piniGlowRing, { opacity: piniGlow }]} />
            <Animated.View style={[styles.piniIconBg, { transform: [{ scale: piniPulse }] }]}>
              <Ionicons name="flash" size={36} color="#bdc2ff" />
            </Animated.View>
            <Text style={styles.piniTitle}>PINI AI</Text>
            <Text style={styles.piniSubtitle}>Analyzing Preferences</Text>
            <View style={styles.piniProgressTrack}>
              <Animated.View style={[styles.piniShimmerFill, { opacity: piniGlow }]} />
            </View>
            <Animated.Text style={[styles.piniStatusText, { opacity: piniGlow }]}>
              {PINI_STATUSES[statusIdx]}
            </Animated.Text>
          </View>
          <View style={styles.piniBadge}>
            <Ionicons name="flash" size={11} color="#bdc2ff" />
            <Text style={styles.piniBadgeText}>Powered by PINI</Text>
          </View>
        </View>
      </View>
    );
  }

  /* ── AI 장소추천 결과 화면 ── */
  if (aiResults) {
    const isTopPick = selectedPlace.name === MOCK_PLACES[0].name;

    return (
      <View style={styles.container}>
        <NavHeader initial={currentNickname[0].toUpperCase()} />

        {/* 지도 + 정보 섹션 */}
        <View style={styles.mapSection}>
          {/* 지도 플레이스홀더 */}
          <View style={styles.mapBg}>
            {/* 도로망 격자 */}
            {[40, 80, 130, 180, 230, 270].map(y => (
              <View key={y} style={[styles.mapRoadH, { top: y }]} />
            ))}
            {[40, 90, 140, 200, 260].map(x => (
              <View key={x} style={[styles.mapRoadV, { left: x }]} />
            ))}
            {/* 주요 도로 */}
            <View style={[styles.mapMainRoadH, { top: 130 }]} />
            <View style={[styles.mapMainRoadV, { left: 140 }]} />
            {/* 블록 */}
            {[
              [10,10,60,28],[105,10,80,28],[200,10,70,28],
              [10,48,50,28],[100,48,90,28],[205,48,60,28],
              [10,90,70,28],[105,90,70,28],[210,90,60,28],
              [10,150,90,24],[115,150,60,24],[200,150,70,24],
              [10,192,60,24],[100,192,80,24],[205,192,55,24],
            ].map(([l,t,w,h], i) => (
              <View key={i} style={[styles.mapBlock, { left: l, top: t, width: w, height: h }]} />
            ))}
            {/* 선택 위치 핀 */}
            <View style={styles.mapPinWrap}>
              <View style={styles.mapPinOuter}>
                <View style={styles.mapPinInner} />
              </View>
              <View style={styles.mapPinStem} />
            </View>
          </View>

          {/* 정보 오버레이 */}
          <View style={styles.mapInfoOverlay}>
            {isTopPick && (
              <View style={styles.topPickBadge}>
                <Ionicons name="star" size={11} color="#ffb867" />
                <Text style={styles.topPickText}>Top Pick</Text>
              </View>
            )}
            <Text style={styles.mapPlaceName}>{selectedPlace.name}</Text>
            <View style={styles.mapAddressRow}>
              <Ionicons name="location-outline" size={12} color="#8a8f98" />
              <Text style={styles.mapAddress}>{selectedPlace.address}</Text>
            </View>
            <View style={styles.mapMatchRow}>
              <Text style={styles.mapMatchPct}>{selectedPlace.match}%</Text>
              <Text style={styles.mapMatchLabel}> 매칭</Text>
            </View>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* 대안 가로 스크롤 — 3개 전체 */}
          <Text style={styles.resultEyebrow}>ALTERNATIVE OPTIONS</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.altScrollContent}
          >
            {MOCK_PLACES.map((alt, i) => {
              const isActive = selectedPlace.name === alt.name;
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.altCard, isActive && styles.altCardActive]}
                  onPress={() => setSelectedPlace(alt)}
                  activeOpacity={0.8}
                >
                  <View style={styles.altIconBox}>
                    <Ionicons name="location-outline" size={18} color={isActive ? '#bdc2ff' : '#8a8f98'} />
                  </View>
                  <Text style={[styles.altName, isActive && { color: '#f7f8f8' }]} numberOfLines={2}>{alt.name}</Text>
                  <Text style={[styles.altMatch, isActive && { color: '#bdc2ff' }]}>{alt.match}% fit</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* 추천 목록 */}
          <Text style={[styles.resultEyebrow, { paddingHorizontal: 16, marginTop: 20 }]}>RECOMMENDATIONS</Text>
          {MOCK_PLACES.map((place, i) => {
            const isSelected = selectedPlace.name === place.name;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.recCard, isSelected && styles.recCardActive]}
                onPress={() => setSelectedPlace(place)}
                activeOpacity={0.8}
              >
                <View style={[styles.recRankBox, i === 0 && styles.recRankBoxTop]}>
                  <Text style={[styles.recRank, i === 0 && styles.recRankTop]}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recName}>{place.name}</Text>
                  <Text style={styles.recAddress}>{place.address}</Text>
                </View>
                <View style={[styles.recMatchChip, i === 0 && styles.recMatchChipTop]}>
                  <Text style={[styles.recMatchText, i === 0 && styles.recMatchTextTop]}>{place.match}%</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 하단 버튼 */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() => router.push(`/(app)/calendar/${roomCode}` as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#fdfaff" />
            <Text style={styles.confirmBtnText}>선택 플랜 확정하기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => { setAiResults(false); setPiniLoading(true); }}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={16} color="#8a8f98" />
            <Text style={styles.retryBtnText}>다시 추천받기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ── 선호 입력 폼 ── */
  if (!locationSaved) {
    return (
      <View style={styles.container}>
        <NavHeader initial={currentNickname[0].toUpperCase()} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
          {/* 스텝 헤더 */}
          <View style={styles.stepHeader}>
            <Text style={styles.stepEyebrow}>STEP 2 OF 4</Text>
            <Text style={styles.stepTitle}>내 정보 알려주기</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '50%' }]} />
            </View>
          </View>

          {/* 출발 지역 */}
          <Text style={styles.fieldLabel}>출발 지역</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 강남구, 홍대, 잠실"
            placeholderTextColor="#454652"
            value={location}
            onChangeText={(t) => { setLocation(t); setFormError(''); }}
          />

          {/* 이동 수단 — 2열 그리드 */}
          <Text style={styles.sectionTitle}>이동 수단</Text>
          <View style={styles.grid2}>
            {TRANSPORT_OPTIONS.map((opt) => {
              const active = transport === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.gridCard, active && styles.gridCardActive]}
                  onPress={() => { setTransport(opt.value); setFormError(''); }}
                  activeOpacity={0.8}
                >
                  <Ionicons name={opt.icon} size={22} color={active ? opt.iconColor : '#8a8f98'} />
                  <Text style={[styles.gridCardLabel, active && styles.gridCardLabelActive]}>{opt.label}</Text>
                  {active && <View style={styles.gridCheck}><Ionicons name="checkmark-circle" size={14} color="#bdc2ff" /></View>}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 이동 거리 — 3열 */}
          <Text style={styles.sectionTitle}>이동 거리 선호</Text>
          <View style={styles.grid3}>
            {DISTANCE_OPTIONS.map((opt) => {
              const active = distance === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.grid3Card, active && styles.gridCardActive]}
                  onPress={() => { setDistance(opt.value); setFormError(''); }}
                  activeOpacity={0.8}
                >
                  <Ionicons name={opt.icon} size={20} color={active ? '#bdc2ff' : '#8a8f98'} />
                  <Text style={[styles.gridCardLabel, active && styles.gridCardLabelActive]}>{opt.label}</Text>
                  <Text style={styles.grid3Desc}>{opt.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 선호 분위기 — 2열 그리드 */}
          <Text style={styles.sectionTitle}>선호 분위기</Text>
          <View style={styles.grid2}>
            {ATMOSPHERE_OPTIONS.map((opt) => {
              const active = atmosphere === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.gridCard, active && styles.gridCardActive]}
                  onPress={() => { setAtmosphere(opt.value); setFormError(''); }}
                  activeOpacity={0.8}
                >
                  <Ionicons name={opt.icon} size={22} color={active ? opt.iconColor : '#8a8f98'} />
                  <Text style={[styles.gridCardLabel, active && styles.gridCardLabelActive]}>{opt.label}</Text>
                  {active && <View style={styles.gridCheck}><Ionicons name="checkmark-circle" size={14} color="#bdc2ff" /></View>}
                </TouchableOpacity>
              );
            })}
          </View>

          {formError ? (
            <View style={styles.errorRow}>
              <Ionicons name="warning-outline" size={14} color="#ffb4ab" />
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.primaryBtn, saving && { opacity: 0.5 }]}
            onPress={handleSavePreference}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving
              ? <ActivityIndicator color="#fdfaff" size="small" />
              : <>
                  <Text style={styles.primaryBtnText}>선호 저장하기</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fdfaff" />
                </>
            }
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={styles.ghostBtn}>
            <Text style={styles.ghostBtnText}>나중에 저장하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ── 호스트 대기실 ── */
  if (isHost) {
    return (
      <View style={styles.container}>
        <NavHeader initial={currentNickname[0].toUpperCase()} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
          {/* 진행 현황 */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.sectionEyebrow}>준비 현황</Text>
              <Text style={styles.progressCount}>{readyCount}/{participants.length} 준비됨</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, styles.progressGlow, { width: `${progressPct}%` as any }]} />
            </View>
          </View>

          {/* 참가자 목록 */}
          <Text style={[styles.sectionEyebrow, { marginBottom: 8 }]}>참가자</Text>
          <View style={styles.participantList}>
            {participants.map((p) => {
              const isReady = p.userId === currentUserId ? locationSaved : Boolean(p.abstractLocation);
              return (
                <View key={p.id} style={[styles.participantCard, { borderLeftColor: isReady ? '#27a644' : '#5e6ad2' }]}>
                  <View style={styles.participantAvatar}>
                    <Text style={styles.participantAvatarText}>{p.user.nickname[0]?.toUpperCase()}</Text>
                  </View>
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>{p.user.nickname}</Text>
                    <Text style={styles.participantRole}>{p.isHost ? '호스트' : '참가자'}</Text>
                  </View>
                  <View style={styles.participantStatusRow}>
                    {isReady ? (
                      <>
                        <Text style={styles.statusReady}>READY</Text>
                        <Ionicons name="checkmark-circle-outline" size={18} color="#27a644" />
                      </>
                    ) : (
                      <>
                        <Text style={styles.statusWaiting}>WAITING</Text>
                        <Ionicons name="hourglass-outline" size={18} color="#8a8f98" />
                      </>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          <TouchableOpacity onPress={() => setLocationSaved(false)} style={styles.editLink} activeOpacity={0.8}>
            <Ionicons name="create-outline" size={14} color="#8a8f98" />
            <Text style={styles.editLinkText}>내 선호 수정하기</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.piniBtn, !allReady && { opacity: 0.4 }]}
            disabled={!allReady}
            activeOpacity={0.8}
            onPress={() => setPiniLoading(true)}
          >
            <Ionicons name="flash" size={18} color="#fdfaff" />
            <Text style={styles.piniBtnText}>
              {allReady ? 'PINI 실행하기' : `대기 중 (${readyCount}/${participants.length})`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ── 참가자 대기실 ── */
  return (
    <View style={styles.container}>
      <NavHeader initial={currentNickname[0].toUpperCase()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        {/* 성공 섹션 */}
        <View style={styles.successSection}>
          <View style={styles.successIconBg}>
            <Ionicons name="checkmark-circle" size={40} color="#bdc2ff" />
          </View>
          <Text style={styles.successTitle}>선호가 저장됐어요!</Text>
          <Text style={styles.successSub}>호스트가 일정을 확정하는 동안 잠시 기다려주세요.</Text>
        </View>

        {/* 호스트 상태 카드 */}
        <View style={styles.hostStatusCard}>
          <View style={styles.hostStatusTop}>
            <View>
              <Text style={styles.sectionEyebrow}>호스트 현황</Text>
              <View style={styles.hostStatusRow}>
                <Animated.View style={[styles.pulseDot, { opacity: pulseAnim }]} />
                <Text style={styles.hostStatusLabel}>일정 분석 중</Text>
              </View>
            </View>
            <View style={styles.syncBox}>
              <Ionicons name="sync" size={20} color="#ffb867" />
            </View>
          </View>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.shimmerBar, { opacity: shimmerAnim }]} />
          </View>
          <Text style={styles.hostStatusHint}>참가자들의 일정을 분석하고 있어요...</Text>
        </View>

        {/* 참가자 준비 현황 */}
        <View style={styles.readinessHeader}>
          <Text style={styles.sectionEyebrow}>참가자 ({readyCount}/{participants.length})</Text>
          <Text style={styles.readinessPct}>{participants.length > 0 ? Math.round(progressPct) : 0}% 준비</Text>
        </View>
        <View style={styles.participantList}>
          {participants.map((p) => {
            const isReady = p.userId === currentUserId ? locationSaved : Boolean(p.abstractLocation);
            return (
              <View key={p.id} style={[styles.participantCard, { borderLeftColor: isReady ? '#27a644' : '#ffb867' }]}>
                <View style={styles.participantAvatar}>
                  <Text style={styles.participantAvatarText}>{p.user.nickname[0]?.toUpperCase()}</Text>
                </View>
                <View style={styles.participantInfo}>
                  <Text style={styles.participantName}>{p.user.nickname}</Text>
                  <Text style={[styles.participantStatus2, { color: isReady ? '#27a644' : '#ffb867' }]}>
                    {isReady ? '준비됨' : '검토 중'}
                  </Text>
                </View>
                {p.isHost && (
                  <View style={styles.hostBadge}>
                    <Text style={styles.hostBadgeText}>호스트</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* 세션 미니 카드 */}
        <View style={styles.sessionCard}>
          <View style={styles.sessionCardRow}>
            <Ionicons name="calendar-outline" size={16} color="#bdc2ff" />
            <Text style={styles.sectionEyebrow}>모임 코드</Text>
          </View>
          <Text style={styles.sessionCode}>{roomCode}</Text>
          <TouchableOpacity onPress={() => setLocationSaved(false)} style={styles.editLink} activeOpacity={0.8}>
            <Ionicons name="create-outline" size={13} color="#8a8f98" />
            <Text style={styles.editLinkText}>선호 수정하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.waitingBtn}>
          <Ionicons name="hourglass-outline" size={16} color="#8a8f98" />
          <Text style={styles.waitingBtnText}>호스트를 기다리는 중...</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#131316' },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#131316' },
  body:      { padding: 16, paddingBottom: 32 },

  /* 공통 */
  footer:       { padding: 16, borderTopWidth: 1, borderTopColor: '#23252a', gap: 10 },
  primaryBtn:   { height: 56, backgroundColor: '#5e6ad2', borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryBtnText: { fontSize: 14, fontWeight: '700', color: '#fdfaff' },
  ghostBtn:     { height: 40, alignItems: 'center', justifyContent: 'center' },
  ghostBtnText: { fontSize: 13, color: '#8a8f98', fontWeight: '500' },
  sectionEyebrow: { fontSize: 11, fontWeight: '600', color: '#8a8f98', textTransform: 'uppercase', letterSpacing: 1.2 },
  progressTrack:  { height: 4, backgroundColor: '#23252a', borderRadius: 2, overflow: 'hidden', marginTop: 8 },
  progressFill:   { height: '100%', backgroundColor: '#5e6ad2', borderRadius: 2 },
  progressGlow:   { shadowColor: '#5e6ad2', shadowOpacity: 0.6, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } },

  /* 선호 폼 */
  stepHeader:   { marginBottom: 24 },
  stepEyebrow:  { fontSize: 11, fontWeight: '600', color: '#8a8f98', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 },
  stepTitle:    { fontSize: 22, fontWeight: '700', color: '#f7f8f8', letterSpacing: -0.4 },
  fieldLabel:   { fontSize: 11, fontWeight: '600', color: '#8a8f98', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  input:        { height: 48, backgroundColor: '#0f1011', borderWidth: 1, borderColor: '#23252a', borderRadius: 8, paddingHorizontal: 16, fontSize: 14, color: '#f7f8f8', marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#f7f8f8', marginBottom: 10 },

  /* 2열 그리드 */
  grid2:         { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  gridCard:      { width: '48%', backgroundColor: '#0f1011', borderWidth: 1, borderColor: '#23252a', borderRadius: 12, padding: 14, gap: 6, position: 'relative' },
  gridCardActive:{ backgroundColor: '#141516', borderColor: '#5e6ad2' },
  gridCardLabel: { fontSize: 14, fontWeight: '500', color: '#d0d6e0' },
  gridCardLabelActive: { color: '#f7f8f8', fontWeight: '600' },
  gridCheck:     { position: 'absolute', top: 8, right: 8 },

  /* 3열 */
  grid3:      { flexDirection: 'row', gap: 8, marginBottom: 24 },
  grid3Card:  { flex: 1, backgroundColor: '#0f1011', borderWidth: 1, borderColor: '#23252a', borderRadius: 10, padding: 12, alignItems: 'center', gap: 4 },
  grid3Desc:  { fontSize: 10, color: '#8a8f98', textAlign: 'center' },

  /* 에러 */
  errorRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  errorText: { fontSize: 12, color: '#ffb4ab' },

  /* 참가자 카드 */
  participantList:   { gap: 6, marginBottom: 16 },
  participantCard:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f1011', borderWidth: 1, borderColor: '#23252a', borderRadius: 8, borderLeftWidth: 4, padding: 14, gap: 12 },
  participantAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#141516', borderWidth: 1, borderColor: '#34343a', alignItems: 'center', justifyContent: 'center' },
  participantAvatarText: { fontSize: 16, fontWeight: '700', color: '#bdc2ff' },
  participantInfo:   { flex: 1 },
  participantName:   { fontSize: 14, fontWeight: '600', color: '#f7f8f8' },
  participantRole:   { fontSize: 11, color: '#8a8f98', marginTop: 1 },
  participantStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusReady:   { fontSize: 11, fontWeight: '700', color: '#27a644', letterSpacing: 0.5 },
  statusWaiting: { fontSize: 11, fontWeight: '700', color: '#8a8f98', letterSpacing: 0.5 },
  editLink:      { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingVertical: 4 },
  editLinkText:  { fontSize: 12, color: '#8a8f98' },

  /* 호스트 대기실 */
  progressSection: { marginBottom: 24 },
  progressHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  progressCount:   { fontSize: 16, fontWeight: '700', color: '#bdc2ff' },
  piniBtn:         { height: 56, backgroundColor: '#5e6ad2', borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  piniBtnText:     { fontSize: 15, fontWeight: '700', color: '#fdfaff' },

  /* 참가자 대기실 */
  successSection: { alignItems: 'center', marginBottom: 24 },
  successIconBg:  { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(47,60,169,0.2)', borderWidth: 1, borderColor: '#2f3ca9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  successTitle:   { fontSize: 20, fontWeight: '700', color: '#f7f8f8', letterSpacing: -0.3, marginBottom: 8 },
  successSub:     { fontSize: 13, color: '#8a8f98', textAlign: 'center', paddingHorizontal: 24 },

  hostStatusCard: { backgroundColor: '#0f1011', borderWidth: 1, borderColor: '#23252a', borderRadius: 12, padding: 16, marginBottom: 20 },
  hostStatusTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  hostStatusRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  pulseDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ffb867' },
  hostStatusLabel:{ fontSize: 16, fontWeight: '600', color: '#f7f8f8' },
  syncBox:        { width: 40, height: 40, backgroundColor: '#141516', borderWidth: 1, borderColor: '#34343a', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  shimmerBar:     { height: '100%', width: '75%', backgroundColor: '#ffb867', borderRadius: 2 },
  hostStatusHint: { fontSize: 12, color: '#8a8f98', fontStyle: 'italic', marginTop: 8 },

  readinessHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  readinessPct:     { fontSize: 12, fontWeight: '600', color: '#bdc2ff' },
  participantStatus2: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  hostBadge:        { backgroundColor: 'rgba(94,106,210,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999 },
  hostBadgeText:    { fontSize: 10, fontWeight: '600', color: '#bdc2ff' },

  sessionCard:    { backgroundColor: '#141516', borderWidth: 1, borderColor: '#34343a', borderRadius: 12, padding: 14, marginTop: 8 },
  sessionCardRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  sessionCode:    { fontSize: 22, fontWeight: '700', color: '#bdc2ff', letterSpacing: 4, marginBottom: 10 },

  waitingBtn:     { height: 52, backgroundColor: '#0f1011', borderWidth: 1, borderColor: '#23252a', borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: 0.6 },
  waitingBtnText: { fontSize: 14, fontWeight: '500', color: '#8a8f98' },

  /* ── PINI 대기 화면 ── */
  piniScreen: { flex: 1, backgroundColor: '#131316', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 64 },
  piniCenter: { alignItems: 'center', gap: 16 },
  piniGlowRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(94,106,210,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(94,106,210,0.3)',
    top: -24,
  },
  piniIconBg: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(47,60,169,0.2)',
    borderWidth: 1,
    borderColor: '#2f3ca9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  piniTitle:      { fontSize: 36, fontWeight: '800', color: '#bdc2ff', letterSpacing: -1 },
  piniSubtitle:   { fontSize: 14, fontWeight: '500', color: '#8a8f98', letterSpacing: 0.5 },
  piniProgressTrack: { width: 220, height: 3, backgroundColor: '#23252a', borderRadius: 2, overflow: 'hidden', marginTop: 4 },
  piniShimmerFill:   { height: '100%', width: '70%', backgroundColor: '#5e6ad2', borderRadius: 2 },
  piniStatusText:    { fontSize: 13, color: '#8a8f98', marginTop: 4 },
  piniBadge:         { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#0f1011', borderWidth: 1, borderColor: '#23252a', borderRadius: 9999 },
  piniBadgeText:     { fontSize: 11, fontWeight: '600', color: '#8a8f98', letterSpacing: 0.5 },

  /* ── AI 결과 화면 ── */
  /* 지도 섹션 */
  mapSection:      { height: 310, position: 'relative', overflow: 'hidden', borderBottomWidth: 1, borderBottomColor: '#23252a' },
  mapBg:           { ...StyleSheet.absoluteFillObject, backgroundColor: '#1c1e24' },
  mapRoadH:        { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#23252a' },
  mapRoadV:        { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: '#23252a' },
  mapMainRoadH:    { position: 'absolute', left: 0, right: 0, height: 3, backgroundColor: '#2a2d38' },
  mapMainRoadV:    { position: 'absolute', top: 0, bottom: 0, width: 3, backgroundColor: '#2a2d38' },
  mapBlock:        { position: 'absolute', backgroundColor: '#212330', borderRadius: 3 },
  mapPinWrap:      { position: 'absolute', top: '38%', left: '48%', alignItems: 'center' },
  mapPinOuter:     { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(94,106,210,0.25)', borderWidth: 2, borderColor: '#5e6ad2', alignItems: 'center', justifyContent: 'center' },
  mapPinInner:     { width: 10, height: 10, borderRadius: 5, backgroundColor: '#5e6ad2' },
  mapPinStem:      { width: 2, height: 8, backgroundColor: '#5e6ad2', borderRadius: 1 },

  mapInfoOverlay:  { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(19,19,22,0.88)', paddingHorizontal: 16, paddingVertical: 12, gap: 4, borderTopWidth: 1, borderTopColor: '#23252a' },
  topPickBadge:    { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(255,184,103,0.15)', borderWidth: 1, borderColor: 'rgba(255,184,103,0.35)', borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 2 },
  topPickText:     { fontSize: 10, fontWeight: '700', color: '#ffb867', letterSpacing: 0.5 },
  mapPlaceName:    { fontSize: 17, fontWeight: '700', color: '#f7f8f8', letterSpacing: -0.2 },
  mapAddressRow:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  mapAddress:      { fontSize: 12, color: '#8a8f98' },
  mapMatchRow:     { flexDirection: 'row', alignItems: 'baseline' },
  mapMatchPct:     { fontSize: 18, fontWeight: '800', color: '#bdc2ff' },
  mapMatchLabel:   { fontSize: 12, color: '#8a8f98' },

  resultEyebrow:     { fontSize: 11, fontWeight: '600', color: '#454652', letterSpacing: 1.5, marginTop: 20, paddingHorizontal: 16, marginBottom: 10 },
  altScrollContent:  { paddingHorizontal: 16, gap: 10 },
  altCard:           { width: 130, backgroundColor: '#0f1011', borderWidth: 1, borderColor: '#23252a', borderRadius: 12, padding: 12, gap: 8 },
  altCardActive:     { borderColor: '#5e6ad2', backgroundColor: '#141516' },
  altIconBox:        { width: 36, height: 36, backgroundColor: '#141516', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  altName:           { fontSize: 12, fontWeight: '600', color: '#d0d6e0', lineHeight: 16 },
  altMatch:          { fontSize: 11, color: '#5e6ad2', fontWeight: '700' },

  recCard:           { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginBottom: 8, backgroundColor: '#0f1011', borderWidth: 1, borderColor: '#23252a', borderRadius: 12, padding: 14 },
  recCardActive:     { borderColor: '#5e6ad2' },
  recRankBox:        { width: 32, height: 32, borderRadius: 8, backgroundColor: '#141516', borderWidth: 1, borderColor: '#34343a', alignItems: 'center', justifyContent: 'center' },
  recRankBoxTop:     { backgroundColor: 'rgba(94,106,210,0.15)', borderColor: '#5e6ad2' },
  recRank:           { fontSize: 14, fontWeight: '700', color: '#8a8f98' },
  recRankTop:        { color: '#bdc2ff' },
  recName:           { fontSize: 14, fontWeight: '600', color: '#f7f8f8', marginBottom: 2 },
  recAddress:        { fontSize: 11, color: '#8a8f98' },
  recMatchChip:      { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#141516', borderRadius: 8, borderWidth: 1, borderColor: '#34343a' },
  recMatchChipTop:   { backgroundColor: 'rgba(94,106,210,0.15)', borderColor: '#5e6ad2' },
  recMatchText:      { fontSize: 12, fontWeight: '700', color: '#8a8f98' },
  recMatchTextTop:   { color: '#bdc2ff' },

  confirmBtn:        { height: 52, backgroundColor: '#5e6ad2', borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  confirmBtnText:    { fontSize: 14, fontWeight: '700', color: '#fdfaff' },
  retryBtn:          { height: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  retryBtnText:      { fontSize: 12, fontWeight: '600', color: '#8a8f98' },
});
