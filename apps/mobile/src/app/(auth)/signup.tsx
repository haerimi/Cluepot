import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';

export default function SignupScreen() {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // TODO: handleSignup
  //   1. supabase.auth.signUp 호출
  //   2. 성공 시 api.post('/auth/register', { id, email, nickname }) 로 Prisma user 생성
  //   3. 완료 후 /(auth)/login 이동
  function handleSignup() {

  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* 상단 다크 헤더 */}
        <View style={styles.hero}>
          <Text style={styles.heroLogo}>
            Clue<Text style={styles.heroAccent}>Pot</Text>
          </Text>
          <Text style={styles.heroTitle}>
            새로운{'\n'}모임의{'\n'}<Text style={styles.heroAccent}>시작</Text>
          </Text>
          <Text style={styles.heroSub}>계정을 만들고 모임 일정을 관리하세요.</Text>
        </View>

        {/* 폼 영역 */}
        <View style={styles.form}>
          <View style={styles.formHeader}>
            <Text style={styles.formEyebrow}>계정 만들기</Text>
            <Text style={styles.formTitle}>CluePot에 오신 것을{'\n'}환영해요</Text>
            <Text style={styles.formSub}>이메일과 닉네임으로 시작하세요.</Text>
          </View>

          <Text style={styles.label}>닉네임</Text>
          <TextInput
            style={styles.input}
            placeholder="모임에서 불릴 이름"
            placeholderTextColor="#B0BAC8"
            value={nickname}
            onChangeText={setNickname}
            maxLength={20}
            autoCorrect={false}
          />

          <Text style={styles.label}>이메일</Text>
          <TextInput
            style={styles.input}
            placeholder="name@example.com"
            placeholderTextColor="#B0BAC8"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            style={styles.input}
            placeholder="8자 이상"
            placeholderTextColor="#B0BAC8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Text style={styles.hint}>최소 8자 이상이어야 해요.</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>계정 만들기</Text>}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>또는</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.link}>
            <Text style={styles.linkText}>
              이미 계정이 있으신가요? <Text style={styles.linkAccent}>로그인</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F0' },
  scroll: { flexGrow: 1 },

  hero: { backgroundColor: '#1A2033', paddingHorizontal: 28, paddingTop: 64, paddingBottom: 36 },
  heroLogo: { fontSize: 18, fontWeight: '900', color: '#fff', marginBottom: 20 },
  heroAccent: { color: '#7298C7' },
  heroTitle: { fontSize: 44, fontWeight: '900', color: '#fff', lineHeight: 42, letterSpacing: -2, marginBottom: 16 },
  heroSub: { fontSize: 13, color: '#5A6A85', lineHeight: 22 },

  form: { flex: 1, paddingHorizontal: 28, paddingTop: 36, paddingBottom: 48 },
  formHeader: { marginBottom: 28 },
  formEyebrow: { fontSize: 10, fontWeight: '700', color: '#9AAFC5', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 },
  formTitle: { fontSize: 26, fontWeight: '900', color: '#1A2033', lineHeight: 32, marginBottom: 6 },
  formSub: { fontSize: 13, color: '#5A6A85' },

  label: { fontSize: 11, fontWeight: '700', color: '#5A6A85', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6, marginTop: 16 },
  input: {
    height: 52, borderWidth: 1, borderColor: '#E2E6EC', borderRadius: 12,
    paddingHorizontal: 16, fontSize: 16, color: '#1A2033', backgroundColor: '#fff',
  },
  hint: { fontSize: 11, color: '#9AAFC5', marginTop: 5 },
  error: { fontSize: 13, color: '#E05555', backgroundColor: '#FFF5F5', borderRadius: 10, padding: 12, marginTop: 12 },

  btn: { height: 52, backgroundColor: '#7298C7', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E6EC' },
  dividerText: { fontSize: 11, color: '#9AAFC5', textTransform: 'uppercase', letterSpacing: 1 },

  link: { alignItems: 'center' },
  linkText: { fontSize: 13, color: '#5A6A85' },
  linkAccent: { color: '#7298C7', fontWeight: '700' },
});
