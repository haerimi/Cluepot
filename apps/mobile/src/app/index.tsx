import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    // TODO: supabase.auth.getSession()으로 세션 확인
    // TODO: 세션 있으면 router.replace('/(app)/home')
    // TODO: 세션 없으면 router.replace('/(auth)/login')
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/(app)/home');
      } else {
        router.replace('/(auth)/login');
      }
    });
  }, []);

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
