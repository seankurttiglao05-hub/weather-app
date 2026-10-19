import { View, Text, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import {
  getAirQuality, getUvLevel, getHumidityTip, getRainTip, formatClock, getSunProgress,
} from '../insights'

function DetailCard({ icon, title, value, label, tip }) {
  return (
    <View style={styles.card}>
      <View style={styles.headingRow}>
        <MaterialCommunityIcons name={icon} size={18} color="rgba(255,255,255,0.8)" />
        <Text style={styles.heading}>{title}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      {label && <Text style={styles.label}>{label}</Text>}
      <Text style={styles.tip}>{tip}</Text>
    </View>
  )
}

export default function DetailsGrid({ weather }) {
  const air = getAirQuality(weather.aqi)
  const uv = getUvLevel(weather.uvIndex)
  const progress = getSunProgress(weather.sunrise, weather.sunset, weather.localTime)

  return (
    <View style={styles.grid}>
      <DetailCard
        icon="weather-windy"
        title="Air quality"
        value={weather.aqi === null ? '–' : weather.aqi}
        label={air.label}
        tip={air.tip}
      />
      <DetailCard
        icon="white-balance-sunny"
        title="UV index"
        value={weather.uvIndex}
        label={uv.label}
        tip={uv.tip}
      />
      <DetailCard
        icon="water-percent"
        title="Humidity"
        value={`${weather.humidity}%`}
        tip={getHumidityTip(weather.humidity)}
      />
      <DetailCard
        icon="weather-rainy"
        title="Chance of rain"
        value={`${weather.rainChance}%`}
        tip={getRainTip(weather.rainChance)}
      />

      <View style={[styles.card, styles.wide]}>
        <View style={styles.headingRow}>
          <MaterialCommunityIcons name="weather-sunset" size={18} color="rgba(255,255,255,0.8)" />
          <Text style={styles.heading}>Sun</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.trackFill, { width: `${progress * 100}%` }]} />
          <View style={[styles.sun, { left: `${progress * 100}%` }]}>
            <MaterialCommunityIcons name="white-balance-sunny" size={22} color="#FFD54F" />
          </View>
        </View>
        <View style={styles.sunTimes}>
          <View>
            <Text style={styles.sunLabel}>Sunrise</Text>
            <Text style={styles.sunTime}>{formatClock(weather.sunrise)}</Text>
          </View>
          <View style={styles.alignRight}>
            <Text style={styles.sunLabel}>Sunset</Text>
            <Text style={styles.sunTime}>{formatClock(weather.sunset)}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 },
  card: { flexBasis: '47%', flexGrow: 1, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 24, padding: 18 },
  wide: { flexBasis: '100%' },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  heading: { fontSize: 15, color: 'rgba(255,255,255,0.8)' },
  value: { fontSize: 36, fontWeight: '300', color: '#FFFFFF' },
  label: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', marginTop: 2 },
  tip: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 8, lineHeight: 18 },
  track: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.25)', marginTop: 18, marginBottom: 18, marginHorizontal: 11 },
  trackFill: { height: 4, borderRadius: 2, backgroundColor: '#FFD54F' },
  sun: { position: 'absolute', top: -9, marginLeft: -11 },
  sunTimes: { flexDirection: 'row', justifyContent: 'space-between' },
  alignRight: { alignItems: 'flex-end' },
  sunLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  sunTime: { fontSize: 20, color: '#FFFFFF', marginTop: 2 },
})
