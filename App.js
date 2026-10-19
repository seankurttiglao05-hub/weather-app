import { useState, useEffect } from 'react'
import {
  StyleSheet, Text, View, TextInput, Pressable, ActivityIndicator, ScrollView, RefreshControl, Linking,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { getWeather, getWeatherByCoords } from './weather'
import { getMyLocation } from './location'
import HourlyForecast from './components/HourlyForecast'
import DailyForecast from './components/DailyForecast'
import DetailsGrid from './components/DetailsGrid'
import LifeIndex from './components/LifeIndex'
import WeatherEffects from './components/WeatherEffects'
import DailyHelper from './components/DailyHelper'

const DEFAULT_GRADIENT = ['#2F80ED', '#8EC5FF']

function friendlyError(err) {
  const message = err?.message || ''
  if (err instanceof TypeError || /network|failed to fetch|internet/i.test(message)) {
    return 'No internet connection. Check your Wi-Fi or mobile data, then pull down to try again.'
  }
  return message || 'Something went wrong. Pull down to try again.'
}

async function loadStartupWeather() {
  try {
    const spot = await getMyLocation()
    return await getWeatherByCoords(spot.latitude, spot.longitude, spot.city, spot.country, spot.countryCode)
  } catch (err) {
    if (err instanceof TypeError) throw err
    return getWeather('Manila')
  }
}

export default function App() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  async function loadWeather(getResult) {
    setLoading(true)
    setError('')

    try {
      const result = await getResult()
      setWeather(result)
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  function handleSearch() {
    if (city.trim() === '') return
    loadWeather(() => getWeather(city.trim()))
    setCity('')
  }

  function handleMyLocation() {
    loadWeather(async () => {
      const spot = await getMyLocation()
      return getWeatherByCoords(spot.latitude, spot.longitude, spot.city, spot.country, spot.countryCode)
    })
  }

  async function handleRefresh() {
    setRefreshing(true)
    setError('')

    try {
      const result = weather
        ? await getWeatherByCoords(weather.latitude, weather.longitude, weather.city, weather.country, weather.countryCode)
        : await loadStartupWeather()
      setWeather(result)
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadWeather(loadStartupWeather)
  }, [])

  const gradient = weather ? weather.condition.gradient : DEFAULT_GRADIENT

  return (
    <LinearGradient colors={gradient} style={styles.screen}>
      <WeatherEffects effect={weather ? weather.condition.effect : 'none'} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FFFFFF"
            colors={['#2F80ED']}
          />
        }
      >
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <MaterialCommunityIcons name="magnify" size={20} color="rgba(255,255,255,0.8)" />
            <TextInput
              style={styles.input}
              placeholder="Search a city"
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={city}
              onChangeText={setCity}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
          <Pressable style={styles.iconButton} onPress={handleMyLocation}>
            <MaterialCommunityIcons name="crosshairs-gps" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        {error !== '' && (
          <View style={styles.error}>
            <MaterialCommunityIcons name="wifi-off" size={20} color="#FFFFFF" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {loading && !weather && <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />}

        {!loading && !weather && error !== '' && (
          <Pressable style={styles.retry} onPress={handleRefresh}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        )}

        {weather && (
          <>
            <View style={styles.placeRow}>
              <Text style={styles.city}>{weather.city}</Text>
              {loading && <ActivityIndicator color="#FFFFFF" />}
            </View>
            {weather.country !== '' && <Text style={styles.country}>{weather.country}</Text>}

            <View style={styles.hero}>
              <Text style={styles.emoji}>{weather.condition.emoji}</Text>
              <Text style={styles.temp}>{weather.temperature}°</Text>
              <Text style={styles.condition}>
                {weather.condition.label}  {weather.todayMin}° / {weather.todayMax}°
              </Text>
              <Text style={styles.extra}>
                Feels like {weather.feelsLike}°  ·  Humidity {weather.humidity}%  ·  Wind {weather.wind} km/h
              </Text>
            </View>

            <DailyHelper weather={weather} />
            <HourlyForecast hours={weather.hourly} />
            <DailyForecast days={weather.daily} />
            <DetailsGrid weather={weather} />
            <LifeIndex weather={weather} />

            <Text style={styles.credit} onPress={() => Linking.openURL('https://open-meteo.com')}>
              Weather data by Open-Meteo.com
            </Text>
          </>
        )}
      </ScrollView>
      <StatusBar style="light" />
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flexGrow: 1, padding: 20, paddingTop: 56, paddingBottom: 48, width: '100%', maxWidth: 560, alignSelf: 'center' },
  searchRow: { flexDirection: 'row', gap: 10 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, paddingHorizontal: 16 },
  input: { flex: 1, color: '#FFFFFF', fontSize: 16, paddingVertical: 12 },
  iconButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  error: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, backgroundColor: 'rgba(194,65,47,0.85)', padding: 12, borderRadius: 14 },
  errorText: { flex: 1, color: '#FFFFFF', fontSize: 15, lineHeight: 21 },
  loader: { marginTop: 80 },
  retry: { alignSelf: 'center', marginTop: 24, backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999 },
  retryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  placeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 28 },
  city: { fontSize: 30, fontWeight: '600', color: '#FFFFFF' },
  country: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  hero: { alignItems: 'center', marginTop: 32, marginBottom: 24 },
  emoji: { fontSize: 80, lineHeight: 100 },
  temp: { fontSize: 104, fontWeight: '200', color: '#FFFFFF', lineHeight: 116 },
  condition: { fontSize: 20, fontWeight: '500', color: '#FFFFFF' },
  extra: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 8, textAlign: 'center' },
  credit: { marginTop: 24, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.75)', textDecorationLine: 'underline' },
})
