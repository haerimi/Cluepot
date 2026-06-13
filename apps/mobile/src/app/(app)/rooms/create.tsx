import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ScrollView, ActivityIndicator, Alert, Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

function NavHeader({ initial, onClose }: { initial: string; onClose?: () => void }) {
  return (
    <View style={navHdr.wrap}>
      {onClose
        ? <TouchableOpacity onPress={onClose} style={navHdr.sideBtn} hitSlop={8}><Ionicons name="close" size={20} color="#8a8f98" /></TouchableOpacity>
        : <View style={navHdr.sideBtn} />
      }
      <Text style={navHdr.logo}>Clue<Text style={navHdr.accent}>Pot</Text></Text>
      <View style={navHdr.avatar}><Text style={navHdr.avatarText}>{initial}</Text></View>
    </View>
  );
}
const navHdr = StyleSheet.create({
  wrap:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderBottomColor: '#23252a', backgroundColor: '#131316' },
  sideBtn:    { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  logo:       { fontSize: 20, fontWeight: '700', color: '#f7f8f8', letterSpacing: -0.3 },
  accent:     { color: '#bdc2ff' },
  avatar:     { width: 30, height: 30, borderRadius: 15, backgroundColor: '#5e6ad2', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#34343a' },
  avatarText: { fontSize: 12, fontWeight: '700', color: '#fdfaff' },
});

type Category = 'restaurant' | 'cafe' | 'bar' | 'brunch' | 'dessert';

const CATEGORIES: { value: Category; label: string; desc: string; icon: any; iconColor: string }[] = [
  { value: 'restaurant', label: '맛집',   desc: '맛있는 식사 모임',     icon: 'restaurant-outline', iconColor: '#bdc2ff' },
  { value: 'cafe',       label: '카페',   desc: '커피와 함께하는 시간',  icon: 'cafe-outline',        iconColor: '#ffb867' },
  { value: 'bar',        label: '술자리', desc: '저녁 뒷풀이 모임',      icon: 'wine-outline',        iconColor: '#7a7fad' },
  { value: 'brunch',     label: '브런치', desc: '여유로운 주말 브런치',  icon: 'sunny-outline',       iconColor: '#27a644' },
  { value: 'dessert',    label: '디저트', desc: '달콤한 디저트 탐방',    icon: 'ice-cream-outline',   iconColor: '#5e6ad2' },
];

export default function CreateRoomScreen() {
  const router = useRouter();
  const nickname = useAuthStore((s) => s.user?.nickname ?? s.user?.email ?? '?');
  const [step, setStep] = useState<1 | 3>(1);
  const [category, setCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [shared, setShared] = useState(false);

  async function handleCreate() {
    if (!category || !name.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/rooms', { category, name: name.trim() });
      setRoomCode(data.roomCode);
      setStep(3);
    } catch {
      Alert.alert('오류', '모임을 만들 수 없어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  async function handleShare() {
    try {
      await Share.share({ message: `CluePot 모임 코드: ${roomCode}` });
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {}
  }

  const canProceed = !!category && name.trim().length > 0;
  const codeDigits = roomCode.split('');

  /* ── Step 1: 이름 + 카테고리 ── */
  if (step === 1) {
    return (
      <View style={styles.container}>
        <NavHeader initial={nickname[0].toUpperCase()} onClose={() => router.back()} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
          {/* 모임 이름 */}
          <Text style={styles.fieldLabel}>PLAN NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="모임 이름을 입력하세요..."
            placeholderTextColor="#454652"
            value={name}
            onChangeText={setName}
            maxLength={30}
          />

          {/* 카테고리 선택 */}
          <Text style={[styles.fieldLabel, { marginBottom: 12 }]}>SELECT CATEGORY</Text>
          {CATEGORIES.map((c) => {
            const active = category === c.value;
            return (
              <TouchableOpacity
                key={c.value}
                style={[styles.categoryCard, active && styles.categoryCardActive]}
                onPress={() => setCategory(c.value)}
                activeOpacity={0.8}
              >
                <View style={styles.categoryIconBox}>
                  <Ionicons name={c.icon} size={24} color={c.iconColor} />
                </View>
                <View style={styles.categoryText}>
                  <Text style={styles.categoryLabel}>{c.label}</Text>
                  <Text style={styles.categoryDesc}>{c.desc}</Text>
                </View>
                {active && (
                  <View style={styles.checkCircle}>
                    <Ionicons name="checkmark" size={13} color="#fdfaff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 하단 버튼 */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextBtn, !canProceed && styles.btnDisabled]}
            onPress={handleCreate}
            disabled={!canProceed || loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color="#fdfaff" />
              : <>
                  <Text style={styles.nextBtnText}>다음 단계</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fdfaff" />
                </>
            }
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ── Step 3: 코드 생성 완료 ── */
  return (
    <View style={styles.container}>
      <NavHeader initial={nickname[0].toUpperCase()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.body, styles.successBody]}>
        {/* 성공 아이콘 */}
        <View style={styles.successIconBg}>
          <Ionicons name="checkmark-circle" size={40} color="#bdc2ff" />
        </View>
        <Text style={styles.successTitle}>모임이 만들어졌어요!</Text>
        <Text style={styles.successSub}>아래 초대 코드를 참가자들에게 공유해주세요.</Text>

        {/* 코드 카드 */}
        <View style={styles.codeCard}>
          <Text style={styles.codeEyebrow}>INVITE CODE</Text>
          <View style={styles.codeBoxRow}>
            {codeDigits.map((digit, i) => (
              <View key={i} style={styles.codeBox}>
                <Text style={styles.codeDigit}>{digit}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.inviteBtn, shared && styles.inviteBtnSuccess]}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Ionicons name={shared ? 'checkmark' : 'copy-outline'} size={16} color="#fdfaff" />
            <Text style={styles.inviteBtnText}>{shared ? '복사됨!' : '친구 초대하기'}</Text>
          </TouchableOpacity>
        </View>

        {/* 보조 버튼 */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.replace(`/(app)/rooms/${roomCode}`)}
            activeOpacity={0.8}
          >
            <Ionicons name="enter-outline" size={16} color="#d0d6e0" />
            <Text style={styles.secondaryBtnText}>모임 입장</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.replace('/(app)/home')}
            activeOpacity={0.8}
          >
            <Ionicons name="home-outline" size={16} color="#d0d6e0" />
            <Text style={styles.secondaryBtnText}>홈으로</Text>
          </TouchableOpacity>
        </View>

        {/* 안내 카드 */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color="#bdc2ff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>참가자 초대 안내</Text>
            <Text style={styles.infoDesc}>이 코드를 공유하면 참가자가 모임에 합류할 수 있어요. 코드는 24시간 유효합니다.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#131316' },

  /* 바디 */
  body: { padding: 16, paddingBottom: 32 },
  successBody: { alignItems: 'center' },

  /* 필드 */
  fieldLabel: { fontSize: 11, fontWeight: '600', color: '#8a8f98', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 },
  input: {
    height: 48,
    backgroundColor: '#0f1011',
    borderWidth: 1,
    borderColor: '#23252a',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#f7f8f8',
    marginBottom: 24,
  },

  /* 카테고리 카드 */
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#0f1011',
    borderWidth: 1,
    borderColor: '#23252a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  categoryCardActive: { borderColor: '#5e6ad2', backgroundColor: 'rgba(94,106,210,0.08)' },
  categoryIconBox: {
    width: 48,
    height: 48,
    backgroundColor: '#141516',
    borderWidth: 1,
    borderColor: '#34343a',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: { flex: 1 },
  categoryLabel: { fontSize: 16, fontWeight: '600', color: '#f7f8f8', marginBottom: 2 },
  categoryDesc: { fontSize: 12, color: '#8a8f98' },
  checkCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#bdc2ff', alignItems: 'center', justifyContent: 'center' },

  /* 하단 푸터 */
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#23252a' },
  nextBtn: {
    height: 56,
    backgroundColor: '#5e6ad2',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnDisabled: { opacity: 0.4 },
  nextBtnText: { fontSize: 15, fontWeight: '700', color: '#fdfaff' },

  /* 성공 화면 */
  successIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(47,60,169,0.2)',
    borderWidth: 1,
    borderColor: '#2f3ca9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  successTitle: { fontSize: 22, fontWeight: '700', color: '#f7f8f8', letterSpacing: -0.4, marginBottom: 8, textAlign: 'center' },
  successSub: { fontSize: 13, color: '#8a8f98', textAlign: 'center', marginBottom: 24, paddingHorizontal: 32 },

  /* 코드 카드 */
  codeCard: {
    width: '100%',
    backgroundColor: '#0f1011',
    borderWidth: 1,
    borderColor: '#23252a',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  codeEyebrow: { fontSize: 11, fontWeight: '600', color: '#8a8f98', letterSpacing: 2, textTransform: 'uppercase' },
  codeBoxRow: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  codeBox: {
    width: 44,
    height: 56,
    backgroundColor: '#141516',
    borderWidth: 1,
    borderColor: '#34343a',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeDigit: { fontSize: 24, fontWeight: '700', color: '#bdc2ff' },
  inviteBtn: {
    width: '100%',
    height: 48,
    backgroundColor: '#5e6ad2',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  inviteBtnSuccess: { backgroundColor: '#27a644' },
  inviteBtnText: { fontSize: 14, fontWeight: '600', color: '#fdfaff' },

  /* 보조 버튼 */
  actionRow: { flexDirection: 'row', gap: 10, width: '100%', marginBottom: 12 },
  secondaryBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#0f1011',
    borderWidth: 1,
    borderColor: '#23252a',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryBtnText: { fontSize: 13, fontWeight: '600', color: '#d0d6e0' },

  /* 안내 카드 */
  infoCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#141516',
    borderWidth: 1,
    borderColor: '#34343a',
    borderRadius: 8,
    padding: 14,
  },
  infoTitle: { fontSize: 13, fontWeight: '600', color: '#f7f8f8', marginBottom: 4 },
  infoDesc: { fontSize: 12, color: '#8a8f98', lineHeight: 18 },
});
