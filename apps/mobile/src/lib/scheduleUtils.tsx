import { View, Text, StyleSheet } from 'react-native';

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const month   = d.getMonth() + 1;
  const day     = d.getDate();
  const weekday = weekdays[d.getDay()];
  const h = d.getHours();
  const m = d.getMinutes();
  const period = h < 12 ? '오전' : '오후';
  const hour   = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return {
    date: `${month}월 ${day}일 (${weekday})`,
    time: `${period} ${hour}:${String(m).padStart(2, '0')}`,
  };
}

export function InitialAvatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <View style={[av.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
<<<<<<< HEAD
      <Text allowFontScaling={false} style={[av.text, { fontSize: size * 0.4 }]}>
=======
      <Text style={[av.text, { fontSize: size * 0.4 }]}>
>>>>>>> main
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

const av = StyleSheet.create({
  wrap: {
    backgroundColor: '#5e6ad2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#34343a',
  },
  text: { color: '#fdfaff', fontWeight: '700' },
});
