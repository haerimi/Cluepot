import { View, Text, StyleSheet } from 'react-native';

export default function JoinRoomScreen() {
  // TODO: code state 선언
  // TODO: handleJoin
  //   1. api.get(`/rooms/${roomCode}`) 로 유효성 확인
  //   2. valid 이면 /(app)/rooms/[code] 로 이동, 아니면 에러 메시지 표시
  // TODO: UI — 코드 입력 TextInput, 참가하기 버튼, 뒤로가기

  return (
    <View style={styles.container}>
      <Text>코드로 참가</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F0', alignItems: 'center', justifyContent: 'center' },
});
