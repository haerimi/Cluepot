import { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator, Platform, StatusBar, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';

function NavHeader({ initial, onBack }: { initial: string; onBack: () => void }) {
  const profileImage = useAuthStore((s) => s.user?.profileImage ?? null);
  return (
    <View style={navHdr.wrap}>
      <TouchableOpacity onPress={onBack} style={navHdr.backBtn} hitSlop={8}>
        <Ionicons name="chevron-back" size={22} color="#c6c5d5" />
      </TouchableOpacity>
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
  wrap:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: SB_H, height: 56 + SB_H, borderBottomWidth: 1, borderBottomColor: '#23252a', backgroundColor: '#131316' },
  backBtn:    { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  logo:       { fontSize: 20, fontWeight: '700', color: '#f7f8f8', letterSpacing: -0.3 },
  accent:     { color: '#bdc2ff' },
  avatar:     { width: 30, height: 30, borderRadius: 15, backgroundColor: '#5e6ad2', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#34343a', overflow: 'hidden' },
  avatarImg:  { width: 30, height: 30, borderRadius: 15 },
  avatarText: { fontSize: 12, fontWeight: '700', color: '#fdfaff' },
});

const CODE_LENGTH = 6;

export default function JoinRoomScreen() {
  const router = useRouter();
  const user   = useAuthStore((s) => s.user);
  const initial = (user?.nickname?.[0] ?? user?.email?.[0] ?? '?').toUpperCase();
  const [digits,  setDigits]  = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const refs = useRef<(TextInput | null)[]>([]);

  const code = digits.join('');
  const isFull = code.length === CODE_LENGTH;

  function handleChange(text: string, index: number) {
    const cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    setError('');

    if (cleaned.length > 1) {
      // 붙여넣기: index부터 순서대로 채움
      const next = [...digits];
      let lastIdx = index;
      for (let i = 0; i < cleaned.length && index + i < CODE_LENGTH; i++) {
        next[index + i] = cleaned[i];
        lastIdx = index + i;
      }
      setDigits(next);
      refs.current[Math.min(lastIdx, CODE_LENGTH - 1)]?.focus();
      if (next.every(Boolean)) handleJoin(next.join(''));
      return;
    }

    const char = cleaned;
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (char && index < CODE_LENGTH - 1) refs.current[index + 1]?.focus();
    if (char && index === CODE_LENGTH - 1) handleJoin(next.join(''));
  }

  function handleKeyPress(key: string, index: number) {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
      refs.current[index - 1]?.focus();
    }
  }

  async function handleJoin(roomCode = code) {
    const trimmed = roomCode.trim().toUpperCase();
    if (trimmed.length < CODE_LENGTH) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/rooms/${trimmed}`);
      if (!data.valid) {
        setError(data.reason ?? '유효하지 않은 코드예요.');
        setDigits(Array(CODE_LENGTH).fill(''));
        refs.current[0]?.focus();
        return;
      }
      router.replace(`/(app)/rooms/${trimmed}`);
    } catch {
      setError('오류가 발생했어요. 다시 시도해주세요.');
      setDigits(Array(CODE_LENGTH).fill(''));
      refs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={s.container}>
      <NavHeader initial={initial} onBack={() => router.back()} />

      {/* 타이틀 */}
      <View style={s.titleSection}>
        <Text allowFontScaling={false} style={s.eyebrow}>JOIN WITH CODE</Text>
        <Text allowFontScaling={false} style={s.title}>모임 코드 입력</Text>
        <Text allowFontScaling={false} style={s.subtitle}>호스트에게 받은 6자리 코드를 입력해주세요</Text>
      </View>

      {/* 6박스 입력 */}
      <View style={s.boxRow}>
        {digits.map((d, i) => {
          const isFocused = false; // visual focus managed via borderColor in onFocus/onBlur
          return (
            <BoxCell
              key={i}
              value={d}
              index={i}
              inputRef={(el) => { refs.current[i] = el; }}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              autoFocus={i === 0}
              hasError={!!error}
            />
          );
        })}
      </View>

      {/* 에러 */}
      {error ? (
        <View style={s.errorRow}>
          <Ionicons name="alert-circle-outline" size={14} color="#ffb4ab" />
          <Text allowFontScaling={false} style={s.errorText}>{error}</Text>
        </View>
      ) : (
        <Text allowFontScaling={false} style={s.hint}>영문 + 숫자 조합 6자리</Text>
      )}

      {/* 참가 버튼 */}
      <TouchableOpacity
        style={[s.btn, (!isFull || loading) && s.btnDisabled]}
        onPress={() => handleJoin()}
        disabled={!isFull || loading}
        activeOpacity={0.8}
      >
        {loading
          ? <ActivityIndicator color="#fdfaff" size="small" />
          : <Text allowFontScaling={false} style={s.btnText}>참가하기</Text>}
      </TouchableOpacity>

      {/* 새 모임 만들기 */}
      <TouchableOpacity
        style={s.createLink}
        onPress={() => router.push('/(app)/rooms/create')}
        activeOpacity={0.7}
      >
        <Text allowFontScaling={false} style={s.createLinkText}>새 모임 만들기</Text>
        <Ionicons name="arrow-forward" size={14} color="#bdc2ff" />
      </TouchableOpacity>
    </View>
  );
}

// ─── BoxCell ──────────────────────────────────────────────────────────────────

function BoxCell({
  value, index, inputRef, onChangeText, onKeyPress, autoFocus, hasError,
}: {
  value: string;
  index: number;
  inputRef: (el: TextInput | null) => void;
  onChangeText: (t: string) => void;
  onKeyPress: (e: { nativeEvent: { key: string } }) => void;
  autoFocus?: boolean;
  hasError: boolean;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        s.box,
        focused && s.boxFocused,
        hasError && s.boxError,
        value && !hasError && s.boxFilled,
      ]}
    >
      <TextInput
        ref={inputRef}
        style={s.boxInput}
        value={value}
        onChangeText={onChangeText}
        onKeyPress={onKeyPress}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        maxLength={CODE_LENGTH}
        autoCapitalize="characters"
        autoCorrect={false}
        keyboardType="default"
        autoFocus={autoFocus}
        caretHidden
        selectionColor="#5e6ad2"
        accessibilityLabel={`코드 ${index + 1}번째 자리`}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131316',
    paddingHorizontal: 24,
    paddingTop: 16,
  },

  titleSection: {
    marginTop: 40,
    marginBottom: 40,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '600',
    color: '#454652',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f7f8f8',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8a8f98',
    lineHeight: 20,
  },

  /* 6박스 */
  boxRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
  },
  box: {
    flex: 1,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#18191a',
    borderWidth: 1.5,
    borderColor: '#23252a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFocused: {
    borderColor: '#5e6ad2',
    backgroundColor: '#141516',
  },
  boxFilled: {
    borderColor: '#34343a',
  },
  boxError: {
    borderColor: '#ffb4ab',
    backgroundColor: '#1a1213',
  },
  boxInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#bdc2ff',
    letterSpacing: 0,
  },

  /* 에러 / 힌트 */
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 13,
    color: '#ffb4ab',
  },
  hint: {
    fontSize: 12,
    color: '#454652',
    textAlign: 'center',
    marginBottom: 24,
  },

  /* CTA */
  btn: {
    height: 54,
    backgroundColor: '#5e6ad2',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#7880e0',
    marginBottom: 16,
  },
  btnDisabled: { opacity: 0.35 },
  btnText: {
    color: '#fdfaff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  /* 새 모임 링크 */
  createLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
  },
  createLinkText: {
    fontSize: 14,
    color: '#bdc2ff',
    fontWeight: '500',
  },
});
