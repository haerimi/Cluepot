import { View, Text, StyleSheet } from 'react-native';

export default function CalendarScreen() {
  // TODO: api.get('/schedules') 로 내 일정 목록 가져오기
  // TODO: UI
  //   - 헤더 (뒤로가기, 타이틀)
  //   - 일정 목록 (FlatList) — 장소명, 날짜/시간, 참가 인원 표시
  //   - 일정 없을 때 빈 화면

  return (
    <View style={styles.container}>
      <Text>캘린더 화면</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F0', alignItems: 'center', justifyContent: 'center' },
});
