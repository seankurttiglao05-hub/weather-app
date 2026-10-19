import { View, Text, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { getLifeIndex } from '../insights'

export default function LifeIndex({ weather }) {
  const tips = getLifeIndex(weather)

  return (
    <View style={styles.card}>
      <View style={styles.headingRow}>
        <MaterialCommunityIcons name="umbrella-beach-outline" size={18} color="rgba(255,255,255,0.8)" />
        <Text style={styles.heading}>Life index</Text>
      </View>
      <View style={styles.grid}>
        {tips.map((tip) => (
          <View key={tip.icon} style={styles.item}>
            <MaterialCommunityIcons name={tip.icon} size={30} color="#FFFFFF" />
            <Text style={styles.text}>{tip.text}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { marginTop: 16, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 24, padding: 18 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  heading: { fontSize: 15, color: 'rgba(255,255,255,0.8)' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  item: { width: '50%', alignItems: 'center', gap: 8, paddingVertical: 16, paddingHorizontal: 8 },
  text: { fontSize: 14, color: '#FFFFFF', textAlign: 'center' },
})
