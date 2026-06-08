import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';

type Category = 'restaurant' | 'cafe' | 'bar' | 'brunch' | 'dessert';
type Step = 1 | 2 | 3;

const CATEGORIES: { value: Category; label: string; emoji: string; bg: string }[] = [
  { value: 'restaurant', label: '맛집',   emoji: '🍽', bg: '#FFE4D6' },
  { value: 'cafe',       label: '카페',   emoji: '☕', bg: '#FFF3E0' },
  { value: 'bar',        label: '술자리', emoji: '🍻', bg: '#EDE7F6' },
  { value: 'brunch',     label: '브런치', emoji: '🥞', bg: '#E8F5E9' },
  { value: 'dessert',    label: '디저트', emoji: '🍰', bg: '#FCE4EC' },
];

const PLACEHOLDER: Record<Category, string> = {
  restaurant: '팀 점심 식사',
  cafe:       '스터디 카페 모임',
  bar:        '금요일 뒷풀이',
  brunch:     '주말 브런치',
  dessert:    '디저트 탐방',
};

export default function CreateRoomScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  // TODO: handleCreate — api.post('/rooms', { category, name }) 호출 후 roomCode 저장, step 3으로 이동
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

  const selectedCat = CATEGORIES.find(c => c.value === category);

  return (
    <View style={styles.container}>
      {/* 헤더 + 스텝 인디케이터 */}
      {step < 3 && (
        <View style={styles.header}>
          <TouchableOpacity onPress={() => step === 1 ? router.back() : setStep(s => (s - 1) as Step)}>
            <Text style={styles.back}>← 뒤로</Text>
          </TouchableOpacity>
          <View style={styles.steps}>
            {([1, 2] as const).map((s, i) => (
              <View key={s} style={styles.stepRow}>
                {i > 0 && <View style={[styles.stepLine, s <= step ? styles.stepLineActive : null]} />}
                <View style={[styles.stepDot, s <= step ? styles.stepDotActive : styles.stepDotInactive]}>
                  <Text style={[styles.stepNum, s <= step ? styles.stepNumActive : styles.stepNumInactive]}>
                    {s < step ? '✓' : s}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {/* Step 1 — 카테고리 */}
        {step === 1 && (
          <View>
            <Text style={styles.eyebrow}>Step 01</Text>
            <Text style={styles.title}>어떤 만남인가요?</Text>
            <Text style={styles.subtitle}>장소 카테고리를 선택해주세요</Text>

            <View style={styles.categoryGrid}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.value}
                  style={[
                    styles.categoryBtn,
                    { backgroundColor: category === c.value ? '#EEF3FB' : '#fff' },
                    category === c.value && styles.categoryBtnActive,
                  ]}
                  onPress={() => setCategory(c.value)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.categoryEmoji}>{c.emoji}</Text>
                  <Text style={[styles.categoryLabel, category === c.value && styles.categoryLabelActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.btn, !category && styles.btnDisabled]}
              onPress={() => setStep(2)}
              disabled={!category}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>다음</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2 — 모임 이름 */}
        {step === 2 && (
          <View>
            <Text style={styles.eyebrow}>Step 02</Text>
            <Text style={styles.title}>모임 이름을{'\n'}지어주세요</Text>
            <Text style={styles.subtitle}>참가자들에게 보여질 모임 이름이에요</Text>

            <TextInput
              style={styles.input}
              placeholder={`예: ${category ? PLACEHOLDER[category] : '모임 이름 입력'}`}
              placeholderTextColor="#B0BAC8"
              value={name}
              onChangeText={setName}
              maxLength={30}
              autoFocus
            />
            <Text style={styles.counter}>{name.length} / 30</Text>

            <TouchableOpacity
              style={[styles.btn, (!name.trim() || loading) && styles.btnDisabled]}
              onPress={handleCreate}
              disabled={!name.trim() || loading}
              activeOpacity={0.8}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>모임 만들기</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3 — 완료 */}
        {step === 3 && (
          <View style={styles.done}>
            <View style={[styles.doneIconBg, { backgroundColor: selectedCat?.bg ?? '#EEF3FB' }]}>
              <Text style={styles.doneIconEmoji}>{selectedCat?.emoji ?? '🎉'}</Text>
            </View>
            <Text style={styles.doneTitle}>모임이 만들어졌어요!</Text>
            <Text style={styles.doneSub}>아래 코드를 참가자들에게 공유해주세요</Text>

            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>모임 코드</Text>
              <Text style={styles.codeText}>{roomCode}</Text>
            </View>

            <TouchableOpacity
              style={styles.btn}
              onPress={() => router.replace(`/(app)/rooms/${roomCode}`)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>모임 입장하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnGhost]}
              onPress={() => router.replace('/(app)/home')}
              activeOpacity={0.8}
            >
              <Text style={styles.btnGhostText}>홈으로 돌아가기</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F0' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, marginBottom: 28 },
  back: { fontSize: 15, color: '#5A6A85', fontWeight: '600' },
  steps: { flexDirection: 'row', alignItems: 'center' },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepLine: { width: 32, height: 1, backgroundColor: '#E2E6EC', marginHorizontal: 6 },
  stepLineActive: { backgroundColor: '#7298C7' },
  stepDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: '#7298C7' },
  stepDotInactive: { backgroundColor: '#E2E6EC' },
  stepNum: { fontSize: 11, fontWeight: '700' },
  stepNumActive: { color: '#fff' },
  stepNumInactive: { color: '#9AAFC5' },
  body: { paddingHorizontal: 20, paddingBottom: 60 },
  eyebrow: { fontSize: 11, fontWeight: '700', color: '#7298C7', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 },
  title: { fontSize: 30, fontWeight: '900', color: '#1A2033', lineHeight: 36, marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#5A6A85', marginBottom: 24 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  categoryBtn: { width: '30%', paddingVertical: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E6EC', alignItems: 'center', gap: 6 },
  categoryBtnActive: { borderColor: '#7298C7' },
  categoryEmoji: { fontSize: 26 },
  categoryLabel: { fontSize: 12, fontWeight: '600', color: '#5A6A85' },
  categoryLabelActive: { color: '#7298C7' },
  input: { height: 52, borderWidth: 1, borderColor: '#E2E6EC', borderRadius: 12, paddingHorizontal: 16, fontSize: 16, color: '#1A2033', backgroundColor: '#fff', marginBottom: 6 },
  counter: { fontSize: 11, color: '#9AAFC5', textAlign: 'right', marginBottom: 24 },
  btn: { height: 52, backgroundColor: '#7298C7', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#E2E6EC' },
  btnGhostText: { color: '#5A6A85', fontSize: 15, fontWeight: '600' },
  done: { alignItems: 'center', paddingTop: 16 },
  doneIconBg: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  doneIconEmoji: { fontSize: 40 },
  doneTitle: { fontSize: 26, fontWeight: '900', color: '#1A2033', marginBottom: 8, textAlign: 'center' },
  doneSub: { fontSize: 14, color: '#5A6A85', marginBottom: 28, textAlign: 'center' },
  codeBox: { width: '100%', backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E2E6EC', padding: 24, alignItems: 'center', marginBottom: 24 },
  codeLabel: { fontSize: 10, fontWeight: '700', color: '#9AAFC5', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 },
  codeText: { fontSize: 36, fontWeight: '900', color: '#1A2033', letterSpacing: 6, fontFamily: 'monospace' },
});
