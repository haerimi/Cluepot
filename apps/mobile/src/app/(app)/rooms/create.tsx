import { View, Text, StyleSheet } from 'react-native';

export default function CreateRoomScreen() {
  // TODO: step(1→2→3), category, name state 선언
  // TODO: handleCreate — api.post('/rooms', { category, name }) 호출
  //   성공 시 roomCode 받아서 step 3으로 이동
  // TODO: UI
  //   - Step 1: 카테고리 선택 (restaurant / cafe / bar / brunch / dessert)
  //   - Step 2: 모임 이름 입력
  //   - Step 3: 완료 화면 (roomCode 표시, 복사, 모임 입장 버튼)

  return (
    <View style={styles.container}>
      <Text>모임 만들기</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F0', alignItems: 'center', justifyContent: 'center' },
});
