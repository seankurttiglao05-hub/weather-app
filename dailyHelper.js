// The "Daily helper": rain countdown, sampay meter, and PAGASA heat index.

const DRYING_START = 7 // 7 AM
const DRYING_END = 17 // 5 PM

function hourOf(isoTime) {
  return Number(isoTime.slice(11, 13))
}

function formatHourNumber(hour) {
  const h = hour % 24
  if (h === 0) return '12 AM'
  if (h < 12) return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

// ---------- 1. Rain countdown ("Uulan ba?") ----------

export function getRainCountdown(weather) {
  const hours = weather.forecastHours.slice(0, 7) // this hour + the next 6
  const rainingNow = ['drizzle', 'rain', 'storm'].includes(weather.condition.effect)

  if (rainingNow) {
    const dryIndex = hours.findIndex((hour, i) => i > 0 && hour.rainChance < 30)
    if (dryIndex === -1) {
      return { emoji: '🌧️', title: "It's raining now", detail: 'Rain may continue for the next few hours. Bring an umbrella.' }
    }
    return {
      emoji: '🌧️',
      title: "It's raining now",
      detail: `It may ease up around ${formatHourNumber(hourOf(hours[dryIndex].time))}.`,
    }
  }

  const rainIndex = hours.findIndex((hour, i) => i > 0 && hour.rainChance >= 50)
  if (rainIndex === -1) {
    return { emoji: '🌤️', title: 'No rain expected soon', detail: 'Low chance of rain in the next 6 hours.' }
  }

  const when = rainIndex === 1 ? 'in about an hour' : `in about ${rainIndex} hours`
  const rainHour = hours[rainIndex]
  return {
    emoji: '☔',
    title: `Rain likely ${when}`,
    detail: `${rainHour.rainChance}% chance around ${formatHourNumber(hourOf(rainHour.time))}. Bring an umbrella.`,
  }
}

// ---------- 2. Sampay meter (laundry drying score) ----------

function dryingScore(hour) {
  if (hour.rainChance >= 50) return 0

  let score = 10
  score -= hour.rainChance / 10 // rain risk: up to -5
  score -= Math.max(0, hour.humidity - 55) / 10 // damp air: up to about -4.5
  score -= hour.cloud / 50 // less sun: up to -2
  if (hour.wind >= 8) score += 1 // a breeze helps

  return Math.min(Math.max(score, 0), 10)
}

export function getSampayMeter(weather) {
  const today = weather.localTime.slice(0, 10)
  const nowHour = hourOf(weather.localTime)
  const isDryingHour = (hour) => hourOf(hour.time) >= DRYING_START && hourOf(hour.time) < DRYING_END

  let day = 'Today'
  let hours = weather.forecastHours.filter(
    (hour) => hour.time.slice(0, 10) === today && hourOf(hour.time) >= nowHour && isDryingHour(hour)
  )

  if (hours.length < 3) {
    const tomorrowHour = weather.forecastHours.find((hour) => hour.time.slice(0, 10) !== today)
    if (!tomorrowHour) return null
    const tomorrow = tomorrowHour.time.slice(0, 10)
    hours = weather.forecastHours.filter((hour) => hour.time.slice(0, 10) === tomorrow && isDryingHour(hour))
    day = 'Tomorrow'
  }

  if (hours.length === 0) return null

  let best = null
  for (let i = 0; i + 2 < hours.length; i++) {
    const average = (dryingScore(hours[i]) + dryingScore(hours[i + 1]) + dryingScore(hours[i + 2])) / 3
    if (best === null || average > best.average) {
      best = { average, startHour: hourOf(hours[i].time), endHour: hourOf(hours[i + 2].time) + 1 }
    }
  }
  if (best === null) {
    best = { average: dryingScore(hours[0]), startHour: hourOf(hours[0].time), endHour: hourOf(hours[0].time) + 1 }
  }

  const score = Math.round(best.average)
  let emoji = '🏠'
  let verdict = 'Better to dry indoors'
  if (score >= 8) {
    emoji = '👕'
    verdict = 'Great for drying laundry'
  } else if (score >= 5) {
    emoji = '🧺'
    verdict = 'Okay for drying, but watch the sky'
  }

  return {
    day,
    score,
    emoji,
    verdict,
    bestTime: score >= 5 ? `${formatHourNumber(best.startHour)} – ${formatHourNumber(best.endHour)}` : null,
  }
}

// ---------- 3. Heat index (PAGASA levels) ----------

// Heat index formula used by the US National Weather Service (works in °F).
export function calcHeatIndex(tempC, humidity) {
  const T = (tempC * 9) / 5 + 32
  const RH = humidity
  let HI = 0.5 * (T + 61 + (T - 68) * 1.2 + RH * 0.094)

  if ((HI + T) / 2 >= 80) {
    HI =
      -42.379 + 2.04901523 * T + 10.14333127 * RH - 0.22475541 * T * RH -
      0.00683783 * T * T - 0.05481717 * RH * RH + 0.00122874 * T * T * RH +
      0.00085282 * T * RH * RH - 0.00000199 * T * T * RH * RH

    if (RH < 13 && T >= 80 && T <= 112) {
      HI -= ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17)
    } else if (RH > 85 && T >= 80 && T <= 87) {
      HI += ((RH - 85) / 10) * ((87 - T) / 5)
    }
  }

  return Math.round(((HI - 32) * 5) / 9)
}

export function getHeatLevel(heatIndex) {
  if (heatIndex >= 52) return { label: 'Extreme danger', color: '#8E1B1B', tip: 'Heat stroke is likely. Stay indoors and keep cool.' }
  if (heatIndex >= 42) return { label: 'Danger', color: '#C2412F', tip: 'Heat cramps and exhaustion are likely. Avoid going out at midday.' }
  if (heatIndex >= 33) return { label: 'Extreme caution', color: '#E07B1F', tip: 'Heat cramps and exhaustion are possible. Drink water often.' }
  if (heatIndex >= 27) return { label: 'Caution', color: '#C99A06', tip: 'You may tire faster in the sun. Stay hydrated.' }
  return { label: 'Not a concern', color: '#2E9E6A', tip: 'Heat is not a risk right now.' }
}

export function getHeatIndex(weather) {
  const now = calcHeatIndex(weather.forecastHours[0].temperature, weather.forecastHours[0].humidity)
  const today = weather.localTime.slice(0, 10)

  let peak = { value: now, hour: hourOf(weather.localTime) }
  for (const hour of weather.forecastHours) {
    if (hour.time.slice(0, 10) !== today) break
    const value = calcHeatIndex(hour.temperature, hour.humidity)
    if (value > peak.value) peak = { value, hour: hourOf(hour.time) }
  }

  return {
    now,
    level: getHeatLevel(now),
    peak: peak.value > now ? { value: peak.value, time: formatHourNumber(peak.hour), level: getHeatLevel(peak.value) } : null,
  }
}
