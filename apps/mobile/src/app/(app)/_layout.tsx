import { Drawer } from 'expo-router/drawer';
import { Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function Logo() {
  return (
    <Text style={{ fontSize: 20, fontWeight: '900', color: '#1A2033' }}>
      Clue<Text style={{ color: '#7298C7' }}>Pot</Text>
    </Text>
  );
}

export default function AppLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer screenOptions={{ drawerPosition: 'right', headerTitle: () => <Logo /> }}>
                <Drawer.Screen name="home" options={{ drawerLabel: '홈', title: '홈' }} />
                <Drawer.Screen name="calendar" options={{ drawerLabel: '내 일정', title: '내 일정' }} />
                <Drawer.Screen name="rooms/create" options={{ drawerLabel: '일정 만들기', title: '일정 만들기' }} />
                <Drawer.Screen name="rooms/join" options={{ drawerLabel: '코드로 참가', title: '코드로 참가' }} />
                <Drawer.Screen name="rooms/[code]" options={{ drawerItemStyle: { display: 'none' } }} />
            </Drawer>
        </GestureHandlerRootView>
    );
}