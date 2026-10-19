import { View, Text, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function DailyForecast({ days }) {
  return (
    <View style={styles.card}>
      <View style={styles.headingRow}>
        <MaterialCommunityIcons name="calendar-blank-outline" size={18} color="rgba(255,255,255,0.8)" />
        <Text style={styles.heading}>Next 7 days</Text>
      </View>
      {days.map((day, index) => (
        <View key={day.day} style={[styles.row, index > 0 && styles.divider]}>
          <Text style={styles.day}>{day.day}</Text>
          <Text style={styles.emoji}>{day.condition.emoji}</Text>
          <Text style={styles.label}>{day.condition.label}</Text>
          <Text style={styles.temps}>{day.min}° / {day.max}°</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { marginTop: 16, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 18 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  heading: { fontSize: 15, color: 'rgba(255,255,255,0.8)' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  divider: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.18)' },
  day: { width: 56, fontSize: 16, color: '#FFFFFF' },
  emoji: { fontSize: 24, lineHeight: 30 },
  label: { flex: 1, fontSize: 16, color: '#FFFFFF' },
  temps: { fontSize: 16, color: '#FFFFFF' },
})
