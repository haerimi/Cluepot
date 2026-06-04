import { Stack } from 'expo-router';

export default function RootLayout() {
  // TODO: 앱 시작 시 Supabase 세션 복원 후 유저 정보 로드
  // TODO: supabase.auth.onAuthStateChange로 로그인/로그아웃 이벤트 구독

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      {/* TODO: (auth) 그룹 화면 추가 */}
      {/* TODO: (app) 그룹 화면 추가 */}
    </Stack>
  );
}
