      'use client' 

import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as exifr from 'exifr'


type Sender = 'user' | 'ecobot'
type Payload = {
  coordinates?: { lat: number; lon: number }
  environment?: any
  value?: any
  fetchedAt?: string
  sources?: Array<{ title?: string; link?: string; snippet?: string }>
}

type Message = {
  id: string
  text: string
  sender: Sender
  timestamp: string
  payload?: Payload
  error?: string
}

const STORAGE_KEY = 'ecoevaluator_chat_messages_v1'

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as Message[]) : []
    } catch {  
      return []
    }
  })
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [voiceActive, setVoiceActive] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)
  const recognitionRef = useRef<any>(null)

  // scroll to bottom when messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)) } catch {}
  }, [messages])

  // keyboard shortcut: Ctrl/Cmd+K to focus input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // helper to push messages
  const pushMessage = (m: Omit<Message, 'id' | 'timestamp'>) => {
    const msg: Message = { id: Date.now().toString() + Math.random().toString(36).slice(2), timestamp: new Date().toISOString(), ...m }
    setMessages(prev => [...prev, msg])
    return msg
  }

  // helper to update a message by id
  const updateMessage = (id: string, patch: Partial<Message>) => {
    setMessages(prev => prev.map(m => (m.id === id ? { ...m, ...patch } : m)))
  }

  // parse coords like "13.0125,77.5938"
  const parseCoords = (text: string) => {
    const cleaned = text.replace(/[()]/g, '').trim()
    const match = cleaned.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/)
    if (!match) return null
    return { lat: parseFloat(match[1]), lon: parseFloat(match[2]) }
  }

  // callAssistant - improved: fall back to chat for general conversational replies
  const callAssistant = async (query: string, coords?: { lat: number; lon: number } | null) => {
    setIsTyping(true)

    pushMessage({ text: query, sender: 'user' })

    // show interim eco-bot message
    const interim = pushMessage({ text: 'EcoBot is analyzing…', sender: 'ecobot' })

    try {
      // Try /api/assistant first (preferred)
      const body: any = { query }
      if (coords) body.coords = coords

      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        const json = await res.json()
        const replyText = json.reply ?? json.answer ?? 'Sorry, no reply returned.'

        const payload: Payload = {}
        if (json.environmentSnapshot) {
          payload.environment = json.environmentSnapshot
          payload.fetchedAt = json.environmentSnapshot.fetchedAt ?? json.environmentSnapshot.sourceTimestamps?.fetchedAt
          if (json.environmentSnapshot.coordinates) payload.coordinates = json.environmentSnapshot.coordinates
        }
        if (json.sources) payload.sources = json.sources

        updateMessage(interim.id, { text: replyText, payload })
        setIsTyping(false)
        return
      }

      // If assistant endpoint didn't return ok -> fallback
      console.warn('/api/assistant returned non-ok status, falling back to chat or env routes')
    } catch (err) {
      console.warn('callAssistant error', err)
      // continue to fallback logic
    }

    // FALLBACK LOGIC:
    // If coords exist -> fetch environment & value (fallbackFetchEnvValue)
    // Otherwise -> call generic chat endpoint so the bot replies conversationally
    if (coords) {
      await fallbackFetchEnvValue(coords, interim)
    } else {
      // call /api/chat to get a ChatGPT-like conversational reply
      try {
        const chatRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: query })
        })

        if (chatRes.ok) {
          const chatJson = await chatRes.json()
          const chatReply = chatJson.reply ?? chatJson.answer ?? 'Sorry, I could not generate a reply.'
          updateMessage(interim.id, { text: chatReply })
        } else {
          // Fallback to /api/ecobot if /api/chat fails
          try {
            const ecobotRes = await fetch('/api/ecobot', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: query })
            })
            
            if (ecobotRes.ok) {
              const ecobotJson = await ecobotRes.json()
              const ecobotReply = ecobotJson.response ?? ecobotJson.reply ?? ecobotJson.answer ?? 'Sorry, I could not generate a reply.'
              updateMessage(interim.id, { text: ecobotReply })
            } else {
              // if both fail, ask gently for coords only if query seems environmental
              const isEnv = /\b(aqi|air|pollution|temperature|temp|ndvi|vegetation|pm2|pm10|humidity|wind)\b/i.test(query)
              if (isEnv) {
                updateMessage(interim.id, { text: "I can help with environmental data — please share a place or coordinates (e.g., `13.0125,77.5938`) so I can fetch live info." })
              } else {
                updateMessage(interim.id, { text: "Hi — I can help with that. Ask me anything or say 'analyze RT Nagar' if you want live environmental data." })
              }
            }
          } catch (ecobotErr: any) {
            console.error('ecobot fallback error', ecobotErr)
            // if chat also fails, ask gently for coords only if query seems environmental
            const isEnv = /\b(aqi|air|pollution|temperature|temp|ndvi|vegetation|pm2|pm10|humidity|wind)\b/i.test(query)
            if (isEnv) {
              updateMessage(interim.id, { text: "I can help with environmental data — please share a place or coordinates (e.g., `13.0125,77.5938`) so I can fetch live info." })
            } else {
              updateMessage(interim.id, { text: "Hi — I can help with that. Ask me anything or say 'analyze RT Nagar' if you want live environmental data." })
            }
          }
        }
      } catch (err: any) {
        console.error('chat fallback error', err)
        // Try /api/ecobot as last resort
        try {
          const ecobotRes = await fetch('/api/ecobot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: query })
          })
          
          if (ecobotRes.ok) {
            const ecobotJson = await ecobotRes.json()
            const ecobotReply = ecobotJson.response ?? ecobotJson.reply ?? ecobotJson.answer ?? 'Sorry, I could not generate a reply.'
            updateMessage(interim.id, { text: ecobotReply })
          } else {
            updateMessage(interim.id, { text: "Sorry — I'm having trouble contacting the assistant. Please check your internet connection and try again." })
          }
        } catch (ecobotErr: any) {
          console.error('ecobot fallback error', ecobotErr)
          updateMessage(interim.id, { text: "Sorry — I'm having trouble contacting the assistant. Please check your internet connection and try again." })
        }
      }
    }

    setIsTyping(false)
  }

  // fallbackFetchEnvValue - only used when coords provided (otherwise chat flow handles conversational replies)
  const fallbackFetchEnvValue = async (coords: { lat: number; lon: number }, interimMessage?: Message) => {
    try {
      const envRes = await fetch('/api/environment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: coords.lat, longitude: coords.lon })
      })
      const envJson = envRes.ok ? await envRes.json() : null

      const valRes = await fetch('/api/value', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: coords.lat, longitude: coords.lon })
      })
      const valJson = valRes.ok ? await valRes.json() : null

      const payload: Payload = { coordinates: coords, environment: envJson, value: valJson, fetchedAt: envJson?.sourceTimestamps?.fetchedAt ?? new Date().toISOString() }
      const summary = envJson
        ? `📍 ${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)}\n🌤 Temp: ${envJson.environment?.weather?.temperature ?? envJson.weather?.temperature ?? 'N/A'}°C • Humidity: ${envJson.environment?.weather?.humidity ?? 'N/A'}%\n🌫 AQI: ${envJson.environment?.airQuality?.aqi ?? 'N/A'}\n💰 Value: ${valJson?.currentValue ? new Intl.NumberFormat(undefined, { style: 'currency', currency: valJson.currency ?? 'USD' }).format(valJson.currentValue) : 'N/A'}\n🕒 Fetched at: ${payload.fetchedAt}`
        : 'No environment data returned.'

      updateMessage(interimMessage!.id, { text: summary, payload })
    } catch (err: any) {
      console.error('fallback error', err)
      updateMessage(interimMessage!.id, { text: `⚠️ Unable to fetch live data: ${err?.message ?? 'unknown'}`, error: err?.message })
    }
  }

  // handle send action (enter or button)
  const handleSend = async () => {
    if (!input.trim()) return
    const text = input.trim()
    setInput('')

    // If user pasted coordinates, extract and send coords to assistant
    const coords = parseCoords(text)
    if (coords) {
      await callAssistant(text, coords)
      return
    }

    // If user typed a short place like "RT Nagar", pass it; assistant may geocode
    await callAssistant(text, null)
  }

  // File handling: extract EXIF GPS and automatically run assistant with coords
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    setIsProcessingFile(true)
    const interim = pushMessage({ text: `Received file: ${file.name}. Extracting GPS...`, sender: 'ecobot' })

    try {
      const exif = await exifr.parse(file, { gps: true })
      const lat = exif?.latitude ?? exif?.GPSLatitude
      const lon = exif?.longitude ?? exif?.GPSLongitude

      if (lat && lon) {
        updateMessage(interim.id, { text: `✅ GPS found: ${lat.toFixed(5)}, ${lon.toFixed(5)} — fetching live insights...` })
        await callAssistant(`Image upload: ${file.name}`, { lat: Number(lat), lon: Number(lon) })
      } else {
        updateMessage(interim.id, { text: "⚠️ This image doesn't contain GPS coordinates. You can paste coordinates or click the globe to pick a location." })
      }
    } catch (err: any) {
      console.error('exif error', err)
      updateMessage(interim.id, { text: `⚠️ Could not parse image metadata: ${err?.message ?? 'error'}` })
    } finally {
      setIsProcessingFile(false)
    }
  }

  // drag & drop handlers
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragActive(true) }
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragActive(false) }
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files) }

  // voice input (optional)
  const toggleVoice = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (!SpeechRecognition) {
      pushMessage({ text: 'Voice input not supported in this browser.', sender: 'ecobot' })
      return
    }
    if (voiceActive) {
      recognitionRef.current?.stop()
      setVoiceActive(false)
      return
    }
    const rec = new SpeechRecognition()
    rec.lang = 'en-IN'
    rec.interimResults = false
    rec.maxAlternatives = 1
    recognitionRef.current = rec
    rec.onresult = (ev: any) => {
      const spoken = ev.results[0][0].transcript
      setInput(spoken)
      // auto-send after spoken result
      setTimeout(() => handleSend(), 200)
    }
    rec.onerror = (ev: any) => {
      console.error('speech error', ev)
      pushMessage({ text: 'Voice recognition error.', sender: 'ecobot' })
      setVoiceActive(false)
    }
    rec.onend = () => setVoiceActive(false)
    rec.start()
    setVoiceActive(true)
  }

  // quick action examples
  const quickAsk = (q: string) => {
    setInput(q)
    inputRef.current?.focus()
  }

  // UI Actions: retry message by id (re-run assistant with same message text)
  const retryMessage = async (id: string) => {
    const msg = messages.find(m => m.id === id)
    if (!msg) return
    // only retry user messages
    if (msg.sender === 'user') {
      await callAssistant(msg.text, parseCoords(msg.text) ?? undefined)
    }
  }

  // copy message text
  const copyText = (text: string) => {
    navigator.clipboard?.writeText(text)
      .then(() => pushMessage({ text: 'Copied to clipboard ✅', sender: 'ecobot' }))
      .catch(() => pushMessage({ text: 'Copy failed.', sender: 'ecobot' }))
  }

  // render helpers
  const formatTime = (iso?: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setIsOpen(v => !v)}
        className="fixed bottom-6 right-6 z-50 glass-card p-4 rounded-full shadow-2xl"
        aria-label="Toggle EcoBot"
        style={{ boxShadow: '0 0 30px rgba(0,255,153,0.25)' }}
      >
        <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.18 }}>
          <span className="text-neon-green text-xl">🌱</span>
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-24 right-6 z-40 w-[420px] h-[580px] glass-card rounded-2xl border border-neon-green/30 shadow-2xl overflow-hidden flex flex-col" style={{ backdropFilter: 'blur(18px)', boxShadow: '0 0 50px rgba(0,255,153,0.06)' }}>
            {/* Header */}
            <div className="p-4 border-b border-neon-green/12 flex items-center gap-3">
              <div className="w-10 h-10 bg-neon-green/10 rounded-full flex items-center justify-center">🌱</div>
              <div>
                <div className="text-neon-green font-bold">EcoBot</div>
                <div className="text-xs text-gray-400">Real-time environmental assistant</div>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <button title="Voice input" onClick={toggleVoice} className={`px-2 py-1 text-xs rounded ${voiceActive ? 'bg-neon-green/80 text-black' : 'bg-black/20 text-gray-200'}`}>{voiceActive ? 'Listening...' : '🎙️'}</button>
                <button title="Clear chat" onClick={() => { if (confirm('Clear chat history?')) { setMessages([]); localStorage.removeItem(STORAGE_KEY) } }} className="px-2 py-1 text-xs rounded bg-black/20">Clear</button>
              </div>
            </div>

            {/* Quick actions + upload */}
            <div className="p-3 border-b border-neon-green/8 flex flex-col gap-2">
              <div className="flex gap-2">
                <button onClick={() => quickAsk('What is AQI in RT Nagar today?')} className="px-3 py-1 rounded-md bg-black/20 text-xs">AQI in RT Nagar</button>
                <button onClick={() => quickAsk('How to improve NDVI on my land?')} className="px-3 py-1 rounded-md bg-black/20 text-xs">Improve NDVI</button>
                <button onClick={() => quickAsk('Simulate solar panels effect on property value')} className="px-3 py-1 rounded-md bg-black/20 text-xs">Simulate upgrade</button>
              </div>

              <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} role="button" tabIndex={0} onKeyDown={() => fileInputRef.current?.click()} className={`mt-2 p-2 rounded-lg text-sm border-2 ${dragActive ? 'border-neon-green/60' : 'border-neon-green/12'} bg-black/20 flex items-center justify-between`} style={{ cursor: 'pointer' }}>
                <div>
                  <strong className="text-xs">Upload geotagged photo</strong>
                  <div className="text-[11px] text-gray-400">Drag & drop or click to pick — I will extract GPS and fetch live data.</div>
                </div>
                <div>
                  <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1 rounded-md bg-neon-green text-black text-xs">Upload</button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-xs text-gray-400">No messages yet — try uploading a geotagged image or ask a question.</div>
              )}

              {messages.map(m => (
                <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`} aria-live="polite">
                  <div className={`${m.sender === 'user' ? 'bg-neon-green text-black' : 'glass-card border border-neon-green/12 text-gray-300'} p-3 rounded-2xl max-w-[82%] relative`}>
                    <div className="whitespace-pre-wrap text-sm">{m.text}</div>

                    {/* payload card */}
                    {m.payload && (
                      <div className="mt-3 p-2 rounded-md bg-black/20 border border-neon-green/6 text-xs">
                        {m.payload.coordinates && <div>📍 {m.payload.coordinates.lat.toFixed(5)}, {m.payload.coordinates.lon.toFixed(5)}</div>}
                        {m.payload.environment && (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>🌫 AQI: {m.payload.environment.airQuality?.aqi ?? 'N/A'}</div>
                            <div>🌿 NDVI: {m.payload.environment.vegetation?.index ? Number(m.payload.environment.vegetation.index).toFixed(2) : 'N/A'}</div>
                            <div>🌤 Temp: {m.payload.environment.weather?.temperature ?? 'N/A'}°C</div>
                            <div>💧 Humidity: {m.payload.environment.weather?.humidity ?? 'N/A'}%</div>
                          </div>
                        )}
                        {m.payload.value && (
                          <div className="mt-2">💰 Value: {m.payload.value.currentValue ? new Intl.NumberFormat(undefined, { style: 'currency', currency: m.payload.value.currency ?? 'USD' }).format(m.payload.value.currentValue) : 'N/A'}</div>
                        )}
                        {m.payload.fetchedAt && <div className="mt-2 text-[11px] text-gray-400">Fetched at: {new Date(m.payload.fetchedAt).toLocaleString()}</div>}
                        {m.payload.sources && (
                          <div className="mt-2 text-[11px]">
                            Sources:
                            <ul className="list-disc ml-4">
                              {m.payload.sources.map((s, i) => <li key={i}><a className="underline" href={s.link} target="_blank" rel="noreferrer">{s.title ?? s.link}</a></li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <div className="text-[11px] text-gray-400">{formatTime(m.timestamp)}</div>
                      {m.sender === 'ecobot' && (
                        <>
                          <button onClick={() => copyText(m.text)} title="Copy answer" className="text-[11px] text-gray-300 hover:text-white ml-2">Copy</button>
                        </>
                      )}
                      {m.sender === 'user' && (
                        <button onClick={() => retryMessage(m.id)} title="Retry" className="text-[11px] text-gray-300 hover:text-white ml-2">Retry</button>
                      )}
                    </div>
                    {m.error && <div className="text-xs text-red-400 mt-2">Error: {m.error}</div>}
                  </div>
                </div>
              ))}

              <div ref={endRef} />
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-neon-green/12">
              <div className="flex gap-2 items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
                  placeholder="Ask about AQI, temperature, NDVI or paste coords (e.g., 13.0125,77.5938)..."
                  className="flex-1 bg-black/20 border border-neon-green/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none"
                  aria-label="Chat input"
                />
                <button onClick={handleSend} disabled={isTyping || isProcessingFile} className="px-3 py-2 rounded-lg bg-neon-green text-black disabled:opacity-50">Send</button>
              </div>
              <div className="mt-2 text-[11px] text-gray-400 flex items-center gap-3">
                <div>{isTyping ? 'EcoBot is thinking…' : 'Ready'}</div>
                <div className="ml-auto text-[11px]">Tip: Ctrl/Cmd+K to focus</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
