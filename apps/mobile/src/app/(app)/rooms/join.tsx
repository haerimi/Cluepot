import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';

export default function JoinRoomScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // TODO: handleJoin
  //   1. api.get(`/rooms/${roomCode}`) 로 유효성 확인
  //   2. valid 이면 /(app)/rooms/[code] 로 이동
  //   3. 아니면 에러 메시지 표시
  async function handleJoin() {
    const roomCode = code.trim().toUpperCase();
    if (!roomCode) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/rooms/${roomCode}`);
      if (!data.valid) {
        setError(data.reason ?? '유효하지 않은 코드예요.');
        return;
      }
      router.replace(`/(app)/rooms/${roomCode}`);
    } catch {
      setError('오류가 발생했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>

      <Text style={styles.eyebrow}>코드로 참가</Text>
      <Text style={styles.title}>모임 코드를{'\n'}입력해주세요</Text>
      <Text style={styles.subtitle}>호스트에게 받은 6자리 코드를 입력해주세요</Text>

      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholder="예: ABC123"
        placeholderTextColor="#B0BAC8"
        value={code}
        onChangeText={(t) => { setCode(t.toUpperCase()); setError(''); }}
        maxLength={8}
        autoCapitalize="characters"
        autoCorrect={false}
        autoFocus
      />
      {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}

      <TouchableOpacity
        style={[styles.btn, (!code.trim() || loading) && styles.btnDisabled]}
        onPress={handleJoin}
        disabled={!code.trim() || loading}
        activeOpacity={0.8}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>참가하기</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F0', paddingTop: 20, paddingHorizontal: 24 },
  eyebrow: { fontSize: 11, fontWeight: '700', color: '#7298C7', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 },
  title: { fontSize: 30, fontWeight: '900', color: '#1A2033', lineHeight: 36, marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#5A6A85', marginBottom: 28, lineHeight: 20 },
  input: {
    height: 60, borderWidth: 1, borderColor: '#E2E6EC', borderRadius: 12,
    paddingHorizontal: 16, fontSize: 28, fontWeight: '900', color: '#1A2033',
    backgroundColor: '#fff', letterSpacing: 8, textAlign: 'center', marginBottom: 8,
  },
  inputError: { borderColor: '#E05555', backgroundColor: '#FFF5F5' },
  errorText: { fontSize: 13, color: '#E05555', marginBottom: 16 },
  btn: { height: 52, backgroundColor: '#7298C7', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
