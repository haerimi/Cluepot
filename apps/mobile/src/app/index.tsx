import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MeetSpot</Text>
      <Text style={styles.subtitle}>모임의 중심을 찾다</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F2EE',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1C1A17',
  },
  subtitle: {
    fontSize: 16,
    color: '#908D87',
    marginTop: 8,
  },
});
