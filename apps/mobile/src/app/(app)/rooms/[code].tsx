import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function RoomScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const roomCode = code?.toUpperCase() ?? '';

  // TODO: init() — 방 입장 및 참가자 목록 로드
  //   1. api.post(`/rooms/${roomCode}/join`) → isHost, category, savedPreference 받기
  //   2. savedPreference 있으면 폼 상태 복원 + setLocationSaved(true)
  //   3. api.get(`/rooms/${roomCode}/participants`) → 참가자 목록

  // TODO: handleSavePreference
  //   api.post(`/rooms/${roomCode}/preference`, { abstractLocation, lat, lng, transports, distanceTolerance, atmospherePreference })
  //   성공 시 setLocationSaved(true), 참가자 목록 새로고침

  // TODO: UI
  //   - 헤더 (뒤로가기, 준비현황 배지, roomCode)
  //   - 참가자 목록 (준비/대기 상태 표시)
  //   - 선호 입력 폼 (출발지, 교통수단, 이동거리, 분위기)
  //   - 저장 완료 시 savedBox 표시
  //   - 호스트일 때 PINI 실행 버튼

  return (
    <View style={styles.container}>
      <Text>방 화면: {roomCode}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F0', alignItems: 'center', justifyContent: 'center' },
});
