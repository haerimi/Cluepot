import { Tabs, useRouter } from 'expo-router';
import { Pressable, Text, View, StyleSheet, Image } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth';

/* 상단 헤더 로고 */
function Logo() {
  return (
    <Text style={hdr.logo}>
      Clue<Text style={hdr.logoAccent}>Pot</Text>
    </Text>
  );
}

/* 상단 헤더 오른쪽: 아바타만 */
function HeaderAvatar() {
  const router       = useRouter();
  const user         = useAuthStore((s) => s.user);
  const initial      = (user?.nickname?.[0] ?? user?.email?.[0] ?? '?').toUpperCase();
  const profileImage = user?.profileImage ?? null;

  return (
    <Pressable
      onPress={() => router.push('/(app)/profile')}
      style={hdr.avatarBtn}
      accessibilityRole="button"
      accessibilityLabel="프로필 화면으로 이동"
      hitSlop={8}
    >
      {profileImage ? (
        <Image source={{ uri: profileImage }} style={hdr.avatar} />
      ) : (
        <View style={[hdr.avatar, hdr.avatarFallback]}>
          <Text style={hdr.avatarText}>{initial}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function AppLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          /* ── 공통 헤더 ── */
          headerTitle: () => <Logo />,
          headerRight: () => <HeaderAvatar />,
          headerLeft: () => null,       // 햄버거 완전 제거
          headerStyle:      { backgroundColor: '#131316', shadowOpacity: 0, elevation: 0, borderBottomWidth: 1, borderBottomColor: '#23252a' },
          headerTitleAlign: 'left',

          /* ── 바텀탭 ── */
          tabBarStyle: {
            backgroundColor: '#0f1011',
            borderTopColor: '#23252a',
            borderTopWidth: 1,
          },
          tabBarActiveTintColor:   '#bdc2ff',
          tabBarInactiveTintColor: '#8a8f98',
          tabBarShowLabel: false,
        }}
      >
        {/* ── 표시 탭 3개 ── */}
        <Tabs.Screen
          name="home"
          options={{
            title: '홈',
            tabBarLabel: '홈',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="rooms/index"
          options={{
            title: '모임',
            tabBarLabel: '모임',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'people' : 'people-outline'} size={22} color={color} />
            ),
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: '캘린더',
            tabBarLabel: '캘린더',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: '프로필',
            tabBarLabel: '프로필',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
            ),
          }}
        />

        {/* ── 탭바에 표시하지 않는 화면 ── */}
        <Tabs.Screen name="rooms/[code]"          options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="rooms/create"          options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="rooms/join"            options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="schedules/[id]"        options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="calendar/[scheduleId]" options={{ href: null, headerShown: false }} />
      </Tabs>
    </GestureHandlerRootView>
  );
}

const hdr = StyleSheet.create({
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f7f8f8',
    letterSpacing: -0.3,
  },
  logoAccent: { color: '#bdc2ff' },
  /* 아바타 버튼 — 44×44 터치 영역 */
  avatarBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#34343a',
  },
  avatarFallback: {
    backgroundColor: '#5e6ad2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fdfaff',
  },
});
