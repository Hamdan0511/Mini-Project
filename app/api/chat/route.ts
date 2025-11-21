import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyBd-zeTXYABU0eh2Hw9zLI-bUumsDfYF54'

    if (!OPENAI_API_KEY && !GOOGLE_API_KEY) {
      return NextResponse.json(
        { 
          reply: "I'm EcoBot, your environmental assistant. I can help with questions about air quality, vegetation, property values, and sustainable development. However, my AI features require an API key to be configured. Please contact support or check your environment variables.",
          answer: "I'm EcoBot, your environmental assistant. I can help with questions about air quality, vegetation, property values, and sustainable development. However, my AI features require an API key to be configured. Please contact support or check your environment variables."
        },
        { status: 200 }
      )
    }

    // Generate AI-powered conversational response using OpenAI
    const systemPrompt = `You are EcoBot, a professional AI environmental advisor integrated within the EcoEvaluator 2050 platform. Your personality is professional, intelligent, and supportive, with a tone that balances scientific accuracy and friendly guidance.

You help users interpret environmental data, understand their property's ecological footprint, and make smart, sustainable decisions.

CORE CAPABILITIES:
- Explain environmental metrics (AQI, NDVI, temperature, humidity, etc.)
- Interpret property valuation data and growth projections
- Provide actionable sustainability recommendations
- Assess ecological risk levels (Low/Moderate/Elevated)
- Guide users through platform features
- Answer questions about sustainable development and eco-friendly practices
- Have general conversations while staying focused on environmental topics

COMMUNICATION STYLE:
- Use concise, friendly, and futuristic language
- Avoid jargon; simplify scientific concepts clearly
- Use emojis subtly (🌿, 🌤️, 💧, ⚡)
- Maintain professional but approachable tone
- Stay within environmental/property domain when possible
- Provide data-backed insights when possible

RESPONSE GUIDELINES:
- Be helpful and encouraging about sustainable choices
- Use context from available data when relevant
- Suggest specific, actionable steps
- Keep responses focused and relevant
- End with questions to continue conversation when appropriate

Remember: You are an environmental consultant, but you can also have friendly conversations.`

    const userPrompt = `User question: "${message}"

Please provide a helpful, professional response as EcoBot. Keep your response concise but informative, and maintain the EcoBot personality.`

    // Try OpenAI first, then fallback to Google Gemini
    let aiResponse = null
    let usedProvider = 'openai'

    if (OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: 500,
            temperature: 0.7
          })
        })

        if (response.ok) {
          const aiData = await response.json()
          aiResponse = aiData.choices[0]?.message?.content || null
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.warn('OpenAI API error:', response.status, errorData)
          // Continue to try Google Gemini
        }
      } catch (err) {
        console.warn('OpenAI API request failed, trying Google Gemini:', err)
        // Continue to try Google Gemini
      }
    }

    // If OpenAI didn't work, try Google Gemini
    if (!aiResponse && GOOGLE_API_KEY) {
      try {
        const fullPrompt = `${systemPrompt}\n\n${userPrompt}`
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_API_KEY}`
        
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
              maxOutputTokens: 500
            }
          })
        })

        if (response.ok) {
          const geminiData = await response.json()
          aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || null
          usedProvider = 'google'
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
      return generateIntelligentFallbackResponse(message)
    }

    return NextResponse.json({
      reply: aiResponse,
      answer: aiResponse, // Support both formats
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    
    // Use intelligent fallback on any error
    return generateIntelligentFallbackResponse(message)
  }
}

function generateIntelligentFallbackResponse(message: string) {
  const lowerMessage = message.toLowerCase()

  // Pattern-based responses for common environmental questions
  if (lowerMessage.includes('air quality') || lowerMessage.includes('aqi')) {
    const msg = "Air Quality Index (AQI) measures how clean or polluted the air is. Values under 50 are considered good, 51-100 moderate, and above 100 unhealthy. For your property, focus on reducing emissions through sustainable practices like electric vehicles and renewable energy. 🌿"
    return NextResponse.json({
      reply: msg,
      answer: msg,
      timestamp: new Date().toISOString()
    })
  }

  if (lowerMessage.includes('vegetation') || lowerMessage.includes('ndvi')) {
    const msg = "NDVI (Normalized Difference Vegetation Index) shows plant health from space. Values closer to 1.0 indicate dense, healthy vegetation. To improve your property's NDVI, consider planting native species, creating green roofs, or implementing urban forests. 🌱"
    return NextResponse.json({
      reply: msg,
      answer: msg,
      timestamp: new Date().toISOString()
    })
  }

  if (lowerMessage.includes('property value') || lowerMessage.includes('valuation')) {
    const msg = "Property value is closely linked to environmental quality. Sustainable improvements like solar panels, green infrastructure, and energy efficiency can increase value by 4-8% annually. Environmental health attracts eco-conscious buyers and may qualify for green financing incentives. 💰"
    return NextResponse.json({
      reply: msg,
      answer: msg,
      timestamp: new Date().toISOString()
    })
  }

  if (lowerMessage.includes('solar') || lowerMessage.includes('renewable')) {
    const msg = "Solar energy is an excellent sustainable choice! It can reduce your carbon footprint by up to 90% compared to fossil fuels, often pays for itself in 5-7 years, and can increase property value. Consider rooftop solar panels or community solar programs. ⚡"
    return NextResponse.json({
      reply: msg,
      answer: msg,
      timestamp: new Date().toISOString()
    })
  }

  if (lowerMessage.includes('sustainable') || lowerMessage.includes('green')) {
    const msg = "Sustainable development focuses on meeting present needs without compromising future generations. Key practices include renewable energy, water conservation, green building materials, and biodiversity preservation. Start small with energy audits and recycling programs. 🌍"
    return NextResponse.json({
      reply: msg,
      answer: msg,
      timestamp: new Date().toISOString()
    })
  }

  if (lowerMessage.includes('climate') || lowerMessage.includes('weather')) {
    const msg = "Climate patterns affect property resilience. Monitor temperature, humidity, and precipitation trends. Consider climate-adaptive designs like elevated foundations, green roofs for insulation, and native landscaping that withstands local weather extremes. 🌤️"
    return NextResponse.json({
      reply: msg,
      answer: msg,
      timestamp: new Date().toISOString()
    })
  }

  if (lowerMessage.includes('carbon') || lowerMessage.includes('footprint')) {
    const msg = "Your carbon footprint measures greenhouse gas emissions from your activities. Property-related emissions come from energy use, transportation, and construction. Reduce it through energy efficiency, electric vehicles, and sustainable materials. Every ton of CO2 avoided helps combat climate change. 💧"
    return NextResponse.json({
      reply: msg,
      answer: msg,
      timestamp: new Date().toISOString()
    })
  }

  if (lowerMessage.includes('biodiversity') || lowerMessage.includes('wildlife')) {
    const msg = "Biodiversity is crucial for ecosystem health. Plant native species, create wildlife corridors, reduce pesticide use, and preserve natural habitats. Healthy biodiversity improves soil quality, pollination, and natural pest control while increasing property appeal. 🐝"
    return NextResponse.json({
      reply: msg,
      answer: msg,
      timestamp: new Date().toISOString()
    })
  }

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    const msg = "Hello! I'm EcoBot, your environmental assistant. I can help you understand air quality, vegetation health, property values, and sustainable development practices. What would you like to know? 🌱"
    return NextResponse.json({
      reply: msg,
      answer: msg,
      timestamp: new Date().toISOString()
    })
  }

  // Default helpful response
  const defaultMsg = "I'm here to help with your environmental and property questions! I can explain metrics like air quality (AQI), vegetation health (NDVI), property valuation, and sustainable development practices. Try asking about specific topics like 'What is AQI?' or 'How can I improve my property's environmental impact?' 🌱"
  return NextResponse.json({
    reply: defaultMsg,
    answer: defaultMsg,
    timestamp: new Date().toISOString()
  })
}

