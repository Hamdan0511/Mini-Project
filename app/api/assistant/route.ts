import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  let query: string = ''
  let coords: any
  let environmentSnapshot: any
  let valueData: any
  let actualCoords: any

  try {
    const body = await request.json()
    query = body.query
    coords = body.coords

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyCKiCXd1sBuy4SoK_PiMgx6uXzsi0sdLQo'
    const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY

    // Geocode place names to coordinates if no coords provided
    actualCoords = coords
    if (!actualCoords && query) {
      // Try to extract coordinates from query first
      const coordMatch = query.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/)
      if (coordMatch) {
        actualCoords = { lat: parseFloat(coordMatch[1]), lon: parseFloat(coordMatch[2]) }
      } else if (OPENWEATHER_API_KEY) {
        // Try geocoding the place name
        try {
          const geoRes = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${OPENWEATHER_API_KEY}`)
          if (geoRes.ok) {
            const geoData = await geoRes.json()
            if (geoData && geoData.length > 0) {
              actualCoords = { lat: geoData[0].lat, lon: geoData[0].lon }
            }
          }
        } catch (err) {
          console.warn('Geocoding failed:', err)
        }
      }
    }

    // Fetch environment data if coordinates are available
    environmentSnapshot = null
    valueData = null

    if (actualCoords && actualCoords.lat && actualCoords.lon) {
      try {
        // Get the base URL for internal API calls
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                       (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

        // Fetch environment data
        const envRes = await fetch(`${baseUrl}/api/environment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude: actualCoords.lat, longitude: actualCoords.lon })
        })
        if (envRes.ok) {
          environmentSnapshot = await envRes.json()
        }

        // Fetch value data
        const valRes = await fetch(`${baseUrl}/api/value`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude: actualCoords.lat, longitude: actualCoords.lon })
        })
        if (valRes.ok) {
          valueData = await valRes.json()
        }
      } catch (err) {
        console.warn('Failed to fetch environment/value data:', err)
        // Continue without the data - the AI can still respond
      }
    }

    if (!GOOGLE_API_KEY) {
      // Return a response even without API key, using available data
      let reply = "I'm EcoBot, your environmental assistant. "
      if (environmentSnapshot) {
        reply += `For the location at ${actualCoords?.lat?.toFixed(5)}, ${actualCoords?.lon?.toFixed(5)}, I can see environmental data is available. However, my AI features require an API key to be configured for detailed analysis.`
      } else {
        reply += "I can help with environmental questions, but my AI features require an API key to be configured. Please contact support or check your environment variables."
      }

      return NextResponse.json({
        reply,
        answer: reply,
        environmentSnapshot,
        sources: []
      })
    }

    // Build context from environment data
    let contextPrompt = ''
    if (environmentSnapshot) {
      contextPrompt = `\n\nENVIRONMENTAL DATA CONTEXT:
Location: ${actualCoords?.lat?.toFixed(5)}, ${actualCoords?.lon?.toFixed(5)}
Air Quality Index: ${environmentSnapshot.environment?.airQuality?.aqi ?? environmentSnapshot.airQuality?.aqi ?? 'N/A'}
Temperature: ${environmentSnapshot.environment?.weather?.temperature ?? environmentSnapshot.weather?.temperature ?? 'N/A'}°C
Humidity: ${environmentSnapshot.environment?.weather?.humidity ?? environmentSnapshot.weather?.humidity ?? 'N/A'}%
Vegetation Index (NDVI): ${environmentSnapshot.environment?.vegetation?.index ?? environmentSnapshot.vegetation?.index ?? 'N/A'}
`
      if (valueData) {
        contextPrompt += `Property Value: ${valueData.currentValue ? new Intl.NumberFormat(undefined, { style: 'currency', currency: valueData.currency ?? 'USD' }).format(valueData.currentValue) : 'N/A'}\n`
      }
      contextPrompt += '\nUse this data to provide specific, data-driven insights in your response.'
    }

    // Generate AI-powered response using Google Gemini
    const systemPrompt = `You are EcoBot, a professional AI environmental advisor integrated within the EcoEvaluator 2050 platform. Your personality is professional, intelligent, and supportive, with a tone that balances scientific accuracy and friendly guidance.

You help users interpret environmental data, understand their property's ecological footprint, and make smart, sustainable decisions.

CORE CAPABILITIES:
- Explain environmental metrics (AQI, NDVI, temperature, humidity, etc.)
- Interpret property valuation data and growth projections
- Provide actionable sustainability recommendations
- Assess ecological risk levels (Low/Moderate/Elevated)
- Guide users through platform features
- Answer questions about sustainable development and eco-friendly practices

COMMUNICATION STYLE:
- Use concise, friendly, and futuristic language
- Avoid jargon; simplify scientific concepts clearly
- Use emojis subtly (🌿, 🌤️, 💧, ⚡)
- Maintain professional but approachable tone
- Always stay within environmental/property domain
- Provide data-backed insights when possible

RESPONSE GUIDELINES:
- Be helpful and encouraging about sustainable choices
- Use context from available data when relevant
- Suggest specific, actionable steps
- Keep responses focused and relevant
- End with questions to continue conversation when appropriate

Remember: You are an environmental consultant, not a general AI assistant.`

    const userPrompt = `User question: "${query}"${contextPrompt}

Please provide a helpful, professional response as EcoBot that addresses their question. If environmental data is provided, use it to give specific, data-driven insights. Keep your response concise but informative, and maintain the EcoBot personality.`

    // Generate AI-powered response using Google Gemini
    let aiResponse = null

    if (GOOGLE_API_KEY) {
      try {
        const fullPrompt = `${systemPrompt}\n\n${userPrompt}`
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`

        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: fullPrompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 600
            }
          })
        })

        if (response.ok) {
          const geminiData = await response.json()
          aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || null
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.warn('Google Gemini API error:', response.status, errorData)
        }
      } catch (err) {
        console.warn('Google Gemini API request failed:', err)
      }
    }

    // If both failed, use fallback
    if (!aiResponse) {
      return generateIntelligentFallbackResponse(query, environmentSnapshot, actualCoords)
    }

    return NextResponse.json({
      reply: aiResponse,
      answer: aiResponse, // Support both formats
      environmentSnapshot: environmentSnapshot ? {
        ...environmentSnapshot,
        coordinates: actualCoords,
        fetchedAt: environmentSnapshot.sourceTimestamps?.fetchedAt ?? new Date().toISOString()
      } : null,
      sources: [],
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Assistant API error:', error)

    // Use intelligent fallback on any error
    return generateIntelligentFallbackResponse(query || '', environmentSnapshot, actualCoords)
  }
}

function generateIntelligentFallbackResponse(query: string, environmentSnapshot: any, coords?: any) {
  const lowerQuery = query.toLowerCase()
  let reply = ""

  // If we have environmental data, include it in the response
  if (environmentSnapshot && coords) {
    const aqi = environmentSnapshot.environment?.airQuality?.aqi ?? environmentSnapshot.airQuality?.aqi ?? 'N/A'
    const temp = environmentSnapshot.environment?.weather?.temperature ?? environmentSnapshot.weather?.temperature ?? 'N/A'
    const humidity = environmentSnapshot.environment?.weather?.humidity ?? environmentSnapshot.weather?.humidity ?? 'N/A'
    const ndvi = environmentSnapshot.environment?.vegetation?.index ?? environmentSnapshot.vegetation?.index ?? 'N/A'
    
    reply = `📍 Location: ${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)}\n\n`
    reply += `🌫 Air Quality Index: ${aqi}\n`
    reply += `🌤 Temperature: ${temp}°C\n`
    reply += `💧 Humidity: ${humidity}%\n`
    reply += `🌿 Vegetation Index (NDVI): ${ndvi}\n\n`
  }

  // Pattern-based responses
  if (lowerQuery.includes('air quality') || lowerQuery.includes('aqi')) {
    reply += "Air Quality Index (AQI) measures how clean or polluted the air is. Values under 50 are good, 51-100 moderate, and above 100 unhealthy. Focus on reducing emissions through sustainable practices. 🌿"
  } else if (lowerQuery.includes('vegetation') || lowerQuery.includes('ndvi')) {
    reply += "NDVI shows plant health from space. Values closer to 1.0 indicate dense, healthy vegetation. Improve it by planting native species, creating green roofs, or implementing urban forests. 🌱"
  } else if (lowerQuery.includes('property value') || lowerQuery.includes('valuation')) {
    reply += "Property value is linked to environmental quality. Sustainable improvements like solar panels and energy efficiency can increase value by 4-8% annually. 💰"
  } else if (lowerQuery.includes('solar') || lowerQuery.includes('renewable')) {
    reply += "Solar energy can reduce your carbon footprint by up to 90% and often pays for itself in 5-7 years. Consider rooftop solar panels or community solar programs. ⚡"
  } else if (lowerQuery.includes('sustainable') || lowerQuery.includes('green')) {
    reply += "Sustainable development focuses on meeting present needs without compromising future generations. Key practices include renewable energy, water conservation, and green building materials. 🌍"
  } else {
    reply += "I can help with environmental questions about air quality, vegetation, property values, and sustainable development. What specific topic would you like to explore? 🌱"
  }

  return NextResponse.json({
    reply,
    answer: reply,
    environmentSnapshot: environmentSnapshot ? {
      ...environmentSnapshot,
      coordinates: coords,
      fetchedAt: environmentSnapshot.sourceTimestamps?.fetchedAt ?? new Date().toISOString()
    } : null,
    sources: [],
    timestamp: new Date().toISOString()
  })
}

