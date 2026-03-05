import { NextResponse } from 'next/server'

export async function POST(request: Request) {

  let message: string = ""

  try {
    const body = await request.json()
    message = body?.message || ""

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY

    const systemPrompt = `
You are EcoBot, an environmental advisor helping users understand sustainability,
air quality, vegetation health, and eco-friendly property practices.
Respond professionally but friendly.
Use clear explanations and helpful suggestions.
`

    const userPrompt = `User question: "${message}"`

    let aiResponse: string | null = null

    /* ---------------- OPENAI ---------------- */

    if (OPENAI_API_KEY) {
      try {

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            max_tokens: 500,
            temperature: 0.7
          })
        })

        if (res.ok) {
          const data = await res.json()
          aiResponse = data?.choices?.[0]?.message?.content || null
        }

      } catch (err) {
        console.warn("OpenAI request failed:", err)
      }
    }

    /* ---------------- GEMINI ---------------- */

    if (!aiResponse && GOOGLE_API_KEY) {

      try {

        const prompt = `${systemPrompt}\n\n${userPrompt}`

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }]
                }
              ]
            })
          }
        )

        if (res.ok) {
          const data = await res.json()
          aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || null
        }

      } catch (err) {
        console.warn("Gemini request failed:", err)
      }
    }

    /* ---------------- FALLBACK ---------------- */

    if (!aiResponse) {
      return fallback(message)
    }

    return NextResponse.json({
      reply: aiResponse,
      answer: aiResponse,
      timestamp: new Date().toISOString()
    })

  } catch (error) {

    console.error("Chat API error:", error)

    return fallback(message)

  }
}

/* ---------- FALLBACK RESPONSES ---------- */

function fallback(message: string) {

  const text = message.toLowerCase()

  if (text.includes("air quality") || text.includes("aqi")) {
    const msg =
      "AQI measures air pollution levels. Under 50 is good, 51-100 moderate, above 100 unhealthy. Reducing emissions and planting greenery improves air quality. 🌿"
    return NextResponse.json({ reply: msg, answer: msg })
  }

  if (text.includes("ndvi") || text.includes("vegetation")) {
    const msg =
      "NDVI measures plant health using satellite imagery. Higher values indicate dense vegetation. Planting native trees and green roofs can improve NDVI. 🌱"
    return NextResponse.json({ reply: msg, answer: msg })
  }

  if (text.includes("solar") || text.includes("renewable")) {
    const msg =
      "Solar power is a great sustainable option. It reduces carbon emissions and often pays for itself in 5-7 years while increasing property value. ⚡"
    return NextResponse.json({ reply: msg, answer: msg })
  }

  if (text.includes("hello") || text.includes("hi")) {
    const msg =
      "Hello! I'm EcoBot 🌱 I can help explain air quality, vegetation health, property sustainability, and eco-friendly development."
    return NextResponse.json({ reply: msg, answer: msg })
  }

  const msg =
    "I'm EcoBot 🌱 Ask me about air quality (AQI), vegetation health (NDVI), property sustainability, or green development."

  return NextResponse.json({
    reply: msg,
    answer: msg
  })
}