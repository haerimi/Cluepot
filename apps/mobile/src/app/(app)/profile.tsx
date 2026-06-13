import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Image, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const initial = (user?.nickname?.[0] ?? user?.email?.[0] ?? '?').toUpperCase();

  const avatarUri = localPreview && localPreview !== 'DELETE'
    ? localPreview
    : (localPreview === 'DELETE' ? null : user?.profileImage ?? null);

  async function handlePickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setLocalPreview(result.assets[0].uri);
    }
  }

  function handleCancel() {
    setNickname(user?.nickname ?? '');
    setLocalPreview(null);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    router.replace('/(auth)/login');
  }

  async function handleSave() {
    if (!nickname.trim()) return;
    let imageUrl: string | undefined;
    setSaving(true);

    try {
      if (localPreview === 'DELETE') {
        if (user?.profileImage) {
          const url = new URL(user.profileImage);
          const path = url.pathname.split('/cluepot/')[1];
          await supabase.storage.from('cluepot').remove([path]);
        }
        imageUrl = undefined;
      } else if (localPreview) {
        const response = await fetch(localPreview);
        const blob = await response.blob();
        const ext = blob.type.split('/')[1] ?? 'jpg';
        const path = `user/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('cluepot').upload(path, blob);
        if (error) throw new Error('이미지 업로드 실패');
        imageUrl = supabase.storage.from('cluepot').getPublicUrl(path).data.publicUrl;
      }

      await api.patch('/profile', {
        nickname: nickname.trim(),
        profileImage: localPreview === 'DELETE' ? null : imageUrl,
      });

      setUser(user ? {
        ...user,
        nickname: nickname.trim(),
        profileImage: localPreview === 'DELETE' ? null : (imageUrl ?? user.profileImage ?? null),
      } : null);

      setLocalPreview(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch {
      Alert.alert('오류', '저장에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

      {/* 프로필 카드 */}
      <View style={styles.card}>

        {/* 헤더 */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>계정 설정</Text>
          <Text style={styles.cardSubtitle}>공개 프로필과 설정을 관리하세요.</Text>
        </View>

        {/* 아바타 */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickImage} style={styles.avatarWrap} activeOpacity={0.85}>
            {avatarUri
              ? <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
              : <View style={styles.avatarFallback}><Text style={styles.avatarInitial}>{initial}</Text></View>
            }
            <View style={styles.avatarOverlay}>
              <Ionicons name="camera-outline" size={24} color="#f7f8f8" />
              <Text style={styles.avatarOverlayLabel}>변경</Text>
            </View>
          </TouchableOpacity>

          {(user?.profileImage || localPreview) && localPreview !== 'DELETE' && (
            <TouchableOpacity onPress={() => setLocalPreview('DELETE')} style={styles.removeBtn} activeOpacity={0.8}>
              <Text style={styles.removeBtnText}>이미지 삭제</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 닉네임 */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>닉네임</Text>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            maxLength={20}
            placeholder="표시 이름을 입력하세요"
            placeholderTextColor="#454652"
          />
        </View>

        {/* 이메일 (read-only) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>이메일</Text>
          <View style={styles.inputReadonly}>
            <Text style={styles.inputReadonlyText} numberOfLines={1}>{user?.email ?? '-'}</Text>
          </View>
        </View>

        {/* 구분선 */}
        <View style={styles.divider} />

        {/* 액션 버튼 */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} disabled={saving} activeOpacity={0.8}>
            <Text style={styles.cancelBtnText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveBtn, saveSuccess && styles.saveBtnSuccess, saving && { opacity: 0.5 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving
              ? <ActivityIndicator color="#fdfaff" size="small" />
              : <Text style={styles.saveBtnText}>{saveSuccess ? '저장됨' : '저장하기'}</Text>
            }
          </TouchableOpacity>
        </View>
      </View>

      {/* 로그아웃 */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={16} color="#ffb4ab" />
        <Text style={styles.logoutBtnText}>로그아웃</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const AVATAR_SIZE = 128;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#131316' },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 24, paddingBottom: 88 },

  /* 카드 */
  card: {
    backgroundColor: '#0f1011',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#23252a',
    padding: 24,
    marginBottom: 12,
  },

  /* 헤더 */
  cardHeader: { alignItems: 'center', marginBottom: 24 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#f7f8f8', letterSpacing: -0.4, marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: '#8a8f98', textAlign: 'center' },

  /* 아바타 */
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#34343a',
    marginBottom: 10,
  },
  avatarImg: { width: AVATAR_SIZE, height: AVATAR_SIZE },
  avatarFallback: { width: '100%', height: '100%', backgroundColor: '#5e6ad2', alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 44, fontWeight: '700', color: '#fdfaff' },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    backgroundColor: 'rgba(1,1,2,0.68)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  avatarOverlayLabel: { fontSize: 10, fontWeight: '600', color: '#f7f8f8', letterSpacing: 0.8, textTransform: 'uppercase' },
  removeBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: '#93000a' },
  removeBtnText: { fontSize: 11, fontWeight: '600', color: '#ffb4ab' },

  /* 폼 */
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: '#8a8f98', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#23252a',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#f7f8f8',
    backgroundColor: '#0f1011',
  },
  inputReadonly: {
    height: 48,
    borderWidth: 1,
    borderColor: '#23252a',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#0e0e11',
    opacity: 0.6,
  },
  inputReadonlyText: { fontSize: 14, color: '#8a8f98' },

  /* 구분선 */
  divider: { height: 1, backgroundColor: '#23252a', marginVertical: 24 },

  /* 액션 */
  actions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, height: 48, borderRadius: 8, borderWidth: 1, borderColor: '#23252a', backgroundColor: '#0f1011', alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: '#8a8f98' },
  saveBtn: { flex: 1, height: 48, borderRadius: 8, backgroundColor: '#5e6ad2', alignItems: 'center', justifyContent: 'center' },
  saveBtnSuccess: { backgroundColor: '#27a644' },
  saveBtnText: { fontSize: 14, fontWeight: '600', color: '#fdfaff' },

  /* 로그아웃 */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#23252a',
    backgroundColor: '#0f1011',
  },
  logoutBtnText: { fontSize: 14, fontWeight: '600', color: '#ffb4ab' },
});
