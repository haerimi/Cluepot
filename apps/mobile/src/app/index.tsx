import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';

export default function IndexScreen() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { data } = await api.get('/profile');
        setUser(data)
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
    backgroundColor: '#010102',
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
