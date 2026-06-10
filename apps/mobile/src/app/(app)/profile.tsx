import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Modal, Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [modalVisible, setModalVisible] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [saving, setSaving] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const initial = (user?.nickname?.[0] ?? user?.email?.[0] ?? '?').toUpperCase();

  // 이미지 선택 함수
  async function handlePickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],  // 정사각형 크롭
      quality: 0.8,
    });

    if (!result.canceled) {
      setLocalPreview(result.assets[0].uri);
    }
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
        // 삭제 — null로 저장
        if (user?.profileImage) {
          const url = new URL(user.profileImage);
          // pathname: /storage/v1/object/public/cluepot/user/xxx.jpg
          const path = url.pathname.split('/cluepot/')[1]; // user/xxx.jpg
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
      setModalVisible(false);
    } catch {
      Alert.alert('오류', '저장에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  }


  return (
    <View style={styles.container}>
      {/* 아바타 */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          {user?.profileImage
            ? <Image source={{ uri: user.profileImage }} style={{ width: 72, height: 72, borderRadius: 36 }} />
            : <Text style={styles.avatarText}>{initial}</Text>
          }
        </View>
        <Text style={styles.nickname}>{user?.nickname}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* 정보 카드 */}
      <View style={styles.card}>
        <Row label="닉네임" value={user?.nickname ?? '-'} />
        <View style={styles.divider} />
        <Row label="이메일" value={user?.email ?? '-'} />
      </View>

      {/* 버튼 */}
      <TouchableOpacity style={styles.editBtn} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <Text style={styles.editBtnText}>프로필 수정</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={styles.logoutBtnText}>로그아웃</Text>
      </TouchableOpacity>

      {/* 수정 모달 */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => { setModalVisible(false); setLocalPreview(null); }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>프로필 수정</Text>

            <Text style={styles.fieldLabel}>프로필 사진</Text>
            <TouchableOpacity onPress={handlePickImage} style={{ alignSelf: 'center', marginBottom: 20 }}>
              <View style={styles.avatar}>
                {localPreview && localPreview !== 'DELETE'
                  ? <Image
                    source={{ uri: localPreview ?? user?.profileImage ?? '' }}
                    style={{ width: 72, height: 72, borderRadius: 36 }}
                  />
                  : (user?.profileImage && localPreview !== 'DELETE')
                    ? <Image
                      source={{ uri: user?.profileImage ?? '' }}
                      style={{ width: 72, height: 72, borderRadius: 36 }}
                    />
                    : <Text style={styles.avatarText}>{initial}</Text>
                }
              </View>
            </TouchableOpacity>

            {(user?.profileImage) && (
              <TouchableOpacity onPress={() => setLocalPreview('DELETE')} style={{ alignSelf: 'center', marginBottom: 20 }}>
                <Text style={styles.removeLabel}>이미지 삭제</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.fieldLabel}>닉네임</Text>
            <TextInput
              style={styles.input}
              value={nickname}
              onChangeText={setNickname}
              maxLength={20}
              placeholder="닉네임을 입력하세요"
              placeholderTextColor="#B0BAC8"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setModalVisible(false); setLocalPreview(null); }}
                disabled={saving}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.5 }]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.8}
              >
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.saveBtnText}>저장</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F0' },
  avatarSection: { alignItems: 'center', paddingVertical: 32, backgroundColor: '#1A2033' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#7298C7', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: '900', color: '#fff' },
  nickname: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4 },
  email: { fontSize: 13, color: '#9AAFC5' },
  card: { margin: 20, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E2E6EC', overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  rowLabel: { fontSize: 11, fontWeight: '700', color: '#9AAFC5', textTransform: 'uppercase', letterSpacing: 1 },
  rowValue: { fontSize: 14, color: '#1A2033', flex: 1, textAlign: 'right' },
  divider: { height: 1, backgroundColor: '#F0EDE7', marginHorizontal: 16 },
  editBtn: { marginHorizontal: 20, height: 48, backgroundColor: '#EEF3FB', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  editBtnText: { fontSize: 15, fontWeight: '700', color: '#7298C7' },
  logoutBtn: { marginHorizontal: 20, height: 48, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E6EC' },
  logoutBtnText: { fontSize: 15, fontWeight: '700', color: '#E05555' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#E2E6EC', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#1A2033', textAlign: 'center', marginBottom: 24 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#9AAFC5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  input: { height: 48, borderWidth: 1, borderColor: '#E2E6EC', borderRadius: 12, paddingHorizontal: 16, fontSize: 16, color: '#1A2033', backgroundColor: '#F4F5F0', marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#E2E6EC', alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#5A6A85' },
  saveBtn: { flex: 1, height: 48, borderRadius: 12, backgroundColor: '#7298C7', alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  removeLabel: { fontSize: 11, fontWeight: '700', color: '#E05555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
});