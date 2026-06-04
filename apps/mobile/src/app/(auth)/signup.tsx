import { View, Text, StyleSheet } from 'react-native';

export default function SignupScreen() {
  // TODO: email, password, nickname state 선언
  // TODO: handleSignup
  //   1. supabase.auth.signUp 호출
  //   2. 성공 시 api.post('/auth/register', { id, email, nickname }) 로 Prisma user 생성
  //   3. 완료 후 /(auth)/login 이동
  // TODO: UI — 닉네임/이메일/비밀번호 입력, 가입 버튼, 뒤로가기

  return (
    <View style={styles.container}>
      <Text>회원가입 화면</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F0', alignItems: 'center', justifyContent: 'center' },
});
