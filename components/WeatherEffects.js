import { useEffect, useMemo, useRef } from 'react'
import { Animated, Easing, Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native'

// The native driver runs animations on the phone's UI thread (smoother).
// Web browsers don't support it, so we turn it off there.
const useNativeDriver = Platform.OS !== 'web'

// How many clouds and raindrops each kind of weather gets.
const SETTINGS = {
  none: { clouds: 0, drops: 0 },
  'few-clouds': { clouds: 3, drops: 0 },
  clouds: { clouds: 4, drops: 0 },
  drizzle: { clouds: 3, drops: 25 },
  rain: { clouds: 4, drops: 60 },
  storm: { clouds: 5, drops: 90 },
}

// Custom hook: a value that moves from 0 to 1 again and again, forever.
// `startAt` lets each cloud or drop begin partway through, so they don't all move together.
function useLoopingValue(duration, startAt) {
  const value = useRef(new Animated.Value(startAt)).current

  useEffect(() => {
    let loop = null

    const firstRun = Animated.timing(value, {
      toValue: 1,
      duration: duration * (1 - startAt),
      easing: Easing.linear,
      useNativeDriver,
    })

    firstRun.start(({ finished }) => {
      if (!finished) return
      value.setValue(0)
      loop = Animated.loop(
        Animated.timing(value, { toValue: 1, duration, easing: Easing.linear, useNativeDriver })
      )
      loop.start()
    })

    return () => {
      firstRun.stop()
      if (loop) loop.stop()
    }
  }, [value, duration, startAt])

  return value
}

function Cloud({ top, size, duration, startAt, screenWidth }) {
  const progress = useLoopingValue(duration, startAt)
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-size, screenWidth],
  })

  return (
    <Animated.View style={[styles.cloud, { top, transform: [{ translateX }] }]}>
      <Text style={{ fontSize: size, lineHeight: size * 1.25, opacity: 0.85 }}>☁️</Text>
    </Animated.View>
  )
}

function Raindrop({ left, length, duration, startAt, screenHeight }) {
  const progress = useLoopingValue(duration, startAt)
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-length, screenHeight],
  })

  return (
    <Animated.View
      style={[styles.drop, { left, height: length, transform: [{ translateY }] }]}
    />
  )
}

export default function WeatherEffects({ effect }) {
  const { width, height } = useWindowDimensions()
  const settings = SETTINGS[effect] || SETTINGS.none

  const clouds = useMemo(
    () =>
      Array.from({ length: settings.clouds }, () => ({
        top: height * 0.04 + Math.random() * height * 0.36,
        size: 70 + Math.random() * 60,
        duration: 40000 + Math.random() * 30000,
        startAt: Math.random(),
      })),
    [settings.clouds, height]
  )

  const drops = useMemo(
    () =>
      Array.from({ length: settings.drops }, () => ({
        left: Math.random() * width,
        length: 12 + Math.random() * 18,
        duration: 600 + Math.random() * 500,
        startAt: Math.random(),
      })),
    [settings.drops, width]
  )

  return (
    <View style={styles.layer}>
      {clouds.map((cloud, index) => (
        <Cloud key={`cloud-${index}`} {...cloud} screenWidth={width} />
      ))}
      {drops.map((drop, index) => (
        <Raindrop key={`drop-${index}`} {...drop} screenHeight={height} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' },
  cloud: { position: 'absolute', left: 0 },
  drop: { position: 'absolute', top: 0, width: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.6)' },
})
