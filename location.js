import * as Location from 'expo-location'

export async function getMyLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync()

  if (status !== 'granted') {
    throw new Error('Location access was not allowed. Search for a city instead, or allow location in your settings.')
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  })
  const { latitude, longitude } = position.coords

  let city = 'Your location'
  let country = ''
  let countryCode = ''

  try {
    const [address] = await Location.reverseGeocodeAsync({ latitude, longitude })
    if (address) {
      city = address.city || address.subregion || address.region || city
      country = address.country || ''
      countryCode = address.isoCountryCode || ''
    }
  } catch {
    // Some platforms (like the web) can't turn coordinates into a city name.
    // We keep "Your location" in that case.
  }

  return { latitude, longitude, city, country, countryCode }
}
