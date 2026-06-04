import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { Ionicons } from '@expo/vector-icons';

interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: React.ReactNode;
}

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

const CATEGORY_CONFIG: Record<string, { label: string; emoji: string; bg: string }> = {
  restaurant: { label: '맛집', emoji: '🍽', bg: '#FFE4D6' },
  cafe: { label: '카페', emoji: '☕', bg: '#FFF3E0' },
  bar: { label: '술자리', emoji: '🍻', bg: '#EDE7F6' },
  brunch: { label: '브런치', emoji: '🥞', bg: '#E8F5E9' },
  dessert: { label: '디저트', emoji: '🍰', bg: '#FCE4EC' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  waiting: { label: '대기 중', color: '#B45309', dot: '#F59E0B' },
  done: { label: '확정됨', color: '#166534', dot: '#4CAF7D' },
  reselecting: { label: '장소 재선정 중', color: '#B45309', dot: '#F59E0B' },
};

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [rooms, setRooms] = useState<RoomRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  const navItems: NavItem[] = [
    { href: "/calendar", label: "내 일정", icon: <Ionicons name="calendar" size={24} color="black" /> },
    { href: "/rooms", label: "내 모임", icon: <Ionicons name="people" size={24} color="black" /> },
    { href: "/rooms/create", label: "일정 만들기", icon: <Ionicons name="add" size={24} color="black" /> },
    { href: "/rooms/join", label: "코드로 참가", icon: <Ionicons name="qr-code" size={24} color="black" /> },
  ];

  function closeMenu() {
    setIsMenuOpen(false);
  }

  useEffect(() => {
    fetchRooms();
  }, []);

  async function fetchRooms() {
    try {
      const { data } = await api.get('/rooms');
      setRooms(data);
    } catch {
      Alert.alert('오류', '방 목록을 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    router.replace('/(auth)/login');
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>Clue<Text style={styles.accent}>Pot</Text></Text>
          {user && <Text style={styles.greeting}>안녕하세요, {user.nickname}님 👋</Text>}
        </View>
        <View style={styles.menu}>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logout}>로그아웃</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menulogo} onPress={() => console.log("메뉴버튼")}>
            <Text style={styles.menuIcon} />
            <Text style={styles.menuIcon} />
            <Text style={styles.menuIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 액션 버튼 */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.primaryBtn]}
          onPress={() => router.push('/(app)/rooms/create')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>+ 모임 만들기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.secondaryBtn]}
          onPress={() => router.push('/(app)/rooms/join')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryBtnText}>코드로 참가</Text>
        </TouchableOpacity>
      </View>

      {/* 섹션 라벨 */}
      <Text style={styles.sectionLabel}>내 모임</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#7298C7" size="large" />
      ) : rooms.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🗓</Text>
          <Text style={styles.emptyTitle}>아직 참여한 모임이 없어요</Text>
          <Text style={styles.emptyText}>새 모임을 만들거나 코드로 참가해보세요</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const cat = CATEGORY_CONFIG[item.room.category] ?? { label: '모임', emoji: '📍', bg: '#F0EDE7' };
            const statusKey = item.room.schedule ? 'done' : item.room.status;
            const status = STATUS_CONFIG[statusKey] ?? { label: '알 수 없음', color: '#5A6A85', dot: '#C5CCD8' };

            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/(app)/rooms/${item.room.roomCode}`)}
                activeOpacity={0.8}
              >
                {/* 커버 */}
                <View style={[styles.cover, { backgroundColor: cat.bg }]}>
                  <Text style={styles.coverEmoji}>{cat.emoji}</Text>
                  <Text style={styles.coverCode}>{item.room.roomCode}</Text>
                  {item.isHost && (
                    <View style={styles.hostBadge}>
                      <Text style={styles.hostBadgeText}>👑 호스트</Text>
                    </View>
                  )}
                </View>
                {/* 정보 */}
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName} numberOfLines={1}>
                    {item.room.name || `${cat.label} 모임`}
                  </Text>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: status.dot }]} />
                    <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F0', paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, marginBottom: 20 },
  logo: { fontSize: 22, fontWeight: '900', color: '#1A2033' },
  accent: { color: '#7298C7' },
  greeting: { fontSize: 13, color: '#5A6A85', marginTop: 2 },
  logout: { fontSize: 13, color: '#9AAFC5', fontWeight: '600', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 24 },
  actionBtn: { flex: 1, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  primaryBtn: { backgroundColor: '#7298C7' },
  secondaryBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E6EC' },
  primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  secondaryBtnText: { color: '#1A2033', fontSize: 14, fontWeight: '700' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#9AAFC5', letterSpacing: 2, textTransform: 'uppercase', paddingHorizontal: 20, marginBottom: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1A2033', marginBottom: 6 },
  emptyText: { fontSize: 13, color: '#9AAFC5' },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  row: { gap: 10, marginBottom: 10 },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E6EC' },
  cover: { aspectRatio: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  coverEmoji: { fontSize: 36 },
  coverCode: { fontSize: 10, fontWeight: '700', color: 'rgba(0,0,0,0.35)', letterSpacing: 2 },
  hostBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  hostBadgeText: { fontSize: 10, fontWeight: '700', color: '#7298C7' },
  cardInfo: { padding: 10 },
  cardName: { fontSize: 13, fontWeight: '700', color: '#1A2033', marginBottom: 5 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
  menuIcon: { width: 20, height: 2, backgroundColor: '#9AAFC5', borderRadius: 1, marginVertical: 2 },
  menu: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, },
  menulogo: { marginTop: 4 }
});
