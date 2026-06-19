import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
<<<<<<< HEAD
  TouchableOpacity, ActivityIndicator, Alert, Animated, Modal, Platform, AppState,
  StatusBar, Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import WebView from 'react-native-webview';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
=======
  TouchableOpacity, ActivityIndicator, Alert, Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
>>>>>>> main
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { supabase } from '@/lib/supabase';

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
  distanceTolerance: string;
  atmospherePreference: string;
  lat: number;
  lng: number;
};

type AiPlace = {
  placeName: string;
  placeAddress: string;
  lat: number;
  lng: number;
  fairnessScore: number;
  reasoning: string;
  atmosphereMatch: string;
  rating: number;
  balanceTag: string;
  reviewIntelligence: {
    authenticCount: number;
    pros: string[];
    cons: string[];
  };
  perParticipantTime: {
    nickname: string;
    minutes: number;
    transport: string;
  }[];
};

<<<<<<< HEAD
type KakaoPlace = {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
};

const TRANSPORT_EMOJI: Record<string, string> = {
  walk: '🚶', transit: '🚇', car: '🚗', bike: '🚲',
};

=======
>>>>>>> main
const TRANSPORT_OPTIONS: { value: Transport; label: string; icon: any; iconColor: string }[] = [
  { value: 'walk', label: '도보', icon: 'walk-outline', iconColor: '#bdc2ff' },
  { value: 'transit', label: '대중교통', icon: 'subway-outline', iconColor: '#ffb867' },
  { value: 'car', label: '자동차', icon: 'car-outline', iconColor: '#7a7fad' },
  { value: 'bike', label: '자전거', icon: 'bicycle-outline', iconColor: '#27a644' },
];

const DISTANCE_OPTIONS: { value: DistanceTolerance; label: string; icon: any; desc: string }[] = [
  { value: 'short', label: '짧게', icon: 'flash-outline', desc: '15분 이내' },
  { value: 'medium', label: '적당히', icon: 'walk-outline', desc: '30분 이내' },
  { value: 'far', label: '상관없어요', icon: 'map-outline', desc: '멀어도 OK' },
];

const ATMOSPHERE_OPTIONS: { value: AtmospherePreference; label: string; icon: any; iconColor: string }[] = [
  { value: 'quiet', label: '조용한', icon: 'cafe-outline', iconColor: '#bdc2ff' },
  { value: 'lively', label: '활기찬', icon: 'musical-notes-outline', iconColor: '#ffb867' },
  { value: 'cozy', label: '아늑한', icon: 'flame-outline', iconColor: '#7a7fad' },
  { value: 'trendy', label: '트렌디한', icon: 'star-outline', iconColor: '#27a644' },
];

const PINI_STATUSES = [
  '참가자 선호도 분석 중...',
  '최적 장소 탐색 중...',
  'AI 매칭 점수 계산 중...',
  '추천 결과 정리 중...',
];

<<<<<<< HEAD
const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL;
const KAKAO_REST_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_KEY ?? '';
const KAKAO_MAP_KEY = process.env.EXPO_PUBLIC_KAKAO_MAP_KEY ?? '';

function kakaoMapHtml(lat: number, lng: number, name: string): string {
  const safeName = name.replace(/'/g, "\\'").replace(/"/g, '\\"');
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #1c1e24; }
  #map { width: 100vw; height: 100vh; }
</style>
</head>
<body>
<div id="map"></div>
<script type="text/javascript"
  src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false">
</script>
<script>
window.onerror = function(msg, src, line) {
  window.ReactNativeWebView && window.ReactNativeWebView.postMessage('ERR:' + msg + ' src=' + src + ':' + line);
};
kakao.maps.load(function() {
  var container = document.getElementById('map');
  var latlng = new kakao.maps.LatLng(${lat}, ${lng});
  var options = { center: latlng, level: 4 };
  var map = new kakao.maps.Map(container, options);
  new kakao.maps.Marker({ position: latlng, map: map });
  setTimeout(function() {
    map.relayout();
    map.setCenter(latlng);
  }, 300);
});
</script>
</body>
</html>`;
}

async function searchKakaoPlaces(query: string): Promise<KakaoPlace[]> {
  if (!query.trim() || !KAKAO_REST_KEY) return [];
  try {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=5`,
      { headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.documents ?? [];
  } catch {
    return [];
  }
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}
function formatTime(d: Date): string {
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h >= 12 ? '오후' : '오전'} ${h > 12 ? h - 12 : h === 0 ? 12 : h}:${m}`;
}
function toISOWithKST(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}+09:00`;
}

function NavHeader({ initial, onBack }: { initial: string; onBack?: () => void }) {
  const router = useRouter();
  const profileImage = useAuthStore((s) => s.user?.profileImage ?? null);
=======
function NavHeader({ initial, onBack }: { initial: string; onBack?: () => void }) {
  const router = useRouter();
>>>>>>> main
  return (
    <View style={navHdr.wrap}>
      <TouchableOpacity onPress={onBack ?? (() => router.back())} style={navHdr.backBtn} hitSlop={8}>
        <Ionicons name="chevron-back" size={22} color="#c6c5d5" />
      </TouchableOpacity>
<<<<<<< HEAD
      <Text allowFontScaling={false} style={navHdr.logo}>Clue<Text allowFontScaling={false} style={navHdr.accent}>Pot</Text></Text>
      <View style={navHdr.avatar}>
        {profileImage
          ? <Image source={{ uri: profileImage }} style={navHdr.avatarImg} />
          : <Text allowFontScaling={false} style={navHdr.avatarText}>{initial}</Text>
        }
      </View>
    </View>
  );
}
const SB_H = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;
const navHdr = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: SB_H, height: 56 + SB_H, borderBottomWidth: 1, borderBottomColor: '#23252a', backgroundColor: '#131316' },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 20, fontWeight: '700', color: '#f7f8f8', letterSpacing: -0.3 },
  accent: { color: '#bdc2ff' },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#5e6ad2', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#34343a', overflow: 'hidden' },
  avatarImg: { width: 30, height: 30, borderRadius: 15 },
=======
      <Text style={navHdr.logo}>Clue<Text style={navHdr.accent}>Pot</Text></Text>
      <View style={navHdr.avatar}><Text style={navHdr.avatarText}>{initial}</Text></View>
    </View>
  );
}
const navHdr = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderBottomColor: '#23252a', backgroundColor: '#131316' },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 20, fontWeight: '700', color: '#f7f8f8', letterSpacing: -0.3 },
  accent: { color: '#bdc2ff' },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#5e6ad2', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#34343a' },
>>>>>>> main
  avatarText: { fontSize: 12, fontWeight: '700', color: '#fdfaff' },
});


<<<<<<< HEAD
=======
const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL;

>>>>>>> main
export default function RoomScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const roomCode = code?.toUpperCase() ?? '';
  const router = useRouter();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const currentNickname = useAuthStore((s) => s.user?.nickname ?? s.user?.email ?? '?');

  const [loading, setLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [location, setLocation] = useState('');
  const [userLat, setUserLat] = useState(0);
  const [userLng, setUserLng] = useState(0);
  const [locationSuggestions, setLocationSuggestions] = useState<KakaoPlace[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [transport, setTransport] = useState<Transport | null>(null);
  const [distance, setDistance] = useState<DistanceTolerance | null>(null);
  const [atmosphere, setAtmosphere] = useState<AtmospherePreference | null>(null);
  const [locationSaved, setLocationSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [roomCategory, setRoomCategory] = useState('');

  // PINI AI 상태
  const [piniLoading, setPiniLoading] = useState(false);
  const [statusIdx, setStatusIdx] = useState(0);
  const [aiResults, setAiResults] = useState(false);
  const [aiPlaces, setAiPlaces] = useState<AiPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<AiPlace | null>(null);
<<<<<<< HEAD
  const [openDrawerIdx, setOpenDrawerIdx] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);

  // 날짜/시간 피커 상태
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(18, 0, 0, 0);
  const [scheduledDateTime, setScheduledDateTime] = useState<Date>(tomorrow);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showNativeDatePicker, setShowNativeDatePicker] = useState(false);
  const [showNativeTimePicker, setShowNativeTimePicker] = useState(false);
=======
>>>>>>> main

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0.4)).current;
  const piniGlow = useRef(new Animated.Value(0.5)).current;
  const piniPulse = useRef(new Animated.Value(1)).current;
<<<<<<< HEAD
  const piniProgressAnim = useRef(new Animated.Value(0)).current;
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
=======
>>>>>>> main

  useEffect(() => { init(); }, [roomCode]);

  useEffect(() => {
<<<<<<< HEAD
    const channel = supabase
      .channel(`room-${roomCode}`)
      .on('broadcast', { event: 'room-done' }, ({ payload }: { payload: { scheduleId?: string } }) => {
        if (payload?.scheduleId) {
          router.replace(`/(app)/schedules/${payload.scheduleId}` as any);
        } else {
          router.replace('/(app)/calendar' as any);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_members' }, async () => {
        try {
          const { data: pData } = await api.get(`/rooms/${roomCode}/participants`);
          setParticipants(pData.participants);
        } catch {}
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [roomCode]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', async (state) => {
      if (state === 'active') {
        try {
          const { data } = await api.post(`/rooms/${roomCode}/join`);
          if (data?.roomStatus === 'done' && data?.scheduleId) {
            router.replace(`/(app)/schedules/${data.scheduleId}` as any);
          } else if (data?.roomStatus === 'done') {
            router.replace('/(app)/calendar' as any);
          }
        } catch {}
      }
    });
    return () => sub.remove();
  }, [roomCode]);

  useEffect(() => {
=======
>>>>>>> main
    if (locationSaved && !isHost) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
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
        Animated.timing(piniGlow, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(piniGlow, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(piniPulse, { toValue: 1.08, duration: 1800, useNativeDriver: true }),
        Animated.timing(piniPulse, { toValue: 0.95, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
<<<<<<< HEAD
    return () => { clearInterval(interval); };
  }, [piniLoading]);

  function handleLocationChange(text: string) {
    setLocation(text);
    setUserLat(0);
    setUserLng(0);
    setFormError('');
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!text.trim()) { setLocationSuggestions([]); setShowSuggestions(false); return; }
    searchTimer.current = setTimeout(async () => {
      const results = await searchKakaoPlaces(text);
      setLocationSuggestions(results);
      setShowSuggestions(results.length > 0);
    }, 350);
  }

  function handleSelectPlace(place: KakaoPlace) {
    setLocation(place.place_name);
    setUserLat(parseFloat(place.y));
    setUserLng(parseFloat(place.x));
    setLocationSuggestions([]);
    setShowSuggestions(false);
  }

  async function runPini(excludePlaces: string[] = []) {
=======

    return () => { clearInterval(interval); };
  }, [piniLoading]);

  async function runPini(excludePlaces: string[] = []) {
    // 선호도가 저장된 참가자만 필터링
>>>>>>> main
    const body = {
      participants: participants
        .filter(p => p.abstractLocation)
        .map(p => ({
          nickname: p.user.nickname,
          abstractLocation: p.abstractLocation,
          transports: p.transports,
          distanceTolerance: p.distanceTolerance,
          atmospherePreference: p.atmospherePreference,
          lat: p.lat ?? 0,
          lng: p.lng ?? 0,
        })),
      category: roomCategory,
      excludePlaces,
<<<<<<< HEAD
    };
    const res = await fetch(`${WEB_URL}/api/pini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return await res.json();
  }

  async function handleRunPini(excludePlaces: string[] = []) {
    setPiniLoading(true);
    piniProgressAnim.setValue(0);
    const slowProgress = Animated.timing(piniProgressAnim, {
      toValue: 0.88,
      duration: 12000,
      useNativeDriver: false,
    });
    slowProgress.start();
    try {
      const places = await runPini(excludePlaces);
      slowProgress.stop();
      await new Promise<void>((resolve) => {
        Animated.timing(piniProgressAnim, { toValue: 1, duration: 350, useNativeDriver: false }).start(() => resolve());
      });
=======
    }
    const res = await fetch(`${WEB_URL}/api/pini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error((await res.json()).error);
    return await res.json();
  };

  async function handleRunPini(excludePlaces: string[] = []) {
    setPiniLoading(true);
    try {
      const places = await runPini(excludePlaces);
>>>>>>> main
      setAiPlaces(places);
      setSelectedPlace(places[0]);
      setAiResults(true);
    } catch (e) {
<<<<<<< HEAD
      slowProgress.stop();
=======
>>>>>>> main
      const msg = e instanceof Error ? e.message : 'PINI 추천에 실패했어요.';
      Alert.alert('오류', msg);
    } finally {
      setPiniLoading(false);
    }
  }

<<<<<<< HEAD
  async function handleConfirm() {
    if (!selectedPlace) return;
    setShowDateModal(true);
  }

  async function handleScheduleConfirm() {
    if (!selectedPlace) return;
    setShowDateModal(false);
    setConfirming(true);
    try {
      const { data: scheduleData } = await api.post('/schedules', {
        roomCode,
        title: selectedPlace.placeName,
        placeName: selectedPlace.placeName,
        placeAddress: selectedPlace.placeAddress,
        lat: selectedPlace.lat,
        lng: selectedPlace.lng,
        scheduledAt: toISOWithKST(scheduledDateTime),
      });
      await supabase.channel(`room-${roomCode}`).send({
        type: 'broadcast',
        event: 'room-done',
        payload: { scheduleId: scheduleData.id },
      });
      router.replace(`/(app)/schedules/${scheduleData.id}` as any);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '일정 저장에 실패했어요.';
      Alert.alert('오류', msg);
    } finally {
      setConfirming(false);
    }
  }

=======
>>>>>>> main
  async function init() {
    setLoading(true);
    setIsHost(false);
    setParticipants([]);
    setLocation('');
    setUserLat(0);
    setUserLng(0);
    setTransport(null);
    setDistance(null);
    setAtmosphere(null);
    setLocationSaved(false);
    setFormError('');
    setRoomCategory('');
    setPiniLoading(false);
    setAiResults(false);
    setAiPlaces([]);
    setSelectedPlace(null);
    setOpenDrawerIdx(null);
    try {
      const { data: joinData } = await api.post(`/rooms/${roomCode}/join`);
      if (joinData.roomStatus === 'done' && joinData.scheduleId) {
        router.replace(`/(app)/schedules/${joinData.scheduleId}` as any);
        return;
      }
      setIsHost(joinData.isHost);
      setRoomCategory(joinData.category);
      if (joinData.savedPreference) {
        setLocation(joinData.savedPreference.abstractLocation);
        setUserLat(joinData.savedPreference.lat ?? 0);
        setUserLng(joinData.savedPreference.lng ?? 0);
        setTransport(joinData.savedPreference.transports[0] ?? null);
        setDistance(joinData.savedPreference.distanceTolerance ?? null);
        setAtmosphere(joinData.savedPreference.atmospherePreference ?? null);
        setLocationSaved(true);
      }
      const { data: pData } = await api.get(`/rooms/${roomCode}/participants`);
      setParticipants(pData.participants);
    } catch (e: any) {
      const msg = e?.response?.status === 404 || e?.response?.data?.error?.includes('없')
        ? '삭제된 모임이에요.'
        : '방에 입장할 수 없어요.';
      Alert.alert('오류', msg, [{ text: '확인', onPress: () => router.back() }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePreference() {
    if (!location.trim()) { setFormError('출발 지역을 입력해주세요.'); return; }
    if (!transport) { setFormError('교통수단을 선택해주세요.'); return; }
    if (!distance) { setFormError('이동 거리 선호를 선택해주세요.'); return; }
    if (!atmosphere) { setFormError('분위기 선호를 선택해주세요.'); return; }
    setFormError('');
    setSaving(true);
    try {
      await api.post(`/rooms/${roomCode}/preference`, {
        abstractLocation: location, lat: userLat, lng: userLng,
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
<<<<<<< HEAD
            <Text allowFontScaling={false} style={styles.piniTitle}>PINI AI</Text>
            <Text allowFontScaling={false} style={styles.piniSubtitle}>Analyzing Preferences</Text>
            <View style={styles.piniProgressTrack}>
              <Animated.View style={[styles.piniShimmerFill, {
                width: piniProgressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              }]} />
=======
            <Text style={styles.piniTitle}>PINI AI</Text>
            <Text style={styles.piniSubtitle}>Analyzing Preferences</Text>
            <View style={styles.piniProgressTrack}>
              <Animated.View style={[styles.piniShimmerFill, { opacity: piniGlow }]} />
>>>>>>> main
            </View>
            <Animated.Text style={[styles.piniStatusText, { opacity: piniGlow }]}>
              {PINI_STATUSES[statusIdx]}
            </Animated.Text>
          </View>
          <View style={styles.piniBadge}>
            <Ionicons name="flash" size={11} color="#bdc2ff" />
<<<<<<< HEAD
            <Text allowFontScaling={false} style={styles.piniBadgeText}>Powered by PINI</Text>
=======
            <Text style={styles.piniBadgeText}>Powered by PINI</Text>
>>>>>>> main
          </View>
        </View>
      </View>
    );
  }

  /* ── AI 장소추천 결과 화면 ── */
  if (aiResults) {
<<<<<<< HEAD
    const isTopPick = selectedPlace?.placeName === aiPlaces[0]?.placeName;
    const mapLat = selectedPlace?.lat ?? 37.5665;
    const mapLng = selectedPlace?.lng ?? 126.9780;
    const mapName = selectedPlace?.placeName ?? '';

    return (
      <View style={styles.container}>
        <NavHeader initial={currentNickname[0].toUpperCase()} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        {/* 카카오 지도 + 정보 섹션 */}
        <View style={styles.mapSection}>
          {Platform.OS !== 'web' ? (
            <WebView
              key={`${mapLat}-${mapLng}`}
              source={{ html: kakaoMapHtml(mapLat, mapLng, mapName) }}
              style={styles.mapWebView}
              originWhitelist={['*']}
              javaScriptEnabled
              domStorageEnabled
              mixedContentMode="always"
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              onError={(e) => console.warn('[Map] WebView error:', e.nativeEvent)}
              onHttpError={(e) => console.warn('[Map] HTTP error:', e.nativeEvent.statusCode, e.nativeEvent.url)}
              onMessage={(e) => console.log('[Map] message:', e.nativeEvent.data)}
            />
          ) : (
            <View style={[styles.mapWebView, styles.mapWebFallback]}>
              <Ionicons name="map-outline" size={32} color="#34343a" />
              <Text allowFontScaling={false} style={styles.mapWebFallbackText}>지도는 앱에서 확인하세요</Text>
            </View>
          )}

=======
    const isTopPick = selectedPlace?.placeName === aiPlaces[0]?.placeName

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
              [10, 10, 60, 28], [105, 10, 80, 28], [200, 10, 70, 28],
              [10, 48, 50, 28], [100, 48, 90, 28], [205, 48, 60, 28],
              [10, 90, 70, 28], [105, 90, 70, 28], [210, 90, 60, 28],
              [10, 150, 90, 24], [115, 150, 60, 24], [200, 150, 70, 24],
              [10, 192, 60, 24], [100, 192, 80, 24], [205, 192, 55, 24],
            ].map(([l, t, w, h], i) => (
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

>>>>>>> main
          {/* 정보 오버레이 */}
          <View style={styles.mapInfoOverlay}>
            {isTopPick && (
              <View style={styles.topPickBadge}>
                <Ionicons name="star" size={11} color="#ffb867" />
<<<<<<< HEAD
                <Text allowFontScaling={false} style={styles.topPickText}>Top Pick</Text>
              </View>
            )}
            <Text allowFontScaling={false} style={styles.mapPlaceName}>{selectedPlace?.placeName}</Text>
            <View style={styles.mapAddressRow}>
              <Ionicons name="location-outline" size={12} color="#8a8f98" />
              <Text allowFontScaling={false} style={styles.mapAddress}>{selectedPlace?.placeAddress}</Text>
            </View>
            <View style={styles.mapMatchRow}>
              <Text allowFontScaling={false} style={styles.mapMatchPct}>{selectedPlace?.atmosphereMatch}</Text>
              <Text allowFontScaling={false} style={styles.mapMatchLabel}> 매칭</Text>
            </View>
          </View>
        </View>
          {/* 대안 가로 스크롤 */}
          <Text allowFontScaling={false} style={styles.resultEyebrow}>ALTERNATIVE OPTIONS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.altScrollContent}>
=======
                <Text style={styles.topPickText}>Top Pick</Text>
              </View>
            )}
            <Text style={styles.mapPlaceName}>{selectedPlace?.placeName}</Text>
            <View style={styles.mapAddressRow}>
              <Ionicons name="location-outline" size={12} color="#8a8f98" />
              <Text style={styles.mapAddress}>{selectedPlace?.placeAddress}</Text>
            </View>
            <View style={styles.mapMatchRow}>
              <Text style={styles.mapMatchPct}>{selectedPlace?.atmosphereMatch}</Text>
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
>>>>>>> main
            {aiPlaces.map((alt, i) => {
              const isActive = selectedPlace?.placeName === alt.placeName;
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.altCard, isActive && styles.altCardActive]}
                  onPress={() => setSelectedPlace(alt)}
<<<<<<< HEAD
                  activeOpacity={0.75}
                  accessibilityLabel={`${alt.placeName} 선택`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                >
                  <View style={[styles.altIconBox, isActive && styles.altIconBoxActive]}>
                    <Ionicons name="location-outline" size={18} color={isActive ? '#bdc2ff' : '#8a8f98'} />
                  </View>
                  <Text allowFontScaling={false} style={[styles.altName, isActive && { color: '#f7f8f8' }]} numberOfLines={2}>{alt.placeName}</Text>
                  <Text allowFontScaling={false} style={[styles.altMatch, isActive && { color: '#bdc2ff' }]}>{alt.atmosphereMatch}</Text>
=======
                  activeOpacity={0.8}
                >
                  <View style={styles.altIconBox}>
                    <Ionicons name="location-outline" size={18} color={isActive ? '#bdc2ff' : '#8a8f98'} />
                  </View>
                  <Text style={[styles.altName, isActive && { color: '#f7f8f8' }]} numberOfLines={2}>{alt.placeName}</Text>
                  <Text style={[styles.altMatch, isActive && { color: '#bdc2ff' }]}>{alt.atmosphereMatch} fit</Text>
>>>>>>> main
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* 추천 목록 */}
<<<<<<< HEAD
          <Text allowFontScaling={false} style={[styles.resultEyebrow, { paddingHorizontal: 16, marginTop: 24 }]}>RECOMMENDATIONS</Text>
          {aiPlaces.map((place, i) => {
            const isSelected = selectedPlace?.placeName === place.placeName;
            const drawerOpen = openDrawerIdx === i;
            const scoreColor = place.fairnessScore >= 90 ? '#27a644' : place.fairnessScore >= 75 ? '#ffb867' : '#8a8f98';
            return (
              <TouchableOpacity
                key={i}
                style={[styles.recCard, isSelected && styles.recCardActive, i === 0 && styles.recCardTop]}
                onPress={() => setSelectedPlace(place)}
                activeOpacity={0.75}
                accessibilityLabel={`${place.placeName} 선택`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <View style={styles.recCardHeader}>
                  <View style={[styles.recRankBox, i === 0 && styles.recRankBoxTop]}>
                    <Text allowFontScaling={false} style={[styles.recRank, i === 0 && styles.recRankTop]}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text allowFontScaling={false} style={styles.recName}>{place.placeName}</Text>
                    <Text allowFontScaling={false} style={styles.recAddress}>{place.placeAddress}</Text>
                    <View style={styles.recMetaRow}>
                      <View style={[styles.recScorePill, { backgroundColor: `${scoreColor}22` }]}>
                        <Text allowFontScaling={false} style={[styles.recScoreText, { color: scoreColor }]}>균형도 {place.fairnessScore}%</Text>
                      </View>
                      <Text allowFontScaling={false} style={styles.recAtmosphere}>{place.atmosphereMatch}</Text>
                    </View>
                  </View>
                  <View style={[styles.recMatchChip, i === 0 && styles.recMatchChipTop]}>
                    <Text allowFontScaling={false} style={[styles.recMatchText, i === 0 && styles.recMatchTextTop]}>★ {place.rating.toFixed(1)}</Text>
                  </View>
                </View>

                <Text allowFontScaling={false} style={styles.recReasoning}>{place.reasoning}</Text>
                <View style={styles.recDivider} />

                <View style={styles.recTravelSection}>
                  <Text allowFontScaling={false} style={styles.recTravelLabel}>참가자별 이동</Text>
                  {place.perParticipantTime.map(p => (
                    <View key={p.nickname} style={styles.recTravelRow}>
                      <Text allowFontScaling={false} style={styles.recTravelEmoji}>{TRANSPORT_EMOJI[p.transport] ?? '🚌'}</Text>
                      <Text allowFontScaling={false} style={styles.recTravelNickname}>{p.nickname}</Text>
                      <Text allowFontScaling={false} style={styles.recTravelMinutes}>{p.minutes}분</Text>
                    </View>
                  ))}
                  {(() => {
                    const times = place.perParticipantTime.map(p => p.minutes);
                    const diff = times.length > 0 ? Math.max(...times) - Math.min(...times) : 0;
                    const diffColor = diff <= 5 ? '#27a644' : diff <= 12 ? '#ffb867' : '#8a8f98';
                    const diffText = diff <= 5 ? `${diff}분 차이 — 균등해요 ✓` : `최대 ${diff}분 차이`;
                    return (
                      <View style={[styles.recDiffPill, { backgroundColor: `${diffColor}18` }]}>
                        <Text allowFontScaling={false} style={[styles.recDiffText, { color: diffColor }]}>{diffText}</Text>
                      </View>
                    );
                  })()}
                </View>

                <TouchableOpacity
                  onPress={() => setOpenDrawerIdx(drawerOpen ? null : i)}
                  style={styles.drawerToggle}
                  activeOpacity={0.7}
                  accessibilityLabel={drawerOpen ? '후기 접기' : '후기 및 상세 보기'}
                  accessibilityState={{ expanded: drawerOpen }}
                >
                  <Text allowFontScaling={false} style={styles.drawerToggleText}>{drawerOpen ? '접기' : '후기 · 상세 보기'}</Text>
                  <Ionicons name={drawerOpen ? 'chevron-up' : 'chevron-down'} size={13} color="#5e6ad2" />
                </TouchableOpacity>

                {drawerOpen && (
                  <View style={styles.drawerContent}>
                    <View style={styles.drawerHeader}>
                      <Text allowFontScaling={false} style={styles.drawerTitle}>PINI 리뷰 분석</Text>
                      <View style={styles.drawerCountChip}>
                        <Text allowFontScaling={false} style={styles.drawerCountText}>검증 후기 {place.reviewIntelligence.authenticCount}개</Text>
                      </View>
                    </View>
                    {place.reviewIntelligence.pros.length > 0 && (
                      <View style={styles.drawerProsSection}>
                        <Text allowFontScaling={false} style={styles.drawerProsLabel}>좋은 점</Text>
                        {place.reviewIntelligence.pros.map(pro => (
                          <Text allowFontScaling={false} key={pro} style={styles.drawerProItem}>✓  {pro}</Text>
                        ))}
                      </View>
                    )}
                    {place.reviewIntelligence.cons.length > 0 && (
                      <View>
                        <Text allowFontScaling={false} style={styles.drawerConsLabel}>참고할 점</Text>
                        {place.reviewIntelligence.cons.map(con => (
                          <Text allowFontScaling={false} key={con} style={styles.drawerConItem}>△  {con}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                )}
=======
          <Text style={[styles.resultEyebrow, { paddingHorizontal: 16, marginTop: 20 }]}>RECOMMENDATIONS</Text>
          {aiPlaces.map((place, i) => {
            const isSelected = selectedPlace?.placeName === place.placeName;
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
                  <Text style={styles.recName}>{place.placeName}</Text>
                  <Text style={styles.recAddress}>{place.placeAddress}</Text>
                </View>
                <View style={[styles.recMatchChip, i === 0 && styles.recMatchChipTop]}>
                  <Text style={[styles.recMatchText, i === 0 && styles.recMatchTextTop]}>{place.atmosphereMatch}</Text>
                </View>
>>>>>>> main
              </TouchableOpacity>
            );
          })}
        </ScrollView>

<<<<<<< HEAD
        {/* Android 네이티브 날짜/시간 피커 (Modal 외부) */}
        {Platform.OS === 'android' && showNativeDatePicker && (
          <DateTimePicker
            value={scheduledDateTime}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(_: DateTimePickerEvent, date?: Date) => {
              setShowNativeDatePicker(false);
              if (date) {
                const next = new Date(date);
                next.setHours(scheduledDateTime.getHours(), scheduledDateTime.getMinutes());
                setScheduledDateTime(next);
              }
            }}
          />
        )}
        {Platform.OS === 'android' && showNativeTimePicker && (
          <DateTimePicker
            value={scheduledDateTime}
            mode="time"
            display="default"
            minuteInterval={10}
            onChange={(_: DateTimePickerEvent, date?: Date) => {
              setShowNativeTimePicker(false);
              if (date) {
                const next = new Date(scheduledDateTime);
                next.setHours(date.getHours(), date.getMinutes());
                setScheduledDateTime(next);
              }
            }}
          />
        )}

        {/* 날짜/시간 선택 모달 */}
        <Modal visible={showDateModal} transparent animationType="slide" onRequestClose={() => setShowDateModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHandleBar} />
              <Text allowFontScaling={false} style={styles.modalTitle}>일정 날짜 · 시간 선택</Text>
              <Text allowFontScaling={false} style={styles.modalSubtitle}>{selectedPlace?.placeName}</Text>

              {Platform.OS === 'web' ? (
                /* Web 폴백: TextInput */
                <>
                  <View style={styles.pickerRow}>
                    <View style={styles.pickerRowLeft}>
                      <Ionicons name="calendar-outline" size={18} color="#bdc2ff" />
                      <Text allowFontScaling={false} style={styles.pickerRowLabel}>날짜</Text>
                    </View>
                    <TextInput
                      style={styles.pickerTextInput}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#454652"
                      value={scheduledDateTime.toISOString().slice(0, 10)}
                      onChangeText={(t) => {
                        const d = new Date(t);
                        if (!isNaN(d.getTime())) {
                          const next = new Date(d);
                          next.setHours(scheduledDateTime.getHours(), scheduledDateTime.getMinutes());
                          setScheduledDateTime(next);
                        }
                      }}
                    />
                  </View>
                  <View style={styles.pickerRow}>
                    <View style={styles.pickerRowLeft}>
                      <Ionicons name="time-outline" size={18} color="#bdc2ff" />
                      <Text allowFontScaling={false} style={styles.pickerRowLabel}>시간</Text>
                    </View>
                    <TextInput
                      style={styles.pickerTextInput}
                      placeholder="HH:MM"
                      placeholderTextColor="#454652"
                      value={`${String(scheduledDateTime.getHours()).padStart(2, '0')}:${String(scheduledDateTime.getMinutes()).padStart(2, '0')}`}
                      onChangeText={(t) => {
                        const [h, m] = t.split(':').map(Number);
                        if (!isNaN(h) && !isNaN(m)) {
                          const next = new Date(scheduledDateTime);
                          next.setHours(h, m);
                          setScheduledDateTime(next);
                        }
                      }}
                    />
                  </View>
                </>
              ) : Platform.OS === 'android' ? (
                /* Android: 버튼으로 네이티브 다이얼로그 트리거 */
                <>
                  <TouchableOpacity style={styles.pickerRow} onPress={() => setShowNativeDatePicker(true)} activeOpacity={0.8}>
                    <View style={styles.pickerRowLeft}>
                      <Ionicons name="calendar-outline" size={18} color="#bdc2ff" />
                      <Text allowFontScaling={false} style={styles.pickerRowLabel}>날짜</Text>
                    </View>
                    <Text allowFontScaling={false} style={styles.pickerRowValue}>{formatDate(scheduledDateTime)}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.pickerRow} onPress={() => setShowNativeTimePicker(true)} activeOpacity={0.8}>
                    <View style={styles.pickerRowLeft}>
                      <Ionicons name="time-outline" size={18} color="#bdc2ff" />
                      <Text allowFontScaling={false} style={styles.pickerRowLabel}>시간</Text>
                    </View>
                    <Text allowFontScaling={false} style={styles.pickerRowValue}>{formatTime(scheduledDateTime)}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                /* iOS: 인라인 스피너 피커 */
                <>
                  <View style={styles.pickerLabelRow}>
                    <Ionicons name="calendar-outline" size={15} color="#636878" />
                    <Text allowFontScaling={false} style={styles.pickerSectionLabel}>날짜</Text>
                    <Text allowFontScaling={false} style={styles.pickerSectionValue}>{formatDate(scheduledDateTime)}</Text>
                  </View>
                  <DateTimePicker
                    value={scheduledDateTime}
                    mode="date"
                    display="spinner"
                    textColor="#f7f8f8"
                    minimumDate={new Date()}
                    onChange={(_: DateTimePickerEvent, date?: Date) => {
                      if (date) {
                        const next = new Date(date);
                        next.setHours(scheduledDateTime.getHours(), scheduledDateTime.getMinutes());
                        setScheduledDateTime(next);
                      }
                    }}
                    style={styles.pickerInline}
                  />
                  <View style={[styles.pickerLabelRow, { marginTop: 8 }]}>
                    <Ionicons name="time-outline" size={15} color="#636878" />
                    <Text allowFontScaling={false} style={styles.pickerSectionLabel}>시간</Text>
                    <Text allowFontScaling={false} style={styles.pickerSectionValue}>{formatTime(scheduledDateTime)}</Text>
                  </View>
                  <DateTimePicker
                    value={scheduledDateTime}
                    mode="time"
                    display="spinner"
                    textColor="#f7f8f8"
                    minuteInterval={10}
                    onChange={(_: DateTimePickerEvent, date?: Date) => {
                      if (date) {
                        const next = new Date(scheduledDateTime);
                        next.setHours(date.getHours(), date.getMinutes());
                        setScheduledDateTime(next);
                      }
                    }}
                    style={styles.pickerInline}
                  />
                </>
              )}

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowDateModal(false)}
                  activeOpacity={0.8}
                >
                  <Text allowFontScaling={false} style={styles.modalCancelText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={handleScheduleConfirm}
                  activeOpacity={0.8}
                >
                  <Text allowFontScaling={false} style={styles.modalConfirmText}>확정하기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* 하단 버튼 */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.confirmBtn, confirming && { opacity: 0.5 }]}
            onPress={handleConfirm}
            disabled={confirming}
            activeOpacity={0.75}
            accessibilityLabel="선택한 장소로 플랜 확정하기"
            accessibilityRole="button"
          >
            {confirming
              ? <ActivityIndicator color="#fdfaff" size="small" />
              : <>
                  <Ionicons name="checkmark-circle" size={20} color="#fdfaff" />
                  <Text allowFontScaling={false} style={styles.confirmBtnText}>선택 플랜 확정하기</Text>
                </>
            }
=======
        {/* 하단 버튼 */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() => router.push(`/(app)/calendar/${roomCode}` as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#fdfaff" />
            <Text style={styles.confirmBtnText}>선택 플랜 확정하기</Text>
>>>>>>> main
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => handleRunPini(aiPlaces.map(p => p.placeName))}
<<<<<<< HEAD
            activeOpacity={0.75}
            accessibilityLabel="다시 추천받기"
            accessibilityRole="button"
          >
            <Ionicons name="refresh-outline" size={15} color="#8a8f98" />
            <Text allowFontScaling={false} style={styles.retryBtnText}>다시 추천받기</Text>
          </TouchableOpacity>
        </View>
      </View>
=======
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={16} color="#8a8f98" />
            <Text style={styles.retryBtnText}>다시 추천받기</Text>
          </TouchableOpacity>
        </View>
      </View >
>>>>>>> main
    );
  }

  /* ── 선호 입력 폼 ── */
  if (!locationSaved) {
    return (
      <View style={styles.container}>
        <NavHeader initial={currentNickname[0].toUpperCase()} />
<<<<<<< HEAD
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          {/* 스텝 헤더 */}
          <View style={styles.stepHeader}>
            <Text allowFontScaling={false} style={styles.stepEyebrow}>STEP 2 OF 4</Text>
            <Text allowFontScaling={false} style={styles.stepTitle}>내 정보 알려주기</Text>
=======
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
          {/* 스텝 헤더 */}
          <View style={styles.stepHeader}>
            <Text style={styles.stepEyebrow}>STEP 2 OF 4</Text>
            <Text style={styles.stepTitle}>내 정보 알려주기</Text>
>>>>>>> main
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '50%' }]} />
            </View>
          </View>

<<<<<<< HEAD
          {/* 출발 지역 — 카카오 검색 */}
          <Text allowFontScaling={false} style={styles.fieldLabel}>출발 지역</Text>
          <View style={styles.locationWrap}>
            <View style={[styles.locationInputRow, showSuggestions && styles.locationInputRowOpen]}>
              <Ionicons name="search-outline" size={16} color="#636878" style={{ marginLeft: 12 }} />
              <TextInput
                style={styles.locationInput}
                placeholder="지역, 주소, 지하철역으로 검색"
                placeholderTextColor="#454652"
                value={location}
                onChangeText={handleLocationChange}
                returnKeyType="search"
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              />
              {location.length > 0 && (
                <TouchableOpacity
                  onPress={() => { setLocation(''); setUserLat(0); setUserLng(0); setLocationSuggestions([]); setShowSuggestions(false); }}
                  style={styles.locationClearBtn}
                  hitSlop={8}
                >
                  <Ionicons name="close-circle" size={16} color="#636878" />
                </TouchableOpacity>
              )}
            </View>
            {showSuggestions && locationSuggestions.length > 0 && (
              <View style={styles.suggestionList}>
                {locationSuggestions.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.suggestionItem}
                    onPress={() => handleSelectPlace(item)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="location-outline" size={14} color="#5e6ad2" style={{ marginTop: 1 }} />
                    <View style={{ flex: 1 }}>
                      <Text allowFontScaling={false} style={styles.suggestionName}>{item.place_name}</Text>
                      <Text allowFontScaling={false} style={styles.suggestionAddress} numberOfLines={1}>
                        {item.road_address_name || item.address_name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {userLat !== 0 && (
              <View style={styles.locationConfirmed}>
                <Ionicons name="checkmark-circle" size={13} color="#27a644" />
                <Text allowFontScaling={false} style={styles.locationConfirmedText}>위치 확인됨</Text>
              </View>
            )}
          </View>

          {/* 이동 수단 — 2열 그리드 */}
          <Text allowFontScaling={false} style={styles.sectionTitle}>이동 수단</Text>
=======
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
>>>>>>> main
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
<<<<<<< HEAD
                  <Text allowFontScaling={false} style={[styles.gridCardLabel, active && styles.gridCardLabelActive]}>{opt.label}</Text>
=======
                  <Text style={[styles.gridCardLabel, active && styles.gridCardLabelActive]}>{opt.label}</Text>
>>>>>>> main
                  {active && <View style={styles.gridCheck}><Ionicons name="checkmark-circle" size={14} color="#bdc2ff" /></View>}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 이동 거리 — 3열 */}
<<<<<<< HEAD
          <Text allowFontScaling={false} style={styles.sectionTitle}>이동 거리 선호</Text>
=======
          <Text style={styles.sectionTitle}>이동 거리 선호</Text>
>>>>>>> main
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
<<<<<<< HEAD
                  <Text allowFontScaling={false} style={[styles.gridCardLabel, active && styles.gridCardLabelActive]}>{opt.label}</Text>
                  <Text allowFontScaling={false} style={styles.grid3Desc}>{opt.desc}</Text>
=======
                  <Text style={[styles.gridCardLabel, active && styles.gridCardLabelActive]}>{opt.label}</Text>
                  <Text style={styles.grid3Desc}>{opt.desc}</Text>
>>>>>>> main
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 선호 분위기 — 2열 그리드 */}
<<<<<<< HEAD
          <Text allowFontScaling={false} style={styles.sectionTitle}>선호 분위기</Text>
=======
          <Text style={styles.sectionTitle}>선호 분위기</Text>
>>>>>>> main
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
<<<<<<< HEAD
                  <Text allowFontScaling={false} style={[styles.gridCardLabel, active && styles.gridCardLabelActive]}>{opt.label}</Text>
=======
                  <Text style={[styles.gridCardLabel, active && styles.gridCardLabelActive]}>{opt.label}</Text>
>>>>>>> main
                  {active && <View style={styles.gridCheck}><Ionicons name="checkmark-circle" size={14} color="#bdc2ff" /></View>}
                </TouchableOpacity>
              );
            })}
          </View>

          {formError ? (
            <View style={styles.errorRow}>
              <Ionicons name="warning-outline" size={14} color="#ffb4ab" />
<<<<<<< HEAD
              <Text allowFontScaling={false} style={styles.errorText}>{formError}</Text>
=======
              <Text style={styles.errorText}>{formError}</Text>
>>>>>>> main
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
<<<<<<< HEAD
                <Text allowFontScaling={false} style={styles.primaryBtnText}>선호 저장하기</Text>
=======
                <Text style={styles.primaryBtnText}>선호 저장하기</Text>
>>>>>>> main
                <Ionicons name="arrow-forward" size={16} color="#fdfaff" />
              </>
            }
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={styles.ghostBtn}>
<<<<<<< HEAD
            <Text allowFontScaling={false} style={styles.ghostBtnText}>나중에 저장하기</Text>
=======
            <Text style={styles.ghostBtnText}>나중에 저장하기</Text>
>>>>>>> main
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
<<<<<<< HEAD
              <Text allowFontScaling={false} style={styles.sectionEyebrow}>준비 현황</Text>
              <Text allowFontScaling={false} style={styles.progressCount}>{readyCount}/{participants.length} 준비됨</Text>
=======
              <Text style={styles.sectionEyebrow}>준비 현황</Text>
              <Text style={styles.progressCount}>{readyCount}/{participants.length} 준비됨</Text>
>>>>>>> main
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, styles.progressGlow, { width: `${progressPct}%` as any }]} />
            </View>
          </View>

          {/* 참가자 목록 */}
<<<<<<< HEAD
          <Text allowFontScaling={false} style={[styles.sectionEyebrow, { marginBottom: 8 }]}>참가자</Text>
=======
          <Text style={[styles.sectionEyebrow, { marginBottom: 8 }]}>참가자</Text>
>>>>>>> main
          <View style={styles.participantList}>
            {participants.map((p) => {
              const isReady = p.userId === currentUserId ? locationSaved : Boolean(p.abstractLocation);
              return (
                <View key={p.id} style={[styles.participantCard, { borderLeftColor: isReady ? '#27a644' : '#5e6ad2' }]}>
                  <View style={styles.participantAvatar}>
<<<<<<< HEAD
                    {p.user.profileImage
                      ? <Image source={{ uri: p.user.profileImage }} style={styles.participantAvatarImg} />
                      : <Text allowFontScaling={false} style={styles.participantAvatarText}>{p.user.nickname[0]?.toUpperCase()}</Text>
                    }
                  </View>
                  <View style={styles.participantInfo}>
                    <Text allowFontScaling={false} style={styles.participantName}>{p.user.nickname}</Text>
                    <Text allowFontScaling={false} style={styles.participantRole}>{p.isHost ? '호스트' : '참가자'}</Text>
=======
                    <Text style={styles.participantAvatarText}>{p.user.nickname[0]?.toUpperCase()}</Text>
                  </View>
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>{p.user.nickname}</Text>
                    <Text style={styles.participantRole}>{p.isHost ? '호스트' : '참가자'}</Text>
>>>>>>> main
                  </View>
                  <View style={styles.participantStatusRow}>
                    {isReady ? (
                      <>
<<<<<<< HEAD
                        <Text allowFontScaling={false} style={styles.statusReady}>READY</Text>
=======
                        <Text style={styles.statusReady}>READY</Text>
>>>>>>> main
                        <Ionicons name="checkmark-circle-outline" size={18} color="#27a644" />
                      </>
                    ) : (
                      <>
<<<<<<< HEAD
                        <Text allowFontScaling={false} style={styles.statusWaiting}>WAITING</Text>
=======
                        <Text style={styles.statusWaiting}>WAITING</Text>
>>>>>>> main
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
<<<<<<< HEAD
            <Text allowFontScaling={false} style={styles.editLinkText}>내 선호 수정하기</Text>
=======
            <Text style={styles.editLinkText}>내 선호 수정하기</Text>
>>>>>>> main
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.piniBtn, !allReady && { opacity: 0.4 }]}
            disabled={!allReady}
            activeOpacity={0.8}
            onPress={() => handleRunPini()}
          >
            <Ionicons name="flash" size={18} color="#fdfaff" />
<<<<<<< HEAD
            <Text allowFontScaling={false} style={styles.piniBtnText}>
=======
            <Text style={styles.piniBtnText}>
>>>>>>> main
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
<<<<<<< HEAD
          <Text allowFontScaling={false} style={styles.successTitle}>선호가 저장됐어요!</Text>
          <Text allowFontScaling={false} style={styles.successSub}>호스트가 일정을 확정하는 동안 잠시 기다려주세요.</Text>
=======
          <Text style={styles.successTitle}>선호가 저장됐어요!</Text>
          <Text style={styles.successSub}>호스트가 일정을 확정하는 동안 잠시 기다려주세요.</Text>
>>>>>>> main
        </View>

        {/* 호스트 상태 카드 */}
        <View style={styles.hostStatusCard}>
          <View style={styles.hostStatusTop}>
            <View>
<<<<<<< HEAD
              <Text allowFontScaling={false} style={styles.sectionEyebrow}>호스트 현황</Text>
              <View style={styles.hostStatusRow}>
                <Animated.View style={[styles.pulseDot, { opacity: pulseAnim }]} />
                <Text allowFontScaling={false} style={styles.hostStatusLabel}>일정 분석 중</Text>
=======
              <Text style={styles.sectionEyebrow}>호스트 현황</Text>
              <View style={styles.hostStatusRow}>
                <Animated.View style={[styles.pulseDot, { opacity: pulseAnim }]} />
                <Text style={styles.hostStatusLabel}>일정 분석 중</Text>
>>>>>>> main
              </View>
            </View>
            <View style={styles.syncBox}>
              <Ionicons name="sync" size={20} color="#ffb867" />
            </View>
          </View>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.shimmerBar, { opacity: shimmerAnim }]} />
          </View>
<<<<<<< HEAD
          <Text allowFontScaling={false} style={styles.hostStatusHint}>참가자들의 일정을 분석하고 있어요...</Text>
=======
          <Text style={styles.hostStatusHint}>참가자들의 일정을 분석하고 있어요...</Text>
>>>>>>> main
        </View>

        {/* 참가자 준비 현황 */}
        <View style={styles.readinessHeader}>
<<<<<<< HEAD
          <Text allowFontScaling={false} style={styles.sectionEyebrow}>참가자 ({readyCount}/{participants.length})</Text>
          <Text allowFontScaling={false} style={styles.readinessPct}>{participants.length > 0 ? Math.round(progressPct) : 0}% 준비</Text>
=======
          <Text style={styles.sectionEyebrow}>참가자 ({readyCount}/{participants.length})</Text>
          <Text style={styles.readinessPct}>{participants.length > 0 ? Math.round(progressPct) : 0}% 준비</Text>
>>>>>>> main
        </View>
        <View style={styles.participantList}>
          {participants.map((p) => {
            const isReady = p.userId === currentUserId ? locationSaved : Boolean(p.abstractLocation);
            return (
              <View key={p.id} style={[styles.participantCard, { borderLeftColor: isReady ? '#27a644' : '#ffb867' }]}>
                <View style={styles.participantAvatar}>
<<<<<<< HEAD
                  {p.user.profileImage
                    ? <Image source={{ uri: p.user.profileImage }} style={styles.participantAvatarImg} />
                    : <Text allowFontScaling={false} style={styles.participantAvatarText}>{p.user.nickname[0]?.toUpperCase()}</Text>
                  }
                </View>
                <View style={styles.participantInfo}>
                  <Text allowFontScaling={false} style={styles.participantName}>{p.user.nickname}</Text>
                  <Text allowFontScaling={false} style={[styles.participantStatus2, { color: isReady ? '#27a644' : '#ffb867' }]}>
=======
                  <Text style={styles.participantAvatarText}>{p.user.nickname[0]?.toUpperCase()}</Text>
                </View>
                <View style={styles.participantInfo}>
                  <Text style={styles.participantName}>{p.user.nickname}</Text>
                  <Text style={[styles.participantStatus2, { color: isReady ? '#27a644' : '#ffb867' }]}>
>>>>>>> main
                    {isReady ? '준비됨' : '검토 중'}
                  </Text>
                </View>
                {p.isHost && (
                  <View style={styles.hostBadge}>
<<<<<<< HEAD
                    <Text allowFontScaling={false} style={styles.hostBadgeText}>호스트</Text>
=======
                    <Text style={styles.hostBadgeText}>호스트</Text>
>>>>>>> main
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
<<<<<<< HEAD
            <Text allowFontScaling={false} style={styles.sectionEyebrow}>모임 코드</Text>
          </View>
          <Text allowFontScaling={false} style={styles.sessionCode}>{roomCode}</Text>
          <TouchableOpacity onPress={() => setLocationSaved(false)} style={styles.editLink} activeOpacity={0.8}>
            <Ionicons name="create-outline" size={13} color="#8a8f98" />
            <Text allowFontScaling={false} style={styles.editLinkText}>선호 수정하기</Text>
=======
            <Text style={styles.sectionEyebrow}>모임 코드</Text>
          </View>
          <Text style={styles.sessionCode}>{roomCode}</Text>
          <TouchableOpacity onPress={() => setLocationSaved(false)} style={styles.editLink} activeOpacity={0.8}>
            <Ionicons name="create-outline" size={13} color="#8a8f98" />
            <Text style={styles.editLinkText}>선호 수정하기</Text>
>>>>>>> main
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.waitingBtn}>
          <Ionicons name="hourglass-outline" size={16} color="#8a8f98" />
<<<<<<< HEAD
          <Text allowFontScaling={false} style={styles.waitingBtnText}>호스트를 기다리는 중...</Text>
=======
          <Text style={styles.waitingBtnText}>호스트를 기다리는 중...</Text>
>>>>>>> main
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#131316' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#131316' },
  body: { padding: 16, paddingBottom: 32 },

  /* 공통 */
<<<<<<< HEAD
  footer: { paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#23252a', gap: 6 },
=======
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#23252a', gap: 10 },
>>>>>>> main
  primaryBtn: { height: 56, backgroundColor: '#5e6ad2', borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryBtnText: { fontSize: 14, fontWeight: '700', color: '#fdfaff' },
  ghostBtn: { height: 40, alignItems: 'center', justifyContent: 'center' },
  ghostBtnText: { fontSize: 13, color: '#8a8f98', fontWeight: '500' },
  sectionEyebrow: { fontSize: 11, fontWeight: '600', color: '#8a8f98', textTransform: 'uppercase', letterSpacing: 1.2 },
  progressTrack: { height: 4, backgroundColor: '#23252a', borderRadius: 2, overflow: 'hidden', marginTop: 8 },
  progressFill: { height: '100%', backgroundColor: '#5e6ad2', borderRadius: 2 },
  progressGlow: { shadowColor: '#5e6ad2', shadowOpacity: 0.6, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } },

  /* 선호 폼 */
  stepHeader: { marginBottom: 24 },
  stepEyebrow: { fontSize: 11, fontWeight: '600', color: '#8a8f98', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 },
  stepTitle: { fontSize: 22, fontWeight: '700', color: '#f7f8f8', letterSpacing: -0.4 },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: '#8a8f98', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
<<<<<<< HEAD
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#f7f8f8', marginBottom: 10 },

  /* 카카오 장소 검색 */
  locationWrap: { marginBottom: 24 },
  locationInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#0f1011', borderWidth: 1, borderColor: '#23252a',
    borderRadius: 10, height: 48,
  },
  locationInputRowOpen: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderColor: '#5e6ad2' },
  locationInput: { flex: 1, height: '100%', fontSize: 14, color: '#f7f8f8', paddingHorizontal: 4 },
  locationClearBtn: { paddingHorizontal: 12, height: '100%', justifyContent: 'center' },
  suggestionList: {
    backgroundColor: '#0f1011', borderWidth: 1, borderTopWidth: 0, borderColor: '#5e6ad2',
    borderBottomLeftRadius: 10, borderBottomRightRadius: 10, overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#1d1e23',
  },
  suggestionName: { fontSize: 13, fontWeight: '600', color: '#f7f8f8', marginBottom: 2 },
  suggestionAddress: { fontSize: 11, color: '#636878' },
  locationConfirmed: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6, paddingHorizontal: 2 },
  locationConfirmedText: { fontSize: 11, color: '#27a644', fontWeight: '600' },

=======
  input: { height: 48, backgroundColor: '#0f1011', borderWidth: 1, borderColor: '#23252a', borderRadius: 8, paddingHorizontal: 16, fontSize: 14, color: '#f7f8f8', marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#f7f8f8', marginBottom: 10 },

>>>>>>> main
  /* 2열 그리드 */
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  gridCard: { width: '48%', backgroundColor: '#0f1011', borderWidth: 1, borderColor: '#23252a', borderRadius: 12, padding: 14, gap: 6, position: 'relative' },
  gridCardActive: { backgroundColor: '#141516', borderColor: '#5e6ad2' },
  gridCardLabel: { fontSize: 14, fontWeight: '500', color: '#d0d6e0' },
  gridCardLabelActive: { color: '#f7f8f8', fontWeight: '600' },
  gridCheck: { position: 'absolute', top: 8, right: 8 },

  /* 3열 */
  grid3: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  grid3Card: { flex: 1, backgroundColor: '#0f1011', borderWidth: 1, borderColor: '#23252a', borderRadius: 10, padding: 12, alignItems: 'center', gap: 4 },
  grid3Desc: { fontSize: 10, color: '#8a8f98', textAlign: 'center' },

  /* 에러 */
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  errorText: { fontSize: 12, color: '#ffb4ab' },

  /* 참가자 카드 */
  participantList: { gap: 6, marginBottom: 16 },
  participantCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f1011', borderWidth: 1, borderColor: '#23252a', borderRadius: 8, borderLeftWidth: 4, padding: 14, gap: 12 },
<<<<<<< HEAD
  participantAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#141516', borderWidth: 1, borderColor: '#34343a', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  participantAvatarImg: { width: 40, height: 40, borderRadius: 20 },
=======
  participantAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#141516', borderWidth: 1, borderColor: '#34343a', alignItems: 'center', justifyContent: 'center' },
>>>>>>> main
  participantAvatarText: { fontSize: 16, fontWeight: '700', color: '#bdc2ff' },
  participantInfo: { flex: 1 },
  participantName: { fontSize: 14, fontWeight: '600', color: '#f7f8f8' },
  participantRole: { fontSize: 11, color: '#8a8f98', marginTop: 1 },
  participantStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusReady: { fontSize: 11, fontWeight: '700', color: '#27a644', letterSpacing: 0.5 },
  statusWaiting: { fontSize: 11, fontWeight: '700', color: '#8a8f98', letterSpacing: 0.5 },
  editLink: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingVertical: 4 },
  editLinkText: { fontSize: 12, color: '#8a8f98' },

  /* 호스트 대기실 */
  progressSection: { marginBottom: 24 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  progressCount: { fontSize: 16, fontWeight: '700', color: '#bdc2ff' },
  piniBtn: { height: 56, backgroundColor: '#5e6ad2', borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  piniBtnText: { fontSize: 15, fontWeight: '700', color: '#fdfaff' },

  /* 참가자 대기실 */
  successSection: { alignItems: 'center', marginBottom: 24 },
  successIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(47,60,169,0.2)', borderWidth: 1, borderColor: '#2f3ca9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  successTitle: { fontSize: 20, fontWeight: '700', color: '#f7f8f8', letterSpacing: -0.3, marginBottom: 8 },
  successSub: { fontSize: 13, color: '#8a8f98', textAlign: 'center', paddingHorizontal: 24 },

  hostStatusCard: { backgroundColor: '#0f1011', borderWidth: 1, borderColor: '#23252a', borderRadius: 12, padding: 16, marginBottom: 20 },
  hostStatusTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  hostStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ffb867' },
  hostStatusLabel: { fontSize: 16, fontWeight: '600', color: '#f7f8f8' },
  syncBox: { width: 40, height: 40, backgroundColor: '#141516', borderWidth: 1, borderColor: '#34343a', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  shimmerBar: { height: '100%', width: '75%', backgroundColor: '#ffb867', borderRadius: 2 },
  hostStatusHint: { fontSize: 12, color: '#8a8f98', fontStyle: 'italic', marginTop: 8 },

  readinessHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  readinessPct: { fontSize: 12, fontWeight: '600', color: '#bdc2ff' },
  participantStatus2: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  hostBadge: { backgroundColor: 'rgba(94,106,210,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999 },
  hostBadgeText: { fontSize: 10, fontWeight: '600', color: '#bdc2ff' },

  sessionCard: { backgroundColor: '#141516', borderWidth: 1, borderColor: '#34343a', borderRadius: 12, padding: 14, marginTop: 8 },
  sessionCardRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  sessionCode: { fontSize: 22, fontWeight: '700', color: '#bdc2ff', letterSpacing: 4, marginBottom: 10 },

  waitingBtn: { height: 52, backgroundColor: '#0f1011', borderWidth: 1, borderColor: '#23252a', borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: 0.6 },
  waitingBtnText: { fontSize: 14, fontWeight: '500', color: '#8a8f98' },

  /* ── PINI 대기 화면 ── */
  piniScreen: { flex: 1, backgroundColor: '#131316', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 64 },
  piniCenter: { alignItems: 'center', gap: 16 },
  piniGlowRing: {
<<<<<<< HEAD
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(94,106,210,0.15)', borderWidth: 1, borderColor: 'rgba(94,106,210,0.3)', top: -24,
  },
  piniIconBg: {
    width: 112, height: 112, borderRadius: 56,
    backgroundColor: 'rgba(47,60,169,0.2)', borderWidth: 1, borderColor: '#2f3ca9',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
=======
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
>>>>>>> main
  },
  piniTitle: { fontSize: 36, fontWeight: '800', color: '#bdc2ff', letterSpacing: -1 },
  piniSubtitle: { fontSize: 14, fontWeight: '500', color: '#8a8f98', letterSpacing: 0.5 },
  piniProgressTrack: { width: 220, height: 3, backgroundColor: '#23252a', borderRadius: 2, overflow: 'hidden', marginTop: 4 },
  piniShimmerFill: { height: '100%', width: '70%', backgroundColor: '#5e6ad2', borderRadius: 2 },
  piniStatusText: { fontSize: 13, color: '#8a8f98', marginTop: 4 },
  piniBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#0f1011', borderWidth: 1, borderColor: '#23252a', borderRadius: 9999 },
  piniBadgeText: { fontSize: 11, fontWeight: '600', color: '#8a8f98', letterSpacing: 0.5 },

  /* ── AI 결과 화면 ── */
<<<<<<< HEAD
  mapSection: { height: 360, position: 'relative', overflow: 'hidden', borderBottomWidth: 1, borderBottomColor: '#23252a' },
  mapWebView: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#1c1e24' },
  mapWebFallback: { alignItems: 'center', justifyContent: 'center', gap: 8 },
  mapWebFallbackText: { fontSize: 12, color: '#454652' },

  mapInfoOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(19,19,22,0.92)', paddingHorizontal: 16, paddingVertical: 12, gap: 4, borderTopWidth: 1, borderTopColor: '#23252a' },
=======
  /* 지도 섹션 */
  mapSection: { height: 310, position: 'relative', overflow: 'hidden', borderBottomWidth: 1, borderBottomColor: '#23252a' },
  mapBg: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#1c1e24' },
  mapRoadH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#23252a' },
  mapRoadV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: '#23252a' },
  mapMainRoadH: { position: 'absolute', left: 0, right: 0, height: 3, backgroundColor: '#2a2d38' },
  mapMainRoadV: { position: 'absolute', top: 0, bottom: 0, width: 3, backgroundColor: '#2a2d38' },
  mapBlock: { position: 'absolute', backgroundColor: '#212330', borderRadius: 3 },
  mapPinWrap: { position: 'absolute', top: '38%', left: '48%', alignItems: 'center' },
  mapPinOuter: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(94,106,210,0.25)', borderWidth: 2, borderColor: '#5e6ad2', alignItems: 'center', justifyContent: 'center' },
  mapPinInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#5e6ad2' },
  mapPinStem: { width: 2, height: 8, backgroundColor: '#5e6ad2', borderRadius: 1 },

  mapInfoOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(19,19,22,0.88)', paddingHorizontal: 16, paddingVertical: 12, gap: 4, borderTopWidth: 1, borderTopColor: '#23252a' },
>>>>>>> main
  topPickBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(255,184,103,0.15)', borderWidth: 1, borderColor: 'rgba(255,184,103,0.35)', borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 2 },
  topPickText: { fontSize: 10, fontWeight: '700', color: '#ffb867', letterSpacing: 0.5 },
  mapPlaceName: { fontSize: 17, fontWeight: '700', color: '#f7f8f8', letterSpacing: -0.2 },
  mapAddressRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  mapAddress: { fontSize: 12, color: '#8a8f98' },
  mapMatchRow: { flexDirection: 'row', alignItems: 'baseline' },
  mapMatchPct: { fontSize: 18, fontWeight: '800', color: '#bdc2ff' },
  mapMatchLabel: { fontSize: 12, color: '#8a8f98' },

  resultEyebrow: { fontSize: 11, fontWeight: '600', color: '#454652', letterSpacing: 1.5, marginTop: 20, paddingHorizontal: 16, marginBottom: 10 },
  altScrollContent: { paddingHorizontal: 16, gap: 10 },
<<<<<<< HEAD
  altCard: { width: 136, backgroundColor: '#0f1011', borderWidth: 1, borderColor: '#23252a', borderRadius: 14, padding: 14, gap: 8 },
  altCardActive: { borderColor: '#5e6ad2', backgroundColor: '#141620' },
  altIconBox: { width: 36, height: 36, backgroundColor: '#141516', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  altIconBoxActive: { backgroundColor: 'rgba(94,106,210,0.15)' },
  altName: { fontSize: 12, fontWeight: '600', color: '#d0d6e0', lineHeight: 17 },
  altMatch: { fontSize: 11, color: '#5e6ad2', fontWeight: '700' },

  recCard: { marginHorizontal: 16, marginBottom: 10, backgroundColor: '#0f1011', borderWidth: 1, borderColor: '#23252a', borderRadius: 14, padding: 16 },
  recCardTop: { borderColor: '#2f3ca9', backgroundColor: '#111218' },
  recCardActive: { borderColor: '#5e6ad2' },
  recCardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  recRankBox: { width: 34, height: 34, borderRadius: 9, backgroundColor: '#141516', borderWidth: 1, borderColor: '#34343a', alignItems: 'center', justifyContent: 'center' },
  recRankBoxTop: { backgroundColor: 'rgba(94,106,210,0.15)', borderColor: '#5e6ad2' },
  recRank: { fontSize: 14, fontWeight: '700', color: '#8a8f98' },
  recRankTop: { color: '#bdc2ff' },
  recName: { fontSize: 15, fontWeight: '700', color: '#f7f8f8', marginBottom: 2, letterSpacing: -0.2 },
  recAddress: { fontSize: 11, color: '#636878' },
  recMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 6 },
  recScorePill: { borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 },
  recScoreText: { fontSize: 11, fontWeight: '700' },
  recAtmosphere: { fontSize: 11, color: '#8a8f98' },
  recMatchChip: { paddingHorizontal: 9, paddingVertical: 5, backgroundColor: '#141516', borderRadius: 9, borderWidth: 1, borderColor: '#34343a' },
=======
  altCard: { width: 130, backgroundColor: '#0f1011', borderWidth: 1, borderColor: '#23252a', borderRadius: 12, padding: 12, gap: 8 },
  altCardActive: { borderColor: '#5e6ad2', backgroundColor: '#141516' },
  altIconBox: { width: 36, height: 36, backgroundColor: '#141516', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  altName: { fontSize: 12, fontWeight: '600', color: '#d0d6e0', lineHeight: 16 },
  altMatch: { fontSize: 11, color: '#5e6ad2', fontWeight: '700' },

  recCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginBottom: 8, backgroundColor: '#0f1011', borderWidth: 1, borderColor: '#23252a', borderRadius: 12, padding: 14 },
  recCardActive: { borderColor: '#5e6ad2' },
  recRankBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#141516', borderWidth: 1, borderColor: '#34343a', alignItems: 'center', justifyContent: 'center' },
  recRankBoxTop: { backgroundColor: 'rgba(94,106,210,0.15)', borderColor: '#5e6ad2' },
  recRank: { fontSize: 14, fontWeight: '700', color: '#8a8f98' },
  recRankTop: { color: '#bdc2ff' },
  recName: { fontSize: 14, fontWeight: '600', color: '#f7f8f8', marginBottom: 2 },
  recAddress: { fontSize: 11, color: '#8a8f98' },
  recMatchChip: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#141516', borderRadius: 8, borderWidth: 1, borderColor: '#34343a' },
>>>>>>> main
  recMatchChipTop: { backgroundColor: 'rgba(94,106,210,0.15)', borderColor: '#5e6ad2' },
  recMatchText: { fontSize: 12, fontWeight: '700', color: '#8a8f98' },
  recMatchTextTop: { color: '#bdc2ff' },

<<<<<<< HEAD
  recReasoning: { fontSize: 12, color: '#8a8f98', marginTop: 12, lineHeight: 19 },
  recDivider: { height: 1, backgroundColor: '#1d1e23', marginVertical: 12 },

  recTravelSection: { gap: 6 },
  recTravelLabel: { fontSize: 10, fontWeight: '700', color: '#454652', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 2 },
  recTravelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 28 },
  recTravelEmoji: { fontSize: 14, width: 20, textAlign: 'center' },
  recTravelNickname: { fontSize: 12, color: '#8a8f98', flex: 1 },
  recTravelMinutes: { fontSize: 13, fontWeight: '700', color: '#f7f8f8' },
  recDiffPill: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, marginTop: 4, alignSelf: 'flex-start' },
  recDiffText: { fontSize: 11, fontWeight: '600' },

  drawerToggle: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 14, paddingVertical: 4, alignSelf: 'flex-start' },
  drawerToggleText: { fontSize: 12, color: '#5e6ad2', fontWeight: '700' },
  drawerContent: { marginTop: 10, backgroundColor: '#0b0c0e', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#1d1e23' },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  drawerTitle: { fontSize: 10, fontWeight: '700', color: '#bdc2ff', letterSpacing: 1.5, textTransform: 'uppercase' },
  drawerCountChip: { backgroundColor: 'rgba(94,106,210,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  drawerCountText: { fontSize: 10, color: '#5e6ad2', fontWeight: '600' },
  drawerProsSection: { marginBottom: 10 },
  drawerProsLabel: { fontSize: 10, fontWeight: '700', color: '#27a644', marginBottom: 6 },
  drawerProItem: { fontSize: 11, color: '#8a8f98', marginBottom: 4, lineHeight: 17 },
  drawerConsLabel: { fontSize: 10, fontWeight: '700', color: '#ffb867', marginBottom: 6 },
  drawerConItem: { fontSize: 11, color: '#8a8f98', marginBottom: 4, lineHeight: 17 },

  /* 날짜/시간 모달 */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#1a1b1f', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36,
    borderTopWidth: 1, borderColor: '#2a2b30',
  },
  modalHandleBar: { width: 36, height: 4, backgroundColor: '#34343a', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#f7f8f8', letterSpacing: -0.3, marginBottom: 4 },
  modalSubtitle: { fontSize: 12, color: '#636878', marginBottom: 20 },
  pickerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#0f1011', borderWidth: 1, borderColor: '#23252a',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 10,
  },
  pickerRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  pickerRowLabel: { fontSize: 14, fontWeight: '500', color: '#d0d6e0' },
  pickerRowValue: { fontSize: 14, fontWeight: '700', color: '#bdc2ff', marginRight: 4 },
  pickerTextInput: { flex: 1, fontSize: 14, fontWeight: '700', color: '#bdc2ff', textAlign: 'right' },
  pickerLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4, marginBottom: 2 },
  pickerSectionLabel: { fontSize: 12, fontWeight: '600', color: '#636878', flex: 1 },
  pickerSectionValue: { fontSize: 13, fontWeight: '700', color: '#bdc2ff' },
  pickerInline: { width: '100%', height: 120 },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalCancelBtn: { flex: 1, height: 50, backgroundColor: '#0f1011', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#23252a' },
  modalCancelText: { fontSize: 14, color: '#8a8f98', fontWeight: '500' },
  modalConfirmBtn: {
    flex: 2, height: 50, backgroundColor: '#5e6ad2', borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#5e6ad2', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  modalConfirmText: { fontSize: 15, fontWeight: '800', color: '#fdfaff' },

  confirmBtn: {
    height: 46, backgroundColor: '#5e6ad2', borderRadius: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    shadowColor: '#5e6ad2', shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  confirmBtnText: { fontSize: 14, fontWeight: '700', color: '#fdfaff', letterSpacing: -0.2 },
  retryBtn: { height: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  retryBtnText: { fontSize: 12, fontWeight: '500', color: '#636878' },
=======
  confirmBtn: { height: 52, backgroundColor: '#5e6ad2', borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  confirmBtnText: { fontSize: 14, fontWeight: '700', color: '#fdfaff' },
  retryBtn: { height: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  retryBtnText: { fontSize: 12, fontWeight: '600', color: '#8a8f98' },
>>>>>>> main
});
