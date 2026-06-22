import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  StatusBar, Animated,
  TextInputProps,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

// ── NavHeader ─────────────────────────────────────────────────────────────────

function NavHeader() {
  return (
    <View style={nav.wrap}>
      <Text allowFontScaling={false} style={nav.logo}>Clue<Text allowFontScaling={false} style={nav.accent}>Pot</Text></Text>
      <View style={nav.spacer} />
    </View>
  );
}

const nav = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderBottomColor: '#23252a', backgroundColor: '#131316' },
  logo: { fontSize: 20, fontWeight: '700', color: '#f7f8f8', letterSpacing: -0.3 },
  accent: { color: '#bdc2ff' },
  spacer: { width: 30 },
});

// ── InputField ────────────────────────────────────────────────────────────────

function InputField({
  label, value, onChangeText, placeholder,
  keyboardType, autoCapitalize, secureTextEntry,
  leftIcon, rightElement,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  secureTextEntry?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightElement?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={f.group}>
      <Text allowFontScaling={false} style={f.label}>{label}</Text>
      <View style={[f.wrap, focused && f.wrapFocused]}>
        {leftIcon && (
          <Ionicons name={leftIcon} size={17} color={focused ? '#bdc2ff' : '#454652'} style={f.leftIcon} />
        )}
        <TextInput
          style={f.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#454652"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType ?? 'default'}
          autoCapitalize={autoCapitalize ?? 'none'}
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightElement}
      </View>
    </View>
  );
}

const f = StyleSheet.create({
  group: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '600', color: '#8a8f98', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 },
  wrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141516', borderWidth: 1.5, borderColor: '#23252a', borderRadius: 10, paddingHorizontal: 14, height: 52 },
  wrapFocused: { borderColor: '#5e6ad2', backgroundColor: 'rgba(94,106,210,0.06)' },
  leftIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#f7f8f8', height: '100%', textAlignVertical: 'center' },
});

// ── LoginScreen ───────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const scale = useRef(new Animated.Value(1)).current;

  function pressIn() { Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 60, bounciness: 0 }).start(); }
  function pressOut() { Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 5 }).start(); }

  async function handleLogin() {
    if (!email.trim()) { setError('이메일을 입력해주세요.'); return; }
    if (!password) { setError('비밀번호를 입력해주세요.'); return; }
    setLoading(true);
    setError('');
    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
    if (authErr) {
      setLoading(false);
      setError('이메일 또는 비밀번호가 올바르지 않아요.');
      return;
    }
    const { data } = await api.get('/profile');
    setUser(data);
    setLoading(false);
    router.replace('/(app)/home');
  }

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="#131316" />
      <NavHeader />

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 헤딩 */}
        <View style={s.headingSection}>
          <Text allowFontScaling={false} style={s.eyebrow}>SIGN IN</Text>
          <Text allowFontScaling={false} style={s.heading}>다시 오셨군요</Text>
          <Text allowFontScaling={false} style={s.subheading}>계정에 로그인해 모임을 이어가세요.</Text>
        </View>

        {/* 카드 */}
        <View style={s.card}>
          <View style={s.glowAccent} pointerEvents="none" />

          <InputField
            label="이메일"
            value={email}
            onChangeText={(t) => { setEmail(t); setError(''); }}
            placeholder="name@example.com"
            keyboardType="email-address"
            leftIcon="mail-outline"
          />

          <InputField
            label="비밀번호"
            value={password}
            onChangeText={(t) => { setPassword(t); setError(''); }}
            placeholder="••••••••"
            secureTextEntry={!showPw}
            leftIcon="lock-closed-outline"
            rightElement={
              <TouchableOpacity onPress={() => setShowPw(v => !v)} hitSlop={8}>
                <Ionicons
                  name={showPw ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#8a8f98"
                />
              </TouchableOpacity>
            }
          />

          {/* 에러 */}
          {error ? (
            <View style={s.errorRow}>
              <Ionicons name="alert-circle-outline" size={14} color="#ffb4ab" />
              <Text allowFontScaling={false} style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* CTA */}
          <Animated.View style={[{ transform: [{ scale }] }, s.btnWrap]}>
            <TouchableOpacity
              style={[s.btn, loading && { opacity: 0.5 }]}
              onPress={handleLogin}
              onPressIn={pressIn}
              onPressOut={pressOut}
              disabled={loading}
              activeOpacity={1}
              accessibilityRole="button"
              accessibilityLabel="로그인하기"
            >
              {loading
                ? <ActivityIndicator color="#fdfaff" size="small" />
                : (
                  <>
                    <Text allowFontScaling={false} style={s.btnText}>로그인하기</Text>
                    <Ionicons name="arrow-forward" size={16} color="#fdfaff" />
                  </>
                )
              }
            </TouchableOpacity>
          </Animated.View>

          {/* 구분선 */}
          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Text allowFontScaling={false} style={s.dividerText}>또는</Text>
            <View style={s.dividerLine} />
          </View>

          {/* 회원가입 링크 */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/signup')}
            style={s.linkBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <Text allowFontScaling={false} style={s.linkText}>
              처음이세요?{'  '}
              <Text allowFontScaling={false} style={s.linkAccent}>계정 만들기</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#131316' },
  scroll: { paddingHorizontal: 20, paddingTop: 36, paddingBottom: 60 },

  /* 헤딩 */
  headingSection: { marginBottom: 28 },
  eyebrow: { fontSize: 11, fontWeight: '600', color: '#5e6ad2', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },
  heading: { fontSize: 32, fontWeight: '700', color: '#f7f8f8', letterSpacing: -0.8, lineHeight: 38, marginBottom: 8 },
  subheading: { fontSize: 14, color: '#8a8f98', lineHeight: 20 },

  /* 카드 */
  card: { backgroundColor: '#0f1011', borderWidth: 1, borderColor: '#23252a', borderRadius: 16, padding: 24, overflow: 'hidden' },
  glowAccent: { position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(94,106,210,0.06)' },

  /* 에러 */
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -4, marginBottom: 12 },
  errorText: { fontSize: 12, color: '#ffb4ab', flex: 1, lineHeight: 18 },

  /* 버튼 */
  btnWrap: { marginTop: 8 },
  btn: { height: 52, backgroundColor: '#5e6ad2', borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(189,194,255,0.2)' },
  btnText: { fontSize: 15, fontWeight: '700', color: '#fdfaff', letterSpacing: -0.2 },

  /* 구분선 */
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#23252a' },
  dividerText: { fontSize: 11, fontWeight: '600', color: '#454652', textTransform: 'uppercase', letterSpacing: 1 },

  /* 링크 */
  linkBtn: { alignItems: 'center', paddingVertical: 4 },
  linkText: { fontSize: 13, color: '#8a8f98' },
  linkAccent: { color: '#bdc2ff', fontWeight: '700' },
});
