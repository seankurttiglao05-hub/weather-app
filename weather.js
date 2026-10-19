const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast'
const AIR_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'
const SERVICE_ERROR = 'The weather service is not responding right now. Pull down to try again in a moment.'

export async function getWeather(cityName) {
  const geoRes = await fetch(
    `${GEO_URL}?name=${encodeURIComponent(cityName)}&count=1`
  )
  if (!geoRes.ok) throw new Error(SERVICE_ERROR)
  const geoData = await geoRes.json()

  if (!geoData.results || geoData.results.length === 0) {
    throw new Error(`We couldn't find "${cityName}". Check the spelling and try again.`)
  }

  const place = geoData.results[0]
  return getWeatherByCoords(place.latitude, place.longitude, place.name, place.country, place.country_code)
}

export async function getWeatherByCoords(latitude, longitude, city, country, countryCode = '') {
  const weatherUrl =
    `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day,uv_index` +
    `&hourly=temperature_2m,weather_code,is_day,relative_humidity_2m,precipitation_probability,cloud_cover,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max` +
    `&forecast_days=7&timezone=auto`
  const airUrl = `${AIR_URL}?latitude=${latitude}&longitude=${longitude}&current=us_aqi`

  const [weatherRes, airRes] = await Promise.all([
    fetch(weatherUrl),
    fetch(airUrl).catch(() => null),
  ])

  if (!weatherRes.ok) throw new Error(SERVICE_ERROR)
  const weatherData = await weatherRes.json()
  const current = weatherData.current
  const today = weatherData.daily
  const daily = getDailyForecast(today)

  let aqi = null
  if (airRes && airRes.ok) {
    const airData = await airRes.json()
    aqi = airData.current?.us_aqi ?? null
  }

  return {
    city,
    country,
    countryCode,
    latitude,
    longitude,
    isPhilippines: countryCode === '' || countryCode.toUpperCase() === 'PH',
    temperature: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    todayMin: daily[0].min,
    todayMax: daily[0].max,
    humidity: current.relative_humidity_2m,
    wind: Math.round(current.wind_speed_10m),
    condition: getCondition(current.weather_code, current.is_day === 1),
    hourly: getNext24Hours(weatherData.hourly, current.time),
    forecastHours: getForecastHours(weatherData.hourly, current.time),
    daily,
    aqi: aqi === null ? null : Math.round(aqi),
    uvIndex: Math.round(current.uv_index ?? today.uv_index_max[0] ?? 0),
    rainChance: today.precipitation_probability_max[0] ?? 0,
    sunrise: today.sunrise[0],
    sunset: today.sunset[0],
    localTime: current.time,
  }
}

function getForecastHours(hourly, currentTime) {
  const thisHour = currentTime.slice(0, 13)
  const start = hourly.time.findIndex((time) => time >= thisHour)

  return hourly.time.slice(start, start + 48).map((time, n) => {
    const i = start + n
    return {
      time,
      temperature: hourly.temperature_2m[i],
      humidity: hourly.relative_humidity_2m[i] ?? 0,
      rainChance: hourly.precipitation_probability[i] ?? 0,
      cloud: hourly.cloud_cover[i] ?? 0,
      wind: hourly.wind_speed_10m[i] ?? 0,
    }
  })
}

function getNext24Hours(hourly, currentTime) {
  const thisHour = currentTime.slice(0, 13)
  const start = hourly.time.findIndex((time) => time >= thisHour)
  const hours = []

  for (let i = start; i < start + 24 && i < hourly.time.length; i++) {
    hours.push({
      time: i === start ? 'Now' : formatHour(hourly.time[i]),
      temperature: Math.round(hourly.temperature_2m[i]),
      condition: getCondition(hourly.weather_code[i], hourly.is_day[i] === 1),
    })
  }

  return hours
}

function getDailyForecast(daily) {
  return daily.time.map((date, i) => ({
    day: i === 0 ? 'Today' : formatDay(date),
    max: Math.round(daily.temperature_2m_max[i]),
    min: Math.round(daily.temperature_2m_min[i]),
    condition: getCondition(daily.weather_code[i], true),
  }))
}

function formatHour(time) {
  const hour = Number(time.slice(11, 13))
  if (hour === 0) return '12 AM'
  if (hour < 12) return `${hour} AM`
  if (hour === 12) return '12 PM'
  return `${hour - 12} PM`
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatDay(date) {
  const [year, month, day] = date.split('-').map(Number)
  return DAYS[new Date(year, month - 1, day).getDay()]
}

export function getCondition(code, isDay) {
  if (code === 0) {
    return isDay
      ? { label: 'Clear sky', emoji: '☀️', icon: 'weather-sunny', effect: 'none', gradient: ['#2F80ED', '#8EC5FF'] }
      : { label: 'Clear night', emoji: '🌙', icon: 'weather-night', effect: 'none', gradient: ['#0B1530', '#2A3F6B'] }
  }
  if (code <= 2) {
    return isDay
      ? { label: 'Partly cloudy', emoji: '⛅', icon: 'weather-partly-cloudy', effect: 'few-clouds', gradient: ['#4F86D1', '#A9C8EE'] }
      : { label: 'Partly cloudy', emoji: '☁️', icon: 'weather-night-partly-cloudy', effect: 'few-clouds', gradient: ['#15203A', '#3A4E78'] }
  }
  if (code === 3) return { label: 'Overcast', emoji: '☁️', icon: 'weather-cloudy', effect: 'clouds', gradient: ['#64758C', '#A7B4C6'] }
  if (code === 45 || code === 48) return { label: 'Foggy', emoji: '🌫️', icon: 'weather-fog', effect: 'clouds', gradient: ['#76808D', '#B9C1CB'] }
  if (code >= 51 && code <= 57) return { label: 'Drizzle', emoji: '🌦️', icon: 'weather-rainy', effect: 'drizzle', gradient: ['#4A6280', '#8DA3BF'] }
  if (code >= 61 && code <= 67) return { label: 'Rain', emoji: '🌧️', icon: 'weather-rainy', effect: 'rain', gradient: ['#3A5170', '#7690B0'] }
  if (code >= 80 && code <= 82) return { label: 'Rain showers', emoji: '🌧️', icon: 'weather-pouring', effect: 'rain', gradient: ['#30445A', '#6D86A3'] }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return { label: 'Snow', emoji: '🌨️', icon: 'weather-snowy', effect: 'clouds', gradient: ['#7FA4CC', '#CFE0F2'] }
  }
  if (code >= 95) return { label: 'Thunderstorm', emoji: '⛈️', icon: 'weather-lightning-rainy', effect: 'storm', gradient: ['#20253D', '#55597A'] }
  return { label: 'Unknown', emoji: '🌡️', icon: 'help-circle-outline', effect: 'none', gradient: ['#55657C', '#9AA8BC'] }
}
