import { View, Text, StyleSheet } from 'react-native'
import { getRainCountdown, getSampayMeter, getHeatIndex } from '../dailyHelper'

const LABELS = {
  ph: { heading: '🇵🇭 Daily helper', rain: 'Uulan ba?', laundry: 'Sampay meter' },
  other: { heading: 'Daily helper', rain: 'Rain soon?', laundry: 'Laundry drying' },
}

function Section({ emoji, children, first }) {
  return (
    <View style={[styles.section, !first && styles.divider]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.body}>{children}</View>
    </View>
  )
}

export default function DailyHelper({ weather }) {
  const rain = getRainCountdown(weather)
  const sampay = getSampayMeter(weather)
  const heat = getHeatIndex(weather)
  const labels = weather.isPhilippines ? LABELS.ph : LABELS.other

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>{labels.heading}</Text>

      <Section emoji={rain.emoji} first>
        <Text style={styles.small}>{labels.rain}</Text>
        <Text style={styles.title}>{rain.title}</Text>
        <Text style={styles.detail}>{rain.detail}</Text>
      </Section>

      {sampay && (
        <Section emoji={sampay.emoji}>
          <Text style={styles.small}>{labels.laundry} · {sampay.day}</Text>
          <Text style={styles.title}>
            {sampay.score}/10 <Text style={styles.verdict}>{sampay.verdict}</Text>
          </Text>
          <View style={styles.meter}>
            {Array.from({ length: 10 }, (_, i) => (
              <View key={i} style={[styles.segment, i < sampay.score && styles.segmentOn]} />
            ))}
          </View>
          {sampay.bestTime && <Text style={styles.detail}>Best time: {sampay.bestTime}</Text>}
        </Section>
      )}

      <Section emoji="🌡️">
        <Text style={styles.small}>Heat index</Text>
        <View style={styles.heatRow}>
          <Text style={styles.title}>{heat.now}°C</Text>
          <Text style={[styles.pill, { backgroundColor: heat.level.color }]}>{heat.level.label}</Text>
        </View>
        <Text style={styles.detail}>{heat.level.tip}</Text>
        {heat.peak && (
          <Text style={styles.detail}>
            Peak today: {heat.peak.value}°C around {heat.peak.time} ({heat.peak.level.label})
          </Text>
        )}
      </Section>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { marginTop: 8, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 18 },
  heading: { fontSize: 15, color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  section: { flexDirection: 'row', gap: 14, paddingVertical: 14 },
  divider: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.18)' },
  emoji: { fontSize: 30, lineHeight: 38 },
  body: { flex: 1, gap: 4 },
  small: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  title: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  verdict: { fontSize: 15, fontWeight: '400' },
  detail: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 20 },
  meter: { flexDirection: 'row', gap: 4, marginVertical: 4 },
  segment: { flex: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.22)' },
  segmentOn: { backgroundColor: '#FFFFFF' },
  heatRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pill: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
})
