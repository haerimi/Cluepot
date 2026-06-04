import { View, Text, StyleSheet } from 'react-native';

export default function IndexScreen() {
  // TODO: 세션 확인 후 로그인 상태면 /(app)/home, 아니면 /(auth)/login 으로 redirect

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CluePot</Text>
      <Text style={styles.subtitle}>모임의 중심을 찾다</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F5F0',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A2033',
  },
  subtitle: {
    fontSize: 16,
    color: '#5A6A85',
    marginTop: 8,
  },
});
