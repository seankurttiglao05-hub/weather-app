import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function HourlyForecast({ hours }) {
  return (
    <View style={styles.card}>
      <View style={styles.headingRow}>
        <MaterialCommunityIcons name="clock-outline" size={18} color="rgba(255,255,255,0.8)" />
        <Text style={styles.heading}>Next 24 hours</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {hours.map((hour) => (
          <View key={hour.time} style={styles.item}>
            <Text style={styles.time}>{hour.time}</Text>
            <Text style={styles.emoji}>{hour.condition.emoji}</Text>
            <Text style={styles.temp}>{hour.temperature}°</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { marginTop: 16, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 24, paddingVertical: 18 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, marginBottom: 14 },
  heading: { fontSize: 15, color: 'rgba(255,255,255,0.8)' },
  item: { alignItems: 'center', gap: 8, width: 70 },
  time: { fontSize: 14, color: '#FFFFFF' },
  emoji: { fontSize: 26, lineHeight: 34 },
  temp: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },
})
