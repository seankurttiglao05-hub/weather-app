// Turns raw weather numbers into labels and tips for the screen.

export function getAirQuality(aqi) {
  if (aqi === null) return { label: 'Unavailable', tip: 'Air quality data is not available for this place.' }
  if (aqi <= 50) return { label: 'Good', tip: 'Air quality is good for outdoor activities.' }
  if (aqi <= 100) return { label: 'Moderate', tip: 'Acceptable. Very sensitive people should limit long outdoor activity.' }
  if (aqi <= 150) return { label: 'Unhealthy for sensitive groups', tip: 'People with asthma or heart conditions should limit time outdoors.' }
  if (aqi <= 200) return { label: 'Unhealthy', tip: 'Everyone should limit long or heavy outdoor activity.' }
  if (aqi <= 300) return { label: 'Very unhealthy', tip: 'Avoid outdoor activity if you can.' }
  return { label: 'Hazardous', tip: 'Stay indoors and keep windows closed.' }
}

export function getUvLevel(uv) {
  if (uv <= 2) return { label: 'Low', tip: 'Little sun protection needed.' }
  if (uv <= 5) return { label: 'Moderate', tip: 'Use sunscreen if you stay out around midday.' }
  if (uv <= 7) return { label: 'High', tip: 'Wear sunscreen and a hat, and seek shade at noon.' }
  if (uv <= 10) return { label: 'Very high', tip: 'Avoid the midday sun. Sunscreen is a must.' }
  return { label: 'Extreme', tip: 'Stay out of the sun between 10 AM and 4 PM.' }
}

export function getHumidityTip(humidity) {
  if (humidity >= 70) return 'High humidity can make it feel hotter than it is.'
  if (humidity >= 40) return 'Humidity is at a comfortable level.'
  return 'The air is dry. Drink water and stay hydrated.'
}

export function getRainTip(chance) {
  if (chance >= 60) return 'Rain is likely today.'
  if (chance >= 30) return 'There is some chance of rain today.'
  return 'Rain is unlikely today.'
}

function toMinutes(isoTime) {
  const hours = Number(isoTime.slice(11, 13))
  const minutes = Number(isoTime.slice(14, 16))
  return hours * 60 + minutes
}

export function formatClock(isoTime) {
  const hours = Number(isoTime.slice(11, 13))
  const minutes = isoTime.slice(14, 16)
  const period = hours < 12 ? 'AM' : 'PM'
  const hour12 = hours % 12 === 0 ? 12 : hours % 12
  return `${hour12}:${minutes} ${period}`
}

export function getSunProgress(sunrise, sunset, localTime) {
  const rise = toMinutes(sunrise)
  const set = toMinutes(sunset)
  const now = toMinutes(localTime)
  const progress = (now - rise) / (set - rise)
  return Math.min(Math.max(progress, 0), 1)
}

export function getLifeIndex(weather) {
  const { temperature, feelsLike, humidity, uvIndex, rainChance, aqi } = weather
  const tips = []

  tips.push({
    icon: 'sunglasses',
    text: uvIndex >= 6 ? 'Wear sunscreen and a hat' : uvIndex >= 3 ? 'Sunscreen around midday' : 'No sun protection needed',
  })

  let exercise = 'Good for outdoor exercise'
  if (rainChance >= 60 || feelsLike >= 38 || (aqi !== null && aqi > 150)) {
    exercise = 'Not ideal for outdoor exercise'
  } else if (feelsLike >= 33) {
    exercise = 'Exercise early or late, it is hot'
  }
  tips.push({ icon: 'run', text: exercise })

  tips.push({
    icon: 'tshirt-crew',
    text: temperature >= 27 ? 'T-shirt and light clothes' : temperature >= 20 ? 'Light long sleeves' : 'Bring a jacket',
  })

  tips.push({
    icon: 'umbrella',
    text: rainChance >= 60 ? 'Bring an umbrella' : rainChance >= 30 ? 'An umbrella might help' : 'No umbrella needed',
  })

  tips.push({
    icon: 'hanger',
    text: rainChance < 30 ? 'Good day to dry laundry' : 'Dry laundry indoors',
  })

  tips.push({
    icon: 'bug',
    text: temperature >= 25 && humidity >= 70 ? 'Mosquito repellent recommended' : 'Low mosquito activity',
  })

  return tips
}
