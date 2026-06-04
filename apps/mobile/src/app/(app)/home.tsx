import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  // TODO: api.get('/rooms') 로 내 방 목록 가져오기
  // TODO: 로그아웃 — supabase.auth.signOut 후 /(auth)/login 이동
  // TODO: UI
  //   - 헤더 (로고, 닉네임 인사, 로그아웃 버튼)
  //   - 모임 만들기 / 코드로 참가 버튼
  //   - 내 모임 목록 (FlatList)

  return (
    <View style={styles.container}>
      <Text>홈 화면</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F0', alignItems: 'center', justifyContent: 'center' },
});
