import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { latitude, longitude } = await request.json()

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY

    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'your_openweather_api_key_here') {
      // Fallback to enhanced mock data if no API key
      return generateEnhancedMockData(latitude, longitude)
    }

    // Fetch real weather data from OpenWeatherMap
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`

    // Use AQICN API for more accurate air quality data
    const AQICN_API_KEY = process.env.AQICN_API_KEY
    let aqi = 50 // Default AQI
    let quality = 'Good'

    if (AQICN_API_KEY) {
      try {
        const airQualityUrl = `https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=${AQICN_API_KEY}`
        const airQualityResponse = await fetch(airQualityUrl)

        if (airQualityResponse.ok) {
          const airQualityData = await airQualityResponse.json()
          if (airQualityData.data && airQualityData.data.aqi !== undefined) {
            aqi = airQualityData.data.aqi
            // Determine air quality category based on AQICN standards
            if (aqi > 100) quality = 'Unhealthy'
            else if (aqi > 50) quality = 'Moderate'
            else quality = 'Good'
          }
        }
      } catch (error) {
        console.error('AQICN API error:', error)
        // Fall back to OpenWeatherMap air quality if AQICN fails
        const fallbackAirQualityUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}`
        try {
          const fallbackResponse = await fetch(fallbackAirQualityUrl)
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            aqi = fallbackData.list[0].main.aqi * 25
            if (aqi > 100) quality = 'Unhealthy'
            else if (aqi > 50) quality = 'Moderate'
          }
        } catch (fallbackError) {
          console.error('Fallback air quality API error:', fallbackError)
        }
      }
    } else {
      // Fall back to OpenWeatherMap air quality if no AQICN key
      const fallbackAirQualityUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}`
      try {
        const fallbackResponse = await fetch(fallbackAirQualityUrl)
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          aqi = fallbackData.list[0].main.aqi * 25
          if (aqi > 100) quality = 'Unhealthy'
          else if (aqi > 50) quality = 'Moderate'
        }
      } catch (fallbackError) {
        console.error('Fallback air quality API error:', fallbackError)
      }
    }

    const weatherResponse = await fetch(weatherUrl)

    if (!weatherResponse.ok) {
      // Fallback to mock data if weather API fails
      return generateEnhancedMockData(latitude, longitude)
    }

    const weatherData = await weatherResponse.json()

    // Try to get real vegetation data from NASA Earthdata API if available
    const NASA_EARTHDATA_KEY = process.env.NASA_EARTHDATA_KEY
    let vegetationIndex = parseFloat((Math.random() * 0.5 + 0.3).toFixed(2)) // Default NDVI 0.3-0.8
    let vegetationType = 'Mixed'

    if (NASA_EARTHDATA_KEY) {
      try {
        // Use NASA Earthdata API for real NDVI data
        const ndviUrl = `https://modis.ornl.gov/rst/api/v1/MOD13Q1/subset?latitude=${latitude}&longitude=${longitude}&startDate=2023-01-01&endDate=2023-12-31&kmAboveBelow=1&kmLeftRight=1`
        const ndviResponse = await fetch(ndviUrl, {
          headers: {
            'Authorization': `Bearer ${NASA_EARTHDATA_KEY}`
          }
        })

        if (ndviResponse.ok) {
          const ndviData = await ndviResponse.json()
          // Extract NDVI value from NASA data
          if (ndviData.data && ndviData.data.length > 0) {
            vegetationIndex = ndviData.data[0].ndvi || vegetationIndex
          }
        }
      } catch (error) {
        console.error('NASA Earthdata API error:', error)
        // Fall back to calculated vegetation
      }
    }

    // Determine vegetation type based on temperature and location
    if (weatherData.main.temp > 25) vegetationType = 'Tropical'
    else if (weatherData.main.temp < 10) vegetationType = 'Forest'
    else vegetationType = 'Grassland'

    return NextResponse.json({
      coordinates: { lat: latitude, lng: longitude },
      airQuality: {
        aqi: Math.round(aqi),
        quality
      },
      weather: {
        temperature: Math.round(weatherData.main.temp),
        humidity: weatherData.main.humidity,
        windSpeed: Math.round(weatherData.wind.speed * 3.6) // Convert m/s to km/h
      },
      vegetation: {
        index: vegetationIndex,
        type: vegetationType
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Environment API error:', error)
    // Fallback to mock data on any error
    const requestClone = request.clone()
    const { latitude, longitude } = await requestClone.json()
    return generateEnhancedMockData(latitude, longitude)
  }
}

function generateEnhancedMockData(latitude: number, longitude: number) {
  // Enhanced mock data based on location
  const baseTemp = latitude > 0 ? 20 - latitude * 0.1 : 25 + Math.abs(latitude) * 0.1
  const temperature = Math.round(baseTemp + (Math.random() - 0.5) * 10)

  const airQualityIndex = Math.floor(Math.random() * 150) + 30
  const humidity = Math.floor(Math.random() * 40 + 40)
  const windSpeed = Math.round((Math.random() * 15 + 5) * 10) / 10

  let vegetationType = 'Mixed'
  if (Math.abs(latitude) > 50) vegetationType = 'Forest'
  else if (Math.abs(latitude) < 20) vegetationType = 'Tropical'
  else vegetationType = 'Grassland'

  const vegetationIndex = (Math.random() * 0.5 + 0.3).toFixed(2)

  return NextResponse.json({
    coordinates: { lat: latitude, lng: longitude },
    airQuality: {
      aqi: airQualityIndex,
      quality: airQualityIndex < 50 ? 'Good' : airQualityIndex < 100 ? 'Moderate' : 'Unhealthy'
    },
    weather: {
      temperature,
      humidity,
      windSpeed
    },
    vegetation: {
      index: parseFloat(vegetationIndex),
      type: vegetationType
    },
    timestamp: new Date().toISOString()
  })
}

