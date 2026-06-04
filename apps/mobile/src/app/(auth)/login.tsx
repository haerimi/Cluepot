import { View, Text, StyleSheet } from 'react-native';

export default function LoginScreen() {
  // TODO: email, password state 선언
  // TODO: handleLogin — supabase.auth.signInWithPassword 호출, 성공 시 /(app)/home 이동
  // TODO: UI — 이메일 입력, 비밀번호 입력, 로그인 버튼, 회원가입 링크

  return (
    <View style={styles.container}>
      <Text>로그인 화면</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F0', alignItems: 'center', justifyContent: 'center' },
});
