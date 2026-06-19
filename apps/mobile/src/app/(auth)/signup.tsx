import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  StatusBar, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';

// ── NavHeader ─────────────────────────────────────────────────────────────────

function NavHeader() {
  return (
    <View style={nav.wrap}>
<<<<<<< HEAD
      <Text allowFontScaling={false} style={nav.logo}>Clue<Text allowFontScaling={false} style={nav.accent}>Pot</Text></Text>
=======
      <Text style={nav.logo}>Clue<Text style={nav.accent}>Pot</Text></Text>
>>>>>>> main
      <View style={nav.spacer} />
    </View>
  );
}

const nav = StyleSheet.create({
  wrap:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderBottomColor: '#23252a', backgroundColor: '#131316' },
  logo:   { fontSize: 20, fontWeight: '700', color: '#f7f8f8', letterSpacing: -0.3 },
  accent: { color: '#bdc2ff' },
  spacer: { width: 30 },
});

// ── InputField ────────────────────────────────────────────────────────────────

function InputField({
  label, value, onChangeText, placeholder,
  keyboardType, autoCapitalize, secureTextEntry,
  leftIcon, rightElement, hint,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: any;
  autoCapitalize?: any;
  secureTextEntry?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightElement?: React.ReactNode;
  hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={f.group}>
<<<<<<< HEAD
      <Text allowFontScaling={false} style={f.label}>{label}</Text>
=======
      <Text style={f.label}>{label}</Text>
>>>>>>> main
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
<<<<<<< HEAD
      {hint ? <Text allowFontScaling={false} style={f.hint}>{hint}</Text> : null}
=======
      {hint ? <Text style={f.hint}>{hint}</Text> : null}
>>>>>>> main
    </View>
  );
}

const f = StyleSheet.create({
  group:      { marginBottom: 16 },
  label:      { fontSize: 11, fontWeight: '600', color: '#8a8f98', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 },
  wrap:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141516', borderWidth: 1.5, borderColor: '#23252a', borderRadius: 10, paddingHorizontal: 14, height: 52 },
  wrapFocused:{ borderColor: '#5e6ad2', backgroundColor: 'rgba(94,106,210,0.06)' },
  leftIcon:   { marginRight: 10 },
<<<<<<< HEAD
  input:      { flex: 1, fontSize: 15, color: '#f7f8f8', height: '100%', textAlignVertical: 'center' },
=======
  input:      { flex: 1, fontSize: 15, color: '#f7f8f8', height: '100%' },
>>>>>>> main
  hint:       { fontSize: 11, color: '#454652', marginTop: 5, marginLeft: 2 },
});

// ── SignupScreen ──────────────────────────────────────────────────────────────

export default function SignupScreen() {
  const [nickname, setNickname] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const router = useRouter();
  const scale  = useRef(new Animated.Value(1)).current;

  function pressIn()  { Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 60, bounciness: 0 }).start(); }
  function pressOut() { Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 40, bounciness: 5 }).start(); }

  function validate() {
    if (!nickname.trim())        { setError('닉네임을 입력해주세요.'); return false; }
    if (!email.trim())           { setError('이메일을 입력해주세요.'); return false; }
    if (password.length < 8)     { setError('비밀번호는 8자 이상이어야 해요.'); return false; }
    return true;
  }

  async function handleSignup() {
    if (!validate()) return;
    setLoading(true);
    setError('');
    const { data, error: authErr } = await supabase.auth.signUp({ email, password });
    if (authErr) {
      setLoading(false);
      setError('계정을 만들 수 없어요. 다시 시도해주세요.');
      return;
    }
    await api.post('/auth/register', { id: data.user?.id, email, nickname });
    setLoading(false);
    router.replace('/(auth)/login');
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
<<<<<<< HEAD
          <Text allowFontScaling={false} style={s.eyebrow}>CREATE ACCOUNT</Text>
          <Text allowFontScaling={false} style={s.heading}>CluePot에 오신 것을{'\n'}환영해요</Text>
          <Text allowFontScaling={false} style={s.subheading}>이메일과 닉네임으로 시작하세요.</Text>
=======
          <Text style={s.eyebrow}>CREATE ACCOUNT</Text>
          <Text style={s.heading}>CluePot에 오신 것을{'\n'}환영해요</Text>
          <Text style={s.subheading}>이메일과 닉네임으로 시작하세요.</Text>
>>>>>>> main
        </View>

        {/* 카드 */}
        <View style={s.card}>
          <View style={s.glowAccent} pointerEvents="none" />

          <InputField
            label="닉네임"
            value={nickname}
            onChangeText={(t) => { setNickname(t); setError(''); }}
            placeholder="모임에서 불릴 이름"
            autoCapitalize="none"
            leftIcon="person-outline"
          />

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
            placeholder="8자 이상"
            secureTextEntry={!showPw}
            leftIcon="lock-closed-outline"
            hint="최소 8자 이상이어야 해요."
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
<<<<<<< HEAD
              <Text allowFontScaling={false} style={s.errorText}>{error}</Text>
=======
              <Text style={s.errorText}>{error}</Text>
>>>>>>> main
            </View>
          ) : null}

          {/* CTA */}
          <Animated.View style={[{ transform: [{ scale }] }, s.btnWrap]}>
            <TouchableOpacity
              style={[s.btn, loading && { opacity: 0.5 }]}
              onPress={handleSignup}
              onPressIn={pressIn}
              onPressOut={pressOut}
              disabled={loading}
              activeOpacity={1}
              accessibilityRole="button"
              accessibilityLabel="계정 만들기"
            >
              {loading
                ? <ActivityIndicator color="#fdfaff" size="small" />
                : (
                  <>
<<<<<<< HEAD
                    <Text allowFontScaling={false} style={s.btnText}>계정 만들기</Text>
=======
                    <Text style={s.btnText}>계정 만들기</Text>
>>>>>>> main
                    <Ionicons name="arrow-forward" size={16} color="#fdfaff" />
                  </>
                )
              }
            </TouchableOpacity>
          </Animated.View>

          {/* 구분선 */}
          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
<<<<<<< HEAD
            <Text allowFontScaling={false} style={s.dividerText}>또는</Text>
=======
            <Text style={s.dividerText}>또는</Text>
>>>>>>> main
            <View style={s.dividerLine} />
          </View>

          {/* 로그인 링크 */}
          <TouchableOpacity
<<<<<<< HEAD
            onPress={() => router.replace('/(auth)/login')}
=======
            onPress={() => router.push('/(auth)/login')}
>>>>>>> main
            style={s.linkBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
<<<<<<< HEAD
            <Text allowFontScaling={false} style={s.linkText}>
              이미 계정이 있으신가요?{'  '}
              <Text allowFontScaling={false} style={s.linkAccent}>로그인</Text>
=======
            <Text style={s.linkText}>
              이미 계정이 있으신가요?{'  '}
              <Text style={s.linkAccent}>로그인</Text>
>>>>>>> main
            </Text>
          </TouchableOpacity>
        </View>

        {/* 보안 뱃지 */}
        <View style={s.securityRow}>
          <View style={s.securityChip}>
            <Ionicons name="shield-checkmark-outline" size={13} color="#454652" />
<<<<<<< HEAD
            <Text allowFontScaling={false} style={s.securityText}>암호화 보호</Text>
=======
            <Text style={s.securityText}>암호화 보호</Text>
>>>>>>> main
          </View>
          <View style={s.securityDot} />
          <View style={s.securityChip}>
            <Ionicons name="lock-closed-outline" size={13} color="#454652" />
<<<<<<< HEAD
            <Text allowFontScaling={false} style={s.securityText}>개인정보 안전</Text>
=======
            <Text style={s.securityText}>개인정보 안전</Text>
>>>>>>> main
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: '#131316' },
  scroll: { paddingHorizontal: 20, paddingTop: 36, paddingBottom: 60 },

  /* 헤딩 */
  headingSection: { marginBottom: 28 },
  eyebrow:    { fontSize: 11, fontWeight: '600', color: '#5e6ad2', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },
  heading:    { fontSize: 32, fontWeight: '700', color: '#f7f8f8', letterSpacing: -0.8, lineHeight: 38, marginBottom: 8 },
  subheading: { fontSize: 14, color: '#8a8f98', lineHeight: 20 },

  /* 카드 */
  card:       { backgroundColor: '#0f1011', borderWidth: 1, borderColor: '#23252a', borderRadius: 16, padding: 24, overflow: 'hidden' },
  glowAccent: { position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(94,106,210,0.06)' },

  /* 에러 */
  errorRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -4, marginBottom: 12 },
  errorText: { fontSize: 12, color: '#ffb4ab', flex: 1, lineHeight: 18 },

  /* 버튼 */
  btnWrap: { marginTop: 8 },
  btn:     { height: 52, backgroundColor: '#5e6ad2', borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(189,194,255,0.2)' },
  btnText: { fontSize: 15, fontWeight: '700', color: '#fdfaff', letterSpacing: -0.2 },

  /* 구분선 */
  dividerRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#23252a' },
  dividerText: { fontSize: 11, fontWeight: '600', color: '#454652', textTransform: 'uppercase', letterSpacing: 1 },

  /* 링크 */
  linkBtn:    { alignItems: 'center', paddingVertical: 4 },
  linkText:   { fontSize: 13, color: '#8a8f98' },
  linkAccent: { color: '#bdc2ff', fontWeight: '700' },

  /* 보안 뱃지 */
  securityRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 24 },
  securityChip: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  securityText: { fontSize: 11, color: '#454652', fontWeight: '500' },
  securityDot:  { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#34343a' },
});
